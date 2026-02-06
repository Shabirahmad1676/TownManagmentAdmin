'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function UnauthorizedPage() {
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <Card className="max-w-md text-center">
                <CardHeader>
                    <CardTitle className="text-red-600">Access Denied</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p>
                        Your account does not have permission to access the Admin Dashboard.
                        If you are a client, please use the mobile application.
                    </p>
                    <Button onClick={handleLogout} variant="outline">
                        Sign Out
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
