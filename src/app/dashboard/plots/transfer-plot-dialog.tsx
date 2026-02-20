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
import { transferPlot } from './actions'
import { ArrowLeftRight, Loader2 } from 'lucide-react'

interface TransferPlotDialogProps {
    plot: {
        id: string
        plot_number: string
        profiles: { name: string }
    }
}

export default function TransferPlotDialog({ plot }: TransferPlotDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (formData: FormData) => {
        setLoading(true)
        setError('')

        const result = await transferPlot(formData)

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
                <Button size="sm" variant="outline" className="gap-2">
                    <ArrowLeftRight className="w-4 h-4" /> Transfer
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Transfer Ownership</DialogTitle>
                    <DialogDescription>
                        Transfer Plot {plot.plot_number} from <b>{plot.profiles?.name}</b> to a new owner.
                    </DialogDescription>
                </DialogHeader>

                <form action={handleSubmit} className="space-y-4 py-4">
                    <input type="hidden" name="plotId" value={plot.id} />

                    <div className="space-y-2">
                        <Label htmlFor="toCnic">New Owner CNIC</Label>
                        <Input id="toCnic" name="toCnic" placeholder="xxxxx-xxxxxxx-x" required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="transferFee">Transfer Fee (PKR)</Label>
                        <Input id="transferFee" name="transferFee" type="number" placeholder="5000" />
                    </div>

                    <div className="p-3 bg-yellow-50 text-yellow-800 rounded-md text-xs">
                        Warning: This will transfer all <b>Pending</b> installments to the new owner. Past payments will remain in history.
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
                            Process Transfer
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
