import React from 'react';

interface JsonViewerProps {
  data: any;
  title: string;
}

const JsonViewer: React.FC<JsonViewerProps> = ({ data, title }) => {
  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-lg overflow-hidden border border-slate-700 shadow-xl">
      <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex justify-between items-center">
        <h3 className="text-sm font-semibold text-slate-200 font-mono">{title}</h3>
        <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">GET /api/ui-config</span>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <pre className="text-xs font-mono text-blue-300 leading-relaxed">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default JsonViewer;