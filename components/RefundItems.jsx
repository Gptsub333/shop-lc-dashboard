import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, RefreshCw, BarChart3 } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from "recharts"
import RefundItemsSkeleton from "./RefundItemsSkeleton"
import RefundChartSkeleton from "./RefundChartSkeleton"

const COLORS = ["#ef4444", "#f59e0b", "#eab308", "#84cc16", "#22c55e", "#14b8a6", "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6"]

export default function RefundItems({ onFetch, refundItems, refundLoading, startDate, setStartDate, endDate, setEndDate, formatDate }) {
    const refundChartData = refundItems.slice(0, 10).map((item, index) => ({
        name: `Item ${index + 1}`,
        count: item.refund_count,
        fullName: item.item_description
    }))

    return (
        <Card className="border-red-500/20">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                            Most Refunded Items
                        </CardTitle>
                        <CardDescription>Track problematic products and customer returns</CardDescription>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onFetch}
                        disabled={refundLoading}
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${refundLoading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="table" className="w-full">
                    <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
                        <TabsTrigger value="table">Table View</TabsTrigger>
                        <TabsTrigger value="chart">Chart View</TabsTrigger>
                    </TabsList>

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
                            <Button onClick={onFetch} disabled={refundLoading} className="w-full sm:w-auto">
                                {refundLoading ? "Searching..." : "Search"}
                            </Button>
                        </div>
                    </div>

                    <TabsContent value="table" className="mt-0">
                        {refundLoading ? (
                            <RefundItemsSkeleton />
                        ) : refundItems.length === 0 ? (
                            <div className="text-center py-12 bg-muted/20 rounded-lg">
                                <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                                <p className="text-muted-foreground">No refunded items found</p>
                                <p className="text-sm text-muted-foreground mt-1">Try adjusting your date range</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-lg border">
                                <table className="w-full">
                                    <thead className="bg-muted/50">
                                        <tr>
                                            <th className="text-left py-4 px-4 text-sm font-semibold text-foreground">Rank</th>
                                            <th className="text-left py-4 px-4 text-sm font-semibold text-foreground">Item Description</th>
                                            <th className="text-center py-4 px-4 text-sm font-semibold text-foreground">Refund Count</th>
                                            <th className="text-center py-4 px-4 text-sm font-semibold text-foreground">First Refund</th>
                                            <th className="text-center py-4 px-4 text-sm font-semibold text-foreground">Last Refund</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {refundItems.map((item, index) => (
                                            <tr
                                                key={index}
                                                className="border-t hover:bg-muted/30 transition-colors"
                                            >
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${index === 0 ? "bg-red-500/20 text-red-500" :
                                                            index === 1 ? "bg-orange-500/20 text-orange-500" :
                                                                index === 2 ? "bg-yellow-500/20 text-yellow-500" :
                                                                    "bg-muted text-muted-foreground"
                                                            }`}>
                                                            {index + 1}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 text-sm text-foreground max-w-md">
                                                    <div className="line-clamp-2">{item.item_description}</div>
                                                </td>
                                                <td className="py-4 px-4 text-center">
                                                    <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-full bg-red-500/10 text-red-500 text-sm font-bold">
                                                        {item.refund_count}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-center text-sm text-muted-foreground">
                                                    {formatDate(item.first_refund_date)}
                                                </td>
                                                <td className="py-4 px-4 text-center text-sm text-muted-foreground">
                                                    {formatDate(item.last_refund_date)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="chart" className="mt-0">
                        {refundLoading ? (
                            <RefundChartSkeleton />
                        ) : refundChartData.length === 0 ? (
                            <div className="text-center py-12 bg-muted/20 rounded-lg">
                                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                                <p className="text-muted-foreground">No data to visualize</p>
                            </div>
                        ) : (
                            <div>
                                <ResponsiveContainer width="100%" height={400}>
                                    <BarChart data={refundChartData}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="bg-background border border-border rounded-lg p-3 shadow-lg max-w-xs">
                                                            <p className="font-semibold text-sm mb-1">{payload[0].payload.fullName}</p>
                                                            <p className="text-red-500 font-bold">Refunds: {payload[0].value}</p>
                                                        </div>
                                                    )
                                                }
                                                return null
                                            }}
                                        />
                                        <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                                            {refundChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                                <div className="mt-4 text-center text-sm text-muted-foreground">
                                    Showing top {refundChartData.length} most refunded items
                                </div>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}