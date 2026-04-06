import { Card, CardContent } from "@/components/ui/card"
import { PhoneCall, Phone, ShoppingCart, TrendingUp, ArrowRightLeft } from "lucide-react"

const KPI_CARDS = (activeCalls, stats, summary) => {
    const totals = summary?.totals
    return [
        {
            label: "Active Calls",
            value: activeCalls?.count ?? "—",
            sub: "Live right now",
            icon: PhoneCall,
            color: "text-green-500",
            bg: "bg-green-500/10",
            border: "border-l-green-500",
        },
        {
            label: "Calls Today",
            value: stats?.calls_today?.toLocaleString() ?? "—",
            sub: "Received today",
            icon: Phone,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            border: "border-l-blue-500",
        },
        {
            label: "Orders Today",
            value: stats?.orders_placed_today?.toLocaleString() ?? "—",
            sub: "Placed today",
            icon: ShoppingCart,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            border: "border-l-emerald-500",
        },
        {
            label: "AI Resolution Rate",
            value: totals ? `${totals.ai_resolution_rate}%` : "—",
            sub: `${totals?.fully_resolved_by_ai?.toLocaleString() ?? 0} calls fully resolved`,
            icon: TrendingUp,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            border: "border-l-purple-500",
        },
        {
            label: "Transfer Rate",
            value: totals ? `${totals.transfer_rate}%` : "—",
            sub: `${totals?.transferred ?? 0} transferred calls`,
            icon: ArrowRightLeft,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            border: "border-l-amber-500",
        },
    ]
}

export default function KPISection({ stats, activeCalls, summary }) {
    const cards = KPI_CARDS(activeCalls, stats, summary)

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {cards.map((c) => {
                const Icon = c.icon
                return (
                    <Card key={c.label} className={`relative overflow-hidden border-l-4 ${c.border}`}>
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-muted-foreground mb-1 truncate">{c.label}</p>
                                    <p className="text-3xl font-bold text-foreground">{c.value}</p>
                                    <p className="text-xs text-muted-foreground mt-1.5 leading-tight">{c.sub}</p>
                                </div>
                                <div className={`w-12 h-12 rounded-full ${c.bg} flex items-center justify-center flex-shrink-0 ml-3`}>
                                    <Icon className={`w-6 h-6 ${c.color}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
