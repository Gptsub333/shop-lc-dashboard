import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"
import Pie3DChart from "./Pie3DChart"

const SENTIMENT_COLORS = {
    positive: "#22c55e",
    neutral: "#64748b",
    negative: "#ef4444"
}

export default function SentimentAnalysis({ stats }) {
    const sentimentData = stats?.sentiment_distribution
        ? [
            { name: "Positive", value: stats.sentiment_distribution.positive.count, fill: SENTIMENT_COLORS.positive },
            { name: "Neutral", value: stats.sentiment_distribution.neutral.count, fill: SENTIMENT_COLORS.neutral },
            { name: "Negative", value: stats.sentiment_distribution.negative.count, fill: SENTIMENT_COLORS.negative }
        ].filter((d) => d.value > 0)
        : []

    const total = sentimentData.reduce((s, d) => s + d.value, 0)
    const legendItems = sentimentData.map((d) => ({
        ...d,
        pct: total > 0 ? (d.value / total) * 100 : 0
    }))

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
                            {sentimentData.length > 0 ? (
                                <>
                                    <Pie3DChart data={sentimentData} height={320} />
                                    <div className="flex justify-center gap-6 mt-4 flex-wrap">
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
                                <div className="text-center py-12 text-muted-foreground">No sentiment distribution data</div>
                            )}
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