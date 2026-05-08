import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, RefreshCw, TrendingUp, TrendingDown, Phone, PhoneForwarded, PhoneCall, CheckCircle2, XCircle, Users, HelpCircle, BarChart2, Download, Activity, GitBranch, AlertCircle } from "lucide-react"
import { useState } from "react"
import DatePickerYMD from "./DatePickerYMD"
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from "recharts"

const HOURS = [
    "12am", "1am", "2am", "3am", "4am", "5am",
    "6am", "7am", "8am", "9am", "10am", "11am",
    "12pm", "1pm", "2pm", "3pm", "4pm", "5pm",
    "6pm", "7pm", "8pm", "9pm", "10pm", "11pm"
]

function DailyRow({ day, index }) {
    const [showDeflectedTooltip, setShowDeflectedTooltip] = useState(false)
    const [showResolvedTooltip, setShowResolvedTooltip] = useState(false)
    
    return (
        <tr className="border-t hover:bg-muted/20 transition-colors">
            <td className="py-3 px-4 font-medium text-foreground whitespace-nowrap">{day.date}</td>
            <td className="py-3 px-4 text-foreground">{day.total_calls}</td>
            <td className="py-3 px-4">
                <span className="text-amber-500 font-medium">{day.transferred_total}</span>
                <span className="text-xs text-muted-foreground ml-1">({day.transferred_percentage}%)</span>
            </td>
            <td className="py-3 px-4">
                <span className="text-orange-500 font-medium">{day.user_requested_transfer_total}</span>
                <span className="text-xs text-muted-foreground ml-1">({day.user_requested_transfer_percentage}%)</span>
            </td>
            <td className="py-3 px-4">
                <span className="text-rose-500 font-medium">{day.ai_initiated_transfer_total}</span>
                <span className="text-xs text-muted-foreground ml-1">({day.ai_initiated_transfer_percentage}%)</span>
            </td>
            <td 
                className="py-3 px-4 relative"
                onMouseEnter={() => setShowDeflectedTooltip(true)}
                onMouseLeave={() => setShowDeflectedTooltip(false)}
            >
                <span className="text-purple-500 font-medium cursor-help">{day.deflected_calls || 0}</span>
                {day.deflected_calls_hover && showDeflectedTooltip && (
                    <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-background border border-border rounded-lg shadow-lg whitespace-nowrap">
                        <div className="text-xs space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="text-emerald-500 font-semibold">Scope-in:</span>
                                <span className="text-foreground">{day.deflected_calls_hover.scope_in}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-amber-500 font-semibold">Scope-out:</span>
                                <span className="text-foreground">{day.deflected_calls_hover.scope_out}</span>
                            </div>
                        </div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                            <div className="w-2 h-2 bg-background border-r border-b border-border rotate-45"></div>
                        </div>
                    </div>
                )}
            </td>
            <td 
                className="py-3 px-4 relative"
                onMouseEnter={() => setShowResolvedTooltip(true)}
                onMouseLeave={() => setShowResolvedTooltip(false)}
            >
                <span className="text-emerald-500 font-medium cursor-help">{day.ai_resolved || 0}</span>
                {day.ai_resolved_hover && showResolvedTooltip && (
                    <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-background border border-border rounded-lg shadow-lg whitespace-nowrap">
                        <div className="text-xs space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="text-emerald-500 font-semibold">Scope-in:</span>
                                <span className="text-foreground">{day.ai_resolved_hover.scope_in}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-amber-500 font-semibold">Scope-out:</span>
                                <span className="text-foreground">{day.ai_resolved_hover.scope_out}</span>
                            </div>
                        </div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                            <div className="w-2 h-2 bg-background border-r border-b border-border rotate-45"></div>
                        </div>
                    </div>
                )}
            </td>
            <td className="py-3 px-4">
                <span className="text-red-500 font-medium">{day.ai_unresolved || 0}</span>
                <span className="text-xs text-muted-foreground ml-1">({day.ai_unresolved_percentage}%)</span>
            </td>
            <td className="py-3 px-4">
                <span className="text-slate-500 font-medium">{day.call_abandoned_total || 0}</span>
            </td>
        </tr>
    )
}

