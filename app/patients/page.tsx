"use client";

import { useState, useEffect } from 'react';
import { Patient } from "@/lib/types";
import { PatientList } from "@/components/patients/patient-list";
import { PatientSearch } from "@/components/patients/patient-search";
import { PatientFilters } from "@/components/patients/patient-filters";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import Link from "next/link";

interface Transcription {
  id: number;
  patientName: string;
  encounterType: string;
  date: string;
  transcription: string;
  notes?: string;
  generatedNote?: any;
}

export default function PatientsPage() {
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    // Load transcriptions from localStorage
    const storedTranscriptions = JSON.parse(localStorage.getItem('transcriptions') || '[]');
    setTranscriptions(storedTranscriptions);
    
    // Set up listener for storage changes
    const handleStorageChange = () => {
      const updatedTranscriptions = JSON.parse(localStorage.getItem('transcriptions') || '[]');
      setTranscriptions(updatedTranscriptions);
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Convert transcriptions to patient-like format for display
  const patients = transcriptions.reduce((acc: any[], transcription) => {
    // Check if patient already exists in the accumulator
    const existingPatientIndex = acc.findIndex(p => p.name === transcription.patientName);
    
    if (existingPatientIndex >= 0) {
      // Update existing patient's last visit if this one is more recent
      const existingDate = new Date(acc[existingPatientIndex].lastVisit).getTime();
      const currentDate = new Date(transcription.date).getTime();
      
      if (currentDate > existingDate) {
        acc[existingPatientIndex].lastVisit = transcription.date;
      }
      
      // Increment consultation count
      acc[existingPatientIndex].consultations += 1;
      
      return acc;
    } else {
      // Add new patient
      acc.push({
        id: `P-${transcription.id}`,
        name: transcription.patientName,
        age: transcription.generatedNote?.result?.patientInfo?.age || 'N/A',
        gender: transcription.generatedNote?.result?.patientInfo?.gender || 'N/A',
        dob: transcription.generatedNote?.result?.patientInfo?.dob || 'N/A',
        phone: transcription.generatedNote?.result?.patientInfo?.contact || 'N/A',
        email: 'N/A',
        address: 'N/A',
        consultations: 1,
        lastVisit: transcription.date
      });
      
      return acc;
    }
  }, []);

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         patient.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === "all") return matchesSearch;
    if (activeFilter === "recent") return matchesSearch && new Date(patient.lastVisit) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return matchesSearch;
  });

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">Patient Records</h1>
          <p className="text-muted-foreground">
            Manage your patients and view their consultation history
          </p>
        </div>
        <Button asChild>
          <Link href="/consultation/new">
            <Icons.userPlus className="mr-2 h-4 w-4" />
            New Patient
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <PatientFilters
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            patientCount={filteredPatients.length}
          />
        </div>
        
        <div className="md:col-span-3">
          <div className="mb-4">
            <PatientSearch
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>
          
          <PatientList patients={filteredPatients} />
        </div>
      </div>
    </div>
  );
}