import { Skeleton } from "@/components/ui/skeleton"

export default function RefundChartSkeleton() {
  return (
    <div className="space-y-4">
      {/* Chart Skeleton */}
      <div className="w-full h-[400px] flex flex-col justify-end gap-2 p-4">
        <div className="flex items-end justify-around h-full gap-2">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex-1 flex flex-col justify-end items-center gap-2">
              <Skeleton 
                className="w-full rounded-t-lg" 
                style={{ height: `${Math.random() * 60 + 40}%` }}
              />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
      </div>
      {/* Legend Skeleton */}
      <div className="text-center">
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>
    </div>
  )
}
