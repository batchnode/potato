import React from 'react';
import { 
  Save, 
  RefreshCw, 
  Image as ImageIcon, 
  CheckCircle2, 
  History,
  Clock
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'save' | 'sync' | 'webp' | 'publish' | 'review';
  message: string;
  time: string;
}

const activityData: ActivityItem[] = [
  { id: '1', type: 'save', message: "Saved 'Potato Guide' draft", time: '5 mins ago' },
  { id: '2', type: 'sync', message: "GitHub Sync completed", time: '12 mins ago' },
  { id: '3', type: 'webp', message: "3 images optimized to WebP", time: '45 mins ago' },
  { id: '4', type: 'publish', message: "Published 'Release Notes'", time: '2 hours ago' },
  { id: '5', type: 'review', message: "New item submitted for review", time: '3 hours ago' },
];

const getIcon = (type: string) => {
  switch (type) {
    case 'save': return <Save size={14} className="text-blue-500" />;
    case 'sync': return <RefreshCw size={14} className="text-indigo-500" />;
    case 'webp': return <ImageIcon size={14} className="text-emerald-500" />;
    case 'publish': return <CheckCircle2 size={14} className="text-purple-500" />;
    case 'review': return <Clock size={14} className="text-amber-500" />;
    default: return <History size={14} className="text-foreground/40" />;
  }
};

const ActivityFeed: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 flex items-center gap-2">
          <History size={12} /> Live Activity
        </h3>
        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
      </div>

      <div className="space-y-4">
        {activityData.map((item) => (
          <div key={item.id} className="group relative flex gap-4 pl-2">
            {/* Timeline Line */}
            <div className="absolute left-[1.125rem] top-8 bottom-0 w-px bg-foreground/5 group-last:hidden" />
            
            <div className="relative z-10 w-8 h-8 rounded-xl bg-card border border-border flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
              {getIcon(item.type)}
            </div>
            
            <div className="flex-1 pt-1">
              <p className="text-xs font-bold text-foreground/80 group-hover:text-indigo-600 transition-colors">{item.message}</p>
              <p className="text-[10px] font-medium text-foreground/30 mt-0.5">{item.time}</p>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full py-3 px-4 rounded-2xl bg-foreground/5 hover:bg-foreground/10 text-[10px] font-black uppercase tracking-widest text-foreground/40 transition-colors">
        View Full Audit Log
      </button>
    </div>
  );
};

export default ActivityFeed;
