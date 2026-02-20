'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function markInstallmentPaid(installmentId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('plot_installments')
        .update({ status: 'Paid', paid_date: new Date().toISOString() })
        .eq('id', installmentId)

    if (error) {
        console.error('Error paying installment:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/installments')
    return { success: true }
}

export async function updateInstallment(id: string, amount: number, dueDate: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('plot_installments')
        .update({
            amount: amount,
            due_date: dueDate
        })
        .eq('id', id)

    if (error) {
        console.error('Error updating installment:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/installments')
    revalidatePath('/dashboard/users/[id]') // Revalidate user dashboard too if possible, though strict path might fail matching. 
    // Ideally we revalidate the specific user path if we knew the ID, but global revalidation or client router.refresh() handles most.
    return { success: true }
}
