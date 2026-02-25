'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPlot(formData: FormData) {
    const supabase = await createClient()

    const plotNumber = formData.get('plotNumber') as string
    const townName = formData.get('townName') as string
    const sizeMarla = formData.get('sizeMarla') as string
    const totalPrice = formData.get('totalPrice') as string

    if (!plotNumber || !totalPrice || !sizeMarla) {
        return { error: 'Missing required fields' }
    }

    const { error } = await supabase.from('plots').insert({
        plot_number: plotNumber,
        town_name: townName,
        size_marla: parseInt(sizeMarla),
        total_price: parseFloat(totalPrice),
        status: 'Available'
    })

    if (error) {
        console.error('Error creating plot:', error)
        return { error: 'Failed to create plot' }
    }

    revalidatePath('/dashboard/plots')
    redirect('/dashboard/plots')
}

export async function sellPlot(formData: FormData) {
    const supabase = await createClient()

    const plotId = formData.get('plotId') as string
    const cnic = formData.get('cnic') as string
    const templateId = formData.get('templateId') as string

    if (!plotId || !cnic || !templateId) {
        return { error: 'Missing required fields' }
    }

    // 1. Find Client
    const { data: client, error: clientError } = await supabase
        .from('profiles')
        .select('id')
        .eq('cnic', cnic)
        .single()

    if (clientError || !client) {
        return { error: 'Client not found with this CNIC' }
    }

    // 2. Get Plot & Template Details
    const { data: plot } = await supabase.from('plots').select('total_price').eq('id', plotId).single()
    if (!plot) return { error: 'Invalid plot' }

    let downPayment = 0
    let monthlyAmount = 0
    let totalMonths = 0

    if (templateId === 'custom') {
        downPayment = parseFloat(formData.get('customDownPayment') as string)
        monthlyAmount = parseFloat(formData.get('customMonthly') as string)
        totalMonths = parseInt(formData.get('customMonths') as string)

        if (isNaN(downPayment) || isNaN(monthlyAmount) || isNaN(totalMonths)) {
            return { error: 'Invalid custom plan details' }
        }
    } else {
        const { data: template } = await supabase.from('installment_templates').select('*').eq('id', templateId).single()
        if (!template) return { error: 'Invalid plan' }

        const totalPrice = Number(plot.total_price)
        downPayment = (totalPrice * Number(template.down_payment_percentage)) / 100
        const remainingAmount = totalPrice - downPayment
        totalMonths = template.total_months
        monthlyAmount = remainingAmount / totalMonths
    }

    // 4. Generate Ledger Entries
    const installments = []
    const now = new Date()

    // Down Payment
    installments.push({
        plot_id: plotId,
        client_id: client.id,
        due_date: now.toISOString(), // Due immediately
        amount: downPayment,
        status: 'Pending',
        type: 'Down Payment'
    })

    // Monthly Installments
    for (let i = 1; i <= totalMonths; i++) {
        const dueDate = new Date(now)
        dueDate.setMonth(now.getMonth() + i)
        installments.push({
            plot_id: plotId,
            client_id: client.id,
            due_date: dueDate.toISOString(),
            amount: monthlyAmount,
            status: 'Pending',
            type: 'Monthly Installment'
        })
    }

    // 5. Transaction: Create Installments & Update Plot
    const { error: installError } = await supabase.from('plot_installments').insert(installments)
    if (installError) {
        console.error('Installment error:', installError)
        return { error: 'Failed to generate installments' }
    }

    const { error: plotError } = await supabase
        .from('plots')
        .update({ status: 'Sold', owner_id: client.id })
        .eq('id', plotId)

    if (plotError) return { error: 'Failed to update plot status' }

    revalidatePath('/dashboard/plots')
    redirect('/dashboard/plots')
}

export async function transferPlot(formData: FormData) {
    const supabase = await createClient()

    const plotId = formData.get('plotId') as string
    const toCnic = formData.get('toCnic') as string
    const transferFee = formData.get('transferFee') as string

    if (!plotId || !toCnic) {
        return { error: 'Missing required fields' }
    }

    // 1. Find New Owner
    const { data: newOwner, error: newOwnerError } = await supabase
        .from('profiles')
        .select('id')
        .eq('cnic', toCnic)
        .single()

    if (newOwnerError || !newOwner) {
        return { error: 'Target client not found with this CNIC' }
    }

    // 2. Get Plot & Current Owner
    const { data: plot } = await supabase.from('plots').select('owner_id').eq('id', plotId).single()
    if (!plot) return { error: 'Plot not found' }

    // 3. Create Transfer Record (Performa History)
    // Generate a simple performa number:  TRF-[PLOTID_SUB]-[DATE]
    const performaNumber = `TRF-${plotId.substring(0, 4).toUpperCase()}-${Date.now()}`

    const { error: transferError } = await supabase.from('plot_transfers').insert({
        plot_id: plotId,
        from_client_id: plot.owner_id,
        to_client_id: newOwner.id,
        transfer_fee: parseFloat(transferFee || '0'),
        performa_number: performaNumber,
    })

    if (transferError) {
        console.error('Transfer error:', transferError)
        return { error: 'Failed to log transfer history' }
    }

    // 4. Update the Plot Owner
    // NOTE: This does NOT automatically move the installments. 
    // Usually, in real estate, the new owner takes over. 
    // A more complex system would cancel old installments and create new ones.
    // For this MVP, we will just update the Owner ID on the plot.
    // The previous installment history remains with the plot but attached to the old owner? 
    // Actually, `plot_installments` has `client_id`. So future installments need to be updated? 
    // Or do we keep them as is? 
    // Ideally, we should update Pending installments to the new owner.

    // Let's update pending installments to the new owner
    await supabase
        .from('plot_installments')
        .update({ client_id: newOwner.id })
        .eq('plot_id', plotId)
        .eq('status', 'Pending')

    const { error: plotError } = await supabase
        .from('plots')
        .update({ owner_id: newOwner.id })
        .eq('id', plotId)

    if (plotError) return { error: 'Failed to update plot ownership' }

    revalidatePath('/dashboard/plots')
    redirect('/dashboard/plots')
}
