export interface PatientFeedbackRow {
  id: string;
  patientName: string;
  comment: string;
  satisfactionScore: number; // 1 to 5
  communicationRating: number; // 1 to 5
  serviceLine: string; // e.g., "Emergency Department", "Cardiology", "Pediatrics", "General Medicine", "Obstetrics"
  visitType: string; // e.g., "Inpatient", "Outpatient", "Emergency"
  patientPersona: string; // e.g., "Older Adult", "Rural Patient", "Patient with Disability", "Limited English Proficiency", "Low Digital Literacy", "General"
  followUpCompliant: boolean;
  timestamp: string;
}

export interface FeedbackInsightResult {
  rowId: string;
  theme: 'Communication' | 'Scheduling' | 'Wait Time' | 'Technology / Patient Portal' | 'Billing' | 'Clinical Care' | 'Discharge / Follow-Up' | 'Accessibility / Equity' | 'Mixed or Ambiguous';
  sentiment: 'Positive' | 'Negative' | 'Neutral' | 'Mixed';
  reasoning: string;
  operationalIssue: string;
  riskBiasConcern: string;
  recommendedAction: string;
}

export interface ExperienceMonitoringResult {
  rowId: string;
  theme: string;
  secondaryThemes: string[];
  sentiment: 'Positive' | 'Negative' | 'Neutral' | 'Mixed';
  reasoning: string;
  operationalIssue: string;
  equityAccessibilityConcern: string;
  riskLevel: 'Low Risk' | 'Moderate Risk' | 'High Risk';
  managerialRecommendation: string;
  executiveSummary: {
    primaryIssue: string;
    severity: string;
    recommendedAction: string;
  };
}

export interface ComplaintTriageResult {
  rowId: string;
  category: string;
  secondaryCategories: string[];
  severityLevel: 'LEVEL 1 – Low' | 'LEVEL 2 – Moderate' | 'LEVEL 3 – High' | 'LEVEL 4 – Critical';
  severityJustification: string;
  riskFlags: string[];
  recommendedDepartment: string;
  escalationPriority: 'Routine' | 'Priority' | 'Immediate';
  humanReviewStatus: 'AI Review Only' | 'Human Review Recommended' | 'Human Review Required';
  executiveSummary: {
    category: string;
    severity: string;
    majorRisk: string;
    recommendedAction: string;
  };
}

export interface AnalyticsAgentResult {
  executiveOverview: {
    totalAnalyzed: number;
    avgSatisfaction: number;
    avgCommunication: number;
    followUpComplianceRate: number; // percentage (e.g. 85 for 85%)
    serviceLinesCount: number;
  };
  satisfactionDistribution: { score: number; count: number }[];
  satisfactionByServiceLine: { serviceLine: string; score: number }[];
  satisfactionByVisitType: { visitType: string; score: number }[];
  satisfactionByPersona: { persona: string; score: number }[];
  topThemes: { theme: string; count: number }[];
  topKeywords: { word: string; count: number }[];
  hiddenProblems: {
    serviceLine: string;
    complaintRate: number;
    issues: string[];
  }[];
  equityAccessibility: {
    persona: string;
    accessibilityConcernsCount: number;
    languageBarriersCount: number;
    digitalLiteracyCount: number;
  }[];
  riskMonitoring: {
    hallucinationTrapCommentsCount: number;
    biasRelatedCommentsCount: number;
    casesRequiringHumanReviewCount: number;
  };
  agentOpportunities: {
    name: string;
    purpose: string;
    expectedImpact: string;
  }[];
  executiveRecommendations: {
    priorities: string[];
    quickWins: string[];
    longTermOpportunities: string[];
  };
}

export interface HumanReviewItem {
  id: string;
  rowId: string;
  patientComment: string;
  agentName: string;
  findingType: string;
  severity: string;
  riskDetails: string;
  status: 'Pending' | 'Approved' | 'Escalated' | 'Resolved';
  reviewNotes?: string;
  reviewer?: string;
  timestamp: string;
}

export interface CombinedInsights {
  commonThemes: string[];
  correlatedPatterns: string[];
  conflictingInterpretations: string[];
  highPriorityCases: { rowId: string; comment: string; reason: string }[];
  recommendedFollowUps: string[];
  additionalDataNeeds: string[];
}
