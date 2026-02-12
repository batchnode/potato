import React from 'react';
import { Eye, Edit3 } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface ContentRowProps {
  filename: string;
  status: string;
  warning?: boolean;
  onEdit: () => void;
  onPreview: () => void;
}

const ContentRow: React.FC<ContentRowProps> = ({ filename, status, warning, onEdit, onPreview }) => (
  <tr className="hover:bg-foreground/5 transition text-sm group">
    <td className="px-5 md:px-8 py-5 font-semibold text-foreground/80 font-mono group-hover:text-indigo-600 truncate max-w-[120px] md:max-w-[300px]">{filename}</td>
    <td className="px-5 md:px-8 py-5 hidden sm:table-cell">
      <span className={cn(
        "text-[10px] px-3 py-1 rounded-full font-bold",
        warning ? 'bg-amber-500/20 text-amber-500' : 'bg-green-500/20 text-green-500'
      )}>{status}</span>
    </td>
    <td className="px-5 md:px-8 py-5 text-right">
      <div className="flex justify-end gap-1">
        <button
          onClick={onPreview}
          className="text-foreground/20 hover:text-indigo-600 transition p-2"
          aria-label="Preview"
        >
          <Eye size={18} />
        </button>
        <button
          onClick={onEdit}
          className="text-foreground/20 hover:text-indigo-600 transition p-2"
          aria-label="Edit"
        >
          <Edit3 size={18} />
        </button>
      </div>
    </td>
  </tr>
);

export default ContentRow;
