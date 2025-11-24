import React, { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import ArchitectureDocs from './pages/ArchitectureDocs';
import TvApp from './pages/TvApp';
import { BookOpen, LayoutDashboard, Tv } from 'lucide-react';
import { importJwPlaylist } from './services/mockDatabase';

export default function App() {
  const [view, setView] = useState<'dashboard' | 'docs' | 'tv'>('dashboard');

  // Auto-load JW Player data on boot so the TV app is populated
  useEffect(() => {
    const JW_URL = 'https://cdn.jwplayer.com/v2/playlists/RmNmOuPr';
    importJwPlaylist(JW_URL)
      .then(count => console.log(`[App] Auto-imported ${count} items from JW Player`))
      .catch(err => console.warn("[App] Auto-import failed (offline?):", err));
  }, []);

  if (view === 'tv') {
    return <TvApp />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Top utility bar */}
      <div className="h-10 bg-black border-b border-slate-800 flex items-center justify-center gap-6 text-xs sticky top-0 z-50">
        <button 
          onClick={() => setView('dashboard')}
          className={`flex items-center gap-2 px-3 py-1 rounded ${view === 'dashboard' ? 'bg-indigo-900 text-indigo-200' : 'text-slate-400 hover:text-white'}`}
        >
          <LayoutDashboard size={14} /> CMS Demo
        </button>
        <button 
          onClick={() => setView('docs')}
          className={`flex items-center gap-2 px-3 py-1 rounded ${view === 'docs' ? 'bg-indigo-900 text-indigo-200' : 'text-slate-400 hover:text-white'}`}
        >
          <BookOpen size={14} /> Design & Architecture
        </button>
         <button 
          onClick={() => setView('tv')}
          className="flex items-center gap-2 px-3 py-1 rounded text-slate-400 hover:text-white"
        >
          <Tv size={14} /> Preview TV App
        </button>
      </div>

      {view === 'dashboard' ? (
        <Dashboard onLaunchTv={() => setView('tv')} />
      ) : (
        <ArchitectureDocs />
      )}
    </div>
  );
}