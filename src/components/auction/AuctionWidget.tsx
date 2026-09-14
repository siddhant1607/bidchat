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
  const { isDark } = useTheme();

  const { currentPlayer, currentBid, leadingTeam, timerSeconds, allTeams, rtmState } =
    auctionState;

  // Dynamic team theme derived from whoever currently leads the bid, respecting dark mode
  const theme = generateTeamTheme(leadingTeam?.primaryColor || "#004BA0", isDark);

  const increments = getContextualIncrements(currentBid, settings);

  const isUserLeading =
    userTeam && leadingTeam && userTeam.shortName === leadingTeam.shortName;

  return (
    <div
      className="border-b md:border-b-0 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm transition-colors duration-300 relative flex-shrink-0 w-full"
    >
      {/* ------------------------------------------------------------- */}
      {/* STATE 1: COLLAPSED MINI BAR                                    */}
      {/* ------------------------------------------------------------- */}
      {mode === "mini" && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 text-white">
          <div className="flex items-center space-x-3 truncate">
            <span className="text-base">🏏</span>
            <span className="font-semibold text-sm truncate">
              {currentPlayer?.name || "Waiting for player..."}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-bold text-amber-400">
              {leadingTeam ? `${leadingTeam.shortName} leads ${formatCurrencyCr(currentBid)}` : "No bids yet"}
            </span>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            {onOpenConsole && (
              <button
                onClick={onOpenConsole}
                className="px-2 py-0.5 text-[10px] bg-amber-500/20 text-amber-300 rounded font-bold hover:bg-amber-500/30"
                title="Auctioneer Live Cockpit"
              >
                🔨 Host
              </button>
            )}
            {onOpenAnalytics && (
              <button
                onClick={onOpenAnalytics}
                className="px-2 py-0.5 text-[10px] bg-blue-500/20 text-blue-300 rounded font-bold hover:bg-blue-500/30"
                title="Post-Auction Financial & MVP Analytics"
              >
                📊 Stats
              </button>
            )}
            <div className="flex items-center text-xs font-mono bg-slate-800 px-2 py-1 rounded text-red-400 font-bold animate-pulse">
              <Clock className="w-3 h-3 mr-1" />
              00:{timerSeconds < 10 ? `0${timerSeconds}` : timerSeconds}
            </div>
            <button
              onClick={() => setMode("half")}
              className="p-1 hover:bg-slate-800 rounded text-slate-300"
              title="Expand auction panel"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* ------------------------------------------------------------- */}
      {/* ------------------------------------------------------------- */}
      {/* STATE 2: HALF PANEL (Default Resting View)                     */}
      {/* ------------------------------------------------------------- */}
      {mode === "half" && (
        <div className="p-2 sm:p-4 space-y-1.5 sm:space-y-3">
          {/* Drag handle / collapse bar */}
          <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Live Auction Stage
              </span>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            </div>
            <div className="flex items-center space-x-1">
              {onOpenConsole && (
                <button
                  onClick={onOpenConsole}
                  className="flex items-center space-x-1 px-2 py-0.5 text-[10px] sm:text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/60 font-bold transition-all mr-0.5"
                  title="Open Auctioneer Live Cockpit"
                >
                  <span>🔨</span>
                  <span className="hidden sm:inline">Auction</span>
                  <span>Console</span>
                </button>
              )}
              {onOpenAnalytics && (
                <button
                  onClick={onOpenAnalytics}
                  className="flex items-center space-x-1 px-2 py-0.5 text-[10px] sm:text-xs text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/60 font-bold transition-all mr-0.5"
                  title="Open Post-Auction Financial & MVP Analytics"
                >
                  <BarChart3 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>Stats</span>
                </button>
              )}
              {onOpenSettings && (
                <button
                  onClick={onOpenSettings}
                  className="flex items-center space-x-1 px-1.5 py-0.5 text-[10px] sm:text-xs text-slate-500 hover:text-amber-500 dark:text-slate-400 dark:hover:text-amber-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-all mr-1"
                  title="Auction rules & bid gaps settings"
                >
                  <Sliders className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span className="font-semibold text-[10px] sm:text-[11px]">Rules</span>
                </button>
              )}
              <button
                onClick={() => {
                  if (onToggleCollapse && typeof window !== "undefined" && window.innerWidth >= 768) {
                    onToggleCollapse();
                  } else {
                    setMode("mini");
                  }
                }}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Collapse stage panel"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => setMode("full")}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Expand to fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Current Player Card Header */}
          {currentPlayer ? (
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-1.5 sm:space-x-2">
                  <span className="text-base sm:text-xl font-black text-slate-900 dark:text-white font-heading">
                    {currentPlayer.name}
                  </span>
                  <span className="text-[10px] sm:text-xs px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold">
                    {currentPlayer.role}
                  </span>
                  <span className="text-[10px] sm:text-xs px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold">
                    {currentPlayer.nationality}
                  </span>
                </div>
                <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.2 sm:mt-0.5">
                  Base: <strong className="text-slate-800 dark:text-slate-100">{formatCurrencyCr(currentPlayer.basePrice)}</strong>
                  {currentPlayer.prevTeam && (
                    <span className="ml-1.5 text-amber-600 dark:text-amber-400 font-medium">
                      (RTM: {currentPlayer.prevTeam})
                    </span>
                  )}
                </div>
                {auctionState.isAcceleratedRound && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-bold">
                      ⚡ Accelerated Round {auctionState.acceleratedRoundNumber || 1}
                    </span>
                    {auctionState.allowUnsoldDiscount && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold">
                        🏷️ {auctionState.unsoldDiscountPercentage || 50}% Unsold Discount
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Timer Box */}
              <div
                className={`flex items-center px-2 sm:px-3 py-0.5 sm:py-1.5 rounded-lg sm:rounded-xl font-mono text-xs sm:text-sm font-black shadow-xs ${
                  timerSeconds <= 5
                    ? "bg-red-600 text-white animate-bounce"
                    : timerSeconds <= 10
                    ? "bg-amber-500 text-white"
                    : "bg-slate-900 text-white"
                }`}
              >
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
                00:{timerSeconds < 10 ? `0${timerSeconds}` : timerSeconds}
              </div>
            </div>
          ) : (
            <div className="py-3 sm:py-6 text-center text-slate-400 text-xs sm:text-sm italic">
              Auction is paused. Next player called shortly...
            </div>
          )}

          {/* Current Bid Display Box */}
          <div
            style={{
              backgroundColor: leadingTeam ? leadingTeam.primaryColor : "#0F172A",
              color: theme.onPrimary,
            }}
            className="rounded-xl sm:rounded-2xl p-2 sm:p-4 shadow-sm flex items-center justify-between transition-colors duration-300"
          >
            <div>
              <div
                style={{ color: theme.onPrimary, opacity: 0.8 }}
                className="text-[10px] sm:text-xs uppercase tracking-wider font-bold"
              >
                Current Bid
              </div>
              <div
                style={{ color: theme.onPrimary }}
                className="text-xl sm:text-3xl font-black tracking-tight font-heading mt-0.2 sm:mt-0.5"
              >
                {formatCurrencyCr(currentBid)}
              </div>
            </div>

            <div className="text-right">
              <div
                style={{ color: theme.onPrimary, opacity: 0.8 }}
                className="text-[10px] sm:text-xs uppercase tracking-wider font-bold"
              >
                Leader
              </div>
              <div
                style={{ color: theme.onPrimary }}
                className="text-xs sm:text-lg font-bold mt-0.2 sm:mt-0.5 flex items-center justify-end space-x-1 sm:space-x-2"
              >
                <span>{leadingTeam ? leadingTeam.name : "Waiting for bid..."}</span>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* HIGH-VISIBILITY BID CONTROLS AREA                             */}
          {/* ------------------------------------------------------------- */}
          <div className="pt-0.5 sm:pt-2 space-y-1.5 sm:space-y-2.5">
            {/* Primary Big Unmissable Bid Button */}
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <button
                disabled={Boolean(isUserLeading) || !currentPlayer}
                onClick={() => {
                  const nextAmount = Number((currentBid + (increments[0]?.amountCr || 0.25)).toFixed(2));
                  onPlaceBid(nextAmount);
                }}
                className={`flex-1 py-2.5 sm:py-3.5 px-2.5 sm:px-4 rounded-xl sm:rounded-2xl font-black font-heading text-xs sm:text-base shadow-sm transition-all active:scale-98 flex items-center justify-center space-x-1 sm:space-x-2 ${
                  isUserLeading
                    ? "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300 dark:border-slate-700"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                }`}
              >
                <span>🔨</span>
                <span className="truncate">
                  {isUserLeading
                    ? "YOU ARE LEADING"
                    : `${settings?.allowCustomBids ? "PLACE BID" : "RAISE PADDLE"}: ${formatCurrencyCr(Number((currentBid + (increments[0]?.amountCr || 0.25)).toFixed(2)))}`}
                </span>
                {!isUserLeading && (
                  <span className="text-[10px] sm:text-xs font-normal text-emerald-100 bg-emerald-700/50 px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded-md">
                    ({increments[0]?.label || "+₹25 L"})
                  </span>
                )}
              </button>

              <button
                onClick={onPass}
                disabled={Boolean(isUserLeading)}
                className="py-2.5 sm:py-3.5 px-3 sm:px-4 rounded-xl sm:rounded-2xl font-bold text-xs bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 active:scale-95 transition-all"
              >
                PASS
              </button>
            </div>

            {/* Quick Increment Options & Custom Amount (Only shown if custom bids allowed) */}
            {settings?.allowCustomBids ? (
              <>
                <div className="grid grid-cols-3 gap-2">
                  {increments.slice(1).map((inc) => (
                    <button
                      key={inc.label}
                      disabled={Boolean(isUserLeading) || !currentPlayer}
                      onClick={() => onPlaceBid(Number((currentBid + inc.amountCr).toFixed(2)))}
                      className="py-2 px-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:bg-slate-100 disabled:text-slate-400 dark:disabled:bg-slate-900/60 dark:disabled:text-slate-600 text-white shadow-xs transition-all active:scale-95 flex items-center justify-center space-x-1"
                    >
                      <span>{inc.label}</span>
                      <span className="text-[10px] text-slate-300 dark:text-slate-400 font-normal">
                        ({formatCurrencyCr(Number((currentBid + inc.amountCr).toFixed(2)))})
                      </span>
                    </button>
                  ))}

                  <button
                    onClick={() => setShowCustomInput(!showCustomInput)}
                    className="py-2 px-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 active:scale-95 transition-all"
                  >
                    Custom Bid ▾
                  </button>
                </div>

                {/* Custom Bid Input Drawer */}
                {showCustomInput && (
                  <div className="flex items-center space-x-2 pt-1 animate-in fade-in slide-in-from-top-1">
                    <input
                      type="number"
                      step="0.05"
                      placeholder="Enter amount in Cr (e.g. 17.5)"
                      value={customBid}
                      onChange={(e) => setCustomBid(e.target.value)}
                      className="flex-1 text-sm border-2 border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-emerald-600 bg-white dark:bg-slate-800"
                    />
                    <button
                      onClick={() => {
                        const val = parseFloat(customBid);
                        if (val > currentBid) {
                          onPlaceBid(val);
                          setCustomBid("");
                          setShowCustomInput(false);
                        }
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-sm"
                    >
                      Bid
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 text-xs">
                <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 text-[11px]">
                  <span>🔒</span>
                  <span>
                    <strong>Official IPL Rule:</strong> Fixed bid gap (<strong>{increments[0]?.label || "+₹25 L"}</strong>) • Single paddle raise only
                  </span>
                </div>
                {onOpenSettings && (
                  <button
                    onClick={onOpenSettings}
                    className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center space-x-1"
                  >
                    <span>Config Gaps ⚙️</span>
                  </button>
                )}
              </div>
            )}

            {/* User's Team Purse Health Bar */}
            {userTeam && (
              <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700/80 font-medium">
                <div>
                  Franchise: <strong className="text-slate-950 dark:text-white">{userTeam.shortName}</strong>
                </div>
                <div>
                  Purse Left: <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{formatCurrencyCr(userTeam.purseRemaining)}</strong>
                </div>
                <div>
                  Squad: <strong className="text-slate-950 dark:text-white">{userTeam.squadCount}/25</strong>
                </div>
              </div>
            )}

            {/* Live Podium Bids Activity Stream (Visible on Desktop Left Split) */}
            <div className="hidden md:flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <span>Podium Bids Stream</span>
                <span className="text-[10px] text-amber-500 flex items-center gap-1 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Live
                </span>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                {auctionState.bidHistory && auctionState.bidHistory.length > 0 ? (
                  auctionState.bidHistory.slice(0, 5).map((bid, idx) => (
                    <div
                      key={bid.id || idx}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] flex items-center justify-center">
                          {bid.teamShortName.slice(0, 2)}
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {bid.teamShortName}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          ({bid.bidderName || "Manager"})
                        </span>
                      </div>
                      <span className="font-mono font-black text-amber-600 dark:text-amber-400">
                        {formatCurrencyCr(bid.amount)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-3 text-xs text-slate-400 dark:text-slate-500 italic bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                    No bids on {currentPlayer?.name || "podium"} yet. Click raise to place initial bid!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* STATE 3: FULLSCREEN AUCTION VIEW                               */}
      {/* ------------------------------------------------------------- */}
      {mode === "full" && (
        <div className="fixed inset-0 z-50 bg-slate-950 text-white overflow-y-auto p-4 md:p-8 flex flex-col justify-between">
          {/* Top Bar */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <button
              onClick={() => setMode("half")}
              className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white"
            >
              <Minimize2 className="w-4 h-4" />
              <span>Back to Split View</span>
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-black font-heading tracking-wider text-amber-400 uppercase">
                🏏 Live IPL Auction Arena
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {onOpenConsole && (
                <button
                  onClick={onOpenConsole}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold hover:bg-amber-500/30"
                >
                  <span>🔨</span>
                  <span>Auction Console</span>
                </button>
              )}
              {(onOpenAnalytics || onOpenDashboard) && (
                <button
                  onClick={onOpenAnalytics || onOpenDashboard}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-cyan-400"
                >
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                  <span>Stats & Analytics</span>
                </button>
              )}
            </div>
          </div>

          {/* Center Stage: Big Player Card & Bid Display */}
          <div className="my-auto py-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto w-full">
            {/* Left: Player Info Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-2xl">
              <div>
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  <span>Player Up For Auction</span>
                </div>
                <h2 className="text-4xl font-black font-heading text-white mb-2">
                  {currentPlayer?.name || "Next Player Calling..."}
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-slate-800 text-slate-200 text-xs font-bold rounded-lg">
                    {currentPlayer?.role}
                  </span>
                  <span className="px-3 py-1 bg-blue-900/60 text-blue-300 text-xs font-bold rounded-lg">
                    {currentPlayer?.nationality}
                  </span>
                  <span className="px-3 py-1 bg-amber-900/60 text-amber-300 text-xs font-bold rounded-lg">
                    Base: {currentPlayer ? formatCurrencyCr(currentPlayer.basePrice) : "-"}
                  </span>
                </div>
              </div>

              {/* Timer countdown visual */}
              <div className="mt-8 flex items-center justify-between bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-sm text-slate-400">Auctioneer Hammer Clock:</span>
                <span
                  className={`text-2xl font-mono font-black ${
                    timerSeconds <= 5 ? "text-red-500 animate-ping" : "text-amber-400"
                  }`}
                >
                  00:{timerSeconds < 10 ? `0${timerSeconds}` : timerSeconds}
                </span>
              </div>
            </div>

            {/* Right: Live Bid & Controller */}
            <div
              style={{
                borderColor: leadingTeam ? leadingTeam.primaryColor : "#334155",
              }}
              className="bg-slate-900 border-2 rounded-3xl p-6 flex flex-col justify-between shadow-2xl"
            >
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Current Highest Bidder
                </div>
                <div className="text-5xl font-black font-heading text-white mt-2">
                  {formatCurrencyCr(currentBid)}
                </div>
                <div className="mt-2 text-xl font-bold flex items-center space-x-2 text-amber-400">
                  <span>{leadingTeam ? leadingTeam.name : "Waiting for opening bid..."}</span>
                </div>
              </div>

              {/* Increments buttons in fullscreen */}
              <div className="mt-8 space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  {increments.map((inc) => (
                    <button
                      key={inc.label}
                      disabled={Boolean(isUserLeading)}
                      onClick={() => onPlaceBid(Number((currentBid + inc.amountCr).toFixed(2)))}
                      className="py-3 px-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm active:scale-95 transition-all"
                    >
                      {inc.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={onPass}
                    className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm"
                  >
                    Pass
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar: Franchise Purse Tracker */}
          <div className="border-t border-slate-800 pt-4">
            <div className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">
              All 10 Franchises Live Purse Health
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {allTeams.slice(0, 10).map((t) => (
                <div
                  key={t.shortName}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs flex items-center justify-between"
                >
                  <span className="font-bold text-slate-200">{t.shortName}</span>
                  <span className="text-emerald-400 font-mono font-bold">
                    {formatCurrencyCr(t.purseRemaining)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* RTM DRAMATIC OVERLAY MODAL                                     */}
      {/* ------------------------------------------------------------- */}
      {rtmState && rtmState.isActive && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border-2 border-amber-500 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl text-center space-y-4">
            <div className="inline-flex items-center space-x-2 bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Zap className="w-4 h-4" />
              <span>Right To Match (RTM) Triggered</span>
            </div>

            <h3 className="text-2xl font-black font-heading">
              {rtmState.player.name}
            </h3>

            <div className="bg-slate-800 p-4 rounded-2xl flex items-center justify-around">
              <div>
                <div className="text-xs text-slate-400">Winning Bidder</div>
                <div className="text-lg font-bold text-blue-400">{rtmState.winningBidderTeam}</div>
                <div className="text-sm font-mono">{formatCurrencyCr(rtmState.currentBidAmount)}</div>
              </div>
              <span className="text-slate-500 font-black">VS</span>
              <div>
                <div className="text-xs text-slate-400">Original Team (RTM)</div>
                <div className="text-lg font-bold text-amber-400">{rtmState.originalTeam}</div>
                <div className="text-xs text-emerald-400">Holds RTM Card</div>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              Per official 2025 IPL rules, {rtmState.winningBidderTeam} has one final opportunity to raise their offer before {rtmState.originalTeam} decides to match.
            </p>

            <div className="text-xs font-mono text-red-400 font-bold">
              Time Remaining: 00:{rtmState.timerSeconds}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
