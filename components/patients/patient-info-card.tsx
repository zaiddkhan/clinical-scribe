"use client";

import { Patient } from "@/lib/types";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import Link from "next/link";

interface PatientInfoCardProps {
  patient: Patient;
}

export function PatientInfoCard({ patient }: PatientInfoCardProps) {
  const initials = patient.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle>{patient.name}</CardTitle>
          <p className="text-sm text-muted-foreground">{patient.id}</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Last Visit</span>
            <span className="text-sm">{format(new Date(patient.lastVisit), "MMMM d, yyyy")}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total Consultations</span>
            <span className="text-sm">{patient.consultations}</span>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Date of Birth</p>
              <p className="text-sm font-medium">{format(new Date(patient.dob), "MMMM d, yyyy")}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gender</p>
              <p className="text-sm font-medium">{patient.gender}</p>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Contact Information</p>
            
            <div className="grid grid-cols-[24px_1fr] items-center gap-x-2">
              <Icons.clock className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm">{patient.phone}</p>
            </div>
            
            <div className="grid grid-cols-[24px_1fr] items-center gap-x-2">
              <Icons.clock className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm">{patient.email}</p>
            </div>
            
            <div className="grid grid-cols-[24px_1fr] items-center gap-x-2">
              <Icons.clock className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm">{patient.address}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href={`mailto:${patient.email}`}>
                <Icons.clock className="mr-2 h-4 w-4" />
                Email
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href={`tel:${patient.phone.replace(/[^0-9]/g, '')}`}>
                <Icons.clock className="mr-2 h-4 w-4" />
                Call
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}