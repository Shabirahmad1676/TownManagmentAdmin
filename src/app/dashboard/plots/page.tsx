
import { createClient } from '@/lib/supabase/server'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default async function PlotsPage() {
    const supabase = await createClient()

    const { data: plots, error } = await supabase
        .from('plots')
        .select(`
            id,
            plot_number,
            size_marla,
            town_name,
            total_price,
            status,
            owner_id,
            profiles (name)
        `)
        .order('plot_number', { ascending: true })

    if (error) {
        return <div className="p-4 text-red-500">Error loading plots: {error.message}</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Properties / Plots</h1>
                    <p className="text-muted-foreground">Manage inventory and ownership.</p>
                </div>
                <Link href="/dashboard/plots/new">
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" /> Add Plot
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Plots</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Plot #</TableHead>
                                <TableHead>Town</TableHead>
                                <TableHead>Size (Marla)</TableHead>
                                <TableHead>Price (PKR)</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Owner</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {plots?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">No plots found.</TableCell>
                                </TableRow>
                            ) : (
                                plots?.map((plot: any) => (
                                    <TableRow key={plot.id}>
                                        <TableCell className="font-medium bg-slate-50">{plot.plot_number}</TableCell>
                                        <TableCell>{plot.town_name || '-'}</TableCell>
                                        <TableCell>{plot.size_marla}</TableCell>
                                        <TableCell>{Number(plot.total_price).toLocaleString()}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${plot.status === 'Sold' ? 'bg-red-100 text-red-700' :
                                                plot.status === 'Reserved' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-green-100 text-green-700'
                                                }`}>
                                                {plot.status}
                                            </span>
                                        </TableCell>
                                        <TableCell>{plot.profiles?.name || '-'}</TableCell>
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
