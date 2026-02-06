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
