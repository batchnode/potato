import React from 'react';
import { cn } from '../../../utils/cn';

export type SetupStep = 'admin' | 'cloudflare' | 'github-auth' | 'github-repo' | 'github-branch' | 'content' | 'schema' | 'engine-init';

interface SetupProgressBarProps {
  step: SetupStep;
}

const steps: SetupStep[] = ['admin', 'cloudflare', 'github-auth', 'github-repo', 'github-branch', 'content', 'schema', 'engine-init'];

const SetupProgressBar: React.FC<SetupProgressBarProps> = ({ step }) => {
  return (
    <div className="flex gap-2 mb-8">
      {steps.map((s, i) => (
        <div
          key={s}
          className={cn(
            "h-1.5 flex-1 rounded-full transition-all duration-500",
            steps.indexOf(step) >= i ? 'bg-indigo-600' : 'bg-slate-200'
          )}
        />
      ))}
    </div>
  );
};

export default SetupProgressBar;
