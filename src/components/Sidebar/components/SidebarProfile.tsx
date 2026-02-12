import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import type { User } from '../../../types';
import Modal from '../../Modal';

interface SidebarProfileProps {
  user: User;
  isAdmin: boolean;
}

const SidebarProfile: React.FC<SidebarProfileProps> = ({ user, isAdmin }) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('potato_session');
    window.location.reload();
  };

  return (
    <div className="p-4 border-t border-sidebar-border mt-auto space-y-2">
      <div className="flex items-center justify-between gap-3 p-3 bg-sidebar-foreground/5 rounded-2xl border border-sidebar-border">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-sm text-white shadow-lg uppercase shrink-0">
            {user.email?.substring(0, 2) || 'U'}
          </div>
          <div className="text-xs min-w-0">
            <p className="font-bold truncate text-sidebar-foreground">
              {isAdmin ? 'Admin' : 'Editor'}
            </p>
            <p className="opacity-60 truncate text-sidebar-foreground">{user.email}</p>
          </div>
        </div>
        <button 
          onClick={() => setShowLogoutModal(true)}
          className="p-2 hover:bg-red-500/10 text-red-500 rounded-xl transition-colors shrink-0 group"
          title="Logout"
        >
          <LogOut size={18} className="group-hover:scale-110 transition-transform" />
        </button>
      </div>

      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Logout"
        message="Are you sure you want to logout from Potato?"
        type="danger"
        confirmLabel="Logout"
      />
    </div>
  );
};

export default SidebarProfile;
