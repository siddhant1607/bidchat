"use client";

import React, { useState } from "react";
import { 
  X, 
  Trophy, 
  History, 
  Users, 
  Gavel, 
  Camera, 
  Bell, 
  BellOff, 
  Trash2, 
  LogOut, 
  Check, 
  ChevronRight, 
  Calendar, 
  DollarSign, 
  Crown, 
  Shield, 
  Sparkles,
  ExternalLink,
  Plus,
  BarChart3
} from "lucide-react";

export interface AuctionHistoryRecord {
  id: string;
  tournamentName: string;
  date: string;
  status: "COMPLETED" | "LIVE" | "SCHEDULED";
  presetName: string;
  totalPurseCr: number;
  totalSpentCr: number;
  playersSold: number;
  pointSystem?: "espn" | "custom" | "none";
  championTeam: {
    name: string;
    shortName: string;
    color: string;
  };
  topBuys: {
    playerName: string;
    teamShortName: string;
    teamColor: string;
    priceCr: number;
  }[];
}

interface GroupDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  chat: {
    id: string;
    name: string;
    type: "peers" | "dugouts" | "auctions";
    iconUrl?: string;
    isAuctionActive?: boolean;
  };
  currentAuction?: {
    podiumPlayer: string;
    currentBid: number;
    leadingTeam: string;
  };
  onChangeIcon: () => void;
  onStartAuction: () => void;
  onClearChat: () => void;
  onSelectMember?: (member: { id: string; name: string; username: string; team?: string; avatarUrl?: string }) => void;
  onOpenAnalytics?: (record?: AuctionHistoryRecord) => void;
}

const SAMPLE_AUCTION_HISTORY: Record<string, AuctionHistoryRecord[]> = {
  c_1: [
    {
      id: "hist_1",
      tournamentName: "IPL 2026 Season Mock Draft #1",
      date: "Yesterday, 9:30 PM",
      status: "COMPLETED",
      presetName: "IPL 2026 Mega Auction Official",
      totalPurseCr: 120,
      totalSpentCr: 114.25,
      playersSold: 42,
      pointSystem: "espn",
      championTeam: { name: "Chennai Super Kings", shortName: "CSK", color: "#FDB913" },
      topBuys: [
        { playerName: "Virat Kohli", teamShortName: "RCB", teamColor: "#DA1818", priceCr: 21.5 },
        { playerName: "Jasprit Bumrah", teamShortName: "MI", teamColor: "#004BA0", priceCr: 18.0 },
        { playerName: "Rishabh Pant", teamShortName: "CSK", teamColor: "#FDB913", priceCr: 17.5 },
        { playerName: "Heinrich Klaasen", teamShortName: "SRH", teamColor: "#F26522", priceCr: 16.0 },
      ]
    },
    {
      id: "hist_2",
      tournamentName: "Turbo 15s Blitz Draft",
      date: "3 days ago",
      status: "COMPLETED",
      presetName: "Turbo 15s Blitz Draft",
      totalPurseCr: 80,
      totalSpentCr: 72.5,
      playersSold: 28,
      pointSystem: "none",
      championTeam: { name: "Mumbai Indians", shortName: "MI", color: "#004BA0" },
      topBuys: [
        { playerName: "Travis Head", teamShortName: "SRH", teamColor: "#F26522", priceCr: 14.5 },
        { playerName: "Mitchell Starc", teamShortName: "KKR", teamColor: "#3A225D", priceCr: 13.75 },
        { playerName: "Nicholas Pooran", teamShortName: "LSG", teamColor: "#A7D5F2", priceCr: 12.0 },
      ]
    },
    {
      id: "hist_3",
      tournamentName: "College Premier League Exhibition",
      date: "Last week",
      status: "COMPLETED",
      presetName: "College Premier League",
      totalPurseCr: 50,
      totalSpentCr: 46.0,
      playersSold: 22,
      pointSystem: "none",
      championTeam: { name: "Royal Challengers Bengaluru", shortName: "RCB", color: "#DA1818" },
      topBuys: [
        { playerName: "Glenn Maxwell", teamShortName: "RCB", teamColor: "#DA1818", priceCr: 11.0 },
        { playerName: "Rashid Khan", teamShortName: "GT", teamColor: "#1B2133", priceCr: 10.5 },
      ]
    }
  ]
};

