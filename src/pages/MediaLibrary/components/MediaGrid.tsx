import React from 'react';
import { Upload, FolderOpen } from 'lucide-react';
import AssetCard from './AssetCard';
import type { GitHubContent } from '../../../types';

interface MediaGridProps {
  assets: GitHubContent[];
  loading: boolean;
  error: string | null;
  activeMenu: string | null;
  selectedAsset: GitHubContent | null;
  menuSide: 'left' | 'right';
  onToggleMenu: (e: React.MouseEvent, id: string) => void;
  onSelect: (asset: GitHubContent) => void;
  onDownload: (asset: GitHubContent) => void;
  onRename: (asset: GitHubContent) => void;
  onDelete: (asset: GitHubContent) => void;
  onNavigate: (folderName: string) => void;
  breadcrumbs: string[];
  onUploadFirst: () => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
}

const MediaGrid: React.FC<MediaGridProps> = ({
  assets,
  loading,
  error,
  activeMenu,
  selectedAsset,
  menuSide,
  onToggleMenu,
  onSelect,
  onDownload,
  onRename,
  onDelete,
  onNavigate,
  breadcrumbs,
  onUploadFirst,
  menuRef
}) => {
  const isRoot = breadcrumbs.length === 1;

  return (
    <div className="space-y-6">
      {/* ... (Root message section remains same) */}
      {isRoot && assets.length > 0 && (
        <div className="mx-2 p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center shrink-0">
             <FolderOpen size={20} />
          </div>
          <p className="text-xs font-bold text-indigo-600/60 uppercase tracking-widest">
            Media Root — Use the explorer on the right to navigate subdirectories
          </p>
        </div>
      )}

      {assets.length === 0 && !loading && !error ? (
        <div className="col-span-full py-20 text-center px-6 space-y-4 bg-foreground/5 rounded-[3rem] border-2 border-dashed border-border/50 mx-2">
          <div className="w-20 h-20 bg-foreground/5 text-foreground/20 rounded-[2.5rem] flex items-center justify-center mx-auto">
            {isRoot ? <FolderOpen size={32} /> : <Upload size={32} />}
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">
              {isRoot ? "Media Library Root" : "No files here"}
            </h3>
            <p className="text-sm opacity-40 text-foreground max-w-sm mx-auto">
              {isRoot 
                ? "Select a directory from the explorer on the right to view its contents here."
                : "This folder doesn't contain any media files. You can upload some or check subfolders in the explorer."}
            </p>
          </div>
          {!isRoot && (
            <button
              onClick={onUploadFirst}
              className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-500/20 active:scale-95"
            >
              Upload to this folder
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 px-2">
          {assets.map((asset) => (
            <AssetCard 
              key={asset.sha}
              asset={asset}
              activeMenu={activeMenu}
              isSelected={selectedAsset?.sha === asset.sha}
              menuSide={menuSide}
              onToggleMenu={onToggleMenu}
              onSelect={onSelect}
              onDownload={onDownload}
              onRename={onRename}
              onDelete={onDelete}
              onNavigate={onNavigate}
              menuRef={menuRef}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaGrid;
