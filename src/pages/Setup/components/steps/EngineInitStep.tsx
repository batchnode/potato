import React, { useState } from 'react';
import { Cpu, CheckCircle2, Loader2, Database, HardDrive, Shield } from 'lucide-react';

interface EngineInitStepProps {
  onComplete: () => void;
}

interface InitResult {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  icon: React.ReactNode;
}

const EngineInitStep: React.FC<EngineInitStepProps> = ({ onComplete }) => {
  const [results, setResults] = useState<InitResult[]>([
    { name: 'D1 Table: users', status: 'pending', icon: <Database size={16} /> },
    { name: 'D1 Table: posts', status: 'pending', icon: <Database size={16} /> },
    { name: 'D1 Table: media', status: 'pending', icon: <Database size={16} /> },
    { name: 'D1 Table: work_in_progress', status: 'pending', icon: <Database size={16} /> },
    { name: 'KV: Storage Ready', status: 'pending', icon: <HardDrive size={16} /> },
    { name: 'RBAC: Default Permissions', status: 'pending', icon: <Shield size={16} /> },
  ]);

  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);

  const startInitialization = async () => {
    setStarted(true);
    
    try {
      const response = await fetch('/api/initialize_engine', { method: 'POST' });
      if (!response.ok) throw new Error('Initialization failed');
      
      // Simulate ticking off for UI effect
      for (let i = 0; i < results.length; i++) {
        setResults(prev => prev.map((item, idx) => 
          idx === i ? { ...item, status: 'running' } : item
        ));
        await new Promise(resolve => setTimeout(resolve, 600));
        setResults(prev => prev.map((item, idx) => 
          idx === i ? { ...item, status: 'success' } : item
        ));
      }
      
      setDone(true);
      setTimeout(onComplete, 1000);
    } catch (err) {
      setResults(prev => prev.map(item => ({ ...item, status: 'error' })));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="text-center space-y-3">
        <div className="w-20 h-20 bg-indigo-600 text-white rounded-[2.5rem] flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/20 mb-6">
          <Cpu size={40} />
        </div>
        <h2 className="text-3xl font-black text-foreground italic uppercase tracking-tight">Load Potato Engine</h2>
        <p className="text-foreground/40 max-w-sm mx-auto font-medium">Preparing your high-performance edge infrastructure.</p>
      </div>

      <div className="bg-card/50 rounded-[2.5rem] border border-border p-8 space-y-4 max-w-md mx-auto">
        {results.map((res, i) => (
          <div key={i} className="flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-xl transition-colors ${
                res.status === 'success' ? 'bg-green-500/10 text-green-500' : 
                res.status === 'running' ? 'bg-indigo-500/10 text-indigo-500' :
                'bg-foreground/5 text-foreground/40'
              }`}>
                {res.icon}
              </div>
              <span className={`text-sm font-bold transition-colors ${
                res.status === 'success' ? 'text-foreground' : 'text-foreground/40'
              }`}>
                {res.name}
              </span>
            </div>
            {res.status === 'success' ? (
              <CheckCircle2 size={18} className="text-green-500 animate-in zoom-in" />
            ) : res.status === 'running' ? (
              <Loader2 size={18} className="text-indigo-500 animate-spin" />
            ) : null}
          </div>
        ))}
      </div>

      {!started && (
        <button
          onClick={startInitialization}
          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/20 active:scale-[0.98]"
        >
          Initialize Infrastructure
        </button>
      )}

      {done && (
        <div className="text-center text-green-500 font-bold animate-pulse">
          Engine Loaded Successfully!
        </div>
      )}
    </div>
  );
};

export default EngineInitStep;
