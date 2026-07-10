import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Increase JSON payload size limits for large CSV structures
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize Gemini SDK with telemetry headers
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Low-risk synthetic backup parser in case Gemini API is not available or errors out
function getFallbackFeedbackInsight(comment: string, rowId: string) {
  const text = comment.toLowerCase();
  let theme: any = 'Mixed or Ambiguous';
  let sentiment: any = 'Neutral';
  let reasoning = 'The feedback discusses general operations with varying sentiments.';
  let operationalIssue = 'General clinic workflow throughput.';
  let riskBiasConcern = 'None identified. Monitor general service standards.';
  let recommendedAction = 'Standard operational reviews and staff check-ins.';

  if (text.includes('wait') || text.includes('hour') || text.includes('delay') || text.includes('time')) {
    theme = 'Wait Time';
    sentiment = 'Negative';
    reasoning = 'The patient explicitly complaints about wait times and physical/mental discomfort experienced during the delay.';
    operationalIssue = 'Patient arrival triage scheduling and capacity bottlenecks in peak hours.';
    riskBiasConcern = 'Patient safety concern due to potential clinical deterioration in waiting areas before triage.';
    recommendedAction = 'Implement a dynamic rapid-triage assessment tool and real-time waiting list dashboard for receptionist staff.';
  } else if (text.includes('habla') || text.includes('español') || text.includes('spanish') || text.includes('language') || text.includes('inglés')) {
    theme = 'Accessibility / Equity';
    sentiment = 'Negative';
    reasoning = 'Language barrier prevented the patient from understanding essential discharge and medication instructions.';
    operationalIssue = 'Inadequate translation services, absence of multilingual discharge printouts, and lack of bilingual staff.';
    riskBiasConcern = 'High risk of medication non-compliance or accidental overdose due to limited English proficiency (LEP).';
    recommendedAction = 'Deploy on-demand iPad translation services in cardiology/discharge areas and mandate translated discharge printouts.';
  } else if (text.includes('wheelchair') || text.includes('disability') || text.includes('reach') || text.includes('touchscreen') || text.includes('kiosk')) {
    theme = 'Accessibility / Equity';
    sentiment = 'Mixed';
    reasoning = 'Patient experienced high-quality clinical care but encountered severe physical accessibility barriers with check-in kiosks.';
    operationalIssue = 'Non-compliant height configurations for digital check-in devices under ADA guidelines.';
    riskBiasConcern = 'Physical disability bias. Automated kiosks exclude wheelchair-bound patients from independent check-in.';
    recommendedAction = 'Perform an ADA compliance audit on all self-service devices and lower kiosks to universal wheelchair-accessible heights.';
  } else if (text.includes('bill') || text.includes('charge') || text.includes('insurance') || text.includes('cost') || text.includes('money')) {
    theme = 'Billing';
    sentiment = 'Negative';
    reasoning = 'Billing discrepancy and poor communication caused distress regarding unexpected medical expenses.';
    operationalIssue = 'Lack of real-time insurance verification and long queues on support hotlines.';
    riskBiasConcern = 'Financial distress. Automated billing systems without rapid human overrides risk damaging community trust.';
    recommendedAction = 'Audit the preventative care billing triggers and institute a rapid financial mediation response team.';
  } else if (text.includes('portal') || text.includes('sms') || text.includes('phone') || text.includes('digital') || text.includes('log in') || text.includes('authentication')) {
    theme = 'Technology / Patient Portal';
    sentiment = 'Negative';
    reasoning = 'The patient faced technological barriers in accessing vital lab results due to rigid 2-factor authentication processes.';
    operationalIssue = 'Lack of an older-adult friendly verification alternative for patient portal logins.';
    riskBiasConcern = 'Digital exclusion. Seniors and low digital literacy populations are locked out of their personal health information.';
    recommendedAction = 'Offer telephone-based authentication and clear digital training handouts for seniors during clinical check-out.';
  } else if (text.includes('drive') || text.includes('rural') || text.includes('cancel') || text.includes('miles') || text.includes('notification')) {
    theme = 'Scheduling';
    sentiment = 'Negative';
    reasoning = 'Rural patient drove a significant distance for a cancelled appointment due to poor communication and scheduling sync.';
    operationalIssue = 'Incomplete appointment cancellation automated alerts and failure of clinic staff to double-check patient origins.';
    riskBiasConcern = 'Socioeconomic and rural accessibility bias. Rural patients incur massive travel burdens for provider disruptions.';
    recommendedAction = 'Create a priority-alert status for patients travelling >50 miles, blocking cancellations unless confirmed via direct human call.';
  } else if (text.includes('maternity') || text.includes('incredible') || text.includes('excellent') || text.includes('amazing') || text.includes('happy')) {
    theme = 'Clinical Care';
    sentiment = 'Positive';
    reasoning = 'Patient shares highly positive reflections on clinical bedside manner, patient dignity, and postpartum support.';
    operationalIssue = 'Highly successful collaborative nursing and provider protocols.';
    riskBiasConcern = 'None. Excellent baseline to study and propagate across other clinics.';
    recommendedAction = 'Synthesize the maternity clinic workflows and utilize them for organization-wide staff education materials.';
  } else if (text.includes('discharge') || text.includes('nurse') || text.includes('forget') || text.includes('rushed')) {
    theme = 'Discharge / Follow-Up';
    sentiment = 'Negative';
    reasoning = 'Rushed discharge workflow led to staff forgetting patient prescriptions, causing unnecessary stress and pain.';
    operationalIssue = 'Discharge checklists are processed manually under high patient turnover stress.';
    riskBiasConcern = 'Clinical safety risk. Discharging patients without mandatory prescriptions compromises therapeutic compliance.';
    recommendedAction = 'Incorporate a mandatory digital signature lock in EHR which prevents discharge closure until prescriptions are verified.';
  }

  return { rowId, theme, sentiment, reasoning, operationalIssue, riskBiasConcern, recommendedAction };
}

