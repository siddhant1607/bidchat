import { AuctionPreset, CustomRoster, Player, CustomRosterTeam } from "@/types/auction";
import ipl2025Data from "@/data/rosters/default_ipl_2025_roster.json";
import ipl2026Data from "@/data/rosters/default_ipl_2026_roster.json";
import iplCycleData from "@/data/rosters/default_ipl_combined_roster.json";

export const DEFAULT_IPL_TEAMS: CustomRosterTeam[] = [
  { id: "t_csk", name: "Chennai Super Kings", shortName: "CSK", primaryColor: "#FDB913", purseCr: 120.0, logoUrl: "/logos/CSK.png" },
  { id: "t_mi", name: "Mumbai Indians", shortName: "MI", primaryColor: "#004BA0", purseCr: 120.0, logoUrl: "/logos/MI.png" },
  { id: "t_rcb", name: "Royal Challengers Bengaluru", shortName: "RCB", primaryColor: "#DA1818", purseCr: 120.0, logoUrl: "/logos/RCB.png" },
  { id: "t_kkr", name: "Kolkata Knight Riders", shortName: "KKR", primaryColor: "#3A225D", purseCr: 120.0, logoUrl: "/logos/KKR.png" },
  { id: "t_srh", name: "Sunrisers Hyderabad", shortName: "SRH", primaryColor: "#F26522", purseCr: 120.0, logoUrl: "/logos/SRH.png" },
  { id: "t_dc", name: "Delhi Capitals", shortName: "DC", primaryColor: "#0078BC", purseCr: 120.0, logoUrl: "/logos/DC.png" },
  { id: "t_rr", name: "Rajasthan Royals", shortName: "RR", primaryColor: "#EA1A85", purseCr: 120.0, logoUrl: "/logos/RR.png" },
  { id: "t_gt", name: "Gujarat Titans", shortName: "GT", primaryColor: "#1B2133", purseCr: 120.0, logoUrl: "/logos/GT.png" },
  { id: "t_lsg", name: "Lucknow Super Giants", shortName: "LSG", primaryColor: "#A7D5F2", purseCr: 120.0, logoUrl: "/logos/LSG.png" },
  { id: "t_pbks", name: "Punjab Kings", shortName: "PBKS", primaryColor: "#DD1F2D", purseCr: 120.0, logoUrl: "/logos/PBKS.png" },
];

export const DEFAULT_PRESETS: AuctionPreset[] = [
  {
    id: "preset_ipl_mega_2025",
    name: "IPL Mega Auction 2025",
    description: "Official 2025 BCCI mega auction regulations with 120 Cr purse, up to 6 RTM cards, 2 accelerated rounds, and optional unsold discount.",
    isDefault: true,
    createdBy: "BCCI Official",
    logoUrl: "/logos/ipl.png",
    totalPurse: 120.0,
    minSquadSize: 18,
    maxSquadSize: 25,
    maxOverseas: 8,
    timerDuration: 30,
    rtmEnabled: true,
    rtmCount: 6,
    rtmStyle: "ESCALATION_2025",
    bidIncrementStyle: "IPL_STANDARD_SLABS",
    requireApproval: false,
    acceleratedRounds: 2,
    allowUnsoldDiscount: false,
    unsoldDiscountPercentage: 50,
    pointSystem: "espn",
  },
  {
    id: "preset_ipl_2026_mega",
    name: "IPL 2026 Mega Auction Official",
    description: "Official BCCI mega auction regulations with 120 Cr purse, up to 6 RTM cards, 2 accelerated rounds, and 2025 escalation bidding match rule.",
    isDefault: true,
    createdBy: "BCCI Official",
    logoUrl: "/logos/ipl.png",
    totalPurse: 120.0,
    minSquadSize: 18,
    maxSquadSize: 25,
    maxOverseas: 8,
    timerDuration: 30,
    rtmEnabled: true,
    rtmCount: 6,
    rtmStyle: "ESCALATION_2025",
    bidIncrementStyle: "IPL_STANDARD_SLABS",
    requireApproval: false,
    acceleratedRounds: 2,
    allowUnsoldDiscount: false,
    unsoldDiscountPercentage: 50,
    pointSystem: "espn",
  },
  {
    id: "preset_ipl_mini",
    name: "IPL Mini Auction (Speed Mode)",
    description: "Compact mini auction for squad reinforcements with 100 Cr purse, zero RTMs, 1 accelerated round, and shorter 20s timers.",
    isDefault: true,
    createdBy: "BCCI Official",
    logoUrl: "/logos/ipl.png",
    totalPurse: 100.0,
    minSquadSize: 18,
    maxSquadSize: 25,
    maxOverseas: 8,
    timerDuration: 20,
    rtmEnabled: false,
    rtmCount: 0,
    rtmStyle: "CLASSIC_MATCH",
    bidIncrementStyle: "IPL_STANDARD_SLABS",
    requireApproval: false,
    acceleratedRounds: 1,
    allowUnsoldDiscount: false,
    unsoldDiscountPercentage: 50,
    pointSystem: "custom",
  },
  {
    id: "preset_blitz_15s",
    name: "Turbo 15s Blitz Draft",
    description: "High-adrenaline rapid bidding with 15-second countdowns, 50% unsold round discount, and flat 25 Lakh increments.",
    isDefault: true,
    createdBy: "BidChat Community",
    logoUrl: "/logos/ipl.png",
    totalPurse: 80.0,
    minSquadSize: 15,
    maxSquadSize: 20,
    maxOverseas: 6,
    timerDuration: 15,
    rtmEnabled: true,
    rtmCount: 3,
    rtmStyle: "ESCALATION_2025",
    bidIncrementStyle: "FLAT_25L",
    requireApproval: false,
    acceleratedRounds: 1,
    allowUnsoldDiscount: true,
    unsoldDiscountPercentage: 50,
    pointSystem: "none",
  },
  {
    id: "preset_college_league",
    name: "College Premier League",
    description: "Relaxed friendly draft format with 50 Cr budget, 2 accelerated rounds, and flexible squad sizes for club tournaments.",
    isDefault: true,
    createdBy: "BidChat Community",
    logoUrl: "/logos/ipl.png",
    totalPurse: 50.0,
    minSquadSize: 12,
    maxSquadSize: 18,
    maxOverseas: 4,
    timerDuration: 25,
    rtmEnabled: false,
    rtmCount: 0,
    rtmStyle: "CLASSIC_MATCH",
    bidIncrementStyle: "FREE_BID",
    requireApproval: true,
    acceleratedRounds: 2,
    allowUnsoldDiscount: true,
    unsoldDiscountPercentage: 50,
    pointSystem: "none",
  },
];

