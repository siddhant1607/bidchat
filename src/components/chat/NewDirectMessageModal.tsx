import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import { INITIAL_PROFILES, UserProfileData } from '@/data/mockUsers';

interface NewDirectMessageModalProps {
  onClose: () => void;
  isOpen: boolean;
  onSelectUser?: (user: UserProfileData) => void;
}

export const NewDirectMessageModal: React.FC<NewDirectMessageModalProps> = ({ isOpen, onClose, onSelectUser }) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredUsers = INITIAL_PROFILES.filter(u => 
    u.username.toLowerCase().includes(search.toLowerCase()) || 
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.favTeam.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl dark:bg-[#1A2234] border border-slate-200/80 dark:border-[#1E263E] flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">New Direct Message</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Search users to start an encrypted 1:1 conversation</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-[#252F48] dark:hover:bg-[#2E3B5B] text-slate-500 dark:text-slate-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, @username or franchise..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl bg-slate-50 dark:bg-[#141926] border border-slate-200 dark:border-transparent pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="flex max-h-72 flex-col gap-1.5 overflow-y-auto custom-scrollbar">
          {filteredUsers.length > 0 ? (
            filteredUsers.map(user => (
              <button
                key={user.id}
                onClick={() => {
                  if (onSelectUser) {
                    onSelectUser(user);
                  }
                  onClose();
                }}
                className="flex items-center justify-between rounded-2xl p-2.5 hover:bg-slate-100/80 dark:hover:bg-[#1E263E] text-left transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div 
                    className="h-10 w-10 shrink-0 rounded-2xl text-white flex items-center justify-center font-black text-sm shadow-sm"
                    style={{ backgroundColor: user.avatarBg }}
                  >
                    {user.avatarUrl && (user.avatarUrl.startsWith("data:") || user.avatarUrl.startsWith("http")) ? (
                      <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                      <span>{user.avatarUrl || user.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</span>
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded text-white" style={{ backgroundColor: user.favTeam === "CSK" ? "#FDB913" : user.favTeam === "MI" ? "#004BA0" : user.favTeam === "RCB" ? "#DA1818" : "#3B82F6" }}>
                        {user.favTeam}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.username} · {user.auctionsCount} drafts</span>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                  Chat
                </span>
              </button>
            ))
          ) : (
            <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
              No users found matching "{search}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
