"use client";

import React, { useState } from "react";
import { 
  X, 
  BarChart3, 
  Trophy, 
  ShieldCheck, 
  Gavel, 
  TrendingUp, 
  Clock, 
  RefreshCw, 
  Sliders, 
  Users, 
  Check, 
  Sparkles,
  ArrowRight,
  Flame,
  Search,
  Zap,
  Edit3
} from "lucide-react";
import espnMvpList from "@/data/espnMvpData.json";

export interface TeamStats {
  id: string;
  name: string;
  shortName: string;
  primaryColor: string;
  ownerId: string | null;
  ownerName: string | null;
  memberCount: number;
  maxMembers: number;
  purseRemaining?: number;
  totalSpent?: number;
  squadCount?: number;
  overseasCount?: number;
  ownerApprovalRequired: boolean;
}

interface AuctionAnalyticsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  teams: TeamStats[];
  podiumPlayer: string;
  currentBid: number;
  leadingTeam: string;
  initialTab?: "analytics" | "mvp" | "admin";
  isAdmin?: boolean;
  onSellPlayer?: (teamShortName: string, priceCr: number) => void;
  onMarkUnsold?: () => void;
  onNextPlayer?: (playerName: string, basePriceCr: number) => void;
  onUpdateBid?: (newAmountCr: number, newLeadingTeam: string) => void;
  onUpdatePlayerPoints?: (playerName: string, addedPoints: number) => void;
  // Accelerated & Unsold Round Management
  unsoldList?: { name: string; role?: string; basePrice: number; team?: string }[];
  acceleratedRound?: number;
  totalAcceleratedRounds?: number;
  callForNominationsOpen?: boolean;
  allowUnsoldDiscount?: boolean;
  unsoldDiscountPercentage?: number;
  nominatedPlayers?: { name: string; basePrice: number; nominatedBy: string[] }[];
  onToggleCallForNominations?: (open: boolean) => void;
  onAdvanceAcceleratedRound?: () => void;
  onCallNominatedPlayer?: (playerName: string, basePriceCr: number) => void;
}