// Map 2025 JSON data into Player models
const parsedPlayers2025: Player[] = (ipl2025Data as any[]).map((p, idx) => ({
  id: p.id || `player_2025_${idx}`,
  name: p.name,
  role: (p.role === "BAT" || p.role === "BOWL" || p.role === "AR" || p.role === "WK") ? p.role : "AR",
  nationality: p.isOverseas ? "OS" : "IND",
  isCapped: p.isCapped ?? true,
  basePrice: p.basePrice || 2.0,
  prevSoldPrice: p.prevSoldPrice,
  prevTeam: p.prevTeam || undefined,
  cricinfoId: p.cricinfoId,
}));

// Map 2026 JSON data into Player models
const parsedPlayers2026: Player[] = (ipl2026Data as any[]).map((p, idx) => ({
  id: p.id || `player_2026_${idx}`,
  name: p.name,
  role: (p.role === "BAT" || p.role === "BOWL" || p.role === "AR" || p.role === "WK") ? p.role : "AR",
  nationality: p.isOverseas ? "OS" : "IND",
  isCapped: p.isCapped ?? true,
  basePrice: p.basePrice || 2.0,
  prevSoldPrice: p.prevSoldPrice,
  prevTeam: p.prevTeam || undefined,
  cricinfoId: p.cricinfoId,
}));

// Map Cycle (2025+26 Combined) JSON data into Player models
const parsedPlayersCycle: Player[] = (iplCycleData as any[]).map((p, idx) => ({
  id: p.id || `player_cycle_${idx}`,
  name: p.name,
  role: (p.role === "BAT" || p.role === "BOWL" || p.role === "AR" || p.role === "WK") ? p.role : "AR",
  nationality: p.isOverseas ? "OS" : "IND",
  isCapped: p.isCapped ?? true,
  basePrice: p.basePrice || 2.0,
  prevSoldPrice: p.prevSoldPrice,
  prevTeam: p.prevTeam || undefined,
  cricinfoId: p.cricinfoId,
  realAuctionStatus: p.realAuctionStatus,
}));

