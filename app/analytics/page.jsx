"use client"

import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import KPICard from "@/components/kpi-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, PhoneCall, Clock, Users, ThumbsUp, ThumbsDown, TrendingUp, Activity } from "lucide-react"

export default function AnalyticsPage() {
  // TODO: Replace mock data with API response
  const analyticsData = {
    activeCalls: 3,
    totalCallsToday: 142,
    avgCallDuration: "4m 32s",
    totalCustomers: 89,
    routedToday: 38,
    routedLifetime: 2847,
    satisfiedCalls: 87,
    unsatisfiedCalls: 13,
    agentHoursToday: 5.6,
    agentHoursWeek: 38.2,
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Analytics Dashboard" subtitle="Real-time voice agent performance metrics" />

        <main className="flex-1 overflow-y-auto p-8">
          {/* Main Analytics */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">Call Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <KPICard
                title="Active Calls"
                value={analyticsData.activeCalls}
                subtitle="Currently in progress"
                icon={PhoneCall}
                trend={12}
              />
              <KPICard
                title="Total Calls Today"
                value={analyticsData.totalCallsToday}
                subtitle="Since midnight"
                icon={Phone}
                trend={8}
              />
              <KPICard
                title="Avg Call Duration"
                value={analyticsData.avgCallDuration}
                subtitle="Per session"
                icon={Clock}
                trend={-3}
              />
              <KPICard
                title="Unique Customers"
                value={analyticsData.totalCustomers}
                subtitle="Today"
                icon={Users}
                trend={15}
              />
            </div>
          </div>

          {/* Routing Metrics */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">Routing Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Calls Routed Today</CardTitle>
                  <CardDescription>Agent handoffs and transfers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-4">
                    <div>
                      <p className="text-4xl font-bold text-foreground">{analyticsData.routedToday}</p>
                      <p className="text-sm text-muted-foreground mt-1">calls routed</p>
                    </div>
                    <div className="flex-1 h-24 bg-gradient-to-t from-primary/20 to-primary/5 rounded-lg" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Lifetime Routed Calls</CardTitle>
                  <CardDescription>All-time routing statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-4">
                    <div>
                      <p className="text-4xl font-bold text-foreground">
                        {analyticsData.routedLifetime.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">total routed</p>
                    </div>
                    <div className="flex-1 h-24 bg-gradient-to-t from-chart-2/20 to-chart-2/5 rounded-lg" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Customer Satisfaction */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">Customer Satisfaction</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Satisfied Customers</p>
                      <p className="text-3xl font-bold text-success">{analyticsData.satisfiedCalls}%</p>
                    </div>
                    <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                      <ThumbsUp className="w-8 h-8 text-success" />
                    </div>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-3">
                    <div
                      className="bg-success h-3 rounded-full transition-all"
                      style={{ width: `${analyticsData.satisfiedCalls}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Based on post-call surveys</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Unsatisfied Customers</p>
                      <p className="text-3xl font-bold text-destructive">{analyticsData.unsatisfiedCalls}%</p>
                    </div>
                    <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                      <ThumbsDown className="w-8 h-8 text-destructive" />
                    </div>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-3">
                    <div
                      className="bg-destructive h-3 rounded-full transition-all"
                      style={{ width: `${analyticsData.unsatisfiedCalls}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Requires follow-up attention</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Agent Voice Metrics */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Agent Voice Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Hours Spoken Today</CardTitle>
                  <CardDescription>Total agent talk time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                      <Activity className="w-10 h-10 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-4xl font-bold text-foreground">{analyticsData.agentHoursToday}</p>
                      <p className="text-sm text-muted-foreground mt-1">hours today</p>
                      <div className="flex items-center gap-1 mt-2">
                        <TrendingUp className="w-3 h-3 text-success" />
                        <span className="text-xs text-success font-medium">+18% vs yesterday</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Hours Spoken This Week</CardTitle>
                  <CardDescription>7-day cumulative talk time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-chart-2/20 flex items-center justify-center">
                      <Clock className="w-10 h-10 text-chart-2" />
                    </div>
                    <div className="flex-1">
                      <p className="text-4xl font-bold text-foreground">{analyticsData.agentHoursWeek}</p>
                      <p className="text-sm text-muted-foreground mt-1">hours this week</p>
                      <div className="flex items-center gap-1 mt-2">
                        <TrendingUp className="w-3 h-3 text-success" />
                        <span className="text-xs text-success font-medium">+12% vs last week</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
