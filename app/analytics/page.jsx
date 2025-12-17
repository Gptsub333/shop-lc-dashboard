"use client"

import { useState, useEffect } from "react"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import { RefreshCw } from "lucide-react"
import HeroStatsGrid from "@/components/HeroStatsGrid"
import ChartsRow from "@/components/ChartsRow"
import VoiceMetrics from "@/components/VoiceMetrics"
import SentimentAnalysis from "@/components/SentimentAnalysis"
import ConcernsBreakdown from "@/components/ConcernsBreakdown"
import RefundItems from "@/components/RefundItems"

const backend_url = process.env.NEXT_PUBLIC_API_URL

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  // Active Calls State - Polls every 5 seconds
  const [activeCalls, setActiveCalls] = useState(0)
  const [activeCallsData, setActiveCallsData] = useState([])

  // Concerns Breakdown State
  const [concernsData, setConcernsData] = useState(null)
  const [concernsLoading, setConcernsLoading] = useState(false)
  const [concernsStartDate, setConcernsStartDate] = useState("")
  const [concernsEndDate, setConcernsEndDate] = useState("")

  // Refund Items State
  const [refundItems, setRefundItems] = useState([])
  const [refundLoading, setRefundLoading] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  // Fetch dashboard stats (once on mount)
  useEffect(() => {
    const fetchStats = async () => {
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

  // Active Calls Polling - Every 5 seconds
  useEffect(() => {
    const fetchActiveCalls = async () => {
      try {
        const response = await fetch(`${backend_url}/api/dashboard/active-calls`)
        const data = await response.json()
        setActiveCalls(data.count || 0)
        setActiveCallsData(data.active_calls || [])
      } catch (error) {
        console.error("Error fetching active calls:", error)
      }
    }

    fetchActiveCalls()
  }, [])

  // Fetch concerns breakdown
  const fetchConcernsBreakdown = async () => {
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

  // Fetch refund items
  const fetchRefundItems = async () => {
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

  // Format date helper
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

  // Initial fetch for concerns and refund items
  useEffect(() => {
    fetchConcernsBreakdown()
    fetchRefundItems()
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
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
          {/* Hero Stats Grid */}
          <HeroStatsGrid activeCalls={activeCalls} stats={stats} />

          {/* Charts Row */}
          <ChartsRow activeCalls={activeCalls} stats={stats} />

          {/* Voice Metrics Row */}
          <VoiceMetrics stats={stats} />

          {/* Sentiment Analysis */}
          <SentimentAnalysis stats={stats} />

          {/* Customer Concerns Breakdown Section */}
          <ConcernsBreakdown
            onFetch={fetchConcernsBreakdown}
            concernsData={concernsData}
            concernsLoading={concernsLoading}
            concernsStartDate={concernsStartDate}
            setConcernsStartDate={setConcernsStartDate}
            concernsEndDate={concernsEndDate}
            setConcernsEndDate={setConcernsEndDate}
          />

          {/* Refund Items Section */}
          <RefundItems
            onFetch={fetchRefundItems}
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
