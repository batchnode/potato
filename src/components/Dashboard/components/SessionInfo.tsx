import React from 'react';

interface SessionInfoProps {
  email: string;
  branch: string;
}

const SessionInfo: React.FC<SessionInfoProps> = ({ email, branch }) => {
  return (
    <div className="space-y-6">
      <h3 className="font-bold text-lg text-foreground px-2">Session Info</h3>
      <div className="bg-sidebar p-8 rounded-[2.5rem] text-sidebar-foreground space-y-4 shadow-xl border border-sidebar-border">
        <div className="flex justify-between items-center py-2 border-b border-sidebar-border/50">
          <span className="text-xs opacity-40">User</span>
          <span className="text-xs font-bold truncate max-w-[120px]" title={email}>{email}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-sidebar-border/50">
          <span className="text-xs opacity-40">Branch</span>
          <span className="text-xs font-bold truncate max-w-[120px]" title={branch}>{branch}</span>
        </div>
      </div>
    </div>
  );
};

export default SessionInfo;
