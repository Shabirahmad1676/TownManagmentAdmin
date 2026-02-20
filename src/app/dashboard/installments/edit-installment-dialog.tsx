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
import { updateInstallment } from './actions'
import { Pencil, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface EditInstallmentDialogProps {
    id: string
    currentAmount: number
    currentDueDate: string
}

export default function EditInstallmentDialog({ id, currentAmount, currentDueDate }: EditInstallmentDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [amount, setAmount] = useState(currentAmount)
    const [date, setDate] = useState(currentDueDate ? new Date(currentDueDate).toISOString().split('T')[0] : '')
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const result = await updateInstallment(id, Number(amount), date)

        if (result?.error) {
            alert(result.error)
            setLoading(false)
        } else {
            setOpen(false)
            setLoading(false)
            router.refresh()
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="icon" variant="ghost" className="h-7 w-7">
                    <Pencil className="h-3 w-3" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Installment</DialogTitle>
                    <DialogDescription>
                        Customize the amount or due date for this installment.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount (PKR)</Label>
                        <Input
                            id="amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="date">Due Date</Label>
                        <Input
                            id="date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
