import React from 'react';
import { RefreshCw, History, X } from 'lucide-react';
import { useDashboardLogic } from './Dashboard/hooks/useDashboardLogic';
import PreviewModal from './PreviewModal';
import LoadingScreen from './LoadingScreen';
import DashboardBento from './Dashboard/components/DashboardBento';
import ActivityFeed from '../pages/Workbench/components/ActivityFeed';
import { cn } from '../utils/cn';

const Dashboard: React.FC = () => {
  const {
    user,
    config,
    files,
    drafts,
    reviewItems,
    editorsCount,
    mediaCount,
    infraStats,
    loading,
    error,
    refresh,
    preview,
    setPreview,
    displayRole
  } = useDashboardLogic();
  
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  // Listen for bottom nav toggle if we implement it for dashboard too
  React.useEffect(() => {
    const handlePotatoAction = (e: any) => {
      if (e.detail === 'toggle-explorer') {
        setIsSidebarOpen(prev => !prev);
      }
    };
    window.addEventListener('potato-action', handlePotatoAction);
    return () => window.removeEventListener('potato-action', handlePotatoAction);
  }, []);

  if (loading) return <LoadingScreen />;
  if (!user) return null;

  return (
    <main className="flex-1 overflow-hidden flex flex-col h-full bg-background relative font-sans transition-colors duration-300">
      <PreviewModal
        {...preview}
        onClose={() => setPreview({ ...preview, isOpen: false })}
        repo={config.repo!}
        pat={config.pat!}
        branch={config.branch!}
      />

      <header className="bg-header border-b border-sidebar-border px-6 py-4 flex justify-between items-center shrink-0 z-10 transition-colors duration-300">
        <div>
          <h1 className="text-xl font-bold text-foreground leading-tight">Instance Overview</h1>
          <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mt-1">System status & Global Metrics</p>
        </div>
        <div className="flex items-center gap-2 text-foreground/40">
           <span className="text-[10px] font-black uppercase tracking-widest bg-foreground/5 px-2 py-1 rounded-lg border border-border">{displayRole} Mode</span>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar bg-background">
          <div className="max-w-6xl mx-auto space-y-10 pb-24">
            
            <DashboardBento 
              filesCount={files.length}
              draftsCount={drafts.length}
              reviewCount={reviewItems.length}
              editorsCount={editorsCount}
              mediaCount={mediaCount}
              branch={config.branch || 'main'}
              infraStats={infraStats}
            />

            {error && (
              <div className="mx-2 p-6 bg-amber-500/10 text-amber-500 rounded-[2rem] border border-amber-500/20 space-y-3">
                <p className="text-sm opacity-90 font-mono">{error}</p>
                <button
                  onClick={refresh}
                  className="flex items-center gap-2 text-xs font-bold bg-amber-500/20 px-4 py-2 rounded-xl hover:bg-amber-500/30 transition"
                >
                  <RefreshCw size={14} /> Retry Sync
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Standardized Sidebar for Activity */}
        <div className={cn(
          "lg:w-1/3 lg:border-l lg:border-border bg-card overflow-y-auto transition-all duration-300",
          isSidebarOpen ? "fixed inset-0 z-50 p-6" : "hidden lg:block"
        )}>
          <div className="flex items-center justify-between mb-8 sticky top-0 bg-card/90 backdrop-blur-sm py-4 px-6 z-10 border-b border-border lg:border-none">
            <div className="flex items-center gap-2 text-foreground/40">
              <History size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Instance Activity</span>
            </div>
            {isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(false)} 
                className="p-2 bg-foreground/5 rounded-xl text-foreground/60"
              >
                <X size={20} />
              </button>
            )}
          </div>
          
          <div className="px-6 pb-24">
             <div className="animate-in fade-in duration-500">
                <ActivityFeed />
             </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;