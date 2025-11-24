import React, { useEffect, useState, useCallback } from 'react';
import { generateTvConfig } from '../services/tvApiGenerator';
import { TvUiConfig, BlockType, TvMediaItem } from '../types';
import { TvHero, TvRail, TvPlayer, TvSidebar } from '../components/TvRenderer';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

type FocusZone = 'MENU' | 'CONTENT';

const TvApp: React.FC = () => {
  const [config, setConfig] = useState<TvUiConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Focus Zones
  const [focusZone, setFocusZone] = useState<FocusZone>('CONTENT');
  
  // Menu State
  const [activeMenuIndex, setActiveMenuIndex] = useState(0);
  const [currentPageSlug, setCurrentPageSlug] = useState('home');

  // Content State
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [activeItemIndices, setActiveItemIndices] = useState<number[]>([]); 
  
  // Playback State
  const [playingItem, setPlayingItem] = useState<TvMediaItem | null>(null);

  const loadConfig = useCallback((slug: string) => {
    setLoading(true);
    setError(null);
    
    // Simulate Network Latency
    setTimeout(() => {
      try {
        console.log(`TvApp: Loading config for page '${slug}'...`);
        const data = generateTvConfig(slug);
        if (!data) throw new Error("Received empty config");
        
        setConfig(data);
        setCurrentPageSlug(slug);
        
        // Reset content focus
        setActiveSectionIndex(0);
        setActiveItemIndices(new Array(data.page.sections.length).fill(0));
        
        // Determine active menu index based on current page slug
        const menuIdx = data.navigation.findIndex(n => n.target === slug);
        if (menuIdx !== -1) setActiveMenuIndex(menuIdx);

      } catch (e: any) {
        console.error("TvApp Error:", e);
        setError(e.message || "Failed to load TV Config");
      } finally {
        setLoading(false);
      }
    }, 500);
  }, []);

  useEffect(() => {
    loadConfig('home');
  }, [loadConfig]);

  // --- Spatial Navigation Logic ---
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!config) return;

    // 1. Player Mode
    if (playingItem) {
        if (e.key === 'Escape' || e.key === 'Backspace') {
            setPlayingItem(null);
            e.preventDefault();
        }
        return;
    }

    // 2. Menu Zone
    if (focusZone === 'MENU') {
      if (e.key === 'ArrowUp') {
        setActiveMenuIndex(prev => Math.max(0, prev - 1));
        e.preventDefault();
      } 
      else if (e.key === 'ArrowDown') {
        setActiveMenuIndex(prev => Math.min(config.navigation.length - 1, prev + 1));
        e.preventDefault();
      } 
      else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        // If entering, we might want to load the page
        if (e.key === 'Enter') {
           const target = config.navigation[activeMenuIndex].target;
           if (target !== currentPageSlug) {
             loadConfig(target);
             setFocusZone('CONTENT'); // Move focus to content after load
           } else {
             setFocusZone('CONTENT'); // Just close menu
           }
        } else {
           // Arrow Right just closes menu without nav
           setFocusZone('CONTENT');
        }
        e.preventDefault();
      }
      return;
    }

    // 3. Content Zone
    if (e.key === 'ArrowUp') {
      setActiveSectionIndex(prev => Math.max(0, prev - 1));
      e.preventDefault();
    } 
    else if (e.key === 'ArrowDown') {
      setActiveSectionIndex(prev => Math.min(config.page.sections.length - 1, prev + 1));
      e.preventDefault();
    } 
    else if (e.key === 'ArrowLeft') {
      const currentItemIdx = activeItemIndices[activeSectionIndex] || 0;
      
      if (currentItemIdx === 0) {
        // Leftmost item -> Switch to Menu
        setFocusZone('MENU');
      } else {
        setActiveItemIndices(prev => {
          const newIndices = [...prev];
          newIndices[activeSectionIndex] = Math.max(0, currentItemIdx - 1);
          return newIndices;
        });
      }
      e.preventDefault();
    } 
    else if (e.key === 'ArrowRight') {
      setActiveItemIndices(prev => {
        const currentSection = config.page.sections[activeSectionIndex];
        const maxIndex = currentSection.items.length - 1;
        const newIndices = [...prev];
        const currentIndex = newIndices[activeSectionIndex] || 0;
        newIndices[activeSectionIndex] = Math.min(maxIndex, currentIndex + 1);
        return newIndices;
      });
      e.preventDefault();
    }
    else if (e.key === 'Enter') {
      const idx = activeItemIndices[activeSectionIndex] || 0;
      const item = config.page.sections[activeSectionIndex].items[idx];
      if (item) {
          setPlayingItem(item);
      }
    }
    else if (e.key === 'Escape' || e.key === 'Backspace') {
        // Back to Menu
        setFocusZone('MENU');
    }
  }, [config, focusZone, activeMenuIndex, activeSectionIndex, activeItemIndices, playingItem, currentPageSlug, loadConfig]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);


  if (loading) {
    return (
      <div className="w-full h-screen bg-slate-950 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
        <p className="text-slate-400">Loading StreamForge TV...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-6" />
        <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
        <p className="text-slate-400 mb-8 max-w-md">{error}</p>
        <button 
          onClick={() => loadConfig('home')}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-semibold"
        >
          <RefreshCw size={18} /> Retry Home
        </button>
      </div>
    );
  }

  if (!config) return null;

  if (playingItem) {
      return <TvPlayer item={playingItem} onClose={() => setPlayingItem(null)} />;
  }

  // Visual offsets for focus
  const translateY = activeSectionIndex === 0 ? 0 : -(activeSectionIndex * 380) + 120; // Adjusted for new layout
  
  // Layout Calculation: Use PADDING instead of MARGIN to prevent overflow
  // Sidebar collapsed = 96px (w-24) -> padding-left: 28 (7rem = 112px roughly to clear)
  // Sidebar open = 288px (w-72) -> padding-left: 80 (20rem = 320px)
  const contentPadding = focusZone === 'MENU' ? 'pl-80 opacity-60 scale-95 origin-left' : 'pl-28 opacity-100 scale-100 origin-left';

  return (
    <div className="w-full h-screen bg-[#0f172a] text-slate-100 overflow-hidden relative font-sans flex">
      
      {/* Navigation Sidebar */}
      <TvSidebar 
        items={config.navigation} 
        isOpen={focusZone === 'MENU'} 
        focusedIndex={activeMenuIndex} 
        activeTarget={currentPageSlug}
      />

      {/* Main Content Layer */}
      <div className={`w-full h-full relative transition-all duration-500 ease-out ${contentPadding}`}>
        
        {/* Top Overlay */}
        <div className="absolute top-8 right-8 z-50 flex gap-4 text-slate-400 text-sm font-medium opacity-70">
          <span>{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          <span>Wi-Fi</span>
          <span>Guest</span>
        </div>

        <div className="absolute top-8 left-8 z-50">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
             <span className="border border-slate-600 px-2 py-0.5 rounded text-xs bg-slate-900">ESC</span> to Menu
          </div>
        </div>

        {/* Scroll Container */}
        <div 
          className="w-full h-full transition-transform duration-500 cubic-bezier(0.25, 0.46, 0.45, 0.94) will-change-transform pt-16"
          style={{ transform: `translateY(${translateY}px)` }}
        >
          {config.page.sections.map((section, idx) => {
            // Only focus content if we are in CONTENT zone
            const isFocused = focusZone === 'CONTENT' && idx === activeSectionIndex;
            const focusedItemIdx = activeItemIndices[idx] || 0;
            
            if (section.type === BlockType.HERO) {
              return (
                <TvHero 
                  key={section.id} 
                  section={section} 
                  isSectionFocused={isFocused} 
                  focusedItemIndex={focusedItemIdx} 
                />
              );
            }

            return (
              <TvRail 
                key={section.id} 
                section={section} 
                isSectionFocused={isFocused} 
                focusedItemIndex={focusedItemIdx}
              />
            );
          })}
          
          <div className="h-[600px]" />
        </div>
      </div>
    </div>
  );
};

export default TvApp;