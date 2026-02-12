import React from 'react';
import {
  Heading1, Heading2, Heading3, Bold, Italic,
  Upload, Image as ImageIcon, ImagePlus, Link2, Code,
  ListOrdered, Minus, Quote, Strikethrough, Eye, Loader2
} from 'lucide-react';

interface EditorToolbarButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
}

const EditorToolbarButton: React.FC<EditorToolbarButtonProps> = ({ icon, onClick, disabled, title }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className="p-2.5 hover:bg-card hover:shadow-sm rounded-lg text-foreground/40 hover:text-indigo-500 transition flex items-center gap-2 disabled:opacity-50 group relative"
  >
    {icon}
  </button>
);

interface EditorToolbarProps {
  applyFormatting: (prefix: string, suffix?: string, defaultText?: string, block?: boolean) => void;
  onUploadClick: () => void;
  onLibraryClick: () => void;
  onPreviewClick: () => void;
  uploading: boolean;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  applyFormatting,
  onUploadClick,
  onLibraryClick,
  onPreviewClick,
  uploading
}) => {
  return (
    <div className="p-2 border-b border-border bg-foreground/5 flex flex-wrap gap-0.5 sticky top-0 backdrop-blur-sm z-10">
      <EditorToolbarButton icon={<Heading1 size={18} />} onClick={() => applyFormatting('# ', '', 'Heading 1', true)} />
      <EditorToolbarButton icon={<Heading2 size={18} />} onClick={() => applyFormatting('## ', '', 'Heading 2', true)} />
      <EditorToolbarButton icon={<Heading3 size={18} />} onClick={() => applyFormatting('### ', '', 'Heading 3', true)} />
      <div className="w-px h-6 bg-border mx-1 self-center" />
      <EditorToolbarButton icon={<Bold size={18} />} onClick={() => applyFormatting('**', '**', 'Bold text')} />
      <EditorToolbarButton icon={<Italic size={18} />} onClick={() => applyFormatting('*', '*', 'Italic text')} />
      <div className="w-px h-6 bg-border mx-1 self-center" />
      <EditorToolbarButton 
        icon={uploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />} 
        onClick={onUploadClick} 
        title="Upload" 
      />
      <EditorToolbarButton icon={<ImageIcon size={18} />} onClick={() => applyFormatting('![Alt Text](', ')', 'path.jpg')} title="Syntax" />
      <EditorToolbarButton icon={<ImagePlus size={18} />} onClick={onLibraryClick} title="Library" />
      <div className="w-px h-6 bg-border mx-1 self-center" />
      <EditorToolbarButton icon={<Link2 size={18} />} onClick={() => applyFormatting('[', '](https://)', 'Link')} />
      <EditorToolbarButton icon={<Code size={18} />} onClick={() => applyFormatting('```\n', '\n```', 'Code')} />
      <EditorToolbarButton icon={<ListOrdered size={18} />} onClick={() => applyFormatting('1. ', '', 'List', true)} />
      <EditorToolbarButton icon={<Minus size={18} />} onClick={() => applyFormatting('\n---\n', '', '')} />
      <EditorToolbarButton icon={<Quote size={18} />} onClick={() => applyFormatting('> ', '', 'Quote', true)} />
      <EditorToolbarButton icon={<Strikethrough size={18} />} onClick={() => applyFormatting('~~', '~~', 'Strike')} />
      <div className="ml-auto xl:hidden lg:block">
        <button onClick={onPreviewClick} className="flex items-center gap-2 px-4 py-2 bg-foreground text-card rounded-xl text-xs font-bold transition">
          <Eye size={14} /> Preview
        </button>
      </div>
    </div>
  );
};

export default EditorToolbar;
