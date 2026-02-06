'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'


type PurchaseRequest = {
    id: string
    plot: {
        plot_number: string
        total_price: number
    }
    client: {
        name: string
        cnic: string
    }
    payment_plan: string
    status: string
    created_at: string
}

export function ApprovalsWidget() {
    const [requests, setRequests] = useState<PurchaseRequest[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    const fetchRequests = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('purchase_requests')
            .select(`
                id,
                payment_plan,
                status,
                created_at,
                plot:plots(plot_number, total_price),
                client:profiles(name, cnic)
            `)
            .eq('status', 'Pending')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching requests:', error)
        } else {
            // @ts-ignore
            setRequests(data as any)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchRequests()
    }, [])

    const handleApprove = async (requestId: string) => {
        try {
            const { error } = await supabase.rpc('approve_purchase', { request_id: requestId })
            if (error) throw error

            alert("Request Approved\nThe purchase has been approved and installments generated.")
            fetchRequests() // Refresh list
        } catch (error: any) {
            alert(`Approval Failed: ${error.message}`)
        }
    }

    if (loading) return <div>Loading approvals...</div>
    if (requests.length === 0) return <div className="text-muted-foreground text-sm">No pending approvals.</div>

    return (
        <div className="space-y-4">
            {requests.map((req) => (
                <Card key={req.id}>
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-base">{req.plot.plot_number}</CardTitle>
                                <p className="text-sm text-muted-foreground">{req.client?.name} ({req.client?.cnic})</p>
                            </div>
                            <Badge variant="outline">{req.payment_plan.replace('_', ' ')}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" className="text-red-500 hover:text-red-600">
                                <X className="w-4 h-4 mr-1" /> Reject
                            </Button>
                            <Button size="sm" onClick={() => handleApprove(req.id)}>
                                <Check className="w-4 h-4 mr-1" /> Approve
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
