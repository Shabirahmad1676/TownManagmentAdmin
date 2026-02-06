'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function approveRequest(requestId: string) {
    const supabase = await createClient()

    // Call the RPC function wrapper
    const { error } = await supabase.rpc('approve_purchase', { request_id: requestId })

    if (error) {
        console.error('Error approving request:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/requests')
    return { success: true }
}

export async function rejectRequest(requestId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('purchase_requests')
        .update({ status: 'Rejected' })
        .eq('id', requestId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/requests')
    return { success: true }
}
