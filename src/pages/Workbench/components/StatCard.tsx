import React from 'react';
import { cn } from '../../../utils/cn';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
  bgColor: string;
  isText?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color, bgColor, isText }) => (
  <div className="bg-card rounded-2xl border border-border p-6 space-y-3 hover:shadow-lg transition">
    <div className={cn("p-3 rounded-xl w-fit", bgColor, color)}>
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40">{label}</p>
      <p className={cn("text-2xl font-black", isText ? 'text-foreground/60 text-base' : 'text-foreground')}>{value}</p>
    </div>
  </div>
);

export default StatCard;
