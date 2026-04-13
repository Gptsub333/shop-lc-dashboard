"use client"

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { RefreshCw } from 'lucide-react'

export default function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        if (!loading && !isAuthenticated()) {
            // Preserve the current path so login can return the user here
            router.push(`/login?returnTo=${encodeURIComponent(pathname)}`)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading])   // intentionally exclude isAuthenticated — it's a new ref every render

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        )
    }

    if (!isAuthenticated()) {
        return null
    }

    return <>{children}</>
}