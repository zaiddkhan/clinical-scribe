"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";

export function QuickStart() {
  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Start a New Consultation</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">
          Begin recording a new patient consultation with one click.
        </p>
        <Button className="w-full" asChild>
          <Link href="/consultation/new">
            <Icons.mic className="mr-2 h-4 w-4" />
            Start Recording
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}