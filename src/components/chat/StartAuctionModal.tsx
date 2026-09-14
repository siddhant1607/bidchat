'use client';

import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, Layers, Sparkles, Check, ChevronDown, Shield, Clock } from 'lucide-react';
import { AuctionPreset, CustomRoster } from '@/types/auction';
import { getSavedPresets, getSavedRosters } from '@/lib/presetData';

interface StartAuctionModalProps {
  onClose: () => void;
  isOpen: boolean;
  onStartAuction?: (auctionConfig: {
    name: string;
    preset: AuctionPreset;
    roster: CustomRoster;
    totalPurse: number;
    maxSquadSize: number;
    maxOverseas: number;
    requireApproval: boolean;
    timerSeconds: number;
    acceleratedRounds: number;
    allowUnsoldDiscount: boolean;
    unsoldDiscountPercentage: number;
    pointSystem?: "espn" | "custom" | "none";
  }) => void;
  initialPreset?: AuctionPreset | null;
}

export const StartAuctionModal: React.FC<StartAuctionModalProps> = ({ 
  isOpen, 
  onClose, 
  onStartAuction, 
  initialPreset 
}) => {
  const [presets, setPresets] = useState<AuctionPreset[]>([]);
  const [rosters, setRosters] = useState<CustomRoster[]>([]);
  
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  const [selectedRosterId, setSelectedRosterId] = useState<string>('');

  // Form parameters
  const [auctionName, setAuctionName] = useState('IPL 2026 Season Mock Draft');
  const [purse, setPurse] = useState(120);
  const [squadSize, setSquadSize] = useState(25);
  const [maxOverseas, setMaxOverseas] = useState(8);
  const [timerSeconds, setTimerSeconds] = useState(30);
  const [rtmEnabled, setRtmEnabled] = useState(true);
  const [rtmCount, setRtmCount] = useState(6);
  const [requireApproval, setRequireApproval] = useState(false);
  const [acceleratedRounds, setAcceleratedRounds] = useState(2);
  const [allowUnsoldDiscount, setAllowUnsoldDiscount] = useState(false);
  const [unsoldDiscountPercentage, setUnsoldDiscountPercentage] = useState(50);
  const [pointSystem, setPointSystem] = useState<"espn" | "custom" | "none">("espn");

  // Load presets & rosters
  useEffect(() => {
    if (!isOpen) return;
    const loadedPresets = getSavedPresets();
    const loadedRosters = getSavedRosters();
    setPresets(loadedPresets);
    setRosters(loadedRosters);

    // If initialPreset provided, use it, else pick the first preset
    const defaultPreset = initialPreset || loadedPresets[0];
    if (defaultPreset) {
      applyPreset(defaultPreset);
    }

    if (loadedRosters.length > 0) {
      setSelectedRosterId(loadedRosters[0].id);
    }
  }, [isOpen, initialPreset]);

  const applyPreset = (p: AuctionPreset) => {
    setSelectedPresetId(p.id);
    setPurse(p.totalPurse);
    setSquadSize(p.maxSquadSize);
    setMaxOverseas(p.maxOverseas);
    setTimerSeconds(p.timerDuration);
    setRtmEnabled(p.rtmEnabled);
    setRtmCount(p.rtmCount);
    setRequireApproval(p.requireApproval);
    setAcceleratedRounds(p.acceleratedRounds ?? 2);
    setAllowUnsoldDiscount(p.allowUnsoldDiscount ?? false);
    setUnsoldDiscountPercentage(p.unsoldDiscountPercentage ?? 50);
    setPointSystem(p.pointSystem || "espn");
  };

  const handlePresetChange = (presetId: string) => {
    const found = presets.find(p => p.id === presetId);
    if (found) {
      applyPreset(found);
    }
  };

  if (!isOpen) return null;

  const handleStart = () => {
    const chosenPreset = presets.find(p => p.id === selectedPresetId) || presets[0];
    const chosenRoster = rosters.find(r => r.id === selectedRosterId) || rosters[0];

    if (onStartAuction) {
      onStartAuction({
        name: auctionName.trim(),
        preset: chosenPreset,
        roster: chosenRoster,
        totalPurse: purse,
        maxSquadSize: squadSize,
        maxOverseas: maxOverseas,
        requireApproval,
        timerSeconds,
        acceleratedRounds,
        allowUnsoldDiscount,
        unsoldDiscountPercentage,
        pointSystem,
      });
    }

    onClose();
  };

  const selectedPreset = presets.find(p => p.id === selectedPresetId);
  const selectedRoster = rosters.find(r => r.id === selectedRosterId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-[28px] bg-white p-6 sm:p-8 shadow-2xl dark:bg-[#1E1E1E] flex flex-col gap-5 max-h-[90vh] overflow-y-auto custom-scrollbar border border-slate-100 dark:border-[#2A2A2A]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#2A2A2A]">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-gray-100">Configure & Start Auction</h2>
            <p className="text-xs text-slate-500 mt-0.5">Select your tournament preset and player roster pool</p>
          </div>
          <button 
            onClick={onClose} 
            className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-[#2A2A2A] text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-4">
          
          {/* 1. AUCTION PRESET SELECTOR (Saved custom presets prioritized at top) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" />
              <span>Auction Rules Preset</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {presets.map((p) => {
                const isSelected = p.id === selectedPresetId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                      isSelected
                        ? "border-amber-500 bg-amber-50 dark:bg-amber-950/30 ring-2 ring-amber-500/20"
                        : "border-slate-200 dark:border-[#2A2A2A] bg-slate-50 dark:bg-[#252525] hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          !p.isDefault
                            ? "bg-blue-600 text-white font-black"
                            : "bg-slate-200 dark:bg-[#333] text-slate-600 dark:text-slate-400"
                        }`}>
                          {!p.isDefault ? "★ My Preset" : "Official"}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-7 h-7 rounded-xl bg-white dark:bg-[#1E1E1E] p-0.5 border border-slate-200 dark:border-slate-700 shrink-0 flex items-center justify-center shadow-xs">
                          <img src={p.logoUrl || '/logos/ipl.png'} alt={p.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="font-bold text-xs truncate">{p.name}</div>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-2 flex items-center justify-between">
                      <span>₹{p.totalPurse} Cr • {p.timerDuration}s</span>
                      <div className="flex items-center gap-1.5">
                        {p.pointSystem === "espn" && <span className="font-bold text-amber-600 dark:text-amber-400">⭐ ESPN</span>}
                        {p.pointSystem === "custom" && <span className="font-bold text-purple-600 dark:text-purple-400">⚡ Custom</span>}
                        {p.pointSystem === "none" && <span className="font-bold text-slate-400">🚫 Pure</span>}
                        <span className="font-bold text-blue-600 dark:text-blue-400">⚡ {p.acceleratedRounds || 2} Accel</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. ROSTER POOL SELECTOR */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-500" />
              <span>Player Roster Pool</span>
            </label>
            <select
              value={selectedRosterId}
              onChange={(e) => setSelectedRosterId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#252525] border border-slate-200 dark:border-transparent text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {rosters.map((r) => (
                <option key={r.id} value={r.id}>
                  {!r.isDefault ? "★ [My Roster] " : "[Official] "} {r.name} ({r.players.length} Players • {r.teams.length} Franchises)
                </option>
              ))}
            </select>
          </div>

          {/* 3. AUCTION ROOM NAME */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Auction Event Name</label>
            <input
              type="text"
              placeholder="e.g. Weekend Mega Auction"
              value={auctionName}
              onChange={(e) => setAuctionName(e.target.value)}
              className="w-full rounded-2xl bg-slate-50 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#252525] dark:text-white border border-slate-200 dark:border-transparent text-sm font-bold"
            />
          </div>

          {/* 4. TOTAL PURSE SLIDER */}
          <div className="space-y-1 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#252525]">
            <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span>Team Franchise Purse</span>
              <span className="text-blue-600 dark:text-blue-400 font-black text-sm">₹{purse} Cr</span>
            </div>
            <input
              type="range"
              min="40"
              max="200"
              step="5"
              value={purse}
              onChange={(e) => setPurse(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          {/* 5. SQUAD LIMITS & TIMER */}
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase">Max Squad</label>
              <input
                type="number"
                value={squadSize}
                onChange={(e) => setSquadSize(Number(e.target.value))}
                className="w-full rounded-xl bg-slate-50 dark:bg-[#252525] px-3 py-2 text-xs font-bold border border-slate-200 dark:border-transparent outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase">Max Overseas</label>
              <input
                type="number"
                value={maxOverseas}
                onChange={(e) => setMaxOverseas(Number(e.target.value))}
                className="w-full rounded-xl bg-slate-50 dark:bg-[#252525] px-3 py-2 text-xs font-bold border border-slate-200 dark:border-transparent outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase">Bid Timer</label>
              <select
                value={timerSeconds}
                onChange={(e) => setTimerSeconds(Number(e.target.value))}
                className="w-full rounded-xl bg-slate-50 dark:bg-[#252525] px-3 py-2 text-xs font-bold border border-slate-200 dark:border-transparent outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={15}>15s (Blitz)</option>
                <option value={20}>20s</option>
                <option value={30}>30s (Official)</option>
                <option value={45}>45s (Casual)</option>
              </select>
            </div>
          </div>

          {/* 6. ACCELERATED ROUNDS & UNSOLD DISCOUNT */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#252525] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">⚡ Accelerated Rounds</span>
                <span className="block text-[10px] text-slate-500">Number of unsold player nomination rounds</span>
              </div>
              <select
                value={acceleratedRounds}
                onChange={(e) => setAcceleratedRounds(Number(e.target.value))}
                className="rounded-xl bg-white dark:bg-[#1E1E1E] px-3 py-1.5 text-xs font-bold border border-slate-200 dark:border-slate-700 outline-none"
              >
                {[1, 2, 3, 4, 5].map((r) => (
                  <option key={r} value={r}>{r} {r === 1 ? 'Round' : 'Rounds'}</option>
                ))}
              </select>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-[#333] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">🏷️ Discount on Unsold Round Buys</span>
                <span className="block text-[10px] text-slate-500">Apply discount to player base prices during accelerated rounds</span>
              </div>
              <input
                type="checkbox"
                checked={allowUnsoldDiscount}
                onChange={(e) => setAllowUnsoldDiscount(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
            </div>

            {allowUnsoldDiscount && (
              <div className="flex items-center justify-between pt-1 animate-in fade-in">
                <span className="text-xs text-slate-500">Discount Amount:</span>
                <div className="flex gap-1.5">
                  {[25, 50, 75].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setUnsoldDiscountPercentage(pct)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        unsoldDiscountPercentage === pct
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                      }`}
                    >
                      {pct}% {pct === 50 ? "(Default)" : ""}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 7. TOURNAMENT POINT SYSTEM */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Tournament Point System</span>
              <span className="text-[10px] text-slate-400 normal-case">Post-auction analytics mode</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPointSystem("espn")}
                className={`p-2 rounded-xl text-left border transition-all ${
                  pointSystem === "espn"
                    ? "border-amber-500 bg-amber-50/70 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 ring-1 ring-amber-500"
                    : "border-slate-200 dark:border-[#2A2A2A] bg-slate-50 dark:bg-[#252525] text-slate-600 dark:text-slate-400 hover:border-slate-300"
                }`}
              >
                <div className="text-xs font-black">⭐ ESPN MVP</div>
                <div className="text-[9px] text-slate-500 mt-0.5">Cricinfo ratings</div>
              </button>

              <button
                type="button"
                onClick={() => setPointSystem("custom")}
                className={`p-2 rounded-xl text-left border transition-all ${
                  pointSystem === "custom"
                    ? "border-purple-500 bg-purple-50/70 dark:bg-purple-950/30 text-purple-900 dark:text-purple-200 ring-1 ring-purple-500"
                    : "border-slate-200 dark:border-[#2A2A2A] bg-slate-50 dark:bg-[#252525] text-slate-600 dark:text-slate-400 hover:border-slate-300"
                }`}
              >
                <div className="text-xs font-black">⚡ Custom Pts</div>
                <div className="text-[9px] text-slate-500 mt-0.5">Match impact</div>
              </button>

              <button
                type="button"
                onClick={() => setPointSystem("none")}
                className={`p-2 rounded-xl text-left border transition-all ${
                  pointSystem === "none"
                    ? "border-blue-600 bg-blue-50/70 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 ring-1 ring-blue-500"
                    : "border-slate-200 dark:border-[#2A2A2A] bg-slate-50 dark:bg-[#252525] text-slate-600 dark:text-slate-400 hover:border-slate-300"
                }`}
              >
                <div className="text-xs font-black">🚫 Pure Auction</div>
                <div className="text-[9px] text-slate-500 mt-0.5">Purse & squad only</div>
              </button>
            </div>
          </div>

          {/* 8. ADMIN APPROVAL TOGGLE */}
          <label className="flex cursor-pointer items-center justify-between rounded-2xl bg-slate-50 p-3.5 hover:bg-slate-100 dark:bg-[#252525] dark:hover:bg-[#2A2A2A] transition-colors">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-gray-100">Require Admin Approval to Join</div>
              <div className="text-[10px] text-slate-500">Prevent unknown spectators or players from entering without host consent</div>
            </div>
            <input
              type="checkbox"
              checked={requireApproval}
              onChange={(e) => setRequireApproval(e.target.checked)}
              className="h-4 w-4 accent-blue-600 rounded"
            />
          </label>

        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-slate-100 dark:border-[#2A2A2A] flex justify-end gap-2">
          <button 
            onClick={onClose} 
            className="rounded-full px-5 py-2.5 text-xs font-bold hover:bg-slate-100 dark:hover:bg-[#2A2A2A] text-slate-500 dark:text-slate-400 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleStart}
            disabled={!auctionName.trim()}
            className="rounded-full bg-amber-500 px-6 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-600 disabled:opacity-50 transition-colors shadow-sm"
          >
            Launch Live Auction
          </button>
        </div>

      </div>
    </div>
  );
};
