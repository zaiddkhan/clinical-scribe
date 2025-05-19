"use client";

import { MOCK_STATS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export function StatsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {MOCK_STATS.map((stat, index) => {
        const Icon = Icons[stat.icon as keyof typeof Icons];
        return (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                {Icon && <Icon className="h-4 w-4" />}
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={cn(
                "mt-1 text-xs",
                stat.change.startsWith("+") ? "text-emerald-500" : "text-rose-500"
              )}>
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}