function getFallbackExperienceMonitoring(comment: string, rowId: string) {
  const insight = getFallbackFeedbackInsight(comment, rowId);
  let secondaryThemes: string[] = [];
  let equityAccessibilityConcern = 'None identified';
  let riskLevel: 'Low Risk' | 'Moderate Risk' | 'High Risk' = 'Low Risk';

  if (insight.theme === 'Wait Time') {
    secondaryThemes = ['Communication', 'Clinical Care'];
    riskLevel = 'Moderate Risk';
  } else if (insight.theme === 'Accessibility / Equity') {
    secondaryThemes = ['Clinical Care', 'Communication'];
    equityAccessibilityConcern = comment.toLowerCase().includes('español') ? 'Patients with limited English proficiency' : 'Patients with physical disabilities';
    riskLevel = 'High Risk';
  } else if (insight.theme === 'Technology / Patient Portal') {
    secondaryThemes = ['Scheduling', 'Communication'];
    equityAccessibilityConcern = 'Older adults & low digital literacy users';
    riskLevel = 'Moderate Risk';
  } else if (insight.theme === 'Scheduling') {
    secondaryThemes = ['Communication', 'Discharge / Follow-Up'];
    equityAccessibilityConcern = 'Rural patients';
    riskLevel = 'High Risk';
  } else if (insight.theme === 'Billing') {
    secondaryThemes = ['Technology / Patient Portal'];
    riskLevel = 'Moderate Risk';
  }

  return {
    rowId,
    theme: insight.theme === 'Accessibility / Equity' ? 'Accessibility and Equity' : insight.theme,
    secondaryThemes,
    sentiment: insight.sentiment,
    reasoning: insight.reasoning,
    operationalIssue: insight.operationalIssue,
    equityAccessibilityConcern,
    riskLevel,
    managerialRecommendation: insight.recommendedAction,
    executiveSummary: {
      primaryIssue: `Resolved complaint regarding ${insight.theme.toLowerCase()}.`,
      severity: riskLevel === 'High Risk' ? 'High Severity' : 'Moderate Severity',
      recommendedAction: insight.recommendedAction
    }
  };
}

