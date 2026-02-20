
import { createClient } from '@/lib/supabase/server'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import UserSearch from './user-search'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'

export default async function UsersPage(props: { searchParams?: Promise<{ query?: string }> }) {
    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';
    const supabase = await createClient()

    let userQuery = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

    if (query) {
        // Simple OR search for Name or CNIC
        userQuery = userQuery.or(`name.ilike.%${query}%,cnic.ilike.%${query}%`)
    }

    const { data: users, error } = await userQuery

    if (error) {
        return <div className="p-4 text-red-500">Error loading users: {error.message}</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                <UserSearch />
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>CNIC</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No users found matching &quot;{query}&quot;
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users?.map((user: any) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell>{user.cnic || '-'}</TableCell>
                                        <TableCell>
                                            <Badge variant={user.role === 'superadmin' ? 'default' : 'secondary'}>
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/dashboard/users/${user.id}`}>
                                                <Button variant="ghost" size="sm">
                                                    <Eye className="w-4 h-4 mr-2" /> View
                                                </Button>
                                            </Link>
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
