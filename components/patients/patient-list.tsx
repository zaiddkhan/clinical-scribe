"use client";

import { Patient } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import Link from "next/link";

interface PatientListProps {
  patients: Patient[];
}

export function PatientList({ patients }: PatientListProps) {
  if (patients.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <Icons.users className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="text-center text-muted-foreground">
            No patients found. Try adjusting your search or filters.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {patients.map((patient) => (
        <PatientCard key={patient.id} patient={patient} />
      ))}
    </div>
  );
}

function PatientCard({ patient }: { patient: Patient }) {
  const initials = patient.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  // Format date safely
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (error) {
      return "Unknown";
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">{patient.name}</CardTitle>
              <CardDescription>{patient.id}</CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            asChild
          >
            <Link href={`/consultation/new?patient=${encodeURIComponent(patient.name)}`}>
              <Icons.chevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground">Age</p>
            <p>{typeof patient.age === 'string' && (patient.age === 'N/A' || patient.age === 'Not mentioned') ? 'Unknown' : patient.age}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Gender</p>
            <p>{typeof patient.gender === 'string' && (patient.gender === 'N/A' || patient.gender === 'Not mentioned') ? 'Unknown' : patient.gender}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Consultations</p>
            <p>{patient.consultations}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Last Visit</p>
            <p>{formatDate(patient.lastVisit)}</p>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link href={`/patients/${patient.id}`}>
              <Icons.user className="mr-2 h-3 w-3" />
              Profile
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link href={`/consultation/new?patient=${encodeURIComponent(patient.name)}`}>
              <Icons.fileText className="mr-2 h-3 w-3" />
              New Consult
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}