import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, ShieldCheck, Clock } from "lucide-react"
import Pie3DChart from "./Pie3DChart"

const CALL_OVERVIEW_COLORS = {
    avaVoice: "#8b5cf6",
    transferred: "#3b82f6",
}

function parseDurationToMinutes(str) {
    if (!str) return 0
    const hours = str.match(/(\d+)h/)
    const mins = str.match(/(\d+)m/)
    const secs = str.match(/(\d+)s/)
    return (hours ? parseInt(hours[1]) * 60 : 0) +
        (mins ? parseInt(mins[1]) : 0) +
        (secs ? parseInt(secs[1]) / 60 : 0)
}

function formatMinutes(totalMins) {
    if (!totalMins || totalMins <= 0) return "—"
    const h = Math.floor(totalMins / 60)
    const m = Math.round(totalMins % 60)
    if (h > 0) return `${h}h ${m}m`
    return `${m}m`
}

export default function ChartsRow({ activeCalls, stats }) {
    const callsToday = stats?.calls_today ?? 0
    const routedToday = stats?.routed_calls_today ?? 0
    const aiHandledToday = Math.max(0, callsToday - routedToday)
    const totalToday = aiHandledToday + routedToday

    const pie3DData = [
        { name: "Ava Voice", value: aiHandledToday, fill: CALL_OVERVIEW_COLORS.avaVoice },
        { name: "Transferred to Human", value: routedToday, fill: CALL_OVERVIEW_COLORS.transferred },
    ].filter((d) => d.value > 0)

    const legendItems = pie3DData.map((d) => ({
        ...d,
        pct: totalToday > 0 ? (d.value / totalToday) * 100 : 0,
    }))

    // ── Lifetime efficiency calculations (all unique, not shown elsewhere) ──
    const totalCalls = stats?.total_calls ?? 0
    const routedTotal = stats?.routed_calls_total ?? 0
    const aiContainedLifetime = Math.max(0, totalCalls - routedTotal)
    const containmentRate = totalCalls > 0 ? ((aiContainedLifetime / totalCalls) * 100).toFixed(1) : "0.0"

    const avgMins = parseDurationToMinutes(stats?.average_call_duration)
    const lifetimeSavedMins = Math.round(aiContainedLifetime * avgMins)
    const lifetimeSavedStr = formatMinutes(lifetimeSavedMins)

    const rateColor = { text: "text-emerald-500", light: "bg-emerald-500/10", border: "border-emerald-500/30", bar: "bg-emerald-500" }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Calls Overview – 3D pie: Ava Voice vs Transferred to Human */}
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
                            <div className="flex justify-center gap-8 mt-4">
                                {legendItems.map((item) => (
                                    <div key={item.name} className="flex items-center gap-2">
                                        <span
                                            className="inline-block w-3 h-3 rounded-sm flex-shrink-0"
                                            style={{ backgroundColor: item.fill }}
                                        />
                                        <span className="text-sm text-muted-foreground">{item.name}</span>
                                        <span className="text-sm font-semibold text-foreground">{item.pct.toFixed(1)}%</span>
                                        <span className="text-sm font-medium text-muted-foreground">({item.value})</span>
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

            {/* Lifetime AI Efficiency */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                        Lifetime AI Efficiency
                    </CardTitle>
                    <CardDescription>Overall AI containment and agent time saved</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">

                    {/* Containment Rate – headline KPI */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">AI Deflection Rate</p>
                            <p className={`text-5xl font-black ${rateColor.text}`}>{containmentRate}%</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {aiContainedLifetime.toLocaleString()} of {totalCalls.toLocaleString()} lifetime calls resolved without a human
                            </p>
                        </div>
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            <ShieldCheck className={`w-7 h-7 ${rateColor.text}`} />
                        </div>
                    </div>

                    {/* Containment progress bar */}
                    <div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                            <span>AI Contained</span>
                            <span>Transferred to Human</span>
                        </div>
                        <div className="w-full h-3 rounded-full overflow-hidden flex bg-muted">
                            <div className={`h-full ${rateColor.bar} transition-all`} style={{ width: `${containmentRate}%` }} />
                            <div className="h-full bg-blue-500/60 transition-all" style={{ width: `${100 - parseFloat(containmentRate)}%` }} />
                        </div>
                        <div className="flex justify-between text-xs font-semibold mt-1">
                            <span className={rateColor.text}>{aiContainedLifetime.toLocaleString()} calls</span>
                            <span className="text-blue-500">{routedTotal.toLocaleString()} calls</span>
                        </div>
                    </div>

                    {/* Agent Time Saved (lifetime) */}
                    <div className="p-4 rounded-xl bg-muted/50 border border-border flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Clock className="w-4 h-4 text-cyan-500" />
                                <p className="text-xs font-medium text-muted-foreground">Agent Time Saved (Lifetime)</p>
                            </div>
                            <p className="text-3xl font-bold text-cyan-500">{lifetimeSavedStr}</p>
                            <p className="text-xs text-muted-foreground mt-1">estimated hours saved by Ava across all calls</p>
                        </div>
                        <div className="w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                            <Clock className="w-6 h-6 text-cyan-500" />
                        </div>
                    </div>

                </CardContent>
            </Card>
        </div>
    )
}