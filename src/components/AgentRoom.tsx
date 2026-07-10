import React from 'react';
import { motion } from 'motion/react';
import { Shield, Brain, HeartPulse, Activity, CheckCircle, HelpCircle, AlertTriangle } from 'lucide-react';

interface AgentRoomProps {
  id: string;
  name: string;
  role: string;
  description: string;
  avatar: string;
  status: 'Idle' | 'Selected' | 'Processing' | 'Completed' | 'Error';
  progress: number;
  currentStep: string;
  selected: boolean;
  onSelectToggle: () => void;
  onCardClick: () => void;
}

export const AgentRoom: React.FC<AgentRoomProps> = ({
  id,
  name,
  role,
  description,
  avatar,
  status,
  progress,
  currentStep,
  selected,
  onSelectToggle,
  onCardClick
}) => {
  // Map icons for agents
  const getAgentIcon = (agentId: string) => {
    switch (agentId) {
      case 'feedbackInsight':
        return <Brain className="w-5 h-5 text-primary" />;
      case 'experienceMonitoring':
        return <Activity className="w-5 h-5 text-secondary" />;
      case 'complaintTriage':
        return <Shield className="w-5 h-5 text-error" />;
      case 'healthcareAnalytics':
        return <HeartPulse className="w-5 h-5 text-tertiary" />;
      default:
        return <HelpCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (agentStatus: string) => {
    switch (agentStatus) {
      case 'Idle':
        return <span className="px-2.5 py-0.5 rounded text-[11px] font-bold text-gray-600 bg-gray-100 border border-gray-200">IDLE</span>;
      case 'Selected':
        return <span className="px-2.5 py-0.5 rounded text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-200">READY</span>;
      case 'Processing':
        return <span className="px-2.5 py-0.5 rounded text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-200 animate-pulse">PROCESSING</span>;
      case 'Completed':
        return <span className="px-2.5 py-0.5 rounded text-[11px] font-bold text-green-700 bg-green-50 border border-green-200">COMPLETED</span>;
      case 'Error':
        return <span className="px-2.5 py-0.5 rounded text-[11px] font-bold text-red-600 bg-red-50 border border-red-200">ERROR</span>;
      default:
        return null;
    }
  };

  return (
    <div
      onClick={(e) => {
        // Prevent click trigger if interacting with form control directly
        if ((e.target as HTMLElement).closest('input') || (e.target as HTMLElement).closest('button')) {
          return;
        }
        onCardClick();
      }}
      className={`relative bg-white rounded-2xl border transition-all duration-300 p-6 flex flex-col justify-between group cursor-pointer ${
        selected ? 'border-primary ring-2 ring-primary/10 shadow-md' : 'border-slate-200 hover:border-primary/40 hover:shadow-lg hover:-translate-y-1'
      }`}
      id={`agent-room-${id}`}
    >
      <div className="flex items-start justify-between mb-4">
        {/* Animated Avatar Container */}
        <div className="relative">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-sm border border-slate-100">
            {status === 'Processing' && (
              <motion.div
                className="absolute inset-0 bg-primary/20"
                animate={{
                  opacity: [0.2, 0.5, 0.2],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  ease: "easeInOut"
                }}
              />
            )}
            <img
              src={avatar}
              alt={name}
              className={`w-full h-full object-cover transition-transform duration-500 ${
                status === 'Processing' ? 'scale-110' : 'group-hover:scale-105'
              }`}
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Animated Glow Border if working */}
          {status === 'Processing' && (
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-5 w-5 bg-amber-500 border-2 border-white"></span>
            </span>
          )}
          {status === 'Completed' && (
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 bg-green-500 rounded-full border-2 border-white items-center justify-center">
              <CheckCircle className="w-3.5 h-3.5 text-white" />
            </span>
          )}
          {status === 'Idle' && (
            <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-slate-300 border-2 border-white"></span>
          )}
          {status === 'Selected' && (
            <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-blue-500 border-2 border-white animate-pulse"></span>
          )}
          {status === 'Error' && (
            <span className="absolute -bottom-1 -right-1 h-5 w-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
              <AlertTriangle className="w-3 h-3 text-white" />
            </span>
          )}
        </div>

        {/* Selection Switch */}
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => {
              e.stopPropagation();
              onSelectToggle();
            }}
            className="w-5 h-5 rounded-md text-primary focus:ring-primary/20 border-slate-300 cursor-pointer"
            id={`checkbox-${id}`}
          />
        </div>
      </div>

      <div className="flex-grow">
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          <h4 className="font-bold text-slate-800 text-[16px] leading-tight group-hover:text-primary transition-colors">{name}</h4>
          {getStatusBadge(status)}
        </div>
        <p className="text-primary font-semibold text-xs uppercase tracking-wider mb-2.5">{role}</p>
        <p className="text-slate-500 text-sm leading-relaxed mb-4">{description}</p>
      </div>

      {/* Progress & Operational Status */}
      {status === 'Processing' && (
        <div className="mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
            <span className="truncate">{currentStep || 'Analyzing verbatims...'}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
            <motion.div
              className="bg-primary h-full rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
        </div>
      )}

      {/* Footer capabilities */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
            {getAgentIcon(id)}
          </div>
          <span className="text-xs text-slate-500 font-medium">Specialized AI</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCardClick();
          }}
          className="bg-slate-50 hover:bg-primary hover:text-white text-slate-700 px-3.5 py-1.5 rounded-xl font-bold transition-all text-xs border border-slate-100"
        >
          Open Workspace
        </button>
      </div>
    </div>
  );
};
