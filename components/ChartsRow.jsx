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
    ResponsiveContainer
} from "recharts"

export default function ChartsRow({ activeCalls, stats }) {
    const callsComparisonData = [
        { name: "Active", calls: activeCalls || 0, fill: "#10b981" },
        { name: "Today", calls: stats?.calls_today || 0, fill: "#3b82f6" },
        { name: "Total", calls: stats?.total_calls || 0, fill: "#8b5cf6" }
    ]

    const routingData = [
        { name: "Today", value: stats?.routed_calls_today || 0, fill: "#3b82f6" },
        { name: "Lifetime", value: stats?.routed_calls_total || 0, fill: "#8b5cf6" }
    ]

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Calls Overview Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        Calls Overview
                    </CardTitle>
                    <CardDescription>Distribution of active, today's, and total calls</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={callsComparisonData}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "hsl(var(--background))",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: "8px"
                                }}
                            />
                            <Bar dataKey="calls" radius={[8, 8, 0, 0]}>
                                {callsComparisonData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
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