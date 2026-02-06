'use client'

import { useState } from 'react'
import { markInstallmentPaid } from './actions'
import { Button } from '@/components/ui/button'
import { Check, Loader2 } from 'lucide-react'

export default function InstallmentActions({ id, status }: { id: string, status: string }) {
    const [loading, setLoading] = useState(false)

    if (status === 'Paid') return <span className="text-green-600 flex items-center gap-1"><Check className="w-3 h-3" /> Paid</span>

    const handlePay = async () => {
        if (!confirm('Mark this installment as PAID?')) return
        setLoading(true)
        await markInstallmentPaid(id)
        setLoading(false)
    }

    return (
        <Button
            size="sm"
            variant="outline"
            className="h-7 px-2 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
            onClick={handlePay}
            disabled={loading}
        >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Mark Paid"}
        </Button>
    )
}
