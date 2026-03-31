"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LayoutGrid, BarChart2, TrendingUp, RefreshCw } from "lucide-react"
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend, LabelList,
} from "recharts"
import DatePickerYMD from "./DatePickerYMD"

// ── Category display config ───────────────────────────────────────────────────
const CAT_CONFIG = {
    orders:          { label: "Orders",         color: "#3b82f6", desc: "Calls related to order status, tracking, and purchase issues" },
    refunds:         { label: "Refunds",         color: "#ef4444", desc: "Calls requesting returns, refunds, or exchanges" },
    budget_pay:      { label: "Budget Pay",      color: "#22c55e", desc: "Calls about Budget Pay plans and payment schedules" },
    policies:        { label: "Policies",        color: "#8b5cf6", desc: "Calls asking about store policies and terms of service" },
    general_inquiry: { label: "General Inquiry", color: "#f59e0b", desc: "Miscellaneous inquiries not covered by other categories" },
}

// ── Heatmap columns: which metrics to show & their rate annotations ───────────
const METRICS = [
    { key: "total_calls", label: "Total Calls", rateKey: "percentage_of_all_calls", rateSuffix: "% of all calls" },
    { key: "ai_handled",  label: "AI Handled",  rateKey: null,                      rateSuffix: "" },
    { key: "ai_solved",   label: "AI Solved",   rateKey: "ai_solved_rate",          rateSuffix: "% solved rate" },
    { key: "ai_failed",   label: "AI Failed",   rateKey: "ai_failed_rate",          rateSuffix: "% fail rate" },
    { key: "transferred", label: "Transferred", rateKey: "transfer_rate",           rateSuffix: "% transfer rate" },
]

