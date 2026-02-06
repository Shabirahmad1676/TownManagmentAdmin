import { createClient } from '@/lib/supabase/server'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import RequestActions from './request-actions'

export default async function RequestsPage() {
    const supabase = await createClient()

    const { data: requests, error } = await supabase
        .from('purchase_requests')
        .select(`
            id,
            payment_plan,
            status,
            created_at,
            client:profiles (name, cnic),
            plot:plots (plot_number, size_marla)
        `)
        .order('created_at', { ascending: false })

    if (error) {
        return <div className="p-4 text-red-500">Error loading requests: {error.message}</div>
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Plot Requests</h1>

            <Card>
                <CardHeader>
                    <CardTitle>All Requests</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Plot #</TableHead>
                                <TableHead>Plan</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {requests?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">No requests found.</TableCell>
                                </TableRow>
                            ) : (
                                requests?.map((req: any) => (
                                    <TableRow key={req.id}>
                                        <TableCell>{new Date(req.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <div className="font-medium">{req.client?.name || 'Unknown'}</div>
                                            <div className="text-xs text-muted-foreground">{req.client?.cnic}</div>
                                        </TableCell>
                                        <TableCell>{req.plot?.plot_number || 'N/A'} ({req.plot?.size_marla} Marla)</TableCell>
                                        <TableCell>{req.payment_plan}</TableCell>
                                        <TableCell>
                                            <Badge variant={req.status === 'Approved' ? 'default' : req.status === 'Rejected' ? 'destructive' : 'secondary'}>
                                                {req.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <RequestActions id={req.id} status={req.status} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
