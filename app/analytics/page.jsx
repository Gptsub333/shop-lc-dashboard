// app/analytics/page.js - Protected Analytics Page
"use client"

import { useState, useEffect, useRef } from "react"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import ProtectedRoute from "@/components/ProtectedRoute"
import AnalyticsSkeleton from "@/components/AnalyticsSkeleton"
import HeroStatsGrid from "@/components/HeroStatsGrid"
import ChartsRow from "@/components/ChartsRow"
import VoiceMetrics from "@/components/VoiceMetrics"
import SentimentAnalysis from "@/components/SentimentAnalysis"
import ConcernsBreakdown from "@/components/ConcernsBreakdown"
import RefundItems from "@/components/RefundItems"

const backend_url = process.env.NEXT_PUBLIC_API_URL

function AnalyticsContent() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeCalls, setActiveCalls] = useState(0)
  const [activeCallsData, setActiveCallsData] = useState([])
  const [concernsData, setConcernsData] = useState(null)
  const [concernsLoading, setConcernsLoading] = useState(false)
  const [concernsStartDate, setConcernsStartDate] = useState("")
  const [concernsEndDate, setConcernsEndDate] = useState("")
  const [refundItems, setRefundItems] = useState([])
  const [refundLoading, setRefundLoading] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  // Refs to track if APIs have been called
  const statsCalledRef = useRef(false)
  const activeCallsCalledRef = useRef(false)
  const concernsCalledRef = useRef(false)
  const refundsCalledRef = useRef(false)

  useEffect(() => {
    const fetchStats = async () => {
      if (statsCalledRef.current) return
      statsCalledRef.current = true

      try {
        const response = await fetch(`${backend_url}/api/dashboard/stats`)
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const fetchActiveCalls = async (forceRefresh = false) => {
    if (!forceRefresh && activeCallsCalledRef.current) return
    if (!forceRefresh) activeCallsCalledRef.current = true

    try {
      const response = await fetch(`${backend_url}/api/dashboard/active-calls`)
      const data = await response.json()
      setActiveCalls(data.count || 0)
      setActiveCallsData(data.active_calls || [])
    } catch (error) {
      console.error("Error fetching active calls:", error)
    }
  }

  useEffect(() => {
    fetchActiveCalls()
  }, [])

  const fetchConcernsBreakdown = async (forceRefresh = false) => {
    if (!forceRefresh && concernsCalledRef.current) return
    if (!forceRefresh) concernsCalledRef.current = true

    setConcernsLoading(true)
    try {
      let url = `${backend_url}/api/dashboard/analytics/concerns-breakdown`
      const params = new URLSearchParams()
      if (concernsStartDate) params.append("start_date", concernsStartDate)
      if (concernsEndDate) params.append("end_date", concernsEndDate)

      if (params.toString()) url += `?${params.toString()}`

      const response = await fetch(url)
      const data = await response.json()
      setConcernsData(data)
    } catch (error) {
      console.error("Error fetching concerns breakdown:", error)
    } finally {
      setConcernsLoading(false)
    }
  }

  const fetchRefundItems = async (forceRefresh = false) => {
    if (!forceRefresh && refundsCalledRef.current) return
    if (!forceRefresh) refundsCalledRef.current = true

    setRefundLoading(true)
    try {
      let url = `${backend_url}/api/dashboard/analytics/refund-items?limit=20&min_count=1`
      if (startDate) url += `&start_date=${startDate}`
      if (endDate) url += `&end_date=${endDate}`

      const response = await fetch(url)
      const data = await response.json()
      setRefundItems(data.items || [])
    } catch (error) {
      console.error("Error fetching refund items:", error)
    } finally {
      setRefundLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  useEffect(() => {
    fetchConcernsBreakdown()
    fetchRefundItems()
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="Analytics Dashboard" subtitle="Real-time voice agent performance metrics" />
          <main className="flex-1 overflow-y-auto p-8">
            <AnalyticsSkeleton />
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Analytics Dashboard" subtitle="Real-time voice agent performance metrics" />

        <main className="flex-1 overflow-y-auto p-8">
          <HeroStatsGrid
            activeCalls={activeCalls}
            stats={stats}
            onRefreshActiveCalls={() => fetchActiveCalls(true)}
          />
          <ChartsRow activeCalls={activeCalls} stats={stats} />
          <VoiceMetrics stats={stats} />
          <SentimentAnalysis stats={stats} />
          <ConcernsBreakdown
            onFetch={() => fetchConcernsBreakdown(true)}
            concernsData={concernsData}
            concernsLoading={concernsLoading}
            concernsStartDate={concernsStartDate}
            setConcernsStartDate={setConcernsStartDate}
            concernsEndDate={concernsEndDate}
            setConcernsEndDate={setConcernsEndDate}
          />
          <RefundItems
            onFetch={() => fetchRefundItems(true)}
            refundItems={refundItems}
            refundLoading={refundLoading}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            formatDate={formatDate}
          />
        </main>
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  return (
    <ProtectedRoute>
      <AnalyticsContent />
    </ProtectedRoute>
  )
}