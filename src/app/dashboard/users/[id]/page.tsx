
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Fingerprint, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import BiometricTab from './biometric-tab'

export default async function ClientDashboard({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id } = await params

    // 1. Fetch Client Profile
    const { data: client, error: clientError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()

    if (clientError || !client) {
        return <div className="p-8 text-red-500">Client not found</div>
    }

    // 2. Fetch Plots Owned by Client
    const { data: plots } = await supabase
        .from('plots')
        .select(`
            *,
            plot_installments (
                amount,
                status,
                due_date
            )
        `)
        .eq('owner_id', id)

    // Calculate Totals
    const totalPlots = plots?.length || 0
    let totalOutstanding = 0
    let nextDueDate: Date | null = null

    plots?.forEach(plot => {
        const pending = plot.plot_installments?.filter((i: any) => i.status === 'Pending' || i.status === 'Overdue') || []
        pending.forEach((p: any) => {
            totalOutstanding += Number(p.amount)
            const date = new Date(p.due_date)
            if (!nextDueDate || date < nextDueDate) {
                nextDueDate = date
            }
        })
    })

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
                    <div className="flex items-center gap-2 text-muted-foreground mt-1">
                        <span>CNIC: {client.cnic || 'N/A'}</span>
                        <span>•</span>
                        <span>Customer Since {new Date(client.created_at).getFullYear()}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {client.is_biometric_verified ? (
                        <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700 py-1.5 px-3 gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Biometric Verified
                        </Badge>
                    ) : (
                        <Badge variant="destructive" className="py-1.5 px-3 gap-1">
                            <XCircle className="w-4 h-4" /> Biometric Pending
                        </Badge>
                    )}
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Plots</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalPlots}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Outstanding Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            PKR {totalOutstanding.toLocaleString()}
                        </div>
                        {nextDueDate && (
                            <p className="text-xs text-muted-foreground mt-1">
                                Next Due: {(nextDueDate as Date).toLocaleDateString()}
                            </p>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Verification Status</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-2">
                        <Fingerprint className={`w-8 h-8 ${client.biometric_record ? 'text-emerald-500' : 'text-gray-300'}`} />
                        <div className="text-sm">
                            {client.biometric_record ? 'Fingerprint Recorded' : 'No Record Found'}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Tabs */}
            <Tabs defaultValue="plots" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="plots">Plots & Installments</TabsTrigger>
                    <TabsTrigger value="biometric">Biometric Data</TabsTrigger>
                </TabsList>

                <TabsContent value="plots" className="space-y-4 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Owned Properties</CardTitle>
                            <CardDescription>List of plots owned and their payment status.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Plot #</TableHead>
                                        <TableHead>Town</TableHead>
                                        <TableHead>Size</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Pending Amount</TableHead>
                                        <TableHead>Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {plots?.map((plot: any) => {
                                        const plotPending = plot.plot_installments
                                            ?.filter((i: any) => i.status !== 'Paid')
                                            .reduce((sum: number, i: any) => sum + Number(i.amount), 0) || 0

                                        return (
                                            <TableRow key={plot.id}>
                                                <TableCell className="font-medium">{plot.plot_number}</TableCell>
                                                <TableCell>{plot.town_name}</TableCell>
                                                <TableCell>{plot.size_marla} Marla</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{plot.status}</Badge>
                                                </TableCell>
                                                <TableCell className={plotPending > 0 ? "text-red-600 font-medium" : "text-emerald-600"}>
                                                    PKR {plotPending.toLocaleString()}
                                                </TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="sm">View Ledger</Button>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                    {(!plots || plots.length === 0) && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                No plots owned by this client.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="biometric" className="space-y-4 mt-6">
                    <BiometricTab
                        userId={client.id}
                        biometricRecord={client.biometric_record}
                        isVerified={client.is_biometric_verified}
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}
