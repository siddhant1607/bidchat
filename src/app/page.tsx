"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Menu,
  ArrowLeft,
  X,
  LogOut,
  Download,
  Camera, Info, Trash2,
  MessageSquare, 
  Gavel, 
  Users, 
  Settings, 
  Plus, 
  PanelLeftClose, 
  PanelLeftOpen,
  Search,
  Hash,
  Lock,
  MessageCircle,
  MoreVertical,
  ArrowRight,
  Sun,
  Moon,
  Laptop,
  Radio,
  ShieldAlert,
  Layers,
  Sparkles,
  User,
  BarChart3,
  ShieldCheck,
  Sliders
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useSocket } from "@/context/SocketContext";
import SettingsPanel from "@/components/settings/SettingsPanel";
import FriendsList from "@/components/friends/FriendsList";
import RosterStudio from "@/components/studio/RosterStudio";
import { NewGroupModal } from "@/components/chat/NewGroupModal";
import GroupDetailsDrawer from "@/components/chat/GroupDetailsDrawer";
import { NewDirectMessageModal } from "@/components/chat/NewDirectMessageModal";
import { StartAuctionModal } from "@/components/chat/StartAuctionModal";
import ChatFeed from "@/components/chat/ChatFeed";
import ChatInput from "@/components/chat/ChatInput";
import TeamClaimModal from "@/components/auction/TeamClaimModal";
import AuctionAnalyticsDashboard, { TeamStats } from "@/components/auction/AuctionAnalyticsDashboard";
import AuctionConsoleModal from "@/components/auction/AuctionConsoleModal";
import PostAuctionAnalyticsModal from "@/components/auction/PostAuctionAnalyticsModal";
import AuctionWidget from "@/components/auction/AuctionWidget";
import AuctionSettingsModal from "@/components/auction/AuctionSettingsModal";
import NominationModal from "@/components/auction/NominationModal";
import { AuctionSettings, LiveAuctionState, Team, BidRecord } from "@/types/auction";
import { DEFAULT_IPL_BID_SLABS } from "@/lib/auctionRules";
import { AuctionPreset, CustomRoster } from "@/types/auction";
import { saveCustomRoster, saveCustomPreset, fetchSharedFromServer } from "@/lib/presetData";
import ProfileCard from "@/components/profile/ProfileCard";
import { INITIAL_PROFILES, UserProfileData } from "@/data/mockUsers";

interface ChatItem {
  id: string;
  type: "peers" | "dugouts" | "auctions";
  name: string;
  unread: number;
  lastMessage: string;
  isAuctionActive?: boolean;
  iconUrl?: string;
}

interface MessageItem {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isWhisper?: boolean;
  whisperTeamId?: string;
  shareCard?: {
    type: "preset" | "roster";
    name: string;
    details: string;
    code?: string;
  };
}

const INITIAL_CHATS: ChatItem[] = [
  { id: "c_1", type: "peers", name: "Weekend Bidding Boys", unread: 3, lastMessage: "Let's start the auction at 9 PM", isAuctionActive: true, iconUrl: "🔨" },
  { id: "c_2", type: "peers", name: "Rajat", unread: 0, lastMessage: "Bro check out that Starc bid", iconUrl: "🏏" },
  { id: "c_3", type: "dugouts", name: "CSK Team Dugout", unread: 1, lastMessage: "Don't go past 18 Cr for Pant", isAuctionActive: true, iconUrl: "🦁" },
  { id: "c_4", type: "auctions", name: "Public Retentions Lobby", unread: 0, lastMessage: "Auction ended.", iconUrl: "🏆" },
];

const INITIAL_MESSAGES: Record<string, MessageItem[]> = {
  c_1: [
    { id: "m_1", chatId: "c_1", senderId: "rajat", senderName: "Rajat", text: "Are we starting the auction tonight?", timestamp: "19:30" },
    { id: "m_2", chatId: "c_1", senderId: "me", senderName: "You", text: "Yeah! I'll create the lobby and share the link in a bit.", timestamp: "19:32" },
  ],
  c_2: [
    { id: "m_3", chatId: "c_2", senderId: "rajat", senderName: "Rajat", text: "Bro check out that Starc bid from last year, madness!", timestamp: "12:34" },
  ],
  c_3: [
    { id: "m_4", chatId: "c_3", senderId: "csk_lead", senderName: "Captain", text: "Don't go past 18 Cr for Pant. Save purse for pacers.", timestamp: "18:45", isWhisper: true, whisperTeamId: "CSK" },
  ],
  c_4: [
    { id: "m_5", chatId: "c_4", senderId: "system", senderName: "Auctioneer", text: "Public Retentions Lobby has concluded. All 10 franchises finalized.", timestamp: "14:00" },
  ]
};

const INITIAL_TEAMS: TeamStats[] = [
  { id: "t_csk", name: "Chennai Super Kings", shortName: "CSK", primaryColor: "#FDB913", ownerId: "me", ownerName: "You", memberCount: 2, maxMembers: 3, ownerApprovalRequired: false, purseRemaining: 95.25, totalSpent: 24.75, squadCount: 18, overseasCount: 6 },
  { id: "t_mi", name: "Mumbai Indians", shortName: "MI", primaryColor: "#004BA0", ownerId: "user_mi", ownerName: "RohitFan", memberCount: 1, maxMembers: 3, ownerApprovalRequired: true, purseRemaining: 88.50, totalSpent: 31.50, squadCount: 19, overseasCount: 7 },
  { id: "t_rcb", name: "Royal Challengers Bengaluru", shortName: "RCB", primaryColor: "#DA1818", ownerId: null, ownerName: null, memberCount: 0, maxMembers: 3, ownerApprovalRequired: false, purseRemaining: 102.00, totalSpent: 18.00, squadCount: 17, overseasCount: 5 },
  { id: "t_kkr", name: "Kolkata Knight Riders", shortName: "KKR", primaryColor: "#3A225D", ownerId: null, ownerName: null, memberCount: 0, maxMembers: 3, ownerApprovalRequired: false, purseRemaining: 91.75, totalSpent: 28.25, squadCount: 18, overseasCount: 6 },
  { id: "t_srh", name: "Sunrisers Hyderabad", shortName: "SRH", primaryColor: "#F26522", ownerId: null, ownerName: null, memberCount: 0, maxMembers: 3, ownerApprovalRequired: false, purseRemaining: 98.00, totalSpent: 22.00, squadCount: 17, overseasCount: 6 },
  { id: "t_dc", name: "Delhi Capitals", shortName: "DC", primaryColor: "#0078BC", ownerId: null, ownerName: null, memberCount: 0, maxMembers: 3, ownerApprovalRequired: false, purseRemaining: 104.50, totalSpent: 15.50, squadCount: 16, overseasCount: 5 },
  { id: "t_rr", name: "Rajasthan Royals", shortName: "RR", primaryColor: "#EA1A85", ownerId: null, ownerName: null, memberCount: 0, maxMembers: 3, ownerApprovalRequired: false, purseRemaining: 89.00, totalSpent: 31.00, squadCount: 18, overseasCount: 6 },
  { id: "t_gt", name: "Gujarat Titans", shortName: "GT", primaryColor: "#1B2133", ownerId: null, ownerName: null, memberCount: 0, maxMembers: 3, ownerApprovalRequired: false, purseRemaining: 101.25, totalSpent: 18.75, squadCount: 17, overseasCount: 5 },
  { id: "t_lsg", name: "Lucknow Super Giants", shortName: "LSG", primaryColor: "#A7D5F2", ownerId: null, ownerName: null, memberCount: 0, maxMembers: 3, ownerApprovalRequired: false, purseRemaining: 96.50, totalSpent: 23.50, squadCount: 18, overseasCount: 6 },
  { id: "t_pbks", name: "Punjab Kings", shortName: "PBKS", primaryColor: "#DD1F2D", ownerId: null, ownerName: null, memberCount: 0, maxMembers: 3, ownerApprovalRequired: false, purseRemaining: 110.00, totalSpent: 10.00, squadCount: 15, overseasCount: 4 },
];

