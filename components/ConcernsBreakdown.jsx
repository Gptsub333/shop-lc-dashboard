import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare, RefreshCw, Phone, AlertTriangle, Activity, BarChart3, PieChart as PieChartIcon } from "lucide-react"
import DatePickerYMD from "./DatePickerYMD"
import Pie3DChart from "./Pie3DChart"
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
                {/* Sticky notes — categorization model */}
                <div className="flex flex-wrap gap-4 mb-6">
                    {/* Note 1: Current model */}
                    <div className="relative flex-1 min-w-[220px] max-w-xs rounded-2xl border border-sky-200 bg-sky-50 dark:bg-sky-950/30 dark:border-sky-800 px-5 py-4 shadow-sm overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full rounded-l-2xl bg-sky-400" />
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0" />
                            <p className="text-[10px] font-semibold text-sky-500 dark:text-sky-400 tracking-widest uppercase">Current Model</p>
                        </div>
                        <p className="text-sm font-semibold text-sky-900 dark:text-sky-100 leading-snug">Single call, single major concern</p>
                        <p className="text-xs text-sky-700/70 dark:text-sky-300/60 mt-1.5 leading-relaxed">Each call is assigned to one primary concern category only.</p>
                    </div>
                    {/* Note 2: In progress */}
                    {/* TODO: Remove or update this note once multi-categorization per call is live */}
                    <div className="relative flex-1 min-w-[220px] max-w-xs rounded-2xl border border-violet-200 bg-violet-50 dark:bg-violet-950/30 dark:border-violet-800 px-5 py-4 shadow-sm overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full rounded-l-2xl bg-violet-400" />
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse shrink-0" />
                            <p className="text-[10px] font-semibold text-violet-500 dark:text-violet-400 tracking-widest uppercase">In Progress</p>
                        </div>
                        <p className="text-sm font-semibold text-violet-900 dark:text-violet-100 leading-snug">Multi-concern categorization</p>
                        <p className="text-xs text-violet-700/70 dark:text-violet-300/60 mt-1.5 leading-relaxed">Support for tagging a single call across multiple concern types is under integration.</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
                    <DatePickerYMD label="Start Date" value={concernsStartDate} onChange={setConcernsStartDate} />
                    <DatePickerYMD label="End Date" value={concernsEndDate} onChange={setConcernsEndDate} />
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
                                            <Pie3DChart
                                                data={summaryData.map((d) => ({ name: d.name, value: d.value, fill: d.fill }))}
                                                height={320}
                                                showPercentLabels={false}
                                            />
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
                                handledByAva={[
                                    "Order status inquiry",
                                    "Order not delivered / delayed",
                                ]}
                            />

                            <CategoryPieChart
                                title="Refunds Concerns"
                                icon={<AlertTriangle className="w-5 h-5" />}
                                color="red"
                                total={concernsData.refunds.total}
                                percentage={concernsData.refunds.percentage}
                                data={refundsConcernsData}
                                handledByAva={[
                                    "Refund status check",
                                    "Refund policy questions",
                                    "Partial refund inquiry",
                                    "Refund timeline / processing time",
                                ]}
                            />

                            <CategoryPieChart
                                title="Budget Pay Concerns"
                                icon={<Activity className="w-5 h-5" />}
                                color="green"
                                total={concernsData.budget_pay.total}
                                percentage={concernsData.budget_pay.percentage}
                                data={budgetPayConcernsData}
                                handledByAva={[
                                    "Budget Pay balance inquiry",
                                    "Outstanding amount questions",
                                    "Payment schedule",
                                ]}
                            />

                            {/* Policies — Ava handles everything */}
                            <CategoryPieChart
                                title="Policies Concerns"
                                icon={<BarChart3 className="w-5 h-5" />}
                                color="purple"
                                total={concernsData.policies.total}
                                percentage={concernsData.policies.percentage}
                                data={policiesConcernsData}
                                allHandled
                            />
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

