import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Toast from '../components/Toast';
import BottomNav from '../components/BottomNav';

interface EditorLayoutProps {
  children: React.ReactNode;
  isSidebarOpen: boolean;
  onCloseSidebar: () => void;
  onOpenSidebar: () => void;
  welcomeToast: boolean;
  onCloseWelcomeToast: () => void;
}

const EditorLayout: React.FC<EditorLayoutProps> = ({
  children,
  isSidebarOpen,
  onCloseSidebar,
  onOpenSidebar,
  welcomeToast,
  onCloseWelcomeToast
}) => {
  return (
    <div className="h-screen w-full overflow-hidden flex flex-col xl:flex-row bg-background font-sans transition-colors duration-300">
      {/* Editor Sidebar - Reusing existing component which adapts based on role */}
      <Sidebar isOpen={isSidebarOpen} onClose={onCloseSidebar} />
      
      <div className="flex-1 flex flex-col min-w-0 h-full backdrop-blur-sm relative">
        {/* Simplified Editor Header */}
        <Header onOpenSidebar={onOpenSidebar} />
        
        <div className="flex-1 overflow-y-auto scrolling-touch animate-slide-up-fade no-scrollbar pb-24 xl:pb-0">
          {children}
        </div>
        
        {/* Editor Bottom Nav */}
        <BottomNav onOpenSidebar={onOpenSidebar} />
      </div>
      
      {welcomeToast && (
        <Toast 
          message="Welcome to your workspace." 
          type="success" 
          onClose={onCloseWelcomeToast} 
        />
      )}
    </div>
  );
};

export default EditorLayout;
