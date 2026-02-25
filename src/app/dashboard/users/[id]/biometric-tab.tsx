'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Fingerprint, AlertCircle, Upload, Check, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface BiometricTabProps {
    userId: string
    biometricRecord: string | null // This will be the image URL or base64
    isVerified: boolean
}

export default function BiometricTab({ userId, biometricRecord, isVerified }: BiometricTabProps) {
    const supabase = createClient()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)

    const toggleVerification = async () => {
        setLoading(true)
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ is_biometric_verified: !isVerified })
                .eq('id', userId)

            if (error) throw error
            router.refresh()
        } catch (error) {
            console.error('Error updating verification:', error)
            alert('Failed to update verification status')
        } finally {
            setLoading(false)
        }
    }

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            const fakeTemplateData = `TEMPLATE_${Date.now()}_${Math.random().toString(36).substring(7)}`

            const { error } = await supabase
                .from('profiles')
                .update({ biometric_record: fakeTemplateData })
                .eq('id', userId)

            if (error) throw error
            router.refresh()
        } catch (error) {
            console.error('Error uploading record:', error)
            alert('Failed to upload biometric record')
        } finally {
            setUploading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Biometric Verification</CardTitle>
                <CardDescription>Manage fingerprint data and verification status.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 bg-slate-50 transition-colors hover:bg-slate-100">
                    {biometricRecord ? (
                        <>
                            <div className="bg-emerald-100 p-4 rounded-full mb-4">
                                <Fingerprint className="w-12 h-12 text-emerald-600" />
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="font-semibold text-lg text-emerald-700">Fingerprint Recorded</h3>
                                <p className="text-sm text-muted-foreground">
                                    Record ID: {biometricRecord}
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <Fingerprint className="w-16 h-16 text-slate-300 mb-4" />
                            <div className="text-center space-y-2">
                                <h3 className="font-semibold text-lg">No Record Found</h3>
                                <p className="text-sm text-muted-foreground max-w-sm">
                                    Upload a fingerprint scan or biometric template file to register this client.
                                </p>
                            </div>
                        </>
                    )}

                    <div className="mt-6 flex flex-wrap gap-4 justify-center">
                        <Button variant="outline" className="relative" disabled={uploading}>
                            {uploading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Upload className="w-4 h-4 mr-2" />
                            )}
                            {biometricRecord ? "Update Record" : "Upload Scan"}
                            <input
                                type="file"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={handleFileUpload}
                                accept="image/*,.bin,.iso" // Accept images or common generic biometric formats
                            />
                        </Button>

                        <Button
                            variant="secondary"
                            className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                            onClick={() => {
                                setUploading(true);
                                setTimeout(async () => {
                                    const fakeTemplateData = `SIMULATED_DATA_${Date.now()}`;
                                    const { error } = await supabase
                                        .from('profiles')
                                        .update({ biometric_record: fakeTemplateData })
                                        .eq('id', userId);
                                    if (error) alert(error.message);
                                    router.refresh();
                                    setUploading(false);
                                }, 1000);
                            }}
                            disabled={uploading}
                        >
                            <Fingerprint className="w-4 h-4 mr-2" />
                            Simulate Device Capture
                        </Button>
                    </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm">
                    <div className="flex items-center gap-4">
                        {isVerified ? (
                            <div className="bg-blue-100 p-2 rounded-full">
                                <Check className="w-5 h-5 text-blue-600" />
                            </div>
                        ) : (
                            <div className="bg-yellow-100 p-2 rounded-full">
                                <AlertCircle className="w-5 h-5 text-yellow-600" />
                            </div>
                        )}
                        <div>
                            <p className="font-medium">Verification Status</p>
                            <p className="text-sm text-muted-foreground">
                                {isVerified
                                    ? "Client identity has been verified."
                                    : "Client has not been verified yet."}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant={isVerified ? "destructive" : "default"}
                        onClick={toggleVerification}
                        disabled={loading}
                    >
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {isVerified ? "Revoke Verification" : "Mark as Verified"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
