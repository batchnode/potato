import React from 'react';
import { Braces, Info } from 'lucide-react';

interface SchemaTabProps {
  schema: string;
  setSchema: (schema: string) => void;
}

const SchemaTab: React.FC<SchemaTabProps> = ({ schema, setSchema }) => {
  const loadDefault = () => {
    setSchema(`title: "string"
description: "string"
date: "date"
author: "string"
thumbnail: "image"
tags: "list"
categories: "list"
draft: "boolean"
layout: "string"`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 h-full flex flex-col">
      <header className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600 text-white rounded-2xl"><Braces size={24} /></div>
          <div><h3 className="font-bold text-xl text-foreground">Content Schema</h3><p className="text-sm opacity-60 text-foreground">Define your dynamic frontmatter template</p></div>
        </div>
        <button 
          onClick={loadDefault}
          className="px-4 py-2 bg-indigo-500/10 text-indigo-500 rounded-xl hover:bg-indigo-500/20 transition font-bold text-xs border border-indigo-500/20 active:scale-95"
        >
          Load Default Template
        </button>
      </header>
      <div className="flex-1 bg-slate-900 rounded-3xl p-6 relative">
        <div className="absolute top-4 right-6 text-[10px] font-bold text-slate-600 uppercase">YAML Editor</div>
        <textarea value={schema} onChange={(e) => setSchema(e.target.value)} className="w-full h-[400px] bg-transparent text-indigo-300 font-mono text-sm outline-none resize-none leading-relaxed" />
      </div>
      <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 flex gap-3 mt-6"><Info size={18} className="text-indigo-500 shrink-0" /><p className="text-[11px] text-foreground opacity-80 leading-relaxed font-medium">Changes to this schema will instantly rebuild the form fields on the Create/Edit post pages to match your framework's requirements.</p></div>
    </div>
  );
};

export default SchemaTab;
