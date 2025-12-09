import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"

const SENTIMENT_COLORS = {
    positive: "#22c55e",
    neutral: "#64748b",
    negative: "#ef4444"
}

export default function SentimentAnalysis({ stats }) {
    const sentimentData = stats?.sentiment_distribution ? [
        {
            name: "Positive",
            value: stats.sentiment_distribution.positive.count,
            percentage: stats.sentiment_distribution.positive.percentage,
            fill: SENTIMENT_COLORS.positive
        },
        {
            name: "Neutral",
            value: stats.sentiment_distribution.neutral.count,
            percentage: stats.sentiment_distribution.neutral.percentage,
            fill: SENTIMENT_COLORS.neutral
        },
        {
            name: "Negative",
            value: stats.sentiment_distribution.negative.count,
            percentage: stats.sentiment_distribution.negative.percentage,
            fill: SENTIMENT_COLORS.negative
        }
    ] : []

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
        <Card className="mb-8 bg-gradient-to-br from-green-500/5 via-slate-500/5 to-red-500/5 border-2 border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="w-6 h-6 text-primary" />
                    Customer Sentiment Analysis
                </CardTitle>
                <CardDescription>
                    Voice agent performance based on {stats?.sentiment_distribution?.total_analyzed || 0} analyzed conversations
                </CardDescription>
            </CardHeader>
            <CardContent>
                {stats?.sentiment_distribution?.total_analyzed > 0 ? (
                    <div className="flex flex-col lg:flex-row items-center gap-8">
                        <div className="flex-1 w-full">
                            <ResponsiveContainer width="100%" height={350}>
                                <PieChart>
                                    <Pie
                                        data={sentimentData}
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
                                        {sentimentData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload
                                                return (
                                                    <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                                                        <p className="font-semibold text-sm mb-1">{data.name} Experience</p>
                                                        <p className="font-bold" style={{ color: data.fill }}>
                                                            Count: {data.value}
                                                        </p>
                                                        <p className="text-muted-foreground text-xs">
                                                            {data.percentage.toFixed(1)}% of conversations
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
                        <div className="flex-1 grid grid-cols-1 gap-4 w-full">
                            <div className="p-4 rounded-lg border-2 border-green-500/40 bg-green-500/10">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                        <p className="text-sm font-medium text-foreground">Positive</p>
                                    </div>
                                    <p className="text-xs text-green-500 font-semibold">
                                        {stats?.sentiment_distribution?.positive?.percentage?.toFixed(1) || 0}%
                                    </p>
                                </div>
                                <p className="text-3xl font-bold text-green-500">
                                    {stats?.sentiment_distribution?.positive?.count || 0}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">Happy customers</p>
                            </div>

                            <div className="p-4 rounded-lg border-2 border-slate-500/40 bg-slate-500/10">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-slate-500"></div>
                                        <p className="text-sm font-medium text-foreground">Neutral</p>
                                    </div>
                                    <p className="text-xs text-slate-500 font-semibold">
                                        {stats?.sentiment_distribution?.neutral?.percentage?.toFixed(1) || 0}%
                                    </p>
                                </div>
                                <p className="text-3xl font-bold text-slate-500">
                                    {stats?.sentiment_distribution?.neutral?.count || 0}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">Neutral experience</p>
                            </div>

                            <div className="p-4 rounded-lg border-2 border-red-500/40 bg-red-500/10">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <p className="text-sm font-medium text-foreground">Negative</p>
                                    </div>
                                    <p className="text-xs text-red-500 font-semibold">
                                        {stats?.sentiment_distribution?.negative?.percentage?.toFixed(1) || 0}%
                                    </p>
                                </div>
                                <p className="text-3xl font-bold text-red-500">
                                    {stats?.sentiment_distribution?.negative?.count || 0}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">Needs attention</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12 bg-muted/20 rounded-lg">
                        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <p className="text-muted-foreground">No sentiment data available</p>
                        <p className="text-sm text-muted-foreground mt-1">Start analyzing conversations to see sentiment distribution</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}