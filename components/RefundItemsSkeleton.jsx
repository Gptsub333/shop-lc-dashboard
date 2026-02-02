import { Skeleton } from "@/components/ui/skeleton"

export default function RefundItemsSkeleton() {
  return (
    <div className="space-y-4">
      {/* Table Header Skeleton */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left py-4 px-4">
                <Skeleton className="h-4 w-12" />
              </th>
              <th className="text-left py-4 px-4">
                <Skeleton className="h-4 w-32" />
              </th>
              <th className="text-center py-4 px-4">
                <Skeleton className="h-4 w-24 mx-auto" />
              </th>
              <th className="text-center py-4 px-4">
                <Skeleton className="h-4 w-24 mx-auto" />
              </th>
              <th className="text-center py-4 px-4">
                <Skeleton className="h-4 w-24 mx-auto" />
              </th>
            </tr>
          </thead>
          <tbody>
            {[...Array(10)].map((_, index) => (
              <tr key={index} className="border-t">
                <td className="py-4 px-4">
                  <Skeleton className="h-6 w-8" />
                </td>
                <td className="py-4 px-4">
                  <Skeleton className="h-5 w-full max-w-md" />
                </td>
                <td className="py-4 px-4">
                  <Skeleton className="h-6 w-12 mx-auto" />
                </td>
                <td className="py-4 px-4">
                  <Skeleton className="h-4 w-28 mx-auto" />
                </td>
                <td className="py-4 px-4">
                  <Skeleton className="h-4 w-28 mx-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
