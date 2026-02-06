'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function markInstallmentPaid(installmentId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('installments')
        .update({ status: 'Paid' })
        .eq('id', installmentId)

    if (error) {
        console.error('Error paying installment:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/installments')
    return { success: true }
}
