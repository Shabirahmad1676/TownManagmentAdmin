'use client'

import { createPlot } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function NewPlotPage() {
    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Add New Plot</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={createPlot} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="townName">Town / Sector Name</Label>
                            <Input id="townName" name="townName" placeholder="e.g. Sector A" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="plotNumber">Plot Number</Label>
                            <Input id="plotNumber" name="plotNumber" placeholder="e.g. A-101" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="size">Size (Marla)</Label>
                            <Select name="sizeMarla" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select size" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5 Marla</SelectItem>
                                    <SelectItem value="10">10 Marla</SelectItem>
                                    <SelectItem value="20">1 Kanal (20 Marla)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="totalPrice">Total Price (PKR)</Label>
                            <Input
                                id="totalPrice"
                                name="totalPrice"
                                type="number"
                                placeholder="5000000"
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-4">
                            <Button type="button" variant="outline" onClick={() => window.history.back()}>
                                Cancel
                            </Button>
                            <Button type="submit">Create Plot</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
