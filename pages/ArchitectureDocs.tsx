import React from 'react';

const ArchitectureDocs: React.FC = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-12 text-slate-300">
      
      <header>
        <h1 className="text-3xl font-bold text-white mb-4">StreamForge Architecture</h1>
        <p className="text-lg">This document outlines the design for the React Native + LightningJS TV implementation.</p>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">1. Hybrid Rendering Strategy</h2>
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>React Native (Root):</strong> Handles the native activity, deep links, and the video player surface (react-native-video).</li>
            <li><strong>LightningJS (Canvas):</strong> Runs inside a `WebView` or via `react-lightning` on a GL surface. It handles the high-performance UI (focus, animations, tiles).</li>
            <li><strong>Orchestration:</strong> React Native passes the JSON config (fetched from this CMS) into the Lightning instance via props or a bridge.</li>
          </ul>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">2. LightningJS Implementation (TypeScript)</h2>
        <p>Example of a Lightning component consuming our CMS "Section" JSON.</p>
        <div className="bg-black p-4 rounded-lg font-mono text-xs overflow-x-auto text-green-400 border border-slate-700">
{`import { Lightning } from '@lightningjs/sdk';
import { TvSection } from './types';

export default class Rail extends Lightning.Component {
  static _template() {
    return {
      Title: { text: { fontSize: 32, fontFace: 'Inter' } },
      List: { type: Lightning.components.ListComponent, y: 60, itemSize: 300 }
    }
  }

  set sectionData(data: TvSection) {
    this.tag('Title').text.text = data.title;
    // Map CMS items to Lightning Textures
    this.tag('List').items = data.items.map(item => ({
      type: PosterCard,
      item: item, // Pass full item data
      w: data.layout.itemWidth,
      h: data.layout.itemHeight
    }));
  }
  
  _getFocused() {
    return this.tag('List');
  }
}`}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">3. React Native Integration</h2>
        <p>How the native layer orchestrates the player and the UI.</p>
        <div className="bg-black p-4 rounded-lg font-mono text-xs overflow-x-auto text-blue-300 border border-slate-700">
{`// App.tsx (React Native)
const App = () => {
  const [config, setConfig] = useState<TvUiConfig | null>(null);
  const [videoSource, setVideoSource] = useState(null);

  // 1. Fetch CMS Config on Boot
  useEffect(() => {
    fetch('https://api.streamforge.io/ui-config?platform=tv')
      .then(res => res.json())
      .then(setConfig);
  }, []);

  // 2. Handle Action from Lightning (Bridge)
  const onLightningAction = (action: any) => {
    if (action.type === 'PLAY') {
       // React Native Video takes over z-index
       setVideoSource(action.url);
    }
  };

  return (
    <View style={{flex: 1, backgroundColor: '#000'}}>
      {videoSource && (
        <Video source={{uri: videoSource}} style={StyleSheet.absoluteFill} />
      )}
      
      {/* Lightning layer sits on top until video plays full screen */}
      <LightningView 
        config={config} 
        onAction={onLightningAction} 
        style={{opacity: videoSource ? 0 : 1}} 
      />
    </View>
  );
}`}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">4. Caching Strategy</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800 p-4 rounded border border-slate-700">
            <h3 className="font-bold text-white mb-2">Edge Cache (Cloudflare)</h3>
            <p className="text-sm">Cache `/api/ui-config` for 60 seconds. Invalidate on CMS publish events.</p>
          </div>
          <div className="bg-slate-800 p-4 rounded border border-slate-700">
             <h3 className="font-bold text-white mb-2">Device Cache</h3>
            <p className="text-sm">Persist JSON to `AsyncStorage` in React Native. Load stale config immediately on boot, then revalidate in background.</p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default ArchitectureDocs;
