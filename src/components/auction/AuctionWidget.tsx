"use client";

import React, { useState } from "react";
import { LiveAuctionState, Team, AuctionSettings } from "@/types/auction";
import { getContextualIncrements, formatCurrencyCr } from "@/lib/auctionRules";
import { generateTeamTheme } from "@/lib/theme";
import { useTheme } from "@/context/ThemeContext";
import {
  ChevronUp,
  ChevronDown,
  Maximize2,
  Minimize2,
  Clock,
  Zap,
  BarChart3,
  Sliders,
  Radio,
  Users,
  TrendingUp,
} from "lucide-react";

interface AuctionWidgetProps {
  auctionState: LiveAuctionState;
  userTeam: Team | null;
  settings?: AuctionSettings;
  onPlaceBid: (amountCr: number) => void;
  onPass: () => void;
  onOpenDashboard?: () => void;
  onOpenSettings?: () => void;
  onOpenConsole?: () => void;
  onOpenAnalytics?: () => void;
  onToggleCollapse?: () => void;
  isHost?: boolean;
}

export type WidgetMode = "mini" | "half" | "full";

const ROLE_COLORS: Record<string, string> = {
  BAT: "#F59E0B",
  BOWL: "#3B82F6",
  AR: "#8B5CF6",
  WK: "#10B981",
};

function PlayerInitialAvatar({ name, role, size = 32 }: { name: string; role?: string; size?: number }) {
  const color = role ? (ROLE_COLORS[role] || "#6B7280") : "#6B7280";
  const initials = name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: color + "22",
        border: `1.5px solid ${color}55`,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 800,
        fontSize: size * 0.35,
        color: color,
        flexShrink: 0,
        fontFamily: "monospace",
      }}
    >
      {initials}
    </div>
  );
}

