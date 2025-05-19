"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Consultation } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/ui/icons";

export function RecentConsultations() {
  const [consultations] = useState<Consultation[]>([]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50 dark:bg-green-900/20 dark:text-green-400">
            <Icons.check className="mr-1 h-3 w-3" /> Completed
          </Badge>
        );
      case "pending_review":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400">
            <Icons.alertCircle className="mr-1 h-3 w-3" /> Pending Review
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status.replace("_", " ")}
          </Badge>
        );
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Consultations</CardTitle>
          <CardDescription>
            Your latest patient consultations and their status
          </CardDescription>
        </div>
        <Button variant="outline" asChild>
          <Link href="/consultations">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {consultations.map((consultation) => (
              <TableRow key={consultation.id}>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{consultation.patientName}</span>
                    <span className="text-xs text-muted-foreground">
                      {consultation.patientId}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {format(new Date(consultation.date), "MMM d, yyyy • h:mm a")}
                </TableCell>
                <TableCell>{consultation.duration}</TableCell>
                <TableCell>{getStatusBadge(consultation.status)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    asChild
                  >
                    <Link href={`/consultation/${consultation.id}`}>
                      <span className="sr-only">View consultation</span>
                      <Icons.fileText className="h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}