import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Play,
  Settings,
  HelpCircle,
  Bell,
  HeartPulse,
  Brain,
  Shield,
  Activity,
  Plus,
  LayoutDashboard,
  Database,
  Users,
  TrendingUp,
  FileCheck,
  ShieldAlert,
  Terminal,
  ActivitySquare
} from 'lucide-react';

import { PatientFeedbackRow, FeedbackInsightResult, ExperienceMonitoringResult, ComplaintTriageResult, AnalyticsAgentResult, CombinedInsights } from './types';
import { SAMPLE_PATIENT_FEEDBACK } from './data';
import { AgentRoom } from './components/AgentRoom';
import { DataValidation } from './components/DataValidation';
import { AgentConfig } from './components/AgentConfig';
import { LiveProcessing } from './components/LiveProcessing';
import { ResultsDashboard } from './components/ResultsDashboard';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';

interface AgentState {
  id: string;
  name: string;
  role: string;
  description: string;
  avatar: string;
  status: 'Idle' | 'Selected' | 'Processing' | 'Completed' | 'Error';
  progress: number;
  currentStep: string;
}

export default function App() {
  // Global states
  const [currentScreen, setCurrentScreen] = useState<'dashboard' | 'datasets' | 'ai-agents' | 'analytics' | 'executive'>('dashboard');
  const [feedbackRows, setFeedbackRows] = useState<PatientFeedbackRow[]>([]);
  const [loadedFileName, setLoadedFileName] = useState<string | null>(null);
  
  // Agent States
  const [agents, setAgents] = useState<AgentState[]>([
    {
      id: 'feedbackInsight',
      name: 'Patient Feedback Insight Agent',
      role: 'Sentiment & Theme Specialist',
      description: 'Deep sentiment analysis, granular theme extraction, and risk auditing on patient survey verbatims.',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB3mx6MKNnaJOMFi6Y2Ih1_kWGEQ9T55ygd2i3jraL_HUwAqVlJ2Ufzwv0SZ-XnSE2R_-5s8HL5hbqXjK0qEE8VElmnVgAMfmStmIuTgYSejNT2cEDp6Zu5aamlBFd3zf9-rn9y1F3bvJlayH2h6BSiIRFHRoaJ7eN2b80Cz6g0DTUIWRtR-r3Fb5G7EqUDspS6o0JN6gvdHbiN6mEddo24c44u5cb5uZW8JSUMQcDghD4Fizt78r7l9FC6DLEOpFZdtaIVTS7I7oEG',
      status: 'Idle',
      progress: 0,
      currentStep: 'Idle'
    },
    {
      id: 'experienceMonitoring',
      name: 'Patient Experience Monitoring Agent',
      role: 'HCAHPS Audit Analyst',
      description: 'Real-time trending of NPS, CSAT, equity parameters, and multi-issue classifications across service lines.',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzKARvAagWOqeqv8BNW5_8bI14tQ_YLUe-ej0EaX6PQkCV2ULqhdV6sj6-UedsqOSTzAWEOcwcD_FHSmZo-2CX-EIJRw5rppaubxSKB1NtER-8oIoKFme_6_OoNtqmpXLUTE4NYfY3HSqi85uafIEfkiL9rIeVK9NPdsawpT8gLggQlSKazUnYrFaDa5P2yMkyKDgve4dQsVQl8IFKGqCkNaWzkdLGeVNwRBm7C2bypBDn30Nfue9LTmHnqB4EGhv2NArZzbAYXVBq',
      status: 'Idle',
      progress: 0,
      currentStep: 'Idle'
    },
    {
      id: 'complaintTriage',
      name: 'Complaint Triage Agent',
      role: 'Clinical Triage Specialist',
      description: 'Automated severity scoring (Levels 1–4), risk detection, routing, and escalation protocol matching.',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDwTv9jvjZFAr-2BVY5-0q_ffboP6rRxRkAjF2mxVUuiCkWKLszci55hvUbHUz0j2EgUnxV3t3xPXuMdswsrML-2oV_laAEvXEYrTseNmmXarFwZjnJ90POSvTZ5MdkcY3Uli2EPuT7-5TJRFqrmCt5CA02rvNgZbADQNqeeC-pQKrcUxu9UGoLyZs7fm0ncXo_2_i_TFquKE61uhiGteqAhGBqstMM6aWTsqZ9usu8WXNzLjO8RDX2hXO7e8cF68FCzzKh8QZxMjs',
      status: 'Idle',
      progress: 0,
      currentStep: 'Idle'
    },
    {
      id: 'healthcareAnalytics',
      name: 'Healthcare Analytics Agent',
      role: 'Executive Dashboard Synthesizer',
      description: 'Advanced statistical modeling, Recharts visual distributions, and clinic roadmap planning.',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTrfUmZpyQs4PMYHeXQPxmfi5qqhhxIwbW0VHtxx4sZdZJD28kuhYK-vlAKkCCG1FLxo4KBlcsLiSV6wXlEBxcOXDuk3g3w9oxmbbff353VVkUPOXhK4cJ2PZrmgtl58eGf4XZXtEeSZTbDRlJEIXCQq_UtLfSFlOVeY4cJyMJUZMd3Y_ooKjs5g9urR3LX8N_P6aS7b_DvdTIA5z5zwJN-Pdjyg_50jC-44ZIKzJGJRViCamN93v7VWTdzBSNGdBqMvBIfHiCZ6Ck',
      status: 'Idle',
      progress: 0,
      currentStep: 'Idle'
    }
  ]);

  // Selected agent IDs for running
  const [selectedAgents, setSelectedAgents] = useState<string[]>(['feedbackInsight', 'experienceMonitoring', 'healthcareAnalytics']);

  // Results Repository
  const [insightResults, setInsightResults] = useState<FeedbackInsightResult[] | null>(null);
  const [monitoringResults, setMonitoringResults] = useState<ExperienceMonitoringResult[] | null>(null);
  const [triageResults, setTriageResults] = useState<ComplaintTriageResult[] | null>(null);
  const [analyticsResult, setAnalyticsResult] = useState<AnalyticsAgentResult[] | null>(null);
  const [combinedInsights, setCombinedInsights] = useState<CombinedInsights | null>(null);

  const [pipelineStatus, setPipelineStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [isProcessingBackend, setIsProcessingBackend] = useState(false);

  // Load sample clinical feedback immediately on mount so the portal is fully populated
  useEffect(() => {
    setFeedbackRows(SAMPLE_PATIENT_FEEDBACK);
    setLoadedFileName('Patient_Experience_Q3_Clinical_Sample.csv');
  }, []);

  const handleDataLoaded = (data: PatientFeedbackRow[], fileName: string) => {
    setFeedbackRows(data);
    setLoadedFileName(fileName);
    // Move to Preview tab immediately for convenience
    setCurrentScreen('datasets');
  };

  const handleAgentSelectToggle = (id: string) => {
    if (selectedAgents.includes(id)) {
      setSelectedAgents(prev => prev.filter(a => a !== id));
      setAgents(prev => prev.map(a => a.id === id ? { ...a, status: 'Idle', progress: 0 } : a));
    } else {
      setSelectedAgents(prev => [...prev, id]);
      setAgents(prev => prev.map(a => a.id === id ? { ...a, status: 'Selected' } : a));
    }
  };

  // Processing Simulator Steps
  const stepMessages: Record<string, string[]> = {
    feedbackInsight: [
      'Step 1: Classification (Matching Primary Themes)',
      'Step 2: Sentiment analysis (Detecting bedside verbatims)',
      'Step 3: Root reasoning deduction',
      'Step 4: Operational process bottleneck audits',
      'Step 5: High-risk safety concern mapping',
      'Step 6: Formulating managerial recommendations'
    ],
    experienceMonitoring: [
      'Step 1: HCAHPS metric indexing',
      'Step 2: Scanning secondary clinical categories',
      'Step 3: Calculating patient experience NPS delta',
      'Step 4: Reviewing socioeconomic equity criteria',
      'Step 5: Operational roadblock cataloguing',
      'Step 6: Experience compliance grading',
      'Step 7: Compiling executive experience summary'
    ],
    complaintTriage: [
      'Step 1: Category sorting and triage',
      'Step 2: Assigning Severity levels (Levels 1–4)',
      'Step 3: Clinical safety risk assessments',
      'Step 4: Escalation priority routing matching',
      'Step 5: Evaluating human verification requirements',
      'Step 6: Structuring triage routing ticket'
    ],
    healthcareAnalytics: [
      'Step 1: Reading clinical survey records',
      'Step 2: Aggregating satisfaction star scores',
      'Step 3: Computing HCAHPS communication baselines',
      'Step 4: Evaluating care compliance differentials',
      'Step 5: Plotting department radar metrics',
      'Step 6: Finding high-incidence complaint pockets',
      'Step 7: Generating AI system roadmap items',
      'Step 8: Constructing leadership recommendation matrices',
      'Step 9: Aligning HIPAA compliance audits'
    ]
  };

  const triggerParallelInferences = async (configs: Record<string, any>) => {
    if (feedbackRows.length === 0) return;

    // Transition to Processing state
    setPipelineStatus('processing');
    setCurrentScreen('analytics'); // Go to live results/analytics tab
    setIsProcessingBackend(true);

    // Set all selected agents to Processing
    setAgents(prev => prev.map(a => {
      if (selectedAgents.includes(a.id)) {
        return {
          ...a,
          status: 'Processing',
          progress: 5,
          currentStep: stepMessages[a.id]?.[0] || 'Analyzing verbatims...'
        };
      }
      return a;
    }));

    // Trigger REAL backend Express analysis API call in parallel
    const apiPromise = fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rows: feedbackRows,
        selectedAgents,
        agentConfigs: configs
      })
    })
      .then(res => {
        if (!res.ok) throw new Error('Clinical analysis request failed.');
        return res.json();
      })
      .then(data => {
        if (data.success && data.results) {
          const results = data.results;
          if (results.feedbackInsight) setInsightResults(results.feedbackInsight);
          if (results.experienceMonitoring) setMonitoringResults(results.experienceMonitoring);
          if (results.complaintTriage) setTriageResults(results.complaintTriage);
          if (results.analyticsAgent) setAnalyticsResult(results.analyticsAgent);
          if (results.combinedInsights) setCombinedInsights(results.combinedInsights);
        }
        return true;
      })
      .catch(err => {
        console.error('Express clinical analyzer caught error:', err);
        return false;
      });

    // Run front-end simulated increments to show rich step transitions in real time
    const interval = setInterval(() => {
      setAgents(prev => {
        let allDone = true;
        const next = prev.map(a => {
          if (a.status !== 'Processing') return a;
          allDone = false;

          const steps = stepMessages[a.id] || [];
          const currentStageIdx = Math.floor((a.progress / 100) * steps.length);
          const nextProgress = Math.min(95, a.progress + (Math.random() * 8 + 3));
          const stepMsg = steps[Math.min(steps.length - 1, currentStageIdx)] || 'Synthesizing report...';

          return {
            ...a,
            progress: nextProgress,
            currentStep: stepMsg
          };
        });

        if (allDone) clearInterval(interval);
        return next;
      });
    }, 450);

    // Wait for the real API to complete
    const apiSuccess = await apiPromise;

    clearInterval(interval);
    setIsProcessingBackend(false);

    // Wrap up: Complete progress to 100% and set to Completed
    setAgents(prev => prev.map(a => {
      if (selectedAgents.includes(a.id)) {
        return {
          ...a,
          status: 'Completed',
          progress: 100,
          currentStep: 'Inference completed. Clinical verbiage catalogued.'
        };
      }
      return a;
    }));

    setPipelineStatus(apiSuccess ? 'completed' : 'error');
  };

  const handleCancelAgent = (id: string) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, status: 'Idle', progress: 0, currentStep: 'Cancelled by director' } : a));
    setSelectedAgents(prev => prev.filter(a => a !== id));
  };

  const handleRerunAgent = (id: string) => {
    if (!selectedAgents.includes(id)) {
      setSelectedAgents(prev => [...prev, id]);
    }
    triggerParallelInferences({
      feedbackInsight: { riskTolerance: 'Standard', themeFocus: 'General' },
      experienceMonitoring: { alertThreshold: 'Moderate Risk', sentimentBias: 'Neutral' },
      complaintTriage: { autoRoute: true, minimumHumanSeverity: 'LEVEL 3' },
      healthcareAnalytics: { aggregationPeriod: 'Quarterly', detailedNLP: true }
    });
  };

  return (
    <div className="min-h-screen pb-24 flex flex-col font-sans bg-slate-50 text-slate-800" id="main-application-frame">
      
      {/* Top Header Section */}
      <header className="fixed top-0 w-full z-50 bg-white border-b border-slate-200 shadow-sm flex justify-between items-center px-6 lg:px-8 py-3">
        <div className="flex items-center gap-3">
          <img
            alt="Logo"
            className="h-10 w-auto object-contain"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXdJ9_HwwxLQaZuMJHrz6nXBdkoRPgJLuUIDZhW-8fagk-4OEVBA3SjpC9fWEpjTh-wcyN9v9coVqQDmFE9PPWc6txIZvMFhVMGEWTOSX1FGAiPTDkMcSyex95QVpFree8LKp9ybjkzorU_Gc5evTcqEL3v0zarshKyFzJJ06c0lZnHRnmbSGAa2Q2EN4ep2e0CIm79c5tNdOfeQMAnG_ugK_tLWpRaZisDpyZMJiIxc8rZ9SDvd4OziavIcQdC1E6JB543PzwJTi2"
          />
          <div>
            <h1 className="text-primary font-bold text-lg leading-tight tracking-tight">Healthcare AI Agent Portal</h1>
            <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">Collaborative AI Workspace for Patient Experience Intelligence</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <nav className="flex gap-5 h-full items-center">
            <button
              onClick={() => setCurrentScreen('dashboard')}
              className={`py-2 text-sm font-semibold transition-all border-b-2 ${
                currentScreen === 'dashboard' ? 'text-primary border-primary' : 'text-slate-500 border-transparent hover:text-primary'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentScreen('datasets')}
              className={`py-2 text-sm font-semibold transition-all border-b-2 ${
                currentScreen === 'datasets' ? 'text-primary border-primary' : 'text-slate-500 border-transparent hover:text-primary'
              }`}
            >
              Datasets
            </button>
            <button
              onClick={() => setCurrentScreen('ai-agents')}
              className={`py-2 text-sm font-semibold transition-all border-b-2 ${
                currentScreen === 'ai-agents' ? 'text-primary border-primary' : 'text-slate-500 border-transparent hover:text-primary'
              }`}
            >
              AI Agents
            </button>
            <button
              onClick={() => setCurrentScreen('executive')}
              className={`py-2 text-sm font-semibold transition-all border-b-2 ${
                currentScreen === 'executive' ? 'text-primary border-primary' : 'text-slate-500 border-transparent hover:text-primary'
              }`}
            >
              Executive Insights
            </button>
          </nav>

          <div className="flex items-center gap-3 ml-6 border-l border-slate-200 pl-6">
            <button className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 relative transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
            </button>
            <button className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
              <HelpCircle className="w-5 h-5" />
            </button>
            <button className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            
            <div className="ml-2 flex items-center gap-2 border border-slate-100 p-1 pr-3 rounded-full bg-slate-50 shadow-sm shrink-0">
              <img
                className="w-8 h-8 rounded-full border border-primary/20 object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhwN_O4epDBTi3E_7_iQeafuDcr7Dk2b2iXZeuclg8dyaiqc4mt8CMCsrI2BXTtJJiw7en5UDLB1vUWK8fiEebxdvwR8Z8UJsfVhW0Whova1a60BARPeBsv24TSAewndPm8wVHvfKkGFO1DOuUa8qJs5-Jo9LZExKgE4vNN1FX2tFUhpa5WnSG_ZTgxjsrT2xnNx2NgTo-wPEzuia1g0Ioo9WDU9oyr-yZnrohsym_JIBLVCU61MwTeVVaZKO9jc6cyV0Xstp3vw95"
                alt="Chief Medical Officer"
                referrerPolicy="no-referrer"
              />
              <div className="text-left hidden lg:block">
                <p className="font-extrabold text-slate-800 text-[11px] leading-tight">Chief Medical Officer</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Clinical Director</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 h-full w-[260px] z-40 bg-white border-r border-slate-200 flex flex-col p-6 hidden lg:flex pt-28 shadow-sm">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6 bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white shrink-0">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-800 text-sm leading-tight">Health Systems</h2>
              <p className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">Enterprise Tier</p>
            </div>
          </div>
          
          <button
            onClick={() => {
              setFeedbackRows([]);
              setLoadedFileName(null);
              setInsightResults(null);
              setMonitoringResults(null);
              setTriageResults(null);
              setAnalyticsResult(null);
              setCombinedInsights(null);
              setPipelineStatus('idle');
              setCurrentScreen('datasets');
            }}
            className="w-full bg-primary text-white py-3 rounded-xl flex items-center justify-center gap-2 shadow-md hover:bg-primary/95 hover:shadow-lg transition-all scale-100 active:scale-95 text-xs font-bold"
          >
            <Plus className="w-4 h-4" />
            Reset & New Analysis
          </button>
        </div>

        <nav className="flex-grow space-y-1.5 text-xs">
          <button
            onClick={() => setCurrentScreen('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-bold transition-all ${
              currentScreen === 'dashboard' ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            Virtual Office Rooms
          </button>
          
          <button
            onClick={() => setCurrentScreen('datasets')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-bold transition-all ${
              currentScreen === 'datasets' ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <Database className="w-4 h-4 shrink-0" />
            Dataset Inventory
          </button>
          
          <button
            onClick={() => setCurrentScreen('ai-agents')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-bold transition-all ${
              currentScreen === 'ai-agents' ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            AI Agents Config
          </button>
          
          <button
            onClick={() => setCurrentScreen('analytics')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-bold transition-all ${
              currentScreen === 'analytics' ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <TrendingUp className="w-4 h-4 shrink-0" />
            Active Pipelines
          </button>
          
          <button
            onClick={() => setCurrentScreen('executive')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-bold transition-all ${
              currentScreen === 'executive' ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <FileCheck className="w-4 h-4 shrink-0" />
            Combined Executive
          </button>
        </nav>

        <div className="pt-4 border-t border-slate-150 mt-auto space-y-1 text-xs">
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-2 font-mono text-[9px] text-slate-400">
            <span className="text-green-600 font-extrabold flex items-center gap-1 mb-1">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full inline-block animate-pulse"></span>
              PORT: 3000 (SECURE)
            </span>
            <span>API Proxy active on models/gemini-3.5-flash</span>
          </div>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-xl text-left font-semibold transition-colors">
            <HelpCircle className="w-4 h-4 shrink-0" />
            Help & Documentation
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="lg:ml-[260px] pt-28 px-4 lg:px-8 max-w-7xl w-full mx-auto flex-grow">
        
        <AnimatePresence mode="wait">
          
          {/* SCREEN 1: VIRTUAL OFFICE LANDING PAGE */}
          {currentScreen === 'dashboard' && (
            <motion.div
              key="dashboard-screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              {/* Header Title Banner */}
              <div>
                <h2 className="font-extrabold text-[28px] text-slate-800 tracking-tight">Clinical Virtual-Office Workspace</h2>
                <p className="text-slate-500 text-sm mt-1">Coordinate simultaneous multi-agent clinical reviews and synthesize patient feedback at scale.</p>
              </div>

              {/* Dataset Quick Inventory summary */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-8 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-primary inline-block"></span>
                    <h3 className="font-bold text-slate-800 text-base">Active Patient Records Inventory</h3>
                  </div>
                  <p className="text-slate-500 text-xs leading-relaxed max-w-[600px]">
                    To run our clinical specialists, make sure you have loaded or uploaded a de-identified CSV dataset containing patient comments. We have automatically pre-loaded high-fidelity de-identified survey verbatims.
                  </p>
                </div>
                <div className="md:col-span-4 bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between h-full text-xs">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-slate-700">File Name:</span>
                    <span className="font-mono text-slate-500 text-[11px] truncate max-w-[150px]">{loadedFileName || 'None'}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-700">Scanned Rows:</span>
                    <span className="font-extrabold text-slate-800">{feedbackRows.length} Rows</span>
                  </div>
                  <button
                    onClick={() => setCurrentScreen('datasets')}
                    className="mt-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold p-2 rounded-lg text-[11px] transition-all flex items-center justify-center gap-1"
                  >
                    Manage Dataset Inventory
                  </button>
                </div>
              </div>

              {/* Grid of four specialized agent rooms */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg text-slate-800">Available AI Agent Offices</h3>
                  <span className="text-xs text-slate-400 font-medium">Click any office card to open details</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {agents.map((agent) => (
                    <AgentRoom
                      key={agent.id}
                      id={agent.id}
                      name={agent.name}
                      role={agent.role}
                      description={agent.description}
                      avatar={agent.avatar}
                      status={agent.status}
                      progress={agent.progress}
                      currentStep={agent.currentStep}
                      selected={selectedAgents.includes(agent.id)}
                      onSelectToggle={() => handleAgentSelectToggle(agent.id)}
                      onCardClick={() => {
                        // Open specific configuration or results for that agent
                        if (pipelineStatus === 'completed') {
                          setCurrentScreen('analytics');
                        } else {
                          setCurrentScreen('ai-agents');
                        }
                      }}
                    />
                  ))}
                </div>
              </div>

            </motion.div>
          )}

          {/* SCREEN 2: DATA PREVIEW & SCHEMA VALIDATION */}
          {currentScreen === 'datasets' && (
            <motion.div
              key="datasets-screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <DataValidation
                onDataLoaded={handleDataLoaded}
                currentData={feedbackRows}
                currentFileName={loadedFileName}
              />
            </motion.div>
          )}

          {/* SCREEN 3: AGENT CONFIGURATION */}
          {currentScreen === 'ai-agents' && (
            <motion.div
              key="ai-agents-screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <AgentConfig
                selectedAgents={selectedAgents}
                onStartAnalysis={triggerParallelInferences}
                isLoading={pipelineStatus === 'processing'}
                hasData={feedbackRows.length > 0}
              />
            </motion.div>
          )}

          {/* SCREEN 4: PIPELINE / INDIVIDUAL RESULTS */}
          {currentScreen === 'analytics' && (
            <motion.div
              key="analytics-screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              {pipelineStatus === 'processing' ? (
                <LiveProcessing
                  agents={agents}
                  onCancel={handleCancelAgent}
                  onRerun={handleRerunAgent}
                  onRerunAll={() => triggerParallelInferences({})}
                  overallStatus={pipelineStatus}
                />
              ) : (
                <ResultsDashboard
                  feedbackRows={feedbackRows}
                  insightResults={insightResults}
                  monitoringResults={monitoringResults}
                  triageResults={triageResults}
                  analyticsResult={analyticsResult ? (analyticsResult as any) : null}
                />
              )}
            </motion.div>
          )}

          {/* SCREEN 5: COMBINED EXECUTIVE WORKSPACE */}
          {currentScreen === 'executive' && (
            <motion.div
              key="executive-screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              {pipelineStatus !== 'completed' ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center" id="executive-empty">
                  <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-600 font-semibold text-sm">No analysis history found</p>
                  <p className="text-slate-400 text-xs mt-1">
                    Combined executive synthesis is unlocked after selected AI agents complete their dataset processing. Run the analysis first.
                  </p>
                  <button
                    onClick={() => setCurrentScreen('dashboard')}
                    className="mt-4 bg-primary text-white hover:bg-primary/95 font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-sm"
                  >
                    Go back to Virtual Offices
                  </button>
                </div>
              ) : (
                <ExecutiveDashboard
                  feedbackRows={feedbackRows}
                  combinedInsights={combinedInsights}
                  onUpdateCombinedInsights={(updated) => setCombinedInsights(updated)}
                />
              )}
            </motion.div>
          )}

        </AnimatePresence>

      </main>

      {/* Persistent Bottom Action Panel (Execution Tray) */}
      <footer className="fixed bottom-0 left-0 lg:left-[260px] right-0 h-20 z-50 bg-white/80 backdrop-blur-md border-t border-slate-200/60 shadow-[0px_-4px_20px_rgba(0,0,0,0.03)] flex justify-between items-center px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-slate-800 font-bold text-sm leading-tight">
                {selectedAgents.length} Clinical AI Agents Selected
              </p>
              <p className="text-slate-400 text-[10px] uppercase tracking-wider font-extrabold mt-0.5">
                Active Workspace Status: {pipelineStatus === 'processing' ? 'Processing...' : 'Ready'}
              </p>
            </div>
          </div>
          
          <div className="hidden md:flex gap-2">
            <div className="flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse"></span>
              HIPAA Safe
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold">
              CSV Loaded
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSelectedAgents([]);
              setAgents(prev => prev.map(a => ({ ...a, status: 'Idle', progress: 0 })));
            }}
            className="text-slate-500 hover:text-primary font-bold px-4 py-2.5 rounded-xl transition-all text-xs flex items-center gap-1.5 hover:bg-slate-50"
          >
            Clear Selection
          </button>
          
          <button
            onClick={() => triggerParallelInferences({
              feedbackInsight: { riskTolerance: 'Standard', themeFocus: 'General' },
              experienceMonitoring: { alertThreshold: 'Moderate Risk', sentimentBias: 'Neutral' },
              complaintTriage: { autoRoute: true, minimumHumanSeverity: 'LEVEL 3' },
              healthcareAnalytics: { aggregationPeriod: 'Quarterly', detailedNLP: true }
            })}
            disabled={selectedAgents.length === 0 || feedbackRows.length === 0 || pipelineStatus === 'processing'}
            className={`px-6 py-2.5 rounded-xl font-bold flex items-center gap-1.5 shadow-md text-xs transition-all scale-100 hover:scale-[1.02] active:scale-95 ${
              selectedAgents.length === 0 || feedbackRows.length === 0 || pipelineStatus === 'processing'
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-primary text-white hover:bg-primary/95 hover:shadow-lg'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Run Multi-Agent Analysis
          </button>
        </div>
      </footer>

    </div>
  );
}