const SAMPLE_MEMBERS = [
  { id: "m_1", name: "You", username: "@siddhant", role: "Owner", team: "CSK", teamColor: "#FDB913", online: true },
  { id: "m_2", name: "Rajat Verma", username: "@rajat", role: "Member", team: "MI", teamColor: "#004BA0", online: true },
  { id: "m_3", name: "Vikram Singh", username: "@vikram", role: "Member", team: "RCB", teamColor: "#DA1818", online: false },
  { id: "m_4", name: "Priya Patel", username: "@priya_csk", role: "Member", team: "CSK", teamColor: "#FDB913", online: true },
  { id: "m_5", name: "Ananya Sharma", username: "@ananya", role: "Member", team: "KKR", teamColor: "#3A225D", online: false },
  { id: "m_6", name: "Kunal Shah", username: "@kunal_srh", role: "Member", team: "SRH", teamColor: "#F26522", online: true },
];

export default function GroupDetailsDrawer({
  isOpen,
  onClose,
  chat,
  currentAuction,
  onChangeIcon,
  onStartAuction,
  onClearChat,
  onSelectMember,
  onOpenAnalytics,
}: GroupDetailsDrawerProps) {
  const [activeTab, setActiveTab] = useState<"history" | "members">("history");
  const [isMuted, setIsMuted] = useState(false);

  if (!isOpen) return null;

  const historyRecords = SAMPLE_AUCTION_HISTORY[chat.id] || SAMPLE_AUCTION_HISTORY["c_1"] || [];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <aside className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-[#121624] border-l border-slate-200/80 dark:border-[#1E263E] shadow-2xl flex flex-col justify-between z-50 animate-in slide-in-from-right duration-200">
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200/80 dark:border-[#1E263E] flex items-center justify-between shrink-0 bg-white/70 dark:bg-[#121624]/70 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-base text-slate-900 dark:text-white">Group Details</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#1A2234] hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
          
          {/* Group Identity Card */}
          <div className="p-5 rounded-[24px] bg-slate-50 dark:bg-[#161B28] border border-slate-200/70 dark:border-[#252F48] flex flex-col items-center text-center gap-3">
            
            {/* Group Icon with Change trigger */}
            <div className="relative group cursor-pointer" onClick={onChangeIcon} title="Change group icon / photo">
              <div className="w-20 h-20 rounded-[22px] flex items-center justify-center shadow-lg overflow-hidden text-white">
                {chat.iconUrl ? (
                  chat.iconUrl.startsWith("data:") || chat.iconUrl.startsWith("http") ? (
                    <img src={chat.iconUrl} alt={chat.name} className="w-full h-full object-cover rounded-[22px]" />
                  ) : (
                    <div className="w-full h-full rounded-[22px] bg-blue-600 flex items-center justify-center text-4xl select-none">
                      {chat.iconUrl}
                    </div>
                  )
                ) : (
                  <div className="w-full h-full rounded-[22px] bg-blue-600 flex items-center justify-center text-3xl font-black">
                    {chat.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-[22px] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>

            <div>
              <h3 className="font-black text-lg text-slate-900 dark:text-white">{chat.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {chat.type === "dugouts" ? "Encrypted Franchise Dugout" : "IPL Mock Auction Syndicate"} • 6 Members
              </p>
            </div>

            {/* Quick Action Pills */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={onStartAuction}
                className="px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <Gavel className="w-3.5 h-3.5" />
                <span>Start Auction</span>
              </button>
              <button
                onClick={onChangeIcon}
                className="px-3.5 py-1.5 rounded-full bg-white dark:bg-[#1E2638] border border-slate-200 dark:border-[#252F48] hover:bg-slate-100 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Icon</span>
              </button>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2 rounded-full border text-xs transition-colors ${
                  isMuted 
                    ? "bg-rose-50 dark:bg-rose-950/30 text-rose-600 border-rose-200 dark:border-rose-900/40" 
                    : "bg-white dark:bg-[#1E2638] border-slate-200 dark:border-[#252F48] text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                }`}
                title={isMuted ? "Unmute Notifications" : "Mute Notifications"}
              >
                {isMuted ? <BellOff className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Section Tabs */}
          <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-[#161B28] border border-slate-200/50 dark:border-[#252F48]">
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "history"
                  ? "bg-white dark:bg-[#1E2638] text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Auction History ({historyRecords.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("members")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "members"
                  ? "bg-white dark:bg-[#1E2638] text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Members ({SAMPLE_MEMBERS.length})</span>
            </button>
          </div>

          {/* TAB 1: GROUP AUCTION HISTORY */}
          {activeTab === "history" && (
            <div className="space-y-3.5 animate-in fade-in duration-200">
              
              {/* Active Auction Live Banner (if ongoing) */}
              {chat.isAuctionActive && (
                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-[#181F30] border border-blue-200 dark:border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black animate-pulse">
                      LIVE ONGOING
                    </span>
                    <span className="text-[10px] text-teal-400 font-bold">Round 1</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-slate-400">Podium Player</div>
                      <div className="font-black text-sm text-slate-900 dark:text-white">{currentAuction?.podiumPlayer || "Virat Kohli"}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-slate-400">Leading Bid</div>
                      <div className="font-black text-sm text-teal-500">₹{currentAuction?.currentBid || 2.0} Cr ({currentAuction?.leadingTeam || "None"})</div>
                    </div>
                  </div>
                  <button
                    onClick={() => onOpenAnalytics && onOpenAnalytics()}
                    className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>View Live Analytics & Stats</span>
                  </button>
                </div>
              )}

              {/* Past Tournaments List */}
              <div className="space-y-3">
                {historyRecords.map((record) => (
                  <div 
                    key={record.id}
                    className="p-4 rounded-2xl bg-white dark:bg-[#1A2234] border border-slate-200/80 dark:border-[#252F48] shadow-sm space-y-3 hover:border-blue-400/50 transition-colors"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Trophy className="w-3.5 h-3.5 text-amber-500" />
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">{record.tournamentName}</h4>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                          <span>{record.date}</span>
                          <span>•</span>
                          <span>{record.playersSold} Players Sold</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black shrink-0">
                          {record.status}
                        </span>
                        {record.pointSystem === "espn" && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-[9px] font-bold">
                            ⭐ ESPN MVP
                          </span>
                        )}
                        {record.pointSystem === "custom" && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 text-[9px] font-bold">
                            ⚡ Custom Pts
                          </span>
                        )}
                        {record.pointSystem === "none" && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#141926] text-slate-500 text-[9px] font-bold">
                            🚫 Pure Auction
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stats Pill */}
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#141926] flex items-center justify-between text-xs">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Total Spent</div>
                        <div className="font-black text-blue-600 dark:text-blue-400">₹{record.totalSpentCr} / ₹{record.totalPurseCr} Cr</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Champion Syndicate</div>
                        <div className="font-black text-slate-900 dark:text-white flex items-center gap-1.5 justify-end">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: record.championTeam.color }} />
                          <span>{record.championTeam.name}</span>
                        </div>
                      </div>
                    </div>

                    {/* Top Buys in this Auction */}
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
                        Marquee Buys:
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {record.topBuys.map((buy, idx) => (
                          <div key={idx} className="p-2 rounded-xl bg-slate-50 dark:bg-[#151B28] border border-slate-200/50 dark:border-[#252F48] flex items-center justify-between text-xs">
                            <div className="min-w-0 pr-1">
                              <div className="font-bold text-[11px] truncate text-slate-800 dark:text-slate-200">{buy.playerName}</div>
                              <span className="text-[9px] px-1 py-0.2 rounded font-black text-white" style={{ backgroundColor: buy.teamColor }}>
                                {buy.teamShortName}
                              </span>
                            </div>
                            <div className="font-black text-[11px] text-teal-600 dark:text-teal-400 shrink-0">
                              ₹{buy.priceCr} Cr
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* View Analytics & Stats Button */}
                    <button
                      onClick={() => onOpenAnalytics && onOpenAnalytics(record)}
                      className="w-full py-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>View Analytics & Stats</span>
                    </button>

                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 2: GROUP MEMBERS */}
          {activeTab === "members" && (
            <div className="space-y-2.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs text-slate-500 px-1 mb-1">
                <span>{SAMPLE_MEMBERS.length} Participants</span>
                <span className="text-emerald-500 font-bold">● {SAMPLE_MEMBERS.filter(m => m.online).length} Online</span>
              </div>

              {SAMPLE_MEMBERS.map((member) => (
                <div 
                  key={member.id}
                  onClick={() => onSelectMember && onSelectMember(member)}
                  className="p-3 rounded-2xl bg-white dark:bg-[#1A2234] border border-slate-200/80 dark:border-[#252F48] hover:border-blue-500/70 flex items-center justify-between gap-3 shadow-sm cursor-pointer transition-all hover:bg-slate-50/60 dark:hover:bg-[#1C2538]"
                  title={`Click to view ${member.name}'s profile`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                        {member.name.charAt(0)}
                      </div>
                      {member.online && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#1A2234]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-slate-900 dark:text-white truncate hover:underline">{member.name}</span>
                        {member.role === "Owner" && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/50 text-amber-600 text-[9px] font-bold">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 truncate">{member.username}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-[#141926] text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: member.teamColor }} />
                    <span>{member.team}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Group Settings / Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-[#1E263E] space-y-2">
            <button
              onClick={onClearChat}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1A2234] text-xs font-bold transition-colors"
            >
              <Trash2 className="w-4 h-4 text-slate-400" />
              <span>Clear Chat Messages</span>
            </button>
            <button
              onClick={onClose}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Leave Group</span>
            </button>
          </div>

        </div>

      </aside>
    </div>
  );
}
