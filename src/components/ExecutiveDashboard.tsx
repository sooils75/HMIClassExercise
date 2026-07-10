import React, { useState } from 'react';
import { ShieldCheck, UserCheck, AlertOctagon, Scale, CheckSquare, MessageSquareCode, UsersRound, FileWarning, Eye, Info } from 'lucide-react';
import { CombinedInsights, HumanReviewItem, PatientFeedbackRow } from '../types';

interface ExecutiveDashboardProps {
  feedbackRows: PatientFeedbackRow[];
  combinedInsights: CombinedInsights | null;
  onUpdateCombinedInsights: (updated: CombinedInsights) => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  feedbackRows,
  combinedInsights,
  onUpdateCombinedInsights
}) => {
  // Initialize Human Review Queue items
  const [reviewQueue, setReviewQueue] = useState<HumanReviewItem[]>([
    {
      id: "REV-101",
      rowId: "PT-002",
      patientComment: "No pude entender las instrucciones de alta médica porque nadie hablaba español y el folleto que me dieron estaba solo en inglés. Tuve que llamar a mi hijo al trabajo para que me tradujera las dosis de mis medicamentos para el corazón.",
      agentName: "Complaint Triage Agent",
      findingType: "Language Equity Barrier",
      severity: "Level 3 - High Risk",
      riskDetails: "Limited English Proficiency (LEP) patient at high risk of immediate clinical medication dosage non-compliance or accidental toxicity.",
      status: "Pending",
      timestamp: new Date().toISOString()
    },
    {
      id: "REV-102",
      rowId: "PT-005",
      patientComment: "I am a wheelchair user and the automated clinic check-in kiosk was placed so high on the counter that I couldn't reach the touchscreen to scan my ID. I had to wait until a staff member walked past to ask for help, which felt very undignified.",
      agentName: "Complaint Triage Agent",
      findingType: "ADA Physical Barrier",
      severity: "Level 3 - High Risk",
      riskDetails: "Non-compliance with ADA counter height guidelines. Excludes wheelchair-bound patients from digital-only check-in checkpoints.",
      status: "Pending",
      timestamp: new Date().toISOString()
    },
    {
      id: "REV-103",
      rowId: "PT-008",
      patientComment: "The discharge nurse rushed me out of the room so fast she forgot to give me my prescription for pain medication. I got all the way home before realizing, and had to drive back in heavy traffic while in significant pain.",
      agentName: "Experience Monitoring Agent",
      findingType: "Clinical Care Failure",
      severity: "Level 3 - High Risk",
      riskDetails: "Patient discharge closed in EHR without mandatory printed prescription hand-off, creating severe post-operative pain crises.",
      status: "Pending",
      timestamp: new Date().toISOString()
    }
  ]);

  const [selectedReviewItem, setSelectedReviewItem] = useState<HumanReviewItem | null>(null);
  const [reviewerName, setReviewerName] = useState('Chief Medical Officer');
  const [reviewNotes, setReviewNotes] = useState('');

  const handleReviewAction = (status: 'Approved' | 'Escalated' | 'Resolved') => {
    if (!selectedReviewItem) return;

    const updatedQueue = reviewQueue.map(item => {
      if (item.id === selectedReviewItem.id) {
        return {
          ...item,
          status,
          reviewer: reviewerName,
          reviewNotes: reviewNotes || 'Reviewed and approved by human clinical director.',
          timestamp: new Date().toISOString()
        };
      }
      return item;
    });

    setReviewQueue(updatedQueue);
    setSelectedReviewItem(null);
    setReviewNotes('');

    // Update cross-agent clinical queue on approval
    if (combinedInsights) {
      const updatedPriorityCases = combinedInsights.highPriorityCases.filter(c => c.rowId !== selectedReviewItem.rowId);
      onUpdateCombinedInsights({
        ...combinedInsights,
        highPriorityCases: updatedPriorityCases
      });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in" id="executive-dashboard-section">
      
      {/* Notice panel for responsible medical use */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
        <Info className="w-6 h-6 text-primary shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 leading-relaxed">
          <h4 className="font-bold text-sm text-primary mb-1">Human-in-the-Loop Safeguard Notice</h4>
          <p>
            These clinical AI agents are diagnostic support tools intended for administrative analysis, quality oversight, and clinical experience auditing. They do <strong>not</strong> independently make medical diagnoses, determine therapeutic treatments, issue employment determinations, or execute final HIPAA compliance files. All high-risk or critical findings must go through the mandatory professional human review checkpoints below prior to clinical action.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Combined cross-agent findings */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-[18px] text-primary mb-4 flex items-center gap-2">
              <Scale className="w-5 h-5 text-primary" />
              Synthesized Cross-Agent Insights
            </h3>
            
            <div className="space-y-5 text-xs text-slate-700">
              
              {/* Overlapping Common Themes */}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Consensus Core Themes (Supported by multiple agents)</span>
                <div className="flex flex-wrap gap-1.5">
                  {combinedInsights?.commonThemes?.map(ct => (
                    <span key={ct} className="bg-slate-50 text-slate-700 border border-slate-200/60 px-3 py-1 rounded-full font-bold">
                      {ct}
                    </span>
                  ))}
                </div>
              </div>

              {/* Related Patterns */}
              <div className="border-t border-slate-100 pt-4">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Correlated Operational Patterns</span>
                <div className="space-y-2">
                  {combinedInsights?.correlatedPatterns?.map((pattern, idx) => (
                    <div key={idx} className="flex gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed font-semibold">
                      <span className="text-primary mt-0.5">•</span>
                      <p>{pattern}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conflicting Interpretations */}
              <div className="border-t border-slate-100 pt-4">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Conflicting Interpretations (Requires Triage Resolution)</span>
                <div className="space-y-2">
                  {combinedInsights?.conflictingInterpretations?.map((conflict, idx) => (
                    <div key={idx} className="flex gap-2 bg-amber-50/40 p-2.5 rounded-lg border border-amber-100/60 text-slate-600 italic">
                      <AlertOctagon className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <p>{conflict}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Follow-ups */}
              <div className="border-t border-slate-100 pt-4">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Recommended Next Actions</span>
                <ul className="list-disc pl-4 space-y-1.5 leading-relaxed font-semibold text-primary">
                  {combinedInsights?.recommendedFollowUps?.map((f, idx) => (
                    <li key={idx}>{f}</li>
                  ))}
                </ul>
              </div>

              {/* Needed Data */}
              <div className="border-t border-slate-100 pt-4">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Further Data Requirements</span>
                <ul className="list-disc pl-4 space-y-1.5 leading-relaxed text-slate-500">
                  {combinedInsights?.additionalDataNeeds?.map((n, idx) => (
                    <li key={idx}>{n}</li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        </div>

        {/* Right Side: Human Review Queue */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-[18px] text-slate-800 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-amber-500" />
                Human Review Queue
              </h3>
              <span className="bg-slate-100 text-slate-700 font-bold px-2.5 py-0.5 rounded-full text-xs border border-slate-200">
                {reviewQueue.filter(item => item.status === 'Pending').length} Pending
              </span>
            </div>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {reviewQueue.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (item.status === 'Pending') setSelectedReviewItem(item);
                  }}
                  className={`border rounded-xl p-4 transition-all text-xs cursor-pointer ${
                    item.status === 'Pending' ? 'border-amber-200 hover:bg-slate-50' : 'border-slate-100 bg-slate-50/60 opacity-60'
                  } ${selectedReviewItem?.id === item.id ? 'ring-2 ring-primary bg-slate-50 border-primary' : ''}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-slate-500">{item.id} • {item.findingType}</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                      item.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      item.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="font-semibold text-slate-800 mb-1 leading-relaxed truncate">{item.patientComment}</p>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2">
                    <span>Source: {item.agentName}</span>
                    <span>{item.severity}</span>
                  </div>
                  {item.reviewer && (
                    <div className="mt-2 pt-2 border-t border-slate-100/50 text-[10px] text-green-700 font-bold">
                      ✓ Decided by {item.reviewer}: {item.reviewNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Modals or Detail cards */}
          {selectedReviewItem && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm animate-fade-in text-xs">
              <h4 className="font-bold text-slate-800 text-sm mb-3 pb-2 border-b border-slate-200">
                Triage Verification: {selectedReviewItem.id}
              </h4>
              <div className="space-y-3 text-slate-700">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Clinical Verbatim</span>
                  <p className="italic text-slate-600 bg-white border border-slate-200 rounded-lg p-3 leading-relaxed font-semibold">
                    "{selectedReviewItem.patientComment}"
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <span className="text-slate-400 block uppercase tracking-wider text-[9px] font-bold">Flag Type</span>
                    <span className="font-bold text-slate-800">{selectedReviewItem.findingType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block uppercase tracking-wider text-[9px] font-bold">Risk Assessment</span>
                    <span className="font-bold text-red-700">{selectedReviewItem.severity}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Identified Risk details</span>
                  <p className="font-semibold">{selectedReviewItem.riskDetails}</p>
                </div>

                <div className="pt-3 border-t border-slate-200">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Human Reviewer</label>
                      <input
                        type="text"
                        value={reviewerName}
                        onChange={(e) => setReviewerName(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 font-bold text-slate-700 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Audit decision / Notes</label>
                      <input
                        type="text"
                        placeholder="Add decision clinical verbiage..."
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-700"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReviewAction('Approved')}
                      className="w-full bg-primary text-white hover:bg-primary/95 font-bold p-2 rounded-xl transition-all shadow-sm"
                    >
                      Approve Triage
                    </button>
                    <button
                      onClick={() => handleReviewAction('Escalated')}
                      className="w-full bg-red-600 text-white hover:bg-red-700 font-bold p-2 rounded-xl transition-all shadow-sm"
                    >
                      Escalate to Board
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
