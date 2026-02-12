import React from 'react';
import { Image as ImageIcon, X, CheckCircle2 } from 'lucide-react';
import type { GitHubContent } from '../../../types';

interface MediaBrowserProps {
  libraryAssets: GitHubContent[];
  onAssetClick: (asset: GitHubContent) => void;
  onClose: () => void;
}

const MediaBrowser: React.FC<MediaBrowserProps> = ({ libraryAssets, onAssetClick, onClose }) => {
  return (
    <div className="absolute inset-y-0 right-0 w-80 bg-card shadow-2xl z-50 border-l border-border animate-in slide-in-from-right duration-300 flex flex-col">
      <div className="p-6 border-b border-border flex items-center justify-between bg-foreground/5">
        <h3 className="font-bold text-foreground flex items-center gap-2"><ImageIcon size={18} /> Library</h3>
        <button onClick={onClose} className="p-2 hover:bg-card rounded-xl transition text-foreground/40 hover:text-foreground"><X size={20} /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-card">
        {libraryAssets.map(asset => (
          <div
            key={asset.sha}
            onClick={() => onAssetClick(asset)}
            className="group cursor-pointer bg-foreground/5 rounded-2xl border border-border/50 overflow-hidden hover:ring-2 hover:ring-indigo-500/20 transition"
          >
            <div className="aspect-video bg-foreground/10 relative">
              <img src={asset.download_url} alt={asset.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/20 transition flex items-center justify-center">
                <CheckCircle2 className="text-white opacity-0 group-hover:opacity-100" size={24} />
              </div>
            </div>
            <div className="p-3"><p className="text-[10px] font-bold text-foreground/70 truncate">{asset.name}</p></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MediaBrowser;
