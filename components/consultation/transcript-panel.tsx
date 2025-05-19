"use client";

import { TranscriptEntry } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/ui/icons";

interface TranscriptPanelProps {
  transcript: TranscriptEntry[];
}

export function TranscriptPanel({ transcript }: TranscriptPanelProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Transcript</CardTitle>
        <CardDescription>
          Complete conversation transcript
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="max-h-[600px] overflow-y-auto pr-2 space-y-4">
          {transcript.map((entry) => (
            <div
              key={entry.id}
              className={cn(
                "flex items-start gap-4", 
                entry.speaker === "doctor" ? "flex-row" : "flex-row-reverse"
              )}
            >
              <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                <Icons.user className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex flex-col">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">
                      {entry.speaker === "doctor" ? "Doctor" : "Patient"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {entry.timestamp}
                    </span>
                  </div>
                  <div
                    className={cn(
                      "mt-1 rounded-lg p-3", 
                      entry.speaker === "doctor" 
                        ? "bg-[#E3F2FD] text-[#1A73E8] dark:bg-blue-900/20 dark:text-blue-200"
                        : "bg-[#E0F2F1] text-[#009688] dark:bg-teal-900/20 dark:text-teal-200"
                    )}
                  >
                    {entry.text}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}