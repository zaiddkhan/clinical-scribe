"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PatientFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  patientCount: number;
}

export function PatientFilters({
  activeFilter,
  onFilterChange,
  patientCount,
}: PatientFiltersProps) {
  const filters = [
    { id: "all", name: "All Patients" },
    { id: "recent", name: "Recently Seen" },
    { id: "followup", name: "Needs Follow-up" },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Filters</CardTitle>
        <CardDescription>
          {patientCount} patient{patientCount !== 1 ? "s" : ""} found
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {filters.map((filter) => (
            <Button
              key={filter.id}
              variant="ghost"
              className={cn(
                "w-full justify-start",
                activeFilter === filter.id && "bg-primary/10"
              )}
              onClick={() => onFilterChange(filter.id)}
            >
              {filter.name}
              {filter.id === "followup" && (
                <Badge className="ml-auto">2</Badge>
              )}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}