function LegendRow({ item }) {
    return (
        <div className="flex items-center gap-2 text-sm">
            <span
                className="inline-block w-3 h-3 rounded-sm flex-shrink-0"
                style={{ backgroundColor: item.fill }}
            />
            <span className="text-foreground flex-1 leading-tight">{item.name}</span>
            <span className="font-semibold text-foreground tabular-nums">{item.pct.toFixed(1)}%</span>
            <span
                className="font-bold tabular-nums px-1.5 py-0.5 rounded text-xs"
                style={{ backgroundColor: item.fill + "22", color: item.fill }}
            >
                {item.value}
            </span>
        </div>
    )
}

function CategoryPieChart({ title, icon, color, total, percentage, data, handledByAva, allHandled }) {
    const colorClass = {
        blue: "text-blue-500 border-blue-500/20",
        red: "text-red-500 border-red-500/20",
        green: "text-green-500 border-green-500/20",
        purple: "text-purple-500 border-purple-500/20"
    }[color]

    const TRACKING_NUMBER_PINK = "#ec4899"

    const pieData = data.map((d, index) => ({
        name: d.name,
        value: d.value,
        fill: (() => {
            const name = (d.name || "").toLowerCase()
            if (name.includes("tracking") && name.includes("number")) return TRACKING_NUMBER_PINK
            return COLORS[index % COLORS.length]
        })()
    }))
    const totalVal = pieData.reduce((s, d) => s + d.value, 0)
    const legendItems = pieData.map((d) => ({
        ...d,
        pct: totalVal > 0 ? (d.value / totalVal) * 100 : 0
    }))

    // Split into Ava-handled vs not-handled groups when handledByAva is provided.
    // "others" (case-insensitive) always goes last in whichever group it falls into.
    const isOther = (name) => (name || "").toLowerCase().trim() === "others"
    const isHandled = (name) => handledByAva?.some(
        (h) => h.toLowerCase() === (name || "").toLowerCase()
    )

    const sortWithOthersLast = (arr) => [
        ...arr.filter((i) => !isOther(i.name)),
        ...arr.filter((i) => isOther(i.name)),
    ]

    const handledItems   = handledByAva ? sortWithOthersLast(legendItems.filter((i) => isHandled(i.name)))  : []
    const unhandledItems = handledByAva ? sortWithOthersLast(legendItems.filter((i) => !isHandled(i.name))) : []

    return (
        <Card className={colorClass.split(" ")[1]}>
            <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${colorClass.split(" ")[0]}`}>
                    {icon}
                    {title}
                </CardTitle>
                <CardDescription>
                    {total} conversations
                </CardDescription>
            </CardHeader>
            <CardContent>
                {data.length > 0 ? (
                    <>
                        <Pie3DChart data={pieData} height={320} showPercentLabels={false} />

                        <div className="mt-5 space-y-3 select-text">
                            {/* What Ava Handles panel — shown for all charts */}
                            {(allHandled || handledItems.length > 0) && (
                                <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 px-4 pt-3 pb-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                                            What Ava Handles
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        {(allHandled ? sortWithOthersLast(legendItems) : handledItems).map((item) => (
                                            <LegendRow key={item.name} item={item} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* What Ava Doesn't Handle panel — only when handledByAva is set (not allHandled) */}
                            {!allHandled && unhandledItems.length > 0 && (
                                <div className="rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30 px-4 pt-3 pb-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-rose-500 dark:text-rose-400">
                                            What Ava Doesn&apos;t Handle
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        {unhandledItems.map((item) => (
                                            <LegendRow key={item.name} item={item} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* No handledByAva and not allHandled — plain flat legend (fallback) */}
                            {!handledByAva && !allHandled && sortWithOthersLast(legendItems).map((item) => (
                                <LegendRow key={item.name} item={item} />
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        No {title.toLowerCase()} data
                    </div>
                )}
            </CardContent>
        </Card>
    )
}