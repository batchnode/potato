import React from 'react';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface RepoItemProps {
  name: string;
  active?: boolean;
  icon: React.ReactNode;
}

const RepoItem: React.FC<RepoItemProps> = ({ name, active, icon }) => (
  <div className={cn(
    "flex items-center justify-between p-4 rounded-2xl border transition cursor-pointer",
    active ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200'
  )}>
    <div className="flex items-center gap-3">
      <div className={cn(
        "p-1.5 rounded-lg",
        active ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'
      )}>{icon}</div>
      <span className="text-xs font-bold">{name}</span>
    </div>
    {active ? <CheckCircle2 size={16} /> : <ChevronRight size={16} className="text-slate-300" />}
  </div>
);

export default RepoItem;
