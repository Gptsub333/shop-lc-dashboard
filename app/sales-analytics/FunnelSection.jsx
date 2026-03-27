"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GitBranch, RefreshCw } from "lucide-react"
import DatePickerYMD from "@/components/DatePickerYMD"

const FUNNEL_COLORS = [
    "#06b6d4",
    "#f43f5e",
    "#f59e0b",
    "#8b5cf6",
    "#22c55e",
    "#3b82f6",
    "#f97316",
]

function darken(hex, amt = 55) {
    const n = parseInt(hex.replace("#", ""), 16)
    const r = Math.max(0, (n >> 16) - amt)
    const g = Math.max(0, ((n >> 8) & 0xff) - amt)
    const b = Math.max(0, (n & 0xff) - amt)
    return `rgb(${r},${g},${b})`
}

function lighten(hex, amt = 45) {
    const n = parseInt(hex.replace("#", ""), 16)
    const r = Math.min(255, (n >> 16) + amt)
    const g = Math.min(255, ((n >> 8) & 0xff) + amt)
    const b = Math.min(255, (n & 0xff) + amt)
    return `rgb(${r},${g},${b})`
}

function Funnel3D({ stages }) {
    const LABEL_W    = 110
    const FUNNEL_MAX = 280
    const CX         = LABEL_W + FUNNEL_MAX / 2   // 270
    const TOTAL_W    = LABEL_W + FUNNEL_MAX + 16   // 426
    const SLICE_H    = 42
    const DEPTH      = 10
    const GAP        = 5
    const totalH     = stages.length * (SLICE_H + GAP) - GAP + DEPTH + 12

    return (
        <svg
            viewBox={`0 0 ${TOTAL_W} ${totalH}`}
            width="100%"
            style={{ overflow: "visible" }}
            aria-label="Call stage funnel chart"
        >
            {stages.map((stage, i) => {
                const topReach = stage.reach_rate / 100
                const botReach = i < stages.length - 1
                    ? stages[i + 1].reach_rate / 100
                    : stage.reach_rate / 100 * 0.80

                const topW = topReach * FUNNEL_MAX
                const botW = botReach * FUNNEL_MAX

                const y       = i * (SLICE_H + GAP)
                const color   = FUNNEL_COLORS[i % FUNNEL_COLORS.length]
                const darkCol = darken(color)
                const lightCol = lighten(color)

                const x1 = CX - topW / 2
                const x2 = CX + topW / 2
                const x3 = CX + botW / 2
                const x4 = CX - botW / 2
                const midY = y + SLICE_H / 2

                return (
                    <g key={stage.stage}>
                        {/* Main trapezoid face */}
                        <polygon
                            points={`${x1},${y} ${x2},${y} ${x3},${y + SLICE_H} ${x4},${y + SLICE_H}`}
                            fill={color}
                        />

                        {/* Top rim — lighter ellipse for 3D cap */}
                        <ellipse
                            cx={CX} cy={y}
                            rx={topW / 2} ry={DEPTH / 2.6}
                            fill={lightCol}
                        />

                        {/* Bottom depth — darker ellipse for extrusion */}
                        <ellipse
                            cx={CX} cy={y + SLICE_H}
                            rx={botW / 2} ry={DEPTH / 2}
                            fill={darkCol}
                        />

                        {/* Stage label — right-aligned in reserved label area */}
                        <text
                            x={LABEL_W - 12}
                            y={midY + 4}
                            textAnchor="end"
                            fontSize="10"
                            fill="#94a3b8"
                            fontFamily="system-ui, -apple-system, sans-serif"
                        >
                            {stage.label}
                        </text>

                        {/* Dashed connector from label to funnel left edge */}
                        <line
                            x1={LABEL_W - 8} y1={midY}
                            x2={x1 + 3} y2={midY}
                            stroke="#475569"
                            strokeWidth="1"
                            strokeDasharray="3 2"
                            opacity="0.45"
                        />

                        {/* Reach rate % — bold white, centered */}
                        <text
                            x={CX}
                            y={midY - 5}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize="13"
                            fontWeight="bold"
                            fill="white"
                            fontFamily="system-ui, -apple-system, sans-serif"
                        >
                            {stage.reach_rate}%
                        </text>

                        {/* Success / fail count in smaller text */}
                        <text
                            x={CX}
                            y={midY + 9}
                            textAnchor="middle"
                            fontSize="9"
                            fill="rgba(255,255,255,0.82)"
                            fontFamily="system-ui, -apple-system, sans-serif"
                        >
                            {stage.success.toLocaleString()} ok · {stage.fail} fail
                        </text>
                    </g>
                )
            })}
        </svg>
    )
}

export default function FunnelSection({ data, loading, startDate, setStartDate, endDate, setEndDate, onFetch }) {
    const funnel      = data?.funnel ?? []
    const dropAnalysis = data?.drop_analysis ?? null

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2 mb-1">
                            <GitBranch className="w-5 h-5 text-primary" />
                            Call Stage Funnel
                        </CardTitle>
                        <CardDescription>
                            How calls progress through each AI processing stage
                            <span className="ml-2 text-xs font-medium text-primary">
                                ({startDate} → {endDate})
                            </span>
                            {data?.total_calls != null && (
                                <span className="ml-1 text-xs font-medium text-primary">
                                    · {data.total_calls.toLocaleString()} total calls
                                </span>
                            )}
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
                ) : funnel.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">No funnel data</div>
                ) : (
                    <div>
                        <div className="py-4 flex justify-center">
                            <div className="w-full max-w-lg">
                                <Funnel3D stages={funnel} />
                            </div>
                        </div>

                        {dropAnalysis && (
                            <div className="mt-6 pt-5 border-t border-border">
                                <p className="text-sm font-semibold text-foreground mb-3">
                                    Drop Analysis —{" "}
                                    <span className="text-red-500">{dropAnalysis.total_dropped} drops</span>
                                    <span className="text-muted-foreground text-xs ml-1">
                                        ({dropAnalysis.drop_rate}% drop rate)
                                    </span>
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {dropAnalysis.by_stage
                                        .filter((d) => d.count > 0)
                                        .sort((a, b) => b.count - a.count)
                                        .map((d) => (
                                            <div
                                                key={d.stage}
                                                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/60 border border-border text-xs"
                                            >
                                                <span className="text-muted-foreground">{d.label}</span>
                                                <span className="font-bold text-foreground">{d.count}</span>
                                                <span className="text-red-500 font-medium">{d.percentage}%</span>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
