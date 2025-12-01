import React, { useState, useEffect } from 'react';
import { AppView } from './types';
import EmailAgent from './components/EmailAgent';
import ImageEditor from './components/ImageEditor';
import VoiceAssistant from './components/VoiceAssistant';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.EMAIL_AGENT);
  
  // Initialize theme from localStorage or default to 'dark'
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return (saved as 'light' | 'dark') || 'dark';
    }
    return 'dark';
  });

  // Apply theme to html element
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.EMAIL_AGENT:
        return <EmailAgent />;
      case AppView.IMAGE_EDITOR:
        return <ImageEditor />;
      case AppView.VOICE_ASSISTANT:
        return <VoiceAssistant />;
      default:
        return <div>Select a feature</div>;
    }
  };

  const NavItem = ({ view, label, icon, description }: { view: AppView; label: string; icon: React.ReactNode; description: string }) => {
    const isActive = currentView === view;
    return (
      <button
        onClick={() => setCurrentView(view)}
        className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
          isActive
            ? 'bg-gradient-to-r from-blue-600/10 to-indigo-600/10 dark:from-blue-600/20 dark:to-indigo-600/20 border border-blue-500/30'
            : 'hover:bg-black/5 dark:hover:bg-white/5 border border-transparent'
        }`}
      >
        <div className="flex items-center gap-3 relative z-10">
          <div className={`p-2 rounded-lg transition-colors ${isActive ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white group-hover:bg-gray-300 dark:group-hover:bg-gray-700'}`}>
            {icon}
          </div>
          <div>
            <div className={`font-semibold text-sm ${isActive ? 'text-blue-600 dark:text-white' : 'text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white'}`}>{label}</div>
            <div className={`text-xs ${isActive ? 'text-blue-500 dark:text-blue-200' : 'text-gray-400 dark:text-gray-500'} hidden lg:block`}>{description}</div>
          </div>
        </div>
        {isActive && <div className="absolute right-0 top-0 h-full w-1 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>}
      </button>
    );
  };

  return (
    <div className={`flex h-screen w-full transition-colors duration-500 font-sans
      ${theme === 'dark' 
        ? 'bg-[#0a0a0c] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-[#050505] to-black text-gray-100' 
        : 'bg-[#f8fafc] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-white to-purple-50 text-gray-900'
      }`}>
      
      {/* Sidebar */}
      <aside className="w-20 lg:w-72 glass-panel border-r-0 border-r border-gray-200 dark:border-white/5 flex flex-col p-4 shrink-0 z-20 transition-all duration-300">
        <div className="flex items-center gap-3 px-2 mb-10 mt-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" /></svg>
          </div>
          <div className="hidden lg:block">
            <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 tracking-tight">
              Gemini Omni
            </h1>
            <p className="text-xs text-gray-500 font-medium tracking-wide">WORKSPACE</p>
          </div>
        </div>

        <nav className="flex-1 space-y-3">
          <NavItem 
            view={AppView.EMAIL_AGENT} 
            label="Email Agent" 
            description="Process & categorize"
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>} 
          />
          <NavItem 
            view={AppView.IMAGE_EDITOR} 
            label="Image Editor" 
            description="Edit with language"
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>} 
          />
          <NavItem 
            view={AppView.VOICE_ASSISTANT} 
            label="Live Voice" 
            description="Real-time conversation"
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="23"/><line x1="8" x2="16" y1="23" y2="23"/></svg>} 
          />
        </nav>

        <div className="mt-auto space-y-4">
           {/* Theme Toggle */}
           <button 
             onClick={toggleTheme}
             className="w-full flex items-center justify-between p-3 rounded-xl glass-button text-xs font-medium uppercase tracking-wider group relative"
           >
              <div className="flex items-center gap-3">
                 <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${theme === 'dark' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-orange-500/20 text-orange-500'}`}>
                    {theme === 'dark' ? (
                       <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                    ) : (
                       <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
                    )}
                 </div>
                 <span className="text-gray-500 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200 lg:block hidden">
                   {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                 </span>
              </div>

              <div className={`w-9 h-5 rounded-full relative transition-colors duration-300 ${theme === 'dark' ? 'bg-indigo-600' : 'bg-gray-300'} lg:block hidden`}>
                  <div className={`absolute top-1 w-3 h-3 rounded-full bg-white shadow-sm transition-all duration-300 ${theme === 'dark' ? 'left-5' : 'left-1'}`}></div>
              </div>
           </button>

           <div className="glass-panel rounded-xl p-4 border border-gray-200 dark:border-white/5 hidden lg:block relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
              </div>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mb-2">System Status</p>
              <div className="flex items-center gap-2">
                 <div className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </div>
                 <span className="text-xs text-gray-700 dark:text-gray-200 font-medium">Gemini 2.5 Active</span>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
         <div className="h-full w-full max-w-[1600px] mx-auto">
            {renderContent()}
         </div>
      </main>
    </div>
  );
};

export default App;