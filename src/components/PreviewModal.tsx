import React from 'react';
import { cn } from '../utils/cn';
import { usePreviewLogic } from './PreviewModal/hooks/usePreviewLogic';
import PreviewHeader from './PreviewModal/components/PreviewHeader';
import PreviewContent from './PreviewModal/components/PreviewContent';
import PreviewFooter from './PreviewModal/components/PreviewFooter';

interface PreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    filename: string;
    repo: string;
    pat: string;
    branch: string;
    sourceDir: string;
}

const PreviewModal: React.FC<PreviewModalProps> = (props) => {
    const { isOpen, onClose, filename, sourceDir } = props;
    const {
        content,
        fm,
        loading,
        error,
        isFullscreen,
        setIsFullscreen,
        getImageUrl,
        renderValue,
        tags,
        categories,
        title,
        description,
        thumbnail
    } = usePreviewLogic(props);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
            <div
                className="absolute inset-0 bg-background/95 backdrop-blur-3xl"
                onClick={onClose}
            />

            <div className={cn(
                "relative bg-card border border-border overflow-hidden flex flex-col transition-all duration-500 shadow-2xl rounded-[2.5rem]",
                isFullscreen ? "w-full h-full" : "w-full max-w-5xl max-h-[90vh]"
            )}>
                <PreviewHeader 
                    title={title}
                    sourceDir={sourceDir}
                    filename={filename}
                    isFullscreen={isFullscreen}
                    onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
                    onClose={onClose}
                />

                <div className="flex-1 overflow-y-auto p-6 md:p-12 lg:p-16 custom-scrollbar scroll-smooth">
                    <PreviewContent 
                        loading={loading}
                        error={error}
                        title={title}
                        description={description}
                        thumbnail={thumbnail}
                        content={content}
                        getImageUrl={getImageUrl}
                        fm={fm}
                        renderValue={renderValue}
                        categories={categories}
                    />
                </div>

                <PreviewFooter 
                    tags={tags}
                    renderValue={renderValue}
                    onPrint={() => window.print()}
                    onClose={onClose}
                />
            </div>
        </div>
    );
};

export default PreviewModal;
