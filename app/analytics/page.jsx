"use client"

import { useState, useEffect } from "react"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Phone,
  PhoneCall,
  Clock,
  Activity,
  Calendar,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Users,
  PhoneIncoming,
  Timer,
  BarChart3,
  AlertTriangle,
  MessageSquare,
  PieChart as PieChartIcon
} from "lucide-react"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts"

const backend_url = process.env.NEXT_PUBLIC_API_URL;


export default function AnalyticsPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refundItems, setRefundItems] = useState([])
  const [refundLoading, setRefundLoading] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  // Active Calls State - Polls every 5 seconds
  const [activeCalls, setActiveCalls] = useState(0)
  const [activeCallsData, setActiveCallsData] = useState([])

  // Concerns Breakdown State
  const [concernsData, setConcernsData] = useState(null)
  const [concernsLoading, setConcernsLoading] = useState(false)
  const [concernsStartDate, setConcernsStartDate] = useState("")
  const [concernsEndDate, setConcernsEndDate] = useState("")

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${backend_url}/api/dashboard/stats`);
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats() // Run once on mount, no interval
  }, [])

  // Active Calls Polling - Every 5 seconds
  useEffect(() => {
    const fetchActiveCalls = async () => {
      try {
        const response = await fetch(`${backend_url}/api/dashboard/active-calls`);
        const data = await response.json()
        setActiveCalls(data.count || 0)
        setActiveCallsData(data.active_calls || [])
      } catch (error) {
        console.error("Error fetching active calls:", error)
      }
    }

    fetchActiveCalls() // Initial fetch
    const interval = setInterval(fetchActiveCalls, 5000) // Poll every 5 seconds
    return () => clearInterval(interval)
  }, [])

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

  useEffect(() => {
    fetchConcernsBreakdown()
  }, [])

  const fetchRefundItems = async () => {
    setRefundLoading(true)
    try {
      let url =
        `${backend_url}/api/dashboard/analytics/refund-items?limit=20&min_count=1`;
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

  useEffect(() => {
    fetchRefundItems()
  }, [])

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

  // Prepare chart data
  const routingData = [
    { name: "Today", value: stats?.routed_calls_today || 0, fill: "#3b82f6" },
    { name: "Lifetime", value: stats?.routed_calls_total || 0, fill: "#8b5cf6" }
  ]

  const callsComparisonData = [
    { name: "Active", calls: activeCalls || 0, fill: "#10b981" },
    { name: "Today", calls: stats?.calls_today || 0, fill: "#3b82f6" },
    { name: "Total", calls: stats?.total_calls || 0, fill: "#8b5cf6" }
  ]

  // Top 10 refunded items for chart
  const refundChartData = refundItems.slice(0, 10).map((item, index) => ({
    name: `Item ${index + 1}`,
    count: item.refund_count,
    fullName: item.item_description
  }))

  const COLORS = ["#ef4444", "#f59e0b", "#eab308", "#84cc16", "#22c55e", "#14b8a6", "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6"]

  // Concerns pie chart colors - matching the theme
  const CONCERN_COLORS = {
    orders: "#3b82f6",      // blue
    refunds: "#ef4444",     // red
    budget_pay: "#22c55e",  // green
    policies: "#8b5cf6"     // purple
  }

  // Sentiment colors
  const SENTIMENT_COLORS = {
    positive: "#22c55e",   // green
    neutral: "#64748b",    // slate/gray
    negative: "#ef4444"    // red
  }

  // Prepare sentiment pie chart data
  const sentimentData = stats?.sentiment_distribution ? [
    {
      name: "Positive",
      value: stats.sentiment_distribution.positive.count,
      percentage: stats.sentiment_distribution.positive.percentage,
      fill: SENTIMENT_COLORS.positive
    },
    {
      name: "Neutral",
      value: stats.sentiment_distribution.neutral.count,
      percentage: stats.sentiment_distribution.neutral.percentage,
      fill: SENTIMENT_COLORS.neutral
    },
    {
      name: "Negative",
      value: stats.sentiment_distribution.negative.count,
      percentage: stats.sentiment_distribution.negative.percentage,
      fill: SENTIMENT_COLORS.negative
    }
  ].filter(item => item.value > 0) : []

  // Prepare concerns pie chart data
  const prepareConcernsPieData = (categoryData) => {
    if (!categoryData || !categoryData.concerns) return []

    return Object.entries(categoryData.concerns)
      .filter(([key, value]) => value.count > 0 && key !== "others")
      .map(([name, data]) => ({
        name: name,
        value: data.count,
        percentage: data.percentage
      }))
      .sort((a, b) => b.value - a.value)
  }

  const ordersConcernsData = concernsData ? prepareConcernsPieData(concernsData.orders) : []
  const refundsConcernsData = concernsData ? prepareConcernsPieData(concernsData.refunds) : []
  const budgetPayConcernsData = concernsData ? prepareConcernsPieData(concernsData.budget_pay) : []
  const policiesConcernsData = concernsData ? prepareConcernsPieData(concernsData.policies) : []

  // Summary data for overall distribution
  const summaryData = concernsData ? [
    { name: "Orders", value: concernsData.orders.total, percentage: concernsData.orders.percentage, fill: CONCERN_COLORS.orders },
    { name: "Refunds", value: concernsData.refunds.total, percentage: concernsData.refunds.percentage, fill: CONCERN_COLORS.refunds },
    { name: "Budget Pay", value: concernsData.budget_pay.total, percentage: concernsData.budget_pay.percentage, fill: CONCERN_COLORS.budget_pay },
    { name: "Policies", value: concernsData.policies.total, percentage: concernsData.policies.percentage, fill: CONCERN_COLORS.policies }
  ].filter(item => item.value > 0) : []

  // Custom label for pie charts
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }) => {
    if (percentage < 5) return null // Don't show label for small slices
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-xs font-bold"
      >
        {`${percentage.toFixed(1)}%`}
      </text>
    )
  }

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Active Calls */}
            <Card className="relative overflow-hidden border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Active Calls</p>
                    <p className="text-3xl font-bold text-foreground">{activeCalls}</p>
                    <p className="text-xs text-muted-foreground mt-2">Currently in progress</p>
                  </div>
                  <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center">
                    <PhoneCall className="w-7 h-7 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Today's Calls */}
            <Card className="relative overflow-hidden border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Calls Today</p>
                    <p className="text-3xl font-bold text-foreground">{stats?.calls_today || 0}</p>
                    <p className="text-xs text-muted-foreground mt-2">Since midnight</p>
                  </div>
                  <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Phone className="w-7 h-7 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Avg Duration */}
            <Card className="relative overflow-hidden border-l-4 border-l-amber-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Avg Duration</p>
                    <p className="text-3xl font-bold text-foreground">{stats?.average_call_duration || "0m"}</p>
                    <p className="text-xs text-muted-foreground mt-2">Per session</p>
                  </div>
                  <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <Clock className="w-7 h-7 text-amber-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Calls */}
            <Card className="relative overflow-hidden border-l-4 border-l-purple-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Total Calls</p>
                    <p className="text-3xl font-bold text-foreground">{stats?.total_calls || 0}</p>
                    <p className="text-xs text-muted-foreground mt-2">All time</p>
                  </div>
                  <div className="w-14 h-14 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <Activity className="w-7 h-7 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Calls Overview Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Calls Overview
                </CardTitle>
                <CardDescription>Distribution of active, today's, and total calls</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={callsComparisonData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                    <Bar dataKey="calls" radius={[8, 8, 0, 0]}>
                      {callsComparisonData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Routing Metrics Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PhoneIncoming className="w-5 h-5 text-primary" />
                  Routing Metrics
                </CardTitle>
                <CardDescription>Today vs lifetime routed calls</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-500/10 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Today</p>
                    <p className="text-3xl font-bold text-blue-500">{stats?.routed_calls_today || 0}</p>
                  </div>
                  <div className="text-center p-4 bg-purple-500/10 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Lifetime</p>
                    <p className="text-3xl font-bold text-purple-500">
                      {stats?.routed_calls_total?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={routingData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                      {routingData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Voice Metrics Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="w-5 h-5 text-blue-500" />
                  Hours Spoken Today
                </CardTitle>
                <CardDescription>Total agent talk time today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-5xl font-bold text-blue-500 mb-2">
                      {stats?.hours_talked_today || "0h 0m"}
                    </p>
                    <p className="text-sm text-muted-foreground">Active conversation time</p>
                  </div>
                  <div className="w-24 h-24 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Activity className="w-12 h-12 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/5 to-purple-500/10 border-purple-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-purple-500" />
                  Total Hours Spoken
                </CardTitle>
                <CardDescription>Lifetime agent talk time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-5xl font-bold text-purple-500 mb-2">
                      {stats?.hours_talked_total || "0h 0m"}
                    </p>
                    <p className="text-sm text-muted-foreground">All-time conversation time</p>
                  </div>
                  <div className="w-24 h-24 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Clock className="w-12 h-12 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sentiment Distribution Card */}
          <Card className="mb-8 bg-gradient-to-br from-green-500/5 via-slate-500/5 to-red-500/5 border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-6 h-6 text-primary" />
                Customer Sentiment Analysis
              </CardTitle>
              <CardDescription>
                Voice agent performance based on {stats?.sentiment_distribution?.total_analyzed || 0} analyzed conversations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.sentiment_distribution?.total_analyzed > 0 ? (
                <div className="flex flex-col lg:flex-row items-center gap-8">
                  <div className="flex-1 w-full">
                    <ResponsiveContainer width="100%" height={350}>
                      <PieChart>
                        <Pie
                          data={sentimentData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={renderCustomLabel}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {sentimentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload
                              return (
                                <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                                  <p className="font-semibold text-sm mb-1">{data.name} Experience</p>
                                  <p className="font-bold" style={{ color: data.fill }}>
                                    Count: {data.value}
                                  </p>
                                  <p className="text-muted-foreground text-xs">
                                    {data.percentage.toFixed(1)}% of conversations
                                  </p>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 grid grid-cols-1 gap-4 w-full">
                    {/* Positive Card */}
                    <div className="p-4 rounded-lg border-2 border-green-500/40 bg-green-500/10">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <p className="text-sm font-medium text-foreground">Positive</p>
                        </div>
                        <p className="text-xs text-green-500 font-semibold">
                          {stats?.sentiment_distribution?.positive?.percentage?.toFixed(1) || 0}%
                        </p>
                      </div>
                      <p className="text-3xl font-bold text-green-500">
                        {stats?.sentiment_distribution?.positive?.count || 0}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Happy customers</p>
                    </div>

                    {/* Neutral Card */}
                    <div className="p-4 rounded-lg border-2 border-slate-500/40 bg-slate-500/10">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-slate-500"></div>
                          <p className="text-sm font-medium text-foreground">Neutral</p>
                        </div>
                        <p className="text-xs text-slate-500 font-semibold">
                          {stats?.sentiment_distribution?.neutral?.percentage?.toFixed(1) || 0}%
                        </p>
                      </div>
                      <p className="text-3xl font-bold text-slate-500">
                        {stats?.sentiment_distribution?.neutral?.count || 0}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Neutral experience</p>
                    </div>

                    {/* Negative Card */}
                    <div className="p-4 rounded-lg border-2 border-red-500/40 bg-red-500/10">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <p className="text-sm font-medium text-foreground">Negative</p>
                        </div>
                        <p className="text-xs text-red-500 font-semibold">
                          {stats?.sentiment_distribution?.negative?.percentage?.toFixed(1) || 0}%
                        </p>
                      </div>
                      <p className="text-3xl font-bold text-red-500">
                        {stats?.sentiment_distribution?.negative?.count || 0}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Needs attention</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-muted/20 rounded-lg">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No sentiment data available</p>
                  <p className="text-sm text-muted-foreground mt-1">Start analyzing conversations to see sentiment distribution</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Concerns Breakdown Section */}
          <Card className="mb-8 border-2 border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-6 h-6 text-primary" />
                    Customer Concerns Breakdown
                  </CardTitle>
                  <CardDescription>
                    Analyze customer concerns by category with detailed breakdowns
                    {concernsData?.summary && (
                      <span className="block mt-1 text-xs">
                        Analyzed {concernsData.summary.total_conversations_analyzed} conversations
                        ({concernsData.summary.conversations_with_categories} with categories)
                      </span>
                    )}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchConcernsBreakdown}
                  disabled={concernsLoading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${concernsLoading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Date Filter */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <label className="text-sm font-medium text-foreground mb-2 block">Start Date</label>
                  <Input
                    type="date"
                    value={concernsStartDate}
                    onChange={(e) => setConcernsStartDate(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-foreground mb-2 block">End Date</label>
                  <Input
                    type="date"
                    value={concernsEndDate}
                    onChange={(e) => setConcernsEndDate(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={fetchConcernsBreakdown} disabled={concernsLoading} className="w-full sm:w-auto">
                    {concernsLoading ? "Searching..." : "Search"}
                  </Button>
                </div>
              </div>

              {concernsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Loading concerns data...</span>
                </div>
              ) : !concernsData ? (
                <div className="text-center py-12 bg-muted/20 rounded-lg">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No concerns data available</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Summary Pie Chart - Full Width */}
                  <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PieChartIcon className="w-5 h-5 text-primary" />
                        Overall Category Distribution
                      </CardTitle>
                      <CardDescription>
                        Summary of all customer concerns across categories
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {summaryData.length > 0 ? (
                        <div className="flex flex-col lg:flex-row items-center gap-8">
                          <div className="flex-1 w-full">
                            <ResponsiveContainer width="100%" height={350}>
                              <PieChart>
                                <Pie
                                  data={summaryData}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  label={renderCustomLabel}
                                  outerRadius={120}
                                  fill="#8884d8"
                                  dataKey="value"
                                >
                                  {summaryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                  ))}
                                </Pie>
                                <Tooltip
                                  content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                      const data = payload[0].payload
                                      return (
                                        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                                          <p className="font-semibold text-sm mb-1">{data.name}</p>
                                          <p className="text-primary font-bold">Count: {data.value}</p>
                                          <p className="text-muted-foreground text-xs">
                                            {data.percentage.toFixed(1)}% of total
                                          </p>
                                        </div>
                                      )
                                    }
                                    return null
                                  }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="flex-1 grid grid-cols-2 gap-4">
                            {summaryData.map((item, index) => (
                              <div
                                key={index}
                                className="p-4 rounded-lg border-2"
                                style={{ borderColor: item.fill + "40", backgroundColor: item.fill + "10" }}
                              >
                                <p className="text-xs text-muted-foreground mb-1">{item.name}</p>
                                <p className="text-2xl font-bold" style={{ color: item.fill }}>
                                  {item.value}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {item.percentage.toFixed(1)}%
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">No category data available</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Individual Category Pie Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Orders Concerns */}
                    <Card className="border-blue-500/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-500">
                          <Phone className="w-5 h-5" />
                          Orders Concerns
                        </CardTitle>
                        <CardDescription>
                          {concernsData.orders.total} conversations ({concernsData.orders.percentage}%)
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {ordersConcernsData.length > 0 ? (
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={ordersConcernsData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {ordersConcernsData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip
                                content={({ active, payload }) => {
                                  if (active && payload && payload.length) {
                                    const data = payload[0].payload
                                    return (
                                      <div className="bg-background border border-border rounded-lg p-3 shadow-lg max-w-xs">
                                        <p className="font-semibold text-sm mb-1">{data.name}</p>
                                        <p className="text-blue-500 font-bold">Count: {data.value}</p>
                                        <p className="text-muted-foreground text-xs">
                                          {data.percentage.toFixed(1)}% of orders
                                        </p>
                                      </div>
                                    )
                                  }
                                  return null
                                }}
                              />
                              <Legend
                                verticalAlign="bottom"
                                height={36}
                                content={({ payload }) => (
                                  <div className="flex flex-wrap gap-2 justify-center mt-4">
                                    {payload.map((entry, index) => (
                                      <div key={`legend-${index}`} className="flex items-center gap-1 text-xs">
                                        <div
                                          className="w-3 h-3 rounded-full"
                                          style={{ backgroundColor: entry.color }}
                                        />
                                        <span className="text-muted-foreground truncate max-w-[120px]">
                                          {entry.value}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="text-center py-12 text-muted-foreground">
                            No orders concerns data
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Refunds Concerns */}
                    <Card className="border-red-500/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-500">
                          <AlertTriangle className="w-5 h-5" />
                          Refunds Concerns
                        </CardTitle>
                        <CardDescription>
                          {concernsData.refunds.total} conversations ({concernsData.refunds.percentage}%)
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {refundsConcernsData.length > 0 ? (
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={refundsConcernsData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {refundsConcernsData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip
                                content={({ active, payload }) => {
                                  if (active && payload && payload.length) {
                                    const data = payload[0].payload
                                    return (
                                      <div className="bg-background border border-border rounded-lg p-3 shadow-lg max-w-xs">
                                        <p className="font-semibold text-sm mb-1">{data.name}</p>
                                        <p className="text-red-500 font-bold">Count: {data.value}</p>
                                        <p className="text-muted-foreground text-xs">
                                          {data.percentage.toFixed(1)}% of refunds
                                        </p>
                                      </div>
                                    )
                                  }
                                  return null
                                }}
                              />
                              <Legend
                                verticalAlign="bottom"
                                height={36}
                                content={({ payload }) => (
                                  <div className="flex flex-wrap gap-2 justify-center mt-4">
                                    {payload.map((entry, index) => (
                                      <div key={`legend-${index}`} className="flex items-center gap-1 text-xs">
                                        <div
                                          className="w-3 h-3 rounded-full"
                                          style={{ backgroundColor: entry.color }}
                                        />
                                        <span className="text-muted-foreground truncate max-w-[120px]">
                                          {entry.value}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="text-center py-12 text-muted-foreground">
                            No refunds concerns data
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Budget Pay Concerns */}
                    <Card className="border-green-500/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-500">
                          <Activity className="w-5 h-5" />
                          Budget Pay Concerns
                        </CardTitle>
                        <CardDescription>
                          {concernsData.budget_pay.total} conversations ({concernsData.budget_pay.percentage}%)
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {budgetPayConcernsData.length > 0 ? (
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={budgetPayConcernsData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {budgetPayConcernsData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip
                                content={({ active, payload }) => {
                                  if (active && payload && payload.length) {
                                    const data = payload[0].payload
                                    return (
                                      <div className="bg-background border border-border rounded-lg p-3 shadow-lg max-w-xs">
                                        <p className="font-semibold text-sm mb-1">{data.name}</p>
                                        <p className="text-green-500 font-bold">Count: {data.value}</p>
                                        <p className="text-muted-foreground text-xs">
                                          {data.percentage.toFixed(1)}% of budget pay
                                        </p>
                                      </div>
                                    )
                                  }
                                  return null
                                }}
                              />
                              <Legend
                                verticalAlign="bottom"
                                height={36}
                                content={({ payload }) => (
                                  <div className="flex flex-wrap gap-2 justify-center mt-4">
                                    {payload.map((entry, index) => (
                                      <div key={`legend-${index}`} className="flex items-center gap-1 text-xs">
                                        <div
                                          className="w-3 h-3 rounded-full"
                                          style={{ backgroundColor: entry.color }}
                                        />
                                        <span className="text-muted-foreground truncate max-w-[120px]">
                                          {entry.value}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="text-center py-12 text-muted-foreground">
                            No budget pay concerns data
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Policies Concerns */}
                    <Card className="border-purple-500/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-purple-500">
                          <BarChart3 className="w-5 h-5" />
                          Policies Concerns
                        </CardTitle>
                        <CardDescription>
                          {concernsData.policies.total} conversations ({concernsData.policies.percentage}%)
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {policiesConcernsData.length > 0 ? (
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={policiesConcernsData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {policiesConcernsData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip
                                content={({ active, payload }) => {
                                  if (active && payload && payload.length) {
                                    const data = payload[0].payload
                                    return (
                                      <div className="bg-background border border-border rounded-lg p-3 shadow-lg max-w-xs">
                                        <p className="font-semibold text-sm mb-1">{data.name}</p>
                                        <p className="text-purple-500 font-bold">Count: {data.value}</p>
                                        <p className="text-muted-foreground text-xs">
                                          {data.percentage.toFixed(1)}% of policies
                                        </p>
                                      </div>
                                    )
                                  }
                                  return null
                                }}
                              />
                              <Legend
                                verticalAlign="bottom"
                                height={36}
                                content={({ payload }) => (
                                  <div className="flex flex-wrap gap-2 justify-center mt-4">
                                    {payload.map((entry, index) => (
                                      <div key={`legend-${index}`} className="flex items-center gap-1 text-xs">
                                        <div
                                          className="w-3 h-3 rounded-full"
                                          style={{ backgroundColor: entry.color }}
                                        />
                                        <span className="text-muted-foreground truncate max-w-[120px]">
                                          {entry.value}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="text-center py-12 text-muted-foreground">
                            No policies concerns data
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Refund Items Section */}
          <Card className="border-red-500/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Most Refunded Items
                  </CardTitle>
                  <CardDescription>Track problematic products and customer returns</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchRefundItems}
                  disabled={refundLoading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${refundLoading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="table" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
                  <TabsTrigger value="table">Table View</TabsTrigger>
                  <TabsTrigger value="chart">Chart View</TabsTrigger>
                </TabsList>

                {/* Date Filter */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-foreground mb-2 block">Start Date</label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium text-foreground mb-2 block">End Date</label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={fetchRefundItems} disabled={refundLoading} className="w-full sm:w-auto">
                      {refundLoading ? "Searching..." : "Search"}
                    </Button>
                  </div>
                </div>

                {/* Table View */}
                <TabsContent value="table" className="mt-0">
                  {refundLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-muted-foreground">Loading refund items...</span>
                    </div>
                  ) : refundItems.length === 0 ? (
                    <div className="text-center py-12 bg-muted/20 rounded-lg">
                      <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground">No refunded items found</p>
                      <p className="text-sm text-muted-foreground mt-1">Try adjusting your date range</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-lg border">
                      <table className="w-full">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="text-left py-4 px-4 text-sm font-semibold text-foreground">Rank</th>
                            <th className="text-left py-4 px-4 text-sm font-semibold text-foreground">Item Description</th>
                            <th className="text-center py-4 px-4 text-sm font-semibold text-foreground">Refund Count</th>
                            <th className="text-center py-4 px-4 text-sm font-semibold text-foreground">First Refund</th>
                            <th className="text-center py-4 px-4 text-sm font-semibold text-foreground">Last Refund</th>
                          </tr>
                        </thead>
                        <tbody>
                          {refundItems.map((item, index) => (
                            <tr
                              key={index}
                              className="border-t hover:bg-muted/30 transition-colors"
                            >
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${index === 0 ? "bg-red-500/20 text-red-500" :
                                    index === 1 ? "bg-orange-500/20 text-orange-500" :
                                      index === 2 ? "bg-yellow-500/20 text-yellow-500" :
                                        "bg-muted text-muted-foreground"
                                    }`}>
                                    {index + 1}
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-sm text-foreground max-w-md">
                                <div className="line-clamp-2">{item.item_description}</div>
                              </td>
                              <td className="py-4 px-4 text-center">
                                <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-full bg-red-500/10 text-red-500 text-sm font-bold">
                                  {item.refund_count}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-center text-sm text-muted-foreground">
                                {formatDate(item.first_refund_date)}
                              </td>
                              <td className="py-4 px-4 text-center text-sm text-muted-foreground">
                                {formatDate(item.last_refund_date)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </TabsContent>

                {/* Chart View */}
                <TabsContent value="chart" className="mt-0">
                  {refundLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-muted-foreground">Loading chart...</span>
                    </div>
                  ) : refundChartData.length === 0 ? (
                    <div className="text-center py-12 bg-muted/20 rounded-lg">
                      <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground">No data to visualize</p>
                    </div>
                  ) : (
                    <div>
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={refundChartData}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-background border border-border rounded-lg p-3 shadow-lg max-w-xs">
                                    <p className="font-semibold text-sm mb-1">{payload[0].payload.fullName}</p>
                                    <p className="text-red-500 font-bold">Refunds: {payload[0].value}</p>
                                  </div>
                                )
                              }
                              return null
                            }}
                          />
                          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                            {refundChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                      <div className="mt-4 text-center text-sm text-muted-foreground">
                        Showing top {refundChartData.length} most refunded items
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}