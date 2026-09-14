"use client";

import React, { useState } from "react";
import { X, Search, Sparkles, Check, Users, AlertCircle } from "lucide-react";

interface UnsoldPlayer {
  name: string;
  role?: string;
  basePrice: number;
  team?: string;
}

interface NominatedPlayer {
  name: string;
  basePrice: number;
  nominatedBy: string[];
}

interface NominationModalProps {
  isOpen: boolean;
  onClose: () => void;
  unsoldList: UnsoldPlayer[];
  nominatedPlayers: NominatedPlayer[];
  acceleratedRound: number;
  totalAcceleratedRounds: number;
  allowUnsoldDiscount: boolean;
  unsoldDiscountPercentage: number;
  userTeam: string;
  onNominatePlayer: (playerName: string, basePrice: number, teamName: string) => void;
}

export default function NominationModal({
  isOpen,
  onClose,
  unsoldList,
  nominatedPlayers,
  acceleratedRound,
  totalAcceleratedRounds,
  allowUnsoldDiscount,
  unsoldDiscountPercentage = 50,
  userTeam,
  onNominatePlayer,
}: NominationModalProps) {
  const [search, setSearch] = useState("");

  if (!isOpen) return null;

  const filteredUnsold = unsoldList.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.role && p.role.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white dark:bg-[#161C2E] rounded-[28px] shadow-2xl border border-slate-200 dark:border-[#232C45] overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200/80 dark:border-[#232C45] flex items-center justify-between shrink-0 bg-slate-50 dark:bg-[#1A2238]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                Nominate Players
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold">
                  Round {acceleratedRound} / {totalAcceleratedRounds}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Nominate unsold players from the pool for Accelerated Round bidding.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-200/60 dark:bg-[#232C45] hover:bg-slate-300 dark:hover:bg-[#2D3857] flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Discount notice banner if active */}
        {allowUnsoldDiscount && (
          <div className="px-6 py-2.5 bg-blue-50 dark:bg-blue-950/40 border-b border-blue-200 dark:border-blue-900/50 flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
            <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>{unsoldDiscountPercentage}% Unsold Round Discount Active:</strong> All unsold players nominated in this round start at a {unsoldDiscountPercentage}% discounted base price!
            </span>
          </div>
        )}

        {/* Search */}
        <div className="p-4 border-b border-slate-100 dark:border-[#232C45] shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search unsold players by name or role..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-[#1E263E] border border-transparent focus:border-blue-500 text-xs outline-none text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* List of Unsold Players */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar">
          {filteredUnsold.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No unsold players found matching "{search}".
            </div>
          ) : (
            filteredUnsold.map((player) => {
              const nomination = nominatedPlayers.find(n => n.name === player.name);
              const isNominatedByMe = nomination?.nominatedBy.includes(userTeam);
              const discountedPrice = Math.round(player.basePrice * (1 - unsoldDiscountPercentage / 100) * 100) / 100;

              return (
                <div
                  key={player.name}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1A2238] border border-slate-200/80 dark:border-[#232C45] flex items-center justify-between gap-3 transition-colors hover:border-blue-300 dark:hover:border-blue-800"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {player.name}
                      </span>
                      {player.role && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-[#232C45] text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                          {player.role}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                      <span>Base: ₹{player.basePrice.toFixed(2)} Cr</span>
                      {allowUnsoldDiscount && (
                        <span className="text-teal-600 dark:text-teal-400 font-bold">
                          ➔ ₹{discountedPrice.toFixed(2)} Cr ({unsoldDiscountPercentage}% off)
                        </span>
                      )}
                    </div>
                    {nomination && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-amber-600 dark:text-amber-400">
                        <Users className="w-3 h-3" />
                        <span>Nominated by: {nomination.nominatedBy.join(", ")}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => onNominatePlayer(player.name, player.basePrice, userTeam)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-sm ${
                      isNominatedByMe
                        ? "bg-teal-600 text-white cursor-default"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    {isNominatedByMe ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Nominated
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        Nominate
                      </>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200/80 dark:border-[#232C45] bg-slate-50 dark:bg-[#1A2238] flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {nominatedPlayers.length} player(s) nominated for this round
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-slate-200 dark:bg-[#232C45] hover:bg-slate-300 dark:hover:bg-[#2D3857] text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
