"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, RefreshCw } from "lucide-react"
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer
} from "recharts"
import DatePickerYMD from "@/components/DatePickerYMD"

const LINES = [
    { key: "Calls",       color: "#3b82f6", gradId: "gCalls"       },
    { key: "Orders",      color: "#22c55e", gradId: "gOrders"      },
    { key: "Transferred", color: "#f59e0b", gradId: "gTransferred" },
    { key: "Dropped",     color: "#ef4444", gradId: "gDropped"     },
]

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null
    return (
        <div className="bg-background border border-border rounded-lg px-3 py-2 shadow-lg text-xs">
            <p className="font-semibold text-foreground mb-1">{label}</p>
            {payload.map((p) => (
                <p key={p.dataKey} style={{ color: p.color }}>{p.name}: <b>{p.value}</b></p>
            ))}
        </div>
    )
}

export default function DailyTrendSection({ data, loading, startDate, setStartDate, endDate, setEndDate, onFetch }) {
    const chartData = data?.days?.map((d) => ({
        date: d.date.slice(5),
        Calls: d.total_calls,
        Orders: d.orders_confirmed,
        Transferred: d.transferred,
        Dropped: d.dropped,
    })) ?? []

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2 mb-1">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            Daily Performance Trend
                        </CardTitle>
                        <CardDescription>
                            Call outcomes per day
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
                    <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">Loading...</div>
                ) : chartData.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">No data for selected range</div>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                            <defs>
                                {LINES.map(({ color, gradId }) => (
                                    <linearGradient key={gradId} id={gradId} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                                    </linearGradient>
                                ))}
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            {LINES.map(({ key, color, gradId }) => (
                                <Area
                                    key={key}
                                    type="monotone"
                                    dataKey={key}
                                    stroke={color}
                                    fill={`url(#${gradId})`}
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 4 }}
                                />
                            ))}
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    )
}