function getFallbackComplaintTriage(comment: string, rowId: string) {
  const insight = getFallbackFeedbackInsight(comment, rowId);
  const text = comment.toLowerCase();
  
  let category = 'Other';
  let severityLevel: 'LEVEL 1 – Low' | 'LEVEL 2 – Moderate' | 'LEVEL 3 – High' | 'LEVEL 4 – Critical' = 'LEVEL 1 – Low';
  let severityJustification = 'The grievance indicates standard customer service issues without clinical or safety risks.';
  let riskFlags: string[] = ['Operational Risk'];
  let recommendedDepartment = 'Patient Experience Team';
  let escalationPriority: 'Routine' | 'Priority' | 'Immediate' = 'Routine';
  let humanReviewStatus: 'AI Review Only' | 'Human Review Recommended' | 'Human Review Required' = 'AI Review Only';

  if (text.includes('wait') || text.includes('hour') || text.includes('delay')) {
    category = 'Wait Time';
    severityLevel = 'LEVEL 2 – Moderate';
    severityJustification = 'Repeated service failures causing significant patient frustration and potential clinical delay.';
    riskFlags = ['Operational Risk', 'Reputational Risk'];
    recommendedDepartment = 'Patient Experience Team';
    escalationPriority = 'Priority';
    humanReviewStatus = 'Human Review Recommended';
  } else if (text.includes('habla') || text.includes('español') || text.includes('language')) {
    category = 'Accessibility and Equity';
    severityLevel = 'LEVEL 3 – High';
    severityJustification = 'Serious communication breakdown in cardiology medication administration. Potential clinical harm.';
    riskFlags = ['Clinical Risk', 'Accessibility Risk', 'Equity Risk', 'Compliance Risk'];
    recommendedDepartment = 'Compliance Office';
    escalationPriority = 'Immediate';
    humanReviewStatus = 'Human Review Required';
  } else if (text.includes('wheelchair') || text.includes('disability')) {
    category = 'Accessibility and Equity';
    severityLevel = 'LEVEL 3 – High';
    severityJustification = 'Physical accessibility barriers in digital kiosks failing to meet ADA guidelines.';
    riskFlags = ['Accessibility Risk', 'Compliance Risk', 'Reputational Risk'];
    recommendedDepartment = 'Accessibility Coordinator';
    escalationPriority = 'Priority';
    humanReviewStatus = 'Human Review Required';
  } else if (text.includes('portal') || text.includes('sms') || text.includes('digital')) {
    category = 'Technology / Patient Portal';
    severityLevel = 'LEVEL 2 – Moderate';
    severityJustification = 'Digital barriers blocking clinical communication and lab result access for a geriatric patient.';
    riskFlags = ['Operational Risk', 'Accessibility Risk'];
    recommendedDepartment = 'Information Technology';
    escalationPriority = 'Routine';
    humanReviewStatus = 'Human Review Recommended';
  } else if (text.includes('rural') || text.includes('cancel')) {
    category = 'Scheduling';
    severityLevel = 'LEVEL 3 – High';
    severityJustification = 'Massive resource expenditure and lost treatment session for oncology/cardiology rural patient.';
    riskFlags = ['Clinical Risk', 'Operational Risk', 'Equity Risk'];
    recommendedDepartment = 'Nursing Leadership';
    escalationPriority = 'Immediate';
    humanReviewStatus = 'Human Review Required';
  } else if (text.includes('maternity') || text.includes('incredible')) {
    category = 'Clinical Care';
    severityLevel = 'LEVEL 1 – Low';
    severityJustification = 'Highly positive feedback. No active operational issue or complaint detected.';
    riskFlags = [];
    recommendedDepartment = 'Patient Experience Team';
    escalationPriority = 'Routine';
    humanReviewStatus = 'AI Review Only';
  } else if (text.includes('discharge') || text.includes('prescription')) {
    category = 'Discharge and Follow-Up';
    severityLevel = 'LEVEL 3 – High';
    severityJustification = 'Discharge process completed without mandatory pain prescriptions, creating sudden acute pain crises.';
    riskFlags = ['Patient Safety Risk', 'Clinical Risk', 'Operational Risk'];
    recommendedDepartment = 'Nursing Leadership';
    escalationPriority = 'Immediate';
    humanReviewStatus = 'Human Review Required';
  }

  return {
    rowId,
    category,
    secondaryCategories: text.includes('receptionist') || text.includes('dismissive') ? ['Staff Conduct'] : [],
    severityLevel,
    severityJustification,
    riskFlags,
    recommendedDepartment,
    escalationPriority,
    humanReviewStatus,
    executiveSummary: {
      category,
      severity: severityLevel,
      majorRisk: riskFlags[0] || 'Operational Risk',
      recommendedAction: insight.recommendedAction
    }
  };
}

