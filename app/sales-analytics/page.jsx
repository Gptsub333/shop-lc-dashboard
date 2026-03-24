"use client"

import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import ProtectedRoute from "@/components/ProtectedRoute"
import { TrendingUp } from "lucide-react"

function SalesAnalyticsContent() {
    return (
        <div className="flex h-screen bg-background">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header title="Sales Analytics" subtitle="Sales performance insights and metrics" />
                <main className="flex-1 overflow-y-auto flex items-center justify-center p-8">
                    <div className="text-center max-w-md">
                        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                            <TrendingUp className="w-12 h-12 text-primary" />
                        </div>
                        <h1 className="text-3xl font-bold text-foreground mb-3">Coming Soon</h1>
                        <p className="text-muted-foreground text-base mb-6">
                            Sales Analytics is under development. Powerful sales insights and conversion tracking will be available here soon.
                        </p>
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                            <div className="bg-primary h-2 rounded-full w-1/3 animate-pulse" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-3">In progress</p>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default function SalesAnalyticsPage() {
    return (
        <ProtectedRoute>
            <SalesAnalyticsContent />
        </ProtectedRoute>
    )
}