export default function AuctionWidget({
  auctionState,
  userTeam,
  settings,
  onPlaceBid,
  onPass,
  onOpenDashboard,
  onOpenSettings,
  onOpenConsole,
  onOpenAnalytics,
  onToggleCollapse,
  isHost,
}: AuctionWidgetProps) {
  const [mode, setMode] = useState<WidgetMode>("half");
  const [customBid, setCustomBid] = useState<string>("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [activeTab, setActiveTab] = useState<"live" | "players" | "rules" | "stats">("live");
  const { isDark } = useTheme();

  const { currentPlayer, currentBid, leadingTeam, timerSeconds, allTeams, rtmState } = auctionState;
  const theme = generateTeamTheme(leadingTeam?.primaryColor || "#004BA0", isDark);
  const increments = getContextualIncrements(currentBid, settings);
  const isUserLeading = userTeam && leadingTeam && userTeam.shortName === leadingTeam.shortName;

  const upNextPlayers = (auctionState.unsoldPool ?? []).slice(0, 3);
  const totalSold = allTeams.reduce((s, t) => s + t.squadCount, 0);

  // Colors
  const stageBg = isDark ? "#111111" : "#F4F4F5";
  const surfaceBg = isDark ? "#1A1A1A" : "#FFFFFF";
  const borderColor = isDark ? "#2A2A2A" : "#E4E4E7";
  const textPrimary = isDark ? "#FFFFFF" : "#09090B";
  const textSecondary = isDark ? "#A1A1AA" : "#71717A";
  const tableBg = isDark ? "#161616" : "#FAFAFA";
  const tableRowHighlight = isDark ? "#1C1C0A" : "#FFFBEB";

  // ──────────────────────────────────────────────
  // MINI BAR
  // ──────────────────────────────────────────────
  if (mode === "mini") {
    return (
      <div style={{ background: "#111111" }} className="flex items-center justify-between px-4 py-2.5 text-white flex-shrink-0">
        <div className="flex items-center space-x-3 truncate">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
          <span className="font-semibold text-sm truncate">{currentPlayer?.name || "Waiting..."}</span>
          <span className="text-xs text-zinc-500">•</span>
          <span className="text-xs font-bold text-amber-400">
            {leadingTeam ? `${leadingTeam.shortName} · ${formatCurrencyCr(currentBid)}` : "No bids yet"}
          </span>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          {onOpenConsole && (
            <button onClick={onOpenConsole} className="px-2 py-0.5 text-[10px] bg-amber-500/20 text-amber-300 rounded font-bold hover:bg-amber-500/30">🔨 Host</button>
          )}
          <div className="flex items-center text-xs font-mono bg-zinc-900 px-2 py-1 rounded text-red-400 font-bold">
            <Clock className="w-3 h-3 mr-1" />
            00:{timerSeconds < 10 ? `0${timerSeconds}` : timerSeconds}
          </div>
          <button onClick={() => setMode("half")} className="p-1 hover:bg-zinc-800 rounded text-zinc-300">
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────
  // FULL SCREEN
  // ──────────────────────────────────────────────
  if (mode === "full") {
    return (
      <div style={{ background: stageBg, color: textPrimary }} className="fixed inset-0 z-50 overflow-y-auto flex flex-col">
        {/* Top Bar */}
        <div style={{ borderColor }} className="flex items-center justify-between px-6 py-3 border-b flex-shrink-0">
          <button onClick={() => setMode("half")} style={{ color: textSecondary }} className="flex items-center space-x-1.5 text-xs hover:opacity-80">
            <Minimize2 className="w-4 h-4" />
            <span>Split View</span>
          </button>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm font-black tracking-wider uppercase" style={{ color: "#F59E0B" }}>Live IPL Auction Arena</span>
          </div>
          <div className="flex items-center space-x-2">
            {onOpenConsole && (
              <button onClick={onOpenConsole} className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold hover:bg-amber-500/30">🔨 Console</button>
            )}
            {(onOpenAnalytics || onOpenDashboard) && (
              <button onClick={onOpenAnalytics || onOpenDashboard} className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: surfaceBg, color: "#22D3EE", border: `1px solid ${borderColor}` }}>
                <BarChart3 className="w-4 h-4" /><span>Analytics</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full space-y-6">
          {/* Player Card */}
          <div style={{ background: surfaceBg, border: `1px solid ${borderColor}` }} className="rounded-2xl p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-5">
                {currentPlayer && <PlayerInitialAvatar name={currentPlayer.name} role={currentPlayer.role} size={72} />}
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: textSecondary }}>On The Block</p>
                  <h2 className="text-4xl font-black tracking-tight" style={{ color: textPrimary }}>{currentPlayer?.name || "CALLING NEXT PLAYER"}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    {currentPlayer?.role && <span className="px-2.5 py-1 rounded-md text-xs font-bold" style={{ background: (ROLE_COLORS[currentPlayer.role] || "#888") + "22", color: ROLE_COLORS[currentPlayer.role] || "#888" }}>{currentPlayer.role}</span>}
                    {currentPlayer?.nationality && <span className="px-2.5 py-1 rounded-md text-xs font-bold" style={{ background: isDark ? "#1E3A5F" : "#DBEAFE", color: isDark ? "#93C5FD" : "#1D4ED8" }}>{currentPlayer.nationality}</span>}
                    {currentPlayer && <span className="px-2.5 py-1 rounded-md text-xs font-bold" style={{ background: isDark ? "#2A2000" : "#FEF9C3", color: isDark ? "#FCD34D" : "#854D0E" }}>Base: {formatCurrencyCr(currentPlayer.basePrice)}</span>}
                  </div>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: textSecondary }}>TIME LEFT</p>
                <p className={`text-5xl font-black font-mono mt-1 ${timerSeconds <= 5 ? "text-red-500 animate-pulse" : "text-amber-400"}`}>
                  00:{timerSeconds < 10 ? `0${timerSeconds}` : timerSeconds}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bid Panel */}
            <div className="space-y-4">
              <div style={{ backgroundColor: leadingTeam?.primaryColor || "#1A1A1A", borderRadius: 16 }} className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest opacity-70" style={{ color: theme.onPrimary }}>CURRENT BID</p>
                  <p className="text-4xl font-black mt-1" style={{ color: theme.onPrimary }}>{formatCurrencyCr(currentBid)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold uppercase tracking-widest opacity-70" style={{ color: theme.onPrimary }}>LEADER</p>
                  <p className="text-xl font-black mt-1" style={{ color: theme.onPrimary }}>{leadingTeam?.name || "No bids yet"}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button disabled={Boolean(isUserLeading) || !currentPlayer} onClick={() => onPlaceBid(Number((currentBid + (increments[0]?.amountCr || 0.25)).toFixed(2)))} className={`flex-1 py-4 rounded-xl font-black text-sm transition-all active:scale-98 ${isUserLeading ? "cursor-not-allowed opacity-60" : ""}`} style={{ background: isUserLeading ? (isDark ? "#2A2A2A" : "#E4E4E7") : "#2563EB", color: isUserLeading ? textSecondary : "#FFFFFF" }}>
                  {isUserLeading ? "✓ YOU ARE LEADING" : `🔨 RAISE PADDLE · ${formatCurrencyCr(Number((currentBid + (increments[0]?.amountCr || 0.25)).toFixed(2)))}`}
                </button>
                <button onClick={onPass} style={{ background: surfaceBg, color: textPrimary, border: `1px solid ${borderColor}` }} className="px-6 rounded-xl font-bold text-sm hover:opacity-80 transition-all">PASS</button>
              </div>
              {settings?.allowCustomBids && (
                <div className="grid grid-cols-3 gap-2">
                  {increments.slice(1).map((inc) => (
                    <button key={inc.label} disabled={Boolean(isUserLeading)} onClick={() => onPlaceBid(Number((currentBid + inc.amountCr).toFixed(2)))} style={{ background: isDark ? "#222" : "#F4F4F5", color: textPrimary, border: `1px solid ${borderColor}` }} className="py-2.5 rounded-xl text-xs font-bold hover:opacity-80 transition-all">{inc.label}</button>
                  ))}
                  <button onClick={() => setShowCustomInput(!showCustomInput)} style={{ background: "transparent", border: `1px dashed ${borderColor}`, color: textSecondary }} className="py-2.5 rounded-xl text-xs font-bold hover:opacity-80">Custom ▾</button>
                </div>
              )}
              {showCustomInput && (
                <div className="flex gap-2">
                  <input type="number" step="0.05" placeholder="Amount in Cr" value={customBid} onChange={(e) => setCustomBid(e.target.value)} style={{ background: surfaceBg, border: `1px solid ${borderColor}`, color: textPrimary }} className="flex-1 text-sm rounded-xl px-3 py-2.5 outline-none" />
                  <button onClick={() => { const v = parseFloat(customBid); if (v > currentBid) { onPlaceBid(v); setCustomBid(""); setShowCustomInput(false); } }} className="px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm">BID</button>
                </div>
              )}
            </div>

            {/* Bid History */}
            <div style={{ background: surfaceBg, border: `1px solid ${borderColor}` }} className="rounded-2xl overflow-hidden">
              <div className="px-4 py-3" style={{ borderBottom: `1px solid ${borderColor}` }}>
                <p className="text-xs font-black uppercase tracking-widest" style={{ color: textSecondary }}>BID HISTORY</p>
              </div>
              <div style={{ background: tableBg }}>
                <div className="grid grid-cols-[28px_1fr_auto_auto] gap-x-3 px-4 py-2" style={{ borderBottom: `1px solid ${borderColor}` }}>
                  {["#", "FRANCHISE", "AMOUNT", "TIME"].map(h => <span key={h} className="text-[10px] font-black uppercase tracking-wider" style={{ color: textSecondary }}>{h}</span>)}
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {auctionState.bidHistory.length > 0 ? auctionState.bidHistory.slice().reverse().map((bid, idx, arr) => (
                    <div key={bid.id} style={{ background: idx === 0 ? tableRowHighlight : "transparent", borderBottom: `1px solid ${borderColor}` }} className="grid grid-cols-[28px_1fr_auto_auto] gap-x-3 px-4 py-2.5 items-center">
                      <span className="text-xs font-black" style={{ color: idx === 0 ? "#F59E0B" : textSecondary }}>{arr.length - idx}</span>
                      <div className="flex items-center gap-2">
                        <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#2563EB22", border: "1.5px solid #2563EB55", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: "#3B82F6" }}>{bid.teamShortName.slice(0, 2)}</div>
                        <span className="text-xs font-bold" style={{ color: textPrimary }}>{bid.teamShortName}</span>
                      </div>
                      <span className="text-xs font-black font-mono" style={{ color: idx === 0 ? "#F59E0B" : textPrimary }}>{formatCurrencyCr(bid.amount)}</span>
                      <span className="text-[10px]" style={{ color: textSecondary }}>{idx === 0 ? "Now" : bid.timestamp}</span>
                    </div>
                  )) : (
                    <div className="py-6 text-center text-xs" style={{ color: textSecondary }}>No bids yet. Be the first to raise the paddle!</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Purse tracker */}
          <div style={{ borderTop: `1px solid ${borderColor}` }} className="pt-4">
            <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: textSecondary }}>All Franchises — Live Purse</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {allTeams.slice(0, 10).map(t => (
                <div key={t.shortName} style={{ background: surfaceBg, border: `1px solid ${borderColor}` }} className="rounded-xl p-2.5 flex items-center justify-between text-xs">
                  <span className="font-bold" style={{ color: textPrimary }}>{t.shortName}</span>
                  <span className="font-mono font-black" style={{ color: "#10B981" }}>{formatCurrencyCr(t.purseRemaining)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RTM overlay */}
        {rtmState?.isActive && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div style={{ background: "#1A1A1A", border: "2px solid #F59E0B" }} className="rounded-3xl max-w-lg w-full p-6 text-white text-center space-y-4">
              <div className="inline-flex items-center space-x-2 bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"><Zap className="w-4 h-4" /><span>Right To Match (RTM) Triggered</span></div>
              <h3 className="text-2xl font-black">{rtmState.player.name}</h3>
              <div className="bg-black/40 p-4 rounded-2xl flex items-center justify-around">
                <div><div className="text-xs text-zinc-400">Winning Bidder</div><div className="text-lg font-bold text-blue-400">{rtmState.winningBidderTeam}</div><div className="text-sm font-mono">{formatCurrencyCr(rtmState.currentBidAmount)}</div></div>
                <span className="text-zinc-500 font-black">VS</span>
                <div><div className="text-xs text-zinc-400">Original Team (RTM)</div><div className="text-lg font-bold text-amber-400">{rtmState.originalTeam}</div><div className="text-xs text-emerald-400">Holds RTM Card</div></div>
              </div>
              <div className="text-xs font-mono text-red-400 font-bold">Time: 00:{rtmState.timerSeconds}</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ──────────────────────────────────────────────
  // HALF PANEL (DEFAULT) — The main redesign
  // ──────────────────────────────────────────────
  return (
    <div style={{ background: stageBg, color: textPrimary }} className="flex-shrink-0 w-full transition-colors duration-300">
      {/* ── HEADER BAR ── */}
      <div style={{ borderBottom: `1px solid ${borderColor}` }} className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
          <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: textSecondary }}>Auction Stage</span>
        </div>
        <div className="flex items-center gap-1">
          {onOpenConsole && (
            <button onClick={onOpenConsole} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black uppercase hover:opacity-80 transition-all" style={{ background: "#F59E0B22", color: "#F59E0B", border: "1px solid #F59E0B44" }}>🔨 Console</button>
          )}
          {onOpenAnalytics && (
            <button onClick={onOpenAnalytics} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black uppercase hover:opacity-80 transition-all" style={{ background: "#3B82F622", color: "#60A5FA", border: "1px solid #3B82F644" }}><BarChart3 className="w-3 h-3" />Stats</button>
          )}
          {onOpenSettings && (
            <button onClick={onOpenSettings} className="p-1.5 rounded-lg hover:opacity-70 transition-all" style={{ color: textSecondary }} title="Rules & Settings"><Sliders className="w-3.5 h-3.5" /></button>
          )}
          <button onClick={() => { if (onToggleCollapse && typeof window !== "undefined" && window.innerWidth >= 768) { onToggleCollapse(); } else { setMode("mini"); } }} className="p-1.5 rounded-lg hover:opacity-70" style={{ color: textSecondary }}><ChevronUp className="w-4 h-4" /></button>
          <button onClick={() => setMode("full")} className="p-1.5 rounded-lg hover:opacity-70" style={{ color: textSecondary }}><Maximize2 className="w-4 h-4" /></button>
        </div>
      </div>

      {/* ── TAB BAR ── */}
      <div style={{ borderBottom: `1px solid ${borderColor}` }} className="flex items-center gap-0 px-2 overflow-x-auto scrollbar-none">
        {(["live", "players", "rules", "stats"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              color: activeTab === tab ? "#2563EB" : textSecondary,
              borderBottom: activeTab === tab ? "2px solid #2563EB" : "2px solid transparent",
              paddingBottom: 8,
              paddingTop: 8,
              paddingLeft: 14,
              paddingRight: 14,
              fontSize: 11,
              fontWeight: 700,
              textTransform: "capitalize",
              whiteSpace: "nowrap",
              transition: "all 0.15s",
              background: "transparent",
            }}
          >{tab === "live" ? "🔴 Live" : tab.charAt(0).toUpperCase() + tab.slice(1)}</button>
        ))}
        {auctionState.isAcceleratedRound && (
          <button style={{ color: "#F59E0B", borderBottom: "2px solid #F59E0B", paddingBottom: 8, paddingTop: 8, paddingLeft: 14, paddingRight: 14, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", background: "transparent" }}>⚡ Accel. {auctionState.acceleratedRoundNumber || 1}</button>
        )}
      </div>

      {activeTab === "live" && (
        <div className="space-y-0">
          {/* ── PLAYER BANNER ── */}
          {currentPlayer ? (
            <div className="px-4 pt-3.5 pb-3 flex items-start justify-between" style={{ borderBottom: `1px solid ${borderColor}` }}>
              <div className="flex items-center gap-3">
                <PlayerInitialAvatar name={currentPlayer.name} role={currentPlayer.role} size={44} />
                <div>
                  <h3 className="text-lg font-black tracking-tight leading-tight" style={{ color: textPrimary }}>{currentPlayer.name.toUpperCase()}</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span style={{ background: (ROLE_COLORS[currentPlayer.role] || "#888") + "22", color: ROLE_COLORS[currentPlayer.role] || "#888", padding: "1px 8px", borderRadius: 6, fontSize: 10, fontWeight: 800 }}>{currentPlayer.role}</span>
                    <span style={{ background: isDark ? "#1E3A5F" : "#DBEAFE", color: isDark ? "#93C5FD" : "#1D4ED8", padding: "1px 8px", borderRadius: 6, fontSize: 10, fontWeight: 800 }}>{currentPlayer.nationality}</span>
                    <span style={{ background: isDark ? "#1A1A1A" : "#F4F4F5", color: textSecondary, padding: "1px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700 }}>Base: {formatCurrencyCr(currentPlayer.basePrice)}</span>
                    {currentPlayer.prevTeam && <span style={{ background: "#F59E0B22", color: "#F59E0B", padding: "1px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700 }}>RTM: {currentPlayer.prevTeam}</span>}
                  </div>
                </div>
              </div>
              {/* Timer */}
              <div className="text-right flex-shrink-0">
                <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: textSecondary }}>TIME LEFT</p>
                <p className={`text-2xl font-black font-mono leading-tight mt-0.5 ${timerSeconds <= 5 ? "text-red-500 animate-pulse" : timerSeconds <= 10 ? "text-orange-400" : "text-amber-400"}`}>
                  00:{timerSeconds < 10 ? `0${timerSeconds}` : timerSeconds}
                </p>
              </div>
            </div>
          ) : (
            <div className="px-4 py-6 text-center" style={{ color: textSecondary, borderBottom: `1px solid ${borderColor}` }}>
              <p className="text-sm font-semibold">Auction is paused. Next player calling shortly...</p>
            </div>
          )}

          {/* ── CURRENT BID PANEL ── */}
          <div style={{ backgroundColor: leadingTeam?.primaryColor || (isDark ? "#1A1A1A" : "#18181B") }} className="px-4 py-3.5 flex items-center justify-between">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: theme.onPrimary, opacity: 0.7 }}>CURRENT BID</p>
              <p className="text-2xl font-black font-mono mt-0.5" style={{ color: theme.onPrimary }}>{formatCurrencyCr(currentBid)}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: theme.onPrimary, opacity: 0.7 }}>LEADER</p>
              <p className="text-base font-black mt-0.5" style={{ color: theme.onPrimary }}>{leadingTeam?.name || "No bids yet"}</p>
              {leadingTeam && <p className="text-[9px] uppercase tracking-widest font-bold" style={{ color: theme.onPrimary, opacity: 0.6 }}>Leader</p>}
            </div>
          </div>

          {/* ── ACTION ROW ── */}
          <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: `1px solid ${borderColor}` }}>
            <button
              disabled={Boolean(isUserLeading) || !currentPlayer}
              onClick={() => onPlaceBid(Number((currentBid + (increments[0]?.amountCr || 0.25)).toFixed(2)))}
              style={{
                flex: 1,
                padding: "11px 16px",
                borderRadius: 12,
                fontWeight: 900,
                fontSize: 13,
                letterSpacing: "0.04em",
                transition: "all 0.15s",
                background: isUserLeading ? (isDark ? "#2A2A2A" : "#E4E4E7") : "#2563EB",
                color: isUserLeading ? textSecondary : "#FFFFFF",
                cursor: isUserLeading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {isUserLeading ? (
                <><span>✓</span><span>YOU ARE LEADING</span></>
              ) : (
                <><span>🔨</span><span>RAISE PADDLE</span><span style={{ fontSize: 11, fontWeight: 700, opacity: 0.8 }}>({increments[0]?.label || "+₹25L"})</span></>
              )}
            </button>
            <button
              onClick={onPass}
              disabled={Boolean(isUserLeading)}
              style={{ padding: "11px 20px", borderRadius: 12, fontWeight: 800, fontSize: 13, background: "transparent", color: textPrimary, border: `1.5px solid ${borderColor}`, cursor: isUserLeading ? "not-allowed" : "pointer" }}
            >PASS</button>
          </div>

          {/* ── FRANCHISE INFO ROW ── */}
          {userTeam && (
            <div className="grid grid-cols-4 divide-x px-0" style={{ borderBottom: `1px solid ${borderColor}`, borderColor: borderColor }}>
              {[
                { label: "FRANCHISE", value: userTeam.shortName },
                { label: "PURSE LEFT", value: formatCurrencyCr(userTeam.purseRemaining), color: "#10B981" },
                { label: "SQUAD", value: `${userTeam.squadCount}/25` },
                { label: "RULE", value: settings?.allowCustomBids ? "Custom" : "IPL Fixed", small: true },
              ].map(({ label, value, color, small }) => (
                <div key={label} className="px-3 py-2.5" style={{ borderColor }}>
                  <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: textSecondary }}>{label}</p>
                  <p className={`${small ? "text-[11px]" : "text-sm"} font-black mt-0.5`} style={{ color: color || textPrimary }}>{value}</p>
                </div>
              ))}
            </div>
          )}

          {/* ── CUSTOM BID OPTIONS ── */}
          {settings?.allowCustomBids && (
            <div className="px-4 py-2.5" style={{ borderBottom: `1px solid ${borderColor}` }}>
              <div className="flex items-center gap-2">
                {increments.slice(1, 4).map((inc) => (
                  <button key={inc.label} disabled={Boolean(isUserLeading)} onClick={() => onPlaceBid(Number((currentBid + inc.amountCr).toFixed(2)))} style={{ flex: 1, padding: "7px 8px", borderRadius: 8, fontSize: 11, fontWeight: 800, background: isDark ? "#222" : "#F4F4F5", color: textPrimary, border: `1px solid ${borderColor}` }} className="hover:opacity-80 transition-all">{inc.label}</button>
                ))}
                <button onClick={() => setShowCustomInput(!showCustomInput)} style={{ flex: 1, padding: "7px 8px", borderRadius: 8, fontSize: 11, fontWeight: 800, background: "transparent", color: textSecondary, border: `1px dashed ${borderColor}` }}>Custom ▾</button>
              </div>
              {showCustomInput && (
                <div className="flex gap-2 mt-2">
                  <input type="number" step="0.05" placeholder="Amount in Cr" value={customBid} onChange={(e) => setCustomBid(e.target.value)} style={{ flex: 1, background: surfaceBg, border: `1px solid ${borderColor}`, color: textPrimary, borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none" }} />
                  <button onClick={() => { const v = parseFloat(customBid); if (v > currentBid) { onPlaceBid(v); setCustomBid(""); setShowCustomInput(false); } }} style={{ padding: "8px 16px", borderRadius: 8, background: "#059669", color: "#fff", fontSize: 12, fontWeight: 900 }}>BID</button>
                </div>
              )}
            </div>
          )}

          {/* ── BID HISTORY TABLE ── */}
          <div className="px-4 pt-3 pb-1">
            <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: textSecondary }}>BID HISTORY</p>
            <div style={{ border: `1px solid ${borderColor}`, borderRadius: 10, overflow: "hidden" }}>
              <div className="grid grid-cols-[24px_1fr_auto_auto] gap-x-3 px-3 py-1.5" style={{ background: isDark ? "#0A0A0A" : "#F4F4F5", borderBottom: `1px solid ${borderColor}` }}>
                {["#", "FRANCHISE", "AMOUNT", "TIME"].map(h => <span key={h} className="text-[9px] font-black uppercase tracking-wider" style={{ color: textSecondary }}>{h}</span>)}
              </div>
              <div className="max-h-36 overflow-y-auto">
                {auctionState.bidHistory.length > 0 ? [...auctionState.bidHistory].reverse().map((bid, idx, arr) => (
                  <div key={bid.id} style={{ background: idx === 0 ? (isDark ? "#1C1200" : "#FFFBEB") : "transparent", borderBottom: `1px solid ${borderColor}` }} className="grid grid-cols-[24px_1fr_auto_auto] gap-x-3 px-3 py-2 items-center">
                    <span className="text-[10px] font-black" style={{ color: idx === 0 ? "#F59E0B" : textSecondary }}>{arr.length - idx}</span>
                    <div className="flex items-center gap-1.5">
                      <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#2563EB18", border: "1px solid #2563EB40", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 900, color: "#3B82F6" }}>{bid.teamShortName.slice(0, 2)}</div>
                      <span className="text-[11px] font-bold" style={{ color: textPrimary }}>{bid.teamShortName}</span>
                    </div>
                    <span className="text-[11px] font-black font-mono" style={{ color: idx === 0 ? "#F59E0B" : textPrimary }}>{formatCurrencyCr(bid.amount)}</span>
                    <span className="text-[9px]" style={{ color: idx === 0 ? "#F59E0B" : textSecondary }}>{idx === 0 ? "Now" : bid.timestamp}</span>
                  </div>
                )) : (
                  <div className="py-4 text-center text-xs" style={{ color: textSecondary }}>No bids yet — raise the paddle!</div>
                )}
              </div>
            </div>
          </div>

          {/* ── UP NEXT STRIP ── */}
          {upNextPlayers.length > 0 && (
            <div className="px-4 pt-2 pb-3" style={{ borderTop: `1px solid ${borderColor}` }}>
              <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: textSecondary }}>UP NEXT</p>
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                {upNextPlayers.map((p, i) => (
                  <div key={p.id} style={{ background: surfaceBg, border: `1px solid ${borderColor}`, borderRadius: 10, padding: "8px 12px", minWidth: 110, display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <PlayerInitialAvatar name={p.name} role={p.role} size={28} />
                    <div>
                      <p className="text-[10px] font-black" style={{ color: textPrimary }}>{p.name.split(" ").pop()}</p>
                      <p className="text-[9px]" style={{ color: textSecondary }}>{p.role} · {p.nationality}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── AUCTION INFO FOOTER ── */}
          <div className="grid grid-cols-3 px-4 py-2.5" style={{ borderTop: `1px solid ${borderColor}`, background: isDark ? "#0A0A0A" : "#F9F9FA" }}>
            {[
              { label: "Total Players", value: (auctionState.unsoldPool?.length || 0) + totalSold },
              { label: "Sold", value: totalSold },
              { label: "Remaining", value: auctionState.unsoldPool?.length || 0 },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-[9px] font-black uppercase tracking-wider" style={{ color: textSecondary }}>{label}</p>
                <p className="text-sm font-black mt-0.5" style={{ color: textPrimary }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "players" && (
        <div className="px-4 py-4 text-center text-sm" style={{ color: textSecondary }}>
          <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="font-semibold">Player list view</p>
          <p className="text-xs">Open Auctioneer Console to manage the full player pool</p>
          {onOpenConsole && <button onClick={onOpenConsole} className="mt-3 px-4 py-2 rounded-lg text-xs font-bold" style={{ background: "#2563EB", color: "#fff" }}>Open Console</button>}
        </div>
      )}

      {activeTab === "rules" && (
        <div className="px-4 py-4 space-y-2">
          <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: textSecondary }}>Active Rules</p>
          {[
            { label: "Bid Style", value: settings?.allowCustomBids ? "Custom Free Bids" : "IPL Fixed Paddle" },
            { label: "Jump Bids", value: settings?.allowJumpBids ? "Allowed" : "Not Allowed" },
            { label: "RTM", value: "Per 2025 IPL Rules" },
            { label: "Accelerated Rounds", value: settings?.acceleratedRounds ?? 2 },
            { label: "Unsold Discount", value: settings?.allowUnsoldDiscount ? `${settings.unsoldDiscountPercentage ?? 50}%` : "Off" },
            { label: "Points System", value: settings?.pointSystem === "none" ? "Disabled" : settings?.pointSystem === "custom" ? "Custom" : "ESPN MVP" },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-1.5" style={{ borderBottom: `1px solid ${borderColor}` }}>
              <span className="text-xs" style={{ color: textSecondary }}>{label}</span>
              <span className="text-xs font-bold" style={{ color: textPrimary }}>{value}</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === "stats" && (
        <div className="px-4 py-4 space-y-2">
          <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: textSecondary }}>Franchise Purse Tracker</p>
          {allTeams.slice(0, 10).map(t => (
            <div key={t.shortName} className="flex items-center justify-between py-1.5" style={{ borderBottom: `1px solid ${borderColor}` }}>
              <span className="text-xs font-bold" style={{ color: textPrimary }}>{t.shortName}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs" style={{ color: textSecondary }}>Squad: {t.squadCount}/25</span>
                <span className="text-xs font-black font-mono" style={{ color: "#10B981" }}>{formatCurrencyCr(t.purseRemaining)}</span>
              </div>
            </div>
          ))}
          {(onOpenAnalytics || onOpenDashboard) && <button onClick={onOpenAnalytics || onOpenDashboard} className="mt-3 w-full py-2 rounded-lg text-xs font-bold" style={{ background: "#2563EB", color: "#fff" }}>Full Analytics Dashboard</button>}
        </div>
      )}

      {/* RTM Overlay */}
      {rtmState?.isActive && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div style={{ background: "#1A1A1A", border: "2px solid #F59E0B" }} className="rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl text-center space-y-4">
            <div className="inline-flex items-center space-x-2 bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"><Zap className="w-4 h-4" /><span>Right To Match (RTM) Triggered</span></div>
            <h3 className="text-2xl font-black">{rtmState.player.name}</h3>
            <div className="bg-black/40 p-4 rounded-2xl flex items-center justify-around">
              <div><div className="text-xs text-zinc-400">Winning Bidder</div><div className="text-lg font-bold text-blue-400">{rtmState.winningBidderTeam}</div><div className="text-sm font-mono">{formatCurrencyCr(rtmState.currentBidAmount)}</div></div>
              <span className="text-zinc-500 font-black">VS</span>
              <div><div className="text-xs text-zinc-400">Original Team (RTM)</div><div className="text-lg font-bold text-amber-400">{rtmState.originalTeam}</div><div className="text-xs text-emerald-400">Holds RTM Card</div></div>
            </div>
            <div className="text-xs font-mono text-red-400 font-bold">Time: 00:{rtmState.timerSeconds}</div>
          </div>
        </div>
      )}
    </div>
  );
}
