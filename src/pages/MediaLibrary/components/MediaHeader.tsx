import React from 'react';
import { Upload, Loader2, FolderPlus } from 'lucide-react';

interface MediaHeaderProps {
  onUploadClick: () => void;
  onNewFolderClick: () => void;
  uploading: boolean;
}

const MediaHeader: React.FC<MediaHeaderProps> = ({ onUploadClick, onNewFolderClick, uploading }) => {
  return (
    <header className="bg-header border-b border-sidebar-border px-6 py-4 flex justify-between items-center shrink-0 z-10 transition-colors duration-300">
      <div className="flex justify-between items-center w-full sm:w-auto">
        <div>
          <h1 className="text-xl font-bold text-foreground leading-tight">Media Library</h1>
          <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mt-1">Manage Repository Assets</p>
        </div>
      </div>
      <div className="hidden xl:flex items-center gap-2">
        <button
          onClick={onNewFolderClick}
          className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-foreground/60 rounded-xl hover:text-foreground transition font-bold text-xs active:scale-95 w-full sm:w-auto"
        >
          <FolderPlus size={16} />
          New Folder
        </button>
        <button
          onClick={onUploadClick}
          disabled={uploading}
          className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-bold text-sm shadow-lg shadow-indigo-500/20 active:scale-95 disabled:opacity-50 w-full sm:w-auto"
        >
          {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
          <span>{uploading ? 'Uploading...' : 'Upload Asset'}</span>
        </button>
      </div>
    </header>
  );
};

export default MediaHeader;
