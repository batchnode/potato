import React from 'react';
import { ShieldCheck } from 'lucide-react';
import Toast from '../components/Toast';
import LoadingScreen from '../components/LoadingScreen';
import { cn } from '../utils/cn';
import { useCreatePostLogic } from './CreatePost/hooks/useCreatePostLogic';
import PostHeader from './CreatePost/components/PostHeader';
import DynamicField from './CreatePost/components/DynamicField';
import EditorToolbar from './CreatePost/components/EditorToolbar';
import MediaBrowser from './CreatePost/components/MediaBrowser';
import LivePreview from './CreatePost/components/LivePreview';

const CreatePost: React.FC = () => {
  const {
    filename,
    isEditing,
    textareaRef,
    fileInputRef,
    content,
    setContent,
    formData,
    setFormData,
    loading,
    uploading,
    isPublishing,
    showMobilePreview,
    setShowMobilePreview,
    showMediaBrowser,
    setShowMediaBrowser,
    toast,
    setToast,
    isDraft,
    sourceFolder,
    canEditPublished,
    isUnauthorizedEdit,
    libraryAssets,
    parsedSchema,
    config,
    user,
    applyFormatting,
    fetchLibrary,
    handleSave,
    handleFileUpload,
    navigate
  } = useCreatePostLogic();

  // Listen for bottom nav actions
  React.useEffect(() => {
    const handlePotatoAction = (e: any) => {
      if (e.detail === 'publish-post') handleSave('publish');
      else if (e.detail === 'save-draft') handleSave('draft');
      else if (e.detail === 'toggle-live-preview') setShowMobilePreview(prev => !prev);
    };
    window.addEventListener('potato-action', handlePotatoAction);
    return () => window.removeEventListener('potato-action', handlePotatoAction);
  }, [handleSave, setShowMobilePreview]);

  if (loading) return <LoadingScreen />;
  if (!user) return null;

  if (isUnauthorizedEdit) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center bg-background p-10 text-center">
        <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-[2.5rem] flex items-center justify-center mb-6 border border-red-500/20 shadow-lg shadow-red-500/5">
          <ShieldCheck size={40} />
        </div>
        <h2 className="text-2xl font-black text-foreground mb-3 italic uppercase tracking-tight">Access Denied</h2>
        <p className="text-foreground/40 max-w-sm font-medium leading-relaxed">
          You don't have sufficient privileges to edit published content.
          Please contact an administrator or work on drafts in the Workbench.
        </p>
        <button
          onClick={() => navigate('/content')}
          className="mt-8 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/20"
        >
          Return to Content
        </button>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-hidden flex flex-col h-full bg-background relative font-sans transition-colors duration-300">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {showMediaBrowser && (
        <MediaBrowser 
          libraryAssets={libraryAssets}
          onAssetClick={(asset) => {
            applyFormatting(`![${asset.name}](${asset.download_url})`, '');
            setShowMediaBrowser(false);
          }}
          onClose={() => setShowMediaBrowser(false)}
        />
      )}

      <PostHeader 
        isEditing={isEditing}
        filename={filename}
        isPublishing={isPublishing}
        canEditPublished={canEditPublished}
        sourceFolder={sourceFolder}
        onSaveDraft={() => handleSave('draft')}
        onPublish={() => handleSave('publish')}
        onSubmitForReview={() => handleSave('review')}
        isDraft={isDraft}
      />

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        <div className={cn("flex-1 overflow-y-auto p-4 md:p-8 space-y-8 no-scrollbar bg-background", showMobilePreview ? "hidden lg:block" : "block")}>
          <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <section className="bg-card p-8 rounded-[2.5rem] border border-border shadow-sm space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-foreground">
                {Object.entries(parsedSchema).map(([key, type]) => (
                  <DynamicField 
                    key={key} 
                    name={key} 
                    type={String(type)} 
                    value={formData[key]} 
                    onChange={(val) => setFormData(prev => ({ ...prev, [key]: val }))} 
                  />
                ))}
              </div>
            </section>

            <div className="bg-card rounded-[2.5rem] border border-border shadow-sm overflow-hidden flex flex-col min-h-[600px]">
              <EditorToolbar 
                applyFormatting={applyFormatting}
                onUploadClick={() => fileInputRef.current?.click()}
                onLibraryClick={fetchLibrary}
                onPreviewClick={() => setShowMobilePreview(true)}
                uploading={uploading}
              />
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Start writing..."
                className="flex-1 p-10 text-lg text-foreground bg-card placeholder:text-foreground/20 focus:outline-none resize-none leading-relaxed min-h-[500px]"
              />
            </div>
          </div>
        </div>

        <LivePreview 
          content={content}
          showMobilePreview={showMobilePreview}
          onCloseMobilePreview={() => setShowMobilePreview(false)}
          config={config}
        />
      </div>
    </main>
  );
};

export default CreatePost;
