import { LayoutDashboard, Users, FileText, CreditCard, Settings, LucideIcon } from 'lucide-react'

export type UserRole = 'superadmin' | 'manager' | 'accountant' | 'client'

export interface SidebarItem {
    icon: LucideIcon
    label: string
    href: string
    roles: UserRole[] // Roles that can see this item
}

export const SIDEBAR_ITEMS: SidebarItem[] = [
    {
        icon: LayoutDashboard,
        label: 'Overview',
        href: '/dashboard',
        roles: ['superadmin', 'manager', 'accountant']
    },
    {
        icon: FileText,
        label: 'Properties / Plots',
        href: '/dashboard/plots',
        roles: ['superadmin', 'manager']
    },
    {
        icon: Users,
        label: 'Users',
        href: '/dashboard/users',
        roles: ['superadmin']
    },
    {
        icon: FileText,
        label: 'Plot Requests',
        href: '/dashboard/requests',
        roles: ['superadmin']
    },
    {
        icon: CreditCard,
        label: 'Installments',
        href: '/dashboard/installments',
        roles: ['superadmin', 'accountant']
    },
    {
        icon: Settings,
        label: 'Settings',
        href: '/dashboard/settings',
        roles: ['superadmin']
    },
    {
        icon: Users,
        label: 'Transfer Ownership',
        href: '/dashboard/transfer',
        roles: ['superadmin']
    },
]

export function getSidebarItemsForRole(role: UserRole): SidebarItem[] {
    return SIDEBAR_ITEMS.filter(item => item.roles.includes(role))
}
