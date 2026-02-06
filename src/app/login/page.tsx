'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { AlertCircle } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'


export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                setError(error.message)
                return
            }

            // Check role
            // Check role
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                console.log("User found:", user.email)
                const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', user.id).single()

                if (profileError) {
                    console.error("Profile fetch error:", profileError)
                    setError("Error fetching user profile: " + profileError.message + " (Check RLS Policies)")
                    return
                }

                if (!profile) {
                    console.error("No profile found for user")
                    setError("User exists but has no Profile row. (Trigger failed?)")
                    return
                }

                console.log("Role found:", profile.role)
                if (profile.role === 'client') {
                    await supabase.auth.signOut()
                    setError("Access Denied: Your role is 'client'. Please use the mobile app.")
                    return
                }
            }

            router.push('/dashboard')
            router.refresh()
        } catch (err) {
            setError('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Admin Login</CardTitle>
                    <CardDescription className="text-center">
                        Enter your credentials to access the dashboard
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Login As (Verifying...)</Label>
                            <Select defaultValue="auto">
                                <SelectTrigger disabled>
                                    <SelectValue placeholder="Detecting Role..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="auto">Auto-Detect Role</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-[10px] text-muted-foreground">System automatically detects your role based on email.</p>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-md">
                                <AlertCircle className="h-4 w-4" />
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>

                        <div className="text-center text-sm">
                            Don't have an account? <a href="/signup" className="text-primary hover:underline">Sign Up</a>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
