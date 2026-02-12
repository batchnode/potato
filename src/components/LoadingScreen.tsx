import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-background min-h-[400px]">
      <div className="relative">
        <img 
          src="/potato.png" 
          alt="Loading..." 
          className="w-16 h-16 md:w-20 md:h-20 animate-spin object-contain"
          style={{ animationDuration: '2s' }}
        />
        <div className="absolute inset-0 blur-2xl bg-indigo-500/10 rounded-full animate-pulse" />
      </div>
      <p className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-foreground/20 animate-pulse">
        Loading Potato...
      </p>
    </div>
  );
};

export default LoadingScreen;
