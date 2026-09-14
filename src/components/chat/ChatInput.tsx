"use client";

import React, { useState } from "react";
import { Lock, Send, X, Reply } from "lucide-react";
import { Team } from "@/types/auction";

interface ChatInputProps {
  userTeam: Team | null;
  onSendMessage: (text: string, isWhisper: boolean) => void;
  replyTo?: { senderName: string; text: string } | null;
  onCancelReply?: () => void;
}

export default function ChatInput({ userTeam, onSendMessage, replyTo, onCancelReply }: ChatInputProps) {
  const [text, setText] = useState("");
  const [isWhisperMode, setIsWhisperMode] = useState(false);
  const [showSlashHints, setShowSlashHints] = useState(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setText(val);
    setShowSlashHints(val.startsWith("/"));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    if (text.startsWith("/whisper ") || text.startsWith("/w ")) {
      const cleanText = text.replace(/^\/(whisper|w)\s+/, "");
      if (cleanText.trim()) { onSendMessage(cleanText.trim(), true); setText(""); setShowSlashHints(false); return; }
    }
    onSendMessage(text.trim(), isWhisperMode);
    setText("");
    setShowSlashHints(false);
    onCancelReply?.();
  };

  return (
    <div
      className="transition-colors"
      style={{
        background: "rgba(10,10,10,0.95)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: replyTo ? "0" : "10px 12px 12px",
      }}
    >
      {/* Slash Commands Popup */}
      {showSlashHints && (
        <div style={{ position: "absolute", bottom: 80, left: 12, background: "rgba(15,15,15,0.98)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 8, minWidth: 260, boxShadow: "0 20px 40px rgba(0,0,0,0.6)", zIndex: 100 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em", padding: "4px 8px 8px" }}>Available Commands</div>
          <button type="button" onClick={() => { setText("/whisper "); setIsWhisperMode(true); setShowSlashHints(false); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 9, background: "transparent", border: "none", color: "rgba(255,255,255,0.85)", fontSize: 13, cursor: "pointer" }} onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
            <Lock style={{ width: 14, height: 14, color: "#34D399" }} />
            <span><strong style={{ color: "#FFFFFF" }}>/whisper</strong> — Send a secret dugout message</span>
          </button>
          <button type="button" onClick={() => { setText("/purse"); setShowSlashHints(false); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 9, background: "transparent", border: "none", color: "rgba(255,255,255,0.85)", fontSize: 13, cursor: "pointer" }} onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
            <span style={{ width: 14, textAlign: "center" }}>💰</span>
            <span><strong style={{ color: "#FFFFFF" }}>/purse</strong> — View remaining budgets</span>
          </button>
        </div>
      )}

      {/* Reply Preview Bar */}
      {replyTo && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(37,99,235,0.08)" }}>
          <div style={{ width: 3, height: 36, background: "#2563EB", borderRadius: 2, flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: "#60A5FA", marginBottom: 1 }}>{replyTo.senderName}</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{replyTo.text}</p>
          </div>
          <button onClick={onCancelReply} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4, color: "rgba(255,255,255,0.4)" }}>
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>
      )}

      {/* Whisper Mode Alert */}
      {isWhisperMode && userTeam && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 14px", background: "rgba(16,185,129,0.08)", borderBottom: "1px solid rgba(16,185,129,0.15)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Lock style={{ width: 13, height: 13, color: "#34D399" }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#34D399" }}>Dugout Mode: Only {userTeam.shortName} sees this</span>
          </div>
          <button onClick={() => setIsWhisperMode(false)} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 11, color: "rgba(52,211,153,0.7)", fontWeight: 700 }}>Cancel</button>
        </div>
      )}

      {/* Input Row */}
      <form onSubmit={handleSubmit} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px 12px" }}>
        <button
          type="button"
          disabled={!userTeam}
          onClick={() => setIsWhisperMode(!isWhisperMode)}
          title={userTeam ? (isWhisperMode ? "Back to public" : `Whisper to ${userTeam.shortName}`) : "Join a team"}
          style={{ width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: isWhisperMode ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.06)", border: isWhisperMode ? "1px solid rgba(16,185,129,0.4)" : "1px solid rgba(255,255,255,0.08)", color: isWhisperMode ? "#34D399" : "rgba(255,255,255,0.4)", cursor: userTeam ? "pointer" : "not-allowed", opacity: userTeam ? 1 : 0.4, transition: "all 0.2s" }}
        >
          <Lock style={{ width: 16, height: 16 }} />
        </button>

        <input
          type="text"
          value={text}
          onChange={handleTextChange}
          placeholder={isWhisperMode && userTeam ? `Secret to ${userTeam.shortName}...` : "Message or / for commands..."}
          style={{
            flex: 1,
            height: 40,
            borderRadius: 20,
            padding: "0 16px",
            fontSize: 14,
            background: isWhisperMode ? "rgba(16,185,129,0.06)" : "rgba(255,255,255,0.06)",
            border: isWhisperMode ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.9)",
            outline: "none",
            transition: "all 0.2s",
          }}
        />

        <button
          type="submit"
          disabled={!text.trim()}
          style={{ width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: text.trim() ? (isWhisperMode ? "#059669" : "#2563EB") : "rgba(255,255,255,0.06)", border: "none", color: text.trim() ? "#FFFFFF" : "rgba(255,255,255,0.25)", cursor: text.trim() ? "pointer" : "not-allowed", transition: "all 0.2s" }}
        >
          <Send style={{ width: 16, height: 16 }} />
        </button>
      </form>
    </div>
  );
}