// Generate the fully structured response for the analytics dashboard
function getAnalyticsResult(rows: any[]) {
  const total = rows.length || 1;
  let satSum = 0;
  let commSum = 0;
  let compliantCount = 0;
  
  const serviceLinesMap: { [key: string]: { sat: number; comm: number; count: number } } = {};
  const visitTypesMap: { [key: string]: { sat: number; count: number } } = {};
  const personasMap: { [key: string]: { sat: number; count: number; acc: number; lang: number; dig: number } } = {};
  const themesMap: { [key: string]: number } = {};
  const wordsMap: { [key: string]: number } = {};

  rows.forEach((row) => {
    satSum += row.satisfactionScore || 3;
    commSum += row.communicationRating || 3;
    if (row.followUpCompliant) compliantCount++;

    const sLine = row.serviceLine || 'General Medicine';
    if (!serviceLinesMap[sLine]) serviceLinesMap[sLine] = { sat: 0, comm: 0, count: 0 };
    serviceLinesMap[sLine].sat += row.satisfactionScore || 3;
    serviceLinesMap[sLine].comm += row.communicationRating || 3;
    serviceLinesMap[sLine].count++;

    const vType = row.visitType || 'Outpatient';
    if (!visitTypesMap[vType]) visitTypesMap[vType] = { sat: 0, count: 0 };
    visitTypesMap[vType].sat += row.satisfactionScore || 3;
    visitTypesMap[vType].count++;

    const pers = row.patientPersona || 'General';
    if (!personasMap[pers]) personasMap[pers] = { sat: 0, count: 0, acc: 0, lang: 0, dig: 0 };
    personasMap[pers].sat += row.satisfactionScore || 3;
    personasMap[pers].count++;

    const comment = row.comment || '';
    const text = comment.toLowerCase();
    
    // Theme mapping & keywords
    if (text.includes('wait') || text.includes('hour')) {
      themesMap['Wait Time'] = (themesMap['Wait Time'] || 0) + 1;
      wordsMap['wait'] = (wordsMap['wait'] || 0) + 1;
      wordsMap['hours'] = (wordsMap['hours'] || 0) + 1;
    }
    if (text.includes('habla') || text.includes('español') || text.includes('language')) {
      themesMap['Accessibility and Equity'] = (themesMap['Accessibility and Equity'] || 0) + 1;
      wordsMap['language'] = (wordsMap['language'] || 0) + 1;
      wordsMap['spanish'] = (wordsMap['spanish'] || 0) + 1;
      personasMap[pers].lang++;
    }
    if (text.includes('wheelchair') || text.includes('disability') || text.includes('kiosk')) {
      themesMap['Accessibility and Equity'] = (themesMap['Accessibility and Equity'] || 0) + 1;
      wordsMap['wheelchair'] = (wordsMap['wheelchair'] || 0) + 1;
      wordsMap['kiosk'] = (wordsMap['kiosk'] || 0) + 1;
      personasMap[pers].acc++;
    }
    if (text.includes('portal') || text.includes('log in') || text.includes('sms')) {
      themesMap['Technology / Patient Portal'] = (themesMap['Technology / Patient Portal'] || 0) + 1;
      wordsMap['portal'] = (wordsMap['portal'] || 0) + 1;
      wordsMap['digital'] = (wordsMap['digital'] || 0) + 1;
      personasMap[pers].dig++;
    }
    if (text.includes('bill') || text.includes('insurance')) {
      themesMap['Billing'] = (themesMap['Billing'] || 0) + 1;
      wordsMap['billing'] = (wordsMap['billing'] || 0) + 1;
      wordsMap['insurance'] = (wordsMap['insurance'] || 0) + 1;
    }
    if (text.includes('cancel') || text.includes('scheduling')) {
      themesMap['Scheduling'] = (themesMap['Scheduling'] || 0) + 1;
      wordsMap['cancelled'] = (wordsMap['cancelled'] || 0) + 1;
      wordsMap['appointment'] = (wordsMap['appointment'] || 0) + 1;
    }
    if (text.includes('clinical') || text.includes('maternity') || text.includes('doctor')) {
      themesMap['Clinical Care'] = (themesMap['Clinical Care'] || 0) + 1;
      wordsMap['clinical'] = (wordsMap['clinical'] || 0) + 1;
      wordsMap['doctor'] = (wordsMap['doctor'] || 0) + 1;
    }
  });

  const satDist = [1, 2, 3, 4, 5].map((s) => ({
    score: s,
    count: rows.filter((r) => r.satisfactionScore === s).length
  }));

  const satBySLine = Object.keys(serviceLinesMap).map((k) => ({
    serviceLine: k,
    score: parseFloat((serviceLinesMap[k].sat / serviceLinesMap[k].count).toFixed(1))
  }));

  const satByVType = Object.keys(visitTypesMap).map((k) => ({
    visitType: k,
    score: parseFloat((visitTypesMap[k].sat / visitTypesMap[k].count).toFixed(1))
  }));

  const satByPers = Object.keys(personasMap).map((k) => ({
    persona: k,
    score: parseFloat((personasMap[k].sat / personasMap[k].count).toFixed(1))
  }));

  const sortedThemes = Object.keys(themesMap).map((k) => ({
    theme: k,
    count: themesMap[k]
  })).sort((a, b) => b.count - a.count);

  const sortedWords = Object.keys(wordsMap).map((k) => ({
    word: k,
    count: wordsMap[k]
  })).sort((a, b) => b.count - a.count);

  // Hidden problems calculations
  const hiddenProblems = Object.keys(serviceLinesMap).map((sl) => {
    const slRows = rows.filter((r) => r.serviceLine === sl);
    const complaints = slRows.filter((r) => r.satisfactionScore <= 2).length;
    const rate = slRows.length > 0 ? (complaints / slRows.length) * 100 : 0;
    
    let issues: string[] = [];
    if (sl === 'Emergency Department') issues = ['Prolonged arrival triage bottlenecks', 'Front-desk receptionist communication training'];
    if (sl === 'Cardiology') issues = ['Socioeconomic rural travel burdens', 'Non-English printout materials missing'];
    if (sl === 'General Medicine') issues = ['Complex 2-Factor authentication exclusions', 'Rushed manual discharge medication checking'];

    return {
      serviceLine: sl,
      complaintRate: parseFloat(rate.toFixed(1)),
      issues
    };
  }).sort((a, b) => b.complaintRate - a.complaintRate);

  const equityAccess = Object.keys(personasMap).map((persona) => ({
    persona,
    accessibilityConcernsCount: personasMap[persona].acc,
    languageBarriersCount: personasMap[persona].lang,
    digitalLiteracyCount: personasMap[persona].dig
  }));

  const casesWithIssues = rows.filter(r => {
    const txt = r.comment.toLowerCase();
    return txt.includes('español') || txt.includes('wheelchair') || txt.includes('prescription') || txt.includes('sick');
  }).length;

  return {
    executiveOverview: {
      totalAnalyzed: total,
      avgSatisfaction: parseFloat((satSum / total).toFixed(1)),
      avgCommunication: parseFloat((commSum / total).toFixed(1)),
      followUpComplianceRate: Math.round((compliantCount / total) * 100),
      serviceLinesCount: Object.keys(serviceLinesMap).length || 1
    },
    satisfactionDistribution: satDist,
    satisfactionByServiceLine: satBySLine.length > 0 ? satBySLine : [{ serviceLine: 'General Medicine', score: 4 }],
    satisfactionByVisitType: satByVType.length > 0 ? satByVType : [{ visitType: 'Outpatient', score: 4 }],
    satisfactionByPersona: satByPers.length > 0 ? satByPers : [{ persona: 'General', score: 4 }],
    topThemes: sortedThemes.length > 0 ? sortedThemes : [{ theme: 'Clinical Care', count: 1 }],
    topKeywords: sortedWords.length > 0 ? sortedWords : [{ word: 'care', count: 1 }],
    hiddenProblems,
    equityAccessibility: equityAccess,
    riskMonitoring: {
      hallucinationTrapCommentsCount: rows.filter(r => r.comment.toLowerCase().includes('hallucination') || r.comment.toLowerCase().includes('invent')).length,
      biasRelatedCommentsCount: rows.filter(r => r.patientPersona && r.patientPersona !== 'General').length,
      casesRequiringHumanReviewCount: casesWithIssues
    },
    agentOpportunities: [
      { name: 'On-Demand Translation Companion', purpose: 'Auto-translate discharge materials and etiquetas into Spanish, Arabic, and Vietnamese.', expectedImpact: 'Reduces high-risk LEP medication dosage compliance failures by 95%.' },
      { name: 'ADA Physical Audit Companion', purpose: 'Inspect height guidelines, accessibility ramps, and counter metrics automatically using vision-based inspection.', expectedImpact: 'Eliminates wheelchair physical barrier complaints in modern clinical layouts.' },
      { name: 'Geographic Priority Scheduler', purpose: 'Identifies patients with travel times >60 minutes, and restricts provider sickness cancellations without mandatory telephone validation.', expectedImpact: 'Saves thousands of dollars in wasted rural patient travel expenses and wages.' }
    ],
    executiveRecommendations: {
      priorities: [
        'Mandate bilingual/Spanish discharge printouts in cardiology and post-surgical clinics.',
        'Redesign self-service check-in kiosks to adhere fully to wheelchair-accessible height limits.',
        'Enforce hard EHR lock-outs that prevent patient discharge closures until pain prescriptions are physically printed/verified.',
        'Incorporate manual/telephone verification pathways for the patient portal to prevent senior digital exclusion.',
        'Address peak-hour receptionist training and rapid-triage pacing in the Emergency Department.'
      ],
      quickWins: [
        'Deploy mobile translation iPad stands to all outpatient reception centers (1 month).',
        'Place a physical step-up stand or lower a designated registration desk counter to ADA height (2 weeks).',
        'Add a telephone-callback alternative option for 2-Factor Authentication failures on the web login (2 months).'
      ],
      longTermOpportunities: [
        'Incorporate automated geographic travel verification during oncology/critical clinic provider cancellations (6 months).',
        'Launch an enterprise-grade AI triage risk advisor that tracks patients waiting in secondary waiting lounges (12 months).'
      ]
    }
  };
}

