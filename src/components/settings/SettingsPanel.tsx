"use client";

import React, { useState, useEffect } from "react";
import { Menu, Camera, Upload,
  User,
  MessageSquare,
  Gavel,
  Bell,
  ShieldCheck,
  Palette,
  Database,
  LogOut,
  Check,
  Copy,
  Trash2,
  Smartphone,
  Laptop2,
  Sun,
  Moon,
  Laptop
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface UserProfile {
  name?: string;
  username: string;
  email: string;
  bio?: string;
  avatarBg?: string;
  avatarUrl?: string;
}

interface SettingsPanelProps {
  user?: UserProfile | null;
  onUserUpdate?: (updated: UserProfile) => void;
  onSignOut?: () => void;
  onOpenMenu?: () => void;
}

export default function SettingsPanel({ user: initialUser, onUserUpdate, onSignOut, onOpenMenu }: SettingsPanelProps) {
  const { themeMode, setThemeMode } = useTheme();

  const [activeCategory, setActiveCategory] = useState<
    "account" | "chats" | "auctions" | "notifications" | "privacy" | "appearance" | "storage"
  >("account");

  const [name, setName] = useState(initialUser?.name || "Cricket Enthusiast");
  const [username, setUsername] = useState(initialUser?.username || "@user");
  const [email, setEmail] = useState(initialUser?.email || "user@example.com");
  const [bio, setBio] = useState("Ready for the IPL 2026 Mega Auction! 🏏");
  const [avatarBg, setAvatarBg] = useState("#F59E0B");
  const [avatarUrl, setAvatarUrl] = useState<string>(initialUser?.avatarUrl || "");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [profileSavedToast, setProfileSavedToast] = useState(false);

  const [autoCollapseSidebar, setAutoCollapseSidebar] = useState(false);
  const [defaultFilter, setDefaultFilter] = useState<"peers" | "all" | "dugouts" | "auctions">("peers");
  const [enterIsSend, setEnterIsSend] = useState(true);
  const [fontSize, setFontSize] = useState<"compact" | "normal" | "large">("normal");
  const [readReceipts, setReadReceipts] = useState(true);
  const [typingIndicators, setTypingIndicators] = useState(true);

  const [confirmHighBids, setConfirmHighBids] = useState(true);
  const [favFranchise, setFavFranchise] = useState("CSK");
  const [soundGavel, setSoundGavel] = useState(true);
  const [soundCountdown, setSoundCountdown] = useState(true);
  const [soundOutbid, setSoundOutbid] = useState(true);
  const [autoOpenDugout, setAutoOpenDugout] = useState(true);

  const [enablePush, setEnablePush] = useState(true);
  const [dugoutWhisperAlerts, setDugoutWhisperAlerts] = useState(true);
  const [auctionOutbidAlerts, setAuctionOutbidAlerts] = useState(true);
  const [doNotDisturb, setDoNotDisturb] = useState(false);

  const [lastSeenPrivacy, setLastSeenPrivacy] = useState<"everyone" | "friends" | "nobody">("everyone");
  const [whoCanMessage, setWhoCanMessage] = useState<"everyone" | "friends" | "nobody">("everyone");
  const [invitePrivacy, setInvitePrivacy] = useState<"everyone" | "friends">("everyone");
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  const [cacheSize, setCacheSize] = useState("24.8 MB");
  const [cacheClearedToast, setCacheClearedToast] = useState(false);

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("bidchat-settings");
      if (savedSettings) {
        const s = JSON.parse(savedSettings);
        if (s.autoCollapseSidebar !== undefined) setAutoCollapseSidebar(s.autoCollapseSidebar);
        if (s.defaultFilter) setDefaultFilter(s.defaultFilter);
        if (s.enterIsSend !== undefined) setEnterIsSend(s.enterIsSend);
        if (s.fontSize) setFontSize(s.fontSize);
        if (s.readReceipts !== undefined) setReadReceipts(s.readReceipts);
        if (s.typingIndicators !== undefined) setTypingIndicators(s.typingIndicators);
        if (s.confirmHighBids !== undefined) setConfirmHighBids(s.confirmHighBids);
        if (s.favFranchise) setFavFranchise(s.favFranchise);
        if (s.soundGavel !== undefined) setSoundGavel(s.soundGavel);
        if (s.soundCountdown !== undefined) setSoundCountdown(s.soundCountdown);
        if (s.soundOutbid !== undefined) setSoundOutbid(s.soundOutbid);
        if (s.autoOpenDugout !== undefined) setAutoOpenDugout(s.autoOpenDugout);
        if (s.enablePush !== undefined) setEnablePush(s.enablePush);
        if (s.dugoutWhisperAlerts !== undefined) setDugoutWhisperAlerts(s.dugoutWhisperAlerts);
        if (s.auctionOutbidAlerts !== undefined) setAuctionOutbidAlerts(s.auctionOutbidAlerts);
        if (s.doNotDisturb !== undefined) setDoNotDisturb(s.doNotDisturb);
        if (s.lastSeenPrivacy) setLastSeenPrivacy(s.lastSeenPrivacy);
        if (s.whoCanMessage) setWhoCanMessage(s.whoCanMessage);
        if (s.invitePrivacy) setInvitePrivacy(s.invitePrivacy);
        if (s.twoFactorAuth !== undefined) setTwoFactorAuth(s.twoFactorAuth);
      }

      const storedUser = localStorage.getItem("bidchat-user");
      if (storedUser) {
        const u = JSON.parse(storedUser);
        if (u.name) setName(u.name);
        if (u.username) setUsername(u.username);
        if (u.email) setEmail(u.email);
        if (u.bio) setBio(u.bio);
        if (u.avatarBg) setAvatarBg(u.avatarBg);
        if (u.avatarUrl !== undefined) setAvatarUrl(u.avatarUrl);
      }
    } catch (e) {
      console.error("Error loading settings:", e);
    }
  }, []);

  const persistSettings = (updates: Record<string, any>) => {
    try {
      const current = JSON.parse(localStorage.getItem("bidchat-settings") || "{}");
      const merged = { ...current, ...updates };
      localStorage.setItem("bidchat-settings", JSON.stringify(merged));
      window.dispatchEvent(new Event("storage"));
    } catch (e) {
      console.error("Error saving settings:", e);
    }
  };

  
  const PRESET_AVATARS = [
    { label: "Batsman", icon: "🏏" },
    { label: "Bowler", icon: "⚡" },
    { label: "Keeper", icon: "🧤" },
    { label: "Champion", icon: "🏆" },
    { label: "Auctioneer", icon: "🔨" },
    { label: "King", icon: "👑" },
    { label: "Lion", icon: "🦁" },
    { label: "Target", icon: "🎯" },
    { label: "Stadium", icon: "🏟️" },
    { label: "Captain", icon: "🛡️" },
  ];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 256;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          setAvatarUrl(dataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = () => {
    const updated: UserProfile = { name, username, email, bio, avatarBg, avatarUrl };
    try {
      const stored = JSON.parse(localStorage.getItem("bidchat-user") || "{}");
      localStorage.setItem("bidchat-user", JSON.stringify({ ...stored, ...updated }));
      if (onUserUpdate) onUserUpdate(updated);
      setProfileSavedToast(true);
      setTimeout(() => setProfileSavedToast(false), 2500);
    } catch (e) {
      console.error("Failed to save profile:", e);
    }
  };

  const clearCache = () => {
    setCacheSize("0.0 MB");
    setCacheClearedToast(true);
    setTimeout(() => setCacheClearedToast(false), 2500);
  };

  const FRANCHISES = [
    { code: "CSK", name: "Chennai Super Kings", color: "#FDB913" },
    { code: "MI", name: "Mumbai Indians", color: "#004BA0" },
    { code: "RCB", name: "Royal Challengers Bengaluru", color: "#DA1818" },
    { code: "KKR", name: "Kolkata Knight Riders", color: "#3A225D" },
    { code: "SRH", name: "Sunrisers Hyderabad", color: "#F26522" },
    { code: "DC", name: "Delhi Capitals", color: "#0078BC" },
    { code: "RR", name: "Rajasthan Royals", color: "#EA1A85" },
    { code: "GT", name: "Gujarat Titans", color: "#1B2133" },
    { code: "LSG", name: "Lucknow Super Giants", color: "#A7D5F2" },
    { code: "PBKS", name: "Punjab Kings", color: "#DD1F2D" },
  ];

  const AVATAR_COLORS = ["#F59E0B", "#3B82F6", "#10B981", "#8B5CF6", "#EC4899", "#EF4444", "#14B8A6"];

  const CATEGORIES = [
    { id: "account", label: "Account & Profile", icon: <User className="w-4 h-4" /> },
    { id: "chats", label: "Chat & Media", icon: <MessageSquare className="w-4 h-4" /> },
    { id: "auctions", label: "Auction & Bidding", icon: <Gavel className="w-4 h-4" /> },
    { id: "notifications", label: "Notifications & Sounds", icon: <Bell className="w-4 h-4" /> },
    { id: "privacy", label: "Privacy & Security", icon: <ShieldCheck className="w-4 h-4" /> },
    { id: "appearance", label: "Appearance", icon: <Palette className="w-4 h-4" /> },
    { id: "storage", label: "Storage & Network", icon: <Database className="w-4 h-4" /> },
  ] as const;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FDFCFB] dark:bg-[#121212] overflow-hidden">
      {/* Header */}
      <header className="h-16 px-4 sm:px-8 border-b border-slate-200 dark:border-[#2A2A2A] flex items-center justify-between shrink-0 bg-white/50 dark:bg-[#1A1A1A]/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          {onOpenMenu && (
            <button 
              onClick={onOpenMenu}
              className="md:hidden p-2 -ml-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#2A2A2A] text-slate-700 dark:text-slate-300"
              title="Open Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
            <div>
              <h1 className="text-xl font-bold tracking-tight">Settings</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Preferences, profile management & auction controls</p>
            </div>
          </div>
        {profileSavedToast && (
          <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center gap-1.5 animate-in fade-in">
            <Check className="w-3.5 h-3.5" />
            <span>Profile updated!</span>
          </div>
        )}
        {cacheClearedToast && (
          <div className="px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center gap-1.5 animate-in fade-in">
            <Check className="w-3.5 h-3.5" />
            <span>Cache cleared!</span>
          </div>
        )}
      </header>

      {/* Container */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar categories */}
        <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] p-3 shrink-0 flex md:flex-col gap-1 overflow-x-auto md:overflow-y-auto scrollbar-hide">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left whitespace-nowrap shrink-0 md:shrink ${
                  isActive
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#252525] hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
          <div className="max-w-2xl mx-auto space-y-6 pb-12">

            {/* 1. Account */}
            {activeCategory === "account" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <SectionHeader title="Profile & Identity" subtitle="Manage your public handle, personal info and login credentials" />

                <div className="p-6 rounded-[28px] bg-white dark:bg-[#1E1E1E] border border-slate-100 dark:border-transparent shadow-sm space-y-5">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* Photo / Avatar Display */}
                    <div className="relative group shrink-0">
                      {avatarUrl ? (
                        avatarUrl.startsWith("data:image") || avatarUrl.startsWith("http") ? (
                          <img
                            src={avatarUrl}
                            alt="Profile Photo"
                            className="w-24 h-24 rounded-full object-cover shadow-lg ring-4 ring-blue-500/20"
                          />
                        ) : (
                          <div
                            className="w-24 h-24 rounded-full flex items-center justify-center text-5xl shadow-lg ring-4 ring-blue-500/20 select-none"
                            style={{ backgroundColor: avatarBg }}
                          >
                            {avatarUrl}
                          </div>
                        )
                      ) : (
                        <div
                          className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-black shadow-lg ring-4 ring-blue-500/20 transition-colors select-none"
                          style={{ backgroundColor: avatarBg }}
                        >
                          {username.replace("@", "").charAt(0).toUpperCase() || "U"}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md transition-transform hover:scale-110"
                        title="Upload profile photo"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </div>

                    {/* Photo Action Controls */}
                    <div className="flex-1 text-center sm:text-left space-y-2">
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Photo</span>
                        </button>
                        {avatarUrl && (
                          <button
                            type="button"
                            onClick={() => setAvatarUrl("")}
                            className="px-3 py-2 rounded-full bg-slate-100 dark:bg-[#2A2A2A] hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-600 dark:text-slate-300 hover:text-rose-600 text-xs font-bold transition-colors"
                          >
                            Remove Photo
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        JPG, PNG or GIF up to 5MB. Photo automatically optimizes to crisp square display.
                      </p>
                    </div>
                  </div>

                  {/* Sports Avatars Picker */}
                  <div className="pt-3 border-t border-slate-100 dark:border-[#2A2A2A]">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                      Or Choose a Cricket Avatar
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {PRESET_AVATARS.map((av) => (
                        <button
                          key={av.label}
                          type="button"
                          onClick={() => setAvatarUrl(av.icon)}
                          title={av.label}
                          className={`w-9 h-9 rounded-2xl text-lg flex items-center justify-center transition-all ${
                            avatarUrl === av.icon
                              ? "bg-blue-600 text-white scale-110 shadow-md ring-2 ring-blue-500/50"
                              : "bg-slate-50 dark:bg-[#252F48] hover:scale-105"
                          }`}
                        >
                          {av.icon}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Initials Accent Color (when photo is not uploaded) */}
                  <div className="pt-3 border-t border-slate-100 dark:border-[#2A2A2A]">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                      Avatar Background Color
                    </span>
                    <div className="flex items-center gap-2">
                      {AVATAR_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setAvatarBg(color)}
                          className={`w-7 h-7 rounded-full transition-transform ${avatarBg === color ? "scale-125 ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-[#1E1E1E]" : "hover:scale-110"}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-[28px] bg-white dark:bg-[#1E1E1E] border border-slate-100 dark:border-transparent shadow-sm space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Display Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#2A2A2A] border border-slate-200 dark:border-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. Siddhant"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Username</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.startsWith("@") ? e.target.value : `@${e.target.value}`)}
                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#2A2A2A] border border-slate-200 dark:border-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                        placeholder="@username"
                      />
                      <button
                        onClick={() => navigator.clipboard?.writeText(username)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                        title="Copy Username"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#2A2A2A] border border-slate-200 dark:border-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="you@domain.com"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bio / Status</label>
                    <textarea
                      rows={2}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#2A2A2A] border border-slate-200 dark:border-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="What are your auction goals?"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleSaveProfile}
                      className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-sm"
                    >
                      Save Profile Changes
                    </button>
                  </div>
                </div>

                <div className="p-6 rounded-[28px] bg-white dark:bg-[#1E1E1E] border border-slate-100 dark:border-transparent shadow-sm space-y-4">
                  <h4 className="font-bold text-sm uppercase tracking-wider text-slate-500">Active Devices & Sessions</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#252525]">
                      <div className="flex items-center gap-3">
                        <Laptop2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <div>
                          <div className="text-xs font-bold">Chrome on Windows (Current Session)</div>
                          <div className="text-[10px] text-slate-400">Online • Active now</div>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">Active</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-[28px] bg-red-50/50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 space-y-4">
                  <h4 className="font-bold text-sm text-red-600 dark:text-red-400 uppercase tracking-wider">Account Actions</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm">Sign out of BidChat</div>
                      <div className="text-xs text-slate-500">You will need to re-enter your credentials to sign back in</div>
                    </div>
                    <button
                      onClick={onSignOut || (() => {
                        localStorage.removeItem("bidchat-user");
                        window.location.href = "/login";
                      })}
                      className="px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-sm"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Chats */}
            {activeCategory === "chats" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <SectionHeader title="Chat & Messaging" subtitle="Customize conversation layouts, key shortcuts and media handling" />

                <div className="p-6 rounded-[28px] bg-white dark:bg-[#1E1E1E] border border-slate-100 dark:border-transparent shadow-sm space-y-5">
                  <SettingRow
                    title="Auto-collapse sidebar on desktop"
                    subtitle="Closes the chat list pane automatically when you enter a conversation for maximum screen space"
                    checked={autoCollapseSidebar}
                    onChange={(val) => {
                      setAutoCollapseSidebar(val);
                      persistSettings({ autoCollapseSidebar: val });
                    }}
                  />

                  <div className="border-t border-slate-100 dark:border-[#2A2A2A] pt-4">
                    <SettingRow
                      title="Press Enter to send"
                      subtitle="When turned on, pressing Enter sends the message. Shift+Enter creates a new line."
                      checked={enterIsSend}
                      onChange={(val) => {
                        setEnterIsSend(val);
                        persistSettings({ enterIsSend: val });
                      }}
                    />
                  </div>

                  <div className="border-t border-slate-100 dark:border-[#2A2A2A] pt-4">
                    <SettingRow
                      title="Read Receipts (Blue Ticks)"
                      subtitle="Display checkmarks when recipients read your messages in group chats"
                      checked={readReceipts}
                      onChange={(val) => {
                        setReadReceipts(val);
                        persistSettings({ readReceipts: val });
                      }}
                    />
                  </div>

                  <div className="border-t border-slate-100 dark:border-[#2A2A2A] pt-4 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm">Direct Messaging Permissions</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Currently: <strong className="text-blue-600 dark:text-blue-400 capitalize">{whoCanMessage === "friends" ? "Friends Only" : whoCanMessage}</strong>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveCategory("privacy")}
                      className="px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-[#2A2A2A] hover:bg-slate-200 dark:hover:bg-[#333] font-bold text-xs text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      Change in Privacy
                    </button>
                  </div>

                  <div className="border-t border-slate-100 dark:border-[#2A2A2A] pt-4">
                    <SettingRow
                      title="Typing Indicators"
                      subtitle="Broadcast when you are currently drafting a reply"
                      checked={typingIndicators}
                      onChange={(val) => {
                        setTypingIndicators(val);
                        persistSettings({ typingIndicators: val });
                      }}
                    />
                  </div>
                </div>

                <div className="p-6 rounded-[28px] bg-white dark:bg-[#1E1E1E] border border-slate-100 dark:border-transparent shadow-sm space-y-3">
                  <h4 className="font-bold text-sm">Default Chat Filter on Launch</h4>
                  <p className="text-xs text-slate-500">Choose which tab opens by default in the chat sidebar</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {(["peers", "all", "dugouts", "auctions"] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => {
                          setDefaultFilter(filter);
                          persistSettings({ defaultFilter: filter });
                        }}
                        className={`py-2.5 px-3 rounded-2xl text-xs font-bold capitalize transition-colors ${
                          defaultFilter === filter
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-slate-100 dark:bg-[#2A2A2A] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#333]"
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-[28px] bg-white dark:bg-[#1E1E1E] border border-slate-100 dark:border-transparent shadow-sm space-y-3">
                  <h4 className="font-bold text-sm">Chat Bubble Font Size</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {(["compact", "normal", "large"] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => {
                          setFontSize(size);
                          persistSettings({ fontSize: size });
                        }}
                        className={`py-2.5 rounded-2xl text-xs font-bold capitalize transition-colors ${
                          fontSize === size
                            ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                            : "bg-slate-100 dark:bg-[#2A2A2A] text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 3. Auctions */}
            {activeCategory === "auctions" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <SectionHeader title="IPL Auction & Bidding Controls" subtitle="Set safety limits, franchise defaults and live podium audio cues" />

                <div className="p-6 rounded-[28px] bg-white dark:bg-[#1E1E1E] border border-slate-100 dark:border-transparent shadow-sm space-y-3">
                  <h4 className="font-bold text-sm">Preferred IPL Franchise</h4>
                  <p className="text-xs text-slate-500">Auto-suggests this franchise when claiming teams in new auction lobbies</p>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                    {FRANCHISES.map((franchise) => (
                      <button
                        key={franchise.code}
                        onClick={() => {
                          setFavFranchise(franchise.code);
                          persistSettings({ favFranchise: franchise.code });
                        }}
                        className={`p-3 rounded-2xl flex flex-col items-center gap-1.5 transition-all ${
                          favFranchise === franchise.code
                            ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/30"
                            : "bg-slate-50 dark:bg-[#252525] hover:bg-slate-100 dark:hover:bg-[#303030]"
                        }`}
                      >
                        <div
                          className="w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs shadow-sm"
                          style={{ backgroundColor: franchise.color }}
                        >
                          {franchise.code}
                        </div>
                        <span className="text-[11px] font-bold truncate max-w-full">{franchise.code}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-[28px] bg-white dark:bg-[#1E1E1E] border border-slate-100 dark:border-transparent shadow-sm space-y-4">
                  <SettingRow
                    title="Confirm High Bids (> 15 Cr)"
                    subtitle="Prevents accidental paddle taps during aggressive bidding wars"
                    checked={confirmHighBids}
                    onChange={(val) => {
                      setConfirmHighBids(val);
                      persistSettings({ confirmHighBids: val });
                    }}
                  />

                  <div className="border-t border-slate-100 dark:border-[#2A2A2A] pt-4">
                    <SettingRow
                      title="Auto-open Team Dugout on Auction Start"
                      subtitle="Automatically launches the encrypted team whisper channel when a live auction starts in a chat"
                      checked={autoOpenDugout}
                      onChange={(val) => {
                        setAutoOpenDugout(val);
                        persistSettings({ autoOpenDugout: val });
                      }}
                    />
                  </div>
                </div>

                <div className="p-6 rounded-[28px] bg-white dark:bg-[#1E1E1E] border border-slate-100 dark:border-transparent shadow-sm space-y-4">
                  <h4 className="font-bold text-sm uppercase tracking-wider text-slate-500">Auction Audio Feedback</h4>
                  <SettingRow
                    title="Auctioneer Gavel Knock"
                    subtitle="Play gavel sound effect when a player is marked SOLD or UNSOLD"
                    checked={soundGavel}
                    onChange={(val) => {
                      setSoundGavel(val);
                      persistSettings({ soundGavel: val });
                    }}
                  />
                  <div className="border-t border-slate-100 dark:border-[#2A2A2A] pt-4">
                    <SettingRow
                      title="Final 5-Second Countdown Timer"
                      subtitle="Buzzer beeps during the final 5 seconds before hammer drop"
                      checked={soundCountdown}
                      onChange={(val) => {
                        setSoundCountdown(val);
                        persistSettings({ soundCountdown: val });
                      }}
                    />
                  </div>
                  <div className="border-t border-slate-100 dark:border-[#2A2A2A] pt-4">
                    <SettingRow
                      title="Outbid Alert"
                      subtitle="High-priority tone when another franchise overtakes your bid"
                      checked={soundOutbid}
                      onChange={(val) => {
                        setSoundOutbid(val);
                        persistSettings({ soundOutbid: val });
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 4. Notifications */}
            {activeCategory === "notifications" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <SectionHeader title="Notifications & Alerts" subtitle="Tune how and when BidChat alerts you" />

                <div className="p-6 rounded-[28px] bg-white dark:bg-[#1E1E1E] border border-slate-100 dark:border-transparent shadow-sm space-y-4">
                  <SettingRow
                    title="Do Not Disturb"
                    subtitle="Silence all notification sounds and popups across chats and auctions"
                    checked={doNotDisturb}
                    onChange={(val) => {
                      setDoNotDisturb(val);
                      persistSettings({ doNotDisturb: val });
                    }}
                  />
                  <div className="border-t border-slate-100 dark:border-[#2A2A2A] pt-4">
                    <SettingRow
                      title="Desktop Push Notifications"
                      subtitle="Receive system alerts even when BidChat is in the background"
                      checked={enablePush}
                      onChange={(val) => {
                        setEnablePush(val);
                        persistSettings({ enablePush: val });
                      }}
                    />
                  </div>
                  <div className="border-t border-slate-100 dark:border-[#2A2A2A] pt-4">
                    <SettingRow
                      title="Team Dugout Whisper Pings"
                      subtitle="Play high-priority chime when your co-managers send strategy whispers"
                      checked={dugoutWhisperAlerts}
                      onChange={(val) => {
                        setDugoutWhisperAlerts(val);
                        persistSettings({ dugoutWhisperAlerts: val });
                      }}
                    />
                  </div>
                  <div className="border-t border-slate-100 dark:border-[#2A2A2A] pt-4">
                    <SettingRow
                      title="Auction Outbid Notifications"
                      subtitle="Instant notification when your franchise is outbid on a player"
                      checked={auctionOutbidAlerts}
                      onChange={(val) => {
                        setAuctionOutbidAlerts(val);
                        persistSettings({ auctionOutbidAlerts: val });
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 5. Privacy */}
            {activeCategory === "privacy" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <SectionHeader title="Privacy & Safety" subtitle="Control visibility, invitation permissions and 2FA protection" />

                <div className="p-6 rounded-[28px] bg-white dark:bg-[#1E1E1E] border border-slate-100 dark:border-transparent shadow-sm space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-bold text-sm">Who can see my online status</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {(["everyone", "friends", "nobody"] as const).map((opt) => (
                        <button
                          key={opt}
                          onClick={() => {
                            setLastSeenPrivacy(opt);
                            persistSettings({ lastSeenPrivacy: opt });
                          }}
                          className={`py-2 rounded-2xl text-xs font-bold capitalize transition-colors ${
                            lastSeenPrivacy === opt
                              ? "bg-blue-600 text-white shadow-sm"
                              : "bg-slate-100 dark:bg-[#2A2A2A] text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 dark:border-[#2A2A2A] pt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm">Who can send me messages</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Control who can initiate 1:1 direct conversations with you</p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        {whoCanMessage === "friends" ? "Friends Only" : whoCanMessage}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      {(["everyone", "friends", "nobody"] as const).map((opt) => (
                        <button
                          key={opt}
                          onClick={() => {
                            setWhoCanMessage(opt);
                            persistSettings({ whoCanMessage: opt });
                          }}
                          className={`py-3 px-3 rounded-2xl text-xs font-bold capitalize transition-all flex flex-col items-center justify-center gap-1 ${
                            whoCanMessage === opt
                              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-[1.02]"
                              : "bg-slate-100 dark:bg-[#2A2A2A] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#333]"
                          }`}
                        >
                          <span className="font-black">{opt === "friends" ? "Friends Only" : opt === "nobody" ? "Nobody" : "Everyone"}</span>
                          <span className={`text-[10px] font-medium leading-tight text-center ${whoCanMessage === opt ? "text-blue-100" : "text-slate-400"}`}>
                            {opt === "everyone" ? "Anyone can DM you" : opt === "friends" ? "Accepted friends only" : "Block all incoming DMs"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 dark:border-[#2A2A2A] pt-4 space-y-2">
                    <h4 className="font-bold text-sm">Who can invite me to auction lobbies</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {(["everyone", "friends"] as const).map((opt) => (
                        <button
                          key={opt}
                          onClick={() => {
                            setInvitePrivacy(opt);
                            persistSettings({ invitePrivacy: opt });
                          }}
                          className={`py-2 rounded-2xl text-xs font-bold capitalize transition-colors ${
                            invitePrivacy === opt
                              ? "bg-blue-600 text-white shadow-sm"
                              : "bg-slate-100 dark:bg-[#2A2A2A] text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                          }`}
                        >
                          {opt === "friends" ? "Friends Only" : "Everyone"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 dark:border-[#2A2A2A] pt-4">
                    <SettingRow
                      title="Two-Factor Authentication (2FA)"
                      subtitle="Require an authenticator code when logging in on new devices"
                      checked={twoFactorAuth}
                      onChange={(val) => {
                        setTwoFactorAuth(val);
                        persistSettings({ twoFactorAuth: val });
                      }}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/30 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-900 dark:text-blue-300 leading-relaxed">
                    <strong>Team Dugout Encryption:</strong> All whisper communications sent inside Team Dugouts are isolated to your franchise sub-room socket and never broadcast to public spectators.
                  </div>
                </div>
              </div>
            )}

            {/* 6. Appearance */}
            {activeCategory === "appearance" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <SectionHeader title="Appearance & Themes" subtitle="Customize themes with Google Material 3 Expressive tokens" />

                <div className="p-6 rounded-[28px] bg-white dark:bg-[#1E1E1E] border border-slate-100 dark:border-transparent shadow-sm space-y-4">
                  <h4 className="font-bold text-sm">Theme Mode</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {(["light", "dark", "system"] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setThemeMode(mode)}
                        className={`py-3.5 px-4 rounded-2xl font-bold text-xs capitalize transition-all flex items-center justify-center gap-2 ${
                          themeMode === mode
                            ? "bg-blue-600 text-white shadow-md scale-[1.02]"
                            : "bg-slate-100 dark:bg-[#2A2A2A] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#333]"
                        }`}
                      >
                        {mode === "light" && <Sun className="w-4 h-4" />}
                        {mode === "dark" && <Moon className="w-4 h-4" />}
                        {mode === "system" && <Laptop className="w-4 h-4" />}
                        <span>{mode}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 7. Storage */}
            {activeCategory === "storage" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <SectionHeader title="Data & Storage" subtitle="Manage cached media, auction assets and offline storage" />

                <div className="p-6 rounded-[28px] bg-white dark:bg-[#1E1E1E] border border-slate-100 dark:border-transparent shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm">Cached Media & Player Logos</div>
                      <div className="text-xs text-slate-500">Currently taking up <span className="font-bold text-slate-800 dark:text-slate-200">{cacheSize}</span></div>
                    </div>
                    <button
                      onClick={clearCache}
                      className="px-4 py-2 rounded-full bg-slate-100 dark:bg-[#2A2A2A] hover:bg-slate-200 dark:hover:bg-[#333] font-bold text-xs transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear Cache</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">{title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
    </div>
  );
}

function SettingRow({
  title,
  subtitle,
  checked,
  onChange,
}: {
  title: string;
  subtitle: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-0.5">
        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{title}</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{subtitle}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none ${
          checked ? "bg-blue-600" : "bg-slate-300 dark:bg-[#333]"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
