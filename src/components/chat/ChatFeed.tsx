"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { ChatMessage, Team } from "@/types/auction";
import { formatCurrencyCr } from "@/lib/auctionRules";
import { Lock, ThumbsUp, Flame, Laugh, Skull, Reply, Forward, Pin, Edit2, Trash2, Smile, X, CheckCheck } from "lucide-react";

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  message: ChatMessage | null;
}

interface ChatFeedProps {
  messages: ChatMessage[];
  currentUserTeam: Team | null;
  currentUserId?: string;
  onReact?: (messageId: string, emoji: string) => void;
  onReply?: (message: ChatMessage) => void;
  onForward?: (message: ChatMessage) => void;
  onPin?: (message: ChatMessage) => void;
  onDelete?: (message: ChatMessage) => void;
  onEdit?: (message: ChatMessage) => void;
}

const AVATAR_COLORS = ["#2563EB", "#7C3AED", "#059669", "#DC2626", "#D97706", "#0891B2", "#BE185D"];
function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const color = getAvatarColor(name);
  const initials = name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  return (
    <div style={{ width: size, height: size, background: color + "22", border: `1.5px solid ${color}55`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: size * 0.38, color, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function ContextMenu({ state, onClose, isOwn, onReply, onForward, onPin, onDelete, onEdit, onReact }: {
  state: ContextMenuState;
  onClose: () => void;
  isOwn: boolean;
  onReply?: () => void;
  onForward?: () => void;
  onPin?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  onReact?: (emoji: string) => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    const handleClick = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose(); };
    document.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handleClick);
    return () => { document.removeEventListener("keydown", handleKey); document.removeEventListener("mousedown", handleClick); };
  }, [onClose]);

  if (!state.visible) return null;

  // Adjust position to stay in viewport
  const x = Math.min(state.x, window.innerWidth - 200);
  const y = Math.min(state.y, window.innerHeight - 300);

  const items = [
    { icon: <span>😂</span>, label: "React", action: () => { onReact?.("fire"); onClose(); } },
    { icon: <Reply className="w-4 h-4" />, label: "Reply", action: () => { onReply?.(); onClose(); } },
    { icon: <Forward className="w-4 h-4" />, label: "Forward", action: () => { onForward?.(); onClose(); } },
    { icon: <Pin className="w-4 h-4" />, label: "Pin", action: () => { onPin?.(); onClose(); } },
    ...(isOwn ? [
      { icon: <Edit2 className="w-4 h-4" />, label: "Edit", action: () => { onEdit?.(); onClose(); } },
      { icon: <Trash2 className="w-4 h-4" />, label: "Delete", action: () => { onDelete?.(); onClose(); }, danger: true },
    ] : []),
  ];

  return (
    <div ref={menuRef} style={{ position: "fixed", top: y, left: x, zIndex: 9999, minWidth: 180, background: "rgba(15, 15, 15, 0.95)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "6px", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
      {/* Quick react row */}
      <div style={{ display: "flex", gap: 4, padding: "8px 10px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 4 }}>
        {["👍", "🔥", "😂", "💀", "❤️", "🎉"].map(emoji => (
          <button key={emoji} onClick={() => { onReact?.(emoji); onClose(); }} style={{ width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, background: "rgba(255,255,255,0.06)", border: "none", cursor: "pointer", transition: "all 0.1s" }} onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.14)")} onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}>{emoji}</button>
        ))}
      </div>
      {items.map(({ icon, label, action, danger }: any) => (
        <button key={label} onClick={action} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 9, background: "transparent", border: "none", color: danger ? "#F87171" : "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: 600, cursor: "pointer", textAlign: "left", transition: "all 0.1s" }} onMouseEnter={e => (e.currentTarget.style.background = danger ? "rgba(248,113,113,0.1)" : "rgba(255,255,255,0.06)")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
          {icon}{label}
        </button>
      ))}
    </div>
  );
}

function MessageBubble({ msg, isOwn, isWhisperVisible, onContextMenu, onLongPress, onSwipeReply }: {
  msg: ChatMessage;
  isOwn: boolean;
  isWhisperVisible: boolean;
  onContextMenu: (e: React.MouseEvent, msg: ChatMessage) => void;
  onLongPress: (e: React.TouchEvent, msg: ChatMessage) => void;
  onSwipeReply: (msg: ChatMessage) => void;
}) {
  const [swipeX, setSwipeX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const startXRef = useRef(0);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    setIsPressed(true);
    longPressTimer.current = setTimeout(() => {
      setIsPressed(false);
      onLongPress(e, msg);
    }, 500);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
    setIsPressed(false);
    const dx = e.touches[0].clientX - startXRef.current;
    if (dx > 0 && dx < 100) {
      setIsDragging(true);
      setSwipeX(dx);
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
    setIsPressed(false);
    if (swipeX >= 60) onSwipeReply(msg);
    setSwipeX(0);
    setIsDragging(false);
  };

  return (
    <div
      style={{ transform: `translateX(${swipeX}px)`, transition: isDragging ? "none" : "transform 0.3s cubic-bezier(0.34,1.56,0.64,1)", scale: isPressed ? "0.96" : "1", display: "flex", alignItems: "flex-end", gap: 8, justifyContent: isOwn ? "flex-end" : "flex-start" }}
      onContextMenu={(e) => { e.preventDefault(); onContextMenu(e, msg); }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {swipeX >= 40 && <span style={{ position: "absolute", left: -28, opacity: Math.min(1, (swipeX - 40) / 20), color: "#60A5FA", fontSize: 16 }}>↩</span>}
      {!isOwn && <Avatar name={msg.senderName} size={28} />}
      <div style={{ maxWidth: "75%" }}>
        {!isOwn && (
          <p style={{ fontSize: 11, fontWeight: 700, color: getAvatarColor(msg.senderName), marginBottom: 3, paddingLeft: 2 }}>{msg.senderName}</p>
        )}
        <div
          style={{
            padding: "9px 14px",
            borderRadius: isOwn ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
            background: isOwn ? "#2563EB" : "var(--bubble-bg, rgba(255,255,255,0.05))",
            color: isOwn ? "#FFFFFF" : "var(--bubble-text, rgba(255,255,255,0.9))",
            fontSize: 14,
            lineHeight: "1.45",
            boxShadow: isOwn ? "0 2px 8px rgba(37,99,235,0.3)" : "0 1px 3px rgba(0,0,0,0.15)",
            position: "relative",
          }}
        >
          {msg.text}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3, justifyContent: isOwn ? "flex-end" : "flex-start", paddingLeft: 4 }}>
          <span style={{ fontSize: 10, color: "rgba(156,163,175,0.8)" }}>{msg.timestamp}</span>
          {isOwn && <CheckCheck className="w-3 h-3" style={{ color: "rgba(96,165,250,0.7)" }} />}
        </div>
      </div>
      {isOwn && <Avatar name={msg.senderName} size={28} />}
    </div>
  );
}

export default function ChatFeed({ messages, currentUserTeam, currentUserId, onReact, onReply, onForward, onPin, onDelete, onEdit }: ChatFeedProps) {
  const scrollEndRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ visible: false, x: 0, y: 0, message: null });
  const [bottomSheetMsg, setBottomSheetMsg] = useState<ChatMessage | null>(null);

  useEffect(() => { scrollEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleContextMenu = useCallback((e: React.MouseEvent, msg: ChatMessage) => {
    e.preventDefault();
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, message: msg });
  }, []);

  const handleLongPress = useCallback((_e: React.TouchEvent, msg: ChatMessage) => {
    setBottomSheetMsg(msg);
  }, []);

  const handleSwipeReply = useCallback((msg: ChatMessage) => {
    onReply?.(msg);
  }, [onReply]);

  return (
    <div
      className="flex-1 overflow-y-auto p-4 space-y-4 transition-colors"
      style={{
        background: "var(--chat-bg, #0E0E0E)",
        // CSS variables set by parent or default
      } as React.CSSProperties}
    >
      {messages.map((msg) => {
        if (msg.isWhisper && (!currentUserTeam || msg.teamShortName !== currentUserTeam.shortName)) return null;
        const isOwn = !!currentUserId && msg.senderId === currentUserId;

        // EVENT CARD
        if (msg.eventCard) {
          const { type, playerName, teamName, amount, reactions } = msg.eventCard;
          return (
            <div key={msg.id} className="my-3 mx-auto" style={{ maxWidth: 400 }}>
              <div style={{ background: type === "SOLD" ? "linear-gradient(135deg, #059669, #047857)" : "linear-gradient(135deg, #374151, #1F2937)", borderRadius: 16, padding: "16px 20px", textAlign: "center", boxShadow: type === "SOLD" ? "0 8px 24px rgba(5,150,105,0.25)" : "0 4px 12px rgba(0,0,0,0.3)" }}>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: type === "SOLD" ? "#A7F3D0" : "#9CA3AF", marginBottom: 6 }}>🔨 HAMMER RESULT</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#FFFFFF", marginBottom: 4 }}>{type === "SOLD" ? `⚡ SOLD — ${playerName}` : `❌ UNSOLD — ${playerName}`}</div>
                {type === "SOLD" && teamName && amount && (
                  <div style={{ fontSize: 14, color: "#D1FAE5", fontWeight: 700 }}>Bought by <strong style={{ color: "#FFFFFF" }}>{teamName}</strong> for <strong style={{ color: "#6EE7B7" }}>{formatCurrencyCr(amount)}</strong></div>
                )}
                <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 12 }}>
                  {[{ l: "👍", k: "thumbsup" }, { l: "🔥", k: "fire" }, { l: "😂", k: "laugh" }, { l: "💀", k: "skull" }].map(r => (
                    <button key={r.k} onClick={() => onReact?.(msg.id, r.k)} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 20, padding: "4px 10px", color: "#FFFFFF", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                      {r.l} <span style={{ fontSize: 10, opacity: 0.7 }}>{reactions?.[r.k] || 0}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        }

        // WHISPER BUBBLE
        if (msg.isWhisper && currentUserTeam && msg.teamShortName === currentUserTeam.shortName) {
          return (
            <div key={msg.id} className="flex justify-end">
              <div style={{ maxWidth: "75%", background: "linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.1))", border: "1px solid rgba(251,191,36,0.3)", borderRadius: "18px 18px 4px 18px", padding: "10px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                  <Lock style={{ width: 11, height: 11, color: "#F59E0B" }} />
                  <span style={{ fontSize: 10, fontWeight: 800, color: "#F59E0B", textTransform: "uppercase", letterSpacing: "0.06em" }}>{currentUserTeam.shortName} DUGOUT · {msg.senderName}</span>
                </div>
                <p style={{ fontSize: 14, color: "#FDE68A", lineHeight: 1.4 }}>{msg.text}</p>
                <p style={{ fontSize: 10, color: "rgba(251,191,36,0.5)", textAlign: "right", marginTop: 4 }}>{msg.timestamp}</p>
              </div>
            </div>
          );
        }

        // REGULAR MESSAGE
        return (
          <div key={msg.id} style={{ position: "relative" }}>
            <MessageBubble
              msg={msg}
              isOwn={isOwn}
              isWhisperVisible={false}
              onContextMenu={handleContextMenu}
              onLongPress={handleLongPress}
              onSwipeReply={handleSwipeReply}
            />
          </div>
        );
      })}
      <div ref={scrollEndRef} />

      {/* Desktop Context Menu */}
      <ContextMenu
        state={contextMenu}
        onClose={() => setContextMenu({ ...contextMenu, visible: false })}
        isOwn={!!currentUserId && contextMenu.message?.senderId === currentUserId}
        onReply={() => contextMenu.message && onReply?.(contextMenu.message)}
        onForward={() => contextMenu.message && onForward?.(contextMenu.message)}
        onPin={() => contextMenu.message && onPin?.(contextMenu.message)}
        onDelete={() => contextMenu.message && onDelete?.(contextMenu.message)}
        onEdit={() => contextMenu.message && onEdit?.(contextMenu.message)}
        onReact={(emoji) => contextMenu.message && onReact?.(contextMenu.message.id, emoji)}
      />

      {/* Mobile Bottom Sheet Context Menu */}
      {bottomSheetMsg && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9998, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }} onClick={() => setBottomSheetMsg(null)}>
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(15,15,15,0.98)", borderRadius: "24px 24px 0 0", padding: "20px 16px 36px", border: "1px solid rgba(255,255,255,0.08)" }} onClick={e => e.stopPropagation()}>
            {/* Quick reacts */}
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 16 }}>
              {["👍", "🔥", "😂", "💀", "❤️", "🎉"].map(emoji => (
                <button key={emoji} onClick={() => { onReact?.(bottomSheetMsg.id, emoji); setBottomSheetMsg(null); }} style={{ width: 44, height: 44, borderRadius: 12, fontSize: 20, background: "rgba(255,255,255,0.08)", border: "none", cursor: "pointer" }}>{emoji}</button>
              ))}
            </div>
            {/* Preview */}
            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "10px 14px", marginBottom: 12 }}>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 3, fontWeight: 700 }}>{bottomSheetMsg.senderName}</p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.8)" }}>{bottomSheetMsg.text.slice(0, 80)}{bottomSheetMsg.text.length > 80 ? "..." : ""}</p>
            </div>
            {[
              { icon: <Reply className="w-5 h-5" />, label: "Reply", action: () => { onReply?.(bottomSheetMsg); setBottomSheetMsg(null); } },
              { icon: <Forward className="w-5 h-5" />, label: "Forward", action: () => { onForward?.(bottomSheetMsg); setBottomSheetMsg(null); } },
              { icon: <Pin className="w-5 h-5" />, label: "Pin Message", action: () => { onPin?.(bottomSheetMsg); setBottomSheetMsg(null); } },
              ...(bottomSheetMsg.senderId === currentUserId ? [
                { icon: <Edit2 className="w-5 h-5" />, label: "Edit", action: () => { onEdit?.(bottomSheetMsg); setBottomSheetMsg(null); } },
                { icon: <Trash2 className="w-5 h-5" />, label: "Delete", action: () => { onDelete?.(bottomSheetMsg); setBottomSheetMsg(null); }, danger: true },
              ] : []),
            ].map(({ icon, label, action, danger }: any) => (
              <button key={label} onClick={action} style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "14px 6px", background: "transparent", border: "none", color: danger ? "#F87171" : "rgba(255,255,255,0.85)", fontSize: 15, fontWeight: 600, cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ opacity: 0.7 }}>{icon}</span>{label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
