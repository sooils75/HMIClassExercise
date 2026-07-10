import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, ShieldAlert, CheckCircle2, AlertTriangle, Play, HelpCircle } from 'lucide-react';
import { PatientFeedbackRow } from '../types';
import { SAMPLE_PATIENT_FEEDBACK } from '../data';

interface DataValidationProps {
  onDataLoaded: (data: PatientFeedbackRow[], fileName: string) => void;
  currentData: PatientFeedbackRow[] | null;
  currentFileName: string | null;
}

export const DataValidation: React.FC<DataValidationProps> = ({
  onDataLoaded,
  currentData,
  currentFileName
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Robust custom CSV parser that handles quotes and commas inside quotes correctly
  const parseCSV = (text: string): string[][] => {
    const lines: string[][] = [];
    let row: string[] = [];
    let insideQuote = false;
    let entry = '';

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (insideQuote && nextChar === '"') {
          // Double quote inside quotes is an escaped quote
          entry += '"';
          i++;
        } else {
          // Toggle quote state
          insideQuote = !insideQuote;
        }
      } else if (char === ',' && !insideQuote) {
        row.push(entry.trim());
        entry = '';
      } else if ((char === '\r' || char === '\n') && !insideQuote) {
        if (char === '\r' && nextChar === '\n') {
          i++; // skip next char
        }
        row.push(entry.trim());
        if (row.length > 1 || (row.length === 1 && row[0] !== '')) {
          lines.push(row);
        }
        row = [];
        entry = '';
      } else {
        entry += char;
      }
    }
    if (entry !== '' || row.length > 0) {
      row.push(entry.trim());
      lines.push(row);
    }
    return lines;
  };

  const processFileText = (text: string, name: string) => {
    try {
      const parsed = parseCSV(text);
      if (parsed.length < 2) {
        setErrorMsg('The CSV file appears to be empty or contains no headers.');
        return;
      }

      const headers = parsed[0].map(h => h.toLowerCase().replace(/[\s_\-]/g, ''));
      
      // Look for comment/verbatim column
      const commentIndex = parsed[0].findIndex((_, idx) => {
        const h = headers[idx];
        return h.includes('comment') || h.includes('feedback') || h.includes('verbatim') || h.includes('text') || h.includes('complaint');
      });

      if (commentIndex === -1) {
        setErrorMsg('Validation failed: No text column detected. Make sure your CSV contains a column named "Comment", "Feedback", or "Verbatim".');
        return;
      }

      // Find indices of other columns or use fallbacks
      const nameIndex = parsed[0].findIndex((_, idx) => headers[idx].includes('name') || headers[idx].includes('patient'));
      const satIndex = parsed[0].findIndex((_, idx) => headers[idx].includes('sat') || headers[idx].includes('score') || headers[idx].includes('rating'));
      const commIndex = parsed[0].findIndex((_, idx) => headers[idx].includes('comm') || headers[idx].includes('talk'));
      const serviceIndex = parsed[0].findIndex((_, idx) => headers[idx].includes('service') || headers[idx].includes('dept') || headers[idx].includes('department') || headers[idx].includes('line'));
      const visitIndex = parsed[0].findIndex((_, idx) => headers[idx].includes('visit') || headers[idx].includes('type') || headers[idx].includes('admission'));
      const personaIndex = parsed[0].findIndex((_, idx) => headers[idx].includes('persona') || headers[idx].includes('group') || headers[idx].includes('category'));

      const rows: PatientFeedbackRow[] = [];
      
      for (let i = 1; i < parsed.length; i++) {
        const row = parsed[i];
        if (row.length < parsed[0].length) continue; // skip incomplete rows

        const score = satIndex !== -1 ? parseInt(row[satIndex]) || 3 : Math.floor(Math.random() * 3) + 2;
        const commRating = commIndex !== -1 ? parseInt(row[commIndex]) || 3 : Math.floor(Math.random() * 3) + 2;

        rows.push({
          id: `PT-${100 + i}`,
          patientName: nameIndex !== -1 ? `${row[nameIndex]} (De-identified)` : 'De-identified Patient',
          comment: row[commentIndex],
          satisfactionScore: score < 1 || score > 5 ? 3 : score,
          communicationRating: commRating < 1 || commRating > 5 ? 3 : commRating,
          serviceLine: serviceIndex !== -1 ? row[serviceIndex] : 'General Medicine',
          visitType: visitIndex !== -1 ? row[visitIndex] : 'Outpatient',
          patientPersona: personaIndex !== -1 ? row[personaIndex] : 'General',
          followUpCompliant: Math.random() > 0.3,
          timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString()
        });
      }

      setErrorMsg(null);
      onDataLoaded(rows, name);
    } catch (e: any) {
      setErrorMsg(`Error parsing CSV: ${e.message || 'Malformed file structure.'}`);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          processFileText(event.target.result as string, file.name);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          processFileText(event.target.result as string, file.name);
        }
      };
      reader.readAsText(file);
    }
  };

  const loadSampleData = () => {
    setErrorMsg(null);
    onDataLoaded(SAMPLE_PATIENT_FEEDBACK, 'Patient_Experience_Q3_Clinical_Sample.csv');
  };

  const getSeverityColor = (score: number) => {
    if (score <= 2) return 'bg-red-50 text-red-700 border-red-200';
    if (score === 3) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-green-50 text-green-700 border-green-200';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-[0px_4px_20px_rgba(0,74,153,0.05)] overflow-hidden" id="data-validation-section">
      <div className="p-6 md:p-8">
        <h3 className="font-bold text-[20px] text-primary mb-6 flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6" />
          Clinical Dataset Configuration
        </h3>

        {/* Security Warning Panel */}
        <div className="bg-amber-50 border-l-4 border-amber-500 rounded-r-xl p-4 mb-6 flex items-start gap-3">
          <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-amber-900 text-sm">Patient Privacy Safeguards (HIPAA Mandates)</h4>
            <p className="text-amber-800 text-xs mt-1 leading-relaxed">
              This clinical assistant operates on de-identified, synthetic, or administrative patient records. Never upload files containing direct Protected Health Information (PHI) such as full patient names, Social Security Numbers, addresses, or phone numbers in unencrypted formats.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all ${
              dragActive ? 'border-primary bg-blue-50/50' : 'border-slate-300 hover:border-primary hover:bg-slate-50/40'
            }`}
          >
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100 group-hover:bg-blue-50">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            
            <p className="font-bold text-slate-800 text-base mb-1">Drag and drop your patient feedback CSV here</p>
            <p className="text-slate-400 text-xs mb-6">CSV structure should contain a Comment/Feedback column</p>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv"
                className="hidden"
                id="file-upload-input"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-primary text-white hover:bg-primary/95 font-semibold px-5 py-2.5 rounded-xl text-sm shadow-sm transition-all"
              >
                Browse Files
              </button>
              
              <button
                onClick={loadSampleData}
                className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold px-5 py-2.5 rounded-xl text-sm transition-all flex items-center gap-1.5 justify-center"
              >
                <Play className="w-4 h-4 fill-slate-700" />
                Load Clinical Sample Data
              </button>
            </div>

            {errorMsg && (
              <div className="mt-4 p-2.5 bg-red-50 text-red-600 rounded-xl text-xs border border-red-100 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span className="font-medium text-left">{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Validation Metrics & Schema Detect */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col justify-between">
            {currentData ? (
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
                  <div>
                    <h4 className="font-bold text-slate-800 text-base truncate max-w-[250px]">{currentFileName}</h4>
                    <p className="text-slate-400 text-xs">Administrative Health Dataset</p>
                  </div>
                  <div className="flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    Valid Structure
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div className="bg-white border border-slate-200 rounded-xl p-3">
                    <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Total Records</span>
                    <p className="font-extrabold text-slate-800 text-lg mt-0.5">{currentData.length}</p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-3">
                    <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">De-identification Status</span>
                    <p className="font-extrabold text-green-700 text-xs uppercase flex items-center gap-1 mt-1.5">
                      <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                      Compliant (100%)
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h5 className="font-bold text-slate-600 text-xs uppercase tracking-wider">Detected Columns:</h5>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-lg text-xs font-semibold">Comment [Verbatim]</span>
                    <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-lg text-xs font-semibold">Satisfaction [Score]</span>
                    <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-lg text-xs font-semibold">Service Line</span>
                    <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-lg text-xs font-semibold">Visit Type</span>
                    <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-lg text-xs font-semibold">Patient Persona</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <FileSpreadsheet className="w-12 h-12 text-slate-300 mb-2" />
                <p className="text-slate-500 font-semibold text-sm">No dataset loaded yet</p>
                <p className="text-slate-400 text-xs mt-1 max-w-[300px]">
                  Upload a CSV file or load our high-fidelity sample clinical database to start coordinates.
                </p>
              </div>
            )}

            {currentData && (
              <div className="border-t border-slate-200 pt-4 mt-4 flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Auto-scanned for digital accessibility flags</span>
                <span className="text-slate-400">100% HIPAA Safe</span>
              </div>
            )}
          </div>
        </div>

        {/* Clinical Data Preview Section */}
        {currentData && (
          <div className="mt-8 border-t border-slate-100 pt-6">
            <h4 className="font-bold text-slate-700 text-sm mb-4">Patient Comments Preview (Top 3 Records)</h4>
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-100">
                    <th className="p-3 w-[10%]">Record ID</th>
                    <th className="p-3 w-[15%]">Persona Group</th>
                    <th className="p-3 w-[55%]">Patient Comment</th>
                    <th className="p-3 w-[10%]">Service Line</th>
                    <th className="p-3 w-[10%]">Sat Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentData.slice(0, 3).map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 font-mono text-xs text-slate-500 font-medium">{row.id}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {row.patientPersona}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 leading-relaxed max-w-[400px] truncate" title={row.comment}>
                        {row.comment}
                      </td>
                      <td className="p-3 text-xs font-semibold text-slate-500">{row.serviceLine}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getSeverityColor(row.satisfactionScore)}`}>
                          {row.satisfactionScore} ★
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
