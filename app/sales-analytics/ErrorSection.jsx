"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, RefreshCw, LayoutGrid, BarChart2 } from "lucide-react"
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, LabelList, Cell,
} from "recharts"
import DatePickerYMD from "@/components/DatePickerYMD"

// ── Consistent color map across both views ───────────────────────────────────
const CAT_COLORS = {
    "API Issue":            "#378ADD",
    "API Response":         "#60A5FA",
    "Authorization Failed": "#D4537E",
    "Error Occurred":       "#EF9F27",
    "Not Active":           "#D85A30",
    "No Response":          "#7F77DD",
    "Multiple Accounts":    "#1D9E75",
    "Other":                "#94a3b8",
}

const CAT_DESCRIPTIONS = {
    "No Response":          "No reply from the API (timeout or repeated retry failures)",
    "API Issue":            "API returned an invalid or unknown status (e.g., -1)",
    "API Response":         "Unexpected or improper response/status code from API.",
    "Error Occurred":       "Internal server error or external API failure",
    "Multiple Accounts":    "User has more than one active account",
    "Authorization Failed": "Payment failed due to authorization error at checkout",
    "Not Active":           "User has no active account",
    "Other":                "",
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function hexToRgba(hex, alpha) {
    const n = parseInt(hex.replace("#", ""), 16)
    return `rgba(${(n >> 16) & 0xff},${(n >> 8) & 0xff},${n & 0xff},${alpha})`
}

function abbrStage(label = "") {
    return label
        .replace(" Validation", " Val.")
        .replace(" Processing", " Proc.")
        .replace(" Placement", " Place.")
        .replace(" Confirmation", " Conf.")
        .replace(" Logging", " Log")
}

// ── Heatmap view ─────────────────────────────────────────────────────────────
// hovered shape:
//   cell  → { kind:"cell",  cat, stage, val, color, label, desc }
//   label → { kind:"label", cat, color, desc }
function HeatmapView({ categories, stages }) {
    const [hovered, setHovered] = useState(null)

    const maxVal = Math.max(
        ...categories.flatMap((cat) => stages.map((s) => cat.by_stage?.[s.stage] ?? 0)),
        1
    )

    return (
        <div>
        <div className="overflow-x-auto">
            <div style={{ minWidth: 640 }}>
                {/* Column header row */}
                <div className="flex items-end mb-1">
                    <div className="w-44 shrink-0" />
                    {stages.map((s) => (
                        <div
                            key={s.stage}
                            className="flex-1 text-center text-xs font-medium text-muted-foreground pb-2 px-0.5 leading-tight"
                        >
                            {abbrStage(s.label)}
                        </div>
                    ))}
                    <div className="w-14 text-center text-xs font-semibold text-muted-foreground pb-2">
                        Total
                    </div>
                </div>

                {/* Data rows */}
                {categories.map((cat) => {
                    const color = CAT_COLORS[cat.category] ?? "#94a3b8"
                    return (
                        <div key={cat.category} className="flex items-center mb-1.5">
                            {/* Row label — hover shows description */}
                            <div
                                className="w-44 shrink-0 flex items-center gap-2 pr-3 cursor-default group"
                                onMouseEnter={() => setHovered({ kind: "label", cat: cat.category, color, desc: CAT_DESCRIPTIONS[cat.category] ?? "" })}
                                onMouseLeave={() => setHovered(null)}
                            >
                                <span
                                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                                    style={{ backgroundColor: color }}
                                />
                                <span className="text-xs font-medium text-foreground truncate group-hover:underline group-hover:decoration-dotted">
                                    {cat.category}
                                </span>
                            </div>

                            {/* Cells */}
                            {stages.map((s) => {
                                const val = cat.by_stage?.[s.stage] ?? 0
                                const isHot = hovered?.cat === cat.category && hovered?.stage === s.stage
                                const intensity = val === 0 ? 0 : 0.18 + (val / maxVal) * 0.72

                                return (
                                    <div
                                        key={s.stage}
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
                                            setHovered({ kind: "cell", cat: cat.category, stage: s.stage, val, color, label: s.label, desc: CAT_DESCRIPTIONS[cat.category] ?? "" })
                                        }
                                        onMouseLeave={() => setHovered(null)}
                                    >
                                        <span
                                            className="text-sm font-bold tabular-nums"
                                            style={{ color: val === 0 ? "rgba(100,116,139,0.35)" : val / maxVal > 0.5 ? "#fff" : color }}
                                        >
                                            {val === 0 ? "—" : val}
                                        </span>
                                    </div>
                                )
                            })}

                            {/* Row total */}
                            <div className="w-14 text-center text-sm font-bold tabular-nums" style={{ color }}>
                                {cat.total}
                            </div>
                        </div>
                    )
                })}

                {/* Column totals footer */}
                <div className="flex items-center mt-3 pt-3 border-t border-border">
                    <div className="w-44 shrink-0 text-xs font-semibold text-muted-foreground pr-3">
                        Stage Total
                    </div>
                    {stages.map((s) => (
                        <div
                            key={s.stage}
                            className="flex-1 mx-0.5 h-11 rounded-lg bg-muted/40 flex items-center justify-center"
                        >
                            <span className="text-sm font-bold text-foreground tabular-nums">
                                {s.total_failures}
                            </span>
                        </div>
                    ))}
                    <div className="w-14 text-center text-sm font-bold text-primary tabular-nums">
                        {stages.reduce((sum, s) => sum + s.total_failures, 0)}
                    </div>
                </div>
            </div>
        </div>

        {/* Tooltip strip — outside the scrollable container so it never triggers overflow */}
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
                        <span style={{ color: hovered.color }} className="font-semibold">{hovered.cat}</span>
                        <span className="text-muted-foreground"> @ {hovered.label}: </span>
                        <span className="font-bold text-foreground">{hovered.val} failures</span>
                    </div>
                    {hovered.desc && (
                        <div className="text-xs text-muted-foreground mt-0.5">{hovered.desc}</div>
                    )}
                </div>
            ) : hovered?.kind === "label" && hovered.desc ? (
                <div
                    className="px-3 py-2 rounded-lg border"
                    style={{
                        borderColor: hexToRgba(hovered.color, 0.4),
                        backgroundColor: hexToRgba(hovered.color, 0.08),
                    }}
                >
                    <div className="text-sm font-semibold" style={{ color: hovered.color }}>{hovered.cat}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{hovered.desc}</div>
                </div>
            ) : (
                <p className="text-sm text-muted-foreground/50 italic pt-1">Hover a row label or cell to see details</p>
            )}
        </div>
        </div>
    )
}

