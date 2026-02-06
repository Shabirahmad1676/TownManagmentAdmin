'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

export default function OwnershipTransferPage() {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [soldPlots, setSoldPlots] = useState<any[]>([])
    const supabase = createClient()

    useEffect(() => {
        const fetchSoldPlots = async () => {
            const { data } = await supabase
                .from('plots')
                .select('id, plot_number, town_name, owner_id, profiles(name, cnic)')
                .eq('status', 'Sold')
            if (data) setSoldPlots(data)
        }
        fetchSoldPlots()
    }, [])

    const handleTransfer = async (formData: FormData) => {
        setLoading(true)
        setMessage(null)

        const plotId = formData.get('plotId') as string
        const newOwnerCnic = formData.get('newOwnerCnic') as string

        try {
            // 1. Find the new owner by CNIC
            const { data: newOwner, error: ownerError } = await supabase
                .from('profiles')
                .select('id, name')
                .eq('cnic', newOwnerCnic)
                .single()

            if (ownerError || !newOwner) {
                throw new Error("New owner not found. Please ensure they have signed up with this CNIC.")
            }

            // 2. Update the plot owner
            const { error: updateError } = await supabase
                .from('plots')
                .update({ owner_id: newOwner.id })
                .eq('id', plotId)

            if (updateError) throw updateError

            setMessage({ type: 'success', text: `Successfully transferred ownership to ${newOwner.name}` })

            // Refresh list
            const { data } = await supabase
                .from('plots')
                .select('id, plot_number, town_name, owner_id, profiles(name, cnic)')
                .eq('status', 'Sold')
            if (data) setSoldPlots(data)

        } catch (error: any) {
            setMessage({ type: 'error', text: error.message })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Transfer Ownership</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Transfer Plot Property</CardTitle>
                    <CardDescription>Select a sold plot and enter the CNIC of the new owner.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={handleTransfer} className="space-y-6">
                        <div className="space-y-2">
                            <Label>Select Plot</Label>
                            <Select name="plotId" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a sold plot..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {soldPlots.map(plot => (
                                        <SelectItem key={plot.id} value={plot.id}>
                                            {plot.plot_number} - {plot.profiles?.name} ({plot.profiles?.cnic})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>New Owner CNIC</Label>
                            <Input name="newOwnerCnic" placeholder="e.g. 12345-1234567-1" required />
                            <p className="text-xs text-muted-foreground">The new owner must already have an account.</p>
                        </div>

                        {message && (
                            <div className={`p-3 rounded-md flex items-center gap-2 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                }`}>
                                {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                {message.text}
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Processing Transfer...' : 'Confirm Transfer'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
