"use client";

import React, { useState } from "react";
import { 
  X, 
  Gavel, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  ArrowRight, 
  UserCheck, 
  Users, 
  Check, 
  RefreshCw,
  AlertCircle,
  Tag
} from "lucide-react";
import { TeamStats } from "./AuctionAnalyticsDashboard";

interface AuctionConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: TeamStats[];
  podiumPlayer: string;
  currentBid: number;
  leadingTeam: string;
  onSellPlayer?: (teamShortName: string, priceCr: number) => void;
  onMarkUnsold?: () => void;
  onNextPlayer?: (playerName: string, basePriceCr: number) => void;
  onUpdateBid?: (newAmountCr: number, newLeadingTeam: string) => void;
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

const QUICK_CALL_PLAYERS = [
  { name: "Virat Kohli", role: "Batter", basePrice: 2.0 },
  { name: "Rohit Sharma", role: "Batter", basePrice: 2.0 },
  { name: "Rishabh Pant", role: "Wicketkeeper", basePrice: 2.0 },
  { name: "Heinrich Klaasen", role: "Wicketkeeper", basePrice: 2.0 },
  { name: "Mitchell Starc", role: "Bowler", basePrice: 2.0 },
  { name: "Shubman Gill", role: "Batter", basePrice: 2.0 },
  { name: "Nicholas Pooran", role: "Wicketkeeper", basePrice: 2.0 },
  { name: "Shreyas Iyer", role: "Batter", basePrice: 2.0 },
  { name: "Jasprit Bumrah", role: "Bowler", basePrice: 2.0 },
  { name: "Travis Head", role: "Batter", basePrice: 2.0 },
];

