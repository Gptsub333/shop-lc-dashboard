"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRightLeft, RefreshCw, Phone, ShoppingCart, Bot, Users } from "lucide-react"
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer,
} from "recharts"
import DatePickerYMD from "@/components/DatePickerYMD"
import Pie3DChart from "@/components/Pie3DChart"

const AGENT_COLOR    = "#f43f5e"
const CUSTOMER_COLOR = "#f59e0b"

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null
    return (
        <div className="bg-background border border-border rounded-lg px-3 py-2 shadow-xl text-xs">
            <p className="font-semibold text-foreground mb-1.5">{label}</p>
            {payload.map((p) => (
                <p key={p.dataKey} className="flex justify-between gap-4" style={{ color: p.color }}>
                    <span>{p.name}</span><b>{p.value}</b>
                </p>
            ))}
        </div>
    )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function TransferSection({ data, loading, startDate, setStartDate, endDate, setEndDate, onFetch }) {
    const totals    = data?.totals
    const breakdown = data?.transfer_breakdown
    const periods   = data?.period_breakdown ?? []

    const trendData = periods.map((p) => ({
        period: p.period?.length > 7 ? p.period.slice(5) : p.period,
        "Total Calls": p.total_calls,
        "Orders":      p.orders_confirmed,
        "Transferred": p.transferred,
    }))

    const summaryStats = [
        { label: "Total Calls",   value: totals?.total_calls?.toLocaleString(),          icon: Phone,          color: "text-blue-500",    bg: "bg-blue-500/10"    },
        { label: "Orders",        value: totals?.orders_confirmed?.toLocaleString(),      icon: ShoppingCart,   color: "text-emerald-500", bg: "bg-emerald-500/10" },
        { label: "Transferred",   value: totals?.transferred,                             icon: ArrowRightLeft, color: "text-rose-500",    bg: "bg-rose-500/10"    },
        { label: "Transfer Rate", value: totals?.transfer_rate != null ? `${totals.transfer_rate}%` : "—", icon: ArrowRightLeft, color: "text-amber-500", bg: "bg-amber-500/10" },
    ]

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2 mb-1">
                            <ArrowRightLeft className="w-5 h-5 text-primary" />
                            Transfer Intelligence
                        </CardTitle>
                        <CardDescription>
                            Who initiates transfers and how calls escalate
                            <span className="ml-2 text-xs font-medium text-primary">
                                ({startDate} → {endDate})
                            </span>
                        </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={onFetch} disabled={loading}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
                    <DatePickerYMD label="Start Date" value={startDate} onChange={setStartDate} />
                    <DatePickerYMD label="End Date" value={endDate} onChange={setEndDate} />
                    <div className="flex items-end">
                        <Button onClick={onFetch} disabled={loading} className="w-full sm:w-auto">
                            {loading ? "Loading..." : "Search"}
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">Loading…</div>
                ) : !data ? (
                    <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">No data</div>
                ) : (
                    <div className="space-y-6">
                        {/* Summary stat strip */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {summaryStats.map((s) => {
                                const Icon = s.icon
                                return (
                                    <div key={s.label} className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:shadow-md transition-shadow">
                                        <div className={`w-9 h-9 rounded-full ${s.bg} flex items-center justify-center shrink-0`}>
                                            <Icon className={`w-4 h-4 ${s.color}`} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[11px] text-muted-foreground leading-none mb-1 truncate">{s.label}</p>
                                            <p className={`text-lg font-bold ${s.color}`}>{s.value ?? "—"}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Donut + Trend side by side */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            {/* Transfer intent 3D pie */}
                            <div className="p-6 rounded-xl border border-border bg-card">
                                <p className="text-sm font-semibold text-foreground mb-2">Transfer Intent Split</p>
                                {breakdown ? (
                                    <>
                                        <Pie3DChart
                                            data={[
                                                { name: "AI Initiated",       value: breakdown.requested_by_agent,    fill: AGENT_COLOR    },
                                                { name: "Customer Requested", value: breakdown.requested_by_customer, fill: CUSTOMER_COLOR },
                                            ]}
                                            height={300}
                                        />
                                        <div className="mt-5 space-y-2 select-text">
                                            {[
                                                { name: "AI Initiated",       value: breakdown.requested_by_agent,    pct: breakdown.agent_rate,    fill: AGENT_COLOR },
                                                { name: "Customer Requested", value: breakdown.requested_by_customer, pct: breakdown.customer_rate, fill: CUSTOMER_COLOR },
                                            ].map((item) => (
                                                <div key={item.name} className="flex items-center gap-2 text-sm group">
                                                    <span
                                                        className="inline-block w-3 h-3 rounded-sm flex-shrink-0"
                                                        style={{ backgroundColor: item.fill }}
                                                    />
                                                    <span className="text-foreground flex-1 leading-tight">{item.name}</span>
                                                    <span className="font-semibold text-foreground tabular-nums">{item.pct}%</span>
                                                    <span
                                                        className="font-bold tabular-nums px-1.5 py-0.5 rounded text-xs"
                                                        style={{ backgroundColor: item.fill + "22", color: item.fill }}
                                                    >
                                                        {item.value}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No breakdown data</p>
                                )}
                            </div>

                            {/* Period trend area chart */}
                            <div className="p-6 rounded-xl border border-border bg-card flex flex-col">
                                <p className="text-sm font-semibold text-foreground mb-4">Call Outcomes by Period</p>
                                {trendData.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No period data</p>
                                ) : (
                                    <ResponsiveContainer width="100%" height={360}>
                                        <AreaChart data={trendData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="tCalls" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.35} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}    />
                                                </linearGradient>
                                                <linearGradient id="tOrders" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.35} />
                                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}    />
                                                </linearGradient>
                                                <linearGradient id="tTransfer" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%"  stopColor="#f43f5e" stopOpacity={0.35} />
                                                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}    />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" opacity={0.08} />
                                            <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                                            <YAxis tick={{ fontSize: 12 }} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Area type="monotone" dataKey="Total Calls" stroke="#3b82f6" fill="url(#tCalls)"    strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 2 }} />
                                            <Area type="monotone" dataKey="Orders"      stroke="#22c55e" fill="url(#tOrders)"   strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 2 }} />
                                            <Area type="monotone" dataKey="Transferred" stroke="#f43f5e" fill="url(#tTransfer)" strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 2 }} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
