'use client';

import { useState } from 'react';
import {
  X,
  FileText,
  User,
  CalendarCheck,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare
} from 'lucide-react';

interface PatientInfo {
  name: string;
  age: string;
  gender: string;
  visitDate: string;
  // Added fields
  id?: string;
  dob?: string;
  contact?: string;
  insurance?: string;
  pcp?: string;
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
  // Added fields
  bmi?: string;
  pain?: string;
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
    conversationSummary?: string[];
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

interface RecordingDetailModalProps {
  recording: Transcription | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function RecordingDetailModal({
  recording,
  isOpen,
  onClose
}: RecordingDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'soap' | 'conversation' | 'raw' | 'reports'>('overview');

  if (!isOpen || !recording) return null;

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">{recording.patientName}</h2>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <CalendarCheck className="h-3.5 w-3.5" />
                  {recording.encounterType}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDate(recording.date)}
                </span>
                {recording.generatedNote && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5" />
                    SOAP Note Generated
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-3 text-sm font-medium ${activeTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Overview
          </button>
          {recording.generatedNote && (
            <>
              <button
                onClick={() => setActiveTab('soap')}
                className={`px-4 py-3 text-sm font-medium ${activeTab === 'soap' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                SOAP Note
              </button>
              {recording.generatedNote.result.conversationSummary && recording.generatedNote.result.conversationSummary.length > 0 && (
                <button
                  onClick={() => setActiveTab('conversation')}
                  className={`px-4 py-3 text-sm font-medium ${activeTab === 'conversation' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5" />
                    Conversation
                  </span>
                </button>
              )}
            </>
          )}
          <button
            onClick={() => setActiveTab('raw')}
            className={`px-4 py-3 text-sm font-medium ${activeTab === 'raw' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Raw Transcription
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-3 text-sm font-medium ${activeTab === 'reports' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Reports
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Patient Information */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-md font-semibold text-gray-800 mb-3">Patient Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Name:</span>
                    <span className="text-sm ml-2">{recording.patientName}</span>
                  </div>

                  {recording.generatedNote && (
                    <>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Age:</span>
                        <span className="text-sm ml-2">{recording.generatedNote.result.patientInfo.age || 'Not specified'}</span>
                      </div>

                      <div>
                        <span className="text-sm font-medium text-gray-600">Gender:</span>
                        <span className="text-sm ml-2">{recording.generatedNote.result.patientInfo.gender || 'Not specified'}</span>
                      </div>

                      {recording.generatedNote.result.patientInfo.id && (
                        <div>
                          <span className="text-sm font-medium text-gray-600">Patient ID:</span>
                          <span className="text-sm ml-2">{recording.generatedNote.result.patientInfo.id}</span>
                        </div>
                      )}

                      {recording.generatedNote.result.patientInfo.dob && (
                        <div>
                          <span className="text-sm font-medium text-gray-600">Date of Birth:</span>
                          <span className="text-sm ml-2">{recording.generatedNote.result.patientInfo.dob}</span>
                        </div>
                      )}

                      {recording.generatedNote.result.patientInfo.contact && (
                        <div>
                          <span className="text-sm font-medium text-gray-600">Contact:</span>
                          <span className="text-sm ml-2">{recording.generatedNote.result.patientInfo.contact}</span>
                        </div>
                      )}

                      {recording.generatedNote.result.patientInfo.insurance && (
                        <div>
                          <span className="text-sm font-medium text-gray-600">Insurance:</span>
                          <span className="text-sm ml-2">{recording.generatedNote.result.patientInfo.insurance}</span>
                        </div>
                      )}

                      {recording.generatedNote.result.patientInfo.pcp && (
                        <div>
                          <span className="text-sm font-medium text-gray-600">Primary Care Provider:</span>
                          <span className="text-sm ml-2">{recording.generatedNote.result.patientInfo.pcp}</span>
                        </div>
                      )}
                    </>
                  )}

                  <div>
                    <span className="text-sm font-medium text-gray-600">Encounter Type:</span>
                    <span className="text-sm ml-2">{recording.encounterType}</span>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-600">Visit Date:</span>
                    <span className="text-sm ml-2">{formatDate(recording.date)}</span>
                  </div>
                </div>
              </div>

              {/* Chief Complaint and Diagnosis Summary (if available) */}
              {recording.generatedNote && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="text-md font-semibold text-gray-800 mb-3">Clinical Summary</h3>

                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-600">Chief Complaint:</span>
                    <p className="text-sm mt-1">{recording.generatedNote.result.soapNote.subjective.chiefComplaint}</p>
                  </div>

                  {recording.generatedNote.result.soapNote.assessment.diagnoses.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Primary Diagnosis:</span>
                      <div className="mt-1 p-2 bg-white rounded border border-gray-200">
                        <div className="flex justify-between items-start">
                          <span className="text-sm font-medium">{recording.generatedNote.result.soapNote.assessment.diagnoses[0].diagnosisName}</span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                            {recording.generatedNote.result.soapNote.assessment.diagnoses[0].icdCode}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {recording.generatedNote.result.soapNote.assessment.diagnoses[0].codeDescription}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Vital Signs (if available) */}
              {recording.generatedNote && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="text-md font-semibold text-gray-800 mb-3">Vital Signs</h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(recording.generatedNote.result.soapNote.objective.vitalSigns).map(([key, value]) => {
                      if (value && value !== "Not mentioned") {
                        return (
                          <div key={key} className="p-2 bg-white rounded border border-gray-200">
                            <div className="text-xs text-gray-500 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </div>
                            <div className="text-sm font-medium mt-1">{value}</div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              )}

              {/* Confidence and Uncertainty (if available) */}
              {recording.generatedNote && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-md font-semibold text-gray-800">AI Confidence Assessment</h3>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${recording.generatedNote.result.confidence.overallConfidence.includes('High')
                        ? 'bg-green-100 text-green-800'
                        : recording.generatedNote.result.confidence.overallConfidence.includes('Medium')
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                      {recording.generatedNote.result.confidence.overallConfidence}
                    </div>
                  </div>

                  {recording.generatedNote.result.confidence.areasOfUncertainty.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                        Areas of Uncertainty:
                      </span>
                      <ul className="list-disc list-inside text-sm text-gray-600 mt-1 space-y-1">
                        {recording.generatedNote.result.confidence.areasOfUncertainty.map((area, index) => (
                          <li key={index}>{area}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Additional Notes (if available) */}
              {recording.notes && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="text-md font-semibold text-gray-800 mb-2">Additional Notes</h3>
                  <p className="text-sm text-gray-600">{recording.notes}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'soap' && recording.generatedNote && (
            <div className="space-y-6">
              {/* Patient Info Section */}
              <div className="mb-6 pb-4 border-b border-gray-200">
                <h3 className="font-semibold mb-3 text-blue-800">Patient Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                  <div><span className="font-medium">Name:</span> {recording.generatedNote.result.patientInfo.name}</div>
                  {recording.generatedNote.result.patientInfo.id && (
                    <div><span className="font-medium">ID:</span> {recording.generatedNote.result.patientInfo.id}</div>
                  )}
                  {recording.generatedNote.result.patientInfo.dob && (
                    <div><span className="font-medium">DOB:</span> {recording.generatedNote.result.patientInfo.dob}</div>
                  )}
                  <div><span className="font-medium">Age:</span> {recording.generatedNote.result.patientInfo.age}</div>
                  <div><span className="font-medium">Gender:</span> {recording.generatedNote.result.patientInfo.gender}</div>
                  {recording.generatedNote.result.patientInfo.contact && (
                    <div><span className="font-medium">Contact:</span> {recording.generatedNote.result.patientInfo.contact}</div>
                  )}
                  {recording.generatedNote.result.patientInfo.insurance && (
                    <div><span className="font-medium">Insurance:</span> {recording.generatedNote.result.patientInfo.insurance}</div>
                  )}
                  {recording.generatedNote.result.patientInfo.pcp && (
                    <div><span className="font-medium">PCP:</span> {recording.generatedNote.result.patientInfo.pcp}</div>
                  )}
                  <div><span className="font-medium">Visit Date:</span> {recording.generatedNote.result.patientInfo.visitDate}</div>
                  <div><span className="font-medium">Visit Type:</span> {recording.encounterType}</div>
                </div>
              </div>

              {/* S: Subjective */}
              <div className="mb-6 pb-4 border-b border-gray-200">
                <h3 className="font-semibold mb-3 text-blue-800">S: Subjective</h3>

                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium inline-block w-40">Chief Complaint:</span>
                    <span>{recording.generatedNote.result.soapNote.subjective.chiefComplaint}</span>
                  </div>

                  <div>
                    <span className="font-medium inline-block">History of Present Illness:</span>
                    <p className="mt-1">{recording.generatedNote.result.soapNote.subjective.historyOfPresentIllness}</p>
                  </div>

                  {recording.generatedNote.result.soapNote.subjective.pastMedicalHistory !== "Not mentioned" && (
                    <div>
                      <span className="font-medium inline-block">Past Medical History:</span>
                      <p className="mt-1">{recording.generatedNote.result.soapNote.subjective.pastMedicalHistory}</p>
                    </div>
                  )}

                  {recording.generatedNote.result.soapNote.subjective.medications.length > 0 && (
                    <div>
                      <span className="font-medium">Medications:</span>
                      <ul className="list-disc list-inside mt-1">
                        {recording.generatedNote.result.soapNote.subjective.medications.map((med, index) => (
                          <li key={index}>{med}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {recording.generatedNote.result.soapNote.subjective.allergies.length > 0 && (
                    <div>
                      <span className="font-medium">Allergies:</span>
                      <ul className="list-disc list-inside mt-1">
                        {recording.generatedNote.result.soapNote.subjective.allergies.map((allergy, index) => (
                          <li key={index}>{allergy}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {recording.generatedNote.result.soapNote.subjective.socialHistory !== "Not mentioned" && (
                    <div>
                      <span className="font-medium inline-block">Social History:</span>
                      <p className="mt-1">{recording.generatedNote.result.soapNote.subjective.socialHistory}</p>
                    </div>
                  )}

                  {recording.generatedNote.result.soapNote.subjective.familyHistory !== "Not mentioned" && (
                    <div>
                      <span className="font-medium inline-block">Family History:</span>
                      <p className="mt-1">{recording.generatedNote.result.soapNote.subjective.familyHistory}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* O: Objective */}
              <div className="mb-6 pb-4 border-b border-gray-200">
                <h3 className="font-semibold mb-3 text-blue-800">O: Objective</h3>

                <div className="space-y-3 text-sm">
                  {/* Vital Signs */}
                  <div>
                    <span className="font-medium">Vital Signs:</span>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                      {Object.entries(recording.generatedNote.result.soapNote.objective.vitalSigns).map(([key, value]) => {
                        if (value !== "Not mentioned") {
                          return (
                            <div key={key} className="p-2 bg-gray-50 rounded border border-gray-200">
                              <div className="text-xs text-gray-500 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </div>
                              <div className="font-medium mt-1">{value}</div>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>

                  {/* Physical Exam */}
                  {recording.generatedNote.result.soapNote.objective.physicalExamination !== "Not mentioned" && (
                    <div>
                      <span className="font-medium inline-block">Physical Examination:</span>
                      <p className="mt-1">{recording.generatedNote.result.soapNote.objective.physicalExamination}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* A: Assessment */}
              <div className="mb-6 pb-4 border-b border-gray-200">
                <h3 className="font-semibold mb-3 text-blue-800">A: Assessment</h3>

                <div className="space-y-3 text-sm">
                  {recording.generatedNote.result.soapNote.assessment.diagnoses.map((diagnosis, index) => (
                    <div key={index} className="p-3 bg-white rounded border border-gray-200">
                      <div className="flex justify-between items-start">
                        <span className="font-medium">{diagnosis.diagnosisName}</span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{diagnosis.icdCode}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{diagnosis.codeDescription}</div>
                      <div className="mt-2">
                        <span className="text-xs font-medium">Reasoning:</span>
                        <p className="mt-1 text-sm">{diagnosis.reasoning}</p>
                      </div>
                    </div>
                  ))}

                  {recording.generatedNote.result.soapNote.assessment.differentialDiagnoses.length > 0 && (
                    <div>
                      <span className="font-medium">Differential Diagnoses:</span>
                      <ul className="list-disc list-inside mt-1">
                        {recording.generatedNote.result.soapNote.assessment.differentialDiagnoses.map((diff, index) => (
                          <li key={index}>{diff}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* P: Plan */}
              <div>
                <h3 className="font-semibold mb-3 text-blue-800">P: Plan</h3>

                <div className="space-y-3 text-sm">
                  {recording.generatedNote.result.soapNote.plan.diagnosticTests.length > 0 && (
                    <div>
                      <span className="font-medium">Diagnostic Tests:</span>
                      <ul className="list-disc list-inside mt-1">
                        {recording.generatedNote.result.soapNote.plan.diagnosticTests.map((test, index) => (
                          <li key={index}>{test}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {recording.generatedNote.result.soapNote.plan.treatments.length > 0 && (
                    <div>
                      <span className="font-medium">Treatments:</span>
                      <ul className="list-disc list-inside mt-1">
                        {recording.generatedNote.result.soapNote.plan.treatments.map((treatment, index) => (
                          <li key={index}>{treatment}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {recording.generatedNote.result.soapNote.plan.medications.length > 0 && (
                    <div>
                      <span className="font-medium">Medications:</span>
                      <ul className="list-disc list-inside mt-1">
                        {recording.generatedNote.result.soapNote.plan.medications.map((med, index) => (
                          <li key={index}>{med}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {recording.generatedNote.result.soapNote.plan.patientEducation && (
                    <div>
                      <span className="font-medium inline-block">Patient Education:</span>
                      <p className="mt-1">{recording.generatedNote.result.soapNote.plan.patientEducation}</p>
                    </div>
                  )}

                  {recording.generatedNote.result.soapNote.plan.followUp && (
                    <div>
                      <span className="font-medium inline-block">Follow-up:</span>
                      <p className="mt-1">{recording.generatedNote.result.soapNote.plan.followUp}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'conversation' && recording.generatedNote && recording.generatedNote.result.conversationSummary && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                  Conversation Summary
                </h3>
                <div className="prose max-w-none">
                  <ul className="space-y-2 list-disc list-inside">
                    {recording.generatedNote.result.conversationSummary.map((point, index) => (
                      <li key={index} className="text-gray-700">{point}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'raw' && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  Raw Transcription
                </h3>
                <div className="prose max-w-none text-sm">
                  <p>{recording.transcription}</p>
                </div>
              </div>

              {recording.notes && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="text-md font-semibold text-gray-800 mb-2">Additional Notes</h3>
                  <p className="text-sm text-gray-600">{recording.notes}</p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'reports' && (
            <div className="flex flex-col items-center justify-center h-64 p-8">
              <div className="bg-blue-50 rounded-lg p-8 border border-blue-200 text-center max-w-lg">
                <h3 className="text-xl font-semibold text-blue-800 mb-4">Reports</h3>
                <div className="flex justify-center mb-6">
                  <FileText className="h-16 w-16 text-blue-500 opacity-70" />
                </div>
                <p className="text-lg text-blue-700 font-medium">Coming Soon</p>
                <p className="text-sm text-blue-600 mt-2">Patient reports and analytics will be available in a future update.</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {recording.generatedNote
              ? 'Transcribed and processed ' + formatDate(recording.date)
              : 'Transcribed ' + formatDate(recording.date)}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 text-sm font-medium hover:bg-gray-50"
            >
              Close
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}