import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplets, Moon, SmilePlus, Target } from "lucide-react";

const quickStats = [
  { title: "Hydration", value: "—", icon: Droplets, color: "text-wellness-hydration" },
  { title: "Sleep", value: "—", icon: Moon, color: "text-wellness-sleep" },
  { title: "Mood", value: "—", icon: SmilePlus, color: "text-wellness-mental" },
  { title: "Habits", value: "—", icon: Target, color: "text-wellness-fitness" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Daily Hub</h2>
        <p className="text-muted-foreground">
          Your personalized wellness overview
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`size-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                Start tracking to see data
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
