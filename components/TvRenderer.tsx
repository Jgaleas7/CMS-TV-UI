import React, { useEffect, useRef } from 'react';
import { TvSection, TvMediaItem, NavigationItem } from '../types';
import { Play, Info, Home, Film, Tv, Settings, Search, Menu } from 'lucide-react';

// Declare Shaka on window
declare global {
  interface Window {
    shaka: any;
  }
}

// --- Types ---

interface TvComponentProps {
  section: TvSection;
  isSectionFocused: boolean;
  focusedItemIndex: number;
}

// --- Helper for Icons ---
const getIconForLabel = (label: string) => {
  const l = label.toLowerCase();
  if (l.includes('home')) return <Home size={24} />;
  if (l.includes('movie')) return <Film size={24} />;
  if (l.includes('series') || l.includes('tv')) return <Tv size={24} />;
  if (l.includes('setting')) return <Settings size={24} />;
  if (l.includes('search')) return <Search size={24} />;
  return <Menu size={24} />;
};

// --- Components ---

export const TvSidebar: React.FC<{ 
  items: NavigationItem[]; 
  isOpen: boolean; // Is the Sidebar focused?
  focusedIndex: number; // Which menu item is focused?
  activeTarget: string; // Which page is currently loaded?
}> = ({ items, isOpen, focusedIndex, activeTarget }) => {
  return (
    <div 
      className={`h-full fixed left-0 top-0 z-40 flex flex-col bg-slate-900/95 border-r border-white/10 backdrop-blur-xl transition-all duration-300 ease-out ${isOpen ? 'w-72 shadow-2xl' : 'w-24'}`}
    >
      <div className="p-6 mb-8 flex items-center justify-center">
        <div className={`w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center transition-transform ${isOpen ? 'scale-110' : ''}`}>
           <Play fill="white" className="ml-1" size={20} />
        </div>
        <span className={`ml-3 font-bold text-xl text-white transition-opacity duration-200 ${isOpen ? 'opacity-100 delay-100' : 'opacity-0 hidden'}`}>
          StreamForge
        </span>
      </div>

      <div className="flex-1 flex flex-col gap-2 px-4">
        {items.map((item, idx) => {
          const isFocused = isOpen && idx === focusedIndex;
          const isActive = item.target === activeTarget; // Current page
          
          return (
            <div 
              key={item.id}
              className={`
                relative flex items-center px-4 py-4 rounded-xl transition-all duration-200
                ${isFocused ? 'bg-white text-slate-900 scale-105 shadow-lg z-10' : 'text-slate-400 hover:bg-white/5'}
                ${isActive && !isFocused ? 'text-white bg-white/10' : ''}
              `}
            >
              {/* Active Indicator Dot */}
              {isActive && !isFocused && (
                <div className="absolute left-1 w-1 h-8 bg-indigo-500 rounded-full" />
              )}

              <span className={`transition-transform duration-200 ${isFocused ? 'scale-110' : ''}`}>
                {getIconForLabel(item.label)}
              </span>
              
              <span className={`ml-4 font-medium whitespace-nowrap text-lg transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
      
      <div className="p-6 text-center">
         <div className={`w-10 h-10 rounded-full border-2 border-slate-600 mx-auto bg-slate-800 ${isOpen ? 'mb-2' : ''}`} />
         <span className={`text-sm text-slate-500 ${isOpen ? 'block' : 'hidden'}`}>Demo User</span>
      </div>
    </div>
  );
};

export const TvPlayer: React.FC<{ item: TvMediaItem, onClose: () => void }> = ({ item, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    const initPlayer = async () => {
      if (!videoRef.current || !window.shaka) return;

      // Install polyfills
      window.shaka.polyfill.installAll();

      if (window.shaka.Player.isBrowserSupported()) {
        const player = new window.shaka.Player(videoRef.current);
        playerRef.current = player;

        // Error handler
        player.addEventListener('error', (e: any) => {
           const error = e.detail;
           console.error('Shaka Player Error Event:', error);
        });

        try {
          if (!item.streamUrl) {
             console.error("No stream URL provided for item:", item);
             throw new Error("Missing Stream URL");
          }
          console.log('Initializing playback for:', item.streamUrl);
          await player.load(item.streamUrl);
          
          // Safely attempt autoplay
          try {
            await videoRef.current.play();
          } catch (playErr) {
            console.warn("Autoplay prevented by browser policy:", playErr);
          }
          
        } catch (e: any) {
          console.error('Error loading video:', e);
          if (e.code) {
             console.error(`Shaka Error Code: ${e.code} (${e.category})`);
             console.error(`Error Details:`, e.data);
          }
        }
      } else {
        console.error('Browser not supported for Shaka Player');
      }
    };

    initPlayer();

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [item.streamUrl]);

  return (
    <div ref={containerRef} className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
      <video 
        ref={videoRef} 
        className="w-full h-full" 
        autoPlay 
        controls={true} 
        style={{ width: '100%', height: '100%' }}
      />
      <div className="absolute top-0 left-0 w-full p-12 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <h2 className="text-3xl font-bold text-white">{item.title}</h2>
        <p className="text-slate-300">{item.metadata.year}</p>
      </div>
      <button 
        onClick={onClose}
        className="absolute top-8 right-8 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded backdrop-blur-md z-[110]"
      >
        Close (ESC)
      </button>
    </div>
  );
};

export const TvHero: React.FC<TvComponentProps> = ({ section, isSectionFocused, focusedItemIndex }) => {
  // Safely get the active item.
  const activeIndex = (isSectionFocused && focusedItemIndex < section.items.length) 
    ? focusedItemIndex 
    : 0;

  const item = section.items[activeIndex];
  if (!item) return null;

  return (
    <div className="w-full px-[60px] mb-12 pt-4">
        <div 
        className={`relative w-full h-[550px] transition-all duration-500 rounded-2xl overflow-hidden shadow-2xl ${isSectionFocused ? 'ring-4 ring-white scale-[1.01] z-10' : 'opacity-90'}`}
        >
        {/* Background Image with Crossfade Key */}
        <div 
            key={item.id}
            className="absolute inset-0 w-full h-full bg-cover bg-center animate-fade-in"
            style={{ backgroundImage: `url(${item.image})` }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent flex flex-col justify-end p-16">
            <div key={`content-${item.id}`} className="max-w-3xl animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
                <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded shadow-lg tracking-wider">FEATURED</span>
                {item.metadata.badges.map(badge => (
                    <span key={badge} className="bg-white/20 backdrop-blur text-white text-xs font-semibold px-3 py-1 rounded">
                        {badge}
                    </span>
                ))}
            </div>
            
            <h1 className="text-6xl font-black text-white mb-4 drop-shadow-2xl leading-tight">{item.title}</h1>
            
            <div className="flex items-center gap-4 text-slate-300 text-lg mb-8 font-medium">
                <span>{item.metadata.year}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                <span>{item.metadata.durationStr}</span>
            </div>
            
            <div className="flex gap-4">
                <button className={`flex items-center gap-3 px-8 py-4 bg-white text-black font-bold rounded-lg text-xl transition-all duration-300 ${isSectionFocused ? 'scale-105 shadow-xl shadow-white/20' : ''}`}>
                <Play fill="black" size={24} /> 
                <span>Play Now</span>
                </button>
                <button className="flex items-center gap-3 px-8 py-4 bg-slate-800/80 hover:bg-slate-700 text-white font-bold rounded-lg text-xl backdrop-blur-md border border-white/10 transition-colors">
                <Info size={24} /> 
                <span>Details</span>
                </button>
            </div>
            </div>

            {/* Carousel Indicators */}
            {section.items.length > 1 && (
            <div className="absolute bottom-12 right-12 flex gap-3">
                {section.items.map((_, idx) => (
                <div 
                    key={idx}
                    className={`h-2 rounded-full transition-all duration-500 shadow-sm ${idx === activeIndex ? 'w-8 bg-white' : 'w-2 bg-white/40'}`}
                />
                ))}
            </div>
            )}
        </div>
        </div>
    </div>
  );
};

export const TvCard: React.FC<{ item: TvMediaItem, focused: boolean, width: number, height: number }> = ({ item, focused, width, height }) => {
  return (
    <div 
      className={`relative flex-shrink-0 tv-focus-ring transition-all duration-300 ease-out ${focused ? 'focused z-10 scale-105' : 'scale-100 opacity-70'}`}
      style={{ width, height }}
    >
      <div className={`w-full h-full rounded-xl overflow-hidden bg-slate-800 shadow-lg border-2 ${focused ? 'border-white' : 'border-transparent'}`}>
        <img src={item.image} className="w-full h-full object-cover" alt={item.title} />
        {focused && (
           <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
             {/* Optional Overlay Icon */}
           </div>
        )}
      </div>
      <div className={`mt-3 px-1 transition-all duration-300 ${focused ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-2'}`}>
        <p className="text-white font-bold text-lg truncate leading-tight drop-shadow-md">{item.title}</p>
        <p className="text-slate-400 text-xs font-medium mt-1">{item.metadata.year} • {item.metadata.durationStr}</p>
      </div>
    </div>
  );
};

export const TvRail: React.FC<TvComponentProps> = ({ section, isSectionFocused, focusedItemIndex }) => {
  const itemWidth = section.layout.itemWidth;
  const itemHeight = section.layout.itemHeight;
  const gap = section.layout.gap;
  const containerPadding = 60; // Align content with Hero padding

  // Calculate shift: Negative translation to move items LEFT so focused item is at "containerPadding"
  // When focusedItemIndex is 0, shift is 0.
  // When focusedItemIndex is 1, shift is (width + gap).
  const shift = isSectionFocused 
    ? Math.max(0, focusedItemIndex * (itemWidth + gap)) 
    : 0; // Reset to start when not focused (optional, but cleaner for browsing)

  return (
    <div className="mb-10">
      <h3 className={`text-2xl font-bold mb-5 ml-[60px] transition-colors duration-300 ${isSectionFocused ? 'text-indigo-400 translate-x-2' : 'text-slate-500'}`}>
        {section.title}
      </h3>
      
      <div className="w-full overflow-hidden py-4">
        <div 
            className="flex transition-transform duration-500 cubic-bezier(0.2, 0.0, 0.2, 1)" // Smooth easing
            style={{ 
                transform: `translate3d(-${shift}px, 0, 0)`, 
                paddingLeft: `${containerPadding}px`, // Initial offset
                gap: `${gap}px` 
            }}
        >
            {section.items.map((item, idx) => (
            <TvCard 
                key={item.id} 
                item={item} 
                focused={isSectionFocused && idx === focusedItemIndex}
                width={itemWidth}
                height={itemHeight}
            />
            ))}
            {/* Spacer to allow last item to be focused comfortably */}
            <div style={{ width: 800, flexShrink: 0 }} />
        </div>
      </div>
    </div>
  );
};