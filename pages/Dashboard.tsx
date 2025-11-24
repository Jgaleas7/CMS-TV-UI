import React, { useState, useEffect } from 'react';
import { generateTvConfig } from '../services/tvApiGenerator';
import { getAllPages, updateBlockTitle, importJwPlaylist, getLibrary, addMediaToBlock, removeMediaFromBlock } from '../services/mockDatabase'; 
import JsonViewer from '../components/JsonViewer';
import { Layout, Smartphone, Tv, Box, Play, Edit, Wand2, Save, DownloadCloud, Loader2, ListVideo, Trash2, PlusCircle, ArrowLeft } from 'lucide-react';
import { generateCreativeMetadata } from '../services/geminiService';
import { Page, MediaItem } from '../types';

interface DashboardProps {
  onLaunchTv: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLaunchTv }) => {
  const [selectedPage, setSelectedPage] = useState<string>('home');
  const [tvConfig, setTvConfig] = useState<any>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiOutput, setAiOutput] = useState<string | null>(null);
  
  // Import State
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState<string | null>(null);

  // Editing State
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // Content Management State
  const [selectedBlockForContent, setSelectedBlockForContent] = useState<string | null>(null);
  const [selectedBlockTitle, setSelectedBlockTitle] = useState<string>('');
  const [library, setLibrary] = useState<MediaItem[]>([]);

  useEffect(() => {
    // Refresh pages list
    setPages(getAllPages());
    setLibrary(getLibrary());
    refreshConfig('home');
  }, []);

  const refreshConfig = (slug: string) => {
    try {
      const config = generateTvConfig(slug);
      setTvConfig(config);
      setSelectedPage(slug);
      setLibrary(getLibrary()); // Refresh library in case of new imports
    } catch (e) {
      console.error(e);
    }
  };

  const handleAiAssist = async () => {
    setAiLoading(true);
    const firstItem = tvConfig?.page?.sections?.[0]?.items?.[0];
    if (firstItem) {
      const desc = await generateCreativeMetadata(firstItem.title, ['Action', 'Thriller']);
      setAiOutput(`Generic AI Improvement for ${firstItem.title}: ${desc}`);
    }
    setAiLoading(false);
  };

  const handleImportJw = async () => {
      setImporting(true);
      setImportMsg(null);
      try {
          const url = 'https://cdn.jwplayer.com/v2/playlists/RmNmOuPr';
          const count = await importJwPlaylist(url);
          setImportMsg(`Success! Imported ${count} items from JWPlayer.`);
          refreshConfig(selectedPage); // Refresh to see new items potentially
      } catch (e) {
          setImportMsg("Import failed. Check console.");
      } finally {
          setImporting(false);
          // Clear message after 3s
          setTimeout(() => setImportMsg(null), 3000);
      }
  };

  const startEditing = (blockId: string, currentTitle: string) => {
    setEditingBlockId(blockId);
    setEditTitle(currentTitle);
  };

  const saveBlock = () => {
    if (editingBlockId) {
      updateBlockTitle(editingBlockId, editTitle);
      setEditingBlockId(null);
      refreshConfig(selectedPage); // Reload to see changes
    }
  };

  const manageContent = (blockId: string, title: string) => {
    setSelectedBlockForContent(blockId);
    setSelectedBlockTitle(title);
  };

  const handleAddItem = (mediaId: string) => {
    if (selectedBlockForContent) {
      addMediaToBlock(selectedBlockForContent, mediaId);
      refreshConfig(selectedPage);
    }
  };

  const handleRemoveItem = (mediaId: string) => {
    if (selectedBlockForContent) {
      removeMediaFromBlock(selectedBlockForContent, mediaId);
      refreshConfig(selectedPage);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-2 text-indigo-500 font-bold text-xl">
            <Tv className="w-6 h-6" />
            <span>StreamForge</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-4">Content</div>
          {pages.map(page => (
            <button
              key={page.id}
              onClick={() => {
                refreshConfig(page.slug);
                setSelectedBlockForContent(null);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${selectedPage === page.slug ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <Layout size={18} />
              {page.title}
            </button>
          ))}
          
           <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-8">Configuration</div>
           <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-slate-400 hover:bg-slate-800 hover:text-white">
             <Smartphone size={18} />
             Platform Rules
           </button>
           <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-slate-400 hover:bg-slate-800 hover:text-white">
             <Box size={18} />
             Blocks Library
           </button>
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-3">
          <button 
            onClick={handleImportJw}
            disabled={importing}
            className="w-full flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
          >
             {importing ? <Loader2 size={12} className="animate-spin"/> : <DownloadCloud size={12} />}
             {importing ? 'Importing...' : 'Import JW Data'}
          </button>
          <div className="text-slate-500 text-xs text-center">
            v1.5.0 | Content Editing
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur">
          <h2 className="text-xl font-semibold text-white">Page Configuration: <span className="text-indigo-400 capitalize">{selectedPage}</span></h2>
          <div className="flex gap-3">
             <button 
                onClick={handleAiAssist}
                disabled={aiLoading}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm font-medium transition-colors"
             >
               <Wand2 size={16} />
               {aiLoading ? 'Thinking...' : 'AI Optimize'}
             </button>
             <button 
                onClick={onLaunchTv}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm font-medium transition-colors shadow-lg shadow-emerald-900/20 border border-emerald-500/50"
             >
               <Play size={16} fill="white" />
               Launch TV App
             </button>
          </div>
        </header>

        <main className="flex-1 overflow-hidden p-6">
          {aiOutput && (
             <div className="mb-6 bg-purple-900/20 border border-purple-500/30 p-4 rounded-lg flex justify-between items-center text-purple-200">
               <p>{aiOutput}</p>
               <button onClick={() => setAiOutput(null)} className="text-xs underline hover:text-white">Dismiss</button>
             </div>
          )}
          
          {importMsg && (
             <div className="mb-6 bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg flex justify-between items-center text-blue-200 animate-in fade-in slide-in-from-top-2">
               <p>{importMsg}</p>
             </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            
            {/* Left Column: Visual Block Editor */}
            <div className="flex flex-col gap-4 overflow-y-auto pr-2 pb-10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium text-slate-300">Layout Blocks</h3>
                <span className="text-xs text-slate-500">Drag to reorder (coming soon)</span>
              </div>
              
              {tvConfig?.page?.sections?.map((section: any, idx: number) => (
                <div 
                  key={section.id} 
                  className={`bg-slate-900 p-4 rounded-lg border transition-all group ${selectedBlockForContent === section.id ? 'border-indigo-500 ring-1 ring-indigo-500/50' : 'border-slate-800 hover:border-slate-600'}`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-xs text-slate-500 font-mono">
                        {idx + 1}
                      </div>
                      
                      {editingBlockId === section.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input 
                            type="text" 
                            value={editTitle} 
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="bg-slate-950 border border-indigo-500 text-white px-2 py-1 rounded text-sm w-full focus:outline-none"
                            autoFocus
                          />
                          <button onClick={saveBlock} className="p-1 bg-indigo-600 rounded text-white"><Save size={14} /></button>
                        </div>
                      ) : (
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-200">{section.title}</h4>
                          <p className="text-xs text-slate-500 uppercase">{section.type} • {section.items.length} Items</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {editingBlockId !== section.id && (
                        <button 
                          onClick={() => startEditing(section.id, section.title)} 
                          className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                          title="Edit Title"
                        >
                          <Edit size={16} />
                        </button>
                      )}
                      <button 
                        onClick={() => manageContent(section.id, section.title)}
                        className={`p-2 rounded transition-colors ${selectedBlockForContent === section.id ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
                        title="Manage Content"
                      >
                        <ListVideo size={16} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Visual representation */}
                  <div className="h-24 bg-slate-950/50 rounded border border-dashed border-slate-800 flex items-center px-4 gap-2 overflow-hidden relative">
                     {section.items.slice(0, 4).map((item: any) => (
                       <div 
                        key={item.id} 
                        className="bg-slate-800 rounded flex-shrink-0 border border-slate-700 overflow-hidden relative group/item"
                        style={{
                          width: section.layout.itemWidth / 4, 
                          height: section.layout.itemHeight / 4
                        }}
                       >
                         {item.image && <img src={item.image} className="w-full h-full object-cover opacity-80" alt="" />}
                       </div>
                     ))}
                     {section.items.length === 0 && (
                       <div className="w-full text-center text-xs text-slate-600">Empty Block</div>
                     )}
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Content Editor OR JSON Viewer */}
            <div className="h-full bg-slate-900 rounded-lg border border-slate-700 overflow-hidden flex flex-col">
              {selectedBlockForContent ? (
                <>
                  <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setSelectedBlockForContent(null)}
                        className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                      >
                        <ArrowLeft size={16} />
                      </button>
                      <div>
                        <h3 className="text-sm font-bold text-white">Content Editor</h3>
                        <p className="text-xs text-slate-400">{selectedBlockTitle}</p>
                      </div>
                    </div>
                    <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded">
                      {tvConfig?.page?.sections.find((s:any) => s.id === selectedBlockForContent)?.items.length} Items
                    </span>
                  </div>
                  
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Current Items */}
                    <div className="flex-1 overflow-y-auto p-4 border-b border-slate-800">
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Active Playlist</h4>
                      <div className="space-y-2">
                        {tvConfig?.page?.sections.find((s:any) => s.id === selectedBlockForContent)?.items.map((item: any) => (
                          <div key={item.id} className="flex items-center gap-3 bg-slate-950 p-2 rounded border border-slate-800 hover:border-slate-700 group">
                            <img src={item.image} className="w-12 h-8 object-cover rounded bg-slate-800" alt="" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-slate-200 truncate">{item.title}</div>
                              <div className="text-xs text-slate-500">{item.metadata.durationStr}</div>
                            </div>
                            <button 
                              onClick={() => handleRemoveItem(item.id)}
                              className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-900/20 rounded opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                        {tvConfig?.page?.sections.find((s:any) => s.id === selectedBlockForContent)?.items.length === 0 && (
                          <div className="text-center py-8 text-slate-600 text-sm italic">
                            No items in this block. Add from library below.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Library */}
                    <div className="h-1/2 flex flex-col bg-slate-900">
                      <div className="px-4 py-2 bg-slate-800/50 border-b border-slate-800">
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Available Library</h4>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4">
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                          {library.map(item => {
                             const currentItems = tvConfig?.page?.sections.find((s:any) => s.id === selectedBlockForContent)?.items || [];
                             const isAdded = currentItems.some((i:any) => i.id === item.id);
                             
                             if (isAdded) return null;

                             return (
                              <button 
                                key={item.id}
                                onClick={() => handleAddItem(item.id)}
                                className="flex items-center gap-2 p-2 rounded hover:bg-slate-800 text-left group border border-transparent hover:border-slate-700 transition-all"
                              >
                                <div className="w-10 h-10 bg-slate-800 rounded overflow-hidden flex-shrink-0">
                                  <img src={item.poster} className="w-full h-full object-cover" alt="" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-medium text-slate-300 truncate group-hover:text-white">{item.title}</div>
                                  <div className="text-[10px] text-slate-500">{Math.floor(item.duration / 60)}m</div>
                                </div>
                                <PlusCircle size={16} className="text-slate-600 group-hover:text-emerald-400" />
                              </button>
                             );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <JsonViewer data={tvConfig} title={`Resolved JSON for: ${selectedPage}`} />
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;