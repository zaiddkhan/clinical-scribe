'use client';

import { useState, useRef, useEffect } from 'react';
import {
    Mic,
    StopCircle,
    Save,
    Loader2,
    FileText,
    CheckCircle,
    Trash2
} from 'lucide-react';
import {
    TranscriptionResponse,
    GeneratedNote,
} from '@/lib/types';

interface ClinicalVoiceRecorderProps {
    patientName?: string;
}

export default function ClinicalVoiceRecorder({ patientName = '' }: ClinicalVoiceRecorderProps) {
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
    const [patientNameValue, setPatientName] = useState<string>(patientName || 'Kushagra Kumar');
    const [patientDOB, setPatientDOB] = useState<string>('2000-01-01');
    const [patientGender, setPatientGender] = useState<string>('Male');
    const [patientID, setPatientID] = useState<string>(`PA-${new Date().getTime()}`);
    const [patientContact, setPatientContact] = useState<string>('9234567890');
    const [patientInsurance, setPatientInsurance] = useState<string>('N/A');
    const [patientPCP, setPatientPCP] = useState<string>('N/A');

    // Medical information
    const [patientAllergies, setPatientAllergies] = useState<string>('');
    const [patientMedications, setPatientMedications] = useState<string>('');
    const [chiefComplaint, setChiefComplaint] = useState<string>('Tingling and pain in both feet for 2-3 weeks, worse at night');

    // Encounter details
    const [encounterType, setEncounterType] = useState<string>('Initial Consultation');
    const [encounterNotes, setEncounterNotes] = useState<string>('It also happened with me in the past and I took antibiotics to control it.');

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
        temperature: '98.6',
        heartRate: '82',
        bloodPressure: '120/80',
        respiratoryRate: '16',
        oxygenSaturation: '98',
        weight: '64',
        height: '177',
        bmi: '20.4',
        pain: '0'
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

        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;
        const analyser = audioContext.createAnalyser();
        analyserRef.current = analyser;
        analyser.fftSize = 256;

        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        const renderFrame = () => {
            if (!isRecording) return;

            requestAnimationFrame(renderFrame);

            analyser.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Calculate average volume level for animation
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
            }
            const average = sum / bufferLength;
            audioLevelsRef.current.push(average);

            // Keep only the last 50 levels for visualization
            if (audioLevelsRef.current.length > 50) {
                audioLevelsRef.current.shift();
            }

            // Draw visualization
            const barWidth = (canvas.width / audioLevelsRef.current.length) * 0.8;
            let x = 0;

            ctx.fillStyle = '#3B82F6'; // Blue color matching the recording button

            for (let i = 0; i < audioLevelsRef.current.length; i++) {
                const barHeight = (audioLevelsRef.current[i] / 255) * canvas.height * 0.8;
                ctx.fillRect(
                    x,
                    (canvas.height - barHeight) / 2,
                    barWidth,
                    barHeight
                );
                x += barWidth + 1;
            }
        };

        renderFrame();
    };

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

            // Clear visualizer
            const canvas = visualizerRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
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

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 p-4">
            <main className="flex-1 max-w-4xl mx-auto w-full">
                <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 mb-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Clinical Voice Recorder</h1>
                    <p className="text-gray-600 mb-6">Record patient consultations for automated documentation</p>

                    {/* Patient Information Form */}
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                            Patient Information
                        </h2>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {/* Basic Information */}
                            <div>
                                <label htmlFor="patientName" className="block text-sm font-medium text-gray-700 mb-1">
                                    Patient Name*
                                </label>
                                <input
                                    type="text"
                                    id="patientName"
                                    value={patientNameValue}
                                    onChange={(e) => setPatientName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Full name"
                                    disabled={isRecording || isProcessing}
                                />
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    disabled={isRecording || isProcessing}
                                />
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
                                    disabled={isRecording || isProcessing}
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Phone number"
                                    disabled={isRecording || isProcessing}
                                />
                            </div>

                            {/* Insurance and Provider */}
                            <div>
                                <label htmlFor="patientInsurance" className="block text-sm font-medium text-gray-700 mb-1">
                                    Insurance
                                </label>
                                <input
                                    type="text"
                                    id="patientInsurance"
                                    value={patientInsurance}
                                    onChange={(e) => setPatientInsurance(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Insurance provider"
                                    disabled={isRecording || isProcessing}
                                />
                            </div>

                            <div>
                                <label htmlFor="patientPCP" className="block text-sm font-medium text-gray-700 mb-1">
                                    Primary Care Provider
                                </label>
                                <input
                                    type="text"
                                    id="patientPCP"
                                    value={patientPCP}
                                    onChange={(e) => setPatientPCP(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Provider name"
                                    disabled={isRecording || isProcessing}
                                />
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
                                    disabled={isRecording || isProcessing}
                                >
                                    {encounterTypesOptions.map((type) => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Chief Complaint */}
                        <div className="mt-4">
                            <label htmlFor="chiefComplaint" className="block text-sm font-medium text-gray-700 mb-1">
                                Chief Complaint
                            </label>
                            <input
                                type="text"
                                id="chiefComplaint"
                                value={chiefComplaint}
                                onChange={(e) => setChiefComplaint(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Primary reason for visit"
                                disabled={isRecording || isProcessing}
                            />
                        </div>

                        {/* Allergies and Medications - Expandable/Collapsible Section */}
                        <div className="mt-4">
                            <details className="bg-gray-50 rounded-md p-2">
                                <summary className="cursor-pointer font-medium text-sm text-gray-700 py-1">
                                    Allergies & Medications
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
                                            disabled={isRecording || isProcessing}
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
                                            disabled={isRecording || isProcessing}
                                        />
                                    </div>
                                </div>
                            </details>
                        </div>

                        {/* Vital Signs - Expandable/Collapsible Section */}
                        <div className="mt-4">
                            <details className="bg-gray-50 rounded-md p-2">
                                <summary className="cursor-pointer font-medium text-sm text-gray-700 py-1">
                                    Vital Signs
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
                                            disabled={isRecording || isProcessing}
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
                                            disabled={isRecording || isProcessing}
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
                                            disabled={isRecording || isProcessing}
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
                                            disabled={isRecording || isProcessing}
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
                                            disabled={isRecording || isProcessing}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="pain" className="block text-sm font-medium text-gray-700 mb-1">
                                            Pain Score
                                        </label>
                                        <input
                                            type="text"
                                            id="pain"
                                            value={vitalSigns.pain}
                                            onChange={(e) => setVitalSigns({ ...vitalSigns, pain: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="0-10"
                                            disabled={isRecording || isProcessing}
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
                                            disabled={isRecording || isProcessing}
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
                                            disabled={isRecording || isProcessing}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="bmi" className="block text-sm font-medium text-gray-700 mb-1">
                                            BMI
                                        </label>
                                        <input
                                            type="text"
                                            id="bmi"
                                            value={vitalSigns.bmi}
                                            onChange={(e) => setVitalSigns({ ...vitalSigns, bmi: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="kg/m²"
                                            disabled={isRecording || isProcessing}
                                        />
                                    </div>
                                </div>
                            </details>
                        </div>

                        {/* Additional Notes */}
                        <div className="mt-4">
                            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                                Additional Notes
                            </label>
                            <textarea
                                id="notes"
                                value={encounterNotes}
                                onChange={(e) => setEncounterNotes(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Any additional context for this encounter"
                                rows={2}
                                disabled={isRecording || isProcessing}
                            />
                        </div>
                    </div>

                    {/* Recording UI */}
                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
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

                        {/* Visualizer Canvas */}
                        <div className="w-full h-24 mb-6 bg-gray-100 rounded-lg overflow-hidden">
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
                                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Mic className="h-5 w-5" />
                                    Start Recording
                                </button>
                            ) : (
                                <button
                                    onClick={stopRecording}
                                    className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                                >
                                    <StopCircle className="h-5 w-5" />
                                    Stop Recording
                                </button>
                            )}

                            {audioBlob && !transcription && (
                                <button
                                    onClick={discardRecording}
                                    disabled={isProcessing || isGeneratingNote}
                                    className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Trash2 className="h-5 w-5" />
                                    Discard
                                </button>
                            )}

                            {canProcess && (
                                <button
                                    onClick={sendToTranscriptionAPI}
                                    disabled={isProcessing || isGeneratingNote}
                                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                            <audio controls src={audioURL} className="w-full" />
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                            <p className="font-medium">{error}</p>
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
                            <div className="flex items-center gap-2 mb-3">
                                <CheckCircle className="h-5 w-5 text-emerald-600" />
                                <h3 className="text-lg font-medium text-emerald-700">SOAP Note Generated</h3>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                {/* Patient Info Section */}
                                <div className="mb-4 pb-3 border-b border-gray-200">
                                    <h4 className="font-medium mb-2 text-blue-800">Patient Information</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                                        <div><span className="font-medium">Name:</span> {generatedNote.result.patientInfo.name || patientNameValue}</div>
                                        <div><span className="font-medium">ID:</span> {generatedNote.result.patientInfo.id || patientID || "Not specified"}</div>
                                        <div><span className="font-medium">DOB:</span> {generatedNote.result.patientInfo.dob || patientDOB || "Not specified"}</div>
                                        <div><span className="font-medium">Gender:</span> {generatedNote.result.patientInfo.gender || patientGender || "Not specified"}</div>
                                        <div><span className="font-medium">Contact:</span> {generatedNote.result.patientInfo.contact || patientContact || "Not specified"}</div>
                                        <div><span className="font-medium">Insurance:</span> {generatedNote.result.patientInfo.insurance || patientInsurance || "Not specified"}</div>
                                        <div><span className="font-medium">PCP:</span> {generatedNote.result.patientInfo.pcp || patientPCP || "Not specified"}</div>
                                        <div><span className="font-medium">Visit Date:</span> {generatedNote.result.patientInfo.visitDate || new Date().toLocaleDateString()}</div>
                                        <div><span className="font-medium">Visit Type:</span> {encounterType}</div>
                                    </div>
                                </div>

                                {/* S: Subjective */}
                                <div className="mb-4 pb-3 border-b border-gray-200">
                                    <h4 className="font-medium mb-2 text-blue-800">S: Subjective</h4>

                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <span className="font-medium inline-block w-40">Chief Complaint:</span>
                                            <span>{generatedNote.result.soapNote.subjective.chiefComplaint || chiefComplaint}</span>
                                        </div>

                                        <div>
                                            <span className="font-medium inline-block">History of Present Illness:</span>
                                            <p className="mt-1">{generatedNote.result.soapNote.subjective.historyOfPresentIllness}</p>
                                        </div>

                                        {generatedNote.result.soapNote.subjective.pastMedicalHistory !== "Not mentioned" && (
                                            <div>
                                                <span className="font-medium inline-block">Past Medical History:</span>
                                                <p className="mt-1">{generatedNote.result.soapNote.subjective.pastMedicalHistory}</p>
                                            </div>
                                        )}

                                        {generatedNote.result?.soapNote?.subjective?.medications?.length > 0 || patientMedications ? (
                                            <div>
                                                <span className="font-medium">Medications:</span>
                                                {generatedNote.result?.soapNote?.subjective?.medications?.length > 0 ? (
                                                    <ul className="list-disc list-inside mt-1">
                                                        {generatedNote.result?.soapNote?.subjective?.medications?.map((med, index) => (
                                                            <li key={index}>{med}</li>
                                                        ))}
                                                    </ul>
                                                ) : patientMedications ? (
                                                    <p className="mt-1">{patientMedications}</p>
                                                ) : null}
                                            </div>
                                        ) : null}

                                        {generatedNote.result.soapNote.subjective.allergies.length > 0 || patientAllergies ? (
                                            <div>
                                                <span className="font-medium">Allergies:</span>
                                                {generatedNote.result.soapNote.subjective.allergies.length > 0 ? (
                                                    <ul className="list-disc list-inside mt-1">
                                                        {generatedNote.result.soapNote.subjective.allergies.map((allergy, index) => (
                                                            <li key={index}>{allergy}</li>
                                                        ))}
                                                    </ul>
                                                ) : patientAllergies ? (
                                                    <p className="mt-1">{patientAllergies}</p>
                                                ) : null}
                                            </div>
                                        ) : null}

                                        {generatedNote.result.soapNote.subjective.socialHistory !== "Not mentioned" && (
                                            <div>
                                                <span className="font-medium inline-block">Social History:</span>
                                                <p className="mt-1">{generatedNote.result.soapNote.subjective.socialHistory}</p>
                                            </div>
                                        )}

                                        {generatedNote.result.soapNote.subjective.familyHistory !== "Not mentioned" && (
                                            <div>
                                                <span className="font-medium inline-block">Family History:</span>
                                                <p className="mt-1">{generatedNote.result.soapNote.subjective.familyHistory}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* O: Objective */}
                                <div className="mb-4 pb-3 border-b border-gray-200">
                                    <h4 className="font-medium mb-2 text-blue-800">O: Objective</h4>

                                    <div className="space-y-2 text-sm">
                                        {/* Vital Signs */}
                                        <div>
                                            <span className="font-medium">Vital Signs:</span>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
                                                {/* Display entered vital signs if available, otherwise use from generated note */}
                                                {Object.entries({
                                                    ...Object.entries(vitalSigns).reduce<Record<string, string>>((acc, [key, value]) => {
                                                        if (value) acc[key] = value;
                                                        return acc;
                                                    }, {}),

                                                    ...Object.entries(generatedNote?.result?.soapNote?.objective?.vitalSigns || {}).reduce<Record<string, string>>((acc, [key, value]) => {
                                                        if (value !== "Not mentioned" && !vitalSigns[key as keyof typeof vitalSigns]) acc[key] = value;
                                                        return acc;
                                                    }, {})
                                                }).map(([key, value]) => (
                                                    <div key={key} className="flex">
                                                        <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                                        <span className="ml-1">{value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Physical Exam */}
                                        {generatedNote.result.soapNote.objective.physicalExamination !== "Not mentioned" && (
                                            <div>
                                                <span className="font-medium inline-block">Physical Examination:</span>
                                                <p className="mt-1">{generatedNote.result.soapNote.objective.physicalExamination}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* A: Assessment */}
                                <div className="mb-4 pb-3 border-b border-gray-200">
                                    <h4 className="font-medium mb-2 text-blue-800">A: Assessment</h4>

                                    <div className="space-y-3 text-sm">
                                        {generatedNote.result.soapNote.assessment.diagnoses.map((diagnosis, index) => (
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

                                        {generatedNote.result.soapNote.assessment.differentialDiagnoses.length > 0 && (
                                            <div>
                                                <span className="font-medium">Differential Diagnoses:</span>
                                                <ul className="list-disc list-inside mt-1">
                                                    {generatedNote.result.soapNote.assessment.differentialDiagnoses.map((diff, index) => (
                                                        <li key={index}>{diff}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* P: Plan */}
                                <div className="mb-2">
                                    <h4 className="font-medium mb-2 text-blue-800">P: Plan</h4>

                                    <div className="space-y-2 text-sm">
                                        {generatedNote.result.soapNote.plan.diagnosticTests.length > 0 && (
                                            <div>
                                                <span className="font-medium">Diagnostic Tests:</span>
                                                <ul className="list-disc list-inside mt-1">
                                                    {generatedNote.result.soapNote.plan.diagnosticTests.map((test, index) => (
                                                        <li key={index}>{test}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {generatedNote.result.soapNote.plan.treatments.length > 0 && (
                                            <div>
                                                <span className="font-medium">Treatments:</span>
                                                <ul className="list-disc list-inside mt-1">
                                                    {generatedNote.result.soapNote.plan.treatments.map((treatment, index) => (
                                                        <li key={index}>{treatment}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {generatedNote.result.soapNote.plan.medications.length > 0 && (
                                            <div>
                                                <span className="font-medium">Medications:</span>
                                                <ul className="list-disc list-inside mt-1">
                                                    {generatedNote.result.soapNote.plan.medications.map((med, index) => (
                                                        <li key={index}>{med}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {generatedNote.result.soapNote.plan.patientEducation && (
                                            <div>
                                                <span className="font-medium inline-block">Patient Education:</span>
                                                <p className="mt-1">{generatedNote.result.soapNote.plan.patientEducation}</p>
                                            </div>
                                        )}

                                        {generatedNote.result.soapNote.plan.followUp && (
                                            <div>
                                                <span className="font-medium inline-block">Follow-up:</span>
                                                <p className="mt-1">{generatedNote.result.soapNote.plan.followUp}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 flex justify-center">
                                <button
                                    onClick={() => {
                                        // Reset audio and transcription states
                                        setAudioURL(null);
                                        setAudioBlob(null);
                                        setTranscription(null);
                                        setGeneratedNote(null);

                                        // Reset basic patient info
                                        setPatientName('');
                                        setPatientDOB('');
                                        setPatientGender('');
                                        setPatientID(`PA-${new Date().getTime()}`);
                                        setPatientContact('');
                                        setPatientInsurance('');
                                        setPatientPCP('');

                                        // Reset medical information
                                        setPatientAllergies('');
                                        setPatientMedications('');
                                        setChiefComplaint('');

                                        // Reset encounter details
                                        setEncounterType('Initial Consultation');
                                        setEncounterNotes('');

                                        // Reset vital signs
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
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    <Mic className="h-4 w-4" />
                                    Record New Consultation
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}