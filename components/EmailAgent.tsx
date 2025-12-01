import React, { useState } from 'react';
import { analyzeEmail } from '../services/geminiService';

const EmailAgent: React.FC = () => {
  const [input, setInput] = useState('');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const result = await analyzeEmail(input);
      setAnalysis(result);
    } catch (e) {
      setAnalysis("Error analyzing email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getFolderConfig = (folderRaw: string | null) => {
    if (!folderRaw) return null;
    const folder = folderRaw.toLowerCase();
    
    if (folder.includes('urgent')) return {
      label: 'Urgent',
      description: 'Requires immediate attention',
      colorClass: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M3.34 19a2 2 0 0 0 1.66 1h14a2 2 0 0 0 1.66-1L12 2.66Z"/></svg>
    };
    if (folder.includes('action')) return {
      label: 'Action Required',
      description: 'Response needed soon',
      colorClass: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    };
    if (folder.includes('marketing') || folder.includes('promo')) return {
      label: 'Promotions',
      description: 'Marketing and offers',
      colorClass: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
    };
    if (folder.includes('reference') || folder.includes('info')) return {
      label: 'Reference',
      description: 'For your information',
      colorClass: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
    };
    if (folder.includes('personal') || folder.includes('social')) return {
      label: 'Personal',
      description: 'Social and family',
      colorClass: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    };
    if (folder.includes('archive') || folder.includes('trash')) return {
      label: 'Archive',
      description: 'Safe to archive',
      colorClass: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect width="22" height="5" x="1" y="3"/><line x1="10" x2="14" y1="12" y2="12"/></svg>
    };

    return {
      label: folderRaw,
      description: 'Categorized folder',
      colorClass: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
    };
  };

  const recommendedFolder = analysis ? (analysis.match(/Recommended Folder:\s*(.+)/i)?.[1]?.trim() || null) : null;
  const folderConfig = getFolderConfig(recommendedFolder);

  return (
    <div className="h-full flex flex-col md:flex-row gap-6 p-6 lg:p-8 overflow-hidden">
      {/* Input Section */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="glass-panel rounded-2xl flex-1 flex flex-col p-1 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-50"></div>
          
          <div className="p-5 pb-2 flex justify-between items-center">
             <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </span>
              Raw Email Content
            </h2>
            <button 
              onClick={() => setInput('')}
              className="text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors uppercase font-medium tracking-wider"
            >
              Clear
            </button>
          </div>

          <textarea
            className="flex-1 w-full bg-transparent border-none rounded-xl p-5 text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-0 resize-none font-mono text-sm leading-relaxed"
            placeholder="Paste your email content here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          
          <div className="p-4 bg-gray-50/80 dark:bg-gray-900/40 border-t border-gray-200 dark:border-white/5 flex justify-end items-center gap-3">
             <span className="text-xs text-gray-500 hidden sm:inline-block">Gemini 2.5 Flash</span>
             <button
              onClick={handleAnalyze}
              disabled={loading || !input}
              className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 transform active:scale-95 ${
                loading || !input
                  ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed border border-gray-300 dark:border-white/5'
                  : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg shadow-blue-500/25 border border-blue-500/20'
              }`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-3 w-3 border-2 border-white/80 border-t-transparent rounded-full"></span>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Analyze Email <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Output Section */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="glass-panel rounded-2xl flex-1 overflow-hidden shadow-2xl flex flex-col relative border-gray-200 dark:border-white/10">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-green-500 opacity-50"></div>
          
          <div className="p-5 border-b border-gray-200 dark:border-white/5 bg-white/40 dark:bg-white/5 backdrop-blur-md sticky top-0 z-10">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
              </span>
              Intelligence Report
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-6 scroll-smooth custom-scrollbar bg-gray-50/50 dark:bg-gray-900/20">
            {analysis ? (
              <div className="flex flex-col gap-6">
                {/* Visual Folder Indicator */}
                {folderConfig && (
                  <div className={`p-4 rounded-xl border flex items-center gap-4 ${folderConfig.colorClass}`}>
                    <div className="p-3 bg-white/50 dark:bg-black/20 rounded-full">
                      {folderConfig.icon}
                    </div>
                    <div>
                      <div className="text-xs opacity-80 font-semibold uppercase tracking-wider">Recommended Action</div>
                      <div className="font-bold text-lg">{folderConfig.label}</div>
                      <div className="text-sm opacity-90">{folderConfig.description}</div>
                    </div>
                  </div>
                )}
                
                {/* Markdown Content */}
                <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none prose-headings:text-gray-800 dark:prose-headings:text-gray-100 prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-li:text-gray-600 dark:prose-li:text-gray-300 prose-strong:text-gray-800 dark:prose-strong:text-white">
                  <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-gray-950/50 p-6 rounded-xl border border-gray-200 dark:border-white/5 shadow-inner">
                    {analysis}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 opacity-60 gap-4">
                 <div className="w-20 h-20 rounded-2xl bg-gray-200/50 dark:bg-gray-800/50 flex items-center justify-center border border-gray-200 dark:border-white/5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                 </div>
                 <div className="text-center">
                    <p className="font-medium text-gray-500 dark:text-gray-400">Ready to analyze</p>
                    <p className="text-sm">Content will appear here after processing</p>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailAgent;
