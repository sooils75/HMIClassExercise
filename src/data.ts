import { PatientFeedbackRow } from './types';

export const SAMPLE_PATIENT_FEEDBACK: PatientFeedbackRow[] = [
  {
    id: "PT-001",
    patientName: "Margaret Jenkins (De-identified)",
    comment: "I waited for over two hours in the Emergency Room waiting area with severe abdominal pain before anyone saw me. When I asked the receptionist how much longer, she was very dismissive and told me to sit down and wait my turn. The clinical staff was nice once I got in, but the wait was unbearable and made my anxiety shoot through the roof.",
    satisfactionScore: 2,
    communicationRating: 1,
    serviceLine: "Emergency Department",
    visitType: "Emergency",
    patientPersona: "Older Adult",
    followUpCompliant: true,
    timestamp: "2026-07-09T10:30:00Z"
  },
  {
    id: "PT-002",
    patientName: "Luis Alvarez (De-identified)",
    comment: "No pude entender las instrucciones de alta médica porque nadie hablaba español y el folleto que me dieron estaba solo en inglés. Tuve que llamar a mi hijo al trabajo para que me tradujera las dosis de mis medicamentos para el corazón. Esto es peligroso, casi tomo el doble de la dosis indicada por confusión con las etiquetas del frasco.",
    satisfactionScore: 1,
    communicationRating: 1,
    serviceLine: "Cardiology",
    visitType: "Outpatient",
    patientPersona: "Limited English Proficiency",
    followUpCompliant: false,
    timestamp: "2026-07-09T14:15:00Z"
  },
  {
    id: "PT-003",
    patientName: "Sarah Chen (De-identified)",
    comment: "The billing department charged me $450 for a routine follow-up checkup that was supposed to be completely covered by my insurance as preventative care. I have spent three hours on hold over the last two days trying to speak with a billing representative, but keep getting disconnected. The automatic portal helper chat is useless.",
    satisfactionScore: 2,
    communicationRating: 2,
    serviceLine: "General Medicine",
    visitType: "Outpatient",
    patientPersona: "General",
    followUpCompliant: true,
    timestamp: "2026-07-08T11:00:00Z"
  },
  {
    id: "PT-004",
    patientName: "Arthur Sterling (De-identified)",
    comment: "The patient portal is extremely hard to navigate on my phone. It forced me to complete a two-factor authentication, but the SMS code never arrived, so I couldn't log in to see my lab results before my doctor visit. I am 78 years old and these digital requirements feel like they are locking me out of my own care information.",
    satisfactionScore: 2,
    communicationRating: 3,
    serviceLine: "General Medicine",
    visitType: "Outpatient",
    patientPersona: "Low Digital Literacy",
    followUpCompliant: false,
    timestamp: "2026-07-08T09:45:00Z"
  },
  {
    id: "PT-005",
    patientName: "Eleanor Vance (De-identified)",
    comment: "I am a wheelchair user and the automated clinic check-in kiosk was placed so high on the counter that I couldn't reach the touchscreen to scan my ID. I had to wait until a staff member walked past to ask for help, which felt very undignified. The clinic itself was clean and Dr. Henderson was excellent as usual.",
    satisfactionScore: 3,
    communicationRating: 4,
    serviceLine: "Pediatrics", // e.g. Orthopedics / Pediatrics clinic
    visitType: "Outpatient",
    patientPersona: "Patient with Disability",
    followUpCompliant: true,
    timestamp: "2026-07-07T16:20:00Z"
  },
  {
    id: "PT-006",
    patientName: "John Miller (De-identified)",
    comment: "I live in a very rural area and drove 90 miles for my chemotherapy appointment, only to be told that the specialist was out sick and my appointment had been cancelled. I didn't receive any phone call, email, or portal notification beforehand. This cost me a day of lost wages and half a tank of gas. Absolute failure of care coordination.",
    satisfactionScore: 1,
    communicationRating: 1,
    serviceLine: "Cardiology", // oncology / general clinic
    visitType: "Outpatient",
    patientPersona: "Rural Patient",
    followUpCompliant: false,
    timestamp: "2026-07-07T08:15:00Z"
  },
  {
    id: "PT-007",
    patientName: "James Thompson (De-identified)",
    comment: "Dr. Evans and the nursing team in the maternity ward were absolutely incredible. They explained every step of the labor and delivery process, listened to my birth plan, and made us feel so safe and respected during the birth of our daughter. The postpartum follow-up phone call the next day was also deeply appreciated.",
    satisfactionScore: 5,
    communicationRating: 5,
    serviceLine: "Obstetrics",
    visitType: "Inpatient",
    patientPersona: "General",
    followUpCompliant: true,
    timestamp: "2026-07-06T13:40:00Z"
  },
  {
    id: "PT-008",
    patientName: "Robert Davis (De-identified)",
    comment: "The discharge nurse rushed me out of the room so fast she forgot to give me my prescription for pain medication. I got all the way home before realizing, and had to drive back in heavy traffic while in significant pain. When I called the office, the triage line was busy for an hour. High-stress experience for no reason.",
    satisfactionScore: 2,
    communicationRating: 2,
    serviceLine: "General Medicine",
    visitType: "Inpatient",
    patientPersona: "General",
    followUpCompliant: true,
    timestamp: "2026-07-05T15:10:00Z"
  },
  {
    id: "PT-009",
    patientName: "Clara Benson (De-identified)",
    comment: "My cardiology visit was great, very professional and on time. But the online scheduling tool keeps crashing and resetting my preferred location to the main hospital campus rather than my local suburban clinic. This digital system is extremely frustrating and buggy.",
    satisfactionScore: 3,
    communicationRating: 4,
    serviceLine: "Cardiology",
    visitType: "Outpatient",
    patientPersona: "Older Adult",
    followUpCompliant: true,
    timestamp: "2026-07-04T11:30:00Z"
  },
  {
    id: "PT-010",
    patientName: "De-identified Patient",
    comment: "Excellent clinical care and friendly nurses. Wait times are somewhat long, but the staff communicates the delays transparently, which makes a big difference.",
    satisfactionScore: 4,
    communicationRating: 5,
    serviceLine: "Pediatrics",
    visitType: "Outpatient",
    patientPersona: "General",
    followUpCompliant: true,
    timestamp: "2026-07-03T09:00:00Z"
  }
];
