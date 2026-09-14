"use client";

import React, { useRef, useEffect } from "react";
import { ChatMessage, Team } from "@/types/auction";
import { formatCurrencyCr } from "@/lib/auctionRules";
import { Lock, ThumbsUp, Flame, Laugh, Skull } from "lucide-react";

interface ChatFeedProps {
  messages: ChatMessage[];
  currentUserTeam: Team | null;
  onReact?: (messageId: string, emoji: string) => void;
}

export default function ChatFeed({
  messages,
  currentUserTeam,
  onReact,
}: ChatFeedProps) {
  const scrollEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-950 transition-colors">
      {messages.map((msg) => {
        // If it's a whisper and doesn't match user's team, return null (100% complete invisibility)
        if (
          msg.isWhisper &&
          (!currentUserTeam || msg.teamShortName !== currentUserTeam.shortName)
        ) {
          return null;
        }

        // -------------------------------------------------------------
        // LIVE AUCTION EVENT CARD (SOLD / UNSOLD / RTM)
        // -------------------------------------------------------------
        if (msg.eventCard) {
          const { type, playerName, teamName, amount, reactions } = msg.eventCard;

          return (
            <div
              key={msg.id}
              className="my-3 mx-auto max-w-md bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-sm text-center space-y-2 animate-in zoom-in-95"
            >
              <div className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-center space-x-1">
                <span>🔨 AUCTION HAMMER RESULT</span>
              </div>

              <div className="text-lg font-black text-slate-900 dark:text-white font-heading">
                {type === "SOLD" ? `SOLD! ${playerName}` : `UNSOLD: ${playerName}`}
              </div>

              {type === "SOLD" && teamName && amount && (
                <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Bought by <span className="text-blue-600 dark:text-blue-400 font-black">{teamName}</span> for{" "}
                  <span className="text-emerald-600 dark:text-emerald-400 font-black">{formatCurrencyCr(amount)}</span>
                </div>
              )}

              {/* Reaction Buttons */}
              <div className="flex items-center justify-center space-x-2 pt-1">
                {[
                  { icon: ThumbsUp, label: "👍", key: "thumbsup" },
                  { icon: Flame, label: "🔥", key: "fire" },
                  { icon: Laugh, label: "😂", key: "laugh" },
                  { icon: Skull, label: "💀", key: "skull" },
                ].map((r) => (
                  <button
                    key={r.key}
                    onClick={() => onReact && onReact(msg.id, r.key)}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 active:scale-95 transition-all"
                  >
                    <span>{r.label}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      {reactions?.[r.key] || 0}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          );
        }

        // -------------------------------------------------------------
        // INLINE TEAM WHISPER BUBBLE (Visible only to teammates, tinted)
        // -------------------------------------------------------------
        if (msg.isWhisper && currentUserTeam && msg.teamShortName === currentUserTeam.shortName) {
          return (
            <div
              key={msg.id}
              className="p-3 rounded-2xl border border-amber-300 dark:border-amber-600/60 bg-amber-50/90 dark:bg-amber-950/40 shadow-xs max-w-sm ml-auto space-y-1"
            >
              <div className="flex items-center space-x-1 text-[11px] font-black text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                <Lock className="w-3 h-3" />
                <span>{currentUserTeam.shortName} TEAM DUGOUT • {msg.senderName}</span>
              </div>
              <p className="text-sm text-amber-950 dark:text-amber-100 font-medium">{msg.text}</p>
              <div className="text-[10px] text-amber-800/70 dark:text-amber-300/70 text-right">{msg.timestamp}</div>
            </div>
          );
        }

        // -------------------------------------------------------------
        // REGULAR PUBLIC CHAT MESSAGE
        // -------------------------------------------------------------
        return (
          <div key={msg.id} className="flex flex-col max-w-md space-y-0.5">
            <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-bold text-slate-800 dark:text-slate-200">{msg.senderName}</span>
              {msg.teamShortName && (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {msg.teamShortName}
                </span>
              )}
              <span className="text-[10px]">{msg.timestamp}</span>
            </div>
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-850 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs text-sm text-slate-900 dark:text-slate-100">
              {msg.text}
            </div>
          </div>
        );
      })}
      <div ref={scrollEndRef} />
    </div>
  );
}
