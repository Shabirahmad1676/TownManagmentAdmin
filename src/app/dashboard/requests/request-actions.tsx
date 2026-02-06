'use client'

import { useState } from 'react'
import { approveRequest, rejectRequest } from './actions'
import { Button } from '@/components/ui/button'
import { Check, X, Loader2 } from 'lucide-react'

export default function RequestActions({ id, status }: { id: string, status: string }) {
    const [loading, setLoading] = useState(false)

    if (status !== 'Pending') return null

    const handleApprove = async () => {
        if (!confirm('Are you sure you want to approve this request? This will mark the plot as Sold.')) return
        setLoading(true)
        await approveRequest(id)
        setLoading(false)
    }

    const handleReject = async () => {
        if (!confirm('Reject this request?')) return
        setLoading(true)
        await rejectRequest(id)
        setLoading(false)
    }

    return (
        <div className="flex gap-2">
            <Button size="sm" variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100" onClick={handleApprove} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            </Button>
            <Button size="sm" variant="outline" className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100" onClick={handleReject} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
            </Button>
        </div>
    )
}
