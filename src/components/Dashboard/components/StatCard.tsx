import React from 'react';
import { cn } from '../../../utils/cn';

interface StatCardProps {
  title: string;
  value: string;
  highlight?: boolean;
  status?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, highlight, status }) => (
  <div className={cn(
    "p-5 md:p-6 rounded-3xl border transition-all duration-300 hover:shadow-md",
    highlight ? 'bg-amber-500/10 border-amber-500/20 shadow-amber-500/5' : 'bg-card border-border shadow-sm'
  )}>
    <p className={cn(
      "text-[9px] md:text-[10px] font-bold uppercase tracking-widest mb-2 truncate",
      highlight ? 'text-amber-500' : 'text-foreground/40'
    )}>{title}</p>
    {status ? (
      <h2 className="text-xs md:text-sm font-bold text-foreground flex items-center gap-2 mt-2 truncate">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shrink-0"></span> {value}
      </h2>
    ) : (
      <h2 className={cn(
        "text-xl md:text-3xl font-black truncate",
        highlight ? 'text-amber-500' : 'text-foreground'
      )}>{value}</h2>
    )}
  </div>
);

export default StatCard;
