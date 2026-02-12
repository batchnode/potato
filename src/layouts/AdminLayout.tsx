import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Toast from '../components/Toast';
import BottomNav from '../components/BottomNav';

interface AdminLayoutProps {
  children: React.ReactNode;
  isSidebarOpen: boolean;
  onCloseSidebar: () => void;
  onOpenSidebar: () => void;
  welcomeToast: boolean;
  onCloseWelcomeToast: () => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  isSidebarOpen,
  onCloseSidebar,
  onOpenSidebar,
  welcomeToast,
  onCloseWelcomeToast
}) => {
  return (
    <div className="h-screen w-full overflow-hidden flex flex-col xl:flex-row bg-background font-sans transition-colors duration-300">
      <Sidebar isOpen={isSidebarOpen} onClose={onCloseSidebar} />
      <div className="flex-1 flex flex-col min-w-0 h-full backdrop-blur-sm relative">
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2 flex items-center gap-3 text-amber-600 dark:text-amber-500 shrink-0">
          <AlertTriangle size={14} className="animate-pulse" />
          <p className="text-[11px] font-bold uppercase tracking-wider">
            Admin Mode: Full System Access
          </p>
        </div>
        <Header onOpenSidebar={onOpenSidebar} />
        <div className="flex-1 overflow-y-auto scrolling-touch animate-slide-up-fade no-scrollbar pb-24 xl:pb-0">
          {children}
        </div>
        <BottomNav onOpenSidebar={onOpenSidebar} />
      </div>
      {welcomeToast && (
        <Toast 
          message="Welcome back, Administrator." 
          type="success" 
          onClose={onCloseWelcomeToast} 
        />
      )}
    </div>
  );
};

export default AdminLayout;