// ── Colors for the grouped bar chart ─────────────────────────────────────────
const METRIC_BAR_COLORS = {
    "AI Handled":  "#60a5fa",
    "AI Solved":   "#34d399",
    "AI Failed":   "#f87171",
    "Transferred": "#a78bfa",
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function hexToRgba(hex, alpha) {
    const n = parseInt(hex.replace("#", ""), 16)
    return `rgba(${(n >> 16) & 0xff},${(n >> 8) & 0xff},${n & 0xff},${alpha})`
}

// ── Heatmap view ──────────────────────────────────────────────────────────────
function HeatmapView({ rows }) {
    const [hovered, setHovered] = useState(null)

    // Per-column max normalization so low-count categories still show contrast
    const colMax = METRICS.reduce((acc, m) => {
        acc[m.key] = Math.max(...rows.map((r) => r.data[m.key] ?? 0), 1)
        return acc
    }, {})

    return (
        <div>
            <div className="overflow-x-auto">
                <div style={{ minWidth: 560 }}>
                    {/* Column header row */}
                    <div className="flex items-end mb-1">
                        <div className="w-44 shrink-0" />
                        {METRICS.map((m) => (
                            <div
                                key={m.key}
                                className="flex-1 text-center text-xs font-medium text-muted-foreground pb-2 px-0.5 leading-tight"
                            >
                                {m.label}
                            </div>
                        ))}
                    </div>

                    {/* Data rows */}
                    {rows.map((row) => {
                        const { key, label, color, desc } = row
                        return (
                            <div key={key} className="flex items-center mb-1.5">
                                {/* Row label */}
                                <div
                                    className="w-44 shrink-0 flex items-center gap-2 pr-3 cursor-default group"
                                    onMouseEnter={() =>
                                        setHovered({ kind: "label", key, label, color, desc, pct: row.data.percentage_of_all_calls })
                                    }
                                    onMouseLeave={() => setHovered(null)}
                                >
                                    <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: color }} />
                                    <span className="text-xs font-medium text-foreground truncate group-hover:underline group-hover:decoration-dotted">
                                        {label}
                                    </span>
                                </div>

                                {/* Cells */}
                                {METRICS.map((m) => {
                                    const val = row.data[m.key] ?? 0
                                    const isHot =
                                        hovered?.kind === "cell" &&
                                        hovered.rowKey === key &&
                                        hovered.metricKey === m.key
                                    const intensity = val === 0 ? 0 : 0.18 + (val / colMax[m.key]) * 0.72
                                    const rate = m.rateKey ? row.data[m.rateKey] : null

                                    return (
                                        <div
                                            key={m.key}
                                            className="flex-1 mx-0.5 h-11 rounded-lg flex items-center justify-center cursor-default select-none"
                                            style={{
                                                backgroundColor: val === 0
                                                    ? "rgba(100,116,139,0.07)"
                                                    : hexToRgba(color, intensity),
                                                boxShadow: isHot
                                                    ? `inset 0 0 0 2px ${color}`
                                                    : "inset 0 0 0 2px transparent",
                                                transition: "box-shadow 0.12s",
                                            }}
                                            onMouseEnter={() =>
                                                setHovered({ kind: "cell", rowKey: key, metricKey: m.key, label, metric: m.label, val, rate, rateSuffix: m.rateSuffix, color })
                                            }
                                            onMouseLeave={() => setHovered(null)}
                                        >
                                            <span
                                                className="text-sm font-bold tabular-nums"
                                                style={{
                                                    color: val === 0
                                                        ? "rgba(100,116,139,0.35)"
                                                        : val / colMax[m.key] > 0.5 ? "#fff" : color,
                                                }}
                                            >
                                                {val === 0 ? "—" : val}
                                            </span>
                                        </div>
                                    )
                                })}

                            </div>
                        )
                    })}

                    {/* Column totals footer */}
                    <div className="flex items-center mt-3 pt-3 border-t border-border">
                        <div className="w-44 shrink-0 text-xs font-semibold text-muted-foreground pr-3">
                            All Categories
                        </div>
                        {METRICS.map((m) => {
                            const colTotal = rows.reduce((sum, r) => sum + (r.data[m.key] ?? 0), 0)
                            return (
                                <div key={m.key} className="flex-1 mx-0.5 h-11 rounded-lg bg-muted/40 flex items-center justify-center">
                                    <span className="text-sm font-bold text-foreground tabular-nums">{colTotal}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Tooltip strip — outside scroll container to prevent layout shifts */}
            <div className="mt-4 min-h-10 flex items-start">
                {hovered?.kind === "cell" && hovered.val > 0 ? (
                    <div
                        className="px-3 py-2 rounded-lg border"
                        style={{
                            borderColor: hexToRgba(hovered.color, 0.4),
                            backgroundColor: hexToRgba(hovered.color, 0.08),
                        }}
                    >
                        <div className="text-sm">
                            <span className="font-semibold" style={{ color: hovered.color }}>{hovered.label}</span>
                            <span className="text-muted-foreground"> — {hovered.metric}: </span>
                            <span className="font-bold text-foreground">{hovered.val}</span>
                            {hovered.rate != null && (
                                <span className="text-muted-foreground ml-1 text-xs">
                                    ({hovered.rate.toFixed(1)}{hovered.rateSuffix})
                                </span>
                            )}
                        </div>
                    </div>
                ) : hovered?.kind === "label" ? (
                    <div
                        className="px-3 py-2 rounded-lg border"
                        style={{
                            borderColor: hexToRgba(hovered.color, 0.4),
                            backgroundColor: hexToRgba(hovered.color, 0.08),
                        }}
                    >
                        <div className="text-sm font-semibold" style={{ color: hovered.color }}>
                            {hovered.label}
                            {hovered.pct != null && (
                                <span className="ml-2 text-xs font-normal text-muted-foreground">
                                    {hovered.pct.toFixed(1)}% of all calls
                                </span>
                            )}
                        </div>
                        {hovered.desc && (
                            <div className="text-xs text-muted-foreground mt-0.5">{hovered.desc}</div>
                        )}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground/50 italic pt-1">
                        Hover a row label or cell to see details
                    </p>
                )}
            </div>
        </div>
    )
}

// ── Grouped bar chart tooltip ─────────────────────────────────────────────────
function GroupedTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null
    const visible = payload.filter((p) => p.value > 0).sort((a, b) => b.value - a.value)
    return (
        <div className="bg-background border border-border rounded-xl px-4 py-3 shadow-xl text-xs min-w-44">
            <p className="font-semibold text-foreground mb-2">{label}</p>
            {visible.map((p) => (
                <div key={p.dataKey} className="flex justify-between gap-4 mb-0.5">
                    <span style={{ color: p.fill }} className="font-medium">{p.dataKey}</span>
                    <b className="text-foreground">{p.value}</b>
                </div>
            ))}
        </div>
    )
}

// ── Grouped bar chart view ────────────────────────────────────────────────────
function GroupedBarView({ rows }) {
    const chartData = rows.map((row) => ({
        category:      row.label,
        "AI Handled":  row.data.ai_handled  ?? 0,
        "AI Solved":   row.data.ai_solved   ?? 0,
        "AI Failed":   row.data.ai_failed   ?? 0,
        "Transferred": row.data.transferred ?? 0,
    }))

    return (
        <ResponsiveContainer width="100%" height={340}>
            <BarChart
                data={chartData}
                margin={{ top: 20, right: 12, left: 0, bottom: 0 }}
                barCategoryGap="28%"
                barGap={3}
            >
                <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                <XAxis dataKey="category" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<GroupedTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                {Object.entries(METRIC_BAR_COLORS).map(([name, color]) => (
                    <Bar key={name} dataKey={name} fill={color} radius={[4, 4, 0, 0]}>
                        <LabelList
                            dataKey={name}
                            position="top"
                            style={{ fontSize: 10, fill: color, fontWeight: 600 }}
                            formatter={(v) => (v > 0 ? v : "")}
                        />
                    </Bar>
                ))}
            </BarChart>
        </ResponsiveContainer>
    )
}

// ── Category legend ───────────────────────────────────────────────────────────
function CategoryLegend({ rows }) {
    return (
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-4 pt-4 border-t border-border">
            {rows.map((row) => (
                <div key={row.key} className="flex items-center gap-1.5 text-xs">
                    <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: row.color }} />
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="font-semibold tabular-nums" style={{ color: row.color }}>
                        {row.data.total_calls}
                    </span>
                    <span className="text-muted-foreground/60">
                        ({row.data.percentage_of_all_calls?.toFixed(1)}%)
                    </span>
                </div>
            ))}
        </div>
    )
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function CategoryBreakdown({
    data,
    loading,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    onFetch,
}) {
    const rows = Object.entries(data?.categories ?? {})
        .map(([key, catData]) => ({
            key,
            label: CAT_CONFIG[key]?.label ?? key,
            color: CAT_CONFIG[key]?.color ?? "#94a3b8",
            desc:  CAT_CONFIG[key]?.desc  ?? "",
            data:  catData,
        }))
        .filter((r) => r.data.total_calls > 0)

    const totalCalls = data?.summary?.total_calls ?? 0

    return (
        <Card className="mb-8">
            <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2 mb-1">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            Category Breakdown
                        </CardTitle>
                        <CardDescription>
                            {totalCalls > 0 ? (
                                <>
                                    <span className="font-semibold text-foreground">{totalCalls}</span>
                                    {" total calls across all categories"}
                                </>
                            ) : (
                                "AI handling and transfer metrics by call category"
                            )}
                            {/* Date range label — re-enable when date filter is uncommented
                            {startDate && endDate && (
                                <span className="ml-2 text-xs font-medium text-primary">
                                    ({startDate} → {endDate})
                                </span>
                            )}
                            */}
                        </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={onFetch} disabled={loading}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {/* Date filter — commented out, showing overall data for now
                <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
                    <DatePickerYMD label="Start Date" value={startDate} onChange={setStartDate} />
                    <DatePickerYMD label="End Date"   value={endDate}   onChange={setEndDate} />
                    <div className="flex items-end">
                        <Button onClick={onFetch} disabled={loading} className="w-full sm:w-auto">
                            {loading ? "Loading..." : "Search"}
                        </Button>
                    </div>
                </div>
                */}

                {loading ? (
                    <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
                        Loading…
                    </div>
                ) : !data || rows.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
                        No category data available
                    </div>
                ) : (
                    <Tabs defaultValue="heatmap">
                        <TabsList className="mb-5">
                            <TabsTrigger value="heatmap" className="flex items-center gap-1.5">
                                <LayoutGrid className="w-3.5 h-3.5" />
                                Heatmap
                            </TabsTrigger>
                            <TabsTrigger value="grouped" className="flex items-center gap-1.5">
                                <BarChart2 className="w-3.5 h-3.5" />
                                Grouped View
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="heatmap">
                            <HeatmapView rows={rows} />
                            <CategoryLegend rows={rows} />
                        </TabsContent>

                        <TabsContent value="grouped">
                            <GroupedBarView rows={rows} />
                            <CategoryLegend rows={rows} />
                        </TabsContent>
                    </Tabs>
                )}
            </CardContent>
        </Card>
    )
}
