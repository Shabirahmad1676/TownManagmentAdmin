'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { sellPlot } from './actions'
import { DollarSign, Loader2 } from 'lucide-react'

interface SellPlotDialogProps {
    plot: {
        id: string
        plot_number: string
        total_price: number
    }
    templates: any[]
}

export default function SellPlotDialog({ plot, templates }: SellPlotDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (formData: FormData) => {
        setLoading(true)
        setError('')

        const result = await sellPlot(formData)

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        } else {
            setOpen(false)
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                    <DollarSign className="w-4 h-4" /> Sell
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Sell Plot {plot.plot_number}</DialogTitle>
                    <DialogDescription>
                        Assign this plot to a client and generate an installment schedule.
                    </DialogDescription>
                </DialogHeader>

                <form action={handleSubmit} className="space-y-4 py-4">
                    <input type="hidden" name="plotId" value={plot.id} />

                    <div className="space-y-2">
                        <Label htmlFor="cnic">Client CNIC</Label>
                        <Input id="cnic" name="cnic" placeholder="xxxxx-xxxxxxx-x" required />
                        {/* In a real app, I'd fetch the name here to confirm opacity-50 */}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="plan">Installment Plan</Label>
                        <Select name="templateId" required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a plan" />
                            </SelectTrigger>
                            <SelectContent>
                                {templates.map((t) => (
                                    <SelectItem key={t.id} value={t.id}>
                                        {t.name} ({t.total_months} Months)
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-md text-sm space-y-1">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Plot Price:</span>
                            <span className="font-medium">PKR {Number(plot.total_price).toLocaleString()}</span>
                        </div>
                    </div>

                    {error && (
                        <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
                            {error}
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Confirm Sale
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
