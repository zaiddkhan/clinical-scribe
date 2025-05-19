"use client";

import { useEffect, useRef } from "react";
import { TranscriptEntry } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";

interface TranscriptViewerProps {
  transcript: TranscriptEntry[];
  isRecording: boolean;
}

export function TranscriptViewer({ transcript, isRecording }: TranscriptViewerProps) {
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when transcript updates
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [transcript]);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Transcript</CardTitle>
          <CardDescription>
            {transcript.length === 0
              ? "Transcript will appear here during recording"
              : `${transcript.length} recorded statements`}
          </CardDescription>
        </div>
        {transcript.length > 0 && (
          <Button variant="outline" size="sm">
            <Icons.edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="max-h-[500px] overflow-y-auto pr-2">
          {transcript.length > 0 ? (
            <div className="space-y-4">
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
              <div ref={transcriptEndRef} />
            </div>
          ) : isRecording ? (
            <div className="flex h-40 items-center justify-center text-center">
              <div className="space-y-2">
                <Icons.mic className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Recording... Transcript will appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center text-center">
              <div className="space-y-2">
                <Icons.fileText className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Transcript will appear here once you start recording.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}