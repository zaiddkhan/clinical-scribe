export interface NavItem {
  name: string;
  href: string;
  icon: string;
}

export interface StatCard {
  label: string;
  value: string | number;
  change: string;
  icon: string;
}

export interface Consultation {
  id: string;
  patientName: string;
  patientId: string;
  date: string;
  status: 'pending' | 'in_progress' | 'pending_review' | 'completed';
  duration: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  dob: string;
  phone: string;
  email: string;
  address: string;
  consultations: number;
  lastVisit: string;
}

export interface TranscriptEntry {
  id: number;
  speaker: 'doctor' | 'patient';
  text: string;
  timestamp: string;
}

export interface DiagnosisWithCode {
  diagnosis: string;
  icdCode: string;
  confidence: number;
}

// in lib/types.ts
export interface TranscriptEntry {
  id: number;
  speaker: "doctor" | "patient";
  text: string;
  timestamp: string;
}

export interface TranscriptionResponse {
  transcription: {
    text: string;
  };
}

export interface PatientInfo {
  name: string;
  id?: string;
  age: string;
  gender: string;
  dob?: string;
  contact?: string;
  insurance?: string;
  pcp?: string;
  visitDate: string;
}

export interface Diagnosis {
  diagnosisName: string;
  icdCode: string;
  codeDescription: string;
  reasoning: string;
}

export interface VitalSigns {
  temperature: string;
  bloodPressure: string;
  pulse: string;
  respiratoryRate: string;
  oxygenSaturation: string;
  weight: string;
  height: string;
}

export interface Subjective {
  chiefComplaint: string;
  historyOfPresentIllness: string;
  pastMedicalHistory: string;
  medications: string[];
  allergies: string[];
  socialHistory: string;
  familyHistory: string;
}

export interface Objective {
  vitalSigns: VitalSigns;
  physicalExamination: string;
}

export interface Assessment {
  diagnoses: Diagnosis[];
  differentialDiagnoses: string[];
}

export interface Plan {
  diagnosticTests: string[];
  treatments: string[];
  medications: string[];
  patientEducation: string;
  followUp: string;
}

export interface SoapNote {
  subjective: Subjective;
  objective: Objective;
  assessment: Assessment;
  plan: Plan;
}

export interface Confidence {
  overallConfidence: string;
  areasOfUncertainty: string[];
}

export interface GeneratedNote {
  id: number;
  result: {
    patientInfo: PatientInfo;
    soapNote: SoapNote;
    confidence: Confidence;
    id: string;
    dob: string;
    age: string;
    gender: string;
    contact: string;
    insurance: string;
    pcp: string;
    visitDate: string;
    visitType: string;

  };
}
