import React from 'react';
import { Eye, Minimize2, Maximize2, X } from 'lucide-react';

interface PreviewHeaderProps {
  title: string;
  sourceDir: string;
  filename: string;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onClose: () => void;
}

const PreviewHeader: React.FC<PreviewHeaderProps> = ({
  title,
  sourceDir,
  filename,
  isFullscreen,
  onToggleFullscreen,
  onClose
}) => {
  return (
    <div className="flex items-center justify-between p-6 md:p-8 border-b border-border bg-foreground/5 shrink-0">
      <div className="flex items-center gap-4 truncate">
        <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl hidden sm:flex">
          <Eye size={20} />
        </div>
        <div className="truncate">
          <h2 className="text-xl font-black text-foreground truncate">{title}</h2>
          <p className="text-xs opacity-40 font-mono truncate">{sourceDir}/{filename}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onToggleFullscreen}
          className="p-3 hover:bg-foreground/10 rounded-2xl text-foreground/40 transition active:scale-95 hidden md:flex"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </button>
        <button
          onClick={onClose}
          className="p-3 hover:bg-red-500/10 hover:text-red-500 rounded-2xl text-foreground/40 transition active:scale-95"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default PreviewHeader;