function buildHourlyChartData(aiSummaryData) {
    if (!aiSummaryData) return []

    // If single day, use that day's peak_hour_calls; else use totals_peak_hour_calls
    const daily = aiSummaryData.daily || []
    const peakHours =
        daily.length === 1
            ? daily[0].peak_hour_calls
            : aiSummaryData.totals_peak_hour_calls

    if (!peakHours || peakHours.length !== 24) return []

    return HOURS.map((label, i) => ({ hour: label, calls: peakHours[i] ?? 0 }))
}

function StatCard({ icon: Icon, iconColor, label, value, sub, pct, trend, hoverData }) {
    const trendUp = trend >= 0
    const [showTooltip, setShowTooltip] = useState(false)
    
    return (
        <div 
            className="relative rounded-2xl border border-border/60 bg-gradient-to-br from-background via-background to-muted/70 shadow-sm hover:shadow-lg transition-all duration-200"
            onMouseEnter={() => hoverData && setShowTooltip(true)}
            onMouseLeave={() => hoverData && setShowTooltip(false)}
        >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-primary/10 opacity-80 rounded-2xl overflow-hidden" />
            <div className="relative flex items-start gap-3 p-4">
                <div className={`mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center shadow-sm bg-white/70 backdrop-blur-sm ${iconColor}`}>
                    <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">
                        {label}
                        {hoverData && <span className="ml-1 text-primary">ⓘ</span>}
                    </p>
                    <p className="text-2xl md:text-3xl font-semibold text-foreground leading-tight">{value}</p>
                    {sub != null && (
                        <p className="text-xs text-muted-foreground mt-1">{sub}</p>
                    )}
                </div>
                {pct != null && (
                    <div className={`absolute top-3 right-3 inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm backdrop-blur-sm ${trendUp ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                        {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {Math.abs(pct).toFixed(1)}%
                    </div>
                )}
            </div>
            
            {/* Hover Tooltip */}
            {hoverData && showTooltip && (
                <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-background border border-border rounded-lg shadow-lg whitespace-nowrap">
                    <div className="text-xs space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="text-emerald-500 font-semibold">Scope-in:</span>
                            <span className="text-foreground">{hoverData.scope_in?.toLocaleString() || 0}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-amber-500 font-semibold">Scope-out:</span>
                            <span className="text-foreground">{hoverData.scope_out?.toLocaleString() || 0}</span>
                        </div>
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                        <div className="w-2 h-2 bg-background border-r border-b border-border rotate-45"></div>
                    </div>
                </div>
            )}
        </div>
    )
}

// ── Call Flow Tree View ──────────────────────────────────────────────────────
function lightBadgeBg(hex) {
    const n = parseInt(hex.replace("#", ""), 16)
    const r = Math.round(((n >> 16) & 0xff) * 0.18 + 237)
    const g = Math.round(((n >> 8)  & 0xff) * 0.18 + 237)
    const b = Math.round(((n)       & 0xff) * 0.18 + 237)
    return `rgb(${r},${g},${b})`
}

function CallFlowDiagram({ totals }) {
    if (!totals) return null

    const pcts = totals.percentages

    // Align with StatCards: new API fields with legacy fallbacks
    const deflected = totals.deflected_calls ?? totals.ai_handled_total ?? 0
    const resolved  = totals.ai_resolved ?? totals.ai_solved_total ?? 0
    const unresolved = totals.ai_unresolved ?? totals.ai_failed_total ?? 0
    const abandonedCalls = totals.call_abandoned_total || 0

    const transferredPct = totals.transferred_percentage ?? pcts?.transferred_overall ?? 0
    const deflectedPctLabel = totals.ai_deflected_percentage
        ?? parseFloat((100 - transferredPct).toFixed(1))

    const ureqPct = totals.user_requested_transfer_percentage ?? pcts?.user_requested_transfer_overall ?? 0
    const ainitPct = totals.ai_initiated_transfer_percentage ?? pcts?.ai_initiated_transfer_overall ?? 0

    const solvPctOfDefl =
        deflected > 0
            ? parseFloat(((resolved / deflected) * 100).toFixed(1))
            : (pcts?.ai_solved_of_ai_handled ?? 0)
    const unresPctOfDefl =
        totals.ai_unresolved_percentage != null
            ? totals.ai_unresolved_percentage
            : deflected > 0
              ? parseFloat(((unresolved / deflected) * 100).toFixed(1))
              : (pcts?.ai_failed_of_ai_handled ?? 0)

    const abandonPctOfDefl =
        totals.abandoned_of_deflected_percentage != null
            ? totals.abandoned_of_deflected_percentage
            : deflected > 0
              ? parseFloat(((abandonedCalls / deflected) * 100).toFixed(1))
              : 0

    const W = 760, BW = 126, BH = 62, H_GAP = 10, V_GAP = 72

    const r3W     = 5 * BW + 4 * H_GAP
    const r3Start = (W - r3W) / 2
    const r3cx    = [0, 1, 2, 3, 4].map((i) => r3Start + i * (BW + H_GAP) + BW / 2)
    const r2cx    = [(r3cx[0] + r3cx[1]) / 2, (r3cx[2] + r3cx[4]) / 2]
    const r1cx    = [(r2cx[0] + r2cx[1]) / 2]

    const y1 = 14, y2 = y1 + BH + V_GAP, y3 = y2 + BH + V_GAP
    const SVG_H = y3 + BH + 22

    const nodes = [
        { id: "total", cx: r1cx[0], y: y1, label: "Total Calls",    value: totals.total_calls,                   color: "#06b6d4" },
        { id: "xfer",  cx: r2cx[0], y: y2, label: "Transferred",    value: totals.transferred_total,             color: "#f59e0b" },
        { id: "defl",  cx: r2cx[1], y: y2, label: "AI Deflected",   value: deflected,                            color: "#8b5cf6" },
        { id: "ureq",  cx: r3cx[0], y: y3, label: "User Requested", value: totals.user_requested_transfer_total, color: "#f97316" },
        { id: "ainit", cx: r3cx[1], y: y3, label: "AI Initiated",   value: totals.ai_initiated_transfer_total,   color: "#eab308" },
        { id: "solv",  cx: r3cx[2], y: y3, label: "AI Solved",      value: resolved,                             color: "#22c55e" },
        { id: "unres", cx: r3cx[3], y: y3, label: "AI Unresolved",  value: unresolved,                           color: "#ef4444" },
        { id: "aband", cx: r3cx[4], y: y3, label: "Abandoned",      value: abandonedCalls,                       color: "#64748b" },
    ]

    const edges = [
        { from: "total", to: "xfer",  label: `${transferredPct}%` },
        { from: "total", to: "defl",  label: `${deflectedPctLabel}%` },
        { from: "xfer",  to: "ureq",  label: `${ureqPct}%` },
        { from: "xfer",  to: "ainit", label: `${ainitPct}%` },
        { from: "defl",  to: "solv",  label: `${solvPctOfDefl}%` },
        { from: "defl",  to: "unres", label: `${unresPctOfDefl}%` },
        { from: "defl",  to: "aband", label: `${abandonPctOfDefl}%` },
    ]

    const nm = Object.fromEntries(nodes.map((n) => [n.id, n]))

    function pathD(a, b) {
        const my = (a.y + BH + b.y) / 2
        return `M ${a.cx} ${a.y + BH} C ${a.cx} ${my}, ${b.cx} ${my}, ${b.cx} ${b.y}`
    }

    return (
        <svg viewBox={`0 0 ${W} ${SVG_H}`} width="100%" style={{ overflow: "visible" }} aria-label="Call flow diagram">
            {edges.map(({ from, to, label }) => {
                const a = nm[from], b = nm[to]
                const d = pathD(a, b)
                const mx = (a.cx + b.cx) / 2
                const my = (a.y + BH + b.y) / 2
                return (
                    <g key={`${from}-${to}`}>
                        <path d={d} fill="none" stroke={b.color} strokeWidth="1.8" strokeOpacity="0.35" />
                        <rect x={mx - 19} y={my - 9} width={38} height={17} rx={5}
                              fill={lightBadgeBg(b.color)} stroke={b.color} strokeOpacity="0.55" strokeWidth="1" />
                        <text x={mx} y={my + 3.5} textAnchor="middle" fontSize="9.5" fontWeight="700"
                              fill={b.color} fontFamily="system-ui,sans-serif">{label}</text>
                    </g>
                )
            })}
            {nodes.map((n) => (
                <g key={n.id}>
                    <rect x={n.cx - BW / 2} y={n.y} width={BW} height={BH} rx={11}
                          fill={`${n.color}14`} stroke={n.color} strokeWidth="1.5" strokeOpacity="0.6" />
                    <text x={n.cx} y={n.y + 27} textAnchor="middle" fontSize="22" fontWeight="800"
                          fill={n.color} fontFamily="system-ui,sans-serif">{n.value}</text>
                    <text x={n.cx} y={n.y + 44} textAnchor="middle" fontSize="10.5" fill="#94a3b8"
                          fontFamily="system-ui,sans-serif">{n.label}</text>
                </g>
            ))}
        </svg>
    )
}

const VIZ_OPTIONS = [
    { id: "area",   label: "Peak Calls", icon: Activity  },
    { id: "funnel", label: "Tree View",  icon: GitBranch },
]

const CustomTooltip = ({ active, payload, label }) => {
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

async function downloadExcel(aiSummaryData) {
    if (!aiSummaryData) return

    const totals = aiSummaryData.totals
    const pcts = totals?.percentages
    const range = aiSummaryData.range
    const rangeLabel = range ? `${range.start_date} to ${range.end_date}` : "Selected Range"
    const fileName = `AI_Performance_${range?.start_date ?? "start"}_to_${range?.end_date ?? "end"}.xlsx`

    const ExcelJS = (await import("exceljs")).default
    const wb = new ExcelJS.Workbook()
    wb.creator = "Shop LC Dashboard"

    // ── Color palette matching the UI ─────────────────────────────────────
    const C = {
        titleBg:  "1E293B", titleFg:  "FFFFFF",
        rangeBg:  "334155", headerBg: "475569",
        blue:     "3B82F6", amber:    "F59E0B",
        orange:   "F97316", rose:     "F43F5E",
        purple:   "A855F7", emerald:  "10B981",
        red:      "EF4444", slate:    "64748B",
        cyan:     "06B6D4", violet:   "8B5CF6",
        rowEven:  "FFFFFF", rowOdd:   "F1F5F9",
        border:   "E2E8F0",
    }

    function argb(hex) { return "FF" + hex }

    function applyTitleRow(row, text, spanCount, bg = C.titleBg, size = 14) {
        row.height = 30
        const cell = row.getCell(1)
        cell.value = text
        cell.font = { bold: true, color: { argb: argb(C.titleFg) }, size, name: "Calibri" }
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: argb(bg) } }
        cell.alignment = { vertical: "middle", horizontal: "center" }
    }

    function styleDataCell(cell, color, bold, bg) {
        cell.font = { bold, color: { argb: argb(color) }, size: 11, name: "Calibri" }
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: argb(bg) } }
        cell.alignment = { vertical: "middle", horizontal: "left" }
        cell.border = { bottom: { style: "thin", color: { argb: argb(C.border) } } }
    }

    // ── Sheet 1: Call Handling Breakdown ──────────────────────────────────
    const ws1 = wb.addWorksheet("Call Handling Breakdown")
    ws1.columns = [{ width: 34 }, { width: 20 }, { width: 36 }]

    ws1.addRow(["", "", ""])
    ws1.mergeCells("A1:C1")
    applyTitleRow(ws1.getRow(1), "AI Performance Summary - Call Handling Breakdown", 3)

    ws1.addRow(["", "", ""])
    ws1.mergeCells("A2:C2")
    applyTitleRow(ws1.getRow(2), `Date Range: ${rangeLabel}`, 3, C.rangeBg, 11)

    ws1.addRow([])

    const hdr1 = ws1.addRow(["Metric", "Value", "% of Total / Notes"])
    hdr1.height = 24
    hdr1.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: argb(C.titleFg) }, size: 11, name: "Calibri" }
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: argb(C.headerBg) } }
        cell.alignment = { vertical: "middle", horizontal: "left" }
        cell.border = { bottom: { style: "medium", color: { argb: argb(C.titleBg) } } }
    })

    const aiDeflectedPct =
        totals?.total_calls > 0
            ? `${((totals.ai_handled_total / totals.total_calls) * 100).toFixed(1)}%`
            : "0%"

    const breakdown = [
        ["Total Calls",             totals?.total_calls ?? 0,                    "in selected range",                                     C.blue],
        ["Transferred to Human",    totals?.transferred_total ?? 0,              `${pcts?.transferred_overall ?? 0}% of total`,           C.amber],
        ["User Requested Transfer", totals?.user_requested_transfer_total ?? 0,  `${pcts?.user_requested_transfer_overall ?? 0}% of total`, C.orange],
        ["AI Initiated Transfer",   totals?.ai_initiated_transfer_total ?? 0,    `${pcts?.ai_initiated_transfer_overall ?? 0}% of total`, C.rose],
        ["AI Deflected",            totals?.ai_handled_total ?? 0,               `${aiDeflectedPct} of total`,                            C.purple],
        ["AI Solved",               totals?.ai_solved_total ?? 0,                "total calls fully resolved by AI",                      C.emerald],
        ["AI Unresolved",           totals?.ai_failed_total ?? 0,                `${pcts?.ai_failed_of_ai_handled ?? 0}% of AI deflected`, C.red],
        ["Abandoned Calls",         totals?.call_abandoned_total ?? 0,           `${pcts?.abandoned_overall ?? 0}% of total`,             C.slate],
        ["AI Solved Rate",          `${pcts?.ai_solved_of_ai_handled ?? 0}%`,    "AI resolution success rate",                            C.cyan],
        ["AI Deflected Rate",       aiDeflectedPct,                              "AI deflected out of total calls",                       C.violet],
    ]

    breakdown.forEach(([label, value, note, color], i) => {
        const bg = i % 2 === 0 ? C.rowEven : C.rowOdd
        const row = ws1.addRow([label, value, note])
        row.height = 22
        styleDataCell(row.getCell(1), "334155", false, bg)
        styleDataCell(row.getCell(2), color, true, bg)
        styleDataCell(row.getCell(3), "94A3B8", false, bg)
    })

    // ── Sheet 2: Daily Breakdown ──────────────────────────────────────────
    const daily = aiSummaryData.daily || []
    const ws2 = wb.addWorksheet("Daily Breakdown")
    ws2.columns = [
        { width: 14 }, { width: 14 }, { width: 24 },
        { width: 19 }, { width: 12 }, { width: 17 }, { width: 12 },
        { width: 15 }, { width: 13 }, { width: 15 }, { width: 11 },
    ]

    ws2.addRow(new Array(11).fill(""))
    ws2.mergeCells("A1:K1")
    applyTitleRow(ws2.getRow(1), "AI Performance Summary — Daily Breakdown", 11)

    ws2.addRow(new Array(11).fill(""))
    ws2.mergeCells("A2:K2")
    applyTitleRow(ws2.getRow(2), `Date Range: ${rangeLabel}`, 11, C.rangeBg, 11)

    ws2.addRow([])

    const dailyCols = [
        { label: "Date",                 color: "334155" },
        { label: "Total Calls",          color: C.blue    },
        { label: "Transferred to Human", color: C.amber   },
        { label: "User Requested",       color: C.orange  },
        { label: "User Req %",           color: C.orange  },
        { label: "AI Initiated",         color: C.rose    },
        { label: "AI Init %",            color: C.rose    },
        { label: "AI Deflected",         color: C.purple  },
        { label: "AI Solved",            color: C.emerald },
        { label: "AI Unresolved",        color: C.red     },
        { label: "Solved %",             color: C.cyan    },
    ]

    const hdr2 = ws2.addRow(dailyCols.map((c) => c.label))
    hdr2.height = 24
    dailyCols.forEach((col, ci) => {
        const cell = hdr2.getCell(ci + 1)
        cell.font = { bold: true, color: { argb: argb(C.titleFg) }, size: 11, name: "Calibri" }
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: argb(C.titleBg) } }
        cell.alignment = { vertical: "middle", horizontal: "left" }
        cell.border = { bottom: { style: "medium", color: { argb: argb(col.color) } } }
    })

    daily.forEach((day, i) => {
        const solvedPct = day.percentages?.ai_solved_of_ai_handled ?? 0
        const solvedColor = solvedPct >= 50 ? C.emerald : C.amber
        const bg = i % 2 === 0 ? C.rowEven : C.rowOdd

        const values = [
            day.date,
            day.total_calls,
            day.transferred_total,
            day.user_requested_transfer_total,
            `${day.percentages?.user_requested_transfer_overall ?? 0}%`,
            day.ai_initiated_transfer_total,
            `${day.percentages?.ai_initiated_transfer_overall ?? 0}%`,
            day.ai_handled_total,
            day.ai_solved_total,
            day.ai_failed_total,
            `${solvedPct}%`,
        ]

        const colColors = [
            "334155", C.blue, C.amber,
            C.orange, C.orange, C.rose, C.rose,
            C.purple, C.emerald, C.red, solvedColor,
        ]

        const row = ws2.addRow(values)
        row.height = 20
        values.forEach((_, ci) => {
            styleDataCell(row.getCell(ci + 1), colColors[ci], ci === 0, bg)
        })
    })

    const buffer = await wb.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}

export default function AISummary({ onFetch, aiSummaryData, aiSummaryLoading, startDate, setStartDate, endDate, setEndDate }) {
    const [vizType, setVizType] = useState("area")

    const chartData = buildHourlyChartData(aiSummaryData)
    const totals = aiSummaryData?.totals
    const pcts = totals?.percentages
    const range = aiSummaryData?.range

    const peakEntry = chartData.reduce((max, d) => (d.calls > max.calls ? d : max), { calls: 0, hour: "" })

    return (
        <Card className="mb-8 border-2 border-primary/20">
            <CardHeader>
                <div className="flex items-start justify-between flex-wrap gap-4">
                    {/* Title + description + toggle pills */}
                    <div className="flex flex-col gap-2">
                        <CardTitle className="flex items-center gap-2">
                            <Brain className="w-6 h-6 text-primary" />
                            AI Performance Summary
                        </CardTitle>
                        <CardDescription>
                            Intraday call volume pattern and AI handling metrics for the selected date range
                            {range && (
                                <span className="ml-2 text-xs font-medium text-primary">
                                    ({range.start_date} → {range.end_date})
                                </span>
                            )}
                        </CardDescription>
                        {/* Viz toggle pills sit under the description */}
                        <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/60 border border-border w-fit mt-1">
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
                    </div>

                    {/* Action buttons pinned to the right */}
                    <div className="flex items-center gap-2 shrink-0">
                        <Button variant="outline" size="sm" onClick={onFetch} disabled={aiSummaryLoading}>
                            <RefreshCw className={`w-4 h-4 mr-2 ${aiSummaryLoading ? "animate-spin" : ""}`} />
                            Refresh
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadExcel(aiSummaryData)}
                            disabled={!aiSummaryData || aiSummaryLoading}
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                {/* ── Date range picker ─────────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
                    <DatePickerYMD label="Start Date" value={startDate} onChange={setStartDate} />
                    <DatePickerYMD label="End Date" value={endDate} onChange={setEndDate} />
                    <div className="flex items-end">
                        <Button onClick={onFetch} disabled={aiSummaryLoading} className="w-full sm:w-auto">
                            {aiSummaryLoading ? "Loading..." : "Search"}
                        </Button>
                    </div>
                </div>

                {aiSummaryLoading ? (
                    <div className="space-y-4">
                        <div className="h-64 rounded-xl bg-muted/30 animate-pulse" />
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="h-20 rounded-xl bg-muted/30 animate-pulse" />
                            ))}
                        </div>
                    </div>
                ) : !aiSummaryData ? (
                    <div className="text-center py-16 bg-muted/20 rounded-lg">
                        <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <p className="text-muted-foreground font-medium">No AI summary data</p>
                        <p className="text-sm text-muted-foreground mt-1">Select a date range and click Search</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* ── Peak Calls area chart ──────────────────────────── */}
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
                                        <AreaChart data={chartData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="callsGradient" x1="0" y1="0" x2="0" y2="1">
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
                                            <Tooltip content={<CustomTooltip />} />
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
                                                fill="url(#callsGradient)"
                                                dot={false}
                                                activeDot={{ r: 4, fill: "#06b6d4", stroke: "white", strokeWidth: 2 }}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* ── Tree View (call flow) ───────────────────────────── */}
                        {vizType === "funnel" && (
                            <div>
                                <div className="flex items-center gap-2 mb-5">
                                    <GitBranch className="w-4 h-4 text-muted-foreground" />
                                    <p className="text-sm font-semibold text-foreground">Call Flow — Tree View</p>
                                    <span className="text-xs text-muted-foreground">— how calls were routed at each stage</span>
                                </div>
                                <div className="py-2 px-2">
                                    <CallFlowDiagram totals={totals} />
                                </div>
                            </div>
                        )}

                        {/* ── Metrics grid ───────────────────────────────────── */}
                        {totals && (
                            <div>
                                <p className="text-sm font-semibold text-foreground mb-3">Call Handling Breakdown</p>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                    <StatCard
                                        icon={Phone}
                                        iconColor="bg-blue-500/10 text-blue-500"
                                        label="Total Calls"
                                        value={totals.total_calls.toLocaleString()}
                                        sub="in selected range"
                                    />
                                    <StatCard
                                        icon={PhoneForwarded}
                                        iconColor="bg-amber-500/10 text-amber-500"
                                        label="Transferred to Human"
                                        value={totals.transferred_total.toLocaleString()}
                                        sub={`${totals.transferred_percentage ?? 0}% of total`}
                                    />
                                    <StatCard
                                        icon={Users}
                                        iconColor="bg-orange-500/10 text-orange-500"
                                        label="User Requested Transfer"
                                        value={totals.user_requested_transfer_total.toLocaleString()}
                                        sub={`${totals.user_requested_transfer_percentage ?? 0}% of transferred`}
                                    />
                                    <StatCard
                                        icon={PhoneCall}
                                        iconColor="bg-rose-500/10 text-rose-500"
                                        label="AI Initiated Transfer"
                                        value={totals.ai_initiated_transfer_total.toLocaleString()}
                                        sub={`${totals.ai_initiated_transfer_percentage ?? 0}% of transferred`}
                                    />
                                    <StatCard
                                        icon={Brain}
                                        iconColor="bg-purple-500/10 text-purple-500"
                                        label="Deflected Calls"
                                        value={totals.deflected_calls?.toLocaleString() || 0}
                                        sub="AI attempted to handle"
                                        hoverData={totals.deflected_calls_hover}
                                    />
                                    <StatCard
                                        icon={CheckCircle2}
                                        iconColor="bg-emerald-500/10 text-emerald-500"
                                        label="AI Resolved"
                                        value={totals.ai_resolved?.toLocaleString() || 0}
                                        sub="successfully resolved by AI"
                                        hoverData={totals.ai_resolved_hover}
                                    />
                                    <StatCard
                                        icon={XCircle}
                                        iconColor="bg-red-500/10 text-red-500"
                                        label="AI Unresolved"
                                        value={totals.ai_unresolved?.toLocaleString() || 0}
                                        sub={`${totals.ai_unresolved_percentage ?? 0}% of deflected`}
                                    />
                                    <StatCard
                                        icon={PhoneCall}
                                        iconColor="bg-slate-500/10 text-slate-500"
                                        label="Abandoned Calls"
                                        value={(totals.call_abandoned_total || 0).toLocaleString()}
                                        sub="customer abandoned call"
                                    />
                                    <StatCard
                                        icon={TrendingUp}
                                        iconColor="bg-cyan-500/10 text-cyan-500"
                                        label="AI Solved Percentage"
                                        value={`${totals.ai_solved_percentage ?? 0}%`}
                                        sub="AI resolution success rate"
                                    />
                                    <StatCard
                                        icon={BarChart2}
                                        iconColor="bg-violet-500/10 text-violet-500"
                                        label="AI Deflected Percentage"
                                        value={`${totals.ai_deflected_percentage ?? 0}%`}
                                        sub="deflection rate of total"
                                    />
                                </div>
                            </div>
                        )}

                        {/* ── Per-day breakdown table ─────────────────────────── */}
                        {aiSummaryData.daily && aiSummaryData.daily.length > 1 && (
                            <div>
                                <p className="text-sm font-semibold text-foreground mb-3">Daily Breakdown</p>
                                <div className="overflow-x-auto rounded-xl border">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted/50">
                                            <tr>
                                                {["Date", "Total", "Transferred", "User Requested", "AI Initiated", "Deflected ⓘ", "AI Resolved ⓘ", "AI Unresolved", "Abandoned"].map((h) => (
                                                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {aiSummaryData.daily.map((day, i) => (
                                                <DailyRow key={i} day={day} index={i} />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
