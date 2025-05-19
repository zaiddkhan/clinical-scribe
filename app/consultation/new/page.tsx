'use client';

import { useState, useEffect } from 'react';
import ClinicalVoiceRecorder from '@/components/consultation/voice-recorder';
import RecordingDetailModal from '@/components/dashboard/patient-detail';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  FileText,
  CalendarCheck,
  Settings,
  Clock,
  User,
  Search
} from 'lucide-react';

interface PatientInfo {
  name: string;
  age: string;
  gender: string;
  visitDate: string;
}

interface Diagnosis {
  diagnosisName: string;
  icdCode: string;
  codeDescription: string;
  reasoning: string;
}

interface VitalSigns {
  temperature: string;
  bloodPressure: string;
  pulse: string;
  respiratoryRate: string;
  oxygenSaturation: string;
  weight: string;
  height: string;
}

interface Subjective {
  chiefComplaint: string;
  historyOfPresentIllness: string;
  pastMedicalHistory: string;
  medications: string[];
  allergies: string[];
  socialHistory: string;
  familyHistory: string;
}

interface Objective {
  vitalSigns: VitalSigns;
  physicalExamination: string;
}

interface Assessment {
  diagnoses: Diagnosis[];
  differentialDiagnoses: string[];
}

interface Plan {
  diagnosticTests: string[];
  treatments: string[];
  medications: string[];
  patientEducation: string;
  followUp: string;
}

interface SoapNote {
  subjective: Subjective;
  objective: Objective;
  assessment: Assessment;
  plan: Plan;
}

interface Confidence {
  overallConfidence: string;
  areasOfUncertainty: string[];
}

interface GeneratedNote {
  id: number;
  result: {
    patientInfo: PatientInfo;
    soapNote: SoapNote;
    confidence: Confidence;
  };
}

interface Transcription {
  id: number;
  patientName: string;
  encounterType: string;
  date: string;
  transcription: string;
  notes?: string;
  generatedNote?: GeneratedNote;
}

export default function ClinicalScribePage() {
  const [savedTranscriptions, setSavedTranscriptions] = useState<Transcription[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [patientFromUrl, setPatientFromUrl] = useState<string>('');

  // State for the detail modal
  const [selectedRecording, setSelectedRecording] = useState<Transcription | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const storedTranscriptions = JSON.parse(localStorage.getItem('transcriptions') || '[]');
    setSavedTranscriptions(storedTranscriptions);

    // Set up listener for storage changes
    const handleStorageChange = () => {
      const updatedTranscriptions = JSON.parse(localStorage.getItem('transcriptions') || '[]');
      setSavedTranscriptions(updatedTranscriptions);
    };

    window.addEventListener('storage', handleStorageChange);

    // Extract patient name from URL if present
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const patientParam = urlParams.get('patient');
      if (patientParam) {
        setPatientFromUrl(decodeURIComponent(patientParam));
      }
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Format date string for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Open the modal with the selected recording
  const openRecordingDetail = (recording: Transcription) => {
    setSelectedRecording(recording);
    setIsModalOpen(true);
  };

  // Close the modal
  const closeRecordingDetail = () => {
    setIsModalOpen(false);
    setSelectedRecording(null);
  };

  // Filter transcriptions based on search term
  const filteredTranscriptions = savedTranscriptions.filter(item =>
    item.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.encounterType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.transcription.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-blue-600 text-xl font-bold">HospiAgent</h1>
          <span className="mx-2 text-gray-400">|</span>
          <h2 className="text-gray-700">Clinical Scribe</h2>
        </div>

        <div className="text-md text-gray-500 flex items-center gap-1 p-8 justify-around">
          <Link
            className='mx-8'
            href="https://Demohospiagent.minusonetoten.com">
            <button
              className='border border-gray-200 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 flex items-center gap-2'>Home</button>
          </Link>
          <User className="h-4 w-4" />
          <span>Today's Patients: {
            filteredTranscriptions.filter(
              item => new Date(item.date).toDateString() === new Date().toDateString()
            ).length
          }</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar with recent transcriptions */}
        <aside className="w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                placeholder="Search recordings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <h3 className="px-4 pt-4 pb-2 text-sm font-medium text-gray-500 uppercase tracking-wider">
              Recent Recordings
            </h3>

            {filteredTranscriptions.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <FileText className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                <p className="text-sm">No recordings found</p>
                {searchTerm && <p className="text-xs mt-1">Try a different search term</p>}
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {filteredTranscriptions.map((item) => (
                  <li
                    key={item.id}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer"
                    onClick={() => openRecordingDetail(item)}
                  >
                    <div className="flex justify-between">
                      <div className="font-medium text-gray-800 truncate">{item.patientName}</div>
                      {item.generatedNote && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-full">
                          SOAP
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <CalendarCheck className="h-3 w-3" />
                      <span>{item.encounterType}</span>

                      {item.generatedNote && item.generatedNote.result?.soapNote?.assessment?.diagnoses?.length > 0 && (
                        <span className="ml-2 px-1.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                          {item.generatedNote.result.soapNote.assessment.diagnoses[0].icdCode}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-400">{formatDate(item.date)}</span>
                    </div>

                    {item.generatedNote && item.generatedNote.result?.soapNote?.subjective?.chiefComplaint ? (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                        <span className="font-medium">CC: </span>
                        {item.generatedNote.result.soapNote.subjective.chiefComplaint}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                        {item.transcription}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">Today's Stats</div>
                <div className="text-xs text-gray-500">
                  {filteredTranscriptions.filter(
                    item => new Date(item.date).toDateString() === new Date().toDateString()
                  ).length} recordings today
                </div>
              </div>
              <div className="text-blue-600 text-xs font-medium cursor-pointer hover:underline">View All Stats</div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Record New Consultation</h2>
            </div>

            <ClinicalVoiceRecorder patientName={patientFromUrl} />
          </div>
        </main>
      </div>

      {/* Recording Detail Modal */}
      <RecordingDetailModal
        recording={selectedRecording}
        isOpen={isModalOpen}
        onClose={closeRecordingDetail}
      />
    </div>
  );
}