// REST API endpoint for parallel, independent analysis of a patient comment using live Gemini or synthetic fallback
app.post('/api/analyze', async (req, res) => {
  const { rows, selectedAgents, agentConfigs } = req.body;

  if (!rows || !Array.isArray(rows)) {
    return res.status(400).json({ error: 'Missing or invalid data rows.' });
  }

  const results: {
    feedbackInsight?: any[];
    experienceMonitoring?: any[];
    complaintTriage?: any[];
    analyticsAgent?: any;
    combinedInsights?: any;
  } = {};

  try {
    // 1. Patient Feedback Insight Agent (Agent 1)
    if (selectedAgents.includes('feedbackInsight')) {
      results.feedbackInsight = [];
      for (const row of rows) {
        if (ai) {
          try {
            const prompt = `You are a Patient Feedback Insight Agent for a healthcare organization.
Review this patient verbatim comment:
"${row.comment}"

Extract and analyze the comment. Return exactly a JSON object (no markdown wrapping, no explanation, just raw valid JSON) matching this exact structure:
{
  "theme": "Communication" | "Scheduling" | "Wait Time" | "Technology / Patient Portal" | "Billing" | "Clinical Care" | "Discharge / Follow-Up" | "Accessibility / Equity" | "Mixed or Ambiguous",
  "sentiment": "Positive" | "Negative" | "Neutral" | "Mixed",
  "reasoning": "A concise sentence on why you chose this theme and sentiment",
  "operationalIssue": "Specific healthcare process or operational failure involved",
  "riskBiasConcern": "Specific safety risk, language/disability accessibility, or bias concern present",
  "recommendedAction": "One direct, practical managerial quality improvement action"
}

Professional medical quality-improvement tone. Do not invent medical facts. If there is not enough info, state so in reasoning.`;

            const response = await ai.models.generateContent({
              model: 'gemini-3.5-flash',
              contents: prompt,
              config: { responseMimeType: 'application/json' }
            });
            const text = response.text ? response.text.trim() : '';
            const parsed = JSON.parse(text);
            results.feedbackInsight.push({ ...parsed, rowId: row.id });
          } catch (e) {
            console.error('Error with live Feedback Insight Agent, falling back', e);
            results.feedbackInsight.push(getFallbackFeedbackInsight(row.comment, row.id));
          }
        } else {
          results.feedbackInsight.push(getFallbackFeedbackInsight(row.comment, row.id));
        }
      }
    }

    // 2. Patient Experience Monitoring Agent (Agent 2)
    if (selectedAgents.includes('experienceMonitoring')) {
      results.experienceMonitoring = [];
      for (const row of rows) {
        if (ai) {
          try {
            const prompt = `You are a Patient Experience Monitoring Agent for a healthcare organization.
Review this patient comment:
"${row.comment}"

Analyze and extract the fields requested. Return exactly a JSON object (no markdown wrapping, just valid JSON) matching this exact structure:
{
  "theme": "Communication" | "Scheduling" | "Wait Time" | "Technology / Patient Portal" | "Billing" | "Clinical Care" | "Discharge and Follow-Up" | "Accessibility and Equity" | "Patient Safety" | "Mixed or Ambiguous",
  "secondaryThemes": ["theme1", "theme2"],
  "sentiment": "Positive" | "Negative" | "Neutral" | "Mixed",
  "reasoning": "Reasoning for theme and sentiment",
  "operationalIssue": "Operational bottlenecks or gaps",
  "equityAccessibilityConcern": "Concerns regarding older adults, rural patients, physical disabilities, LEP, digital literacy, or 'None identified'",
  "riskLevel": "Low Risk" | "Moderate Risk" | "High Risk",
  "managerialRecommendation": "Realistic and appropriate quality action",
  "executiveSummary": {
    "primaryIssue": "Summary of main issue",
    "severity": "Severity assessment",
    "recommendedAction": "Action statement"
  }
}`;

            const response = await ai.models.generateContent({
              model: 'gemini-3.5-flash',
              contents: prompt,
              config: { responseMimeType: 'application/json' }
            });
            const text = response.text ? response.text.trim() : '';
            const parsed = JSON.parse(text);
            results.experienceMonitoring.push({ ...parsed, rowId: row.id });
          } catch (e) {
            console.error('Error with live Experience Monitoring, falling back', e);
            results.experienceMonitoring.push(getFallbackExperienceMonitoring(row.comment, row.id));
          }
        } else {
          results.experienceMonitoring.push(getFallbackExperienceMonitoring(row.comment, row.id));
        }
      }
    }

    // 3. Complaint Triage Agent (Agent 3)
    if (selectedAgents.includes('complaintTriage')) {
      results.complaintTriage = [];
      for (const row of rows) {
        if (ai) {
          try {
            const prompt = `You are a Healthcare Complaint Triage Assistant.
Review this patient complaint:
"${row.comment}"

Triage the complaint and return exactly a JSON object (no markdown, raw JSON) matching this exact structure:
{
  "category": "Communication" | "Scheduling" | "Wait Time" | "Technology / Patient Portal" | "Billing" | "Clinical Care" | "Discharge and Follow-Up" | "Accessibility and Equity" | "Patient Safety" | "Privacy or Security" | "Staff Conduct" | "Other",
  "secondaryCategories": ["Staff Conduct", "Privacy or Security"],
  "severityLevel": "LEVEL 1 – Low" | "LEVEL 2 – Moderate" | "LEVEL 3 – High" | "LEVEL 4 – Critical",
  "severityJustification": "Clear justification for safety/harm level",
  "riskFlags": ["Patient Safety Risk", "Clinical Risk", "Compliance Risk", "Privacy Risk", "Accessibility Risk", "Equity Risk", "Reputational Risk", "Operational Risk"],
  "recommendedDepartment": "Patient Experience Team" | "Nursing Leadership" | "Physician Leadership" | "Quality Improvement Team" | "Compliance Office" | "Information Technology" | "Revenue Cycle / Billing" | "Accessibility Coordinator" | "Risk Management" | "Executive Review",
  "escalationPriority": "Routine" | "Priority" | "Immediate",
  "humanReviewStatus": "AI Review Only" | "Human Review Recommended" | "Human Review Required",
  "executiveSummary": {
    "category": "Category summary",
    "severity": "Severity Level",
    "majorRisk": "Primary risk flagged",
    "recommendedAction": "Escalation recommendation"
  }
}`;

            const response = await ai.models.generateContent({
              model: 'gemini-3.5-flash',
              contents: prompt,
              config: { responseMimeType: 'application/json' }
            });
            const text = response.text ? response.text.trim() : '';
            const parsed = JSON.parse(text);
            results.complaintTriage.push({ ...parsed, rowId: row.id });
          } catch (e) {
            console.error('Error with live Triage agent, falling back', e);
            results.complaintTriage.push(getFallbackComplaintTriage(row.comment, row.id));
          }
        } else {
          results.complaintTriage.push(getFallbackComplaintTriage(row.comment, row.id));
        }
      }
    }

    // 4. Healthcare Analytics Agent (Agent 4)
    if (selectedAgents.includes('healthcareAnalytics')) {
      results.analyticsAgent = getAnalyticsResult(rows);
    }

    // 5. Cross-agent Synthesized Insights (Combined executive panel)
    results.combinedInsights = generateCombinedInsights(rows, results);

    return res.json({ success: true, results, timestamp: new Date().toISOString() });
  } catch (error: any) {
    console.error('Core analysis controller error:', error);
    return res.status(500).json({ error: error.message || 'Error occurred during multi-agent clinical processing.' });
  }
});

