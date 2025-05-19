import { TranscriptEntry } from './types';
import { Icons } from '@/components/ui/icons';

// Theme and color constants
export const COLORS = {
  primary: '#1A73E8',
  secondary: '#009688',
  accent: '#1E3A8A',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  doctor: '#E3F2FD',
  doctorText: '#1A73E8',
  patient: '#E0F2F1',
  patientText: '#009688',
};

// Navigation items
type IconName = keyof typeof Icons;

type NavItem = {
  name: string;
  href: string;
  icon: IconName;
};

export const NAV_ITEMS: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/',
    icon: 'layoutDashboard',
  },
  {
    name: 'New Consultation',
    href: '/consultation/new',
    icon: 'mic',
  },
  {
    name: 'Patient Records',
    href: '/patients',
    icon: 'users',
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: 'settings',
  },
];

// Mock data for dashboard
type StatItem = {
  label: string;
  value: number | string;
  change: string;
  icon: IconName;
};

export const MOCK_STATS: StatItem[] = [
  {
    label: 'Consultations Completed',
    value: 128,
    change: '+12%',
    icon: 'fileCheck',
  },
  {
    label: 'Time Saved',
    value: '43h',
    change: '+8%',
    icon: 'clock',
  },
  {
    label: 'Patients Seen',
    value: 86,
    change: '+5%',
    icon: 'users',
  },
  {
    label: 'Notes Generated',
    value: 210,
    change: '+15%',
    icon: 'fileText',
  },
];

export const MOCK_RECENT_CONSULTATIONS = [
  {
    id: 'cons-001',
    patientName: 'Zaid Khan',
    patientId: 'P-1234',
    date: '2025-03-28T09:30:00',
    status: 'completed',
    duration: '14m 32s',
  },
  {
    id: 'cons-002',
    patientName: 'Kushagra Kumar',
    patientId: 'P-2345',
    date: '2025-03-27T15:45:00',
    status: 'pending_review',
    duration: '22m 15s',
  },
  {
    id: 'cons-003',
    patientName: 'Bhavesh Gunjal',
    patientId: 'P-3456',
    date: '2025-03-27T11:20:00',
    status: 'completed',
    duration: '18m 47s',
  },
  {
    id: 'cons-004',
    patientName: 'Sourav Dev',
    patientId: 'P-4567',
    date: '2025-03-26T14:10:00',
    status: 'completed',
    duration: '12m 33s',
  },
];

// Mock data for patients
export const MOCK_PATIENTS = [
  {
    id: 'P-1234',
    name: 'James Wilson',
    age: 42,
    gender: 'Male',
    dob: '1983-05-12',
    phone: '(555) 123-4567',
    email: 'james.wilson@example.com',
    address: '123 Main St, Boston, MA',
    consultations: 8,
    lastVisit: '2025-03-28T09:30:00',
  },
  {
    id: 'P-2345',
    name: 'Sarah Johnson',
    age: 35,
    gender: 'Female',
    dob: '1990-11-23',
    phone: '(555) 234-5678',
    email: 'sarah.johnson@example.com',
    address: '456 Oak Ave, Boston, MA',
    consultations: 5,
    lastVisit: '2025-03-27T15:45:00',
  },
  {
    id: 'P-3456',
    name: 'Michael Brown',
    age: 58,
    gender: 'Male',
    dob: '1967-03-15',
    phone: '(555) 345-6789',
    email: 'michael.brown@example.com',
    address: '789 Pine St, Cambridge, MA',
    consultations: 12,
    lastVisit: '2025-03-27T11:20:00',
  },
  {
    id: 'P-4567',
    name: 'Emily Davis',
    age: 29,
    gender: 'Female',
    dob: '1996-08-30',
    phone: '(555) 456-7890',
    email: 'emily.davis@example.com',
    address: '101 Elm Rd, Somerville, MA',
    consultations: 3,
    lastVisit: '2025-03-26T14:10:00',
  },
  {
    id: 'P-5678',
    name: 'Robert Miller',
    age: 67,
    gender: 'Male',
    dob: '1958-01-04',
    phone: '(555) 567-8901',
    email: 'robert.miller@example.com',
    address: '222 Maple Dr, Brookline, MA',
    consultations: 15,
    lastVisit: '2025-03-25T10:15:00',
  },
  {
    id: 'P-6789',
    name: 'Jennifer Taylor',
    age: 41,
    gender: 'Female',
    dob: '1984-07-19',
    phone: '(555) 678-9012',
    email: 'jennifer.taylor@example.com',
    address: '333 Birch Ln, Newton, MA',
    consultations: 7,
    lastVisit: '2025-03-24T16:30:00',
  },
];

