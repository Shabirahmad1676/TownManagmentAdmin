
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Users, FileCheck, DollarSign } from 'lucide-react'

export default async function DashboardPage() {
    const supabase = await createClient()

    // Parallel data fetching for stats
    const [
        { count: plotCount },
        { count: soldCount },
        { count: userCount },
        { count: requestCount }
    ] = await Promise.all([
        supabase.from('plots').select('*', { count: 'exact', head: true }),
        supabase.from('plots').select('*', { count: 'exact', head: true }).eq('status', 'Sold'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('purchase_requests').select('*', { count: 'exact', head: true }).eq('status', 'Pending')
    ])

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Plots</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{plotCount || 0}</div>
                        <p className="text-xs text-muted-foreground">Inventory limit</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Plots Sold</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{soldCount || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            {plotCount ? Math.round(((soldCount || 0) / plotCount) * 100) : 0}% of inventory
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                        <FileCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{requestCount || 0}</div>
                        <p className="text-xs text-muted-foreground">Requires approval</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{userCount || 0}</div>
                        <p className="text-xs text-muted-foreground">Active profiles</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
