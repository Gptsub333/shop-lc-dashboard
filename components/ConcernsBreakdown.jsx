import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageSquare, RefreshCw, Phone, AlertTriangle, Activity, BarChart3, PieChart as PieChartIcon } from "lucide-react"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"
import ConcernsSkeleton from "./ConcernsSkeleton"

const COLORS = ["#ef4444", "#f59e0b", "#eab308", "#84cc16", "#22c55e", "#14b8a6", "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6"]

const CONCERN_COLORS = {
    orders: "#3b82f6",
    refunds: "#ef4444",
    budget_pay: "#22c55e",
    policies: "#8b5cf6"
}

export default function ConcernsBreakdown({ onFetch, concernsData, concernsLoading, concernsStartDate, setConcernsStartDate, concernsEndDate, setConcernsEndDate }) {
    // FIXED: Removed the filter that excluded "others"
    const prepareConcernsPieData = (categoryData) => {
        if (!categoryData || !categoryData.concerns) return []

        return Object.entries(categoryData.concerns)
            .filter(([key, value]) => value.count > 0) // Only filter by count > 0, INCLUDE "others"
            .map(([name, data]) => ({
                name: name,
                value: data.count,
                percentage: data.percentage // Use API percentage for individual charts
            }))
            .sort((a, b) => b.value - a.value)
    }

    const ordersConcernsData = concernsData ? prepareConcernsPieData(concernsData.orders) : []
    const refundsConcernsData = concernsData ? prepareConcernsPieData(concernsData.refunds) : []
    const budgetPayConcernsData = concernsData ? prepareConcernsPieData(concernsData.budget_pay) : []
    const policiesConcernsData = concernsData ? prepareConcernsPieData(concernsData.policies) : []

    // Calculate total concerns and percentages for summary chart
    const summaryData = concernsData ? (() => {
        const categories = [
            { name: "Orders", value: concernsData.orders.total, fill: CONCERN_COLORS.orders },
            { name: "Refunds", value: concernsData.refunds.total, fill: CONCERN_COLORS.refunds },
            { name: "Budget Pay", value: concernsData.budget_pay.total, fill: CONCERN_COLORS.budget_pay },
            { name: "Policies", value: concernsData.policies.total, fill: CONCERN_COLORS.policies }
        ].filter(item => item.value > 0)

        // Calculate total concerns (x)
        const totalConcerns = categories.reduce((sum, item) => sum + item.value, 0)

        // Calculate percentage for each category: (y/x) * 100
        return categories.map(item => ({
            ...item,
            percentage: totalConcerns > 0 ? (item.value / totalConcerns) * 100 : 0
        }))
    })() : []

    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }) => {
        if (percentage < 5) return null
        const RADIAN = Math.PI / 180
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5
        const x = cx + radius * Math.cos(-midAngle * RADIAN)
        const y = cy + radius * Math.sin(-midAngle * RADIAN)

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? "start" : "end"}
                dominantBaseline="central"
                className="text-xs font-bold"
            >
                {`${percentage.toFixed(1)}%`}
            </text>
        )
    }

    return (
        <Card className="mb-8 border-2 border-primary/20">
            <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2 mb-2">
                            <MessageSquare className="w-6 h-6 text-primary" />
                            Customer Concerns Breakdown
                        </CardTitle>
                        <CardDescription>
                            Analyze customer concerns by category with detailed breakdowns
                            {concernsData?.summary && (
                                <span className="block mt-1 text-xs">
                                    Analyzed {concernsData.summary.total_conversations_analyzed} conversations
                                    ({concernsData.summary.conversations_with_categories} with categories)
                                </span>
                            )}
                        </CardDescription>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onFetch}
                        disabled={concernsLoading}
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${concernsLoading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                        <label className="text-sm font-medium text-foreground mb-2 block">Start Date</label>
                        <Input
                            type="date"
                            value={concernsStartDate}
                            onChange={(e) => setConcernsStartDate(e.target.value)}
                            className="w-full"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="text-sm font-medium text-foreground mb-2 block">End Date</label>
                        <Input
                            type="date"
                            value={concernsEndDate}
                            onChange={(e) => setConcernsEndDate(e.target.value)}
                            className="w-full"
                        />
                    </div>
                    <div className="flex items-end">
                        <Button onClick={onFetch} disabled={concernsLoading} className="w-full sm:w-auto">
                            {concernsLoading ? "Searching..." : "Search"}
                        </Button>
                    </div>
                </div>

                {concernsLoading ? (
                    <ConcernsSkeleton />
                ) : !concernsData ? (
                    <div className="text-center py-12 bg-muted/20 rounded-lg">
                        <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <p className="text-muted-foreground">No concerns data available</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Summary Pie Chart */}
                        <Card className="bg-linear-to-br from-primary/5 to-primary/10 border-primary/30">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <PieChartIcon className="w-5 h-5 text-primary" />
                                    Overall Category Distribution
                                </CardTitle>
                                <CardDescription>Summary of all customer concerns across categories</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {summaryData.length > 0 ? (
                                    <div className="flex flex-col lg:flex-row items-center gap-8">
                                        <div className="flex-1 w-full">
                                            <ResponsiveContainer width="100%" height={350}>
                                                <PieChart>
                                                    <Pie
                                                        data={summaryData}
                                                        cx="50%"
                                                        cy="50%"
                                                        labelLine={false}
                                                        label={renderCustomLabel}
                                                        outerRadius={120}
                                                        fill="#8884d8"
                                                        dataKey="value"
                                                        animationBegin={0}
                                                        animationDuration={800}
                                                    >
                                                        {summaryData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip
                                                        content={({ active, payload }) => {
                                                            if (active && payload && payload.length) {
                                                                const data = payload[0].payload
                                                                return (
                                                                    <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                                                                        <p className="font-semibold text-sm mb-1">{data.name}</p>
                                                                        <p className="text-primary font-bold">Count: {data.value}</p>
                                                                        <p className="text-muted-foreground text-xs">
                                                                            {data.percentage.toFixed(1)}% of total
                                                                        </p>
                                                                    </div>
                                                                )
                                                            }
                                                            return null
                                                        }}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="flex-1 grid grid-cols-2 gap-4">
                                            {summaryData.map((item, index) => (
                                                <div
                                                    key={index}
                                                    className="p-4 rounded-lg border-2"
                                                    style={{ borderColor: item.fill + "40", backgroundColor: item.fill + "10" }}
                                                >
                                                    <p className="text-xs text-muted-foreground mb-1">{item.name}</p>
                                                    <p className="text-2xl font-bold" style={{ color: item.fill }}>
                                                        {item.value}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {item.percentage.toFixed(1)}%
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-muted-foreground">No category data available</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Individual Category Pie Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <CategoryPieChart
                                title="Orders Concerns"
                                icon={<Phone className="w-5 h-5" />}
                                color="blue"
                                total={concernsData.orders.total}
                                percentage={concernsData.orders.percentage}
                                data={ordersConcernsData}
                            />

                            <CategoryPieChart
                                title="Refunds Concerns"
                                icon={<AlertTriangle className="w-5 h-5" />}
                                color="red"
                                total={concernsData.refunds.total}
                                percentage={concernsData.refunds.percentage}
                                data={refundsConcernsData}
                            />

                            <CategoryPieChart
                                title="Budget Pay Concerns"
                                icon={<Activity className="w-5 h-5" />}
                                color="green"
                                total={concernsData.budget_pay.total}
                                percentage={concernsData.budget_pay.percentage}
                                data={budgetPayConcernsData}
                            />

                            <CategoryPieChart
                                title="Policies Concerns"
                                icon={<BarChart3 className="w-5 h-5" />}
                                color="purple"
                                total={concernsData.policies.total}
                                percentage={concernsData.policies.percentage}
                                data={policiesConcernsData}
                            />
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

function CategoryPieChart({ title, icon, color, total, percentage, data }) {
    const colorClass = {
        blue: "text-blue-500 border-blue-500/20",
        red: "text-red-500 border-red-500/20",
        green: "text-green-500 border-green-500/20",
        purple: "text-purple-500 border-purple-500/20"
    }[color]

    return (
        <Card className={colorClass.split(' ')[1]}>
            <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${colorClass.split(' ')[0]}`}>
                    {icon}
                    {title}
                </CardTitle>
                <CardDescription>
                    {total} conversations
                </CardDescription>
            </CardHeader>
            <CardContent>
                {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                                animationBegin={0}
                                animationDuration={800}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload
                                        return (
                                            <div className="bg-background border border-border rounded-lg p-3 shadow-lg max-w-xs">
                                                <p className="font-semibold text-sm mb-1">{data.name}</p>
                                                <p className={colorClass.split(' ')[0] + " font-bold"}>Count: {data.value}</p>
                                                <p className="text-muted-foreground text-xs">
                                                    {data.percentage.toFixed(1)}% of category
                                                </p>
                                            </div>
                                        )
                                    }
                                    return null
                                }}
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                content={({ payload }) => (
                                    <div className="flex flex-wrap gap-2 justify-center mt-4">
                                        {payload && payload.map((entry, index) => (
                                            <div key={`legend-${index}`} className="flex items-center gap-1 text-xs">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: entry.color }}
                                                />
                                                <span className="text-muted-foreground truncate max-w-[120px]">
                                                    {entry.value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        No {title.toLowerCase()} data
                    </div>
                )}
            </CardContent>
        </Card>
    )
}