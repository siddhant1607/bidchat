"use client";

import React, { useState } from "react";
import { Lock, Send } from "lucide-react";
import { Team } from "@/types/auction";

interface ChatInputProps {
  userTeam: Team | null;
  onSendMessage: (text: string, isWhisper: boolean) => void;
}

export default function ChatInput({ userTeam, onSendMessage }: ChatInputProps) {
  const [text, setText] = useState("");
  const [isWhisperMode, setIsWhisperMode] = useState(false);
  const [showSlashHints, setShowSlashHints] = useState(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setText(val);

    if (val.startsWith("/")) {
      setShowSlashHints(true);
    } else {
      setShowSlashHints(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    // Check if user typed /whisper or /w
    if (text.startsWith("/whisper ") || text.startsWith("/w ")) {
      const cleanText = text.replace(/^\/(whisper|w)\s+/, "");
      if (cleanText.trim()) {
        onSendMessage(cleanText.trim(), true);
        setText("");
        setShowSlashHints(false);
        return;
      }
    }

    onSendMessage(text.trim(), isWhisperMode);
    setText("");
    setShowSlashHints(false);
  };

  return (
    <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 relative transition-colors">
      {/* ------------------------------------------------------------- */}
      {/* SLASH COMMANDS HOVER POPUP                                     */}
      {/* ------------------------------------------------------------- */}
      {showSlashHints && (
        <div className="absolute bottom-16 left-4 bg-slate-900 text-white rounded-2xl p-2.5 shadow-2xl border border-slate-800 text-xs w-64 space-y-1.5 animate-in slide-in-from-bottom-2">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
            Available Slash Commands
          </div>
          <button
            type="button"
            onClick={() => {
              setText("/whisper ");
              setIsWhisperMode(true);
              setShowSlashHints(false);
            }}
            className="w-full text-left px-2 py-1.5 hover:bg-slate-800 rounded-lg flex items-center space-x-2"
          >
            <Lock className="w-3.5 h-3.5 text-teal-400" />
            <span>
              <strong>/whisper</strong> — Secret team message
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              setText("/purse");
              setShowSlashHints(false);
            }}
            className="w-full text-left px-2 py-1.5 hover:bg-slate-800 rounded-lg"
          >
            <strong>/purse</strong> — View remaining budgets
          </button>
        </div>
      )}

      {/* Whisper Mode Active Alert Pill */}
      {isWhisperMode && userTeam && (
        <div className="mb-2 flex items-center justify-between px-3 py-1 bg-teal-50 dark:bg-teal-950/60 border border-teal-300/60 dark:border-teal-700/60 rounded-xl text-xs text-teal-900 dark:text-teal-300 font-bold animate-in fade-in">
          <div className="flex items-center space-x-1.5">
            <Lock className="w-3.5 h-3.5 text-amber-700 dark:text-teal-400" />
            <span>Whisper Mode Active: Only {userTeam.shortName} teammates will see this</span>
          </div>
          <button
            onClick={() => setIsWhisperMode(false)}
            className="text-[10px] text-amber-700 dark:text-teal-400 hover:underline"
          >
            Cancel
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        {/* WHISPER BUTTON: Replaces the attachment button */}
        <button
          type="button"
          disabled={!userTeam}
          onClick={() => setIsWhisperMode(!isWhisperMode)}
          title={
            userTeam
              ? isWhisperMode
                ? "Switch back to Public Chat"
                : `Whisper to ${userTeam.shortName} Team Dugout`
              : "Join a team to whisper"
          }
          className={`p-2.5 rounded-xl transition-all ${
            isWhisperMode
              ? "bg-teal-500 text-white shadow-md"
              : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40"
          }`}
        >
          <Lock className="w-4 h-4" />
        </button>

        {/* Message Input */}
        <input
          type="text"
          value={text}
          onChange={handleTextChange}
          placeholder={
            isWhisperMode && userTeam
              ? `Secret message to ${userTeam.shortName}...`
              : "Message or type / for commands..."
          }
          className={`flex-1 text-sm border rounded-xl px-4 py-2.5 text-slate-900 dark:text-white outline-none transition-all ${
            isWhisperMode
              ? "border-teal-400 focus:ring-2 focus:ring-teal-400 bg-teal-50/30 dark:bg-teal-950/20"
              : "border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-600 bg-white dark:bg-slate-800"
          }`}
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!text.trim()}
          className={`p-2.5 rounded-xl text-white transition-all active:scale-95 disabled:opacity-40 ${
            isWhisperMode
              ? "bg-teal-600 hover:bg-teal-700"
              : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
