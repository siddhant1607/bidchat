"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChatMessage, Team } from "@/types/auction";
import { Lock, ChevronUp, ChevronDown, Send } from "lucide-react";

interface TeamWhisperBarProps {
  userTeam: Team;
  whispers: ChatMessage[];
  onSendWhisper: (text: string) => void;
}

export default function TeamWhisperBar({
  userTeam,
  whispers,
  onSendWhisper,
}: TeamWhisperBarProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [text, setText] = useState<string>("");
  const whisperEndRef = useRef<HTMLDivElement>(null);

  const prevWhispersCountRef = useRef(whispers.length);

  // When a new whisper arrives and window is collapsed, trigger unread badge & flashing notification
  useEffect(() => {
    if (whispers.length > prevWhispersCountRef.current) {
      if (!isExpanded) {
        setUnreadCount((prev) => prev + (whispers.length - prevWhispersCountRef.current));
        setIsFlashing(true);
        const timer = setTimeout(() => setIsFlashing(false), 2000);
        return () => clearTimeout(timer);
      }
    }
    prevWhispersCountRef.current = whispers.length;
  }, [whispers.length, isExpanded]);

  useEffect(() => {
    if (isExpanded) {
      setUnreadCount(0);
      setIsFlashing(false);
      whisperEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isExpanded]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendWhisper(text.trim());
    setText("");
  };

  return (
    <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg transition-all duration-300">
      {/* ------------------------------------------------------------- */}
      {/* COLLAPSIBLE HEADER BAR                                         */}
      {/* ------------------------------------------------------------- */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          backgroundColor: isFlashing
            ? userTeam.primaryColor || "#F59E0B"
            : "#0F172A",
        }}
        className="w-full px-4 py-2.5 flex items-center justify-between text-white font-bold text-xs transition-colors duration-300 shadow-sm select-none"
      >
        <div className="flex items-center space-x-2">
          <Lock className="w-4 h-4 text-amber-400" />
          <span>🔒 {userTeam.shortName} War Room (Team Whispers)</span>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black animate-pulse">
              {unreadCount} new
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1 text-slate-300">
          <span className="text-[11px] font-normal mr-1">
            {isExpanded ? "Collapse" : "Expand"}
          </span>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronUp className="w-4 h-4" />
          )}
        </div>
      </button>

      {/* ------------------------------------------------------------- */}
      {/* EXPANDED WHISPER DUGOUT PANEL                                */}
      {/* ------------------------------------------------------------- */}
      {isExpanded && (
        <div className="h-64 flex flex-col bg-amber-50/40 dark:bg-amber-950/20 border-b border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom-2">
          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {whispers.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 italic">
                No whispers yet. Coordinate strategies with your teammates secretly!
              </div>
            ) : (
              whispers.map((w) => (
                <div
                  key={w.id}
                  className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700/50 text-xs shadow-xs space-y-0.5"
                >
                  <div className="flex items-center justify-between text-[10px] text-amber-900 dark:text-amber-300 font-bold">
                    <span>{w.senderName}</span>
                    <span className="text-slate-400 font-normal">{w.timestamp}</span>
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 font-medium">{w.text}</p>
                </div>
              ))
            )}
            <div ref={whisperEndRef} />
          </div>

          {/* Dedicated Whisper Quick-Send Input */}
          <form onSubmit={handleSend} className="p-2 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-2">
            <input
              type="text"
              placeholder={`Whisper to ${userTeam.shortName} dugout...`}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 text-xs border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-slate-800"
            />
            <button
              type="submit"
              disabled={!text.trim()}
              className="p-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-xl active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
