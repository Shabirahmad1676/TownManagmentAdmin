'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LogOut } from 'lucide-react'
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
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="flex h-screen bg-slate-50">
            <aside className="w-64 bg-white border-r hidden md:flex flex-col">
                <div className="p-6 border-b">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Smart Town
                    </h1>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                        {role} Portal
                    </p>
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
                                    "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                    isActive
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-slate-100 hover:text-foreground"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 w-full transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto">
                <header className="h-16 border-b bg-white flex items-center px-8 justify-between md:hidden">
                    <span className="font-bold">Smart Town</span>
                </header>
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
