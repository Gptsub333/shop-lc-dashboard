"use client"

import { useState, useEffect, useRef } from "react"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import ProtectedRoute from "@/components/ProtectedRoute"
import Pie3DChart from "@/components/Pie3DChart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Phone, PhoneCall, Activity, RefreshCw, Brain,
    TrendingUp, PhoneForwarded, CheckCircle2, XCircle,
    Users, HelpCircle, BarChart2, Zap, BarChart3,
    GitBranch, Grid3X3,
} from "lucide-react"
import {
    BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell,
    AreaChart, Area, CartesianGrid, ReferenceLine,
    LabelList,
} from "recharts"

const backend_url = process.env.NEXT_PUBLIC_API_URL

function getTodayCSTString() {
    const now = new Date()
    const cstString = now.toLocaleString("en-US", { timeZone: "America/Chicago" })
    const cstDate = new Date(cstString)
    const year = cstDate.getFullYear()
    const month = String(cstDate.getMonth() + 1).padStart(2, "0")
    const day = String(cstDate.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
}

function deriveSubconcernSubs(subconcernData) {
    const avaMap = {}
    const transferMap = {}
    Object.values(subconcernData?.categories ?? {}).forEach((cat) => {
        Object.entries(cat.sub_concerns ?? {}).forEach(([name, sc]) => {
            if (sc.ai_handled > 0) avaMap[name] = (avaMap[name] ?? 0) + sc.ai_handled
            if (sc.transferred > 0) transferMap[name] = (transferMap[name] ?? 0) + sc.transferred
        })
    })
    const toSorted = (map) =>
        Object.entries(map)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
    return { avaVoiceSubs: toSorted(avaMap), transferredSubs: toSorted(transferMap) }
}

// ── Hourly chart helpers ────────────────────────────────────────────────────
const HOURS = [
    "12am","1am","2am","3am","4am","5am",
    "6am","7am","8am","9am","10am","11am",
    "12pm","1pm","2pm","3pm","4pm","5pm",
    "6pm","7pm","8pm","9pm","10pm","11pm",
]

const TIME_PERIODS = [
    { label: "Night",     hours: [0,1,2,3,4,5]     },
    { label: "Morning",   hours: [6,7,8,9,10,11]   },
    { label: "Afternoon", hours: [12,13,14,15,16,17] },
    { label: "Evening",   hours: [18,19,20,21,22,23] },
]

function buildHourlyData(aiSummaryData) {
    if (!aiSummaryData) return []
    const daily = aiSummaryData.daily || []
    const peakHours = daily.length === 1
        ? daily[0].peak_hour_calls
        : aiSummaryData.totals_peak_hour_calls
    if (!peakHours || peakHours.length !== 24) return []
    return HOURS.map((label, i) => ({ hour: label, calls: peakHours[i] ?? 0 }))
}

// ── Call Flow Diagram ────────────────────────────────────────────────────────
function lightBadgeBg(hex) {
    const n = parseInt(hex.replace("#", ""), 16)
    const r = Math.round(((n >> 16) & 0xff) * 0.18 + 237)
    const g = Math.round(((n >> 8)  & 0xff) * 0.18 + 237)
    const b = Math.round(((n)       & 0xff) * 0.18 + 237)
    return `rgb(${r},${g},${b})`
}

function CallFlowDiagram({ totals }) {
    if (!totals) return null

    const pcts        = totals.percentages
    const uncategorized = Math.max(0, totals.ai_handled_total - (totals.ai_solved_total + totals.ai_failed_total))
    const uncatPct    = totals.ai_handled_total > 0
        ? parseFloat(((uncategorized / totals.ai_handled_total) * 100).toFixed(1))
        : 0
    const deflPct     = parseFloat((100 - (pcts?.transferred_overall ?? 0)).toFixed(1))

    const W = 760, BW = 126, BH = 62, H_GAP = 10, V_GAP = 72

    // Row 3: 5 nodes (left-to-right)
    const r3W     = 5 * BW + 4 * H_GAP
    const r3Start = (W - r3W) / 2
    const r3cx    = [0, 1, 2, 3, 4].map((i) => r3Start + i * (BW + H_GAP) + BW / 2)

    // Row 2: Transferred centers over nodes 0-1; AI Deflected centers over nodes 2-4
    const r2cx = [(r3cx[0] + r3cx[1]) / 2, (r3cx[2] + r3cx[4]) / 2]

    // Row 1: Total Calls centers over both row-2 nodes
    const r1cx = [(r2cx[0] + r2cx[1]) / 2]

    // Y tops
    const y1 = 14
    const y2 = y1 + BH + V_GAP
    const y3 = y2 + BH + V_GAP
    const SVG_H = y3 + BH + 22

    const nodes = [
        { id: "total", cx: r1cx[0], y: y1, label: "Total Calls",    value: totals.total_calls,                   pct: "100%",               color: "#06b6d4" },
        { id: "xfer",  cx: r2cx[0], y: y2, label: "Transferred",    value: totals.transferred_total,             pct: `${pcts?.transferred_overall ?? 0}%`,  color: "#f59e0b" },
        { id: "defl",  cx: r2cx[1], y: y2, label: "AI Deflected",   value: totals.ai_handled_total,              pct: `${deflPct}%`,        color: "#8b5cf6" },
        { id: "ureq",  cx: r3cx[0], y: y3, label: "User Requested", value: totals.user_requested_transfer_total, pct: `${pcts?.user_requested_transfer_overall ?? 0}%`, color: "#f97316" },
        { id: "ainit", cx: r3cx[1], y: y3, label: "AI Initiated",   value: totals.ai_initiated_transfer_total,   pct: `${pcts?.ai_initiated_transfer_overall ?? 0}%`,  color: "#eab308" },
        { id: "solv",  cx: r3cx[2], y: y3, label: "AI Solved",      value: totals.ai_solved_total,               pct: `${pcts?.ai_solved_of_ai_handled ?? 0}%`,        color: "#22c55e" },
        { id: "unres", cx: r3cx[3], y: y3, label: "AI Unresolved",  value: totals.ai_failed_total,               pct: `${pcts?.ai_failed_of_ai_handled ?? 0}%`,        color: "#ef4444" },
        { id: "uncat", cx: r3cx[4], y: y3, label: "Uncategorized",  value: uncategorized,                        pct: `${uncatPct}%`,       color: "#64748b" },
    ]

    const edges = [
        { from: "total", to: "xfer",  label: `${pcts?.transferred_overall ?? 0}%`              },
        { from: "total", to: "defl",  label: `${deflPct}%`                                     },
        { from: "xfer",  to: "ureq",  label: `${pcts?.user_requested_transfer_overall ?? 0}%`  },
        { from: "xfer",  to: "ainit", label: `${pcts?.ai_initiated_transfer_overall ?? 0}%`    },
        { from: "defl",  to: "solv",  label: `${pcts?.ai_solved_of_ai_handled ?? 0}%`          },
        { from: "defl",  to: "unres", label: `${pcts?.ai_failed_of_ai_handled ?? 0}%`          },
        { from: "defl",  to: "uncat", label: `${uncatPct}%`                                    },
    ]

    const nm = Object.fromEntries(nodes.map((n) => [n.id, n]))

    function pathD(a, b) {
        const x1 = a.cx, yA = a.y + BH
        const x2 = b.cx, yB = b.y
        const my = (yA + yB) / 2
        return `M ${x1} ${yA} C ${x1} ${my}, ${x2} ${my}, ${x2} ${yB}`
    }

    return (
        <svg viewBox={`0 0 ${W} ${SVG_H}`} width="100%" style={{ overflow: "visible" }} aria-label="Call flow diagram">
            {/* Edges */}
            {edges.map(({ from, to, label }) => {
                const a = nm[from], b = nm[to]
                const mx = (a.cx + b.cx) / 2
                const my = (a.y + BH + b.y) / 2
                return (
                    <g key={`${from}-${to}`}>
                        <path d={pathD(a, b)} fill="none" stroke={b.color} strokeWidth="1.8" strokeOpacity="0.35" />
                        {/* percentage badge on edge */}
                        <rect x={mx - 19} y={my - 9} width={38} height={17} rx={5}
                              fill={lightBadgeBg(b.color)} stroke={b.color} strokeOpacity="0.55" strokeWidth="1" />
                        <text x={mx} y={my + 3.5} textAnchor="middle" fontSize="9.5" fontWeight="700"
                              fill={b.color} fontFamily="system-ui,sans-serif">
                            {label}
                        </text>
                    </g>
                )
            })}

            {/* Nodes */}
            {nodes.map((n) => (
                <g key={n.id}>
                    <rect x={n.cx - BW / 2} y={n.y} width={BW} height={BH} rx={11}
                          fill={`${n.color}14`} stroke={n.color} strokeWidth="1.5" strokeOpacity="0.6" />
                    {/* count */}
                    <text x={n.cx} y={n.y + 27} textAnchor="middle" fontSize="22" fontWeight="800"
                          fill={n.color} fontFamily="system-ui,sans-serif">
                        {n.value}
                    </text>
                    {/* label */}
                    <text x={n.cx} y={n.y + 44} textAnchor="middle" fontSize="10.5" fill="#94a3b8"
                          fontFamily="system-ui,sans-serif">
                        {n.label}
                    </text>
                </g>
            ))}
        </svg>
    )
}

// ── Metric Heatmap ──────────────────────────────────────────────────────────
function heatColor(score) {
    if (score >= 65) return { bg: "rgba(16,185,129,0.10)", border: "rgba(16,185,129,0.30)", text: "#10b981", bar: "#10b981", badge: "Good" }
    if (score >= 40) return { bg: "rgba(245,158,11,0.10)",  border: "rgba(245,158,11,0.30)",  text: "#f59e0b", bar: "#f59e0b", badge: "Fair" }
    return             { bg: "rgba(239,68,68,0.10)",   border: "rgba(239,68,68,0.30)",   text: "#ef4444", bar: "#ef4444", badge: "Poor" }
}

function MetricHeatmap({ rows }) {
    return (
        <div className="space-y-3">
            {rows.map((row, ri) => (
                <div key={ri} className="grid gap-3" style={{ gridTemplateColumns: `repeat(${row.length}, 1fr)` }}>
                    {row.map((cell) => {
                        const c = heatColor(cell.score)
                        return (
                            <div
                                key={cell.label}
                                className="relative rounded-xl border p-3 transition-all duration-200 hover:scale-[1.02] hover:shadow-md cursor-default"
                                style={{ background: c.bg, borderColor: c.border }}
                            >
                                <span
                                    className="absolute top-2.5 right-2.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                                    style={{ color: c.text, backgroundColor: `${c.bg}` }}
                                >
                                    {c.badge}
                                </span>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 pr-8 leading-snug">
                                    {cell.label}
                                </p>
                                <p className="text-2xl font-black leading-none mb-0.5" style={{ color: c.text }}>
                                    {cell.displayValue}
                                </p>
                                <p className="text-[10px] text-muted-foreground">{cell.sub}</p>
                                <div className="mt-2.5 h-1 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.08)" }}>
                                    <div
                                        className="h-full rounded-full"
                                        style={{ width: `${Math.min(100, cell.score)}%`, backgroundColor: c.bar, opacity: 0.7 }}
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>
            ))}
        </div>
    )
}

// ── Area chart tooltip ───────────────────────────────────────────────────────
const HourlyTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-background border border-border rounded-lg px-3 py-2 shadow-lg">
                <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                <p className="text-sm font-bold text-[#06b6d4]">{payload[0].value} calls</p>
            </div>
        )
    }
    return null
}