export default function AuctionConsoleModal({
  isOpen,
  onClose,
  teams,
  podiumPlayer,
  currentBid,
  leadingTeam,
  onSellPlayer,
  onMarkUnsold,
  onNextPlayer,
  onUpdateBid,
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
}: AuctionConsoleModalProps) {
  const [customCallName, setCustomCallName] = useState("");
  const [customCallPrice, setCustomCallPrice] = useState("2.0");
  const [correctBidAmount, setCorrectBidAmount] = useState("");
  const [correctBidTeam, setCorrectBidTeam] = useState(leadingTeam !== "None" ? leadingTeam : "CSK");
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const showFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 2500);
  };

  const handleSell = () => {
    if (!leadingTeam || leadingTeam === "None") {
      alert("Cannot sell: No franchise has placed a leading bid yet!");
      return;
    }
    if (onSellPlayer) {
      onSellPlayer(leadingTeam, currentBid);
      showFeedback(`🔨 SOLD to ${leadingTeam} for ₹${currentBid.toFixed(2)} Cr!`);
    }
  };

  const handleUnsold = () => {
    if (onMarkUnsold) {
      onMarkUnsold();
      showFeedback(`Marked ${podiumPlayer} as UNSOLD.`);
    }
  };

  const handleCallPlayer = (name: string, price: number) => {
    if (onNextPlayer) {
      onNextPlayer(name, price);
      showFeedback(`Called ${name} to the podium!`);
    }
  };

  const handleApplyBidCorrection = () => {
    const amt = parseFloat(correctBidAmount);
    if (isNaN(amt) || amt <= 0) {
      alert("Please enter a valid bid amount in Crores");
      return;
    }
    if (onUpdateBid) {
      onUpdateBid(amt, correctBidTeam);
      showFeedback(`Live bid corrected to ₹${amt.toFixed(2)} Cr (${correctBidTeam})`);
      setCorrectBidAmount("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-[#121624] rounded-[28px] shadow-2xl border border-slate-200/90 dark:border-[#202942] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-[#202942] flex items-center justify-between shrink-0 bg-slate-50 dark:bg-[#161C2E]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-sm">
              <Gavel className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  Auctioneer Admin Console
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider">
                  Live Hammer
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Official gavel controls, accelerated round nominations, and live bid corrections.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-200/70 dark:bg-[#202942] hover:bg-slate-300 dark:hover:bg-[#2A3656] text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action feedback toast */}
        {actionFeedback && (
          <div className="px-4 py-2 bg-blue-600 text-white text-xs font-bold text-center animate-in fade-in shrink-0">
            {actionFeedback}
          </div>
        )}

        {/* Scrollable Console Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 custom-scrollbar">
          
          {/* SECTION 1: LIVE PODIUM CARD & HAMMER ACTIONS */}
          <div className="p-5 rounded-[24px] bg-slate-50 dark:bg-[#161C2E] border border-slate-200/80 dark:border-[#202942] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Current Podium Status
              </span>
              <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold animate-pulse">
                HAMMER ACTIVE
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#0E1322] border border-slate-200/80 dark:border-[#202942]">
              <div>
                <div className="text-xs text-slate-400 font-semibold">Player on Podium</div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                  {podiumPlayer}
                </div>
              </div>

              <div className="sm:text-right">
                <div className="text-xs text-slate-400 font-semibold">Current High Bid</div>
                <div className="text-xl sm:text-2xl font-black text-teal-600 dark:text-teal-400 mt-0.5">
                  ₹{currentBid.toFixed(2)} Cr
                </div>
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Leading: <span className="text-blue-600 dark:text-blue-400 font-black">{leadingTeam}</span>
                </div>
              </div>
            </div>

            {/* Hammer Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                onClick={handleSell}
                disabled={!leadingTeam || leadingTeam === "None"}
                className="py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-sm active:scale-98"
              >
                <Gavel className="w-4 h-4" />
                <span>SOLD to {leadingTeam !== "None" ? leadingTeam : "Leader"}</span>
              </button>

              <button
                onClick={handleUnsold}
                className="py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-sm active:scale-98"
              >
                <X className="w-4 h-4" />
                <span>Mark UNSOLD (Move to Pool)</span>
              </button>
            </div>
          </div>

          {/* SECTION 2: ACCELERATED ROUND CONTROLS & NOMINATIONS */}
          <div className="p-5 rounded-[24px] bg-slate-50 dark:bg-[#161C2E] border border-slate-200/80 dark:border-[#202942] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  Accelerated Round Cockpit
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-black">
                  Round {acceleratedRound} of {totalAcceleratedRounds}
                </span>
              </div>
              {allowUnsoldDiscount && (
                <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-600 dark:text-teal-400 text-[10px] font-bold flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {unsoldDiscountPercentage}% Discount Active
                </span>
              )}
            </div>

            {/* Nomination Call Open/Close Switch & Next Round Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={() => onToggleCallForNominations && onToggleCallForNominations(!callForNominationsOpen)}
                className={`py-2.5 px-4 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                  callForNominationsOpen
                    ? "bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm"
                    : "bg-slate-200 dark:bg-[#202942] hover:bg-slate-300 dark:hover:bg-[#2B3758] text-slate-800 dark:text-slate-200"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {callForNominationsOpen ? "🔒 Close Call for Nominations" : "📢 Open Call for Nominations"}
                </span>
              </button>

              <button
                onClick={() => onAdvanceAcceleratedRound && onAdvanceAcceleratedRound()}
                disabled={acceleratedRound >= totalAcceleratedRounds}
                className="py-2.5 px-4 rounded-2xl bg-slate-200 dark:bg-[#202942] hover:bg-slate-300 dark:hover:bg-[#2B3758] disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs text-slate-800 dark:text-slate-200 transition-all flex items-center justify-center gap-2"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>Next Accelerated Round ({acceleratedRound + 1}/{totalAcceleratedRounds})</span>
              </button>
            </div>

            {/* Nominated Players List */}
            <div>
              <div className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-2 flex items-center justify-between">
                <span>Nominated by Franchises ({nominatedPlayers.length})</span>
                <span className="text-[11px] text-slate-400 font-normal">
                  {callForNominationsOpen ? "🟢 Franchise Nominations Active" : "🔴 Closed for Calling"}
                </span>
              </div>

              {nominatedPlayers.length === 0 ? (
                <div className="p-4 rounded-2xl bg-white dark:bg-[#0E1322] border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                  No players currently nominated. Open the call to let franchises submit picks from the {unsoldList.length} unsold players!
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {nominatedPlayers.map((player) => {
                    const discountedPrice = allowUnsoldDiscount
                      ? Math.round(player.basePrice * (1 - unsoldDiscountPercentage / 100) * 100) / 100
                      : player.basePrice;

                    return (
                      <div
                        key={player.name}
                        className="p-3 rounded-2xl bg-white dark:bg-[#0E1322] border border-slate-200/80 dark:border-[#202942] flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {player.name}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>Base: ₹{player.basePrice.toFixed(2)} Cr</span>
                            {allowUnsoldDiscount && (
                              <span className="text-teal-500 font-bold">
                                ➔ ₹{discountedPrice.toFixed(2)} Cr ({unsoldDiscountPercentage}% off)
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-amber-500 font-medium mt-0.5">
                            Nominated by: {player.nominatedBy.join(", ")}
                          </div>
                        </div>

                        <button
                          onClick={() => onCallNominatedPlayer && onCallNominatedPlayer(player.name, player.basePrice)}
                          className="px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all flex items-center gap-1 shrink-0 active:scale-95 shadow-xs"
                        >
                          <Gavel className="w-3 h-3" />
                          <span>Call to Podium</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Unsold Pool Status */}
            <div className="text-[11px] text-slate-400 pt-1 flex items-center justify-between">
              <span>Unsold Player Pool Liquidity:</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {unsoldList.length} total players awaiting accelerated calls
              </span>
            </div>
          </div>

          {/* SECTION 3: CALL NEXT PLAYER FROM POOL */}
          <div className="p-5 rounded-[24px] bg-slate-50 dark:bg-[#161C2E] border border-slate-200/80 dark:border-[#202942] space-y-3.5">
            <div className="font-bold text-sm text-slate-900 dark:text-white">
              Call Next Player to Podium
            </div>

            {/* Quick Chips */}
            <div className="flex flex-wrap gap-1.5">
              {QUICK_CALL_PLAYERS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => handleCallPlayer(p.name, p.basePrice)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    podiumPlayer === p.name
                      ? "bg-blue-600 text-white cursor-default"
                      : "bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-[#202942] text-slate-700 dark:text-slate-300 hover:border-blue-500"
                  }`}
                >
                  {p.name} (₹{p.basePrice} Cr)
                </button>
              ))}
            </div>

            {/* Custom Player Call Inputs */}
            <div className="pt-2 flex items-center gap-2">
              <input
                type="text"
                placeholder="Or enter player name..."
                value={customCallName}
                onChange={(e) => setCustomCallName(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-[#202942] text-xs outline-none text-slate-900 dark:text-white focus:border-blue-500"
              />
              <input
                type="number"
                step="0.25"
                placeholder="₹ Cr"
                value={customCallPrice}
                onChange={(e) => setCustomCallPrice(e.target.value)}
                className="w-20 px-3 py-2 rounded-xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-[#202942] text-xs outline-none text-slate-900 dark:text-white focus:border-blue-500"
              />
              <button
                onClick={() => {
                  if (customCallName.trim()) {
                    handleCallPlayer(customCallName.trim(), parseFloat(customCallPrice) || 2.0);
                    setCustomCallName("");
                  }
                }}
                disabled={!customCallName.trim()}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs transition-colors shrink-0"
              >
                Call
              </button>
            </div>
          </div>

          {/* SECTION 4: LIVE BID CORRECTION / OVERRIDE */}
          <div className="p-5 rounded-[24px] bg-slate-50 dark:bg-[#161C2E] border border-slate-200/80 dark:border-[#202942] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                Live Bid Correction / Override
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">
                For accidental paddle taps
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.25"
                placeholder="Corrected Bid (₹ Cr)"
                value={correctBidAmount}
                onChange={(e) => setCorrectBidAmount(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-[#202942] text-xs outline-none text-slate-900 dark:text-white focus:border-blue-500"
              />
              <select
                value={correctBidTeam}
                onChange={(e) => setCorrectBidTeam(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-[#202942] text-xs outline-none text-slate-900 dark:text-white font-bold"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.shortName}>
                    {t.shortName} - {t.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleApplyBidCorrection}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition-colors shrink-0"
              >
                Apply
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-[#202942] bg-slate-50 dark:bg-[#161C2E] flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400">
            Current Leader: <strong className="text-blue-600 dark:text-blue-400">{leadingTeam}</strong> @ ₹{currentBid.toFixed(2)} Cr
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-slate-200 dark:bg-[#202942] hover:bg-slate-300 dark:hover:bg-[#2B3758] text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
          >
            Close Console
          </button>
        </div>

      </div>
    </div>
  );
}
