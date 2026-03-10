import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, PhoneIncoming } from "lucide-react"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Cell,
    ResponsiveContainer,
} from "recharts"
import Pie3DChart from "./Pie3DChart"

const CALL_OVERVIEW_COLORS = {
    avaVoice: "#8b5cf6",
    transferred: "#3b82f6",
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

    const routingData = [
        { name: "Today", value: stats?.routed_calls_today || 0, fill: "#3b82f6" },
        { name: "Lifetime", value: stats?.routed_calls_total || 0, fill: "#8b5cf6" },
    ]

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
                                        <span className="text-sm text-muted-foreground">
                                            {item.name}
                                        </span>
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
    )
}