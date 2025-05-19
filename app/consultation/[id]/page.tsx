'use client'; // Mark this as a client component

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  User,
  CalendarCheck,
  Clock,
  CheckCircle,
  MessageSquare,
  Plus
} from 'lucide-react';

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

function PatientDetailContent({ patientData }: { patientData: any }) {
  // State to track active tab
  const [activeTab, setActiveTab] = useState('overview');

  // Tab switching function
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* New Consultation Button */}
      <div className="max-w-5xl mx-auto mb-4 flex justify-between">
      <h1 className="text-blue-600 text-xl font-bold">HospiAgent</h1>
        <Link href="/consultation/new" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Consultation
        </Link>
      </div>
      
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
            </div>
            <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">{patientData.result.patientInfo.name}</h2>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <CalendarCheck className="h-3.5 w-3.5" />
                  Initial Consultation
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDate(patientData.result.patientInfo.visitDate)}
                </span>
                <span className="px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5" />
                  SOAP Note Generated
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex space-x-8">
            <div className={`py-4 px-1 ${activeTab === 'overview' ? 'border-b-2 border-blue-500' : ''}`}>
              <button 
                className={`font-medium text-sm ${activeTab === 'overview' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'} focus:outline-none`}
                onClick={() => handleTabChange('overview')}
              >
                Overview
              </button>
            </div>
            <div className={`py-4 px-1 ${activeTab === 'soapNote' ? 'border-b-2 border-blue-500' : ''}`}>
              <button 
                className={`font-medium text-sm ${activeTab === 'soapNote' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'} focus:outline-none`}
                onClick={() => handleTabChange('soapNote')}
              >
                SOAP Note
              </button>
            </div>
            <div className={`py-4 px-1 ${activeTab === 'conversation' ? 'border-b-2 border-blue-500' : ''}`}>
              <button 
                className={`font-medium text-sm ${activeTab === 'conversation' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'} focus:outline-none`}
                onClick={() => handleTabChange('conversation')}
              >
                Conversation
              </button>
            </div>
            <div className={`py-4 px-1 ${activeTab === 'rawTranscription' ? 'border-b-2 border-blue-500' : ''}`}>
              <button 
                className={`font-medium text-sm ${activeTab === 'rawTranscription' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'} focus:outline-none`}
                onClick={() => handleTabChange('rawTranscription')}
              >
                Raw Transcription
              </button>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Patient Information */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-6">
                <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  Patient Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Name</span>
                    <p className="font-medium">{patientData.result.patientInfo.name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Age</span>
                    <p className="font-medium">{patientData.result.patientInfo.age}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Gender</span>
                    <p className="font-medium">{patientData.result.patientInfo.gender}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Visit Date</span>
                    <p className="font-medium">{formatDate(patientData.result.patientInfo.visitDate)}</p>
                  </div>
                </div>
              </div>

              {/* Conversation Summary */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-6">
                <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                  Conversation Summary
                </h3>
                <div className="prose max-w-none">
                  <ul className="space-y-2 list-disc list-inside">
                    {patientData.result.conversationSummary.map((point: string, index: number) => (
                      <li key={index} className="text-gray-700">{point}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Diagnosis */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-6">
                <h3 className="text-md font-semibold text-gray-800 mb-3">Diagnosis</h3>
                <div className="space-y-2">
                  {patientData.result.soapNote.assessment.diagnoses.map((diagnosis: any, index: number) => (
                    <div key={index} className="p-3 bg-white rounded border border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{diagnosis.diagnosisName}</h4>
                          <p className="text-sm text-gray-500">{diagnosis.codeDescription}</p>
                        </div>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                          {diagnosis.icdCode}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Reasoning:</span>
                        <p className="text-sm mt-1">{diagnosis.reasoning}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SOAP Note Tab */}
          {activeTab === 'soapNote' && (
            <div className="space-y-6">
              {/* Subjective */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-md font-semibold text-gray-800 mb-3">Subjective</h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium inline-block">Chief Complaint:</span>
                    <p className="mt-1">{patientData.result.soapNote.subjective.chiefComplaint}</p>
                  </div>

                  <div>
                    <span className="font-medium inline-block">History of Present Illness:</span>
                    <p className="mt-1">{patientData.result.soapNote.subjective.historyOfPresentIllness}</p>
                  </div>

                  <div>
                    <span className="font-medium inline-block">Past Medical History:</span>
                    <p className="mt-1">{patientData.result.soapNote.subjective.pastMedicalHistory}</p>
                  </div>

                  <div>
                    <span className="font-medium inline-block">Family History:</span>
                    <p className="mt-1">{patientData.result.soapNote.subjective.familyHistory}</p>
                  </div>

                  <div>
                    <span className="font-medium inline-block">Social History:</span>
                    <p className="mt-1">{patientData.result.soapNote.subjective.socialHistory}</p>
                  </div>
                </div>
              </div>

              {/* Objective */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-md font-semibold text-gray-800 mb-3">Objective</h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium">Vital Signs:</span>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                      <div className="p-2 bg-white rounded border border-gray-200">
                        <span className="text-xs text-gray-500">Temperature</span>
                        <p className="font-medium">{patientData.result.soapNote.objective.vitalSigns.temperature}</p>
                      </div>
                      <div className="p-2 bg-white rounded border border-gray-200">
                        <span className="text-xs text-gray-500">Blood Pressure</span>
                        <p className="font-medium">{patientData.result.soapNote.objective.vitalSigns.bloodPressure}</p>
                      </div>
                      <div className="p-2 bg-white rounded border border-gray-200">
                        <span className="text-xs text-gray-500">Pulse</span>
                        <p className="font-medium">{patientData.result.soapNote.objective.vitalSigns.pulse}</p>
                      </div>
                      <div className="p-2 bg-white rounded border border-gray-200">
                        <span className="text-xs text-gray-500">Respiratory Rate</span>
                        <p className="font-medium">{patientData.result.soapNote.objective.vitalSigns.respiratoryRate}</p>
                      </div>
                      <div className="p-2 bg-white rounded border border-gray-200">
                        <span className="text-xs text-gray-500">Oxygen Saturation</span>
                        <p className="font-medium">{patientData.result.soapNote.objective.vitalSigns.oxygenSaturation}</p>
                      </div>
                      <div className="p-2 bg-white rounded border border-gray-200">
                        <span className="text-xs text-gray-500">Weight</span>
                        <p className="font-medium">{patientData.result.soapNote.objective.vitalSigns.weight}</p>
                      </div>
                      <div className="p-2 bg-white rounded border border-gray-200">
                        <span className="text-xs text-gray-500">Height</span>
                        <p className="font-medium">{patientData.result.soapNote.objective.vitalSigns.height}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="font-medium inline-block">Physical Examination:</span>
                    <p className="mt-1">{patientData.result.soapNote.objective.physicalExamination}</p>
                  </div>
                </div>
              </div>

              {/* Assessment */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-md font-semibold text-gray-800 mb-3">Assessment</h3>
                <div className="space-y-2">
                  {patientData.result.soapNote.assessment.diagnoses.map((diagnosis: any, index: number) => (
                    <div key={index} className="p-3 bg-white rounded border border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{diagnosis.diagnosisName}</h4>
                          <p className="text-sm text-gray-500">{diagnosis.codeDescription}</p>
                        </div>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                          {diagnosis.icdCode}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Reasoning:</span>
                        <p className="text-sm mt-1">{diagnosis.reasoning}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Plan */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-md font-semibold text-gray-800 mb-3">Plan</h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium">Diagnostic Tests:</span>
                    <ul className="list-disc list-inside mt-1">
                      {patientData.result.soapNote.plan.diagnosticTests.map((test: string, index: number) => (
                        <li key={index}>{test}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="font-medium">Treatments:</span>
                    <ul className="list-disc list-inside mt-1">
                      {patientData.result.soapNote.plan.treatments.map((treatment: string, index: number) => (
                        <li key={index}>{treatment}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="font-medium">Medications:</span>
                    <ul className="list-disc list-inside mt-1">
                      {patientData.result.soapNote.plan.medications.map((med: string, index: number) => (
                        <li key={index}>{med}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="font-medium inline-block">Patient Education:</span>
                    <p className="mt-1">{patientData.result.soapNote.plan.patientEducation}</p>
                  </div>

                  <div>
                    <span className="font-medium inline-block">Follow-up:</span>
                    <p className="mt-1">{patientData.result.soapNote.plan.followUp}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Conversation Tab */}
          {activeTab === 'conversation' && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-6">
              <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-600" />
                Detailed Conversation
              </h3>
              <div className="space-y-4">
                {patientData.result.conversationSummary.map((point: string, index: number) => (
                  <div key={index} className="p-3 bg-white rounded border border-gray-200">
                    <p className="text-gray-700">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw Transcription Tab */}
          {activeTab === 'rawTranscription' && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-6">
              <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                Raw Transcription
              </h3>
              <div className="prose max-w-none text-sm">
                <p>Doctor: Good morning. What brings you in today?</p>
                <p>Patient: Doctor, I've been having this tingling and pain in both my feet for the past 2-3 weeks. It's worse at night and keeps me from sleeping well.</p>
                <p>Doctor: I see. Is the sensation the same in both feet?</p>
                <p>Patient: It's in both feet, but the right one is worse. My wife suggested massaging with oil, but it hasn't helped much.</p>
                <p>Doctor: What kind of work do you do?</p>
                <p>Patient: I work at a construction site. I'm standing all day, so I thought maybe that's causing it.</p>
                <p>Doctor: That's possible. Have you noticed any other symptoms recently?</p>
                <p>Patient: Now that you mention it, I've been really thirsty lately and going to the bathroom a lot. I have to get up 2-3 times at night to urinate.</p>
                <p>Doctor: Any changes in your energy levels?</p>
                <p>Patient: Yes, I get tired more easily. After lunch, my eyelids feel heavy. And I think I've lost some weight without trying.</p>
                <p>Doctor: Do you have any family history of diabetes?</p>
                <p>Patient: Yes, my father and uncle both have diabetes.</p>
                <p>[Conversation continues with examination and diagnosis...]</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Transcribed and processed {formatDate(patientData.result.patientInfo.visitDate)}
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mock data for static rendering
const mockPatientData = {
  result: {
    patientInfo: {
      name: "Kushagra Kumar",
      age: "25 years",
      gender: "Male",
      visitDate: "2023-05-15T10:30:00"
    },
    conversationSummary: [
      "Patient presented with tingling and pain in both feet for 2-3 weeks, worse at night and in the right foot",
      "Patient reported increased thirst, frequent urination including 2-3 times at night",
      "Patient mentioned fatigue, especially after meals, and unintentional weight loss",
      "Family history significant for diabetes in father and uncle",
      "Physical examination revealed diminished sensation in both feet",
      "Laboratory tests showed elevated blood glucose and HbA1c levels",
      "Diagnosed with Type 2 Diabetes Mellitus and Diabetic Peripheral Neuropathy",
      "Treatment plan includes oral hypoglycemic medication, dietary changes, and regular monitoring",
      "Patient educated on diabetes management, foot care, and recognizing hypoglycemia"
    ],
    soapNote: {
      subjective: {
        chiefComplaint: "Tingling and pain in both feet for 2-3 weeks, worse at night",
        historyOfPresentIllness: "Mr. Kumar reports a 2-3 week history of tingling and pain in both feet, more pronounced in the right foot and worse at night. He has tried massaging with oil without significant relief. He also reports polydipsia, polyuria (including nocturia 2-3 times), fatigue (especially postprandial), and unintentional weight loss.",
        pastMedicalHistory: "Hypertension for 5 years, well-controlled on medication. Appendectomy at age 25.",
        familyHistory: "Father and paternal uncle have Type 2 Diabetes. Mother has hypertension.",
        socialHistory: "Works in construction, standing for long periods. Married with two children. Social alcohol use, denies smoking. Limited physical activity outside of work."
      },
      objective: {
        vitalSigns: {
          temperature: "98.6°F",
          bloodPressure: "142/88 mmHg",
          pulse: "78 bpm",
          respiratoryRate: "16/min",
          oxygenSaturation: "98% on room air",
          weight: "82 kg",
          height: "172 cm"
        },
        physicalExamination: "General: Alert, oriented, no acute distress. HEENT: Normocephalic, atraumatic. Cardiovascular: Regular rate and rhythm, no murmurs. Respiratory: Clear to auscultation bilaterally. Abdomen: Soft, non-tender, no organomegaly. Extremities: No edema. Neurological: Diminished sensation to light touch and pinprick in stocking distribution bilaterally, worse on right. Laboratory: Random blood glucose: 248 mg/dL, HbA1c: 8.9%, Comprehensive metabolic panel: within normal limits except for elevated glucose."
      },
      assessment: {
        diagnoses: [
          {
            diagnosisName: "Type 2 Diabetes Mellitus",
            icdCode: "E11.9",
            codeDescription: "Type 2 diabetes mellitus without complications",
            reasoning: "Based on classic symptoms of polyuria, polydipsia, fatigue, and weight loss, along with elevated blood glucose and HbA1c levels, as well as positive family history."
          },
          {
            diagnosisName: "Diabetic Peripheral Neuropathy",
            icdCode: "E11.42",
            codeDescription: "Type 2 diabetes mellitus with diabetic polyneuropathy",
            reasoning: "Bilateral foot pain and tingling with decreased sensation in stocking distribution, likely due to undiagnosed diabetes causing nerve damage."
          },
          {
            diagnosisName: "Essential Hypertension",
            icdCode: "I10",
            codeDescription: "Essential (primary) hypertension",
            reasoning: "Previously diagnosed, currently with elevated blood pressure reading suggesting need for medication adjustment."
          }
        ]
      },
      plan: {
        diagnosticTests: [
          "Complete Blood Count",
          "Lipid Panel",
          "Urine Microalbumin/Creatinine Ratio",
          "Serum creatinine and eGFR",
          "Comprehensive eye examination"
        ],
        treatments: [
          "Referral to diabetes education program",
          "Foot care education",
          "Blood pressure medication adjustment"
        ],
        medications: [
          "Metformin 500mg orally twice daily with meals, increase to 1000mg twice daily after 1 week if tolerated",
          "Gabapentin 300mg orally at bedtime for neuropathic pain, may increase as needed",
          "Increase current antihypertensive medication dosage (see medication reconciliation)"
        ],
        patientEducation: "Educated patient on diabetes management including dietary modifications, importance of regular physical activity, blood glucose monitoring, and recognition of hypoglycemia and hyperglycemia symptoms. Discussed proper foot care and the need for daily foot inspection.",
        followUp: "Return in 2 weeks to review blood glucose logs and medication tolerance. Schedule diabetes education appointment within 1 week. Complete laboratory testing prior to next visit."
      }
    }
  }
};

// Main page component with dynamic data fetching
export default function ConsultationDetailPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState<boolean>(true);
  const [consultationData, setConsultationData] = useState<any>(null);
  const { id } = params;

  useEffect(() => {
    setConsultationData(mockPatientData);
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!consultationData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Consultation Not Found</h2>
          <p className="text-gray-600 mb-6">The consultation record you're looking for couldn't be found or may have been deleted.</p>
          <a href="/consultations" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
            Return to Consultations
          </a>
        </div>
      </div>
    );
  }

  return <PatientDetailContent patientData={consultationData} />;
}