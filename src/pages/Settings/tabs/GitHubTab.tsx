import React from 'react';
import { Github, CheckCircle2 } from 'lucide-react';
import ConfigInput from '../components/ConfigInput';
import type { Config } from '../../../types';

interface GitHubTabProps {
  config: Config;
  setConfig: (config: Config) => void;
}

const GitHubTab: React.FC<GitHubTabProps> = ({
  config,
  setConfig,
}) => (
  <div className="space-y-8 animate-in fade-in duration-300">
    <header className="flex items-center gap-4 mb-10">
      <div className="p-3 bg-sidebar text-sidebar-foreground rounded-2xl border border-sidebar-border"><Github size={24} /></div>
      <div><h3 className="font-bold text-xl text-foreground">GitHub</h3><p className="text-sm opacity-60 text-foreground">Repository and directory mapping</p></div>
    </header>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <ConfigInput label="Repository" value={config.repo} onChange={v => setConfig({ ...config, repo: v })} placeholder="user/repo" />
      <ConfigInput label="Branch" value={config.branch} onChange={v => setConfig({ ...config, branch: v })} placeholder="main" />
      <ConfigInput label="Posts Directory" value={config.postsDir} onChange={v => setConfig({ ...config, postsDir: v })} placeholder="_posts" />
      <ConfigInput label="Assets Directory" value={config.assetsDir} onChange={v => setConfig({ ...config, assetsDir: v })} placeholder="assets/images" />
    </div>

    <div className="pt-8 border-t border-border space-y-6">
        <h4 className="font-bold text-foreground">Workflow Configuration</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-card rounded-2xl border border-border space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h5 className="font-bold text-foreground">Drafts Backup</h5>
                        <p className="text-xs opacity-60 text-foreground">Mirror drafts to GitHub <code>_drafts</code> folder.</p>
                    </div>
                    <button 
                        onClick={() => {
                            if (!config.saveDraftsToGithub) {
                                if (!confirm("Enabling 'Save to Repository' will mirror your private drafts to GitHub. Anyone with repository access will be able to view, edit, or delete them. This overrides the private mode setting for the repository copy only.")) return;
                            }
                            setConfig({ ...config, saveDraftsToGithub: !config.saveDraftsToGithub });
                        }}
                        className={`w-12 h-6 rounded-full transition-colors relative ${config.saveDraftsToGithub ? 'bg-indigo-600' : 'bg-slate-200'}`}
                    >
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${config.saveDraftsToGithub ? 'translate-x-6' : ''}`} />
                    </button>
                </div>
                <button 
                    onClick={async () => {
                        const res = await fetch('/api/admin/sync_wip', {
                            method: 'POST',
                            headers: { 
                                'Content-Type': 'application/json',
                                'x-user-id': config.email || 'anonymous'
                            },
                            body: JSON.stringify({ repo: config.repo, branch: config.branch, type: 'draft' })
                        });
                        const data = await res.json();
                        alert(data.success ? `Fetched ${data.count} drafts from GitHub.` : `Error: ${data.error}`);
                    }}
                    className="w-full py-2 bg-secondary-bg text-foreground/80 rounded-xl text-xs font-bold hover:bg-secondary-bg/80 transition"
                >
                    Fetch Drafts from Repo
                </button>
            </div>

            <div className="p-6 bg-card rounded-2xl border border-border space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h5 className="font-bold text-foreground">Review Backup</h5>
                        <p className="text-xs opacity-60 text-foreground">Mirror review files to GitHub <code>_review</code> folder.</p>
                    </div>
                    <button 
                        onClick={() => {
                            if (!config.saveReviewsToGithub) {
                                if (!confirm("Enabling 'Save to Repository' will mirror review files to GitHub. Anyone with repository access will be able to view, edit, or delete them.")) return;
                            }
                            setConfig({ ...config, saveReviewsToGithub: !config.saveReviewsToGithub });
                        }}
                        className={`w-12 h-6 rounded-full transition-colors relative ${config.saveReviewsToGithub ? 'bg-indigo-600' : 'bg-slate-200'}`}
                    >
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${config.saveReviewsToGithub ? 'translate-x-6' : ''}`} />
                    </button>
                </div>
                <button 
                    onClick={async () => {
                        const res = await fetch('/api/admin/sync_wip', {
                            method: 'POST',
                            headers: { 
                                'Content-Type': 'application/json',
                                'x-user-id': config.email || 'anonymous'
                            },
                            body: JSON.stringify({ repo: config.repo, branch: config.branch, type: 'review' })
                        });
                        const data = await res.json();
                        alert(data.success ? `Fetched ${data.count} review files from GitHub.` : `Error: ${data.error}`);
                    }}
                    className="w-full py-2 bg-secondary-bg text-foreground/80 rounded-xl text-xs font-bold hover:bg-secondary-bg/80 transition"
                >
                    Fetch Reviews from Repo
                </button>
            </div>
        </div>
    </div>

    <div className="pt-8 border-t border-border space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-secondary-bg rounded-3xl border border-border gap-6">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-card rounded-xl shadow-sm text-blue-600 shrink-0"><CheckCircle2 size={20} /></div>
          <div><h4 className="font-bold text-foreground">D1 Content Cache</h4><p className="text-xs opacity-60 text-foreground mt-1">Sync production content from GitHub to D1 for instant reads.</p></div>
        </div>
        <button 
          onClick={async () => {
            const folders = [config.postsDir || '_posts'];
            for (const path of folders) {
              await fetch('/api/sync', {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'x-user-id': config.email || 'anonymous' // Use config email as fallback for system sync
                },
                body: JSON.stringify({
                  repo: config.repo,
                  path: path,
                  branch: config.branch || 'main'
                })
              });
            }
            alert('Sync Complete!');
          }} 
          className="px-6 py-3 rounded-xl text-xs font-black bg-blue-600 text-white hover:bg-blue-700 transition flex items-center justify-center gap-2 w-full md:w-auto active:scale-95"
        >
          Manual Sync Now
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-secondary-bg rounded-3xl border border-border gap-6">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-card rounded-xl shadow-sm text-amber-600 shrink-0"><CheckCircle2 size={20} /></div>
          <div><h4 className="font-bold text-foreground">Legacy WIP Migration</h4><p className="text-xs opacity-60 text-foreground mt-1">Import existing drafts from GitHub into your private KV Engine.</p></div>
        </div>
        <button 
          onClick={async () => {
            if (!confirm('This will pull all files from your GitHub _drafts and _review folders into your private KV Engine. Continue?')) return;
            const folders = ['_drafts', '_review'];
            for (const path of folders) {
              await fetch('/api/sync', {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'x-user-id': config.email || 'anonymous'
                },
                body: JSON.stringify({
                  repo: config.repo,
                  path: path,
                  branch: config.branch || 'main',
                  migrate_wip: true
                })
              });
            }
            alert('Migration Complete! Your drafts should now appear in the Workbench.');
          }} 
          className="px-6 py-3 rounded-xl text-xs font-black bg-amber-600 text-white hover:bg-amber-700 transition flex items-center justify-center gap-2 w-full md:w-auto active:scale-95"
        >
          Migrate Legacy Drafts
        </button>
      </div>
    </div>
  </div>
);

export default GitHubTab;