// ── Hourly heatmap (same style as earlier Daily CS Analytics build) ─────────
function HourlyHeatmap({ data }) {
    const maxCalls = Math.max(...data.map((d) => d.calls), 1)
    return (
        <div className="space-y-2 py-2">
            {TIME_PERIODS.map((period) => (
                <div key={period.label} className="flex items-center gap-3">
                    <span className="text-[11px] font-medium text-muted-foreground w-16 text-right shrink-0">
                        {period.label}
                    </span>
                    <div className="flex gap-1.5 flex-1">
                        {period.hours.map((hi) => {
                            const d = data[hi]
                            const intensity = d ? d.calls / maxCalls : 0
                            return (
                                <div
                                    key={hi}
                                    className="flex-1 rounded-lg flex flex-col items-center justify-center py-3 transition-all duration-150 hover:scale-105 cursor-default"
                                    style={{
                                        backgroundColor: `rgba(6,182,212,${intensity < 0.04 ? 0.04 : intensity * 0.82})`,
                                        border: `1px solid rgba(6,182,212,${intensity * 0.45 + 0.08})`,
                                    }}
                                    title={`${HOURS[hi]}: ${d?.calls ?? 0} calls`}
                                >
                                    <span className="text-[9px] text-muted-foreground leading-none">{HOURS[hi]}</span>
                                    <span
                                        className="text-sm font-bold leading-tight mt-0.5"
                                        style={{ color: intensity > 0.45 ? "#06b6d4" : "hsl(var(--foreground))" }}
                                    >
                                        {d?.calls ?? 0}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            ))}
            <div className="flex items-center justify-end gap-2 pt-2">
                <span className="text-[10px] text-muted-foreground">Low</span>
                <div className="flex gap-0.5">
                    {[0.06, 0.2, 0.4, 0.6, 0.82].map((op) => (
                        <div key={op} className="w-5 h-3 rounded-sm" style={{ backgroundColor: `rgba(6,182,212,${op})` }} />
                    ))}
                </div>
                <span className="text-[10px] text-muted-foreground">High</span>
            </div>
        </div>
    )
}

// ── Horizontal bar chart tooltip ────────────────────────────────────────────
const BarTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const d = payload[0].payload
        return (
            <div className="bg-background border border-border rounded-xl px-4 py-3 shadow-xl">
                <p className="text-xs font-semibold text-foreground mb-1">{d.name}</p>
                <p className="text-lg font-bold" style={{ color: d.color }}>{d.value} calls</p>
                <p className="text-xs text-muted-foreground">{d.pct}% of total</p>
            </div>
        )
    }
    return null
}

// ── Stat card ───────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, iconColor, label, value, sub }) {
    return (
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-background via-background to-muted/70 shadow-sm hover:shadow-lg transition-all duration-200">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-primary/10 opacity-80" />
            <div className="relative flex items-start gap-3 p-4">
                <div className={`mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center shadow-sm bg-white/70 backdrop-blur-sm ${iconColor}`}>
                    <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">{label}</p>
                    <p className="text-2xl md:text-3xl font-semibold text-foreground leading-tight">{value}</p>
                    {sub != null && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
                </div>
            </div>
        </div>
    )
}

// ── Viz toggle options ──────────────────────────────────────────────────────
const VIZ_OPTIONS = [
    { id: "area",    label: "Peak Calls", icon: Activity  },
    { id: "funnel",  label: "Tree View",  icon: GitBranch },
    { id: "bar",     label: "Bar Chart",  icon: BarChart2 },
    // { id: "heatmap", label: "Heatmap",    icon: Grid3X3   }, // not in production yet
]

// ───────────────────────────────────────────────────────────────────────────
function DailyCSAnalyticsContent() {
    const todayStr = getTodayCSTString()

    const [stats, setStats] = useState(null)
    const [statsLoading, setStatsLoading] = useState(true)
    const [activeCalls, setActiveCalls] = useState(0)
    const [activeCallsLoading, setActiveCallsLoading] = useState(false)
    const [aiSummaryData, setAiSummaryData] = useState(null)
    const [aiSummaryLoading, setAiSummaryLoading] = useState(false)
    const [subconcernData, setSubconcernData] = useState(null)
    const [vizType, setVizType] = useState("area")

    const statsCalledRef = useRef(false)
    const activeCallsCalledRef = useRef(false)
    const aiCalledRef = useRef(false)
    const subconcernCalledRef = useRef(false)

    useEffect(() => {
        if (statsCalledRef.current) return
        statsCalledRef.current = true
        setStatsLoading(true)
        fetch(`${backend_url}/api/dashboard/stats`)
            .then((r) => r.json())
            .then((data) => setStats(data))
            .catch((e) => console.error("Error fetching stats:", e))
            .finally(() => setStatsLoading(false))
    }, [])

    const fetchActiveCalls = async (force = false) => {
        if (!force && activeCallsCalledRef.current) return
        if (!force) activeCallsCalledRef.current = true
        setActiveCallsLoading(true)
        try {
            const res = await fetch(`${backend_url}/api/dashboard/active-calls`)
            const data = await res.json()
            setActiveCalls(data.count || 0)
        } catch (e) {
            console.error("Error fetching active calls:", e)
        } finally {
            setActiveCallsLoading(false)
        }
    }

    const fetchAISummary = async (force = false) => {
        if (!force && aiCalledRef.current) return
        if (!force) aiCalledRef.current = true
        setAiSummaryLoading(true)
        try {
            const res = await fetch(
                `${backend_url}/api/dashboard/ai-summary?start_date=${todayStr}&end_date=${todayStr}`
            )
            const data = await res.json()
            setAiSummaryData(data)
        } catch (e) {
            console.error("Error fetching AI summary:", e)
        } finally {
            setAiSummaryLoading(false)
        }
    }

    const fetchSubconcern = async () => {
        if (subconcernCalledRef.current) return
        subconcernCalledRef.current = true
        try {
            const res = await fetch(
                `${backend_url}/api/dashboard/analytics/subconcern-breakdown?today_only=true`
            )
            if (!res.ok) return
            const data = await res.json()
            setSubconcernData(data)
        } catch (e) {
            console.error("Error fetching subconcern:", e)
        }
    }

    useEffect(() => {
        fetchActiveCalls()
        fetchAISummary()
        fetchSubconcern()
    }, [])

    // ── Calls Overview ────────────────────────────────────────────────────
    const callsToday = stats?.calls_today ?? 0
    const routedToday = stats?.routed_calls_today ?? 0
    const aiHandledToday = Math.max(0, callsToday - routedToday)
    const totalToday = aiHandledToday + routedToday
    const { avaVoiceSubs, transferredSubs } = deriveSubconcernSubs(subconcernData)

    const pie3DData = [
        { name: "Ava Voice", value: aiHandledToday, fill: "#8b5cf6", subs: avaVoiceSubs },
        { name: "Transferred to Human", value: routedToday, fill: "#3b82f6", subs: transferredSubs },
    ].filter((d) => d.value > 0)

    const legendItems = pie3DData.map((d) => ({
        ...d,
        pct: totalToday > 0 ? (d.value / totalToday) * 100 : 0,
    }))

    // ── Today's AI Efficiency ─────────────────────────────────────────────
    const totals = aiSummaryData?.totals
    const pcts = totals?.percentages
    const aiDeflected = totals?.ai_handled_total ?? 0
    const totalCalls = totals?.total_calls ?? 0
    const deflectionRate =
        totalCalls > 0 ? ((aiDeflected / totalCalls) * 100).toFixed(1) : "0.0"
    const deflectionPct = parseFloat(deflectionRate)

    const efficiencyDonutData = [
        { name: "AI Deflected", value: deflectionPct, fill: "#8b5cf6" },
        { name: "Not Deflected", value: Math.max(0, 100 - deflectionPct), fill: "#e2e8f0" },
    ]

    const uncategorized = totals
        ? Math.max(0, totals.ai_handled_total - (totals.ai_solved_total + totals.ai_failed_total))
        : 0

    // ── Derived viz data ──────────────────────────────────────────────────
    const barData = totals
        ? [
              { name: "Total Calls",       value: totals.total_calls,                      pct: 100,                                                         color: "#06b6d4" },
              { name: "AI Deflected",      value: totals.ai_handled_total,                 pct: parseFloat((100 - (pcts?.transferred_overall ?? 0)).toFixed(1)), color: "#8b5cf6" },
              { name: "Transferred",       value: totals.transferred_total,                pct: pcts?.transferred_overall ?? 0,                               color: "#f59e0b" },
              { name: "AI Solved",         value: totals.ai_solved_total,                  pct: pcts?.ai_solved_of_ai_handled ?? 0,                           color: "#22c55e" },
              { name: "AI Unresolved",     value: totals.ai_failed_total,                  pct: pcts?.ai_failed_of_ai_handled ?? 0,                           color: "#f43f5e" },
              { name: "User Requested",    value: totals.user_requested_transfer_total,     pct: pcts?.user_requested_transfer_overall ?? 0,                   color: "#f97316" },
              { name: "AI Initiated",      value: totals.ai_initiated_transfer_total,       pct: pcts?.ai_initiated_transfer_overall ?? 0,                     color: "#ec4899" },
          ]
        : []

    // ── Hourly data for area chart ────────────────────────────────────────
    const hourlyData = buildHourlyData(aiSummaryData)
    const peakEntry  = hourlyData.reduce(
        (max, d) => (d.calls > max.calls ? d : max),
        { calls: 0, hour: "" }
    )

    // ── Metric heatmap rows (2 rows × 5 cols = 10 metrics) ───────────────
    const aiSolvedRate   = pcts?.ai_solved_of_ai_handled ?? 0
    const unresolvedPct  = totals && totals.ai_handled_total > 0
        ? parseFloat(((totals.ai_failed_total / totals.ai_handled_total) * 100).toFixed(1))
        : 0
    const uncatPct = totals && totalCalls > 0
        ? parseFloat(((uncategorized / totalCalls) * 100).toFixed(1))
        : 0

    const heatmapRows = totals
        ? [
              [
                  { label: "Total Calls",     displayValue: totalCalls,                             sub: "today",                    score: 50                                         },
                  { label: "Transferred",     displayValue: totals.transferred_total,               sub: `${pcts?.transferred_overall ?? 0}% of total`,          score: 100 - (pcts?.transferred_overall ?? 0)        },
                  { label: "User Requested",  displayValue: totals.user_requested_transfer_total,   sub: `${pcts?.user_requested_transfer_overall ?? 0}% of total`, score: 100 - (pcts?.user_requested_transfer_overall ?? 0) },
                  { label: "AI Initiated",    displayValue: totals.ai_initiated_transfer_total,     sub: `${pcts?.ai_initiated_transfer_overall ?? 0}% of total`, score: 100 - (pcts?.ai_initiated_transfer_overall ?? 0)   },
                  { label: "AI Deflected",    displayValue: totals.ai_handled_total,                sub: "no human needed",          score: deflectionPct                              },
              ],
              [
                  { label: "AI Solved",       displayValue: totals.ai_solved_total,                 sub: "fully resolved by AI",     score: aiSolvedRate                               },
                  { label: "AI Unresolved",   displayValue: totals.ai_failed_total,                 sub: `${unresolvedPct}% of AI deflected`, score: 100 - unresolvedPct                },
                  { label: "Uncategorized",   displayValue: uncategorized,                          sub: "hang-up / no response",    score: 100 - uncatPct                             },
                  { label: "AI Solved Rate",  displayValue: `${aiSolvedRate}%`,                     sub: "resolution success rate",  score: aiSolvedRate                               },
                  { label: "AI Deflected Rate", displayValue: `${deflectionRate}%`,                 sub: "deflected out of total",   score: deflectionPct                              },
              ],
          ]
        : []

    return (
        <div className="flex h-screen bg-background">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header
                    title="Daily's CS Analytics"
                    subtitle={`Live metrics for today — ${todayStr}`}
                />

                <main className="flex-1 overflow-y-auto p-8">

                    {/* ── 3 KPI Cards ─────────────────────────────────────── */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <Card className="relative overflow-hidden border-l-4 border-l-green-500">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="text-sm font-medium text-muted-foreground">Active Calls</p>
                                            <button
                                                type="button"
                                                onClick={() => fetchActiveCalls(true)}
                                                className="inline-flex items-center justify-center rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition"
                                                aria-label="Refresh active calls"
                                            >
                                                <RefreshCw className={`w-4 h-4 ${activeCallsLoading ? "animate-spin" : ""}`} />
                                            </button>
                                        </div>
                                        <p className="text-3xl font-bold text-foreground">{activeCalls}</p>
                                        <p className="text-xs text-muted-foreground mt-2">Currently in progress</p>
                                    </div>
                                    <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center">
                                        <PhoneCall className="w-7 h-7 text-green-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="relative overflow-hidden border-l-4 border-l-blue-500">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">Calls Today</p>
                                        <p className="text-3xl font-bold text-foreground">
                                            {statsLoading ? "—" : stats?.calls_today ?? 0}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-2">Since midnight</p>
                                    </div>
                                    <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center">
                                        <Phone className="w-7 h-7 text-blue-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="relative overflow-hidden border-l-4 border-l-purple-500">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">Hours Spoken Today</p>
                                        <p className="text-3xl font-bold text-foreground">
                                            {statsLoading ? "—" : stats?.hours_talked_today ?? "0h 0m"}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-2">Active conversation time</p>
                                    </div>
                                    <div className="w-14 h-14 rounded-full bg-purple-500/10 flex items-center justify-center">
                                        <Activity className="w-7 h-7 text-purple-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* ── Calls Overview + AI Efficiency ──────────────────── */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Calls Overview */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-primary" />
                                    Calls Overview
                                </CardTitle>
                                <CardDescription>Today: Ava Voice vs Transferred to Human Agent</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {totalToday > 0 ? (
                                    <>
                                        <Pie3DChart data={pie3DData} height={280} />
                                        <div className="flex flex-wrap justify-center gap-6 mt-4">
                                            {legendItems.map((item) => (
                                                <div key={item.name} className="flex items-center gap-2">
                                                    <span
                                                        className="inline-block w-3 h-3 rounded-sm flex-shrink-0"
                                                        style={{ backgroundColor: item.fill }}
                                                    />
                                                    <span className="text-sm text-muted-foreground">{item.name}</span>
                                                    <span className="text-sm font-semibold text-foreground">
                                                        {item.pct.toFixed(1)}%
                                                    </span>
                                                    <span className="text-sm font-medium text-muted-foreground">
                                                        ({item.value})
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center h-64 text-muted-foreground">
                                        No calls today
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Today's AI Efficiency */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-primary" />
                                    Today's AI Efficiency
                                </CardTitle>
                                <CardDescription>AI deflection rate for today</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {aiSummaryLoading ? (
                                    <div className="flex items-center justify-center h-64">
                                        <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-5">
                                        <div className="relative w-52 h-52">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={efficiencyDonutData}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={66}
                                                        outerRadius={88}
                                                        startAngle={90}
                                                        endAngle={-270}
                                                        dataKey="value"
                                                        strokeWidth={0}
                                                    >
                                                        {efficiencyDonutData.map((entry, i) => (
                                                            <Cell key={i} fill={entry.fill} />
                                                        ))}
                                                    </Pie>
                                                </PieChart>
                                            </ResponsiveContainer>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                <p className="text-4xl font-black text-purple-500">{deflectionRate}%</p>
                                                <p className="text-xs text-muted-foreground mt-1">Deflection Rate</p>
                                            </div>
                                        </div>
                                        <div className="w-full grid grid-cols-2 gap-3">
                                            <div className="flex flex-col items-center p-3 rounded-xl bg-purple-500/5 border border-purple-500/20">
                                                <p className="text-2xl font-bold text-purple-500">{aiDeflected}</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">AI Deflected</p>
                                            </div>
                                            <div className="flex flex-col items-center p-3 rounded-xl bg-muted/50 border border-border">
                                                <p className="text-2xl font-bold text-foreground">{totalCalls}</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">Total Calls</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* ── AI Performance Summary ───────────────────────────── */}
                    <Card className="mb-8 border-2 border-primary/20">
                        <CardHeader>
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div>
                                    <CardTitle className="flex items-center gap-2 mb-1">
                                        <Brain className="w-6 h-6 text-primary" />
                                        AI Performance Summary
                                    </CardTitle>
                                    <CardDescription>
                                        Today's AI handling metrics and call flow analysis
                                        <span className="ml-2 text-xs font-medium text-primary">({todayStr})</span>
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-3">
                                    {/* Viz toggle pills */}
                                    <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/60 border border-border">
                                        {VIZ_OPTIONS.map((opt) => {
                                            const Icon = opt.icon
                                            const active = vizType === opt.id
                                            return (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => setVizType(opt.id)}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                                                        active
                                                            ? "bg-background shadow-sm text-foreground border border-border"
                                                            : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                                                    }`}
                                                >
                                                    <Icon className="w-3.5 h-3.5" />
                                                    {opt.label}
                                                </button>
                                            )
                                        })}
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => fetchAISummary(true)}
                                        disabled={aiSummaryLoading}
                                    >
                                        <RefreshCw className={`w-4 h-4 mr-2 ${aiSummaryLoading ? "animate-spin" : ""}`} />
                                        Refresh
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent>
                            {aiSummaryLoading ? (
                                <div className="space-y-4">
                                    <div className="h-72 rounded-xl bg-muted/30 animate-pulse" />
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                        {Array.from({ length: 10 }).map((_, i) => (
                                            <div key={i} className="h-20 rounded-xl bg-muted/30 animate-pulse" />
                                        ))}
                                    </div>
                                </div>
                            ) : !aiSummaryData ? (
                                <div className="text-center py-20 bg-muted/10 rounded-2xl border border-border/40">
                                    <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
                                    <p className="text-muted-foreground font-medium">No data available for today yet</p>
                                    <p className="text-sm text-muted-foreground mt-1">Data will appear once calls are recorded</p>
                                </div>
                            ) : (
                                <div className="space-y-8">

                                    {/* ── Peak Calls Area Chart (default) ───────────── */}
                                    {vizType === "area" && (
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <p className="text-sm font-semibold text-foreground">Intraday Call Volume (Pattern)</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Estimated call distribution across 24 hours
                                                        {peakEntry.calls > 0 && (
                                                            <span className="ml-2 text-primary font-medium">
                                                                · Peak: {peakEntry.hour} ({peakEntry.calls} calls)
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="rounded-xl overflow-hidden border bg-card">
                                                <ResponsiveContainer width="100%" height={240}>
                                                    <AreaChart data={hourlyData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                                                        <defs>
                                                            <linearGradient id="callsGradientDaily" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.35} />
                                                                <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" opacity={0.08} vertical={false} />
                                                        <XAxis
                                                            dataKey="hour"
                                                            tick={{ fontSize: 10 }}
                                                            tickLine={false}
                                                            axisLine={false}
                                                            interval={2}
                                                        />
                                                        <YAxis
                                                            tick={{ fontSize: 10 }}
                                                            tickLine={false}
                                                            axisLine={false}
                                                            width={32}
                                                        />
                                                        <Tooltip content={<HourlyTooltip />} />
                                                        {peakEntry.calls > 0 && (
                                                            <ReferenceLine
                                                                x={peakEntry.hour}
                                                                stroke="#f59e0b"
                                                                strokeDasharray="4 4"
                                                                strokeWidth={1.5}
                                                                label={{ value: "Peak", position: "top", fontSize: 10, fill: "#f59e0b" }}
                                                            />
                                                        )}
                                                        <Area
                                                            type="monotone"
                                                            dataKey="calls"
                                                            stroke="#06b6d4"
                                                            strokeWidth={2.5}
                                                            fill="url(#callsGradientDaily)"
                                                            dot={false}
                                                            activeDot={{ r: 4, fill: "#06b6d4", stroke: "white", strokeWidth: 2 }}
                                                        />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    )}

                                    {/* ── Call Flow Diagram ──────────────────────────── */}
                                    {vizType === "funnel" && (
                                        <div>
                                            <div className="flex items-center gap-2 mb-5">
                                                <GitBranch className="w-4 h-4 text-muted-foreground" />
                                                <p className="text-sm font-semibold text-foreground">Call Flow — Tree View</p>
                                                <span className="text-xs text-muted-foreground">— how today's calls were routed at each stage</span>
                                            </div>
                                            <div className="py-2 px-2">
                                                <CallFlowDiagram totals={totals} />
                                            </div>
                                        </div>
                                    )}

                                    {/* ── Bar Chart ──────────────────────────────────── */}
                                    {vizType === "bar" && (
                                        <div>
                                            <div className="flex items-center gap-2 mb-5">
                                                <BarChart2 className="w-4 h-4 text-muted-foreground" />
                                                <p className="text-sm font-semibold text-foreground">Call Metrics Breakdown</p>
                                                <span className="text-xs text-muted-foreground">— volume and percentage per metric</span>
                                            </div>
                                            <div className="rounded-xl border bg-card overflow-hidden">
                                                <ResponsiveContainer width="100%" height={300}>
                                                    <BarChart
                                                        layout="vertical"
                                                        data={barData}
                                                        margin={{ top: 8, right: 100, left: 10, bottom: 8 }}
                                                        barCategoryGap="28%"
                                                    >
                                                        <XAxis type="number" domain={[0, totals?.total_calls ?? 1]} hide />
                                                        <YAxis
                                                            type="category"
                                                            dataKey="name"
                                                            width={140}
                                                            tick={{ fontSize: 12 }}
                                                            axisLine={false}
                                                            tickLine={false}
                                                        />
                                                        <Tooltip content={<BarTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} />
                                                        <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={18}>
                                                            {barData.map((entry, i) => (
                                                                <Cell key={i} fill={entry.color} fillOpacity={0.85} />
                                                            ))}
                                                            <LabelList
                                                                dataKey="value"
                                                                position="right"
                                                                formatter={(v) => `${v}`}
                                                                style={{ fontSize: 13, fontWeight: 700, fill: "hsl(var(--foreground))" }}
                                                            />
                                                        </Bar>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                            {/* Pct annotations */}
                                            <div className="flex flex-wrap gap-2 mt-4">
                                                {barData.map((d) => (
                                                    <span
                                                        key={d.name}
                                                        className="text-xs px-2.5 py-1 rounded-full font-medium"
                                                        style={{ color: d.color, backgroundColor: `${d.color}18` }}
                                                    >
                                                        {d.name}: {d.pct}%
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* ── Heatmap (call metrics) — not in production yet ──
                                    {vizType === "heatmap" && (
                                        <div>
                                            <div className="flex items-center gap-2 mb-5 flex-wrap">
                                                <Grid3X3 className="w-4 h-4 text-muted-foreground" />
                                                <p className="text-sm font-semibold text-foreground">Performance Heatmap</p>
                                                <span className="text-xs text-muted-foreground">— color reflects performance level</span>
                                                <div className="flex items-center gap-4 ml-auto text-[10px] text-muted-foreground">
                                                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm inline-block bg-emerald-500" />Good ≥65</span>
                                                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm inline-block bg-amber-500"  />Fair 40–64</span>
                                                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm inline-block bg-red-500"    />Poor &lt;40</span>
                                                </div>
                                            </div>
                                            <MetricHeatmap rows={heatmapRows} />
                                        </div>
                                    )}
                                    ── end heatmap ── */}

                                    {/* ── Stat cards grid (always visible) ────────────── */}
                                    {totals && (
                                        <div className="pt-2 border-t border-border/50">
                                            <p className="text-sm font-semibold text-foreground mb-4">
                                                Today's Call Handling Metrics
                                            </p>
                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                                <StatCard icon={Phone}        iconColor="bg-blue-500/10 text-blue-500"    label="Total Calls"          value={totals.total_calls.toLocaleString()}                                          sub="today"                                                   />
                                                <StatCard icon={PhoneForwarded} iconColor="bg-amber-500/10 text-amber-500"  label="Transferred"          value={totals.transferred_total.toLocaleString()}                                   sub={`${pcts?.transferred_overall ?? 0}% of total`}           />
                                                <StatCard icon={Users}        iconColor="bg-orange-500/10 text-orange-500" label="User Requested"       value={totals.user_requested_transfer_total.toLocaleString()}                        sub={`${pcts?.user_requested_transfer_overall ?? 0}% of total`} />
                                                <StatCard icon={PhoneCall}    iconColor="bg-rose-500/10 text-rose-500"     label="AI Initiated"         value={totals.ai_initiated_transfer_total.toLocaleString()}                          sub={`${pcts?.ai_initiated_transfer_overall ?? 0}% of total`}  />
                                                <StatCard icon={Brain}        iconColor="bg-purple-500/10 text-purple-500" label="AI Deflected"         value={totals.ai_handled_total.toLocaleString()}                                     sub="no human needed"                                         />
                                                <StatCard icon={CheckCircle2} iconColor="bg-emerald-500/10 text-emerald-500" label="AI Solved"          value={totals.ai_solved_total.toLocaleString()}                                      sub="fully resolved by AI"                                    />
                                                <StatCard icon={XCircle}      iconColor="bg-red-500/10 text-red-500"       label="AI Unresolved"        value={totals.ai_failed_total.toLocaleString()}                                      sub={`${pcts?.ai_failed_of_ai_handled ?? 0}% of AI deflected`} />
                                                <StatCard icon={HelpCircle}   iconColor="bg-slate-500/10 text-slate-500"   label="Uncategorized"        value={uncategorized.toLocaleString()}                                               sub="hang-up / no response"                                   />
                                                <StatCard icon={TrendingUp}   iconColor="bg-cyan-500/10 text-cyan-500"     label="AI Solved Rate"       value={`${pcts?.ai_solved_of_ai_handled ?? 0}%`}                                    sub="resolution success rate"                                 />
                                                <StatCard icon={BarChart2}    iconColor="bg-violet-500/10 text-violet-500" label="AI Deflected Rate"    value={`${deflectionRate}%`}                                                         sub="deflected out of total"                                  />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    )
}

export default function DailyCSAnalyticsPage() {
    return (
        <ProtectedRoute>
            <DailyCSAnalyticsContent />
        </ProtectedRoute>
    )
}
