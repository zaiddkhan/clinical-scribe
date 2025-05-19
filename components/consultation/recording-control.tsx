"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface RecordingControlProps {
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number;
  currentSpeaker: "doctor" | "patient";
  onStartRecording: () => void;
  onTogglePause: () => void;
  onEndRecording: () => void;
  onSpeakerChange: (speaker: "doctor" | "patient") => void;
}

export function RecordingControl({
  isRecording,
  isPaused,
  recordingTime,
  currentSpeaker,
  onStartRecording,
  onTogglePause,
  onEndRecording,
  onSpeakerChange,
}: RecordingControlProps) {
  const [audioLevel, setAudioLevel] = useState(0);

  // Simulate audio levels for visualization
  useEffect(() => {
    if (isRecording && !isPaused) {
      const interval = setInterval(() => {
        setAudioLevel(Math.random() * 100);
      }, 100);
      return () => clearInterval(interval);
    } else {
      setAudioLevel(0);
    }
  }, [isRecording, isPaused]);

  // Format recording time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Recording Console</CardTitle>
        <CardDescription>
          {isRecording
            ? "Recording in progress..."
            : "Start recording your consultation"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Recording timer */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className={cn(
            "relative h-32 w-32 rounded-full flex items-center justify-center transition-colors",
            isRecording 
              ? isPaused 
                ? "bg-amber-100 dark:bg-amber-900/20" 
                : "bg-red-100 dark:bg-red-900/20" 
              : "bg-muted"
          )}>
            <div className={cn(
              "absolute inset-2 rounded-full flex items-center justify-center",
              isRecording 
                ? isPaused 
                  ? "bg-amber-200 dark:bg-amber-800/20" 
                  : "bg-red-200 dark:bg-red-800/20" 
                : "bg-muted-foreground/10"
            )}>
              <Button
                size="icon"
                variant={isRecording ? (isPaused ? "outline" : "destructive") : "default"}
                className={cn(
                  "h-20 w-20 rounded-full", 
                  isRecording && !isPaused && "animate-pulse"
                )}
                onClick={isRecording ? onTogglePause : onStartRecording}
              >
                {isRecording ? (
                  isPaused ? (
                    <Icons.play className="h-8 w-8" />
                  ) : (
                    <Icons.pause className="h-8 w-8" />
                  )
                ) : (
                  <Icons.mic className="h-8 w-8" />
                )}
              </Button>
            </div>
          </div>
          <div className="text-2xl font-semibold">{formatTime(recordingTime)}</div>
          
          {/* Audio level indicator */}
          {isRecording && (
            <div className="w-full space-y-2">
              <Progress value={audioLevel} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Audio Level</span>
                <span>{Math.round(audioLevel)}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Speaker identification */}
        {isRecording && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Current Speaker</h3>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className={cn(
                  "flex-1 border-2",
                  currentSpeaker === "doctor"
                    ? "border-primary bg-primary/10"
                    : "border-transparent"
                )}
                onClick={() => onSpeakerChange("doctor")}
              >
                <Icons.user className="mr-2 h-4 w-4" />
                Doctor
              </Button>
              <Button
                variant="outline"
                className={cn(
                  "flex-1 border-2",
                  currentSpeaker === "patient"
                    ? "border-secondary bg-secondary/10"
                    : "border-transparent"
                )}
                onClick={() => onSpeakerChange("patient")}
              >
                <Icons.user className="mr-2 h-4 w-4" />
                Patient
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {isRecording ? (
          <>
            <Button variant="outline" onClick={onTogglePause}>
              {isPaused ? (
                <>
                  <Icons.play className="mr-2 h-4 w-4" />
                  Resume
                </>
              ) : (
                <>
                  <Icons.pause className="mr-2 h-4 w-4" />
                  Pause
                </>
              )}
            </Button>
            <Button onClick={onEndRecording}>
              <Icons.check className="mr-2 h-4 w-4" />
              Complete
            </Button>
          </>
        ) : (
          <Button className="w-full" onClick={onStartRecording}>
            <Icons.mic className="mr-2 h-4 w-4" />
            Start Recording
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}