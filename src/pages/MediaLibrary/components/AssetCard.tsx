import React from 'react';
import { MoreVertical, Download, Edit2, Trash2, FileText } from 'lucide-react';
import { cn } from '../../../utils/cn';
import MenuButton from './MenuButton';
import type { GitHubContent } from '../../../types';

interface AssetCardProps {
  asset: GitHubContent;
  activeMenu: string | null;
  isSelected: boolean;
  menuSide: 'left' | 'right';
  onToggleMenu: (e: React.MouseEvent, id: string) => void;
  onSelect: (asset: GitHubContent) => void;
  onDownload: (asset: GitHubContent) => void;
  onRename: (asset: GitHubContent) => void;
  onDelete: (asset: GitHubContent) => void;
  onNavigate: (folderName: string) => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
}

const AssetCard: React.FC<AssetCardProps> = ({
  asset,
  activeMenu,
  isSelected,
  menuSide,
  onToggleMenu,
  onSelect,
  onDownload,
  onRename,
  onDelete,
  onNavigate,
  menuRef
}) => {
  const isFolder = asset.type === 'dir';
  const isImage = !isFolder && asset.name.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i);

  return (
    <div
      onClick={() => isFolder ? onNavigate(asset.name) : onSelect(asset)}
      className={cn(
        "group bg-card rounded-[2rem] border transition-all duration-300 relative",
        isSelected 
          ? "border-indigo-500 shadow-xl ring-4 ring-indigo-500/10" 
          : "border-border shadow-sm hover:shadow-xl hover:border-indigo-500/30",
        activeMenu === asset.sha ? "z-[60]" : "z-0",
        isFolder ? "cursor-pointer" : "cursor-default"
      )}
    >
      <div className={cn(
        "aspect-square flex items-center justify-center relative rounded-t-[2rem] border-b border-border transition-colors overflow-hidden",
        isSelected ? "bg-indigo-500/5" : "bg-foreground/5 group-hover:bg-foreground/10"
      )}>
        {isFolder ? (
          <div className="p-8 bg-amber-500/5 rounded-3xl text-amber-500/40 group-hover:text-amber-500 group-hover:bg-amber-500/10 transition-all">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path></svg>
          </div>
        ) : isImage ? (
          <img 
            src={asset.download_url} 
            alt={asset.name} 
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
          />
        ) : (
          <div className="p-8 bg-foreground/5 rounded-3xl text-foreground/20 group-hover:text-indigo-500 group-hover:bg-indigo-500/5 transition-all">
            <FileText size={48} strokeWidth={1.5} />
          </div>
        )}

        <div className="absolute top-3 right-3 z-50">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleMenu(e, asset.sha); }}
            className={cn(
              "p-2.5 backdrop-blur-xl shadow-lg rounded-xl transition-all active:scale-95",
              activeMenu === asset.sha
                ? "bg-indigo-600 text-white shadow-indigo-500/40"
                : "bg-background/80 text-foreground/40 hover:text-indigo-600 hover:bg-background"
            )}
          >
            <MoreVertical size={18} />
          </button>
          {activeMenu === asset.sha && (
            <div
              ref={menuRef}
              className={cn(
                "absolute top-full mt-2 w-48 bg-card rounded-2xl shadow-2xl border border-border z-[100] py-2 animate-in fade-in zoom-in-95 duration-150",
                menuSide === 'right' ? "right-0 origin-top-right" : "left-0 origin-top-left"
              )}
            >
              {!isFolder && (
                <MenuButton
                  icon={<Download size={16} />}
                  label="Download"
                  onClick={() => onDownload(asset)}
                />
              )}
              <MenuButton
                icon={<Edit2 size={16} />}
                label="Rename"
                onClick={() => onRename(asset)}
              />
              <div className="my-1 border-t border-border/50" />
              <MenuButton
                icon={<Trash2 size={16} />}
                label="Delete"
                danger
                onClick={() => onDelete(asset)}
              />
            </div>
          )}
        </div>
      </div>
      <div className="p-5">
        <p className={cn("text-xs font-bold truncate transition-colors", isSelected ? "text-indigo-600" : "text-foreground/80")}>{asset.name}</p>
        {!isFolder && (
          <div className="flex items-center justify-between mt-1.5">
            <p className="text-[10px] text-foreground/30 font-black uppercase tracking-wider">
              {(asset.size / 1024).toFixed(1)} KB
            </p>
            <p className="text-[9px] text-indigo-500/40 font-black uppercase truncate max-w-[60px]">
              {asset.name.split('.').pop()}
            </p>
          </div>
        )}
        {isFolder && (
          <p className="text-[10px] text-amber-500/60 font-black uppercase tracking-wider mt-1.5">
            Directory
          </p>
        )}
      </div>
    </div>
  );
};

export default AssetCard;
