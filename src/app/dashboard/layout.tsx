'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LogOut, Building2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { getSidebarItemsForRole, UserRole, SidebarItem } from '@/lib/auth-types'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const [role, setRole] = useState<UserRole | null>(null)
    const [loading, setLoading] = useState(true)
    const [filteredItems, setFilteredItems] = useState<SidebarItem[]>([])

    useEffect(() => {
        async function getUserRole() {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) {
                    router.push('/login')
                    return
                }

                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single()

                if (error || !profile) {
                    console.error('Error fetching profile:', error)
                    return
                }

                const userRole = profile.role as UserRole

                if (userRole === 'client') {
                    router.push('/unauthorized')
                    return
                }

                setRole(userRole)
                setFilteredItems(getSidebarItemsForRole(userRole))
            } catch (error) {
                console.error('Error fetching user role:', error)
            } finally {
                setLoading(false)
            }
        }
        getUserRole()
    }, [router, supabase])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="flex h-screen bg-background text-foreground">
            {/* Sidebar */}
            <aside className="w-64 border-r bg-muted/10 hidden md:flex flex-col">
                <div className="p-6 border-b flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                        <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight">Smart Town</h1>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                            {role} Portal
                        </p>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {filteredItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t bg-muted/5">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-md w-full transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </button>
                    <div className="mt-4 px-3 flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs text-muted-foreground">System Online</span>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-background">
                {/* Mobile Header */}
                <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-6 justify-between md:hidden sticky top-0 z-50">
                    <span className="font-bold flex items-center gap-2">
                        <div className="h-6 w-6 rounded bg-primary flex items-center justify-center text-primary-foreground">
                            <Building2 className="h-4 w-4" />
                        </div>
                        Smart Town
                    </span>
                </header>
                <div className="p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
