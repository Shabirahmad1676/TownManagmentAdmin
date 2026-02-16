import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Users, FileCheck, DollarSign, Activity } from 'lucide-react'

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
        <div className="space-y-8">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                    <p className="text-muted-foreground">
                        Welcome back! Here&apos;s an overview of your real estate portfolio.
                    </p>
                </div>
                <div className="flex items-center space-x-2 bg-muted/50 p-2 rounded-lg">
                    <Activity className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">System Role: Administrator</span>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-primary/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Plots</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{plotCount || 0}</div>
                        <p className="text-xs text-muted-foreground">+0 from last month</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-emerald-500/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Plots Sold</CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{soldCount || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            {plotCount ? Math.round(((soldCount || 0) / plotCount) * 100) : 0}% of inventory
                        </p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-orange-500/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                        <FileCheck className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{requestCount || 0}</div>
                        <p className="text-xs text-muted-foreground">Requires attention</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-blue-500/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{userCount || 0}</div>
                        <p className="text-xs text-muted-foreground">Active profiles</p>
                    </CardContent>
                </Card>
            </div>

            {/* Placeholder for recent activity or chart */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 hover:shadow-md transition-all">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="flex h-[200px] items-center justify-center text-muted-foreground text-sm">
                            [Activity Chart Placeholder]
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3 hover:shadow-md transition-all">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-2">
                            <div className="p-3 bg-muted/30 rounded-md text-sm cursor-pointer hover:bg-muted/50 transition-colors">
                                + Add New Plot
                            </div>
                            <div className="p-3 bg-muted/30 rounded-md text-sm cursor-pointer hover:bg-muted/50 transition-colors">
                                Review Requests
                            </div>
                            <div className="p-3 bg-muted/30 rounded-md text-sm cursor-pointer hover:bg-muted/50 transition-colors">
                                Manage Users
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
