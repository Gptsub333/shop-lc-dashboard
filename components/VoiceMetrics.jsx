import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Timer, Activity, Clock } from "lucide-react"

export default function VoiceMetrics({ stats }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-500" />
                        Total Calls
                    </CardTitle>
                    <CardDescription>Total call volume</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-5xl font-bold text-blue-500 mb-2">
                                {(stats?.total_calls ?? 0).toLocaleString()}
                            </p>
                            <p className="text-sm text-muted-foreground">All time</p>
                        </div>
                        <div className="w-24 h-24 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <Activity className="w-12 h-12 text-blue-500" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/5 to-purple-500/10 border-purple-500/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Timer className="w-5 h-5 text-purple-500" />
                        Total Hours Spoken
                    </CardTitle>
                    <CardDescription>Lifetime agent talk time</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-5xl font-bold text-purple-500 mb-2">
                                {stats?.hours_talked_total || "0h 0m"}
                            </p>
                            <p className="text-sm text-muted-foreground">All-time conversation time</p>
                        </div>
                        <div className="w-24 h-24 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <Clock className="w-12 h-12 text-purple-500" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
