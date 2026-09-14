"use client";

import { useState } from 'react';
import { Menu } from 'lucide-react';

// M3 Expressive classes
const surfaceContainerClass = "bg-slate-50 dark:bg-[#1A1A1A]";
const elevatedClass = "bg-slate-100 dark:bg-[#2A2A2A]";

type Tab = 'friends' | 'requests' | 'add';

export default function FriendsList({ onOpenMenu }: { onOpenMenu?: () => void }) {
  const [activeTab, setActiveTab] = useState<Tab>('friends');

  const friends = [
    { id: 1, name: 'Rahul', username: '@rahul12', online: true },
    { id: 2, name: 'Priya', username: '@priya_csk', online: false },
    { id: 3, name: 'Amit', username: '@amit_rcb', online: true },
  ];

  const requests = [
    { id: 4, name: 'Karan', username: '@karan_mi' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#FDFCFB] dark:bg-[#121212] min-h-full p-8">
      <div className="max-w-3xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-8">
          {onOpenMenu && (
            <button 
              onClick={onOpenMenu}
              className="md:hidden p-2 -ml-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#2A2A2A] text-slate-700 dark:text-slate-300"
              title="Open Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Friends</h2>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 p-1 rounded-full bg-slate-100 dark:bg-[#2A2A2A] w-fit">
          {(['friends', 'requests', 'add'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full font-medium capitalize transition-colors ${
                activeTab === tab 
                  ? 'bg-white dark:bg-[#1E1E1E] text-blue-600 dark:text-blue-400 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tab === 'requests' ? `Requests (${requests.length})` : tab === 'add' ? 'Add Friend' : 'Friends'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className={`rounded-[28px] ${surfaceContainerClass} p-6 min-h-[400px]`}>
          
          {activeTab === 'friends' && (
            <div className="space-y-4">
              {friends.map(friend => (
                <div key={friend.id} className={`flex items-center justify-between p-4 rounded-[28px] ${elevatedClass}`}>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950 rounded-full flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-lg">
                        {friend.name[0]}
                      </div>
                      {friend.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-[#2A2A2A]" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{friend.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{friend.username}</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-medium hover:opacity-80 transition-opacity">
                    Message
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-4">
              {requests.map(req => (
                <div key={req.id} className={`flex items-center justify-between p-4 rounded-[28px] ${elevatedClass}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center font-bold text-lg text-slate-600 dark:text-slate-300">
                      {req.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{req.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{req.username}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 rounded-full bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 font-medium hover:opacity-80 transition-opacity">
                      Reject
                    </button>
                    <button className="px-4 py-2 rounded-full bg-blue-600 text-white font-medium hover:opacity-90 transition-opacity">
                      Accept
                    </button>
                  </div>
                </div>
              ))}
              {requests.length === 0 && (
                <p className="text-center text-slate-500 py-8">No pending requests</p>
              )}
            </div>
          )}

          {activeTab === 'add' && (
            <div className="max-w-md mx-auto py-8">
              <div className="flex gap-4">
                <input 
                  type="text" 
                  placeholder="Search by @username" 
                  className={`flex-1 px-6 py-4 rounded-full outline-none focus:ring-2 focus:ring-blue-500/50 bg-white dark:bg-[#1E1E1E] text-slate-900 dark:text-white`}
                />
                <button className="px-8 py-4 rounded-full bg-blue-600 text-white font-medium hover:opacity-90 transition-opacity">
                  Send
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
