import React from 'react';
import { Play, RotateCcw, AlertCircle, Sparkles, CheckCircle2, ShieldEllipsis, XCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface ActiveAgentProgress {
  id: string;
  name: string;
  avatar: string;
  status: 'Idle' | 'Selected' | 'Processing' | 'Completed' | 'Error';
  progress: number;
  currentStep: string;
}

interface LiveProcessingProps {
  agents: ActiveAgentProgress[];
  onCancel: (id: string) => void;
  onRerun: (id: string) => void;
  onRerunAll: () => void;
  overallStatus: 'idle' | 'processing' | 'completed' | 'error';
}

export const LiveProcessing: React.FC<LiveProcessingProps> = ({
  agents,
  onCancel,
  onRerun,
  onRerunAll,
  overallStatus
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Processing':
        return 'text-amber-500';
      case 'Completed':
        return 'text-green-500';
      case 'Error':
        return 'text-red-500';
      default:
        return 'text-slate-400';
    }
  };

  const getProcessingStagesCount = (id: string) => {
    if (id === 'feedbackInsight') return 6;
    if (id === 'experienceMonitoring') return 7;
    if (id === 'complaintTriage') return 6;
    return 9; // Analytics Agent
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-[0px_4px_20px_rgba(0,74,153,0.05)] overflow-hidden animate-fade-in" id="live-processing-section">
      <div className="p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-5 mb-6 gap-4">
          <div>
            <h3 className="font-bold text-[20px] text-primary flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-500 animate-pulse" />
              Multi-Agent Parallel Processing Pipeline
            </h3>
            <p className="text-slate-400 text-xs mt-1">AI specialists are running parallel analysis loops on the active de-identified CSV records.</p>
          </div>
          {overallStatus === 'completed' && (
            <button
              onClick={onRerunAll}
              className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold px-4 py-2 rounded-xl text-xs transition-all flex items-center gap-1.5 self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Re-run All Analyses
            </button>
          )}
        </div>

        {/* Global Pipeline Activity Panel */}
        <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 mb-8 grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-2.5 bg-white rounded-xl border border-slate-100">
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Pipeline State</span>
            <span className={`font-extrabold text-sm uppercase mt-1 block ${overallStatus === 'processing' ? 'text-amber-500 animate-pulse' : 'text-green-600'}`}>
              {overallStatus === 'processing' ? 'Active Run' : 'Synchronized'}
            </span>
          </div>
          <div className="text-center p-2.5 bg-white rounded-xl border border-slate-100">
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Processing</span>
            <span className="font-extrabold text-slate-800 text-sm mt-1 block">
              {agents.filter(a => a.status === 'Processing').length} Agents
            </span>
          </div>
          <div className="text-center p-2.5 bg-white rounded-xl border border-slate-100">
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Completed</span>
            <span className="font-extrabold text-green-700 text-sm mt-1 block">
              {agents.filter(a => a.status === 'Completed').length} Agents
            </span>
          </div>
          <div className="text-center p-2.5 bg-white rounded-xl border border-slate-100">
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Validation status</span>
            <span className="font-extrabold text-blue-600 text-[11px] uppercase mt-1 block">
              HIPAA Compliant
            </span>
          </div>
          <div className="text-center p-2.5 bg-white rounded-xl border border-slate-100 col-span-2 md:col-span-1">
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Inference Engine</span>
            <span className="font-extrabold text-primary text-[11px] uppercase mt-1 block truncate">
              models/gemini-3.5-flash
            </span>
          </div>
        </div>

        {/* List of working agents */}
        <div className="space-y-6">
          {agents.map((agent) => (
            <div key={agent.id} className="border border-slate-200/80 rounded-2xl p-5 hover:border-slate-300 transition-colors bg-white shadow-[0px_2px_12px_rgba(0,0,0,0.02)]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* Agent Identity & Avatar */}
                <div className="flex items-center gap-4 min-w-[280px]">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-200 shadow-sm shrink-0">
                      {agent.status === 'Processing' && (
                        <motion.div
                          className="absolute inset-0 bg-primary/10"
                          animate={{ opacity: [0.1, 0.4, 0.1] }}
                          transition={{ repeat: Infinity, duration: 1.2 }}
                        />
                      )}
                      <img
                        src={agent.avatar}
                        alt={agent.name}
                        className={`w-full h-full object-cover ${agent.status === 'Processing' ? 'scale-110 animate-pulse' : ''}`}
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    {agent.status === 'Processing' && (
                      <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-800 text-sm leading-tight">{agent.name}</h4>
                    <p className={`text-xs font-semibold uppercase tracking-wider mt-0.5 ${getStatusColor(agent.status)}`}>
                      {agent.status}
                    </p>
                  </div>
                </div>

                {/* Main Progress Indicator */}
                <div className="flex-grow">
                  <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                    <span className="flex items-center gap-1.5 truncate max-w-[300px]">
                      {agent.status === 'Processing' && (
                        <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                      )}
                      {agent.currentStep}
                    </span>
                    <span>{Math.round(agent.progress)}%</span>
                  </div>
                  
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/50">
                    <motion.div
                      className={`h-full rounded-full ${
                        agent.status === 'Completed' ? 'bg-green-500' : 'bg-primary'
                      }`}
                      initial={{ width: '0%' }}
                      animate={{ width: `${agent.progress}%` }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>

                  {agent.status === 'Processing' && (
                    <div className="flex justify-between text-[10px] text-slate-400 font-semibold mt-1.5">
                      <span>Completed stages: {Math.floor((agent.progress / 100) * getProcessingStagesCount(agent.id))} / {getProcessingStagesCount(agent.id)}</span>
                      <span>Est. time remaining: {Math.max(1, Math.round((100 - agent.progress) / 10))}s</span>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 self-end md:self-auto border-t md:border-t-0 border-slate-100 pt-3 md:pt-0 w-full md:w-auto justify-end">
                  {agent.status === 'Processing' && (
                    <button
                      onClick={() => onCancel(agent.id)}
                      className="text-slate-500 hover:text-red-600 font-bold px-3 py-1.5 rounded-xl transition-all text-xs border border-slate-200 hover:bg-red-50 hover:border-red-100 flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Cancel
                    </button>
                  )}
                  {(agent.status === 'Completed' || agent.status === 'Error') && (
                    <button
                      onClick={() => onRerun(agent.id)}
                      className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold px-3 py-1.5 rounded-xl transition-all text-xs flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Re-run
                    </button>
                  )}
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