// ── Stacked bar tooltip ───────────────────────────────────────────────────────
function StackedTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null
    const segments = payload.filter((p) => p.dataKey !== "_label" && p.value > 0)
    const total = segments.reduce((s, p) => s + p.value, 0)
    return (
        <div className="bg-background border border-border rounded-xl px-4 py-3 shadow-xl text-xs min-w-44">
            <p className="font-semibold text-foreground mb-2">{label}</p>
            <p className="text-muted-foreground text-[10px] mb-2">{total} total failures</p>
            {segments
                .sort((a, b) => b.value - a.value)
                .map((p) => (
                    <div key={p.dataKey} className="flex justify-between gap-4 mb-0.5">
                        <span style={{ color: p.fill }} className="font-medium">{p.dataKey}</span>
                        <b className="text-foreground">{p.value}</b>
                    </div>
                ))}
        </div>
    )
}

// ── Stage breakdown stacked bar view ─────────────────────────────────────────
function StackedBarView({ categories, stages }) {
    const chartData = stages.map((s) => {
        const row = {
            stage: abbrStage(s.label),
            _label: 0,  // transparent bar carrying the total label
            _total: s.total_failures,
        }
        categories.forEach((cat) => {
            row[cat.category] = cat.by_stage?.[s.stage] ?? 0
        })
        return row
    })

    // last visible category gets the top-label LabelList
    const lastCat = categories[categories.length - 1]

    return (
        <ResponsiveContainer width="100%" height={340}>
            <BarChart data={chartData} margin={{ top: 22, right: 12, left: 0, bottom: 0 }} barCategoryGap="32%">
                <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                <XAxis dataKey="stage" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<StackedTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />

                {categories.map((cat, i) => {
                    const isLast = cat === lastCat
                    return (
                        <Bar
                            key={cat.category}
                            dataKey={cat.category}
                            stackId="a"
                            fill={CAT_COLORS[cat.category] ?? "#94a3b8"}
                            radius={isLast ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                        >
                            {isLast && (
                                <LabelList
                                    valueAccessor={(entry) => entry._total || ""}
                                    position="top"
                                    style={{ fontSize: 12, fill: "#94a3b8", fontWeight: 600 }}
                                />
                            )}
                        </Bar>
                    )
                })}
            </BarChart>
        </ResponsiveContainer>
    )
}

// ── Color legend ─────────────────────────────────────────────────────────────
function ColorLegend({ categories }) {
    return (
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-4 pt-4 border-t border-border">
            {categories.map((cat) => {
                const color = CAT_COLORS[cat.category] ?? "#94a3b8"
                return (
                    <div key={cat.category} className="flex items-center gap-1.5 text-xs">
                        <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: color }} />
                        <span className="text-muted-foreground">{cat.category}</span>
                        <span className="font-semibold tabular-nums" style={{ color }}>{cat.total}</span>
                    </div>
                )
            })}
        </div>
    )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ErrorSection({ data, loading, startDate, setStartDate, endDate, setEndDate, onFetch }) {
    const categories = (data?.error_categories ?? []).filter((c) => c.total > 0)
    const stages     = data?.by_stage ?? []

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2 mb-1">
                            <AlertTriangle className="w-5 h-5 text-primary" />
                            Error Analysis
                        </CardTitle>
                        <CardDescription>
                            {data?.total_failures != null ? (
                                <><span className="font-semibold text-red-500">{data.total_failures}</span> failures detected</>
                            ) : "Failure breakdown"}
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
                {/* Date filter */}
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
                ) : !data || categories.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">No error data</div>
                ) : (
                    <Tabs defaultValue="heatmap">
                        <TabsList className="mb-5">
                            <TabsTrigger value="heatmap" className="flex items-center gap-1.5">
                                <LayoutGrid className="w-3.5 h-3.5" />
                                Heatmap
                            </TabsTrigger>
                            <TabsTrigger value="breakdown" className="flex items-center gap-1.5">
                                <BarChart2 className="w-3.5 h-3.5" />
                                Stage Breakdown
                            </TabsTrigger>
                        </TabsList>

                        {/* ── Heatmap tab ───────────────────────────────── */}
                        <TabsContent value="heatmap">
                            <HeatmapView categories={categories} stages={stages} />
                            <ColorLegend categories={categories} />
                        </TabsContent>

                        {/* ── Stage Breakdown tab ───────────────────────── */}
                        <TabsContent value="breakdown">
                            <StackedBarView categories={categories} stages={stages} />
                            <ColorLegend categories={categories} />
                        </TabsContent>
                    </Tabs>
                )}
            </CardContent>
        </Card>
    )
}
