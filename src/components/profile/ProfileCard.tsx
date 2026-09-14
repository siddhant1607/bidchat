"use client";

import React from "react";
import { X, MessageSquare, UserPlus, UserCheck, Shield, Trophy, Users, Gavel, Lock } from "lucide-react";
import { UserProfileData } from "@/data/mockUsers";

interface ProfileCardProps {
  user: UserProfileData | null;
  isOpen: boolean;
  onClose: () => void;
  onStartDM?: (user: UserProfileData) => void;
  onToggleFriend?: (user: UserProfileData) => void;
  currentUserMessagePrivacy?: "everyone" | "friends" | "nobody";
}

const TEAM_COLORS: Record<string, string> = {
  CSK: "#FDB913",
  MI: "#004BA0",
  RCB: "#DA1818",
  KKR: "#3A225D",
  SRH: "#F26522",
  DC: "#0078BC",
  RR: "#EA1A85",
  GT: "#1B2133",
  LSG: "#A7D5F2",
  PBKS: "#DD1F2D",
};

export default function ProfileCard({
  user,
  isOpen,
  onClose,
  onStartDM,
  onToggleFriend,
}: ProfileCardProps) {
  if (!isOpen || !user) return null;

  const teamColor = TEAM_COLORS[user.favTeam] || "#3B82F6";
  const canMessage = user.whoCanMessage === "everyone" || (user.whoCanMessage === "friends" && user.friendStatus === "friend");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-sm rounded-[28px] p-6 shadow-2xl bg-white dark:bg-[#1A2234] border border-slate-200/80 dark:border-[#1E263E] relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center bg-slate-100 dark:bg-[#252F48] text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#2E3B5B] transition-colors"
          title="Close profile"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Profile Header & Avatar */}
        <div className="flex flex-col items-center mt-2">
          <div className="relative mb-3">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-white font-black text-2xl shadow-lg overflow-hidden ring-4 ring-white dark:ring-[#1A2234]"
              style={{ backgroundColor: user.avatarBg }}
            >
              {user.avatarUrl && (user.avatarUrl.startsWith("data:image") || user.avatarUrl.startsWith("http")) ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl select-none">{user.avatarUrl || user.name.charAt(0)}</span>
              )}
            </div>
            {/* Online status indicator */}
            <div 
              className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-white dark:border-[#1A2234] flex items-center justify-center ${
                user.online ? "bg-emerald-500" : "bg-slate-400"
              }`}
              title={user.online ? "Online now" : "Offline"}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <h3 className="text-lg font-black text-slate-900 dark:text-white text-center">
              {user.name}
            </h3>
            {/* Favorite franchise badge */}
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-black text-white shadow-xs"
              style={{ backgroundColor: teamColor }}
              title={`Favorite Franchise: ${user.favTeam}`}
            >
              {user.favTeam}
            </span>
          </div>

          <p className="text-xs font-semibold text-slate-400 dark:text-slate-400 mb-2">
            {user.username}
          </p>

          {user.bio && (
            <p className="text-xs text-center text-slate-600 dark:text-slate-300 px-2 mb-4 leading-relaxed">
              "{user.bio}"
            </p>
          )}

          {/* Auction & Franchise Stats Banner */}
          <div className="w-full grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-[#141926] border border-slate-100 dark:border-[#1E263E] mb-5">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 mb-0.5">
                <Gavel className="w-3 h-3 text-blue-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Drafts</span>
              </div>
              <span className="text-base font-black text-slate-900 dark:text-white">
                {user.auctionsCount}
              </span>
            </div>

            <div className="flex flex-col items-center border-x border-slate-200 dark:border-[#1E263E]">
              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 mb-0.5">
                <Users className="w-3 h-3 text-teal-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Teams</span>
              </div>
              <span className="text-base font-black text-slate-900 dark:text-white">
                {user.teamsCount}
              </span>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 mb-0.5">
                <Trophy className="w-3 h-3 text-amber-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Titles</span>
              </div>
              <span className="text-base font-black text-amber-600 dark:text-amber-400">
                {user.trophiesCount}
              </span>
            </div>
          </div>

          {/* Privacy Notice if Direct Messages restricted */}
          {!canMessage && (
            <div className="w-full mb-4 p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 text-amber-700 dark:text-amber-300 text-xs">
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <span>
                {user.whoCanMessage === "nobody"
                  ? "This user has disabled incoming direct messages."
                  : "Only accepted friends can send direct messages to this user."}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2.5 w-full">
            <button
              disabled={!canMessage}
              onClick={() => {
                if (canMessage && onStartDM) {
                  onStartDM(user);
                  onClose();
                }
              }}
              className={`w-full py-3 rounded-full font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all ${
                canMessage
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25 active:scale-95"
                  : "bg-slate-200 dark:bg-[#1E263E] text-slate-400 cursor-not-allowed"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>{canMessage ? "Send Direct Message" : "Direct Messages Restricted"}</span>
            </button>

            <button
              onClick={() => onToggleFriend && onToggleFriend(user)}
              className={`w-full py-2.5 rounded-full font-bold text-xs flex items-center justify-center gap-2 transition-colors ${
                user.friendStatus === "friend"
                  ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                  : user.friendStatus === "pending"
                  ? "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                  : "bg-slate-100 dark:bg-[#252F48] hover:bg-slate-200 dark:hover:bg-[#2E3B5B] text-slate-700 dark:text-slate-300"
              }`}
            >
              {user.friendStatus === "friend" ? (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Friends</span>
                </>
              ) : user.friendStatus === "pending" ? (
                <>
                  <Shield className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Request Pending</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add Friend</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