// Mock transcript data
export const MOCK_TRANSCRIPT: TranscriptEntry[] = [
  {
    id: 1,
    speaker: 'doctor',
    text: 'Good morning, Mrs. Johnson. How are you feeling today?',
    timestamp: '00:00:05',
  },
  {
    id: 2,
    speaker: 'patient',
    text: `Not very well, doctor. I've been having these terrible headaches for the past week.`,
    timestamp: '00:00:12',
  },
  {
    id: 3,
    speaker: 'doctor',
    text: `I'm sorry to hear that. Can you describe the headaches? Where is the pain located?`,
    timestamp: '00:00:20',
  },
  {
    id: 4,
    speaker: 'patient',
    text: `It's mostly on the right side of my head, behind my eye. It's a throbbing pain that gets worse when I move around or bend over.`,
    timestamp: '00:00:32',
  },
  {
    id: 5,
    speaker: 'doctor',
    text: `How would you rate the pain on a scale of 1 to 10, with 10 being the worst pain you've ever experienced?`,
    timestamp: '00:00:48',
  },
  {
    id: 6,
    speaker: 'patient',
    text: `It's about a 7 or 8 when it's really bad. In the mornings it's worse, maybe an 8, and then it drops to about a 6 by evening.`,
    timestamp: '00:01:01',
  },
  {
    id: 7,
    speaker: 'doctor',
    text: 'Have you noticed any other symptoms along with the headaches? Any nausea, vomiting, sensitivity to light or sound?',
    timestamp: '00:01:15',
  },
  {
    id: 8,
    speaker: 'patient',
    text: `Yes, I'm definitely sensitive to bright lights. And sometimes I feel a bit nauseous, especially in the morning. I haven't vomited though.`,
    timestamp: '00:01:28',
  },
];

// Mock SOAP note
export const MOCK_SOAP_NOTE = {
  subjective: 'Patient is a 35-year-old female presenting with severe headaches for the past week. She describes the pain as throbbing, located on the right side of her head behind her eye, rating it 7-8/10 in severity. Pain is worse in the mornings (8/10) and improves slightly by evening (6/10). Associated symptoms include photosensitivity and morning nausea without vomiting. Pain worsens with movement and bending over.',
  objective: 'Vital Signs: BP 128/82, HR 76, RR 16, Temp 98.6°F, SpO2 99%\n\nGeneral: Alert and oriented x3, in mild distress due to headache\nHEENT: Pupils equal, round, reactive to light. No papilledema. Mild tenderness to palpation over right temporal region. No sinus tenderness.\nNeurological: CN II-XII intact. Motor strength 5/5 in all extremities. Sensation intact. Negative Romberg. Normal gait.',
  assessment: [
    {
      diagnosis: 'Migraine without aura',
      icdCode: 'G43.009',
      confidence: 0.89,
    },
    {
      diagnosis: 'Tension headache',
      icdCode: 'G44.209',
      confidence: 0.45,
    },
    {
      diagnosis: 'Dehydration',
      icdCode: 'E86.0',
      confidence: 0.32,
    },
  ],
  plan: '1. Start Sumatriptan 50mg oral at onset of headache, may repeat in 2 hours if needed, not to exceed 200mg in 24 hours\n\n2. Lifestyle modifications: Regular sleep schedule, adequate hydration, stress management techniques\n\n3. Maintain headache diary to identify triggers\n\n4. Follow up in 2 weeks to assess response to treatment\n\n5. Return sooner if headaches worsen, change in character, or new neurological symptoms develop',
};