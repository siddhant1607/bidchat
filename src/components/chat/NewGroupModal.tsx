"use client";

import React, { useState, useRef } from "react";
import { Camera, Image as ImageIcon, X, Check, Users } from "lucide-react";

interface NewGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup?: (groupData: { name: string; description: string; iconUrl?: string; memberIds: string[] }) => void;
}

const mockFriends = [
  { id: "1", name: "Rajat Verma", username: "@rajat" },
  { id: "2", name: "Ananya Sharma", username: "@ananya" },
  { id: "3", name: "Vikram Singh", username: "@vikram" },
  { id: "4", name: "Priya Patel", username: "@priya_csk" },
];

const PRESET_GROUP_ICONS = [
  "🏆", "🔨", "🏏", "🔥", "⚡", "👑", "🦁", "🛡️", "🎯", "💰", "🏟️", "🚀"
];

export const NewGroupModal: React.FC<NewGroupModalProps> = ({ isOpen, onClose, onCreateGroup }) => {
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFriends, setSelectedFriends] = useState<string[]>(["1"]);
  const [selectedIcon, setSelectedIcon] = useState<string>("🏆");
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleToggleFriend = (id: string) => {
    setSelectedFriends(prev => 
      prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 256;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          setCustomPhotoUrl(dataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleCreate = () => {
    if (!groupName.trim()) return;

    if (onCreateGroup) {
      onCreateGroup({
        name: groupName.trim(),
        description: description.trim(),
        iconUrl: customPhotoUrl || selectedIcon,
        memberIds: selectedFriends,
      });
    }

    setGroupName("");
    setDescription("");
    setCustomPhotoUrl(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-[28px] bg-white dark:bg-[#1E2638] border border-slate-200 dark:border-[#2A344A] p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#2A344A]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Create New Group</h2>
              <p className="text-xs text-slate-400">Set up a chat room or auction syndicate</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 dark:bg-[#252F48] hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Group Icon & Photo Section */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#151B28] border border-slate-200/60 dark:border-[#252F48] flex items-center gap-4">
          <div className="relative group shrink-0">
            {customPhotoUrl ? (
              <img 
                src={customPhotoUrl} 
                alt="Group Icon" 
                className="w-16 h-16 rounded-2xl object-cover shadow-md border-2 border-blue-500" 
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-3xl shadow-md text-white select-none">
                {selectedIcon}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md hover:bg-blue-700 transition-colors"
              title="Upload custom image"
            >
              <Camera className="w-3 h-3" />
            </button>
            <input 
              ref={fileInputRef} 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload} 
              className="hidden" 
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Group Icon / Photo</span>
              {customPhotoUrl && (
                <button 
                  type="button" 
                  onClick={() => setCustomPhotoUrl(null)} 
                  className="text-[10px] text-rose-500 hover:underline font-bold"
                >
                  Reset to Icon
                </button>
              )}
            </div>

            {/* Icon Badges Palette */}
            <div className="flex flex-wrap gap-1.5">
              {PRESET_GROUP_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => {
                    setSelectedIcon(icon);
                    setCustomPhotoUrl(null);
                  }}
                  className={`w-7 h-7 rounded-xl text-sm flex items-center justify-center transition-all ${
                    !customPhotoUrl && selectedIcon === icon
                      ? "bg-blue-600 text-white scale-110 shadow-sm"
                      : "bg-white dark:bg-[#252F48] hover:scale-105"
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Inputs */}
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Group Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Mega Auction Kings"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full rounded-2xl bg-slate-50 dark:bg-[#252F48] px-4 py-2.5 outline-none border border-slate-200 dark:border-transparent focus:ring-2 focus:ring-blue-500 text-sm font-bold text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Description (Optional)
            </label>
            <textarea
              placeholder="Strategy, player bids, retention talks..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full resize-none rounded-2xl bg-slate-50 dark:bg-[#252F48] px-4 py-2.5 outline-none border border-slate-200 dark:border-transparent focus:ring-2 focus:ring-blue-500 text-xs text-slate-900 dark:text-white"
              rows={2}
            />
          </div>
        </div>

        {/* Friends Selection */}
        <div>
          <h3 className="mb-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Add Friends ({selectedFriends.length} selected)
          </h3>
          <div className="flex max-h-36 flex-col gap-1.5 overflow-y-auto rounded-2xl bg-slate-50 dark:bg-[#151B28] p-2 custom-scrollbar">
            {mockFriends.map(friend => (
              <label 
                key={friend.id} 
                className="flex cursor-pointer items-center justify-between gap-3 rounded-xl p-2 hover:bg-white dark:hover:bg-[#252F48] transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {friend.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block truncate">{friend.name}</span>
                    <span className="text-[10px] text-slate-400 block truncate">{friend.username}</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={selectedFriends.includes(friend.id)}
                  onChange={() => handleToggleFriend(friend.id)}
                  className="h-4 w-4 accent-blue-600 rounded"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 dark:border-[#2A344A] flex justify-end gap-2">
          <button 
            type="button" 
            onClick={onClose} 
            className="rounded-full px-4 py-2 text-xs font-bold hover:bg-slate-100 dark:hover:bg-[#252F48] text-slate-500 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={!groupName.trim()}
            className="rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 py-2 text-xs font-bold text-white transition-all shadow-md shadow-blue-500/20"
          >
            Create Group
          </button>
        </div>
      </div>
    </div>
  );
};
