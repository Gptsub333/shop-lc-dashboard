import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Brain, RefreshCw, TrendingUp, TrendingDown, Phone, PhoneForwarded, PhoneCall, CheckCircle2, XCircle, Users, HelpCircle, BarChart2 } from "lucide-react"
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

function StatCard({ icon: Icon, iconColor, label, value, sub, pct, trend }) {
    const trendUp = trend >= 0
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
        </div>
    )
}

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

export default function AISummary({ onFetch, aiSummaryData, aiSummaryLoading, startDate, setStartDate, endDate, setEndDate }) {
    const chartData = buildHourlyChartData(aiSummaryData)
    const totals = aiSummaryData?.totals
    const pcts = totals?.percentages
    const range = aiSummaryData?.range

    const peakEntry = chartData.reduce((max, d) => (d.calls > max.calls ? d : max), { calls: 0, hour: "" })

    return (
        <Card className="mb-8 border-2 border-primary/20">
            <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2 mb-1">
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
                    </div>
                    <Button variant="outline" size="sm" onClick={onFetch} disabled={aiSummaryLoading}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${aiSummaryLoading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                </div>
            </CardHeader>

            <CardContent>
                {/* ── Date range picker ─────────────────────────────────────── */}
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
                        {/* ── Wave chart ─────────────────────────────────────── */}
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
                                        pct={pcts?.transferred_overall}
                                        trend={-(pcts?.transferred_overall ?? 0)}
                                        sub={`${pcts?.transferred_overall ?? 0}% of total`}
                                    />
                                    <StatCard
                                        icon={Users}
                                        iconColor="bg-orange-500/10 text-orange-500"
                                        label="User Requested Transfer"
                                        value={totals.user_requested_transfer_total.toLocaleString()}
                                        sub={`${pcts?.user_requested_transfer_overall ?? 0}% of total`}
                                    />
                                    <StatCard
                                        icon={PhoneCall}
                                        iconColor="bg-rose-500/10 text-rose-500"
                                        label="AI Initiated Transfer"
                                        value={totals.ai_initiated_transfer_total.toLocaleString()}
                                        sub={`${pcts?.ai_initiated_transfer_overall ?? 0}% of total`}
                                    />
                                    <StatCard
                                        icon={Brain}
                                        iconColor="bg-purple-500/10 text-purple-500"
                                        label="AI Deflected"
                                        value={totals.ai_handled_total.toLocaleString()}
                                        sub="no human needed"
                                    />
                                    <StatCard
                                        icon={CheckCircle2}
                                        iconColor="bg-emerald-500/10 text-emerald-500"
                                        label="AI Solved"
                                        value={totals.ai_solved_total.toLocaleString()}
                                        sub="total calls fully resolved by AI"
                                    />
                                    <StatCard
                                        icon={XCircle}
                                        iconColor="bg-red-500/10 text-red-500"
                                        label="AI Unresolved"
                                        value={totals.ai_failed_total.toLocaleString()}
                                        pct={pcts?.ai_failed_of_ai_handled}
                                        trend={-(pcts?.ai_failed_of_ai_handled ?? 0)}
                                        sub={`${pcts?.ai_failed_of_ai_handled ?? 0}% unresolved out of AI deflected`}
                                    />
                                    <StatCard
                                        icon={HelpCircle}
                                        iconColor="bg-slate-500/10 text-slate-500"
                                        label="Uncategorized Calls"
                                        value={(totals.ai_handled_total - (totals.ai_solved_total + totals.ai_failed_total)).toLocaleString()}
                                        sub="customer hang-up / no response"
                                    />
                                    <StatCard
                                        icon={TrendingUp}
                                        iconColor="bg-cyan-500/10 text-cyan-500"
                                        label="AI Solved (Percentage)"
                                        value={`${pcts?.ai_solved_of_ai_handled ?? 0}%`}
                                        sub="AI resolution success rate"
                                    />
                                    <StatCard
                                        icon={BarChart2}
                                        iconColor="bg-violet-500/10 text-violet-500"
                                        label="AI Deflected (Percentage)"
                                        value={`${totals.total_calls > 0 ? ((totals.ai_handled_total / totals.total_calls) * 100).toFixed(1) : 0}%`}
                                        sub="AI deflected calls out of total"
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
                                                {["Date", "Total", "Transferred", "User Requested", "AI Initiated", "AI Deflected", "AI Solved", "AI Unresolved", "Solved %"].map((h) => (
                                                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {aiSummaryData.daily.map((day, i) => (
                                                <tr key={i} className="border-t hover:bg-muted/20 transition-colors">
                                                    <td className="py-3 px-4 font-medium text-foreground whitespace-nowrap">{day.date}</td>
                                                    <td className="py-3 px-4 text-foreground">{day.total_calls}</td>
                                                    <td className="py-3 px-4">
                                                        <span className="text-amber-500 font-medium">{day.transferred_total}</span>
                                                        <span className="text-xs text-muted-foreground ml-1">({day.percentages.transferred_overall}%)</span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className="text-orange-500 font-medium">{day.user_requested_transfer_total}</span>
                                                        <span className="text-xs text-muted-foreground ml-1">({day.percentages.user_requested_transfer_overall}%)</span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className="text-rose-500 font-medium">{day.ai_initiated_transfer_total}</span>
                                                        <span className="text-xs text-muted-foreground ml-1">({day.percentages.ai_initiated_transfer_overall}%)</span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className="text-purple-500 font-medium">{day.ai_handled_total}</span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className="text-emerald-500 font-medium">{day.ai_solved_total}</span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className="text-red-500 font-medium">{day.ai_failed_total}</span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${day.percentages.ai_solved_of_ai_handled >= 50 ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"}`}>
                                                            {day.percentages.ai_solved_of_ai_handled}%
                                                        </span>
                                                    </td>
                                                </tr>
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
