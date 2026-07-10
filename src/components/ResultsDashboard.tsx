import React, { useState } from 'react';
import { Search, Filter, Download, ArrowUpDown, ChevronRight, HelpCircle, HeartPulse, Sparkles, Brain, Activity, Shield, AlertTriangle, CheckCircle, ShieldCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell } from 'recharts';
import { FeedbackInsightResult, ExperienceMonitoringResult, ComplaintTriageResult, AnalyticsAgentResult, PatientFeedbackRow } from '../types';

interface ResultsDashboardProps {
  feedbackRows: PatientFeedbackRow[];
  insightResults: FeedbackInsightResult[] | null;
  monitoringResults: ExperienceMonitoringResult[] | null;
  triageResults: ComplaintTriageResult[] | null;
  analyticsResult: AnalyticsAgentResult | null;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  feedbackRows,
  insightResults,
  monitoringResults,
  triageResults,
  analyticsResult
}) => {
  const [activeTab, setActiveTab] = useState<'insight' | 'monitoring' | 'triage' | 'analytics'>('insight');
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceLineFilter, setServiceLineFilter] = useState('All');
  const [sentimentFilter, setSentimentFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');

  // Export results as JSON file download
  const handleExport = () => {
    let dataToExport: any = {};
    if (activeTab === 'insight') dataToExport = { feedbackInsight: insightResults };
    else if (activeTab === 'monitoring') dataToExport = { experienceMonitoring: monitoringResults };
    else if (activeTab === 'triage') dataToExport = { complaintTriage: triageResults };
    else if (activeTab === 'analytics') dataToExport = { healthcareAnalytics: analyticsResult };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Clinical_AI_Analysis_${activeTab}_export.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getServiceLines = () => {
    const lines = new Set<string>();
    feedbackRows.forEach(r => lines.add(r.serviceLine));
    return ['All', ...Array.from(lines)];
  };

  // Filter helper
  const filterRows = (resultsList: any[] | null) => {
    if (!resultsList) return [];
    return resultsList.filter(res => {
      const parentRow = feedbackRows.find(r => r.id === res.rowId);
      if (!parentRow) return false;

      const matchesSearch = parentRow.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        parentRow.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        parentRow.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesService = serviceLineFilter === 'All' || parentRow.serviceLine === serviceLineFilter;
      
      const matchesSentiment = sentimentFilter === 'All' || res.sentiment === sentimentFilter;

      const matchesSeverity = severityFilter === 'All' || 
        (res.severityLevel && res.severityLevel.includes(severityFilter)) ||
        (res.riskLevel && res.riskLevel.includes(severityFilter));

      return matchesSearch && matchesService && matchesSentiment && matchesSeverity;
    });
  };

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive':
        return <span className="bg-green-50 text-green-700 border border-green-200 text-xs font-semibold px-2 py-0.5 rounded-full">Positive</span>;
      case 'Negative':
        return <span className="bg-red-50 text-red-700 border border-red-200 text-xs font-semibold px-2 py-0.5 rounded-full">Negative</span>;
      case 'Mixed':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold px-2 py-0.5 rounded-full">Mixed</span>;
      default:
        return <span className="bg-slate-50 text-slate-600 border border-slate-200 text-xs font-semibold px-2 py-0.5 rounded-full">Neutral</span>;
    }
  };

  const COLORS = ['#00346f', '#006399', '#48CAE4', '#005461', '#9bbdff'];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-[0px_4px_20px_rgba(0,74,153,0.05)] overflow-hidden" id="results-dashboard-section">
      
      {/* Dashboard Subheader tabs */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <HeartPulse className="w-6 h-6 text-primary" />
          <div>
            <h3 className="font-bold text-lg text-slate-800">Clinical Insights Dashboard</h3>
            <p className="text-slate-500 text-xs mt-0.5">Separate detailed output repositories for each selected healthcare AI specialist.</p>
          </div>
        </div>

        <div className="flex gap-2 border-b md:border-b-0 border-slate-200/60 pb-2 md:pb-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('insight')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'insight' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            Feedback Insight Agent
          </button>
          <button
            onClick={() => setActiveTab('monitoring')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'monitoring' ? 'bg-secondary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Experience Monitor
          </button>
          <button
            onClick={() => setActiveTab('triage')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'triage' ? 'bg-error text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Complaint Triage
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'analytics' ? 'bg-tertiary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Executive Analytics
          </button>
        </div>
      </div>

      {/* Interactive Filter Panels (Visible for Tables) */}
      {activeTab !== 'analytics' && (
        <div className="p-6 border-b border-slate-100 bg-white grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search comments or patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <select
              value={serviceLineFilter}
              onChange={(e) => setServiceLineFilter(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-700"
            >
              <option value="All">All Service Lines</option>
              {getServiceLines().filter(l => l !== 'All').map(line => (
                <option key={line} value={line}>{line}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={sentimentFilter}
              onChange={(e) => setSentimentFilter(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-700"
            >
              <option value="All">All Sentiments</option>
              <option value="Positive">Positive Only</option>
              <option value="Negative">Negative Only</option>
              <option value="Mixed">Mixed Only</option>
              <option value="Neutral">Neutral Only</option>
            </select>
          </div>

          <div className="flex gap-2">
            {activeTab === 'monitoring' && (
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-700"
              >
                <option value="All">All Risk Levels</option>
                <option value="High Risk">High Risk</option>
                <option value="Moderate Risk">Moderate Risk</option>
                <option value="Low Risk">Low Risk</option>
              </select>
            )}

            {activeTab === 'triage' && (
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-700"
              >
                <option value="All">All Severities</option>
                <option value="LEVEL 1">Level 1 - Low</option>
                <option value="LEVEL 2">Level 2 - Moderate</option>
                <option value="LEVEL 3">Level 3 - High</option>
                <option value="LEVEL 4">Level 4 - Critical</option>
              </select>
            )}

            <button
              onClick={handleExport}
              className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold px-4 rounded-xl text-xs transition-all flex items-center gap-1 shrink-0 ml-auto"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
          </div>
        </div>
      )}

      {/* Tab Panels Contents */}
      <div className="p-6 md:p-8">
        
        {/* TAB 1: Feedback Insight Agent */}
        {activeTab === 'insight' && (
          <div>
            {!insightResults ? (
              <div className="text-center py-12 text-slate-400 font-semibold text-sm">
                Feedback Insight Agent has not analyzed the dataset yet. Run the analysis loop.
              </div>
            ) : filterRows(insightResults).length === 0 ? (
              <div className="text-center py-12 text-slate-400 font-semibold text-sm">
                No matching analytical results found.
              </div>
            ) : (
              <div className="space-y-6">
                {filterRows(insightResults).map((res: FeedbackInsightResult) => {
                  const parentRow = feedbackRows.find(r => r.id === res.rowId);
                  return (
                    <div key={res.rowId} className="border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-all bg-white flex flex-col gap-4">
                      <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-2">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs text-slate-400 font-bold">{res.rowId}</span>
                          <span className="text-slate-800 font-bold text-sm">{parentRow?.patientName}</span>
                          <span className="text-slate-400 text-xs">•</span>
                          <span className="text-xs font-semibold text-slate-500">{parentRow?.serviceLine} ({parentRow?.visitType})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                            {res.theme}
                          </span>
                          {getSentimentBadge(res.sentiment)}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-5 bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block mb-1">De-identified Verbatim</span>
                          <p className="text-slate-700 text-xs leading-relaxed italic">"{parentRow?.comment}"</p>
                        </div>
                        <div className="lg:col-span-7 space-y-3 text-xs text-slate-700">
                          <div>
                            <span className="font-bold text-slate-800">Theme Reasoning:</span> {res.reasoning}
                          </div>
                          <div>
                            <span className="font-bold text-slate-800">Operational Issue Identified:</span> {res.operationalIssue}
                          </div>
                          <div className="bg-red-50/50 p-2.5 rounded-lg border border-red-100 text-red-800">
                            <span className="font-bold text-red-950 block text-[10px] uppercase tracking-wider mb-0.5">Clinical Risk / Bias concern:</span>
                            {res.riskBiasConcern}
                          </div>
                          <div className="bg-blue-50/50 p-2.5 rounded-lg border border-blue-100 text-blue-800">
                            <span className="font-bold text-blue-950 block text-[10px] uppercase tracking-wider mb-0.5">Recommended Managerial Action:</span>
                            {res.recommendedAction}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Patient Experience Monitoring */}
        {activeTab === 'monitoring' && (
          <div>
            {!monitoringResults ? (
              <div className="text-center py-12 text-slate-400 font-semibold text-sm">
                Experience Monitoring Agent has not analyzed the dataset yet. Run the analysis loop.
              </div>
            ) : filterRows(monitoringResults).length === 0 ? (
              <div className="text-center py-12 text-slate-400 font-semibold text-sm">
                No matching experience audits found.
              </div>
            ) : (
              <div className="space-y-6">
                {filterRows(monitoringResults).map((res: ExperienceMonitoringResult) => {
                  const parentRow = feedbackRows.find(r => r.id === res.rowId);
                  const isHighRisk = res.riskLevel === 'High Risk';
                  
                  return (
                    <div key={res.rowId} className={`border rounded-2xl p-6 hover:shadow-md transition-all bg-white flex flex-col gap-4 ${
                      isHighRisk ? 'border-red-200 ring-2 ring-red-50/50' : 'border-slate-200'
                    }`}>
                      <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-2">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs text-slate-400 font-bold">{res.rowId}</span>
                          <span className="text-slate-800 font-bold text-sm">{parentRow?.patientName}</span>
                          <span className="text-slate-400 text-xs">•</span>
                          <span className="text-slate-500 font-medium text-xs">{parentRow?.patientPersona}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                            isHighRisk ? 'bg-red-50 text-red-700 border-red-200' : 
                            res.riskLevel === 'Moderate Risk' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}>
                            {res.riskLevel}
                          </span>
                          {getSentimentBadge(res.sentiment)}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-5 flex flex-col gap-3">
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block mb-1">De-identified Verbatim</span>
                            <p className="text-slate-700 text-xs leading-relaxed italic">"{parentRow?.comment}"</p>
                          </div>
                          
                          <div className="bg-slate-50/50 border border-slate-200/60 rounded-xl p-3 text-xs">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Themes Classified:</span>
                            <div className="flex flex-wrap gap-1">
                              <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-xs text-slate-700 font-semibold">{res.theme}</span>
                              {res.secondaryThemes?.map(st => (
                                <span key={st} className="bg-white border border-slate-200/40 px-2 py-0.5 rounded text-xs text-slate-400 font-medium">{st}</span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="lg:col-span-7 space-y-4 text-xs text-slate-700">
                          {/* Executive Summary Box */}
                          <div className="bg-slate-900 text-slate-100 rounded-xl p-4 border border-slate-800">
                            <span className="font-bold text-amber-400 text-[10px] uppercase tracking-wider flex items-center gap-1.5 mb-2">
                              <Activity className="w-3.5 h-3.5 animate-pulse" />
                              HCAHPS Executive Summary
                            </span>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="text-slate-400 text-[10px] uppercase block mb-0.5">Primary Experience Issue:</span>
                                <span className="font-bold text-slate-200">{res.executiveSummary?.primaryIssue}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 text-[10px] uppercase block mb-0.5">Severity / Priority:</span>
                                <span className="font-bold text-slate-200">{res.executiveSummary?.severity}</span>
                              </div>
                            </div>
                            <div className="mt-2.5 pt-2 border-t border-slate-800">
                              <span className="text-slate-400 text-[10px] uppercase block mb-0.5">Recommended Experience Action:</span>
                              <span className="font-semibold text-slate-100">{res.executiveSummary?.recommendedAction}</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div>
                              <span className="font-bold text-slate-800">Sentiment & Clinical Reasoning:</span> {res.reasoning}
                            </div>
                            <div>
                              <span className="font-bold text-slate-800">Operational Bottlenecks:</span> {res.operationalIssue}
                            </div>
                            <div className="bg-amber-50/50 p-2.5 rounded-lg border border-amber-100 text-amber-800">
                              <span className="font-bold text-amber-950 block text-[10px] uppercase tracking-wider mb-0.5">Healthcare Equity & Accessibility Review:</span>
                              {res.equityAccessibilityConcern}
                            </div>
                            <div className="bg-blue-50/50 p-2.5 rounded-lg border border-blue-100 text-blue-800">
                              <span className="font-bold text-blue-950 block text-[10px] uppercase tracking-wider mb-0.5">Managerial Recommendation:</span>
                              {res.managerialRecommendation}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Complaint Triage Assistant */}
        {activeTab === 'triage' && (
          <div>
            {!triageResults ? (
              <div className="text-center py-12 text-slate-400 font-semibold text-sm">
                Complaint Triage Agent has not analyzed the dataset yet. Run the analysis loop.
              </div>
            ) : filterRows(triageResults).length === 0 ? (
              <div className="text-center py-12 text-slate-400 font-semibold text-sm">
                No matching triage records found.
              </div>
            ) : (
              <div className="space-y-6">
                {filterRows(triageResults).map((res: ComplaintTriageResult) => {
                  const parentRow = feedbackRows.find(r => r.id === res.rowId);
                  const isCritical = res.severityLevel.includes('Critical') || res.severityLevel.includes('High');
                  const reviewRequired = res.humanReviewStatus === 'Human Review Required';

                  return (
                    <div key={res.rowId} className={`border rounded-2xl p-6 hover:shadow-md transition-all bg-white flex flex-col gap-4 ${
                      isCritical ? 'border-red-300 ring-2 ring-red-100/50' : 'border-slate-200'
                    }`}>
                      <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-2">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs text-slate-400 font-bold">{res.rowId}</span>
                          <span className="text-slate-800 font-bold text-sm">{parentRow?.patientName}</span>
                          <span className="text-slate-400 text-xs">•</span>
                          <span className="text-xs font-semibold text-slate-500">{parentRow?.serviceLine}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                            isCritical ? 'bg-red-100 text-red-800 border-red-300' : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}>
                            {res.severityLevel}
                          </span>
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                            reviewRequired ? 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse' : 'bg-slate-50 text-slate-500 border-slate-200'
                          }`}>
                            {res.humanReviewStatus}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-5 flex flex-col gap-3">
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block mb-1">Complaint Verbatim</span>
                            <p className="text-slate-700 text-xs leading-relaxed italic">"{parentRow?.comment}"</p>
                          </div>

                          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Triage Categories:</span>
                            <div className="flex flex-wrap gap-1">
                              <span className="bg-white border border-slate-200 px-2.5 py-0.5 rounded text-xs text-slate-700 font-semibold">{res.category}</span>
                              {res.secondaryCategories?.map(sc => (
                                <span key={sc} className="bg-white border border-slate-200/40 px-2 py-0.5 rounded text-xs text-slate-400 font-medium">{sc}</span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="lg:col-span-7 space-y-4 text-xs text-slate-700">
                          {/* Escalation Route Ticket */}
                          <div className="bg-blue-950 text-blue-100 rounded-xl p-4 border border-blue-900 flex justify-between items-center">
                            <div>
                              <span className="text-blue-300 text-[10px] uppercase block mb-0.5 font-bold tracking-wider">Escalation Routing Department:</span>
                              <span className="font-extrabold text-white text-base">{res.recommendedDepartment}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-blue-300 text-[10px] uppercase block mb-0.5 font-bold tracking-wider">Priority:</span>
                              <span className={`font-extrabold text-xs uppercase px-2.5 py-1 rounded-full ${
                                res.escalationPriority === 'Immediate' ? 'bg-red-500 text-white' :
                                res.escalationPriority === 'Priority' ? 'bg-amber-500 text-slate-900' : 'bg-blue-800 text-blue-100'
                              }`}>{res.escalationPriority}</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div>
                              <span className="font-bold text-slate-800">Severity Justification:</span> {res.severityJustification}
                            </div>
                            <div className="bg-red-50/50 p-2.5 rounded-lg border border-red-100 text-red-800">
                              <span className="font-bold text-red-950 block text-[10px] uppercase tracking-wider mb-0.5">Identified Risk Flags:</span>
                              {res.riskFlags && res.riskFlags.length > 0 ? (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {res.riskFlags.map(rf => (
                                    <span key={rf} className="bg-white border border-red-200 px-2 py-0.5 rounded text-[10px] font-bold text-red-700">{rf}</span>
                                  ))}
                                </div>
                              ) : (
                                <span>No active safety or operational risk flags identified.</span>
                              )}
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                              <span className="font-bold text-slate-800 block text-[10px] uppercase tracking-wider mb-0.5">AI Executive Summary:</span>
                              <p className="text-slate-600 leading-relaxed font-semibold">
                                Category: {res.executiveSummary?.category} | Severity: {res.executiveSummary?.severity} | Major Risk: {res.executiveSummary?.majorRisk} | Action: {res.executiveSummary?.recommendedAction}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Healthcare Analytics Dashboard */}
        {activeTab === 'analytics' && (
          <div>
            {!analyticsResult ? (
              <div className="text-center py-12 text-slate-400 font-semibold text-sm">
                Healthcare Analytics Agent has not analyzed the dataset yet. Run the analysis loop.
              </div>
            ) : (
              <div className="space-y-8 animate-fade-in">
                
                {/* Visual Section 1: Executive KPI overview cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl text-center">
                    <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Analyzed comments</span>
                    <p className="font-extrabold text-slate-800 text-3xl mt-1">{analyticsResult.executiveOverview?.totalAnalyzed}</p>
                    <span className="text-green-600 text-[10px] font-bold mt-1 inline-block">De-identified</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl text-center">
                    <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Avg Satisfaction</span>
                    <p className="font-extrabold text-slate-800 text-3xl mt-1">{analyticsResult.executiveOverview?.avgSatisfaction} / 5</p>
                    <span className="text-slate-500 text-[10px] font-bold mt-1 inline-block">Overall baseline</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl text-center">
                    <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Avg Communication</span>
                    <p className="font-extrabold text-slate-800 text-3xl mt-1">{analyticsResult.executiveOverview?.avgCommunication} / 5</p>
                    <span className="text-slate-500 text-[10px] font-bold mt-1 inline-block">HCAHPS Metric</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl text-center">
                    <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Follow-up compliance</span>
                    <p className="font-extrabold text-green-700 text-3xl mt-1">{analyticsResult.executiveOverview?.followUpComplianceRate}%</p>
                    <span className="text-slate-500 text-[10px] font-bold mt-1 inline-block">Care coordination</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl text-center col-span-2 md:col-span-1">
                    <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Active Service Lines</span>
                    <p className="font-extrabold text-slate-800 text-3xl mt-1">{analyticsResult.executiveOverview?.serviceLinesCount}</p>
                    <span className="text-slate-500 text-[10px] font-bold mt-1 inline-block">Represented clinics</span>
                  </div>
                </div>

                {/* Section 2 & 3: Recharts Visualizations */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Satisfaction Distribution bar chart */}
                  <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5">
                    <h4 className="font-bold text-slate-800 text-sm mb-4">Satisfaction Score Distribution (1-5 Star Ratings)</h4>
                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsResult.satisfactionDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis dataKey="score" stroke="#94A3B8" fontSize={11} tickLine={false} />
                          <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                          <Tooltip cursor={{ fill: 'rgba(0, 52, 111, 0.03)' }} />
                          <Bar dataKey="count" fill="#00346f" radius={[4, 4, 0, 0]} maxBarSize={50} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Performance radar chart */}
                  <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5">
                    <h4 className="font-bold text-slate-800 text-sm mb-4">Clinic Performance (Satisfaction by Service Line)</h4>
                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={analyticsResult.satisfactionByServiceLine}>
                          <PolarGrid stroke="#E2E8F0" />
                          <PolarAngleAxis dataKey="serviceLine" stroke="#475569" fontSize={9} />
                          <PolarRadiusAxis angle={30} domain={[0, 5]} fontSize={10} stroke="#94A3B8" />
                          <Radar name="Satisfaction Score" dataKey="score" stroke="#006399" fill="#cde5ff" fillOpacity={0.6} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Section 4 & 6: Hidden problems & Equity reviews */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Hidden problems list */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5">
                    <h4 className="font-bold text-slate-800 text-sm mb-4">Hidden Organizational Vulnerabilities (Complaint Surges)</h4>
                    <div className="space-y-4">
                      {analyticsResult.hiddenProblems?.map((prob) => (
                        <div key={prob.serviceLine} className="border border-slate-100 rounded-xl p-4 bg-slate-50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-slate-800 text-xs uppercase tracking-wider">{prob.serviceLine}</span>
                            <span className="text-red-700 bg-red-50 border border-red-100 font-bold px-2 py-0.5 rounded text-[11px]">
                              {prob.complaintRate}% Complaint Rate
                            </span>
                          </div>
                          <ul className="list-disc pl-4 space-y-1 text-slate-600 text-xs">
                            {prob.issues?.map((issue, idx) => (
                              <li key={idx}>{issue}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Equity accessibility list */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5">
                    <h4 className="font-bold text-slate-800 text-sm mb-4">Healthcare Equity & Digital Exclusion Dashboard</h4>
                    <div className="space-y-3.5 text-xs text-slate-700">
                      {analyticsResult.equityAccessibility?.map((eq) => (
                        <div key={eq.persona} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="font-bold text-slate-800">{eq.persona} Persona Group</span>
                            <span className="text-slate-400 font-mono text-[10px] uppercase">Telemetry</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                            <div className="bg-slate-50 p-2 border border-slate-100 rounded-lg">
                              <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider mb-0.5">Physical ADA</span>
                              <span className="font-extrabold text-slate-800">{eq.accessibilityConcernsCount} Barriers</span>
                            </div>
                            <div className="bg-slate-50 p-2 border border-slate-100 rounded-lg">
                              <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider mb-0.5">Language</span>
                              <span className="font-extrabold text-slate-800">{eq.languageBarriersCount} Barriers</span>
                            </div>
                            <div className="bg-slate-50 p-2 border border-slate-100 rounded-lg">
                              <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider mb-0.5">Digital Lit</span>
                              <span className="font-extrabold text-slate-800">{eq.digitalLiteracyCount} Barriers</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Section 8: Recommended AI Agents opportunities */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5">
                  <h4 className="font-bold text-slate-800 text-sm mb-4">New Clinical AI Agent Strategic Opportunities</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
                    {analyticsResult.agentOpportunities?.map((opp) => (
                      <div key={opp.name} className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between">
                        <div>
                          <span className="bg-blue-50 text-blue-800 border border-blue-100 font-bold px-2.5 py-0.5 rounded text-[10px] uppercase block w-fit mb-2.5">
                            Opportunity Spec
                          </span>
                          <h5 className="font-bold text-slate-800 text-xs mb-1">{opp.name}</h5>
                          <p className="text-slate-500 mb-4">{opp.purpose}</p>
                        </div>
                        <div className="bg-white border border-slate-100 p-2 rounded-lg font-semibold text-primary">
                          <span className="text-[9px] uppercase tracking-wider text-slate-400 block mb-0.5">Expected Org Impact</span>
                          {opp.expectedImpact}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 9: Executive Leadership Recommendations list */}
                <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 border border-slate-800">
                  <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
                    <HeartPulse className="w-5 h-5 text-amber-400" />
                    <h4 className="font-bold text-white text-sm">Clinical Executive Action Roadmap</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs text-slate-300">
                    <div>
                      <span className="text-amber-400 font-extrabold text-[10px] uppercase tracking-wider block mb-3">Top 5 Quality Priorities</span>
                      <ul className="list-decimal pl-4 space-y-2 leading-relaxed font-semibold">
                        {analyticsResult.executiveRecommendations?.priorities?.map((p, idx) => (
                          <li key={idx}>{p}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <span className="text-green-400 font-extrabold text-[10px] uppercase tracking-wider block mb-3">Tactical Quick Wins (0–3 Months)</span>
                        <ul className="list-disc pl-4 space-y-1.5 leading-relaxed">
                          {analyticsResult.executiveRecommendations?.quickWins?.map((q, idx) => (
                            <li key={idx}>{q}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="border-t border-slate-800 pt-4">
                        <span className="text-blue-400 font-extrabold text-[10px] uppercase tracking-wider block mb-3">Long-term AI Integration Options (6–12 Months)</span>
                        <ul className="list-disc pl-4 space-y-1.5 leading-relaxed">
                          {analyticsResult.executiveRecommendations?.longTermOpportunities?.map((o, idx) => (
                            <li key={idx}>{o}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