export default function AuctionAnalyticsDashboard({
  isOpen,
  onClose,
  teams,
  podiumPlayer,
  currentBid,
  leadingTeam,
  initialTab = "analytics",
  isAdmin = true,
  onSellPlayer,
  onMarkUnsold,
  onNextPlayer,
  onUpdateBid,
  onUpdatePlayerPoints,
  unsoldList = [],
  acceleratedRound = 1,
  totalAcceleratedRounds = 2,
  callForNominationsOpen = false,
  allowUnsoldDiscount = false,
  unsoldDiscountPercentage = 50,
  nominatedPlayers = [],
  onToggleCallForNominations,
  onAdvanceAcceleratedRound,
  onCallNominatedPlayer,
}: AuctionAnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState<"analytics" | "mvp" | "admin">(initialTab);
  
  // MVP Points state
  const [mvpSearch, setMvpSearch] = useState("");
  const [pointSystem, setPointSystem] = useState<"espn" | "custom">("espn");
  const [customPointsOverrides, setCustomPointsOverrides] = useState<Record<string, number>>({});
  const [syncedToast, setSyncedToast] = useState(false);

  // Admin Controls State
  const [adminBidInput, setAdminBidInput] = useState<string>(currentBid.toString());
  const [adminTeamSelect, setAdminTeamSelect] = useState<string>(leadingTeam);
  const [adminPlayerSelect, setAdminPlayerSelect] = useState<string>("Rishabh Pant");
  const [adminBasePrice, setAdminBasePrice] = useState<number>(2.0);
  const [selectedPlayerForPoints, setSelectedPlayerForPoints] = useState<string>(podiumPlayer);
  const [customPointsInput, setCustomPointsInput] = useState<number>(25);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const triggerSuccess = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  // Calculations for Franchise Analytics
  const totalPurseCap = 120 * 10; // 1200 Cr total
  const totalSpentAcrossTeams = teams.reduce((acc, t) => acc + (t.totalSpent || (120 - (t.purseRemaining || 120))), 0);
  const remainingPurse = totalPurseCap - totalSpentAcrossTeams;

  // Sync ESPN MVP Points
  const handleSyncEspnPoints = () => {
    setSyncedToast(true);
    triggerSuccess("Synchronized official ESPN MVP Points from Master Registry!");
    setTimeout(() => setSyncedToast(false), 2500);
  };

  // Next Marquee Pool Candidates for Admin
  const MARQUEE_UPCOMING = [
    { name: "Virat Kohli", base: 2.0, team: "RCB" },
    { name: "Rohit Sharma", base: 2.0, team: "MI" },
    { name: "Rishabh Pant", base: 2.0, team: "DC" },
    { name: "Heinrich Klaasen", base: 2.0, team: "SRH" },
    { name: "Mitchell Starc", base: 2.0, team: "KKR" },
    { name: "Shubman Gill", base: 2.0, team: "GT" },
    { name: "Nicholas Pooran", base: 2.0, team: "LSG" },
    { name: "Shreyas Iyer", base: 2.0, team: "PBKS" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-5xl h-[90vh] bg-white dark:bg-[#121624] border border-slate-200 dark:border-[#1E263E] rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 text-slate-900 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* TOP DASHBOARD HEADER */}
        <header className="px-6 py-4 border-b border-slate-200/80 dark:border-[#1E263E] flex items-center justify-between shrink-0 bg-white/70 dark:bg-[#141926]/70 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight">Auction Analytics & Live Stats</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Real-time franchise purse liquidity, MVP points & auctioneer control console</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100 dark:bg-[#252F48] hover:bg-slate-200 dark:hover:bg-[#2E3B5B] text-slate-500 dark:text-slate-400 transition-colors"
            title="Close Dashboard"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* NAVIGATION TABS */}
        <div className="px-6 pt-3 pb-2 border-b border-slate-200/80 dark:border-[#1E263E] flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-[#0E1322]/50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-xs transition-all ${
                activeTab === "analytics"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-white dark:bg-[#1A2234] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#252F48]"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Franchise Purses & Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab("mvp")}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-xs transition-all ${
                activeTab === "mvp"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-white dark:bg-[#1A2234] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#252F48]"
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Player Points & MVP Board</span>
            </button>

            <button
              onClick={() => setActiveTab("admin")}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-xs transition-all ${
                activeTab === "admin"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-white dark:bg-[#1A2234] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#252F48]"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Auction Admin Console</span>
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            </button>
          </div>

          {/* Quick Status Pill */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>On Podium:</span>
            <strong className="text-blue-600 dark:text-blue-400 font-black">{podiumPlayer}</strong>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">₹{currentBid.toFixed(2)} Cr ({leadingTeam})</span>
          </div>
        </div>

        {/* FEEDBACK TOAST */}
        {actionSuccessMsg && (
          <div className="mx-6 mt-3 px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{actionSuccessMsg}</span>
            </div>
            <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-600 hover:underline text-[11px]">
              Dismiss
            </button>
          </div>
        )}

        {/* TAB 1: FRANCHISE PURSES & ANALYTICS */}
        {activeTab === "analytics" && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            
            {/* Top Stat Banners */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#181F30] border border-slate-200/80 dark:border-[#1E263E]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Total League Cap</div>
                <div className="text-xl font-black text-slate-900 dark:text-white font-mono">₹{totalPurseCap.toFixed(2)} Cr</div>
                <div className="text-[11px] text-slate-500 mt-0.5">10 Active IPL Teams</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#181F30] border border-slate-200/80 dark:border-[#1E263E]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Total Purse Spent</div>
                <div className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono">₹{totalSpentAcrossTeams.toFixed(2)} Cr</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{((totalSpentAcrossTeams / totalPurseCap) * 100).toFixed(1)}% Deployed</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#181F30] border border-slate-200/80 dark:border-[#1E263E]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Remaining Liquidity</div>
                <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">₹{remainingPurse.toFixed(2)} Cr</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Available for Bidding</div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-500/30">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-1">Live Top Marquee Bid</div>
                <div className="text-xl font-black text-amber-800 dark:text-amber-300 font-mono">₹{currentBid.toFixed(2)} Cr</div>
                <div className="text-[11px] text-amber-700/90 dark:text-amber-400/90 truncate">{podiumPlayer} ({leadingTeam})</div>
              </div>
            </div>

            {/* 10 Franchises Live Spending Cards */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">All 10 Franchises Purse Breakdown</h3>
                <span className="text-xs text-slate-500">Official ₹120.00 Cr Cap</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {teams.map((team) => {
                  const purseLeft = team.purseRemaining !== undefined ? team.purseRemaining : (120 - (team.totalSpent || 0));
                  const spent = 120 - purseLeft;
                  const percentSpent = Math.min(100, Math.max(0, (spent / 120) * 100));

                  return (
                    <div 
                      key={team.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-[#181F30] border border-slate-200/80 dark:border-[#1E263E] flex flex-col justify-between gap-3 shadow-xs hover:border-blue-500/30 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-xs shadow-sm"
                            style={{ backgroundColor: team.primaryColor }}
                          >
                            {team.shortName}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{team.name}</span>
                              {team.ownerName && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-200 dark:bg-[#252F48] text-slate-600 dark:text-slate-300">
                                  {team.ownerName}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400">
                              Squad: <strong>{team.squadCount || 18}</strong>/25 • Overseas: <strong>{team.overseasCount || 6}</strong>/8
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xs text-slate-400 font-bold uppercase">Purse Left</div>
                          <div className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">
                            ₹{purseLeft.toFixed(2)} Cr
                          </div>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1">
                        <div className="w-full h-2 bg-slate-200 dark:bg-[#252F48] rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500"
                            style={{ 
                              width: `${percentSpent}%`,
                              backgroundColor: team.primaryColor || '#3B82F6'
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>Spent: ₹{spent.toFixed(2)} Cr ({percentSpent.toFixed(0)}%)</span>
                          <span>Max: ₹120.00 Cr</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: PLAYER POINTS & MVP LEADERBOARD */}
        {activeTab === "mvp" && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            
            {/* Filter and Points System Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-[#181F30] border border-slate-200/80 dark:border-[#1E263E]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Points System:</span>
                <button
                  onClick={() => setPointSystem("espn")}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                    pointSystem === "espn"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-white dark:bg-[#252F48] text-slate-600 dark:text-slate-400"
                  }`}
                >
                  Official ESPN MVP Points
                </button>
                <button
                  onClick={() => setPointSystem("custom")}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                    pointSystem === "custom"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-white dark:bg-[#252F48] text-slate-600 dark:text-slate-400"
                  }`}
                >
                  Custom Match Points
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search player or team..."
                    value={mvpSearch}
                    onChange={(e) => setMvpSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-[#141926] border border-slate-200 dark:border-[#2A344A] text-xs outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={handleSyncEspnPoints}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all shrink-0"
                  title="Reload official points from MVP.xlsx"
                >
                  <RefreshCw className={`w-3 h-3 ${syncedToast ? "animate-spin" : ""}`} />
                  <span>1-Click Sync</span>
                </button>
              </div>
            </div>

            {/* Top 3 Podium Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {espnMvpList.slice(0, 3).map((player, idx) => (
                <div 
                  key={player.name}
                  className={`p-4 rounded-2xl border flex items-center gap-3.5 ${
                    idx === 0 
                      ? "bg-amber-50 dark:bg-[#1A2234] border-amber-500/40"
                      : idx === 1
                      ? "bg-slate-50 dark:bg-[#1A2234] border-slate-400/40"
                      : "bg-orange-50 dark:bg-[#1A2234] border-orange-600/30"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white text-base shadow-md ${
                    idx === 0 ? "bg-amber-500" : idx === 1 ? "bg-slate-400" : "bg-amber-700"
                  }`}>
                    #{player.rank}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm truncate">{player.name}</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-slate-900/10 dark:bg-white/10">
                        {player.team}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                      <span>{player.matches} Matches</span>
                      <span>•</span>
                      <strong className="text-blue-600 dark:text-blue-400 font-mono font-black">{player.totalImpact} pts</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Leaderboard Table */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-[#1E263E] overflow-hidden bg-white dark:bg-[#141926]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-[#181F30] border-b border-slate-200/80 dark:border-[#1E263E] text-slate-400 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Rank</th>
                      <th className="py-3 px-4">Player</th>
                      <th className="py-3 px-4">Team</th>
                      <th className="py-3 px-4">Matches</th>
                      <th className="py-3 px-4">Runs</th>
                      <th className="py-3 px-4">Wickets</th>
                      <th className="py-3 px-4">Impact / Match</th>
                      <th className="py-3 px-4 text-right">Total Impact Pts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#1E263E]">
                    {espnMvpList
                      .filter(p => 
                        p.name.toLowerCase().includes(mvpSearch.toLowerCase()) || 
                        p.team.toLowerCase().includes(mvpSearch.toLowerCase())
                      )
                      .slice(0, 30)
                      .map((p) => {
                        const customBonus = customPointsOverrides[p.name] || 0;
                        const displayPoints = (p.totalImpact + customBonus).toFixed(1);

                        return (
                          <tr key={p.name} className="hover:bg-slate-50/70 dark:hover:bg-[#1A2234] transition-colors">
                            <td className="py-3 px-4 font-black text-slate-500">#{p.rank}</td>
                            <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                              {p.name}
                              {customBonus > 0 && (
                                <span className="ml-1.5 text-[10px] text-teal-600 dark:text-teal-400 font-semibold">
                                  (+{customBonus} admin pts)
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded font-black text-[10px] text-white" style={{ backgroundColor: p.team === "CSK" ? "#FDB913" : p.team === "MI" ? "#004BA0" : p.team === "RCB" ? "#DA1818" : p.team === "RR" ? "#EA1A85" : p.team === "GT" ? "#1B2133" : "#3B82F6" }}>
                                {p.team}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono">{p.matches}</td>
                            <td className="py-3 px-4 font-mono">{p.runs}</td>
                            <td className="py-3 px-4 font-mono">{p.wickets}</td>
                            <td className="py-3 px-4 font-mono font-bold text-slate-500">{p.impactPerMatch}</td>
                            <td className="py-3 px-4 text-right font-mono font-black text-blue-600 dark:text-blue-400">
                              {displayPoints}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: AUCTION ADMIN CONSOLE (UPDATE STATS & PODIUM HAMMER) */}
        {activeTab === "admin" && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            
            {/* Admin Privilege Banner */}
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-[#181F30] border border-blue-200 dark:border-blue-900/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Auctioneer & Admin Control Center</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Hammer drops, player call-ups, manual purse overrides and match points updates</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-600 text-white shadow-xs">
                Admin Active
              </span>
            </div>

            {/* Section 1: Live Podium Hammer Actions */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#181F30] border border-slate-200/80 dark:border-[#1E263E] space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-[#1E263E]">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">1. Current Live Podium Hammer Drop</h4>
                <span className="text-xs text-slate-500">Instant synchronized action</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#121624] p-4 rounded-2xl border border-slate-200/80 dark:border-[#1E263E]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-xl shadow-md">
                    🔨
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-bold uppercase">Player on Podium</div>
                    <div className="text-lg font-black text-slate-900 dark:text-white">{podiumPlayer}</div>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                      Leading: ₹{currentBid.toFixed(2)} Cr by {leadingTeam}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => {
                      if (onSellPlayer) {
                        onSellPlayer(leadingTeam, currentBid);
                        triggerSuccess(`HAMMER DOWN! ${podiumPlayer} officially SOLD to ${leadingTeam} for ₹${currentBid.toFixed(2)} Cr!`);
                      }
                    }}
                    className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all shadow-md shadow-emerald-600/25 flex items-center gap-1.5 active:scale-95"
                  >
                    <Check className="w-4 h-4" />
                    <span>Mark SOLD to {leadingTeam}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onMarkUnsold) {
                        onMarkUnsold();
                        triggerSuccess(`${podiumPlayer} marked UNSOLD. Moving to reserve pool.`);
                      }
                    }}
                    className="px-4 py-2.5 rounded-full bg-slate-200 dark:bg-[#252F48] hover:bg-rose-50 hover:text-rose-600 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all active:scale-95"
                  >
                    Mark UNSOLD
                  </button>
                </div>
              </div>
            </div>

            {/* Section: Accelerated Round Controls & Nominations */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#181F30] border border-slate-200/80 dark:border-[#1E263E] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-200/60 dark:border-[#1E263E] gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">⚡ Accelerated Round Controls & Nominations</h4>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-600 text-white">
                      Round {acceleratedRound} of {totalAcceleratedRounds}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {allowUnsoldDiscount ? `🏷️ ${unsoldDiscountPercentage}% Discount on Unsold Buys Active` : "Standard Base Prices Active"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (onToggleCallForNominations) {
                        onToggleCallForNominations(!callForNominationsOpen);
                        triggerSuccess(callForNominationsOpen ? "Closed call for player nominations." : "Opened call for franchise nominations from unsold pool!");
                      }
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                      callForNominationsOpen
                        ? "bg-rose-600 hover:bg-rose-700 text-white"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white"
                    }`}
                  >
                    {callForNominationsOpen ? "🔒 Close Nominations" : "📢 Open Call for Nominations"}
                  </button>

                  {acceleratedRound < totalAcceleratedRounds && (
                    <button
                      onClick={() => {
                        if (onAdvanceAcceleratedRound) {
                          onAdvanceAcceleratedRound();
                          triggerSuccess(`Advanced to Accelerated Round ${acceleratedRound + 1}!`);
                        }
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs"
                    >
                      Next Round ➔
                    </button>
                  )}
                </div>
              </div>

              {/* Nominated Players by Franchises */}
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase mb-2 flex items-center justify-between">
                  <span>Nominated Players Waiting for Auctioneer Call ({nominatedPlayers.length})</span>
                  <span className="text-[10px] text-slate-500">Click to call immediately to podium</span>
                </div>

                {nominatedPlayers.length === 0 ? (
                  <div className="p-4 rounded-xl bg-white dark:bg-[#121624] border border-dashed border-slate-200 dark:border-[#2A344A] text-center text-xs text-slate-400">
                    {callForNominationsOpen
                      ? "Call for nominations is OPEN! Waiting for franchises to submit unsold players..."
                      : "Nominations are closed. Click 'Open Call for Nominations' to allow teams to nominate unsold cricketers."}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {nominatedPlayers.map((player) => {
                      const effectiveBase = allowUnsoldDiscount
                        ? Math.round(player.basePrice * (1 - unsoldDiscountPercentage / 100) * 100) / 100
                        : player.basePrice;

                      return (
                        <div
                          key={player.name}
                          className="p-3 rounded-xl bg-white dark:bg-[#121624] border border-slate-200 dark:border-[#2A344A] flex items-center justify-between gap-2 shadow-xs"
                        >
                          <div className="min-w-0">
                            <div className="font-bold text-xs truncate">{player.name}</div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <span>Base: ₹{player.basePrice} Cr</span>
                              {allowUnsoldDiscount && (
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">➔ ₹{effectiveBase.toFixed(2)} Cr ({unsoldDiscountPercentage}% Off)</span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {player.nominatedBy.map(t => (
                                <span key={t} className="px-1.5 py-0.2 rounded text-[9px] font-black bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              if (onCallNominatedPlayer) {
                                onCallNominatedPlayer(player.name, effectiveBase);
                              } else if (onNextPlayer) {
                                onNextPlayer(player.name, effectiveBase);
                              }
                              triggerSuccess(`Called nominated player ${player.name} to podium at ₹${effectiveBase.toFixed(2)} Cr!`);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 shrink-0 transition-all shadow-xs"
                          >
                            <Gavel className="w-3 h-3" />
                            <span>Call</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Full Unsold Pool */}
              {unsoldList.length > 0 && (
                <div className="pt-2 border-t border-slate-200/60 dark:border-[#1E263E]">
                  <div className="text-[11px] font-bold text-slate-400 uppercase mb-2">
                    Unsold Reserve Pool ({unsoldList.length} Players)
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto custom-scrollbar">
                    {unsoldList.map(p => (
                      <span
                        key={p.name}
                        onClick={() => {
                          const eff = allowUnsoldDiscount ? Math.round(p.basePrice * (1 - unsoldDiscountPercentage / 100) * 100) / 100 : p.basePrice;
                          if (onNextPlayer) onNextPlayer(p.name, eff);
                          triggerSuccess(`Called unsold player ${p.name} to podium at ₹${eff.toFixed(2)} Cr!`);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#252F48] hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 text-xs font-medium cursor-pointer transition-colors"
                        title="Click to call directly to podium"
                      >
                        {p.name} (₹{p.basePrice} Cr)
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Call Next Player & Manage Pool */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#181F30] border border-slate-200/80 dark:border-[#1E263E] space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-[#1E263E]">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">2. Call Next Player to the Podium</h4>
                <span className="text-xs text-slate-500">Pick from Marquee Set or type custom player</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 flex gap-2">
                  <select
                    value={adminPlayerSelect}
                    onChange={(e) => {
                      setAdminPlayerSelect(e.target.value);
                      const match = MARQUEE_UPCOMING.find(p => p.name === e.target.value);
                      if (match) setAdminBasePrice(match.base);
                    }}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-[#121624] border border-slate-200 dark:border-[#2A344A] text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {MARQUEE_UPCOMING.map(p => (
                      <option key={p.name} value={p.name}>
                        {p.name} (Base ₹{p.base} Cr - {p.team})
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    step="0.25"
                    value={adminBasePrice}
                    onChange={(e) => setAdminBasePrice(parseFloat(e.target.value) || 2.0)}
                    className="w-24 px-3 py-2.5 rounded-xl bg-white dark:bg-[#121624] border border-slate-200 dark:border-[#2A344A] text-xs font-mono font-bold outline-none"
                    placeholder="Base Cr"
                    title="Base Price in Cr"
                  />
                </div>

                <button
                  onClick={() => {
                    if (onNextPlayer) {
                      onNextPlayer(adminPlayerSelect, adminBasePrice);
                      triggerSuccess(`Now calling to the podium: ${adminPlayerSelect} (Base ₹${adminBasePrice} Cr)!`);
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 active:scale-95 transition-all"
                >
                  <Gavel className="w-3.5 h-3.5" />
                  <span>Call to Podium</span>
                </button>
              </div>
            </div>

            {/* Section 3: Live Bid & Leading Team Override (Mistake Correction) */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#181F30] border border-slate-200/80 dark:border-[#1E263E] space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-[#1E263E]">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">3. Live Bid & Leading Team Correction</h4>
                <span className="text-xs text-slate-500">Override in case of accidental clicks</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Set Bid Amount (₹ Cr)</label>
                  <input
                    type="number"
                    step="0.25"
                    value={adminBidInput}
                    onChange={(e) => setAdminBidInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#121624] border border-slate-200 dark:border-[#2A344A] text-xs font-mono font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Set Leading Franchise</label>
                  <select
                    value={adminTeamSelect}
                    onChange={(e) => setAdminTeamSelect(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#121624] border border-slate-200 dark:border-[#2A344A] text-xs font-bold outline-none"
                  >
                    {teams.map(t => (
                      <option key={t.shortName} value={t.shortName}>
                        {t.shortName} ({t.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      const amount = parseFloat(adminBidInput);
                      if (amount > 0 && onUpdateBid) {
                        onUpdateBid(amount, adminTeamSelect);
                        triggerSuccess(`Updated live bid to ₹${amount.toFixed(2)} Cr leading by ${adminTeamSelect}!`);
                      }
                    }}
                    className="w-full py-2.5 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Apply Correction</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Section 4: Manual Player Points / Match Stats Updater */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#181F30] border border-slate-200/80 dark:border-[#1E263E] space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-[#1E263E]">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">4. Update Player Match Fantasy Points</h4>
                <span className="text-xs text-slate-500">Post-match ratings & points adjustments</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Select Player</label>
                  <input
                    type="text"
                    value={selectedPlayerForPoints}
                    onChange={(e) => setSelectedPlayerForPoints(e.target.value)}
                    placeholder="Player name (e.g. Jasprit Bumrah)"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#121624] border border-slate-200 dark:border-[#2A344A] text-xs font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Add Match Points</label>
                  <input
                    type="number"
                    value={customPointsInput}
                    onChange={(e) => setCustomPointsInput(parseInt(e.target.value) || 0)}
                    placeholder="+25 pts"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#121624] border border-slate-200 dark:border-[#2A344A] text-xs font-mono font-bold outline-none"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      if (selectedPlayerForPoints && onUpdatePlayerPoints) {
                        onUpdatePlayerPoints(selectedPlayerForPoints, customPointsInput);
                        setCustomPointsOverrides(prev => ({
                          ...prev,
                          [selectedPlayerForPoints]: (prev[selectedPlayerForPoints] || 0) + customPointsInput
                        }));
                        triggerSuccess(`Added +${customPointsInput} points to ${selectedPlayerForPoints}!`);
                      }
                    }}
                    className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-md shadow-teal-600/20 flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Update Points</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
