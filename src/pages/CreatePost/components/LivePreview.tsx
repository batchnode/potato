import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Eye, X } from 'lucide-react';
import { cn } from '../../../utils/cn';
import type { Config } from '../../../types';

interface LivePreviewProps {
  content: string;
  showMobilePreview: boolean;
  onCloseMobilePreview: () => void;
  config: Config;
}

const LivePreview: React.FC<LivePreviewProps> = ({
  content,
  showMobilePreview,
  onCloseMobilePreview,
  config
}) => {
  return (
    <div className={cn("lg:w-1/3 lg:border-l lg:border-border bg-card overflow-y-auto transition-all duration-300", showMobilePreview ? "fixed inset-0 z-50 p-6" : "hidden lg:block")}>
      <div className="flex items-center justify-between mb-8 sticky top-0 bg-card/90 backdrop-blur-sm py-4 px-2 z-10 border-b border-border lg:border-none">
        <div className="flex items-center gap-2 text-foreground/40"><Eye size={16} /><span className="text-[10px] font-bold uppercase tracking-widest">Live Preview</span></div>
        {showMobilePreview && <button onClick={onCloseMobilePreview} className="p-2 bg-foreground/5 rounded-xl text-foreground/60"><X size={20} /></button>}
      </div>
      <div className="px-4 md:px-8 pb-20">
        <div className="prose prose-slate dark:prose-invert prose-indigo max-w-none lg:prose-lg prose-headings:font-bold prose-headings:text-foreground prose-p:text-foreground/80 prose-a:text-indigo-600 prose-pre:bg-sidebar prose-pre:text-sidebar-foreground border-sidebar-border shadow-2xl">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              img: ({ ...props }) => {
                let src = props.src || '';
                const isGithubRaw = src.includes('raw.githubusercontent.com');
                const isRelative = src.startsWith('/') || (!src.startsWith('http') && !src.startsWith('data:'));
                if (isRelative || isGithubRaw) {
                  let path = '';
                  if (isGithubRaw) {
                    const parts = src.split('/');
                    path = parts.slice(6).join('/').split('?')[0];
                  } else {
                    path = src.startsWith('/') ? src.substring(1) : src;
                  }
                  const repo = config.repo || '';
                  const branch = config.branch || 'main';
                  if (repo && path) {
                    src = `/api/media_proxy?repo=${repo}&branch=${branch}&path=${path}`;
                  }
                }
                return <img {...props} src={src} className="rounded-2xl shadow-lg border border-border max-w-full h-auto" alt={props.alt || ''} />;
              }
            }}
          >
            {content || "_Start typing..._"}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default LivePreview;
