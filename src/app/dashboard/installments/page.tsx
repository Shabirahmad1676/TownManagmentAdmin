
import { createClient } from '@/lib/supabase/server'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import InstallmentActions from './installment-actions'

export default async function InstallmentsPage() {
    const supabase = await createClient()

    const { data: installments, error } = await supabase
        .from('plot_installments')
        .select(`
            id,
            due_date,
            amount,
            status,
            plot:plots(plot_number),
            client:profiles(name, cnic)
        `)
        .order('due_date', { ascending: true })

    if (error) {
        return <div className="p-4 text-red-500">Error: {error.message}</div>
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Installments</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Plot</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {installments?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                                        No installments found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                installments?.map((inst: any) => {
                                    const isOverdue = inst.status === 'Overdue' || (inst.status === 'Pending' && new Date(inst.due_date) < new Date())

                                    return (
                                        <TableRow key={inst.id} className={isOverdue ? "bg-red-50 hover:bg-red-100/50" : ""}>
                                            <TableCell className={isOverdue ? "text-red-700 font-medium" : ""}>
                                                {new Date(inst.due_date).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>{inst.plot?.plot_number}</TableCell>
                                            <TableCell>
                                                <div className="font-medium">{inst.client?.name}</div>
                                                <div className="text-xs text-muted-foreground">{inst.client?.cnic}</div>
                                            </TableCell>
                                            <TableCell>{Number(inst.amount).toLocaleString()}</TableCell>
                                            <TableCell>
                                                <Badge variant={inst.status === 'Paid' ? 'default' : isOverdue ? 'destructive' : 'secondary'}>
                                                    {inst.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <InstallmentActions
                                                    id={inst.id}
                                                    status={inst.status}
                                                    amount={inst.amount}
                                                    dueDate={inst.due_date}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