export default function UnifiedAppShell() {
  const router = useRouter();
  const { themeMode, setThemeMode } = useTheme();
  const { socket, isConnected } = useSocket();
  
  // App State
  const [user, setUser] = useState<{ username: string; email: string; name: string; avatarBg?: string; avatarUrl?: string } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [activeNav, setActiveNav] = useState<"messages" | "auctions" | "presets" | "friends" | "settings">("messages");
  const [chatFilter, setChatFilter] = useState<"all" | "peers" | "dugouts" | "auctions" | "people">("peers");
  const [profiles, setProfiles] = useState<UserProfileData[]>(INITIAL_PROFILES);
  const [selectedProfileForModal, setSelectedProfileForModal] = useState<UserProfileData | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  // Chat & Messaging State
  const [chats, setChats] = useState<ChatItem[]>(INITIAL_CHATS);
  const [activeChatId, setActiveChatId] = useState<string>("c_1");
  const [messages, setMessages] = useState<Record<string, MessageItem[]>>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [isWhisperActive, setIsWhisperActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Live Auction State
  const [podiumPlayer, setPodiumPlayer] = useState("Jasprit Bumrah");
  const [currentBid, setCurrentBid] = useState(16.75);
  const [leadingTeam, setLeadingTeam] = useState("CSK");
  const [teams, setTeams] = useState<TeamStats[]>(INITIAL_TEAMS);
  const [bidToast, setBidToast] = useState<string | null>(null);

  // Modals State
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);
  const [isNewDMOpen, setIsNewDMOpen] = useState(false);
  const [isStartAuctionOpen, setIsStartAuctionOpen] = useState(false);
  const [isTeamClaimOpen, setIsTeamClaimOpen] = useState(false);
  // Group Icon Edit State
  const [editingGroupIconChat, setEditingGroupIconChat] = useState<ChatItem | null>(null);
  const [isEditGroupIconOpen, setIsEditGroupIconOpen] = useState(false);
  const [isChatMenuOpen, setIsChatMenuOpen] = useState(false);
  const [isGroupDetailsOpen, setIsGroupDetailsOpen] = useState(false);
  const [isAuctionConsoleOpen, setIsAuctionConsoleOpen] = useState(false);
  const [isPostAuctionAnalyticsOpen, setIsPostAuctionAnalyticsOpen] = useState(false);
  const [isDesktopAuctionOpen, setIsDesktopAuctionOpen] = useState(true);
  const [podiumBidHistory, setPodiumBidHistory] = useState<BidRecord[]>([
    {
      id: "b-3",
      playerId: "p_podium",
      teamShortName: "CSK",
      teamName: "Chennai Super Kings",
      amount: 14.5,
      bidderName: "MS Dhoni",
      timestamp: "Just now",
    },
    {
      id: "b-2",
      playerId: "p_podium",
      teamShortName: "MI",
      teamName: "Mumbai Indians",
      amount: 14.25,
      bidderName: "Rohit Sharma",
      timestamp: "12s ago",
    },
    {
      id: "b-1",
      playerId: "p_podium",
      teamShortName: "RCB",
      teamName: "Royal Challengers Bengaluru",
      amount: 14.0,
      bidderName: "Virat Kohli",
      timestamp: "30s ago",
    },
  ]);
  const [currentPointSystem, setCurrentPointSystem] = useState<"espn" | "custom" | "none">("espn");
  const [selectedAnalyticsData, setSelectedAnalyticsData] = useState<{ tournamentName: string; pointSystem: "espn" | "custom" | "none" }>({
    tournamentName: "IPL 2026 Mega Auction",
    pointSystem: "espn"
  });
  const [isAnalyticsDashboardOpen, setIsAnalyticsDashboardOpen] = useState(false);
  const [analyticsDashboardTab, setAnalyticsDashboardTab] = useState<"analytics" | "mvp" | "admin">("analytics");
  const [isAuctionSettingsOpen, setIsAuctionSettingsOpen] = useState(false);
  const [auctionSettings, setAuctionSettings] = useState<AuctionSettings>({
    allowCustomBids: false,
    allowJumpBids: false,
    bidSlabs: DEFAULT_IPL_BID_SLABS,
  });
  const [groupIconInput, setGroupIconInput] = useState("🏆");
  const [groupPhotoUrl, setGroupPhotoUrl] = useState<string | null>(null);
  const groupIconFileRef = useRef<HTMLInputElement>(null);

  const [selectedPresetForModal, setSelectedPresetForModal] = useState<AuctionPreset | null>(null);

  // Accelerated & Unsold Round Management
  const [unsoldList, setUnsoldList] = useState<{ name: string; role?: string; basePrice: number; team?: string }[]>([
    { name: "Kane Williamson", role: "Batter", basePrice: 2.0, team: "NZ" },
    { name: "Steve Smith", role: "Batter", basePrice: 2.0, team: "AUS" },
    { name: "David Warner", role: "Batter", basePrice: 2.0, team: "AUS" },
    { name: "Prithvi Shaw", role: "Batter", basePrice: 0.75, team: "IND" },
    { name: "Shardul Thakur", role: "All-Rounder", basePrice: 2.0, team: "IND" },
    { name: "Mustafizur Rahman", role: "Bowler", basePrice: 2.0, team: "BAN" },
    { name: "Deepak Hooda", role: "All-Rounder", basePrice: 0.75, team: "IND" },
  ]);
  const [acceleratedRound, setAcceleratedRound] = useState(1);
  const [totalAcceleratedRounds, setTotalAcceleratedRounds] = useState(2);
  const [callForNominationsOpen, setCallForNominationsOpen] = useState(false);
  const [allowUnsoldDiscount, setAllowUnsoldDiscount] = useState(false);
  const [unsoldDiscountPercentage, setUnsoldDiscountPercentage] = useState(50);
  const [nominatedPlayers, setNominatedPlayers] = useState<{ name: string; basePrice: number; nominatedBy: string[] }[]>([]);
  const [isNominationModalOpen, setIsNominationModalOpen] = useState(false);

  // Settings
  const [autoCollapseOnChat, setAutoCollapseOnChat] = useState(false);
  const [enterIsSend, setEnterIsSend] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("bidchat-user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {}
    } else {
      router.push("/login");
    }

    const loadSettings = () => {
      try {
        const s = JSON.parse(localStorage.getItem("bidchat-settings") || "{}");
        if (s.autoCollapseSidebar !== undefined) setAutoCollapseOnChat(s.autoCollapseSidebar);
        if (s.defaultFilter) setChatFilter(s.defaultFilter);
        if (s.enterIsSend !== undefined) setEnterIsSend(s.enterIsSend);
      } catch (e) {}
    };

    loadSettings();
    window.addEventListener("storage", loadSettings);
    return () => window.removeEventListener("storage", loadSettings);
  }, [router]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileDrawerOpen(false);
        setIsSidebarOpen(!autoCollapseOnChat);
      } else {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [autoCollapseOnChat]);

  useEffect(() => {
    if (!socket) return;

    socket.emit("join_chat", activeChatId);

    const handleReceive = (msg: MessageItem) => {
      if (msg.chatId) {
        setMessages(prev => ({
          ...prev,
          [msg.chatId]: [...(prev[msg.chatId] || []), msg]
        }));
      }
    };

    socket.on("receive_message", handleReceive);
    return () => {
      socket.off("receive_message", handleReceive);
    };
  }, [socket, activeChatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeChatId]);

  const filteredChats = chats
    .filter(c => (chatFilter === "all" || chatFilter === "people") ? true : c.type === chatFilter)
    .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const filteredProfiles = profiles.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.favTeam.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentChat = chats.find(c => c.id === activeChatId);
  const currentChatMessages = messages[activeChatId] || [];

  const handleOpenProfileByName = (name: string, usernameOrId?: string) => {
    const cleanUser = (usernameOrId || name).toLowerCase().replace('@', '');
    const cleanName = name.toLowerCase();
    const found = profiles.find(p => 
      p.username.toLowerCase().replace('@', '') === cleanUser || 
      p.name.toLowerCase() === cleanName ||
      p.id.toLowerCase() === cleanUser
    );

    if (found) {
      setSelectedProfileForModal(found);
      setIsProfileModalOpen(true);
    } else {
      const syntheticProfile: UserProfileData = {
        id: `u_${cleanUser || Date.now()}`,
        name: name,
        username: `@${cleanUser || name.toLowerCase().replace(/\s+/g, '')}`,
        avatarBg: "#2563EB",
        bio: `Cricket fan & auction enthusiast in ${currentChat?.name || "BidChat"}`,
        online: true,
        favTeam: "CSK",
        auctionsCount: 14,
        teamsCount: 8,
        trophiesCount: 2,
        friendStatus: "none",
        whoCanMessage: "everyone"
      };
      setSelectedProfileForModal(syntheticProfile);
      setIsProfileModalOpen(true);
    }
  };

  const cycleTheme = () => {
    if (themeMode === 'light') setThemeMode('dark');
    else if (themeMode === 'dark') setThemeMode('system');
    else setThemeMode('light');
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMsg: MessageItem = {
      id: `msg_${Date.now()}`,
      chatId: activeChatId,
      senderId: user?.username || "me",
      senderName: user?.name || user?.username || "You",
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isWhisper: isWhisperActive,
      whisperTeamId: isWhisperActive ? "CSK" : undefined,
    };

    setMessages(prev => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), newMsg]
    }));

    setChats(prev => prev.map(c => 
      c.id === activeChatId ? { ...c, lastMessage: newMsg.text } : c
    ));

    if (socket && isConnected) {
      socket.emit("send_message", newMsg);
    }

    setInputText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (enterIsSend && e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handlePlaceBid = () => {
    const nextAmount = parseFloat((currentBid + 0.25).toFixed(2));
    setCurrentBid(nextAmount);
    setLeadingTeam("CSK");

    setBidToast(`Paddle raised: ₹${nextAmount} Cr for CSK!`);
    setTimeout(() => setBidToast(null), 2500);

    const bidMsg: MessageItem = {
      id: `bid_${Date.now()}`,
      chatId: activeChatId,
      senderId: "system",
      senderName: "Podium Bot",
      text: `🔨 Bid increased to ₹${nextAmount} Cr by CSK!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), bidMsg]
    }));

    if (socket && isConnected) {
      socket.emit("place_bid", {
        auctionId: "live_1",
        amount: nextAmount,
        teamShortName: "CSK"
      });
    }
  };

  const handleClaimTeam = (teamId: string) => {
    setTeams(prev => prev.map(t => {
      if (t.id === teamId) {
        return {
          ...t,
          ownerId: user?.username || "me",
          ownerName: user?.name || user?.username || "You",
          memberCount: t.memberCount + 1
        };
      }
      return t;
    }));
    setIsTeamClaimOpen(false);
    setBidToast("Franchise claimed! You are now the Team Owner.");
    setTimeout(() => setBidToast(null), 3000);
  };

  const handleStartAuction = (config: {
    name: string;
    preset: AuctionPreset;
    roster: CustomRoster;
    totalPurse: number;
    maxSquadSize: number;
    maxOverseas: number;
    requireApproval: boolean;
    timerSeconds: number;
    acceleratedRounds?: number;
    allowUnsoldDiscount?: boolean;
    unsoldDiscountPercentage?: number;
    pointSystem?: "espn" | "custom" | "none";
  }) => {
    const firstPlayer = config.roster.players[0]?.name || "Virat Kohli";
    const initialPrice = config.roster.players[0]?.basePrice || 2.0;

    setPodiumPlayer(firstPlayer);
    setCurrentBid(initialPrice);
    setLeadingTeam("None");

    // Configure Point System
    const chosenPointSystem = config.pointSystem || config.preset.pointSystem || "espn";
    setCurrentPointSystem(chosenPointSystem);

    // Configure Accelerated Rounds & Unsold Discounts from Preset
    setTotalAcceleratedRounds(config.acceleratedRounds ?? config.preset.acceleratedRounds ?? 2);
    setAllowUnsoldDiscount(config.allowUnsoldDiscount ?? !!config.preset.allowUnsoldDiscount);
    setUnsoldDiscountPercentage(config.unsoldDiscountPercentage ?? config.preset.unsoldDiscountPercentage ?? 50);
    setAcceleratedRound(1);
    setCallForNominationsOpen(false);
    setNominatedPlayers([]);

    setChats(prev => prev.map(c => 
      c.id === activeChatId ? { ...c, isAuctionActive: true, lastMessage: `⚡ Auction "${config.name}" is LIVE!` } : c
    ));

    const pointSystemLabel = chosenPointSystem === "espn" 
      ? "⭐ ESPN Cricinfo MVP" 
      : chosenPointSystem === "custom" 
      ? "⚡ Custom Points" 
      : "🚫 Pure Auction (No Points)";

    const announceMsg: MessageItem = {
      id: `announce_${Date.now()}`,
      chatId: activeChatId,
      senderId: "system",
      senderName: "Auctioneer",
      text: `⚡ Live Auction "${config.name}" has started!\n• Preset: ${config.preset.name} (₹${config.totalPurse} Cr Purse, ${config.timerSeconds}s timer)\n• Point System: ${pointSystemLabel}\n• Roster: ${config.roster.name} (${config.roster.players.length} players)\n• First on podium: ${firstPlayer} (Base: ₹${initialPrice} Cr)`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), announceMsg]
    }));

    if (socket && isConnected) {
      socket.emit("send_message", announceMsg);
    }

    setActiveNav("messages");
    setBidToast(`Auction "${config.name}" started!`);
    setTimeout(() => setBidToast(null), 3000);
  };

  const handleShareToChat = (type: "preset" | "roster", item: AuctionPreset | CustomRoster, targetChatId: string, shareCode?: string) => {
    const code = shareCode || (type === "roster" ? "BCR-SAVED" : "BCP-SAVED");
    const shareMsg: MessageItem = {
      id: `share_${Date.now()}`,
      chatId: targetChatId,
      senderId: user?.username || "me",
      senderName: user?.name || user?.username || "You",
      text: `⚡ Shared ${type === "preset" ? "Custom Auction Preset" : "Custom Tournament Roster"}: "${item.name}"\n${item.description}\n🔑 Server Share Code: ${code}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      shareCard: {
        type,
        name: item.name,
        code: code,
        details: type === "preset" ? `₹${(item as AuctionPreset).totalPurse} Cr • ${(item as AuctionPreset).timerDuration}s Timer` : `${(item as CustomRoster).players?.length || 0} Players • ${(item as CustomRoster).teams?.length || 0} Teams`,
      }
    };

    setMessages(prev => ({
      ...prev,
      [targetChatId]: [...(prev[targetChatId] || []), shareMsg]
    }));

    if (socket && isConnected) {
      socket.emit("send_message", shareMsg);
    }
  };


  const handleImportFromChat = async (card: { type: "preset" | "roster"; name: string; code?: string }) => {
    if (card.code) {
      try {
        const res = await fetchSharedFromServer(card.code);
        if (res.success && res.item) {
          if (card.type === "roster" || res.item.players) {
            const imported: CustomRoster = {
              ...res.item,
              id: `roster_chat_${Date.now()}`,
              name: res.item.name.includes("(Imported)") ? res.item.name : `${res.item.name} (Imported)`,
              isDefault: false,
              createdBy: "Shared via Chat",
              createdAt: new Date().toISOString().split("T")[0],
            };
            saveCustomRoster(imported);
          } else {
            const importedPreset: AuctionPreset = {
              ...res.item,
              id: `preset_chat_${Date.now()}`,
              name: res.item.name.includes("(Imported)") ? res.item.name : `${res.item.name} (Imported)`,
              isDefault: false,
              createdBy: "Shared via Chat",
            };
            saveCustomPreset(importedPreset);
          }
          setBidToast(`Imported "${card.name}" into your Studio!`);
          setTimeout(() => setBidToast(null), 3000);
          setActiveNav("presets");
          return;
        }
      } catch (e) {
        console.error("Failed to import from server:", e);
      }
    }
    setActiveNav("presets");
    setBidToast(`Opened Studio for "${card.name}"!`);
    setTimeout(() => setBidToast(null), 3000);
  };


  const handleCreateGroup = (groupData: { name: string; description: string; iconUrl?: string; memberIds: string[] }) => {
    const newChat: ChatItem = {
      id: `g_${Date.now()}`,
      type: "peers",
      name: groupData.name,
      unread: 0,
      lastMessage: groupData.description || "Group created. Start chatting!",
      iconUrl: groupData.iconUrl || "🏆",
    };

    const welcomeMsg: MessageItem = {
      id: `m_${Date.now()}`,
      chatId: newChat.id,
      senderId: "system",
      senderName: "BidChat Bot",
      text: `🎉 Welcome to ${newChat.name}!\n${groupData.description ? `"${groupData.description}"\n` : ""}Invite friends and launch your mock auction whenever you're ready.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChats(prev => {
      const updated = [newChat, ...prev];
      try {
        localStorage.setItem("bidchat-custom-chats", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    setMessages(prev => ({
      ...prev,
      [newChat.id]: [welcomeMsg]
    }));

    setActiveChatId(newChat.id);
    setIsMobileChatOpen(true);
    setBidToast(`Created group "${newChat.name}"!`);
    setTimeout(() => setBidToast(null), 3000);
  };

  const handleStartDirectMessage = (targetProfile: UserProfileData) => {
    const existingChat = chats.find(c => 
      c.id === `dm_${targetProfile.username.replace('@', '')}` ||
      (c.type === 'peers' && c.name.toLowerCase() === targetProfile.name.toLowerCase())
    );

    if (existingChat) {
      setActiveChatId(existingChat.id);
      setIsMobileChatOpen(true);
      setSearchQuery("");
      setBidToast(`Opened conversation with ${targetProfile.name}`);
      setTimeout(() => setBidToast(null), 2500);
      return;
    }

    if (targetProfile.whoCanMessage === "nobody") {
      setBidToast(`${targetProfile.name} has disabled incoming direct messages.`);
      setTimeout(() => setBidToast(null), 3000);
      return;
    }
    if (targetProfile.whoCanMessage === "friends" && targetProfile.friendStatus !== "friend") {
      setBidToast(`Only accepted friends can message ${targetProfile.name}.`);
      setTimeout(() => setBidToast(null), 3000);
      return;
    }

    const newChatId = `dm_${targetProfile.username.replace('@', '')}`;
    const newDmChat: ChatItem = {
      id: newChatId,
      name: targetProfile.name,
      type: "peers",
      unread: 0,
      lastMessage: `Started direct conversation with ${targetProfile.username}`,
      iconUrl: targetProfile.avatarUrl || targetProfile.name[0],
    };

    const welcomeMsg: MessageItem = {
      id: `m_${Date.now()}`,
      chatId: newChatId,
      senderId: "system",
      senderName: "BidChat",
      text: `Direct chat started with ${targetProfile.name} (${targetProfile.username}). End-to-end encrypted messaging is active.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChats(prev => {
      const updated = [newDmChat, ...prev];
      try {
        localStorage.setItem("bidchat-custom-chats", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    setMessages(prev => ({
      ...prev,
      [newChatId]: [welcomeMsg]
    }));

    setActiveChatId(newChatId);
    setIsMobileChatOpen(true);
    setSearchQuery("");
    setBidToast(`Started direct message with ${targetProfile.name}!`);
    setTimeout(() => setBidToast(null), 3000);
  };

  const handleAdminSellPlayer = (teamShortName: string, priceCr: number) => {
    setTeams(prev => prev.map(t => {
      if (t.shortName === teamShortName) {
        const prevPurse = t.purseRemaining !== undefined ? t.purseRemaining : 120;
        const prevSpent = t.totalSpent !== undefined ? t.totalSpent : 0;
        return {
          ...t,
          purseRemaining: Math.max(0, parseFloat((prevPurse - priceCr).toFixed(2))),
          totalSpent: parseFloat((prevSpent + priceCr).toFixed(2)),
          squadCount: (t.squadCount || 18) + 1,
        };
      }
      return t;
    }));

    const soldMessage: MessageItem = {
      id: `m_sold_${Date.now()}`,
      chatId: activeChatId,
      senderId: "system",
      senderName: "Auctioneer",
      text: `🔨 SOLD! ${podiumPlayer} has been acquired by ${teamShortName} for ₹${priceCr.toFixed(2)} Cr!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), soldMessage]
    }));

    const NEXT_PLAYERS = ["Rohit Sharma", "Rishabh Pant", "Heinrich Klaasen", "Mitchell Starc", "Nicholas Pooran", "Shreyas Iyer", "Shubman Gill", "Virat Kohli"];
    const currentIdx = NEXT_PLAYERS.indexOf(podiumPlayer);
    const nextPlayer = NEXT_PLAYERS[(currentIdx + 1) % NEXT_PLAYERS.length];

    setPodiumPlayer(nextPlayer);
    setCurrentBid(2.0);
    setLeadingTeam("None");
    setBidToast(`🔨 ${podiumPlayer} SOLD to ${teamShortName}! Next up: ${nextPlayer}`);
    setTimeout(() => setBidToast(null), 3500);
  };

  const handleAdminMarkUnsold = () => {
    const currentUnsold = {
      name: podiumPlayer,
      role: "Player",
      basePrice: currentBid > 0 ? currentBid : 2.0,
    };
    setUnsoldList(prev => {
      if (prev.some(p => p.name === podiumPlayer)) return prev;
      return [...prev, currentUnsold];
    });

    const unsoldMsg: MessageItem = {
      id: `m_unsold_${Date.now()}`,
      chatId: activeChatId,
      senderId: "system",
      senderName: "Auctioneer",
      text: `🔨 UNSOLD: ${podiumPlayer} passes unsold at ₹${currentBid.toFixed(2)} Cr and moves into the Unsold Pool for Accelerated Rounds.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), unsoldMsg]
    }));

    const NEXT_PLAYERS = ["Rohit Sharma", "Rishabh Pant", "Heinrich Klaasen", "Mitchell Starc", "Nicholas Pooran", "Shreyas Iyer", "Shubman Gill", "Virat Kohli"];
    const currentIdx = NEXT_PLAYERS.indexOf(podiumPlayer);
    const nextPlayer = NEXT_PLAYERS[(currentIdx + 1) % NEXT_PLAYERS.length];

    setPodiumPlayer(nextPlayer);
    setCurrentBid(2.0);
    setLeadingTeam("None");
    setBidToast(`${podiumPlayer} marked UNSOLD (added to pool). Calling ${nextPlayer}...`);
    setTimeout(() => setBidToast(null), 3500);
  };

  const handleAdminNextPlayer = (playerName: string, basePriceCr: number) => {
    setPodiumPlayer(playerName);
    setCurrentBid(basePriceCr);
    setLeadingTeam("None");
    const callMsg: MessageItem = {
      id: `m_call_${Date.now()}`,
      chatId: activeChatId,
      senderId: "system",
      senderName: "Auctioneer",
      text: `🏏 Live on Podium: ${playerName} (Base Price: ₹${basePriceCr.toFixed(2)} Cr). Paddle bids open!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), callMsg]
    }));

    setBidToast(`Called ${playerName} to podium!`);
    setTimeout(() => setBidToast(null), 3000);
  };

  const handleAdminUpdateBid = (newAmountCr: number, newLeadingTeam: string) => {
    setCurrentBid(newAmountCr);
    setLeadingTeam(newLeadingTeam);
    const updateMsg: MessageItem = {
      id: `m_bidupdate_${Date.now()}`,
      chatId: activeChatId,
      senderId: "system",
      senderName: "Auction Admin",
      text: `⚡ Bid corrected by Admin: ₹${newAmountCr.toFixed(2)} Cr by ${newLeadingTeam}.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), updateMsg]
    }));

    setBidToast(`Bid corrected: ₹${newAmountCr.toFixed(2)} Cr (${newLeadingTeam})`);
    setTimeout(() => setBidToast(null), 3000);
  };

  const handleAdminUpdatePlayerPoints = (playerName: string, addedPoints: number) => {
    const pointsMsg: MessageItem = {
      id: `m_pts_${Date.now()}`,
      chatId: activeChatId,
      senderId: "system",
      senderName: "Official Scoring",
      text: `⭐ Impact Points Awarded: ${playerName} +${addedPoints} pts! View in Auction Analytics Dashboard.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), pointsMsg]
    }));

    setBidToast(`Updated points for ${playerName}: +${addedPoints} pts`);
    setTimeout(() => setBidToast(null), 3000);
  };

  const handleToggleCallForNominations = (open: boolean) => {
    setCallForNominationsOpen(open);
    const textMsg = open
      ? `📢 Call for Nominations OPEN for Accelerated Round ${acceleratedRound} of ${totalAcceleratedRounds}! Franchises, submit your picks from the unsold pool.`
      : `🔒 Call for Nominations is now CLOSED for Accelerated Round ${acceleratedRound}. Auctioneer will now call nominated players to the podium.`;

    const nomMsg: MessageItem = {
      id: `m_call_nom_${Date.now()}`,
      chatId: activeChatId,
      senderId: "system",
      senderName: "Auctioneer",
      text: textMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), nomMsg]
    }));

    setBidToast(open ? "Nominations OPEN for franchises!" : "Nominations closed!");
    setTimeout(() => setBidToast(null), 3000);
  };

  const handleAdvanceAcceleratedRound = () => {
    if (acceleratedRound < totalAcceleratedRounds) {
      const nextRound = acceleratedRound + 1;
      setAcceleratedRound(nextRound);
      setCallForNominationsOpen(false);
      setNominatedPlayers([]);

      const advMsg: MessageItem = {
        id: `m_adv_round_${Date.now()}`,
        chatId: activeChatId,
        senderId: "system",
        senderName: "Auctioneer",
        text: `⚡ Entering Accelerated Round ${nextRound} of ${totalAcceleratedRounds}! Fresh player nomination calls will begin soon.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => ({
        ...prev,
        [activeChatId]: [...(prev[activeChatId] || []), advMsg]
      }));

      setBidToast(`Advanced to Accelerated Round ${nextRound}!`);
      setTimeout(() => setBidToast(null), 3000);
    } else {
      setBidToast(`Already at final Accelerated Round (${totalAcceleratedRounds})!`);
      setTimeout(() => setBidToast(null), 2500);
    }
  };

  const handleCallNominatedPlayer = (playerName: string, basePriceCr: number) => {
    const effectiveBase = allowUnsoldDiscount
      ? Math.round(basePriceCr * (1 - (unsoldDiscountPercentage || 50) / 100) * 100) / 100
      : basePriceCr;

    setPodiumPlayer(playerName);
    setCurrentBid(effectiveBase);
    setLeadingTeam("None");
    setNominatedPlayers(prev => prev.filter(p => p.name !== playerName));

    const callMsg: MessageItem = {
      id: `m_call_nom_podium_${Date.now()}`,
      chatId: activeChatId,
      senderId: "system",
      senderName: "Auctioneer",
      text: `⚡ [ACCELERATED ROUND ${acceleratedRound}] Nominated Player on Podium: ${playerName}!\n${
        allowUnsoldDiscount
          ? `🏷️ Unsold Discount Active: Starting at ₹${effectiveBase.toFixed(2)} Cr (${unsoldDiscountPercentage}% off regular ₹${basePriceCr.toFixed(2)} Cr).`
          : `Starting Base Price: ₹${effectiveBase.toFixed(2)} Cr.`
      } Bidding is OPEN!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), callMsg]
    }));

    setBidToast(`Called ${playerName} to podium!`);
    setTimeout(() => setBidToast(null), 3000);
  };

  const handleTeamNominatePlayer = (playerName: string, basePrice: number, teamName: string) => {
    setNominatedPlayers(prev => {
      const existing = prev.find(n => n.name === playerName);
      if (existing) {
        if (!existing.nominatedBy.includes(teamName)) {
          return prev.map(n => n.name === playerName ? { ...n, nominatedBy: [...n.nominatedBy, teamName] } : n);
        }
        return prev;
      }
      return [...prev, { name: playerName, basePrice, nominatedBy: [teamName] }];
    });

    const nomAlertMsg: MessageItem = {
      id: `m_nom_alert_${Date.now()}`,
      chatId: activeChatId,
      senderId: "system",
      senderName: "Nomination Desk",
      text: `📋 ${teamName} nominated ${playerName} for Accelerated Round ${acceleratedRound}!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), nomAlertMsg]
    }));

    setBidToast(`Nominated ${playerName} for ${teamName}!`);
    setTimeout(() => setBidToast(null), 2500);
  };

  const handleToggleFriend = (targetProfile: UserProfileData) => {
    setProfiles(prev => prev.map(p => {
      if (p.id === targetProfile.id) {
        const nextStatus: 'friend' | 'pending' | 'none' = 
          p.friendStatus === 'friend' ? 'none' : p.friendStatus === 'none' ? 'pending' : 'friend';
        const toastMsg = nextStatus === 'pending' 
          ? `Friend request sent to ${p.username}` 
          : nextStatus === 'friend' 
          ? `You are now friends with ${p.name}!` 
          : `Removed ${p.name} from friends`;
        setBidToast(toastMsg);
        setTimeout(() => setBidToast(null), 2500);
        return { ...p, friendStatus: nextStatus };
      }
      return p;
    }));
  };

  const handleSaveGroupIcon = () => {
    if (!editingGroupIconChat) return;
    const finalIcon = groupPhotoUrl || groupIconInput;
    setChats(prev => {
      const updated = prev.map(c => c.id === editingGroupIconChat.id ? { ...c, iconUrl: finalIcon } : c);
      try {
        localStorage.setItem("bidchat-custom-chats", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    setBidToast(`Updated icon for "${editingGroupIconChat.name}"!`);
    setTimeout(() => setBidToast(null), 3000);
    setIsEditGroupIconOpen(false);
    setEditingGroupIconChat(null);
  };

  const handleGroupPhotoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          setGroupPhotoUrl(canvas.toDataURL("image/jpeg", 0.85));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSignOut = () => {
    localStorage.removeItem("bidchat-user");
    router.push("/login");
  };

  if (!user) return null;

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] dark:bg-[#0B0E17] overflow-hidden font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* PANE 1: Main App Rail (Theme based on Official App Icon) */}
      <nav className="hidden md:flex w-[72px] flex-shrink-0 bg-white dark:bg-[#121624] border-r border-slate-200/80 dark:border-[#1E263E] flex flex-col items-center justify-between py-4 pb-6 z-20 select-none shadow-sm">
        
        {/* Top: Official App Icon & Main Nav */}
        <div className="flex flex-col items-center gap-6 w-full">
          
          {/* OFFICIAL APP ICON */}
          <button 
            onClick={() => setActiveNav("messages")} 
            className="w-12 h-12 rounded-[18px] overflow-hidden shadow-md hover:scale-105 active:scale-95 transition-all p-0.5 bg-blue-600 flex items-center justify-center group" 
            title="BidChat - Home"
          >
            <img src="/app-icon.png" alt="BidChat Icon" className="w-full h-full object-cover rounded-[16px]" />
          </button>

          {/* Navigation Items */}
          <div className="flex flex-col gap-3 w-full items-center">
            <NavIcon 
              icon={<MessageSquare className="w-5 h-5" />} 
              active={activeNav === "messages"} 
              onClick={() => setActiveNav("messages")} 
              tooltip="Messages" 
            />
            <NavIcon 
              icon={<Gavel className="w-5 h-5" />} 
              active={activeNav === "auctions"} 
              onClick={() => setActiveNav("auctions")} 
              tooltip="Discover Auctions" 
            />
            <NavIcon 
              icon={<Layers className="w-5 h-5" />} 
              active={activeNav === "presets"} 
              onClick={() => setActiveNav("presets")} 
              tooltip="Rosters & Presets Studio" 
            />
            <NavIcon 
              icon={<Users className="w-5 h-5" />} 
              active={activeNav === "friends"} 
              onClick={() => setActiveNav("friends")} 
              tooltip="Friends" 
            />
          </div>
        </div>

        {/* Bottom: User Avatar, Theme & Settings */}
        <div className="flex flex-col gap-3 w-full items-center">
          
          {/* User Profile Avatar */}
          <button
            onClick={() => setActiveNav("settings")}
            className="w-9 h-9 rounded-full text-white text-xs font-black shadow-sm flex items-center justify-center hover:ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-[#121624] transition-all overflow-hidden"
            style={{ backgroundColor: user.avatarBg || "#3B82F6" }}
            title={`Profile: ${user.username}`}
          >
            {user.avatarUrl ? (
              user.avatarUrl.startsWith("data:image") || user.avatarUrl.startsWith("http") ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-base select-none">{user.avatarUrl}</span>
              )
            ) : (
              user.username.replace("@", "").charAt(0).toUpperCase() || "U"
            )}
          </button>

          <NavIcon 
            icon={themeMode === 'light' ? <Sun className="w-5 h-5"/> : themeMode === 'dark' ? <Moon className="w-5 h-5"/> : <Laptop className="w-5 h-5"/>} 
            onClick={cycleTheme} 
            tooltip={`Theme: ${themeMode}`} 
          />
          <NavIcon 
            icon={<Settings className="w-5 h-5" />} 
            active={activeNav === "settings"} 
            onClick={() => setActiveNav("settings")} 
            tooltip="Settings" 
          />
        </div>
      </nav>

      {/* MOBILE DRAWER / SIDEBAR (Accessed via Three-Line Hamburger Menu) */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden animate-in fade-in duration-200">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsMobileDrawerOpen(false)}
          />

          {/* Slide-out Sidebar */}
          <aside className="fixed inset-y-0 left-0 w-[290px] max-w-[85vw] bg-white dark:bg-[#121624] border-r border-slate-200/80 dark:border-[#1E263E] shadow-2xl flex flex-col justify-between p-4 z-50 animate-in slide-in-from-left duration-200">
            
            {/* Top Section */}
            <div className="flex flex-col gap-4">
              
              {/* App Brand & Close Button */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1E263E]">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl p-0.5 bg-blue-600 flex items-center justify-center shadow-md">
                    <img src="/app-icon.png" alt="BidChat" className="w-full h-full object-cover rounded-[14px]" />
                  </div>
                  <div>
                    <span className="font-black text-lg text-blue-600 dark:text-blue-400">BidChat</span>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Mock Auction & Chat</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#1A2234] hover:bg-slate-200 dark:hover:bg-[#252F48] text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* User Profile Badge */}
              <div 
                onClick={() => {
                  setActiveNav("settings");
                  setIsMobileDrawerOpen(false);
                }}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-[#181F30] border border-slate-200/60 dark:border-[#1E263E] flex items-center gap-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-[#1E263E] transition-colors"
              >
                <div 
                  className="w-10 h-10 rounded-full text-white text-sm font-black shadow-sm flex items-center justify-center shrink-0 overflow-hidden"
                  style={{ backgroundColor: user.avatarBg || "#3B82F6" }}
                >
                  {user.avatarUrl ? (
                    user.avatarUrl.startsWith("data:image") || user.avatarUrl.startsWith("http") ? (
                      <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg select-none">{user.avatarUrl}</span>
                    )
                  ) : (
                    user.username.replace("@", "").charAt(0).toUpperCase() || "U"
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm truncate">{user.name || user.username}</div>
                  <div className="text-xs text-slate-400 truncate">{user.username}</div>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => {
                    setActiveNav("messages");
                    setIsMobileChatOpen(false);
                    setIsMobileDrawerOpen(false);
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                    activeNav === "messages"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#181F30]"
                  }`}
                >
                  <MessageSquare className="w-5 h-5 shrink-0" />
                  <div className="flex-1 text-left">Messages</div>
                  {chats.reduce((acc, c) => acc + (c.unread || 0), 0) > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeNav === "messages" ? "bg-white text-blue-600" : "bg-blue-600 text-white"}`}>
                      {chats.reduce((acc, c) => acc + (c.unread || 0), 0)}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    setActiveNav("auctions");
                    setIsMobileDrawerOpen(false);
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                    activeNav === "auctions"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#181F30]"
                  }`}
                >
                  <Gavel className="w-5 h-5 shrink-0" />
                  <span className="flex-1 text-left">Discover Auctions</span>
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
                </button>

                <button
                  onClick={() => {
                    setActiveNav("presets");
                    setIsMobileDrawerOpen(false);
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                    activeNav === "presets"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#181F30]"
                  }`}
                >
                  <Layers className="w-5 h-5 shrink-0" />
                  <span className="flex-1 text-left">Presets & Rosters</span>
                </button>

                <button
                  onClick={() => {
                    setActiveNav("friends");
                    setIsMobileDrawerOpen(false);
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                    activeNav === "friends"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#181F30]"
                  }`}
                >
                  <Users className="w-5 h-5 shrink-0" />
                  <span className="flex-1 text-left">Friends & Requests</span>
                </button>

                <button
                  onClick={() => {
                    setActiveNav("settings");
                    setIsMobileDrawerOpen(false);
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                    activeNav === "settings"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#181F30]"
                  }`}
                >
                  <Settings className="w-5 h-5 shrink-0" />
                  <span className="flex-1 text-left">Settings</span>
                </button>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="pt-3 border-t border-slate-100 dark:border-[#1E263E] flex flex-col gap-2">
              <button
                onClick={cycleTheme}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#181F30] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1E263E] text-xs font-bold transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  {themeMode === 'light' ? <Sun className="w-4 h-4 text-amber-500" /> : themeMode === 'dark' ? <Moon className="w-4 h-4 text-blue-400" /> : <Laptop className="w-4 h-4 text-teal-400" />}
                  <span>Theme: {themeMode.toUpperCase()}</span>
                </div>
                <span className="text-[10px] text-slate-400">Toggle</span>
              </button>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>

          </aside>
        </div>
      )}


      {/* PANE 2: Chat List Sidebar (Shown when in Messages) */}
      {activeNav === "messages" && (
        <aside 
          className={`transition-all duration-300 ease-in-out flex flex-col z-10 bg-slate-50/70 dark:bg-[#141926] border-r border-slate-200/80 dark:border-[#1E263E] ${
            isMobileChatOpen ? 'hidden md:flex' : 'flex w-full'
          } ${
            isSidebarOpen ? 'md:w-[320px] md:opacity-100' : 'md:w-0 md:opacity-0 md:overflow-hidden md:border-none'
          }`}
        >
          <div className="p-4 flex flex-col gap-3 w-full">
            
            {/* Header with App Brand, Hamburger Menu and Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* 3-LINE HAMBURGER MENU BUTTON (MOBILE) */}
                <button
                  onClick={() => setIsMobileDrawerOpen(true)}
                  className="md:hidden p-2 -ml-1 rounded-xl bg-slate-200/70 dark:bg-[#1E263E] hover:bg-slate-300 dark:hover:bg-[#252F48] text-slate-700 dark:text-slate-200 transition-colors"
                  title="Open Navigation Menu"
                  aria-label="Open Navigation Menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <img src="/app-icon.png" alt="BidChat" className="w-7 h-7 rounded-xl shadow-sm" />
                <h1 className="text-xl font-black tracking-tight text-blue-600 dark:text-blue-400">
                  Messages
                </h1>
              </div>
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => setIsNewDMOpen(true)}
                  className="w-8 h-8 rounded-full bg-slate-200/80 dark:bg-[#1E263E] hover:bg-blue-100 dark:hover:bg-blue-900/30 text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors flex items-center justify-center"
                  title="New Direct Message"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setIsNewGroupOpen(true)}
                  className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-500/25 transition-colors"
                  title="Create New Group"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search chats, people & @usernames..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-2xl bg-white dark:bg-[#1E263E] border border-slate-200 dark:border-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200 dark:bg-[#2A344E] text-slate-500 dark:text-slate-400 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-[#384668] transition-colors"
                  title="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Filter Bubbles */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
              <FilterChip label="All" active={chatFilter === "all"} onClick={() => setChatFilter("all")} />
              <FilterChip label="Peers" active={chatFilter === "peers"} onClick={() => setChatFilter("peers")} />
              <FilterChip label="People" active={chatFilter === "people"} onClick={() => setChatFilter("people")} />
              <FilterChip label="Dugouts" active={chatFilter === "dugouts"} onClick={() => setChatFilter("dugouts")} />
              <FilterChip label="Auctions" active={chatFilter === "auctions"} onClick={() => setChatFilter("auctions")} />
            </div>

          </div>

          {/* Chat & Profile Search List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar w-full">
            
            {/* If Filter is 'People', show all matching Profiles */}
            {chatFilter === "people" && (
              <div className="py-2">
                <div className="px-4 pb-2 text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>People & Cricket Profiles ({filteredProfiles.length})</span>
                </div>
                {filteredProfiles.length > 0 ? (
                  filteredProfiles.map(profile => (
                    <div
                      key={profile.id}
                      onClick={() => {
                        setSelectedProfileForModal(profile);
                        setIsProfileModalOpen(true);
                      }}
                      className="px-4 py-3 cursor-pointer transition-colors flex items-center justify-between gap-3 hover:bg-slate-100/80 dark:hover:bg-[#181F30]"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="relative shrink-0">
                          <div
                            className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-sm overflow-hidden"
                            style={{ backgroundColor: profile.avatarBg }}
                          >
                            {profile.avatarUrl && (profile.avatarUrl.startsWith("data:image") || profile.avatarUrl.startsWith("http")) ? (
                              <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xl select-none">{profile.avatarUrl || profile.name[0]}</span>
                            )}
                          </div>
                          <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#141926] ${profile.online ? "bg-emerald-500" : "bg-slate-400"}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="font-bold text-sm truncate">{profile.name}</span>
                            <span className="text-[10px] font-black px-1.5 py-0.2 rounded text-white" style={{ backgroundColor: profile.favTeam === "CSK" ? "#FDB913" : profile.favTeam === "MI" ? "#004BA0" : profile.favTeam === "RCB" ? "#DA1818" : "#3B82F6" }}>
                              {profile.favTeam}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{profile.username} · {profile.auctionsCount} drafts</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartDirectMessage(profile);
                        }}
                        className="px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs shrink-0"
                      >
                        Message
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No users found matching "{searchQuery}"
                  </div>
                )}
              </div>
            )}

            {/* If Search Query is active and filter != people: Show both Profiles and Chats */}
            {chatFilter !== "people" && searchQuery.trim().length > 0 && (
              <div>
                {/* 1. PEOPLE / PROFILES SECTION */}
                {filteredProfiles.length > 0 && (
                  <div className="pt-2 pb-1 border-b border-slate-200/60 dark:border-[#1E263E]/60 mb-2">
                    <div className="px-4 py-1.5 flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-blue-500" />
                        People & Profiles ({filteredProfiles.length})
                      </span>
                      <span className="text-[10px] text-blue-500 font-semibold cursor-pointer hover:underline" onClick={() => setChatFilter("people")}>
                        View all
                      </span>
                    </div>

                    {filteredProfiles.slice(0, 4).map(profile => (
                      <div
                        key={profile.id}
                        onClick={() => {
                          setSelectedProfileForModal(profile);
                          setIsProfileModalOpen(true);
                        }}
                        className="px-4 py-2.5 cursor-pointer transition-colors flex items-center justify-between gap-3 hover:bg-slate-100/80 dark:hover:bg-[#181F30]"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="relative shrink-0">
                            <div
                              className="w-9 h-9 rounded-2xl flex items-center justify-center text-white font-bold text-xs shadow-sm overflow-hidden"
                              style={{ backgroundColor: profile.avatarBg }}
                            >
                              {profile.avatarUrl && (profile.avatarUrl.startsWith("data:image") || profile.avatarUrl.startsWith("http")) ? (
                                <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-base select-none">{profile.avatarUrl || profile.name[0]}</span>
                              )}
                            </div>
                            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-[#141926] ${profile.online ? "bg-emerald-500" : "bg-slate-400"}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs truncate">{profile.name}</span>
                              <span className="text-[9px] font-black px-1.5 py-0.2 rounded text-white" style={{ backgroundColor: profile.favTeam === "CSK" ? "#FDB913" : profile.favTeam === "MI" ? "#004BA0" : profile.favTeam === "RCB" ? "#DA1818" : "#3B82F6" }}>
                                {profile.favTeam}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate">{profile.username}</p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartDirectMessage(profile);
                          }}
                          className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-600 hover:text-white text-blue-600 dark:text-blue-400 text-[11px] font-bold transition-all shrink-0"
                        >
                          Message
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* 2. CHATS SECTION */}
                {filteredChats.length > 0 && (
                  <div>
                    <div className="px-4 py-1.5 text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-teal-500" />
                      <span>Chats & Groups ({filteredChats.length})</span>
                    </div>
                    {filteredChats.map(chat => (
                      <div 
                        key={chat.id} 
                        onClick={() => {
                          setActiveChatId(chat.id);
                          setIsMobileChatOpen(true);
                          if (autoCollapseOnChat && window.innerWidth >= 768) {
                            setIsSidebarOpen(false);
                          }
                        }}
                        className={`px-4 py-3 cursor-pointer transition-colors flex items-center gap-3 ${
                          activeChatId === chat.id 
                            ? 'bg-white dark:bg-[#1A2234] shadow-sm' 
                            : 'hover:bg-slate-100/80 dark:hover:bg-[#181F30]'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm overflow-hidden text-white">
                          {chat.iconUrl ? (
                            chat.iconUrl.startsWith("data:image") || chat.iconUrl.startsWith("http") ? (
                              <img src={chat.iconUrl} alt={chat.name} className="w-full h-full object-cover rounded-2xl" />
                            ) : (
                              <div className="w-full h-full rounded-2xl bg-blue-600 flex items-center justify-center text-lg select-none">
                                {chat.iconUrl}
                              </div>
                            )
                          ) : chat.type === "dugouts" ? (
                            <div className="w-full h-full rounded-2xl bg-teal-600 flex items-center justify-center">
                              <Lock className="w-4 h-4" />
                            </div>
                          ) : (
                            <div className="w-full h-full rounded-2xl bg-blue-600 flex items-center justify-center">
                              <Hash className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <h3 className="font-bold text-xs truncate">{chat.name}</h3>
                            <span className="text-[10px] text-slate-400">12:34</span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{chat.lastMessage}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {filteredProfiles.length === 0 && filteredChats.length === 0 && (
                  <div className="p-8 text-center flex flex-col items-center justify-center text-slate-400">
                    <Search className="w-8 h-8 mb-2 opacity-30" />
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-300">No matching chats or people</p>
                    <p className="text-xs text-slate-400 mt-1">Try searching by @username, person's name, or group</p>
                  </div>
                )}
              </div>
            )}

            {/* Default Chat List (No search query & filter != people) */}
            {chatFilter !== "people" && searchQuery.trim().length === 0 && (
              filteredChats.map(chat => (
                <div 
                  key={chat.id} 
                  onClick={() => {
                    setActiveChatId(chat.id);
                    setIsMobileChatOpen(true);
                    if (autoCollapseOnChat && window.innerWidth >= 768) {
                      setIsSidebarOpen(false);
                    }
                  }}
                  className={`px-4 py-3 cursor-pointer transition-colors flex items-center gap-3 ${
                    activeChatId === chat.id 
                      ? 'bg-white dark:bg-[#1A2234] shadow-sm' 
                      : 'hover:bg-slate-100/80 dark:hover:bg-[#181F30]'
                  }`}
                >
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm overflow-hidden text-white">
                    {chat.iconUrl ? (
                      chat.iconUrl.startsWith("data:image") || chat.iconUrl.startsWith("http") ? (
                        <img src={chat.iconUrl} alt={chat.name} className="w-full h-full object-cover rounded-2xl" />
                      ) : (
                        <div className="w-full h-full rounded-2xl bg-blue-600 flex items-center justify-center text-xl select-none">
                          {chat.iconUrl}
                        </div>
                      )
                    ) : chat.type === "dugouts" ? (
                      <div className="w-full h-full rounded-2xl bg-teal-600 flex items-center justify-center">
                        <Lock className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-full h-full rounded-2xl bg-blue-600 flex items-center justify-center">
                        <Hash className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className="font-bold text-sm truncate">{chat.name}</h3>
                      <span className="text-[10px] text-slate-400">12:34</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{chat.lastMessage}</p>
                  </div>
                  {chat.unread > 0 && (
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-sm">
                      {chat.unread}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </aside>
      )}

      {/* PANE 3: Main Stage */}
      <main className={`flex-1 flex flex-col min-w-0 bg-[#F8FAFC] dark:bg-[#0B0E17] relative overflow-hidden ${
        activeNav === "messages" && !isMobileChatOpen ? "hidden md:flex" : "flex"
      }`}>
        
        {/* 1. MESSAGES VIEW */}
        {activeNav === "messages" && (
          currentChat ? (
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
              
              {/* Chat Header */}
              <header className="h-16 px-3 sm:px-6 flex items-center justify-between border-b border-slate-200/80 dark:border-[#1E263E] bg-white/70 dark:bg-[#121624]/70 backdrop-blur-md sticky top-0 z-30 shrink-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* MOBILE BACK BUTTON */}
                  <button 
                    onClick={() => setIsMobileChatOpen(false)}
                    className="md:hidden p-2 -ml-1 rounded-full hover:bg-slate-100 dark:hover:bg-[#1E263E] text-slate-600 dark:text-slate-300 transition-colors flex items-center justify-center"
                    title="Back to Messages"
                    aria-label="Back to Messages"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  {/* DESKTOP SIDEBAR TOGGLE */}
                  <button 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="hidden md:flex p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-[#1E263E] text-slate-500 transition-colors"
                    title="Toggle Sidebar"
                  >
                    {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => {
                      if (currentChat.type === "peers" && currentChat.name !== "Rajat") {
                        setIsGroupDetailsOpen(true);
                      } else {
                        handleOpenProfileByName(currentChat.name, currentChat.id);
                      }
                    }}
                    className="text-left group/title hover:opacity-85 transition-opacity cursor-pointer"
                    title="Click to view details & members"
                  >
                    <div className="font-bold text-base sm:text-lg flex items-center gap-2">
                      <span className="group-hover/title:underline">{currentChat.name}</span>
                      {currentChat.isAuctionActive && (
                        <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black animate-pulse flex items-center gap-1 shadow-sm">
                          <Radio className="w-2.5 h-2.5" />
                          LIVE AUCTION
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {currentChat.type === "dugouts" ? "🔒 Encrypted Franchise Dugout" : "32 participants • Active now • Tap for details"}
                    </div>
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  {currentChat.isAuctionActive && (
                    <button
                      onClick={() => setIsDesktopAuctionOpen(!isDesktopAuctionOpen)}
                      className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border shadow-xs ${
                        isDesktopAuctionOpen
                          ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800"
                          : "bg-slate-100 dark:bg-[#1E263E] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200"
                      }`}
                      title={isDesktopAuctionOpen ? "Hide Left Auction Stage" : "Show Left Auction Stage"}
                    >
                      <Gavel className="w-3.5 h-3.5 text-amber-500" />
                      <span>{isDesktopAuctionOpen ? "Left Stage: Open" : "Show Stage"}</span>
                    </button>
                  )}
                  {currentChat.type === "peers" && (
                    <button 
                      onClick={() => setIsStartAuctionOpen(true)}
                      className="px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-xs font-bold transition-all flex items-center gap-1.5 border border-blue-200 dark:border-blue-800"
                    >
                      <Gavel className="w-3.5 h-3.5" />
                      <span>Start Auction</span>
                    </button>
                  )}
                  <button 
                    onClick={() => setIsTeamClaimOpen(true)}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-[#1E263E] text-slate-500 transition-colors"
                    title="Franchise Slots"
                  >
                    <Users className="w-4 h-4" />
                  </button>
                  <div className="relative">
                    <button 
                      onClick={() => setIsChatMenuOpen(!isChatMenuOpen)}
                      className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-[#1E263E] text-slate-500 transition-colors"
                      title="Chat Options"
                      aria-label="Chat Options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* 3-Dot Dropdown Menu (Z-50 floats on top of live podium bar) */}
                    {isChatMenuOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setIsChatMenuOpen(false)} 
                        />
                        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#1A2234] border border-slate-200 dark:border-[#2A344A] rounded-2xl shadow-2xl z-50 p-2 space-y-1 text-xs animate-in fade-in zoom-in-95">
                          
                          {/* Live Auction Analytics & Admin Options */}
                          <button
                            onClick={() => {
                              setIsChatMenuOpen(false);
                              setSelectedAnalyticsData({
                                tournamentName: currentChat.name,
                                pointSystem: currentPointSystem,
                              });
                              setIsPostAuctionAnalyticsOpen(true);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-cyan-50 dark:hover:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 font-bold transition-colors"
                          >
                            <BarChart3 className="w-4 h-4 text-cyan-500" />
                            <div className="flex-1">
                              <div>Auction Analytics & Stats</div>
                              <div className="text-[10px] text-slate-400 font-normal">Purses, stats & MVP board</div>
                            </div>
                          </button>

                          <button
                            onClick={() => {
                              setIsChatMenuOpen(false);
                              setIsAuctionConsoleOpen(true);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold transition-colors"
                          >
                            <ShieldCheck className="w-4 h-4 text-amber-500" />
                            <div className="flex-1">
                              <div>Auctioneer Live Cockpit</div>
                              <div className="text-[10px] text-slate-400 font-normal">Hammer (SOLD/UNSOLD) & nominations</div>
                            </div>
                          </button>

                          <button
                            onClick={() => {
                              setIsChatMenuOpen(false);
                              setIsAuctionSettingsOpen(true);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-[#252F48] text-slate-700 dark:text-slate-200 font-bold transition-colors"
                          >
                            <Sliders className="w-4 h-4 text-purple-500" />
                            <span>Auction Rules & Slabs</span>
                          </button>

                          <div className="my-1 border-t border-slate-100 dark:border-[#2A344A]" />

                          <button
                            onClick={() => {
                              setIsChatMenuOpen(false);
                              setIsGroupDetailsOpen(true);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-blue-50 dark:hover:bg-[#252F48] text-slate-700 dark:text-slate-200 font-bold transition-colors"
                          >
                            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span>Group Details & History</span>
                          </button>

                          {currentChat.type === "peers" && (
                            <button
                              onClick={() => {
                                setIsChatMenuOpen(false);
                                setIsStartAuctionOpen(true);
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-blue-50 dark:hover:bg-[#252F48] text-slate-700 dark:text-slate-200 font-bold transition-colors"
                            >
                              <Gavel className="w-4 h-4 text-teal-500" />
                              <span>Start Auction</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setIsChatMenuOpen(false);
                              setEditingGroupIconChat(currentChat);
                              setGroupIconInput(currentChat.iconUrl && !currentChat.iconUrl.startsWith("data:") ? currentChat.iconUrl : "🏆");
                              setGroupPhotoUrl(currentChat.iconUrl && currentChat.iconUrl.startsWith("data:") ? currentChat.iconUrl : null);
                              setIsEditGroupIconOpen(true);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-blue-50 dark:hover:bg-[#252F48] text-slate-700 dark:text-slate-200 font-bold transition-colors"
                          >
                            <Camera className="w-4 h-4 text-amber-500" />
                            <span>Change Group Icon</span>
                          </button>

                          <button
                            onClick={() => {
                              setIsChatMenuOpen(false);
                              setIsTeamClaimOpen(true);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-blue-50 dark:hover:bg-[#252F48] text-slate-700 dark:text-slate-200 font-bold transition-colors"
                          >
                            <Users className="w-4 h-4 text-purple-500" />
                            <span>Franchise Slots</span>
                          </button>

                          <div className="my-1 border-t border-slate-100 dark:border-[#2A344A]" />

                          <button
                            onClick={() => {
                              setIsChatMenuOpen(false);
                              setMessages(prev => ({
                                ...prev,
                                [activeChatId]: []
                              }));
                              setBidToast("Chat history cleared!");
                              setTimeout(() => setBidToast(null), 2500);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-medium transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-rose-500" />
                            <span>Clear Chat Messages</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </header>

              {/* Split View Body: Left Side Live Stage (Desktop) / Top Bar (Mobile), Right Side Chat */}
              <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
                {/* Left Live Auction Stage (Desktop Column / Mobile Top Stack) */}
                {currentChat.isAuctionActive && (
                  <div
                    className={`w-full md:w-[440px] lg:w-[480px] xl:w-[500px] shrink-0 border-b md:border-b-0 md:border-r border-slate-200/80 dark:border-[#1E263E] flex flex-col overflow-y-auto custom-scrollbar bg-white dark:bg-[#121624] z-20 ${
                      !isDesktopAuctionOpen ? "md:hidden" : ""
                    }`}
                  >
                    <AuctionWidget
                      auctionState={{
                        auctionId: "auction_live_active",
                        status: "ACTIVE",
                        currentPlayer: {
                          id: "p_podium",
                          name: podiumPlayer,
                          role: "BOWL",
                          nationality: "IND",
                          isCapped: true,
                          basePrice: 2.0,
                          prevTeam: "MI",
                          isAccelerated: acceleratedRound > 0,
                          isRtmAvailable: true,
                          originalBasePrice: 2.0,
                          discountApplied: allowUnsoldDiscount,
                        },
                        currentBid: currentBid,
                        leadingTeam: (teams.find(t => t.shortName === leadingTeam) as any) || {
                          id: "t_csk",
                          name: "Chennai Super Kings",
                          shortName: "CSK",
                          primaryColor: "#FDB913",
                          purseRemaining: 95.25,
                          totalSpent: 24.75,
                          squadCount: 18,
                          overseasCount: 6,
                          maxSquadSize: 25,
                          maxOverseas: 8,
                        },
                        timerSeconds: 24,
                        bidHistory: podiumBidHistory,
                        allTeams: teams.map(t => ({
                          id: t.id,
                          name: t.name,
                          shortName: t.shortName,
                          primaryColor: t.primaryColor,
                          purseRemaining: t.purseRemaining ?? 120,
                          totalSpent: t.totalSpent ?? 0,
                          squadCount: t.squadCount ?? 0,
                          overseasCount: t.overseasCount ?? 0,
                          maxSquadSize: 25,
                          maxOverseas: 8,
                          ownerId: t.ownerId || undefined,
                          ownerName: t.ownerName || undefined,
                          players: [],
                        })),
                        rtmState: null,
                        isPaused: false,
                        pointSystem: currentPointSystem,
                        acceleratedRoundNumber: acceleratedRound,
                        isAcceleratedRound: acceleratedRound > 0,
                        allowUnsoldDiscount: allowUnsoldDiscount,
                        unsoldDiscountPercentage: unsoldDiscountPercentage,
                      }}
                      userTeam={(teams.find(t => t.ownerId === "me" || (user && t.ownerId === user.username)) as any) || teams[0]}
                      settings={auctionSettings}
                      onPlaceBid={(amountCr) => {
                        setCurrentBid(amountCr);
                        const myTeam = teams.find(t => t.ownerId === "me" || (user && t.ownerId === user.username)) || teams[0];
                        setLeadingTeam(myTeam.shortName);
                        setPodiumBidHistory(prev => [
                          {
                            id: `bid_${Date.now()}`,
                            playerId: "p_podium",
                            teamShortName: myTeam.shortName,
                            teamName: myTeam.name,
                            amount: amountCr,
                            bidderName: user?.username || "You",
                            timestamp: "Just now",
                          },
                          ...prev,
                        ]);
                        setBidToast(`Paddle Raised: ₹${amountCr} Cr by ${myTeam.shortName}!`);
                        setTimeout(() => setBidToast(null), 3000);
                      }}
                      onPass={() => {
                        const myTeam = teams.find(t => t.ownerId === "me" || (user && t.ownerId === user.username)) || teams[0];
                        setBidToast(`${myTeam.shortName} passed on ${podiumPlayer}`);
                        setTimeout(() => setBidToast(null), 3000);
                      }}
                      onOpenConsole={() => setIsAuctionConsoleOpen(true)}
                      onOpenAnalytics={() => {
                        setSelectedAnalyticsData({
                          tournamentName: currentChat.name,
                          pointSystem: currentPointSystem,
                        });
                        setIsPostAuctionAnalyticsOpen(true);
                      }}
                      onOpenSettings={() => setIsAuctionSettingsOpen(true)}
                      onToggleCollapse={() => setIsDesktopAuctionOpen(false)}
                    />

                    {/* Accelerated Round Nominations Open Bar */}
                    {callForNominationsOpen && (
                      <div className="px-4 py-2 bg-amber-500/20 border-t border-amber-500/30 flex items-center justify-between text-xs animate-in fade-in shrink-0">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-400 animate-bounce" />
                          <span className="font-bold text-amber-300">
                            Accelerated Round {acceleratedRound} / {totalAcceleratedRounds}
                          </span>
                        </div>
                        <button
                          onClick={() => setIsNominationModalOpen(true)}
                          className="px-3 py-1 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
                        >
                          <Users className="w-3.5 h-3.5" />
                          Nominate
                        </button>
                      </div>
                    )}

                    {bidToast && (
                      <div className="bg-blue-600 text-white text-xs font-bold text-center py-1 animate-in fade-in shadow-inner shrink-0">
                        {bidToast}
                      </div>
                    )}
                  </div>
                )}

                {/* Right Side: Chat Feed + Input Bar */}
                <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#F8FAFC] dark:bg-[#0B0E17]">

              <ChatFeed
                messages={currentChatMessages.map(msg => ({
                  ...msg,
                  isWhisper: !!msg.isWhisper,
                  teamShortName: msg.whisperTeamId,
                })) as any[]}
                currentUserTeam={teams.find(t => t.ownerId === "me" || (user && t.ownerId === user.username)) as any}
                currentUserId={user?.username}
              />

              <ChatInput
                userTeam={teams.find(t => t.ownerId === "me" || (user && t.ownerId === user.username)) as any}
                onSendMessage={(text, isWhisper) => {
                  const myTeam = teams.find(t => t.ownerId === "me" || (user && t.ownerId === user.username));
                  const newMsg = {
                    id: `msg_${Date.now()}`,
                    chatId: activeChatId,
                    senderId: user?.username || "me",
                    senderName: user?.name || user?.username || "You",
                    text: text.trim(),
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isWhisper: isWhisper,
                    whisperTeamId: isWhisper ? (myTeam?.shortName || "CSK") : undefined,
                  };

                  setMessages(prev => ({
                    ...prev,
                    [activeChatId]: [...(prev[activeChatId] || []), newMsg]
                  }));

                  setChats(prev => prev.map(c => 
                    c.id === activeChatId ? { ...c, lastMessage: newMsg.text } : c
                  ));

                  if (socket && isConnected) {
                    socket.emit("send_message", newMsg);
                  }
                }}
              />

                </div>
              </div>

            </div>
          ) : (
            /* Empty Chat State: Official Brand Welcome */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#F8FAFC] dark:bg-[#0B0E17]">
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-24 h-24 rounded-[32px] overflow-hidden shadow-xl mx-auto p-1 bg-blue-600">
                  <img src="/app-icon.png" alt="BidChat Icon" className="w-full h-full object-cover rounded-[28px]" />
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-tight text-blue-600 dark:text-blue-400">
                    BidChat
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    Where Live IPL Mega Bidding Meets Social Banter. Select a chat on the left or create a custom tournament room to begin.
                  </p>
                </div>
                <div className="pt-2 flex justify-center gap-3">
                  <button 
                    onClick={() => setIsStartAuctionOpen(true)}
                    className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all flex items-center gap-1.5"
                  >
                    <Gavel className="w-4 h-4" />
                    <span>Create Auction Room</span>
                  </button>
                  <button 
                    onClick={() => setActiveNav("presets")}
                    className="px-5 py-2.5 rounded-full bg-slate-100 dark:bg-[#1E263E] text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 transition-colors flex items-center gap-1.5"
                  >
                    <Layers className="w-4 h-4" />
                    <span>Open Studio</span>
                  </button>
                </div>
              </div>
            </div>
          )
        )}

        {/* 2. DISCOVER AUCTIONS VIEW */}
        {activeNav === "auctions" && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <header className="h-16 px-6 sm:px-8 flex items-center justify-between border-b border-slate-200/80 dark:border-[#1E263E] shrink-0 bg-white/70 dark:bg-[#121624]/70 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <img src="/app-icon.png" alt="BidChat" className="w-7 h-7 rounded-xl shadow-sm" />
                <div>
                  <h1 className="text-xl font-bold tracking-tight">Discover Auctions</h1>
                  <p className="text-xs text-slate-500">Live mock lobbies, stranger groups & permanent friend tournaments</p>
                </div>
              </div>
              <button 
                onClick={() => setIsStartAuctionOpen(true)}
                className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 shadow-md shadow-blue-500/25"
              >
                <Plus className="w-4 h-4" />
                <span>Create Auction Room</span>
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <div className="max-w-3xl mx-auto space-y-4">
                
                {/* Active Live Room */}
                <div className="p-6 rounded-[28px] bg-white dark:bg-[#161C2E] border border-slate-100 dark:border-transparent shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-teal-500 uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                      Live Mega Auction
                    </span>
                    <span className="text-xs font-semibold text-slate-500">8/10 Franchises Claimed</span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold">IPL 2026 Season Mock Draft</h3>
                    <p className="text-xs text-slate-500 mt-1">Official ₹120 Cr Purse • RTM Enabled • Set 1 Marquee in progress</p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {["#FDB913", "#004BA0", "#DA1818", "#3A225D"].map((bg, idx) => (
                          <div key={idx} className="w-7 h-7 rounded-full border-2 border-white dark:border-[#161C2E] flex items-center justify-center text-[10px] text-white font-bold" style={{ backgroundColor: bg }}>
                            {idx + 1}
                          </div>
                        ))}
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold text-[10px]">
                        ⭐ ESPN MVP
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedAnalyticsData({
                            tournamentName: "IPL 2026 Season Mock Draft",
                            pointSystem: "espn",
                          });
                          setIsPostAuctionAnalyticsOpen(true);
                        }}
                        className="px-3.5 py-2 rounded-full bg-slate-100 dark:bg-[#1E263E] hover:bg-slate-200 dark:hover:bg-[#283350] text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors flex items-center gap-1.5"
                      >
                        <BarChart3 className="w-3.5 h-3.5 text-cyan-500" />
                        <span>View Analytics & Stats</span>
                      </button>
                      <button 
                        onClick={() => {
                          setActiveNav("messages");
                          setActiveChatId("c_1");
                        }}
                        className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-md shadow-blue-500/20"
                      >
                        Join Auction
                      </button>
                    </div>
                  </div>
                </div>

                {/* Completed Tournament Archive Card */}
                <div className="p-6 rounded-[28px] bg-white dark:bg-[#161C2E] border border-slate-100 dark:border-transparent shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      ✓ Completed Tournament
                    </span>
                    <span className="text-xs font-semibold text-slate-500">10/10 Franchises Finalized</span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold">IPL 2025 Official Mega Auction</h3>
                    <p className="text-xs text-slate-500 mt-1">₹120 Cr Purse Cap • 182 Players Sold • Official Cricinfo MVP Scoring</p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold text-[10px]">
                        ⭐ ESPN MVP Points
                      </span>
                      <span className="text-xs text-slate-400">• Total ₹639.15 Cr Spent</span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedAnalyticsData({
                          tournamentName: "IPL 2025 Official Mega Auction",
                          pointSystem: "espn",
                        });
                        setIsPostAuctionAnalyticsOpen(true);
                      }}
                      className="px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 font-bold text-xs transition-colors flex items-center gap-1.5 border border-blue-200 dark:border-blue-800"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>View Analytics & Stats</span>
                    </button>
                  </div>
                </div>

                {/* Quick Link to Roster Studio */}
                <div className="p-5 rounded-[24px] bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/25">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm">Want Custom Rules or Player Lists?</div>
                      <div className="text-xs text-slate-500">Customize player base prices, add teams, or change bidding timers in the Studio</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveNav("presets")}
                    className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-sm shrink-0"
                  >
                    Open Studio
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* 3. ROSTERS & PRESETS STUDIO VIEW */}
        {activeNav === "presets" && (
          <RosterStudio 
            onOpenMenu={() => setIsMobileDrawerOpen(true)}
            onStartAuctionWithPreset={(preset) => {
              setSelectedPresetForModal(preset);
              setIsStartAuctionOpen(true);
            }}
            onShareToChat={handleShareToChat}
          />
        )}

        {/* 4. FRIENDS VIEW */}
        {activeNav === "friends" && (
          <FriendsList onOpenMenu={() => setIsMobileDrawerOpen(true)} />
        )}

        {/* 5. SETTINGS VIEW */}
        {activeNav === "settings" && (
          <SettingsPanel 
            onOpenMenu={() => setIsMobileDrawerOpen(true)}
            user={user}
            onUserUpdate={(updated) => setUser(prev => prev ? {
              ...prev,
              name: updated.name || prev.name,
              username: updated.username || prev.username,
              email: updated.email || prev.email,
              avatarBg: updated.avatarBg || prev.avatarBg,
              avatarUrl: updated.avatarUrl !== undefined ? updated.avatarUrl : prev.avatarUrl,
            } : null)}
            onSignOut={handleSignOut}
          />
        )}

      </main>

      {/* Modals */}
      {/* GROUP DETAILS & AUCTION HISTORY DRAWER */}
      {currentChat && (
        <GroupDetailsDrawer
          isOpen={isGroupDetailsOpen}
          onClose={() => setIsGroupDetailsOpen(false)}
          chat={currentChat}
          currentAuction={{
            podiumPlayer,
            currentBid,
            leadingTeam,
          }}
          onSelectMember={(member) => handleOpenProfileByName(member.name, member.username)}
          onOpenAnalytics={(record) => {
            setIsGroupDetailsOpen(false);
            setSelectedAnalyticsData({
              tournamentName: record?.tournamentName || "IPL 2026 Season Mock Draft",
              pointSystem: record?.pointSystem || "espn",
            });
            setIsPostAuctionAnalyticsOpen(true);
          }}
          onChangeIcon={() => {
            setIsGroupDetailsOpen(false);
            setEditingGroupIconChat(currentChat);
            setGroupIconInput(currentChat.iconUrl && !currentChat.iconUrl.startsWith("data:") ? currentChat.iconUrl : "🏆");
            setGroupPhotoUrl(currentChat.iconUrl && currentChat.iconUrl.startsWith("data:") ? currentChat.iconUrl : null);
            setIsEditGroupIconOpen(true);
          }}
          onStartAuction={() => {
            setIsGroupDetailsOpen(false);
            setIsStartAuctionOpen(true);
          }}
          onClearChat={() => {
            setMessages(prev => ({ ...prev, [activeChatId]: [] }));
            setBidToast("Chat history cleared!");
            setTimeout(() => setBidToast(null), 2500);
            setIsGroupDetailsOpen(false);
          }}
        />
      )}

      <NewGroupModal 
        isOpen={isNewGroupOpen}
        onClose={() => setIsNewGroupOpen(false)}
        onCreateGroup={handleCreateGroup}
      />

      <NewDirectMessageModal 
        isOpen={isNewDMOpen}
        onClose={() => setIsNewDMOpen(false)}
        onSelectUser={handleStartDirectMessage}
      />

      <StartAuctionModal 
        isOpen={isStartAuctionOpen}
        onClose={() => {
          setIsStartAuctionOpen(false);
          setSelectedPresetForModal(null);
        }}
        onStartAuction={handleStartAuction}
        initialPreset={selectedPresetForModal}
      />


      {/* EDIT GROUP ICON / PHOTO MODAL */}
      {isEditGroupIconOpen && editingGroupIconChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-[28px] bg-white dark:bg-[#1E2638] border border-slate-200 dark:border-[#2A344A] p-6 shadow-2xl flex flex-col gap-4">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#2A344A]">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Change Group Icon</h3>
                <p className="text-xs text-slate-400">{editingGroupIconChat.name}</p>
              </div>
              <button 
                onClick={() => setIsEditGroupIconOpen(false)} 
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#252F48] hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Icon & Photo Display */}
            <div className="flex flex-col items-center gap-3 py-2">
              <div className="relative group">
                {groupPhotoUrl ? (
                  <img 
                    src={groupPhotoUrl} 
                    alt="Group Icon" 
                    className="w-20 h-20 rounded-2xl object-cover shadow-lg border-2 border-blue-500" 
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center text-4xl shadow-lg text-white select-none">
                    {groupIconInput}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => groupIconFileRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md hover:bg-blue-700 transition-colors"
                  title="Upload group image"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
                <input 
                  ref={groupIconFileRef} 
                  type="file" 
                  accept="image/*" 
                  onChange={handleGroupPhotoFile} 
                  className="hidden" 
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => groupIconFileRef.current?.click()}
                  className="px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-600 dark:text-blue-400 text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Camera className="w-3 h-3" />
                  <span>Upload Photo</span>
                </button>
                {groupPhotoUrl && (
                  <button
                    type="button"
                    onClick={() => setGroupPhotoUrl(null)}
                    className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-[#252F48] hover:bg-rose-50 text-slate-600 dark:text-slate-300 hover:text-rose-600 text-xs font-bold transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Quick Badge Selection */}
            <div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                Or Pick Icon Badge
              </span>
              <div className="flex flex-wrap gap-2">
                {["🏆", "🔨", "🏏", "🔥", "⚡", "👑", "🦁", "🛡️", "🎯", "💰", "🏟️", "🚀"].map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => {
                      setGroupIconInput(icon);
                      setGroupPhotoUrl(null);
                    }}
                    className={`w-8 h-8 rounded-xl text-base flex items-center justify-center transition-all ${
                      !groupPhotoUrl && groupIconInput === icon
                        ? "bg-blue-600 text-white scale-110 shadow-sm ring-2 ring-blue-500/40"
                        : "bg-slate-50 dark:bg-[#252F48] hover:scale-105"
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-slate-100 dark:border-[#2A344A] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditGroupIconOpen(false)}
                className="px-4 py-2 rounded-full text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-[#252F48]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveGroupIcon}
                className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20"
              >
                Save Icon
              </button>
            </div>
          </div>
        </div>
      )}

      <ProfileCard
        isOpen={isProfileModalOpen}
        user={selectedProfileForModal}
        onClose={() => {
          setIsProfileModalOpen(false);
          setSelectedProfileForModal(null);
        }}
        onStartDM={(target) => {
          setIsProfileModalOpen(false);
          handleStartDirectMessage(target);
        }}
        onToggleFriend={(target) => {
          handleToggleFriend(target);
          setSelectedProfileForModal(prev => prev && prev.id === target.id ? {
            ...prev,
            friendStatus: prev.friendStatus === 'friend' ? 'none' : prev.friendStatus === 'none' ? 'pending' : 'friend'
          } : prev);
        }}
      />

      {/* DEDICATED LIVE AUCTION CONSOLE MODAL (Pure Auctioneer Cockpit) */}
      <AuctionConsoleModal
        isOpen={isAuctionConsoleOpen}
        onClose={() => setIsAuctionConsoleOpen(false)}
        teams={teams}
        podiumPlayer={podiumPlayer}
        currentBid={currentBid}
        leadingTeam={leadingTeam}
        onSellPlayer={handleAdminSellPlayer}
        onMarkUnsold={handleAdminMarkUnsold}
        onNextPlayer={handleAdminNextPlayer}
        onUpdateBid={handleAdminUpdateBid}
        unsoldList={unsoldList}
        acceleratedRound={acceleratedRound}
        totalAcceleratedRounds={totalAcceleratedRounds}
        callForNominationsOpen={callForNominationsOpen}
        allowUnsoldDiscount={allowUnsoldDiscount}
        unsoldDiscountPercentage={unsoldDiscountPercentage}
        nominatedPlayers={nominatedPlayers}
        onToggleCallForNominations={handleToggleCallForNominations}
        onAdvanceAcceleratedRound={handleAdvanceAcceleratedRound}
        onCallNominatedPlayer={handleCallNominatedPlayer}
      />

      {/* DEDICATED POST-AUCTION & TOURNAMENT ANALYTICS DASHBOARD MODAL */}
      <PostAuctionAnalyticsModal
        isOpen={isPostAuctionAnalyticsOpen}
        onClose={() => setIsPostAuctionAnalyticsOpen(false)}
        tournamentName={selectedAnalyticsData.tournamentName}
        pointSystem={selectedAnalyticsData.pointSystem}
        teams={teams}
        podiumPlayer={podiumPlayer}
        currentBid={currentBid}
        leadingTeam={leadingTeam}
        onUpdatePlayerPoints={handleAdminUpdatePlayerPoints}
      />

      {/* AUCTION ANALYTICS & LIVE STATS DASHBOARD MODAL */}
      <AuctionAnalyticsDashboard
        isOpen={isAnalyticsDashboardOpen}
        onClose={() => setIsAnalyticsDashboardOpen(false)}
        teams={teams}
        podiumPlayer={podiumPlayer}
        currentBid={currentBid}
        leadingTeam={leadingTeam}
        initialTab={analyticsDashboardTab}
        isAdmin={true}
        onSellPlayer={handleAdminSellPlayer}
        onMarkUnsold={handleAdminMarkUnsold}
        onNextPlayer={handleAdminNextPlayer}
        onUpdateBid={handleAdminUpdateBid}
        onUpdatePlayerPoints={handleAdminUpdatePlayerPoints}
        unsoldList={unsoldList}
        acceleratedRound={acceleratedRound}
        totalAcceleratedRounds={totalAcceleratedRounds}
        callForNominationsOpen={callForNominationsOpen}
        allowUnsoldDiscount={allowUnsoldDiscount}
        unsoldDiscountPercentage={unsoldDiscountPercentage}
        nominatedPlayers={nominatedPlayers}
        onToggleCallForNominations={handleToggleCallForNominations}
        onAdvanceAcceleratedRound={handleAdvanceAcceleratedRound}
        onCallNominatedPlayer={handleCallNominatedPlayer}
      />

      {/* ACCELERATED ROUND NOMINATION MODAL */}
      <NominationModal
        isOpen={isNominationModalOpen}
        onClose={() => setIsNominationModalOpen(false)}
        unsoldList={unsoldList}
        nominatedPlayers={nominatedPlayers}
        acceleratedRound={acceleratedRound}
        totalAcceleratedRounds={totalAcceleratedRounds}
        allowUnsoldDiscount={allowUnsoldDiscount}
        unsoldDiscountPercentage={unsoldDiscountPercentage}
        userTeam={leadingTeam !== "None" ? leadingTeam : "CSK"}
        onNominatePlayer={handleTeamNominatePlayer}
      />

      {/* AUCTION SETTINGS & BID SLABS MODAL */}
      <AuctionSettingsModal
        isOpen={isAuctionSettingsOpen}
        onClose={() => setIsAuctionSettingsOpen(false)}
        settings={auctionSettings}
        onSaveSettings={(s) => {
          setAuctionSettings(s);
          setBidToast("Auction rules & bid increments updated!");
          setTimeout(() => setBidToast(null), 3000);
        }}
      />

      <TeamClaimModal 
        isOpen={isTeamClaimOpen}
        onClose={() => setIsTeamClaimOpen(false)}
        teams={teams}
        currentUserId={user.username}
        onClaimTeam={handleClaimTeam}
        onRequestJoin={() => {
          setIsTeamClaimOpen(false);
          setBidToast("Join request sent to Franchise Owner!");
          setTimeout(() => setBidToast(null), 3000);
        }}
      />

    </div>
  );
}

function NavIcon({ icon, active, onClick, tooltip }: { icon: React.ReactNode, active?: boolean, onClick: () => void, tooltip: string }) {
  return (
    <button 
      onClick={onClick}
      className={`w-11 h-11 rounded-[16px] flex items-center justify-center transition-all group relative ${
        active 
          ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 shadow-sm' 
          : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-[#1E263E] hover:text-slate-900 dark:hover:text-white'
      }`}
      title={tooltip}
    >
      {icon}
      {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-600 rounded-r-full" />}
    </button>
  );
}

function FilterChip({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
        active
          ? 'bg-blue-600 text-white shadow-sm'
          : 'bg-slate-100 text-slate-600 dark:bg-[#1E263E] dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#252F48]'
      }`}
    >
      {label}
    </button>
  );
}