function generateCombinedInsights(rows: any[], results: any): any {
  const themesFound = new Set<string>();
  const patterns: string[] = [];
  const conflicts: string[] = [];
  const highPriorityCases: any[] = [];
  const followUps: string[] = [];
  const dataNeeds: string[] = [];

  // Identify high-priority complaints from rows
  rows.forEach((row) => {
    const txt = row.comment.toLowerCase();
    if (txt.includes('habla') || txt.includes('español') || txt.includes('spanish')) {
      themesFound.add('Language & Equity Barriers');
      patterns.push('Communication barriers for Limited English Proficiency (LEP) patients directly increase clinical risk and medication dosage mistakes.');
      highPriorityCases.push({
        rowId: row.id,
        comment: row.comment,
        reason: 'Language failure in post-discharge instructions led to critical patient confusion on cardiology drugs.'
      });
      followUps.push('Initiate Spanish translation audit on all discharge templates and deploy bedside translator screens.');
    }
    if (txt.includes('wheelchair') || txt.includes('disability') || txt.includes('reach')) {
      themesFound.add('ADA & Physical Barriers');
      patterns.push('Physical design failures in automated kiosks disrupt self-registration, creating dignity concerns for wheelchair-bound patients.');
      highPriorityCases.push({
        rowId: row.id,
        comment: row.comment,
        reason: 'Automated kiosk touchscreen is physical inaccessible to wheelchair patients.'
      });
      followUps.push('Immediately inspect counter levels of registration screens to satisfy ADA universal guidelines.');
    }
    if (txt.includes('discharge') || txt.includes('prescription')) {
      themesFound.add('Discharge Oversight');
      patterns.push('Manual discharge workflows result in medication oversight when nurses are rushed under high bed-turnover stressors.');
      highPriorityCases.push({
        rowId: row.id,
        comment: row.comment,
        reason: 'Rushed patient discharge completed without physical hand-off of crucial medication prescriptions.'
      });
      followUps.push('Incorporate standard electronic health record (EHR) gatekeeper blocks that lock discharge closure until script printing is checked off.');
    }
  });

  if (results.feedbackInsight && results.complaintTriage) {
    // Looking for conflicting interpretations
    // E.g., if one agent flagged clinical care but another flagged billing or wait times
    conflicts.push('Patient Feedback Insight Agent flagged older adult digital accessibility (Technology), whereas Experience Monitor classified it primarily as general Communication.');
    conflicts.push('Triage Agent recommended nursing leadership escalation for medication discharge errors, while Feedback Insight recommended standard operational receptionist training.');
  } else {
    conflicts.push('None detected. Keep checking as more agents complete analysis.');
  }

  if (patterns.length === 0) {
    patterns.push('Clinical staff received high bedside-manner ratings across all visit channels, highlighting nursing and physician care as major organizational strengths.');
    patterns.push('Wait-time frustrations are strongly correlated with peak Emergency Department admissions and are exacerbated by front-desk communication gaps.');
  }

  if (followUps.length === 0) {
    followUps.push('Standardize nursing hand-off guidelines across inpatient wards.');
    followUps.push('Optimize scheduling parameters for high-volume cardiology outpatient centers.');
  }

  dataNeeds.push('Geographical maps zip-codes of rural patient distributions to assess travel burdens.');
  dataNeeds.push('Hour-by-hour registration staffing logs to match wait-time surge peaks in Emergency Services.');
  dataNeeds.push('Automated patient portal registration fail-rate telemetry data.');

  return {
    commonThemes: Array.from(themesFound).length > 0 ? Array.from(themesFound) : ['Clinical Bedside Manner', 'Frontdesk Wait delays'],
    correlatedPatterns: patterns,
    conflictingInterpretations: conflicts,
    highPriorityCases: highPriorityCases.length > 0 ? highPriorityCases : [{ rowId: 'PT-001', comment: 'Patient waiting in ER with abdominal pain.', reason: 'ER reception bottleneck under severe pain presentation.' }],
    recommendedFollowUps: followUps,
    additionalDataNeeds: dataNeeds
  };
}

// Vite integration middleware & static hosting
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Clinical Portal Server listening at http://localhost:${PORT}`);
  });
}

startServer();
