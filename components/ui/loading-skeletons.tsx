import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-4 w-[200px] bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full bg-muted animate-pulse rounded" />
      </CardContent>
    </Card>
  );
}

export function WorkoutSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="h-8 w-[150px] bg-muted animate-pulse rounded mb-4" />
        <div className="h-[300px] w-full bg-muted animate-pulse rounded" />
      </CardContent>
    </Card>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="h-4 w-20 bg-muted animate-pulse rounded mb-2" />
            <div className="h-8 w-16 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
