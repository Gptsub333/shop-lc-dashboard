"use client"

import { useState, useEffect } from "react"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import ProtectedRoute from "@/components/ProtectedRoute"
import KPISection from "./KPISection"
import DailyTrendSection from "./DailyTrendSection"
import FunnelSection from "./FunnelSection"
import TransferSection from "./TransferSection"
import ErrorSection from "./ErrorSection"

const backend_url = process.env.NEXT_PUBLIC_API_URL1

function getCSTDate(daysOffset = 0) {
    const now = new Date()
    const cst = new Date(now.toLocaleString("en-US", { timeZone: "America/Chicago" }))
    cst.setDate(cst.getDate() + daysOffset)
    return [
        cst.getFullYear(),
        String(cst.getMonth() + 1).padStart(2, "0"),
        String(cst.getDate()).padStart(2, "0"),
    ].join("-")
}

const DEFAULT_START = getCSTDate(0)
const DEFAULT_END   = getCSTDate(0)

function SalesAnalyticsContent() {
    // ── KPI data ──────────────────────────────────────────────────────────────
    const [stats, setStats]               = useState(null)
    const [activeCalls, setActiveCalls]   = useState(null)
    const [kpiSummary, setKpiSummary]     = useState(null)

    // ── Daily trend ───────────────────────────────────────────────────────────
    const [dailyData, setDailyData]       = useState(null)
    const [dailyLoading, setDailyLoading] = useState(false)
    const [dailyStart, setDailyStart]     = useState(DEFAULT_START)
    const [dailyEnd, setDailyEnd]         = useState(DEFAULT_END)

    // ── Funnel ────────────────────────────────────────────────────────────────
    const [funnelData, setFunnelData]       = useState(null)
    const [funnelLoading, setFunnelLoading] = useState(false)
    const [funnelStart, setFunnelStart]     = useState(DEFAULT_START)
    const [funnelEnd, setFunnelEnd]         = useState(DEFAULT_END)

    // ── Transfer ──────────────────────────────────────────────────────────────
    const [transferData, setTransferData]       = useState(null)
    const [transferLoading, setTransferLoading] = useState(false)
    const [transferStart, setTransferStart]     = useState(DEFAULT_START)
    const [transferEnd, setTransferEnd]         = useState(DEFAULT_END)

    // ── Errors ────────────────────────────────────────────────────────────────
    const [errorData, setErrorData]       = useState(null)
    const [errorLoading, setErrorLoading] = useState(false)
    const [errorStart, setErrorStart]     = useState(DEFAULT_START)
    const [errorEnd, setErrorEnd]         = useState(DEFAULT_END)

    // ── Fetch helpers ─────────────────────────────────────────────────────────
    const fetchStats = async () => {
        try { const r = await fetch(`${backend_url}/api/dashboard/stats`); setStats(await r.json()) } catch {}
    }

    const fetchActiveCalls = async () => {
        try { const r = await fetch(`${backend_url}/api/dashboard/active-calls`); setActiveCalls(await r.json()) } catch {}
    }

    const fetchKpiSummary = async () => {
        try {
            const r = await fetch(`${backend_url}/api/dashboard/analytics/ai-calls-summary?start_date=${DEFAULT_START}&end_date=${DEFAULT_END}`)
            setKpiSummary(await r.json())
        } catch {}
    }

    const fetchDailyTrend = async () => {
        setDailyLoading(true)
        try {
            const r = await fetch(`${backend_url}/api/dashboard/analytics/daily-trend?start_date=${dailyStart}&end_date=${dailyEnd}`)
            setDailyData(await r.json())
        } catch {} finally { setDailyLoading(false) }
    }

    const fetchFunnel = async () => {
        setFunnelLoading(true)
        try {
            const r = await fetch(`${backend_url}/api/dashboard/analytics/stage-funnel?start_date=${funnelStart}&end_date=${funnelEnd}`)
            setFunnelData(await r.json())
        } catch {} finally { setFunnelLoading(false) }
    }

    const fetchTransfer = async () => {
        setTransferLoading(true)
        try {
            const r = await fetch(`${backend_url}/api/dashboard/analytics/ai-calls-summary?start_date=${transferStart}&end_date=${transferEnd}`)
            setTransferData(await r.json())
        } catch {} finally { setTransferLoading(false) }
    }

    const fetchErrors = async () => {
        setErrorLoading(true)
        try {
            const r = await fetch(`${backend_url}/api/dashboard/analytics/stage-errors?start_date=${errorStart}&end_date=${errorEnd}`)
            setErrorData(await r.json())
        } catch {} finally { setErrorLoading(false) }
    }

    // ── Initial load ──────────────────────────────────────────────────────────
    useEffect(() => {
        fetchStats()
        fetchActiveCalls()
        fetchKpiSummary()
        fetchDailyTrend()
        fetchFunnel()
        fetchTransfer()
        fetchErrors()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className="flex h-screen bg-background">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header title="Sales Analytics" subtitle="AI call performance, funnel health, and conversion insights" />
                <main className="flex-1 overflow-y-auto p-8 space-y-8">

                    {/* Section 1 — KPI Cards */}
                    <KPISection
                        stats={stats}
                        activeCalls={activeCalls}
                        summary={kpiSummary}
                    />

                    {/* Section 2 — Daily Trend */}
                    <DailyTrendSection
                        data={dailyData}
                        loading={dailyLoading}
                        startDate={dailyStart}
                        setStartDate={setDailyStart}
                        endDate={dailyEnd}
                        setEndDate={setDailyEnd}
                        onFetch={fetchDailyTrend}
                    />

                    {/* Section 3 — Call Stage Funnel */}
                    <FunnelSection
                        data={funnelData}
                        loading={funnelLoading}
                        startDate={funnelStart}
                        setStartDate={setFunnelStart}
                        endDate={funnelEnd}
                        setEndDate={setFunnelEnd}
                        onFetch={fetchFunnel}
                    />

                    {/* Section 4 — Transfer Intelligence */}
                    <TransferSection
                        data={transferData}
                        loading={transferLoading}
                        startDate={transferStart}
                        setStartDate={setTransferStart}
                        endDate={transferEnd}
                        setEndDate={setTransferEnd}
                        onFetch={fetchTransfer}
                    />

                    {/* Section 5 — Error Analysis */}
                    <ErrorSection
                        data={errorData}
                        loading={errorLoading}
                        startDate={errorStart}
                        setStartDate={setErrorStart}
                        endDate={errorEnd}
                        setEndDate={setErrorEnd}
                        onFetch={fetchErrors}
                    />

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
