import React from 'react';
import { Cloud } from 'lucide-react';

const CloudflareStep: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-4">
          <Cloud size={24} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Cloudflare Binding</h1>
        <p className="text-slate-500 mt-2">Verify your environment is ready.</p>
      </header>
      <div className="space-y-4">
        <div className="p-6 bg-orange-50 rounded-3xl border border-orange-100 text-orange-800 text-xs font-medium">
          Confirm you have created a KV namespace and bound it to "potato_kv" in Cloudflare Pages settings.
        </div>
        <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 text-blue-800 text-xs font-medium">
          Confirm you have created a D1 database and bound it to "potato_d1" in the Functions settings.
        </div>
      </div>
    </div>
  );
};

export default CloudflareStep;
