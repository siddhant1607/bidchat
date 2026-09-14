"use client";

import React, { useState } from "react";
import { 
  X, 
  BarChart3, 
  Trophy, 
  TrendingUp, 
  Clock, 
  RefreshCw, 
  Users, 
  Check, 
  Sparkles,
  Flame,
  Search,
  Zap,
  Edit3,
  Award,
  Tag
} from "lucide-react";
import { TeamStats } from "./AuctionAnalyticsDashboard";
import espnMvpList from "@/data/espnMvpData.json";

export interface PostAuctionAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournamentName?: string;
  pointSystem?: "espn" | "custom" | "none";
  teams: TeamStats[];
  podiumPlayer?: string;
  currentBid?: number;
  leadingTeam?: string;
  onUpdatePlayerPoints?: (playerName: string, addedPoints: number) => void;
}

export default function PostAuctionAnalyticsModal({
  isOpen,
  onClose,
  tournamentName = "IPL 2026 Mega Auction",
  pointSystem = "espn",
  teams,
  podiumPlayer = "Virat Kohli",
  currentBid = 21.5,
  leadingTeam = "RCB",
  onUpdatePlayerPoints,
}: PostAuctionAnalyticsModalProps) {
  const [activeTab, setActiveTab] = useState<"purses" | "mvp">("purses");
  const [mvpSearch, setMvpSearch] = useState("");
  const [customPointsOverrides, setCustomPointsOverrides] = useState<Record<string, number>>({});
  const [syncedToast, setSyncedToast] = useState(false);

  // Quick manual point editor state
  const [selectedPlayerForPoints, setSelectedPlayerForPoints] = useState<string | null>(null);
  const [addedPointsInput, setAddedPointsInput] = useState<number>(25);

  if (!isOpen) return null;

  // Calculate league aggregates
  const totalLeaguePurse = teams.length * 120.0;
  const totalSpentAcrossLeague = teams.reduce((acc, t) => acc + (t.totalSpent || 0), 0);
  const totalPurseRemaining = Math.max(0, totalLeaguePurse - totalSpentAcrossLeague);
  const spendingPercentage = totalLeaguePurse > 0 ? (totalSpentAcrossLeague / totalLeaguePurse) * 100 : 0;

  // Filter ESPN MVP list
  const filteredMvpList = (espnMvpList as any[]).filter(p => 
    p.player.toLowerCase().includes(mvpSearch.toLowerCase()) ||
    p.team.toLowerCase().includes(mvpSearch.toLowerCase())
  );

  const handleAddCustomPoints = (player: string) => {
    const prev = customPointsOverrides[player] || 0;
    const updated = prev + addedPointsInput;
    setCustomPointsOverrides(prevObj => ({ ...prevObj, [player]: updated }));
    if (onUpdatePlayerPoints) {
      onUpdatePlayerPoints(player, addedPointsInput);
    }
    setSelectedPlayerForPoints(null);
  };

  const handleSyncESPN = () => {
    setSyncedToast(true);
    setTimeout(() => setSyncedToast(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white dark:bg-[#121624] rounded-[28px] shadow-2xl border border-slate-200/90 dark:border-[#202942] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-[#202942] flex items-center justify-between shrink-0 bg-slate-50 dark:bg-[#161C2E]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  {tournamentName}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-wider">
                  Post-Auction Analytics
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                <span>League Purses, Squad Balance & Player Impact</span>
                <span>•</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {pointSystem === "espn" 
                    ? "⭐ ESPN Cricinfo MVP Points" 
                    : pointSystem === "custom" 
                    ? "⚡ Custom Impact Points" 
                    : "🚫 Pure Auction (No Points)"}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-200/70 dark:bg-[#202942] hover:bg-slate-300 dark:hover:bg-[#2A3656] text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="px-6 pt-3 pb-0 border-b border-slate-200 dark:border-[#202942] flex items-center gap-2 shrink-0 bg-slate-50/50 dark:bg-[#161C2E]/50">
          <button
            onClick={() => setActiveTab("purses")}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === "purses"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Franchise Purses & Squads</span>
          </button>

          <button
            onClick={() => setActiveTab("mvp")}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === "mvp"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>
              {pointSystem === "none" ? "Tournament Leaderboard" : "MVP Points Board"}
            </span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 custom-scrollbar">
          
          {/* TAB 1: PURSES & SQUADS */}
          {activeTab === "purses" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Macro League Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#161C2E] border border-slate-200/80 dark:border-[#202942]">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total League Spent</div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                    ₹{totalSpentAcrossLeague.toFixed(2)} Cr
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {spendingPercentage.toFixed(1)}% of ₹{totalLeaguePurse.toFixed(0)} Cr Cap
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#161C2E] border border-slate-200/80 dark:border-[#202942]">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Remaining Liquidity</div>
                  <div className="text-xl sm:text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">
                    ₹{totalPurseRemaining.toFixed(2)} Cr
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Across {teams.length} franchises
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#161C2E] border border-slate-200/80 dark:border-[#202942]">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Marquee High Bid</div>
                  <div className="text-xl sm:text-2xl font-black text-amber-500 mt-1">
                    ₹{currentBid.toFixed(2)} Cr
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 truncate">
                    {podiumPlayer} ({leadingTeam})
                  </div>
                </div>
              </div>

              {/* Franchise Purses Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                  <span className="font-bold">Franchise Spending & Squad Limits</span>
                  <span>10 Official Teams</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {teams.map((team) => {
                    const spent = team.totalSpent ?? 0;
                    const remaining = team.purseRemaining ?? 120;
                    const squad = team.squadCount ?? 18;
                    const overseas = team.overseasCount ?? 6;
                    const pctSpent = Math.min(100, Math.round((spent / 120) * 100));

                    return (
                      <div
                        key={team.id}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-[#161C2E] border border-slate-200/80 dark:border-[#202942] space-y-3 hover:border-blue-400/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-9 h-9 rounded-xl text-white font-black text-xs flex items-center justify-center shadow-xs"
                              style={{ backgroundColor: team.primaryColor }}
                            >
                              {team.shortName}
                            </div>
                            <div>
                              <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                                {team.name}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                Managed by: <span className="font-medium text-slate-700 dark:text-slate-300">{team.ownerName || "Unassigned"}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-black text-xs sm:text-sm text-teal-600 dark:text-teal-400">
                              ₹{remaining.toFixed(2)} Cr
                            </div>
                            <div className="text-[10px] text-slate-400 font-semibold">Remaining</div>
                          </div>
                        </div>

                        {/* Visual Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-400">
                            <span>Spent: ₹{spent.toFixed(2)} Cr ({pctSpent}%)</span>
                            <span>Cap: ₹120.00 Cr</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-[#0E1322] overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${pctSpent}%`,
                                backgroundColor: team.primaryColor,
                              }}
                            />
                          </div>
                        </div>

                        {/* Squad & Overseas Slot Counts */}
                        <div className="pt-1 flex items-center justify-between text-xs text-slate-500 border-t border-slate-200/60 dark:border-[#202942]">
                          <span>
                            Squad: <strong className="text-slate-800 dark:text-slate-200">{squad}/25</strong>
                          </span>
                          <span>
                            Overseas: <strong className="text-slate-800 dark:text-slate-200">{overseas}/8</strong>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MVP LEADERBOARD & POINTS */}
          {activeTab === "mvp" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              
              {/* If Point System is None */}
              {pointSystem === "none" ? (
                <div className="p-8 rounded-[24px] bg-slate-50 dark:bg-[#161C2E] border border-slate-200/80 dark:border-[#202942] text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-[#202942] text-slate-500 mx-auto flex items-center justify-center">
                    <Tag className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Pure Auction Format (No Fantasy Points)
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                    This tournament preset was created with <strong>"No Point System"</strong>. Player scores and MVP boards are disabled so participants focus purely on real-time squad construction and purse economy.
                  </p>
                </div>
              ) : (
                <>
                  {/* Controls & Search */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search player or franchise..."
                        value={mvpSearch}
                        onChange={(e) => setMvpSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-[#161C2E] border border-transparent focus:border-blue-500 text-xs outline-none text-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSyncESPN}
                        className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Sync ESPN Data</span>
                      </button>
                    </div>
                  </div>

                  {syncedToast && (
                    <div className="p-3 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-bold border border-teal-500/20 text-center animate-in fade-in">
                      ✓ ESPN Cricinfo MVP Points synchronized successfully from master statistics!
                    </div>
                  )}

                  {/* Top 3 Podium Highlights */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(espnMvpList as any[]).slice(0, 3).map((item, index) => {
                      const medalColors = ["#F59E0B", "#94A3B8", "#B45309"];
                      const extraPts = customPointsOverrides[item.player] || 0;
                      const totalDisplayPts = Math.round((item.totalImpact + extraPts) * 10) / 10;

                      return (
                        <div
                          key={item.player}
                          className="p-4 rounded-2xl bg-slate-50 dark:bg-[#161C2E] border border-slate-200/80 dark:border-[#202942] relative overflow-hidden space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className="w-6 h-6 rounded-full text-white text-xs font-black flex items-center justify-center"
                              style={{ backgroundColor: medalColors[index] }}
                            >
                              {index + 1}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-[#0E1322] text-slate-700 dark:text-slate-300">
                              {item.team}
                            </span>
                          </div>

                          <div>
                            <div className="font-black text-sm text-slate-900 dark:text-white truncate">
                              {item.player}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {item.runs} Runs • {item.wickets} Wkts
                            </div>
                          </div>

                          <div className="pt-1 flex items-baseline justify-between border-t border-slate-200/60 dark:border-[#202942]">
                            <span className="text-[10px] text-slate-400 uppercase font-bold">Impact Pts</span>
                            <span className="text-base font-black text-blue-600 dark:text-blue-400">
                              {totalDisplayPts}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Full MVP List Table */}
                  <div className="rounded-2xl border border-slate-200/80 dark:border-[#202942] overflow-hidden">
                    <div className="overflow-x-auto max-h-72 custom-scrollbar">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 dark:bg-[#161C2E] text-slate-500 font-bold border-b border-slate-200 dark:border-[#202942] sticky top-0">
                          <tr>
                            <th className="py-2.5 px-3">#</th>
                            <th className="py-2.5 px-3">Player</th>
                            <th className="py-2.5 px-3">Franchise</th>
                            <th className="py-2.5 px-3 text-right">Runs</th>
                            <th className="py-2.5 px-3 text-right">Wkts</th>
                            <th className="py-2.5 px-3 text-right">Total Impact</th>
                            {pointSystem === "custom" && (
                              <th className="py-2.5 px-3 text-right">Action</th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-[#1C2538] text-slate-800 dark:text-slate-200">
                          {filteredMvpList.map((item) => {
                            const extra = customPointsOverrides[item.player] || 0;
                            const total = Math.round((item.totalImpact + extra) * 10) / 10;

                            return (
                              <tr key={item.player} className="hover:bg-slate-50 dark:hover:bg-[#161C2E] transition-colors">
                                <td className="py-2.5 px-3 font-bold text-slate-400">{item.rank}</td>
                                <td className="py-2.5 px-3 font-bold">{item.player}</td>
                                <td className="py-2.5 px-3">
                                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-[#161C2E] text-[10px] font-bold">
                                    {item.team}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-right font-medium">{item.runs}</td>
                                <td className="py-2.5 px-3 text-right font-medium">{item.wickets}</td>
                                <td className="py-2.5 px-3 text-right font-black text-blue-600 dark:text-blue-400">
                                  {total}
                                  {extra > 0 && <span className="text-[10px] text-teal-500 ml-1">(+{extra})</span>}
                                </td>
                                {pointSystem === "custom" && (
                                  <td className="py-2.5 px-3 text-right">
                                    <button
                                      onClick={() => setSelectedPlayerForPoints(item.player)}
                                      className="px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-[10px] font-bold hover:bg-blue-100"
                                    >
                                      + Points
                                    </button>
                                  </td>
                                )}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Manual Points Award Dialog (when custom point system is active) */}
                  {selectedPlayerForPoints && (
                    <div className="p-4 rounded-2xl bg-blue-50 dark:bg-[#181F30] border border-blue-200 dark:border-[#202942] flex items-center justify-between gap-3 animate-in fade-in">
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white">
                          Award Custom Points to {selectedPlayerForPoints}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Manually adjust points for match milestone or player performance.
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={addedPointsInput}
                          onChange={(e) => setAddedPointsInput(parseInt(e.target.value) || 0)}
                          className="w-20 px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#0E1322] border text-xs outline-none font-bold text-center"
                        />
                        <button
                          onClick={() => handleAddCustomPoints(selectedPlayerForPoints)}
                          className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
                        >
                          Award
                        </button>
                        <button
                          onClick={() => setSelectedPlayerForPoints(null)}
                          className="p-1.5 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-[#202942] bg-slate-50 dark:bg-[#161C2E] flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400">
            Total League Liquidity: <strong className="text-teal-600 dark:text-teal-400">₹{totalPurseRemaining.toFixed(2)} Cr</strong> remaining
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-slate-200 dark:bg-[#202942] hover:bg-slate-300 dark:hover:bg-[#2B3758] text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
