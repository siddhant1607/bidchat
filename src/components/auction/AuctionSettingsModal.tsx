"use client";

import React from "react";
import { AuctionSettings, BidIncrementSlab } from "@/types/auction";
import { DEFAULT_IPL_BID_SLABS, FAST_AUCTION_SLABS, formatCurrencyCr } from "@/lib/auctionRules";
import { X, Shield, Sliders, Zap, Check } from "lucide-react";

interface AuctionSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AuctionSettings;
  onSaveSettings: (settings: AuctionSettings) => void;
}

export default function AuctionSettingsModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}: AuctionSettingsModalProps) {
  const [localSettings, setLocalSettings] = React.useState<AuctionSettings>(settings);

  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleToggleCustomBids = (allow: boolean) => {
    setLocalSettings((prev) => ({
      ...prev,
      allowCustomBids: allow,
      allowJumpBids: allow,
    }));
  };

  const handleApplyPreset = (preset: "ipl" | "fast") => {
    if (preset === "ipl") {
      setLocalSettings((prev) => ({
        ...prev,
        bidSlabs: DEFAULT_IPL_BID_SLABS,
      }));
    } else {
      setLocalSettings((prev) => ({
        ...prev,
        bidSlabs: FAST_AUCTION_SLABS,
      }));
    }
  };

  const handleUpdateTierIncrement = (index: number, incrementCr: number) => {
    setLocalSettings((prev) => {
      const newSlabs = [...prev.bidSlabs];
      newSlabs[index] = { ...newSlabs[index], incrementCr };
      return { ...prev, bidSlabs: newSlabs };
    });
  };

  const handleSave = () => {
    onSaveSettings(localSettings);
    onClose();
  };

  const tierOptions: { [key: number]: number[] } = {
    0: [0.05, 0.10, 0.20],      // Up to 1 Cr: 5L, 10L, 20L
    1: [0.10, 0.20, 0.25],      // 1-2 Cr: 10L, 20L, 25L
    2: [0.20, 0.25, 0.50],      // 2-5 Cr: 20L, 25L, 50L
    3: [0.25, 0.50, 1.00],      // > 5 Cr: 25L, 50L, 1.00 Cr
  };

  const isIplPreset = JSON.stringify(localSettings.bidSlabs) === JSON.stringify(DEFAULT_IPL_BID_SLABS);
  const isFastPreset = JSON.stringify(localSettings.bidSlabs) === JSON.stringify(FAST_AUCTION_SLABS);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-white animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black font-heading text-white">Auction Rules & Bid Settings</h2>
              <p className="text-xs text-slate-400">Configure bid gaps, increments, and paddle behavior</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Section 1: Custom Bids & Jump Bids Toggle */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1 pr-4">
                <div className="flex items-center space-x-1.5 text-sm font-bold text-slate-100">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>Strict Official IPL Paddle Bidding</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  In official IPL auctions, teams only have a <strong>single paddle raise</strong> at the fixed auctioneer gap. Custom inputs and jump bids (+50L, +1Cr) are disabled.
                </p>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                onClick={() => handleToggleCustomBids(localSettings.allowCustomBids ? false : true)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                  !localSettings.allowCustomBids ? "bg-emerald-600" : "bg-slate-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    !localSettings.allowCustomBids ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between text-xs">
              <span className="text-slate-400">Status:</span>
              <span className={`font-bold ${!localSettings.allowCustomBids ? "text-emerald-400" : "text-amber-400"}`}>
                {!localSettings.allowCustomBids ? "🔒 Custom & Jump Bids Disabled (IPL Default)" : "⚡ Custom Bidding Allowed"}
              </span>
            </div>
          </div>

          {/* Section 2: Presets */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Bid Increment Slabs Preset
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleApplyPreset("ipl")}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  isIplPreset
                    ? "bg-amber-500/10 border-amber-500/40 text-amber-300 shadow-xs"
                    : "bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs flex items-center space-x-1.5">
                    <span>🏏 Official IPL Slabs</span>
                  </span>
                  {isIplPreset && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </div>
                <p className="text-[11px] text-slate-400">10L • 20L • 25L • 25L</p>
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset("fast")}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  isFastPreset
                    ? "bg-amber-500/10 border-amber-500/40 text-amber-300 shadow-xs"
                    : "bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs flex items-center space-x-1.5">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>Fast Auction</span>
                  </span>
                  {isFastPreset && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </div>
                <p className="text-[11px] text-slate-400">20L • 25L • 50L • 1.0 Cr</p>
              </button>
            </div>
          </div>

          {/* Section 3: Tier Slabs Customizer */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Fixed Bid Gaps Per Price Tier
              </label>
              <span className="text-[10px] text-slate-500">Configurable increments</span>
            </div>

            <div className="space-y-2.5">
              {localSettings.bidSlabs.map((slab, idx) => (
                <div
                  key={slab.tierName}
                  className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-200">{slab.tierName}</div>
                    <div className="text-[10px] text-slate-400">
                      Active: <strong className="text-amber-400">+{formatCurrencyCr(slab.incrementCr)}</strong>
                    </div>
                  </div>

                  {/* Increment selector buttons */}
                  <div className="flex items-center space-x-1.5">
                    {(tierOptions[idx] || [0.10, 0.20, 0.25]).map((inc) => (
                      <button
                        key={inc}
                        type="button"
                        onClick={() => handleUpdateTierIncrement(idx, inc)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                          slab.incrementCr === inc
                            ? "bg-amber-500 text-slate-950 shadow-xs"
                            : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                        }`}
                      >
                        +{formatCurrencyCr(inc)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Accelerated Rounds & Unsold Discount Settings */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Accelerated Rounds & Unsold Pool Rules
            </label>

            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-200">⚡ Number of Accelerated Rounds</div>
                  <div className="text-[10px] text-slate-400">Rounds where teams nominate unsold cricketers</div>
                </div>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setLocalSettings(prev => ({ ...prev, acceleratedRounds: r }))}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                        (localSettings.acceleratedRounds ?? 2) === r
                          ? "bg-blue-600 text-white"
                          : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-200">🏷️ Discount on Unsold Round Buys</div>
                  <div className="text-[10px] text-slate-400">Reduced base prices for accelerated round buys (Default 50%)</div>
                </div>
                <button
                  type="button"
                  onClick={() => setLocalSettings(prev => ({
                    ...prev,
                    allowUnsoldDiscount: !prev.allowUnsoldDiscount,
                    unsoldDiscountPercentage: prev.unsoldDiscountPercentage ?? 50
                  }))}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                    localSettings.allowUnsoldDiscount ? "bg-emerald-600" : "bg-slate-700"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      localSettings.allowUnsoldDiscount ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {localSettings.allowUnsoldDiscount && (
                <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between animate-in fade-in">
                  <span className="text-xs text-slate-400">Discount Percentage:</span>
                  <div className="flex gap-1.5">
                    {[25, 50, 75].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setLocalSettings(prev => ({ ...prev, unsoldDiscountPercentage: pct }))}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          (localSettings.unsoldDiscountPercentage ?? 50) === pct
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                        }`}
                      >
                        {pct}% {pct === 50 ? "(Default)" : ""}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setLocalSettings({
                allowCustomBids: false,
                allowJumpBids: false,
                bidSlabs: DEFAULT_IPL_BID_SLABS,
              });
            }}
            className="text-xs text-slate-400 hover:text-slate-200 underline"
          >
            Reset to IPL Defaults
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition-all active:scale-95"
            >
              Save Settings
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
