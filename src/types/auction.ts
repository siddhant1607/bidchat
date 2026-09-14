export type PlayerRole = "BAT" | "BOWL" | "AR" | "WK";

export type AuctionStatus = "LOBBY" | "ACTIVE" | "PAUSED" | "COMPLETED";

export interface Team {
  id: string;
  name: string;
  shortName: string; // e.g. CSK, MI, RCB
  logoUrl?: string;
  primaryColor: string; // Hex color
  secondaryColor?: string;
  accentColor?: string;
  purseRemaining: number; // in Crores
  totalSpent: number;
  squadCount: number;
  overseasCount: number;
  maxSquadSize?: number;
  maxOverseas?: number;
  ownerId?: string;
  ownerName?: string;
  players?: any[];
}

export interface Player {
  id: string;
  name: string;
  role: PlayerRole;
  nationality: "IND" | "OS";
  isCapped: boolean;
  basePrice: number; // in Crores (e.g. 2.0, 0.3)
  prevSoldPrice?: number;
  prevTeam?: string; // For RTM eligibility
  rating?: number; // Optional 1-100 rating
  realAuctionStatus?: "SOLD" | "UNSOLD";
  cricinfoId?: string;
  isAccelerated?: boolean;
  isRtmAvailable?: boolean;
  originalBasePrice?: number;
  discountApplied?: boolean;
}

export interface BidRecord {
  id: string;
  playerId: string;
  teamShortName: string;
  teamName: string;
  amount: number; // in Crores
  bidderName: string;
  timestamp: string;
}

export interface RTMState {
  isActive: boolean;
  player: Player;
  originalTeam: string; // Team that holds RTM rights
  winningBidderTeam: string; // Team that currently has highest bid
  currentBidAmount: number;
  stage: "PROMPT_ORIGINAL" | "ESCALATION_BIDDER" | "FINAL_ORIGINAL_MATCH" | "CONCLUDED";
  timerSeconds: number;
}

export interface ChatMessage {
  id: string;
  auctionId: string;
  senderId: string;
  senderName: string;
  text: string;
  teamShortName?: string;
  isWhisper: boolean;
  eventCard?: {
    type: "SOLD" | "UNSOLD" | "RTM_TRIGGERED" | "BID_WAR";
    playerName: string;
    teamName?: string;
    amount?: number;
    reactions?: Record<string, number>;
  };
  timestamp: string;
}

export interface BidIncrementSlab {
  tierName: string;
  minPriceCr: number;
  maxPriceCr: number;
  incrementCr: number;
}

export interface AuctionSettings {
  allowCustomBids: boolean; // default: false (Strict IPL Paddle Only)
  allowJumpBids: boolean;   // default: false
  bidSlabs: BidIncrementSlab[];
  acceleratedRounds?: number; // Number of accelerated rounds (default: 2)
  allowUnsoldDiscount?: boolean; // Toggle for discount on unsold round buys (default: false)
  unsoldDiscountPercentage?: number; // Discount % (default: 50%)
  pointSystem?: "espn" | "custom" | "none"; // Fantasy/MVP points system (default: espn)
}

export interface LiveAuctionState {
  auctionId: string;
  status: AuctionStatus;
  currentPlayer: Player | null;
  currentBid: number; // in Crores
  leadingTeam: Team | null;
  timerSeconds: number;
  bidHistory: BidRecord[];
  allTeams: Team[];
  rtmState: RTMState | null;
  isPaused: boolean;
  pointSystem?: "espn" | "custom" | "none";
  // Accelerated & Unsold Round Management
  isAcceleratedRound?: boolean;
  acceleratedRoundNumber?: number;
  totalAcceleratedRounds?: number;
  allowUnsoldDiscount?: boolean;
  unsoldDiscountPercentage?: number;
  unsoldPool?: Player[];
  callForNominationsOpen?: boolean;
  nominatedPlayerIds?: string[];
  nominationsByTeam?: Record<string, string[]>;
}

export interface AuctionPreset {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  createdBy: string;
  logoUrl?: string; // Preset icon/logo (e.g. /logos/ipl.png)
  totalPurse: number; // in Crores
  minSquadSize: number;
  maxSquadSize: number;
  maxOverseas: number;
  timerDuration: number; // in seconds
  rtmEnabled: boolean;
  rtmCount: number;
  rtmStyle: "ESCALATION_2025" | "CLASSIC_MATCH";
  bidIncrementStyle: "IPL_STANDARD_SLABS" | "FLAT_25L" | "FREE_BID";
  requireApproval: boolean;
  acceleratedRounds?: number; // Number of accelerated rounds (default: 2)
  allowUnsoldDiscount?: boolean; // Toggle for discount on unsold round buys
  unsoldDiscountPercentage?: number; // Discount % (default: 50%)
  pointSystem?: "espn" | "custom" | "none"; // Point system: "espn" | "custom" | "none"
}

export interface CustomRosterTeam {
  id: string;
  name: string;
  shortName: string;
  primaryColor: string;
  purseCr: number;
  logoUrl?: string;
}

export interface CustomRoster {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  createdBy: string;
  logoUrl?: string; // Roster icon/logo (e.g. /logos/ipl.png)
  teams: CustomRosterTeam[];
  players: Player[];
  createdAt?: string;
}