export const DEFAULT_ROSTERS: CustomRoster[] = [
  {
    id: "roster_ipl_2025_master",
    name: "IPL 2025 Official Roster",
    description: "Complete official 2025 player roster pool with authentic base prices, franchise retentions, and auction values.",
    isDefault: true,
    createdBy: "BCCI Official",
    logoUrl: "/logos/ipl.png",
    teams: DEFAULT_IPL_TEAMS,
    players: parsedPlayers2025,
    createdAt: "2025-01-15",
  },
  {
    id: "roster_ipl_2026_master",
    name: "IPL 2026 Official Roster",
    description: "Complete master player registry containing 500+ capped and uncapped cricketers with 2026 updated base prices.",
    isDefault: true,
    createdBy: "BCCI Official",
    logoUrl: "/logos/ipl.png",
    teams: DEFAULT_IPL_TEAMS,
    players: parsedPlayers2026,
    createdAt: "2026-01-15",
  },
  {
    id: "roster_ipl_cycle_2025_2026",
    name: "IPL 2025 Cycle (2025+26 Combined Roster)",
    description: "Complete multi-year cycle master registry combining 2025 auction outcomes and 2026 retentions.",
    isDefault: true,
    createdBy: "BCCI Official",
    logoUrl: "/logos/ipl.png",
    teams: DEFAULT_IPL_TEAMS,
    players: parsedPlayersCycle,
    createdAt: "2026-01-20",
  },
  {
    id: "roster_marquee_top50",
    name: "Marquee Star Pool (Top 40 Players)",
    description: "Curated fast set featuring Bumrah, Kohli, Rohit, Pant, Klaasen, Starc, Head, Cummins, Rashid and top superstars.",
    isDefault: true,
    createdBy: "BidChat Curated",
    logoUrl: "/logos/ipl.png",
    teams: DEFAULT_IPL_TEAMS,
    players: parsedPlayers2026.slice(0, 40),
    createdAt: "2026-02-01",
  }
];

// LocalStorage Persistence Helpers for Presets
export function getSavedPresets(): AuctionPreset[] {
  if (typeof window === "undefined") return DEFAULT_PRESETS;
  try {
    const raw = localStorage.getItem("bidchat-custom-presets");
    const userPresets: AuctionPreset[] = raw ? JSON.parse(raw) : [];
    // User custom presets first, then default presets
    return [...userPresets, ...DEFAULT_PRESETS];
  } catch (e) {
    return DEFAULT_PRESETS;
  }
}

export function saveCustomPreset(preset: AuctionPreset) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem("bidchat-custom-presets");
    const existing: AuctionPreset[] = raw ? JSON.parse(raw) : [];
    const filtered = existing.filter(p => p.id !== preset.id);
    const updated = [preset, ...filtered];
    localStorage.setItem("bidchat-custom-presets", JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
  } catch (e) {
    console.error("Error saving custom preset:", e);
  }
}

export function deleteCustomPreset(presetId: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem("bidchat-custom-presets");
    const existing: AuctionPreset[] = raw ? JSON.parse(raw) : [];
    const updated = existing.filter(p => p.id !== presetId);
    localStorage.setItem("bidchat-custom-presets", JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
  } catch (e) {
    console.error("Error deleting preset:", e);
  }
}

// LocalStorage Persistence Helpers for Rosters
export function getSavedRosters(): CustomRoster[] {
  if (typeof window === "undefined") return DEFAULT_ROSTERS;
  try {
    const raw = localStorage.getItem("bidchat-custom-rosters");
    const userRosters: CustomRoster[] = raw ? JSON.parse(raw) : [];
    // User custom rosters first, then defaults
    return [...userRosters, ...DEFAULT_ROSTERS];
  } catch (e) {
    return DEFAULT_ROSTERS;
  }
}

export function saveCustomRoster(roster: CustomRoster) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem("bidchat-custom-rosters");
    const existing: CustomRoster[] = raw ? JSON.parse(raw) : [];
    const filtered = existing.filter(r => r.id !== roster.id);
    const updated = [roster, ...filtered];
    localStorage.setItem("bidchat-custom-rosters", JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
  } catch (e) {
    console.error("Error saving custom roster:", e);
  }
}

export function deleteCustomRoster(rosterId: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem("bidchat-custom-rosters");
    const existing: CustomRoster[] = raw ? JSON.parse(raw) : [];
    const updated = existing.filter(r => r.id !== rosterId);
    localStorage.setItem("bidchat-custom-rosters", JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
  } catch (e) {
    console.error("Error deleting roster:", e);
  }
}

// Server-Side Share & Import API Helpers
export async function shareToServer(
  item: CustomRoster | AuctionPreset,
  type: "roster" | "preset"
): Promise<{ success: boolean; code?: string; error?: string }> {
  try {
    const res = await fetch("/api/rosters/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item, type }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || "Failed to save share code on server." };
    }
    return { success: true, code: data.code };
  } catch (e: any) {
    console.error("Network error sharing item:", e);
    return { success: false, error: e.message || "Network error" };
  }
}

export async function fetchSharedFromServer(
  code: string
): Promise<{ success: boolean; item?: any; type?: "roster" | "preset"; code?: string; error?: string }> {
  try {
    const cleanCode = encodeURIComponent(code.trim());
    const res = await fetch(`/api/rosters/share?code=${cleanCode}`);
    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || "Share code not found." };
    }
    return { success: true, item: data.item, type: data.type, code: data.code };
  } catch (e: any) {
    console.error("Network error fetching shared item:", e);
    return { success: false, error: e.message || "Network error" };
  }
}

