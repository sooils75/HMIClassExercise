import React from 'react';
import { Settings, Play, CheckCircle, ShieldAlert, BadgeInfo } from 'lucide-react';

interface AgentConfigProps {
  selectedAgents: string[];
  onStartAnalysis: (configs: Record<string, any>) => void;
  isLoading: boolean;
  hasData: boolean;
}

export const AgentConfig: React.FC<AgentConfigProps> = ({
  selectedAgents,
  onStartAnalysis,
  isLoading,
  hasData
}) => {
  const [configs, setConfigs] = React.useState<Record<string, any>>({
    feedbackInsight: { riskTolerance: 'Standard', themeFocus: 'General' },
    experienceMonitoring: { alertThreshold: 'Moderate Risk', sentimentBias: 'Neutral' },
    complaintTriage: { autoRoute: true, minimumHumanSeverity: 'LEVEL 3' },
    healthcareAnalytics: { aggregationPeriod: 'Quarterly', detailedNLP: true }
  });

  const handleConfigChange = (agent: string, key: string, value: any) => {
    setConfigs(prev => ({
      ...prev,
      [agent]: {
        ...prev[agent],
        [key]: value
      }
    }));
  };

  const onSubmit = () => {
    onStartAnalysis(configs);
  };

  if (selectedAgents.length === 0) {
    return (
      <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-8 text-center" id="agent-config-empty">
        <Settings className="w-12 h-12 text-slate-300 mx-auto mb-2" />
        <p className="text-slate-600 font-semibold text-sm">No clinical agents selected</p>
        <p className="text-slate-400 text-xs mt-1">Select one or more agents on the virtual office landing page to configure tasks.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-[0px_4px_20px_rgba(0,74,153,0.05)] overflow-hidden" id="agent-config-section">
      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-[20px] text-primary flex items-center gap-2">
              <Settings className="w-6 h-6 animate-spin-slow" />
              Agent Core Configuration
            </h3>
            <p className="text-slate-400 text-xs mt-1">Customize analysis workflows and thresholds for each selected clinical AI specialist.</p>
          </div>
          <button
            onClick={onSubmit}
            disabled={isLoading || !hasData}
            className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-md transition-all scale-100 active:scale-95 ${
              isLoading || !hasData
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-primary text-white hover:bg-primary/95 hover:shadow-lg'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            Start Simultaneous Analyses
          </button>
        </div>

        {!hasData && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-6 text-xs text-amber-800 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <span className="font-medium">
              A clinical dataset must be loaded or uploaded before starting agent analyses. Please upload a CSV or load our sample data above.
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Loop through selected agents */}
          {selectedAgents.includes('feedbackInsight') && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <h4 className="font-bold text-slate-800 text-sm">Feedback Insight Agent Configuration</h4>
                </div>
                <p className="text-slate-500 text-xs mb-4">Deep sentiment classification and root theme explanation verbatims.</p>
                
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-slate-600 text-xs font-semibold mb-1">Audit Risk Strictness</label>
                    <select
                      value={configs.feedbackInsight.riskTolerance}
                      onChange={(e) => handleConfigChange('feedbackInsight', 'riskTolerance', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-700"
                    >
                      <option value="Conservative">Conservative (Flag any slight uncertainty)</option>
                      <option value="Standard">Standard Balance (Quality Improvement)</option>
                      <option value="Lenient">Operational Only (Exclude low-impact concerns)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 text-xs font-semibold mb-1">Theme Filter Lock</label>
                    <select
                      value={configs.feedbackInsight.themeFocus}
                      onChange={(e) => handleConfigChange('feedbackInsight', 'themeFocus', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-700"
                    >
                      <option value="General">General (Scan all themes)</option>
                      <option value="Clinical Care">Clinical Care Focus</option>
                      <option value="Equity & Accessibility">Accessibility/Equity Highlight</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="border-t border-slate-200/60 pt-3 mt-4 text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                <BadgeInfo className="w-3.5 h-3.5 text-primary" />
                Prompt version 1.1 Clinical
              </div>
            </div>
          )}

          {selectedAgents.includes('experienceMonitoring') && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
                  <h4 className="font-bold text-slate-800 text-sm">Experience Monitor Config</h4>
                </div>
                <p className="text-slate-500 text-xs mb-4">HCAHPS trending audits, secondary themes, and risk assessment level flags.</p>
                
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-slate-600 text-xs font-semibold mb-1">Urgency Alert Threshold</label>
                    <select
                      value={configs.experienceMonitoring.alertThreshold}
                      onChange={(e) => handleConfigChange('experienceMonitoring', 'alertThreshold', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-700"
                    >
                      <option value="High Risk">High Risk Only</option>
                      <option value="Moderate Risk">Moderate & High Risks</option>
                      <option value="Low Risk">Audit All Risks (Low, Mod, High)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 text-xs font-semibold mb-1">Sentiment Bias Factor</label>
                    <select
                      value={configs.experienceMonitoring.sentimentBias}
                      onChange={(e) => handleConfigChange('experienceMonitoring', 'sentimentBias', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-700"
                    >
                      <option value="Neutral">Unbiased AI Core</option>
                      <option value="Critical">Defensive Quality Improvement Bias</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="border-t border-slate-200/60 pt-3 mt-4 text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                <BadgeInfo className="w-3.5 h-3.5 text-secondary" />
                Trends tracking model activated
              </div>
            </div>
          )}

          {selectedAgents.includes('complaintTriage') && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-error" />
                  <h4 className="font-bold text-slate-800 text-sm">Complaint Triage Specialist Config</h4>
                </div>
                <p className="text-slate-500 text-xs mb-4">Route to Patient Experience, Nursing, Physician, Compliance; Severity levels 1–4.</p>
                
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-slate-600 text-xs font-semibold mb-1">Human Review Trigger Policy</label>
                    <select
                      value={configs.complaintTriage.minimumHumanSeverity}
                      onChange={(e) => handleConfigChange('complaintTriage', 'minimumHumanSeverity', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-700"
                    >
                      <option value="LEVEL 2">Level 2+ (Moderate & up requires human)</option>
                      <option value="LEVEL 3">Level 3+ (High & Critical requires human)</option>
                      <option value="LEVEL 4">Level 4 (Critical safety alert only)</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-2.5 mt-2">
                    <span className="text-slate-600 text-xs font-semibold">Auto-Route Escalations</span>
                    <input
                      type="checkbox"
                      checked={configs.complaintTriage.autoRoute}
                      onChange={(e) => handleConfigChange('complaintTriage', 'autoRoute', e.target.checked)}
                      className="w-4.5 h-4.5 text-error rounded focus:ring-error/20 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
              <div className="border-t border-slate-200/60 pt-3 mt-4 text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                <BadgeInfo className="w-3.5 h-3.5 text-error" />
                Priority escalation rules loaded
              </div>
            </div>
          )}

          {selectedAgents.includes('healthcareAnalytics') && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-tertiary" />
                  <h4 className="font-bold text-slate-800 text-sm">Analytics Executive Dashboard Config</h4>
                </div>
                <p className="text-slate-500 text-xs mb-4">Recharts distribution charts, hidden bottlenecks, NLP keyword counts, and opportunities.</p>
                
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-slate-600 text-xs font-semibold mb-1">Aggregation Target Range</label>
                    <select
                      value={configs.healthcareAnalytics.aggregationPeriod}
                      onChange={(e) => handleConfigChange('healthcareAnalytics', 'aggregationPeriod', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-700"
                    >
                      <option value="Quarterly">Current Quarter (Q3-2026)</option>
                      <option value="Monthly">Monthly Breakdown</option>
                      <option value="YTD">Year-to-date Comparison</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-2.5 mt-2">
                    <span className="text-slate-600 text-xs font-semibold">Deep NLP Keyword Parsing</span>
                    <input
                      type="checkbox"
                      checked={configs.healthcareAnalytics.detailedNLP}
                      onChange={(e) => handleConfigChange('healthcareAnalytics', 'detailedNLP', e.target.checked)}
                      className="w-4.5 h-4.5 text-tertiary rounded focus:ring-tertiary/20 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
              <div className="border-t border-slate-200/60 pt-3 mt-4 text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                <BadgeInfo className="w-3.5 h-3.5 text-tertiary" />
                Statistical aggregates activated
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
