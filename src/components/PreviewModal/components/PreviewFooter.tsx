import React from 'react';
import { Printer } from 'lucide-react';

interface PreviewFooterProps {
  tags: unknown[];
  renderValue: (val: unknown) => string;
  onPrint: () => void;
  onClose: () => void;
}

const PreviewFooter: React.FC<PreviewFooterProps> = ({
  tags,
  renderValue,
  onPrint,
  onClose
}) => {
  return (
    <div className="p-6 md:p-8 border-t border-border bg-foreground/5 flex flex-col md:flex-row items-center justify-between gap-6 shrink-0">
      <div className="flex items-center gap-4">
        <span className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em]">Metadata:</span>
        <div className="flex gap-2">
          {tags.map((tag, i) => {
            const tagVal = renderValue(tag);
            return (
              <span key={`${tagVal}-${i}`} className="text-[10px] font-bold px-2 py-1 bg-card border border-border rounded-lg text-foreground/60">{tagVal}</span>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3 w-full md:w-auto">
        <button onClick={onPrint} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-card border border-border text-foreground/60 rounded-2xl text-xs font-black transition hover:border-indigo-500/30 hover:text-indigo-500 active:scale-95">
          <Printer size={16} /> Print
        </button>
        <button onClick={onClose} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-10 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black transition hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 active:scale-95">
          Done Reading
        </button>
      </div>
    </div>
  );
};

export default PreviewFooter;
