export interface Reminder {
  id: string;
  title: string;
  type: "medication" | "appointment" | "wellness" | "general";
  categoryNote?: string;
  dateTime: string;
  recurrence?: "none" | "daily" | "weekly" | "monthly";
  completed: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isEmergency?: boolean;
  disclaimer?: string;
}

export interface SymptomScenario {
  name: string;
  ageGroup: string;
  mainSymptom: string;
  duration: string;
  severity: string;
  additionalDetails: string;
  isEmergencyDemo?: boolean;
}

export interface LabTestItem {
  testName: string;
  measuredValue: string;
  unit: string;
  referenceRange: string;
  status: "normal" | "high" | "low" | "abnormal" | "inconclusive";
  whatItMeasures: string;
  explanation: string;
}

export interface ReportAnalysis {
  summary: string;
  tests: LabTestItem[];
  highOrLowFindings: string[];
  generalExplanations: string[];
  questionsForDoctor: string[];
  unreadableNotes?: string;
  disclaimer: string;
  isSyntheticSample?: boolean;
}

export interface WellnessData {
  waterMl: number;
  waterGoalMl: number;
  sleepHours: number;
  sleepGoalHours: number;
  activityMinutes: number;
  activityGoalMinutes: number;
  moodNote: string;
  date: string;
}

export interface WellnessTip {
  title: string;
  advice: string;
  category: string;
}
