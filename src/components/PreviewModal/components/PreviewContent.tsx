import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import LoadingScreen from '../../LoadingScreen';
import { X } from 'lucide-react';
import PreviewMetadata from './PreviewMetadata';

interface PreviewContentProps {
  loading: boolean;
  error: string | null;
  title: string;
  description: string;
  thumbnail: string;
  content: string;
  getImageUrl: (src: string) => string;
  fm: Record<string, unknown>;
  renderValue: (val: unknown) => string;
  categories: unknown[];
}

const PreviewContent: React.FC<PreviewContentProps> = ({
  loading,
  error,
  title,
  description,
  thumbnail,
  content,
  getImageUrl,
  fm,
  renderValue,
  categories
}) => {
  if (loading) return <LoadingScreen />;

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-red-500">
        <X size={48} className="p-3 bg-red-500/10 rounded-full" />
        <div>
          <h3 className="text-lg font-bold">Error loading preview</h3>
          <p className="opacity-60 text-sm max-w-sm mx-auto">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-12 animate-in slide-in-from-bottom-8 duration-700">
      <PreviewMetadata 
        date={renderValue(fm.date)}
        author={renderValue(fm.author)}
        layout={renderValue(fm.layout)}
        category={categories.length > 0 ? renderValue(categories[0]) : undefined}
      />

      <div className="space-y-4">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground leading-[1.1] tracking-tight">{title}</h1>
        {description && (
          <p className="text-xl text-foreground/50 font-medium italic leading-relaxed">{description}</p>
        )}
      </div>

      {thumbnail && (
        <div className="relative group rounded-[2rem] overflow-hidden border border-border shadow-2xl">
          <img
            src={getImageUrl(thumbnail)}
            alt="Cover"
            className="w-full h-auto object-cover max-h-[400px] transition duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
        </div>
      )}

      <article className="prose prose-indigo prose-lg dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-indigo-500 prose-img:rounded-3xl prose-img:border prose-img:border-border prose-pre:bg-sidebar prose-pre:rounded-2xl prose-pre:border prose-pre:border-border prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:bg-indigo-500/5 prose-blockquote:py-2 prose-blockquote:rounded-r-2xl">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            img: ({ ...props }) => {
              const src = getImageUrl(props.src || '');
              return <img {...props} src={src} className="rounded-2xl shadow-lg border border-border max-w-full h-auto" alt={props.alt || ''} />;
            }
          }}
        >
          {content}
        </ReactMarkdown>
      </article>

      <div className="h-20" />
    </div>
  );
};

export default PreviewContent;
