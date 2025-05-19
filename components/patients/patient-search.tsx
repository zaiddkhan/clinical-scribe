"use client";

import { Input } from "@/components/ui/input";
import { Icons } from "@/components/ui/icons";

interface PatientSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function PatientSearch({ searchQuery, onSearchChange }: PatientSearchProps) {
  return (
    <div className="relative">
      <Icons.search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search patients by name or ID..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-9"
      />
    </div>
  );
}