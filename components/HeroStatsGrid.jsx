import { Card, CardContent } from "@/components/ui/card"
import { Phone, PhoneCall, Clock, Activity } from "lucide-react"

export default function HeroStatsGrid({ activeCalls, stats }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Active Calls */}
            <Card className="relative overflow-hidden border-l-4 border-l-green-500">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Active Calls</p>
                            <p className="text-3xl font-bold text-foreground">{activeCalls}</p>
                            <p className="text-xs text-muted-foreground mt-2">Currently in progress</p>
                        </div>
                        <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center">
                            <PhoneCall className="w-7 h-7 text-green-500" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Today's Calls */}
            <Card className="relative overflow-hidden border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Calls Today</p>
                            <p className="text-3xl font-bold text-foreground">{stats?.calls_today || 0}</p>
                            <p className="text-xs text-muted-foreground mt-2">Since midnight</p>
                        </div>
                        <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <Phone className="w-7 h-7 text-blue-500" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Avg Duration */}
            <Card className="relative overflow-hidden border-l-4 border-l-amber-500">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Avg Duration</p>
                            <p className="text-3xl font-bold text-foreground">{stats?.average_call_duration || "0m"}</p>
                            <p className="text-xs text-muted-foreground mt-2">Per session</p>
                        </div>
                        <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center">
                            <Clock className="w-7 h-7 text-amber-500" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Total Calls */}
            <Card className="relative overflow-hidden border-l-4 border-l-purple-500">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Total Calls</p>
                            <p className="text-3xl font-bold text-foreground">{stats?.total_calls || 0}</p>
                            <p className="text-xs text-muted-foreground mt-2">All time</p>
                        </div>
                        <div className="w-14 h-14 rounded-full bg-purple-500/10 flex items-center justify-center">
                            <Activity className="w-7 h-7 text-purple-500" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}