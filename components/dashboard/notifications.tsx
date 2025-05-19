"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import Link from "next/link";

export function Notifications() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Notifications</CardTitle>
          <Badge>3 New</Badge>
        </div>
        <CardDescription>Your pending reviews and alerts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="mt-1 h-2 w-2 rounded-full bg-amber-500"></div>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">
              Sarah Johnson's note needs review
            </p>
            <p className="text-xs text-muted-foreground">10 minutes ago</p>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Icons.more className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-start gap-4">
          <div className="mt-1 h-2 w-2 rounded-full bg-amber-500"></div>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">
              Michael Brown's consultation needs review
            </p>
            <p className="text-xs text-muted-foreground">1 hour ago</p>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Icons.more className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-start gap-4">
          <div className="mt-1 h-2 w-2 rounded-full bg-blue-500"></div>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">
              New clinical guidelines available
            </p>
            <p className="text-xs text-muted-foreground">Yesterday</p>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Icons.more className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="ghost" className="w-full justify-center text-xs" asChild>
          <Link href="/notifications">View all notifications</Link>
        </Button>
      </CardContent>
    </Card>
  );
}