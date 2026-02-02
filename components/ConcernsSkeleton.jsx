import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ConcernsSkeleton() {
  return (
    <div className="space-y-8">
      {/* Summary Pie Chart Skeleton */}
      <Card className="bg-linear-to-br from-primary/5 to-primary/10 border-primary/30">
        <CardHeader>
          <Skeleton className="h-6 w-64 mb-2" />
          <Skeleton className="h-4 w-80" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Pie chart skeleton */}
            <div className="flex-1 w-full flex items-center justify-center">
              <Skeleton className="w-[300px] h-[300px] rounded-full" />
            </div>
            {/* Stats grid skeleton */}
            <div className="flex-1 grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-4 rounded-lg border-2 border-muted">
                  <Skeleton className="h-3 w-20 mb-2" />
                  <Skeleton className="h-8 w-12 mb-2" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Category Pie Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                {/* Pie chart skeleton */}
                <Skeleton className="w-[250px] h-[250px] rounded-full" />
                {/* Legend items skeleton */}
                <div className="w-full space-y-2">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Skeleton className="w-4 h-4 rounded" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
