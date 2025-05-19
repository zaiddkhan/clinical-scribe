  'use client';
  
  import { useState, useRef, useEffect } from 'react';
  import {
      Mic,
      StopCircle,
      Save,
      Loader2,
      FileText,
      CheckCircle,
      Trash2,
      ArrowRight,
      AlertCircle
  } from 'lucide-react';
  import {
      TranscriptionResponse,
      GeneratedNote,
  } from '@/lib/types';
  interface ClinicalVoiceRecorderProps {
      patientName?: string;
  }
  
  export default function ClinicalVoiceRecorder({ patientName = '' }: ClinicalVoiceRecorderProps) {
      // Form submission state
      const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
      const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
    
  
      // Recording states
      const [isRecording, setIsRecording] = useState<boolean>(false);
      const [recordingTime, setRecordingTime] = useState<number>(0);
      const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
      const [audioURL, setAudioURL] = useState<string | null>(null);
  
      // Processing states
      const [isProcessing, setIsProcessing] = useState<boolean>(false);
      const [transcription, setTranscription] = useState<string | null>(null);
      const [error, setError] = useState<string | null>(null);
  
      // Patient encounter info - Basic information
      const [patientNameValue, setPatientName] = useState<string>(patientName || '');
      const [patientDOB, setPatientDOB] = useState<string>('');
      const [patientGender, setPatientGender] = useState<string>('');
      const [patientID, setPatientID] = useState<string>(`PA-${new Date().getTime()}`);
      const [patientContact, setPatientContact] = useState<string>('');
      const [patientInsurance, setPatientInsurance] = useState<string>('N/A');
      const [patientPCP, setPatientPCP] = useState<string>('N/A');
  
      // Medical information
      const [patientAllergies, setPatientAllergies] = useState<string>('');
      const [patientMedications, setPatientMedications] = useState<string>('');
      const [chiefComplaint, setChiefComplaint] = useState<string>('');
  
      // Encounter details
      const [encounterType, setEncounterType] = useState<string>('Initial Consultation');
      const [encounterNotes, setEncounterNotes] = useState<string>('');
      const isRecordingRef = useRef(false);
      
      const visualizerStopFnRef = useRef<() => void>();

      useEffect(() => {
        isRecordingRef.current = isRecording;
      }, [isRecording]);
  
      // Vital signs
      const [vitalSigns, setVitalSigns] = useState<{
          temperature: string;
          heartRate: string;
          bloodPressure: string;
          respiratoryRate: string;
          oxygenSaturation: string;
          weight: string;
          height: string;
          bmi: string;
          pain: string;
      }>({
          temperature: '',
          heartRate: '',
          bloodPressure: '',
          respiratoryRate: '',
          oxygenSaturation: '',
          weight: '',
          height: '',
          bmi: '',
          pain: ''
      });
  
      // Generated note
      const [generatedNote, setGeneratedNote] = useState<GeneratedNote | null>(null);
      const [isGeneratingNote, setIsGeneratingNote] = useState<boolean>(false);
  
      // Refs
      const mediaRecorderRef = useRef<MediaRecorder | null>(null);
      const audioChunksRef = useRef<Blob[]>([]);
      const timerRef = useRef<NodeJS.Timeout | null>(null);
      const audioLevelsRef = useRef<number[]>([]);
      const visualizerRef = useRef<HTMLCanvasElement | null>(null);
      const audioContextRef = useRef<AudioContext | null>(null);
      const analyserRef = useRef<AnalyserNode | null>(null);
      const streamRef = useRef<MediaStream | null>(null);
      const barHistoryRef = useRef<number[]>([]);
  
  
      // For visualizer animation
      useEffect(() => {
          return () => {
              cleanupAudio();
          };
      }, []);
  
      const cleanupAudio = () => {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
              mediaRecorderRef.current.stop();
          }
          if (timerRef.current) {
              clearInterval(timerRef.current);
          }
          if (streamRef.current) {
              streamRef.current.getTracks().forEach(track => track.stop());
          }
          if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
              audioContextRef.current.close();
          }
      };
  
      const setupAudioVisualizer = (stream: MediaStream) => {
        const canvas = visualizerRef.current;
        if (!canvas) return;
      
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
      
        canvas.width = 600;
        canvas.height = 150;
      
        canvas.style.border = "1px solid #eee";
      
        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 1024;
        analyserRef.current = analyser;
      
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
      
        if (audioContext.state === 'suspended') {
          audioContext.resume();
        }
      
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
      
        let running = true; // control variable for animation
      
        const renderFrame = () => {
          if (!running) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            barHistoryRef.current = [];
            return;
          }
      
          requestAnimationFrame(renderFrame);
      
          analyser.getByteFrequencyData(dataArray);
      
          const avg = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
          const normalized = avg / 255;
          const maxBars = 60;
      
          if (barHistoryRef.current.length >= maxBars) {
            barHistoryRef.current.shift();
          }
          barHistoryRef.current.push(normalized);
      
          ctx.clearRect(0, 0, canvas.width, canvas.height);
      
          const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
          gradient.addColorStop(0, '#3B82F6');
          gradient.addColorStop(1, '#60A5FA');
      
          ctx.fillStyle = gradient;
          ctx.shadowColor = 'rgba(59, 130, 246, 0.6)';
          ctx.shadowBlur = 10;
      
          const barWidth = canvas.width / maxBars * 0.8;
          const spacing = canvas.width / maxBars * 0.2;
          const maxBarHeight = canvas.height * 0.9;
      
          barHistoryRef.current.forEach((value, i) => {
            const barHeight = value * maxBarHeight;
            const x = i * (barWidth + spacing);
            const y = canvas.height - barHeight;
      
            roundRect(ctx, x, y, barWidth, barHeight, barWidth / 2);
          });
        };
      
        // Helper function for rounded rect (keep your existing one)
      
        renderFrame();
      
        // Return a function to stop animation externally
        return () => {
          running = false;
        };
      };

      
      // Rounded rect helper (same as before)
      function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fill();
      }
  
  
  
      const startRecording = async () => {
          try {
              setError(null);
              audioLevelsRef.current = [];
  
              const stream = await navigator.mediaDevices.getUserMedia({
                  audio: {
                      echoCancellation: true,
                      noiseSuppression: true,
                      autoGainControl: true
                  }
              });
  
              streamRef.current = stream;
              setupAudioVisualizer(stream);
  
              const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
              mediaRecorderRef.current = mediaRecorder;
              audioChunksRef.current = [];
  
              mediaRecorder.ondataavailable = (event) => {
                  if (event.data.size > 0) {
                      audioChunksRef.current.push(event.data);
                  }
              };
  
              mediaRecorder.onstop = () => {
                  const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                  const audioUrl = URL.createObjectURL(audioBlob);
                  setAudioURL(audioUrl);
                  setAudioBlob(audioBlob);
              };
  
              mediaRecorder.start(100); // Collect data every 100ms for smoother visualization
              setIsRecording(true);
              setRecordingTime(0);
  
              // Reset previous recording if any
              setTranscription(null);
              setAudioURL(null);
              setAudioBlob(null);
  
              timerRef.current = setInterval(() => {
                  setRecordingTime(prev => prev + 1);
              }, 1000);
          } catch (err) {
              console.error('Error accessing microphone:', err);
              setError('Could not access microphone. Please check permissions.');
          }
      };
  
      const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
      
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
      
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
          }
      
          if (audioContextRef.current) {
            audioContextRef.current.close();
          }
      
          // stop animation
          if (visualizerStopFnRef.current) {
            visualizerStopFnRef.current();
            visualizerStopFnRef.current = undefined; // Clear the ref so it can't be called again accidentally
          }
      
          // Clear bar history (important to reset wave data)
          barHistoryRef.current = [];
      
          // Clear the canvas explicitly to remove old bars
          const canvas = visualizerRef.current;
          if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
          }
        }
      };

  
      const sendToTranscriptionAPI = async () => {
          if (!audioBlob) return;
  
          try {
              setIsProcessing(true);
              setError(null);
  
              const formData = new FormData();
              formData.append('audio', audioBlob, 'recording.webm');
  
              // Add metadata
              if (patientNameValue) formData.append('patientName', patientNameValue);
              if (patientDOB) formData.append('patientDOB', patientDOB);
              if (patientGender) formData.append('patientGender', patientGender);
              if (patientID) formData.append('patientID', patientID);
              if (patientContact) formData.append('patientContact', patientContact);
              if (patientInsurance) formData.append('patientInsurance', patientInsurance);
              if (patientPCP) formData.append('patientPCP', patientPCP);
              if (patientAllergies) formData.append('patientAllergies', patientAllergies);
              if (patientMedications) formData.append('patientMedications', patientMedications);
              if (chiefComplaint) formData.append('chiefComplaint', chiefComplaint);
              if (encounterType) formData.append('encounterType', encounterType);
              if (encounterNotes) formData.append('notes', encounterNotes);
  
              // Add vital signs
              Object.entries(vitalSigns).forEach(([key, value]) => {
                  if (value) formData.append(`vitalSigns.${key}`, value);
              });
  
              const response = await fetch(`https://content-panel.lvl.fit/api/transcribe/audio`, {
                  method: 'POST',
                  body: formData,
              });
  
              if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(errorData.error || 'Failed to transcribe audio');
              }
  
              const data = await response.json() as TranscriptionResponse;
              setTranscription(data.transcription.text);
  
              // Generate structured clinical note from transcription
              await generateSoapNote(data.transcription.text);
  
          } catch (err) {
              console.error('Error transcribing audio:', err);
              setError(err instanceof Error ? err.message : 'Failed to transcribe audio');
          } finally {
              setIsProcessing(false);
          }
      };
  
      const generateSoapNote = async (transcriptionText: string) => {
          try {
              setIsGeneratingNote(true);
  
              const response = await fetch(`https://content-panel.lvl.fit/api/generate`, {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                      message: transcriptionText,
                      patientInfo: {
                          name: patientNameValue,
                          dob: patientDOB,
                          gender: patientGender,
                          id: patientID,
                          contact: patientContact,
                          insurance: patientInsurance,
                          pcp: patientPCP,
                          allergies: patientAllergies,
                          medications: patientMedications,
                          chiefComplaint: chiefComplaint,
                          vitalSigns: vitalSigns
                      }
                  }),
              });
  
              if (!response.ok) {
                  throw new Error('Failed to generate clinical note');
              }
  
              const generatedNoteData = await response.json() as GeneratedNote;
              setGeneratedNote(generatedNoteData);
  
              // Save both transcription and generated note to localStorage
              const savedTranscriptions = JSON.parse(localStorage.getItem('transcriptions') || '[]');
  
              const newEntry = {
                  id: Date.now(),
                  patientName: patientNameValue || generatedNoteData.result.patientInfo.name || 'Unnamed Patient',
                  encounterType,
                  date: new Date().toISOString(),
                  transcription: transcriptionText,
                  notes: encounterNotes,
                  generatedNote: generatedNoteData
              };
  
              savedTranscriptions.push(newEntry);
              localStorage.setItem('transcriptions', JSON.stringify(savedTranscriptions));
  
          } catch (err) {
              console.error('Error generating SOAP note:', err);
              setError(err instanceof Error ? err.message : 'Failed to generate clinical note');
  
              // Save just the transcription if note generation fails
              const savedTranscriptions = JSON.parse(localStorage.getItem('transcriptions') || '[]');
  
              savedTranscriptions.push({
                  id: Date.now(),
                  patientName: patientNameValue || 'Unnamed Patient',
                  encounterType,
                  date: new Date().toISOString(),
                  transcription: transcriptionText,
                  notes: encounterNotes
              });
  
              localStorage.setItem('transcriptions', JSON.stringify(savedTranscriptions));
          } finally {
              setIsGeneratingNote(false);
          }
      };
  
      const discardRecording = () => {
          setAudioURL(null);
          setAudioBlob(null);
          setTranscription(null);
          setError(null);
      };
  
      const resetAllData = () => {
          // Reset patient form
          setPatientName('');
          setPatientDOB('');
          setPatientGender('');
          setPatientID(`PA-${new Date().getTime()}`);
          setPatientContact('');
          setPatientInsurance('N/A');
          setPatientPCP('N/A');
          setPatientAllergies('');
          setPatientMedications('');
          setChiefComplaint('');
          setEncounterType('Initial Consultation');
          setEncounterNotes('');
          setVitalSigns({
              temperature: '',
              heartRate: '',
              bloodPressure: '',
              respiratoryRate: '',
              oxygenSaturation: '',
              weight: '',
              height: '',
              bmi: '',
              pain: ''
          });
  
          // Reset recording data
          setAudioURL(null);
          setAudioBlob(null);
          setTranscription(null);
          setGeneratedNote(null);
          setError(null);
  
          // Reset states
          setFormSubmitted(false);
          setFormErrors({});
      };
  
      const formatTime = (seconds: number) => {
          const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
          const secs = (seconds % 60).toString().padStart(2, '0');
          return `${mins}:${secs}`;
      };
  
      const canProcess = audioBlob && !isProcessing && !transcription;
      const encounterTypesOptions = [
          'Initial Consultation',
          'Follow-up',
          'Annual Check-up',
          'Emergency',
          'Specialist Consultation',
          'Procedure'
      ];
  
      const validateForm = () => {
          const errors: Record<string, string> = {};
  
          // Required fields
          if (!patientNameValue.trim()) errors.patientName = "Patient name is required";
          if (!chiefComplaint.trim()) errors.chiefComplaint = "Chief complaint is required";
  
          // Optional format validations
          if (patientDOB) {
              const dobDate = new Date(patientDOB);
              if (isNaN(dobDate.getTime())) {
                  errors.patientDOB = "Invalid date format";
              }
          }
  
          if (patientContact && !/^\d{10}$/.test(patientContact.replace(/\D/g, ''))) {
              errors.patientContact = "Contact should be a valid phone number";
          }
  
          setFormErrors(errors);
          return Object.keys(errors).length === 0;
      };
  
      const handleFormSubmit = (e: React.FormEvent) => {
          e.preventDefault();
          
          if (validateForm()) {
              setFormSubmitted(true);
          } else {
              // Scroll to the first error
              const firstErrorField = Object.keys(formErrors)[0];
              const element = document.getElementById(firstErrorField);
              if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
          }
      };
  
      return (
          <div className="min-h-screen flex flex-col bg-slate-50 p-4">
          
  
              <main className="flex-1 max-w-4xl mx-auto w-full">
                  {!formSubmitted ? (
                      // Patient Information Form
                      <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 mb-8">
                          <h1 className="text-2xl font-bold text-gray-800 mb-2">Patient Information</h1>
                          <p className="text-gray-600 mb-6">Enter patient details before recording the consultation</p>
  
                          <form onSubmit={handleFormSubmit} className="space-y-6">
                              {/* Basic Information */}
                              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                  <div>
                                      <label htmlFor="patientName" className="block text-sm font-medium text-gray-700 mb-1">
                                          Patient Name*
                                      </label>
                                      <input
                                          type="text"
                                          id="patientName"
                                          value={patientNameValue}
                                          onChange={(e) => setPatientName(e.target.value)}
                                          className={`w-full px-3 py-2 border ${formErrors.patientName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                                          placeholder="Full name"
                                      />
                                      {formErrors.patientName && (
                                          <p className="mt-1 text-sm text-red-500">{formErrors.patientName}</p>
                                      )}
                                  </div>
  
                                  <div>
                                      <label htmlFor="patientID" className="block text-sm font-medium text-gray-700 mb-1">
                                          Patient ID
                                      </label>
                                      <input
                                          type="text"
                                          id="patientID"
                                          value={patientID}
                                          readOnly
                                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-700"
                                          placeholder="Auto-generated ID"
                                      />
                                  </div>
  
                                  <div>
                                      <label htmlFor="patientDOB" className="block text-sm font-medium text-gray-700 mb-1">
                                          Date of Birth
                                      </label>
                                      <input
                                          type="date"
                                          id="patientDOB"
                                          value={patientDOB}
                                          onChange={(e) => setPatientDOB(e.target.value)}
                                          className={`w-full px-3 py-2 border ${formErrors.patientDOB ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                                      />
                                      {formErrors.patientDOB && (
                                          <p className="mt-1 text-sm text-red-500">{formErrors.patientDOB}</p>
                                      )}
                                  </div>
  
                                  <div>
                                      <label htmlFor="patientGender" className="block text-sm font-medium text-gray-700 mb-1">
                                          Gender
                                      </label>
                                      <select
                                          id="patientGender"
                                          value={patientGender}
                                          onChange={(e) => setPatientGender(e.target.value)}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                      >
                                          <option value="">Select gender</option>
                                          <option value="Male">Male</option>
                                          <option value="Female">Female</option>
                                          <option value="Other">Other</option>
                                      </select>
                                  </div>
  
                                  <div>
                                      <label htmlFor="patientContact" className="block text-sm font-medium text-gray-700 mb-1">
                                          Contact Number
                                      </label>
                                      <input
                                          type="tel"
                                          id="patientContact"
                                          value={patientContact}
                                          onChange={(e) => setPatientContact(e.target.value)}
                                          className={`w-full px-3 py-2 border ${formErrors.patientContact ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                                          placeholder="Phone number"
                                      />
                                      {formErrors.patientContact && (
                                          <p className="mt-1 text-sm text-red-500">{formErrors.patientContact}</p>
                                      )}
                                  </div>
  
                                  <div>
                                      <label htmlFor="encounterType" className="block text-sm font-medium text-gray-700 mb-1">
                                          Encounter Type*
                                      </label>
                                      <select
                                          id="encounterType"
                                          value={encounterType}
                                          onChange={(e) => setEncounterType(e.target.value)}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                      >
                                          {encounterTypesOptions.map((type) => (
                                              <option key={type} value={type}>{type}</option>
                                          ))}
                                      </select>
                                  </div>
                              </div>
  
                              {/* Chief Complaint */}
                              <div>
                                  <label htmlFor="chiefComplaint" className="block text-sm font-medium text-gray-700 mb-1">
                                      Chief Complaint*
                                  </label>
                                  <input
                                      type="text"
                                      id="chiefComplaint"
                                      value={chiefComplaint}
                                      onChange={(e) => setChiefComplaint(e.target.value)}
                                      className={`w-full px-3 py-2 border ${formErrors.chiefComplaint ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                                      placeholder="Primary reason for visit"
                                  />
                                  {formErrors.chiefComplaint && (
                                      <p className="mt-1 text-sm text-red-500">{formErrors.chiefComplaint}</p>
                                  )}
                              </div>
  
                              {/* Allergies and Medications - Expandable/Collapsible Section */}
                              <div>
                                  <details className="bg-gray-50 rounded-md p-2">
                                      <summary className="cursor-pointer font-medium text-sm text-gray-700 py-1">
                                          Allergies & Medications (Optional)
                                      </summary>
                                      <div className="mt-3 grid gap-4 sm:grid-cols-2">
                                          <div>
                                              <label htmlFor="patientAllergies" className="block text-sm font-medium text-gray-700 mb-1">
                                                  Allergies
                                              </label>
                                              <textarea
                                                  id="patientAllergies"
                                                  value={patientAllergies}
                                                  onChange={(e) => setPatientAllergies(e.target.value)}
                                                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                  placeholder="Known allergies, separated by commas"
                                                  rows={2}
                                              />
                                          </div>
  
                                          <div>
                                              <label htmlFor="patientMedications" className="block text-sm font-medium text-gray-700 mb-1">
                                                  Current Medications
                                              </label>
                                              <textarea
                                                  id="patientMedications"
                                                  value={patientMedications}
                                                  onChange={(e) => setPatientMedications(e.target.value)}
                                                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                  placeholder="Current medications, separated by commas"
                                                  rows={2}
                                              />
                                          </div>
                                      </div>
                                  </details>
                              </div>
  
                              {/* Vital Signs - Expandable/Collapsible Section */}
                              <div>
                                  <details className="bg-gray-50 rounded-md p-2">
                                      <summary className="cursor-pointer font-medium text-sm text-gray-700 py-1">
                                          Vital Signs (Optional)
                                      </summary>
                                      <div className="mt-3 grid gap-4 sm:grid-cols-3">
                                          <div>
                                              <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 mb-1">
                                                  Temperature
                                              </label>
                                              <input
                                                  type="text"
                                                  id="temperature"
                                                  value={vitalSigns.temperature}
                                                  onChange={(e) => setVitalSigns({ ...vitalSigns, temperature: e.target.value })}
                                                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                  placeholder="°F"
                                              />
                                          </div>
  
                                          <div>
                                              <label htmlFor="heartRate" className="block text-sm font-medium text-gray-700 mb-1">
                                                  Heart Rate
                                              </label>
                                              <input
                                                  type="text"
                                                  id="heartRate"
                                                  value={vitalSigns.heartRate}
                                                  onChange={(e) => setVitalSigns({ ...vitalSigns, heartRate: e.target.value })}
                                                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                  placeholder="BPM"
                                              />
                                          </div>
  
                                          <div>
                                              <label htmlFor="bloodPressure" className="block text-sm font-medium text-gray-700 mb-1">
                                                  Blood Pressure
                                              </label>
                                              <input
                                                  type="text"
                                                  id="bloodPressure"
                                                  value={vitalSigns.bloodPressure}
                                                  onChange={(e) => setVitalSigns({ ...vitalSigns, bloodPressure: e.target.value })}
                                                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                  placeholder="mmHg (e.g., 120/80)"
                                              />
                                          </div>
  
                                          <div>
                                              <label htmlFor="respiratoryRate" className="block text-sm font-medium text-gray-700 mb-1">
                                                  Respiratory Rate
                                              </label>
                                              <input
                                                  type="text"
                                                  id="respiratoryRate"
                                                  value={vitalSigns.respiratoryRate}
                                                  onChange={(e) => setVitalSigns({ ...vitalSigns, respiratoryRate: e.target.value })}
                                                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                  placeholder="Breaths/min"
                                              />
                                          </div>
  
                                          <div>
                                              <label htmlFor="oxygenSaturation" className="block text-sm font-medium text-gray-700 mb-1">
                                                  Oxygen Saturation
                                              </label>
                                              <input
                                                  type="text"
                                                  id="oxygenSaturation"
                                                  value={vitalSigns.oxygenSaturation}
                                                  onChange={(e) => setVitalSigns({ ...vitalSigns, oxygenSaturation: e.target.value })}
                                                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                  placeholder="% SpO2"
                                              />
                                          </div>
  
                                          <div>
                                              <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
                                                  Weight
                                              </label>
                                              <input
                                                  type="text"
                                                  id="weight"
                                                  value={vitalSigns.weight}
                                                  onChange={(e) => setVitalSigns({ ...vitalSigns, weight: e.target.value })}
                                                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                  placeholder="kg or lb"
                                              />
                                          </div>
  
                                          <div>
                                              <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
                                                  Height
                                              </label>
                                              <input
                                                  type="text"
                                                  id="height"
                                                  value={vitalSigns.height}
                                                  onChange={(e) => setVitalSigns({ ...vitalSigns, height: e.target.value })}
                                                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                  placeholder="cm or in"
                                              />
                                          </div>
                                      </div>
                                  </details>
                              </div>
  
                              {/* Additional Notes */}
                              <div>
                                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                                      Additional Notes (Optional)
                                  </label>
                                  <textarea
                                      id="notes"
                                      value={encounterNotes}
                                      onChange={(e) => setEncounterNotes(e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                      placeholder="Any additional context for this encounter"
                                      rows={2}
                                  />
                              </div>
  
                              {/* Submit Button */}
                              <div className="flex justify-end">
                                  <button
                                      type="submit"
                                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                      <span>Continue to Recording</span>
                                      <ArrowRight className="h-5 w-5" />
                                  </button>
                              </div>
                          </form>
                      </div>
                  ) : (
                      // Recording UI
                      <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 mb-8">
                          <div className="flex justify-between items-center mb-6">
                              <div>
                                  <h1 className="text-2xl font-bold text-gray-800">Recording Console</h1>
                                  <p className="text-gray-600">
                                      {isRecording
                                          ? "Recording in progress..."
                                          : "Start recording your consultation with " + patientNameValue}
                                  </p>
                              </div>
                              
                              {/* Patient Info Summary */}
                              <div className="bg-blue-50 p-3 rounded-lg">
                                  <h3 className="text-sm font-medium text-blue-800">{patientNameValue}</h3>
                                  <p className="text-xs text-blue-600">{chiefComplaint}</p>
                              </div>
                          </div>
  
                          {/* Recording UI */}
                          <div className="bg-gradient-to-b from-blue-50 to-blue-100 rounded-lg p-6 mb-6 shadow-inner">
                              <div className="flex justify-between items-center mb-4">
                                  <h2 className="text-lg font-semibold flex items-center gap-2">
                                      <Mic className="h-5 w-5 text-blue-600" />
                                      Voice Recording
                                  </h2>
  
                                  {isRecording && (
                                      <div className="flex items-center">
                                          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></div>
                                          <span className="font-medium text-red-600">Recording: {formatTime(recordingTime)}</span>
                                      </div>
                                  )}
                              </div>
  
                              {/* Recording status */}
                              {isRecording && (
                                  <div className="text-center mb-4">
                                      <div className="inline-flex items-center px-4 py-2 rounded-full bg-red-100 text-red-800 animate-pulse transition-all">
                                          <span className="mr-2 font-semibold">Recording Active</span>
                                          <span className="inline-block w-2 h-2 bg-red-600 rounded-full"></span>
                                      </div>
                                  </div>
                              )}
  
                              {/* Visualizer Canvas */}
                              <div className="w-full h-36 mb-6 bg-black/5 backdrop-blur-sm rounded-xl overflow-hidden shadow-inner transition-all duration-300 hover:shadow-md">
                                  <canvas
                                      ref={visualizerRef}
                                      className="w-full h-full"
                                  ></canvas>
                              </div>
  
                              {/* Recorder Controls */}
                              <div className="flex flex-wrap gap-4 justify-center">
                                  {!isRecording ? (
                                      <button
                                          onClick={startRecording}
                                          disabled={isProcessing || isGeneratingNote}
                                          className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95"
                                      >
                                          <Mic className="h-6 w-6" />
                                          Start Recording
                                      </button>
                                  ) : (
                                      <button
                                          onClick={stopRecording}
                                          className="flex items-center gap-2 px-8 py-4 bg-red-600 text-white rounded-full hover:bg-red-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 active:scale-95"
                                      >
                                          <StopCircle className="h-6 w-6" />
                                          Stop Recording
                                      </button>
                                  )}
  
                                  {audioBlob && !transcription && (
                                      <button
                                          onClick={discardRecording}
                                          disabled={isProcessing || isGeneratingNote}
                                          className="flex items-center gap-2 px-6 py-4 bg-white border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95"
                                      >
                                          <Trash2 className="h-5 w-5" />
                                          Discard
                                      </button>
                                  )}
  
                                  {canProcess && (
                                      <button
                                          onClick={sendToTranscriptionAPI}
                                          disabled={isProcessing || isGeneratingNote}
                                          className="flex items-center gap-2 px-6 py-4 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95"
                                      >
                                          {isProcessing || isGeneratingNote ? (
                                              <>
                                                  <Loader2 className="h-5 w-5 animate-spin" />
                                                  {isProcessing ? 'Transcribing...' : 'Generating note...'}
                                              </>
                                          ) : (
                                              <>
                                                  <Save className="h-5 w-5" />
                                                  Process Recording
                                              </>
                                          )}
                                      </button>
                                  )}
                              </div>
                          </div>
  
                          {/* Audio Player (if recording is complete) */}
                          {audioURL && !isRecording && (
                              <div className="mb-6">
                                  <h3 className="text-md font-medium mb-2 flex items-center gap-2">
                                      <FileText className="h-4 w-4 text-blue-600" />
                                      Recorded Audio
                                  </h3>
                                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                      <div className="mb-3">
                                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                              <span>Recording completed - {formatTime(recordingTime)}</span>
                                          </div>
                                      </div>
                                      <audio 
                                          controls 
                                          src={audioURL} 
                                          className="w-full h-12 rounded-lg" 
                                          style={{
                                              accentColor: '#3B82F6',
                                              backgroundColor: '#F0F9FF'
                                          }}
                                      />
                                  </div>
                              </div>
                          )}
  
                          {/* Error Message */}
                          {error && (
                              <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                                  <div className="flex items-center">
                                      <AlertCircle className="h-5 w-5 mr-2" />
                                      <p className="font-medium">{error}</p>
                                  </div>
                              </div>
                          )}
  
                          {/* Transcription Result */}
                          {transcription && !generatedNote && (
                              <div className="mb-6">
                                  <div className="flex items-center gap-2 mb-3">
                                      {isGeneratingNote ? (
                                          <>
                                              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                                              <h3 className="text-lg font-medium text-blue-700">Generating SOAP Note...</h3>
                                          </>
                                      ) : (
                                          <>
                                              <CheckCircle className="h-5 w-5 text-emerald-600" />
                                              <h3 className="text-lg font-medium text-emerald-700">Transcription Complete</h3>
                                          </>
                                      )}
                                  </div>
  
                                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                      <h4 className="font-medium mb-2">Patient: {patientNameValue || 'Unnamed Patient'}</h4>
                                      <h5 className="text-sm text-gray-600 mb-3">Encounter: {encounterType}</h5>
                                      <div className="prose max-w-none">
                                          <p>{transcription}</p>
                                      </div>
                                      {encounterNotes && (
                                          <div className="mt-4 pt-4 border-t border-gray-200">
                                              <h5 className="text-sm font-medium mb-1">Additional Notes:</h5>
                                              <p className="text-sm text-gray-600">{encounterNotes}</p>
                                          </div>
                                      )}
                                  </div>
                              </div>
                          )}
  
                          {/* Generated SOAP Note */}
                          {generatedNote && (
                              <div className="mb-6">
                                  <div className="flex items-center gap-2 mb-4 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                                      <CheckCircle className="h-8 w-8 text-emerald-600" />
                                      <div>
                                          <h3 className="text-lg font-semibold text-emerald-800">SOAP Note Generated</h3>
                                          <p className="text-sm text-emerald-600">The consultation has been successfully processed</p>
                                      </div>
                                  </div>
  
                                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                                      {/* Patient Info Section */}
                                      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                                          <h4 className="font-semibold mb-3 text-gray-800 flex items-center gap-1">
                                              <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                                              Patient Information
                                          </h4>
                                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                              <div className="p-2 bg-white rounded border border-gray-100 shadow-sm">
                                                  <span className="block text-xs text-gray-500">Name</span>
                                                  <span className="font-medium">{generatedNote.result.patientInfo.name || patientNameValue}</span>
                                              </div>
                                              <div className="p-2 bg-white rounded border border-gray-100 shadow-sm">
                                                  <span className="block text-xs text-gray-500">ID</span>
                                                  <span className="font-medium">{generatedNote.result.patientInfo.id || patientID || "Not specified"}</span>
                                              </div>
                                              <div className="p-2 bg-white rounded border border-gray-100 shadow-sm">
                                                  <span className="block text-xs text-gray-500">Gender</span>
                                                  <span className="font-medium">{generatedNote.result.patientInfo.gender || patientGender || "Not specified"}</span>
                                              </div>
                                              <div className="p-2 bg-white rounded border border-gray-100 shadow-sm">
                                                  <span className="block text-xs text-gray-500">Visit Date</span>
                                                  <span className="font-medium">{new Date().toLocaleDateString()}</span>
                                              </div>
                                              <div className="p-2 bg-white rounded border border-gray-100 shadow-sm">
                                                  <span className="block text-xs text-gray-500">Visit Type</span>
                                                  <span className="font-medium">{encounterType}</span>
                                              </div>
                                          </div>
                                      </div>
  
                                      {/* Abbreviated SOAP Note summary */}
                                      {generatedNote.result.soapNote.subjective.chiefComplaint && (
                                          <div className="p-4 border-b border-gray-100">
                                              <h4 className="font-semibold mb-3 text-gray-800 flex items-center gap-1">
                                                  <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                                                  Summary
                                              </h4>
                                              <div className="space-y-3 text-sm">
                                                  <div className="p-3 bg-blue-50 rounded-lg">
                                                      <span className="block text-xs text-blue-700 font-medium uppercase mb-1">Chief Complaint</span>
                                                      <span className="text-gray-800">{generatedNote.result.soapNote.subjective.chiefComplaint || chiefComplaint}</span>
                                                  </div>
  
                                                  {/* Primary Diagnosis if available */}
                                                  {generatedNote.result.soapNote.assessment.diagnoses.length > 0 && (
                                                      <div className="p-3 bg-blue-50 rounded-lg">
                                                          <div className="flex justify-between items-center">
                                                              <span className="block text-xs text-blue-700 font-medium uppercase mb-1">Primary Diagnosis</span>
                                                              <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">
                                                                  {generatedNote.result.soapNote.assessment.diagnoses[0].icdCode}
                                                              </span>
                                                          </div>
                                                          <span className="text-gray-800 font-medium">{generatedNote.result.soapNote.assessment.diagnoses[0].diagnosisName}</span>
                                                      </div>
                                                  )}
                                              </div>
                                          </div>
                                      )}
  
                                      {/* Bottom controls */}
                                      <div className="p-4 flex justify-between bg-gray-50">
                                          <button
                                              onClick={() => setFormSubmitted(false)}
                                              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                                          >
                                              <ArrowRight className="h-4 w-4 rotate-180" />
                                              Back to Patient Info
                                          </button>
                                          
                                          <button
                                              onClick={resetAllData}
                                              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                                          >
                                              <Mic className="h-4 w-4" />
                                              Record New Consultation
                                          </button>
                                      </div>
                                  </div>
                              </div>
                          )}
                      </div>
                  )}
              </main>
          </div>
      );
  }