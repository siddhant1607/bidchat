import { Player, Team, BidRecord, LiveAuctionState, AuctionSettings, BidIncrementSlab } from '@/types/auction';
import { DEFAULT_IPL_BID_SLABS } from './auctionRules';

export interface AuctionInstance {
  id: string;
  chatId: string;
  state: LiveAuctionState;
  settings: AuctionSettings;
  playerPool: Player[];
  currentPlayerIndex: number;
  soldPlayers: Map<string, { player: Player; team: Team; price: number }>;
  unsoldPlayers: Player[];
}

// In-memory store of active auctions
const activeAuctions = new Map<string, AuctionInstance>();

export function createAuction(
  auctionId: string,
  chatId: string,
  teams: Team[],
  playerPool: Player[],
  settings?: Partial<AuctionSettings>
): AuctionInstance {
  const instance: AuctionInstance = {
    id: auctionId,
    chatId,
    state: {
      auctionId,
      status: 'LOBBY',
      currentPlayer: null,
      currentBid: 0,
      leadingTeam: null,
      timerSeconds: 30,
      bidHistory: [],
      allTeams: teams,
      rtmState: null,
      isPaused: false,
    },
    settings: {
      allowCustomBids: false,
      allowJumpBids: false,
      bidSlabs: DEFAULT_IPL_BID_SLABS,
      ...settings,
    },
    playerPool,
    currentPlayerIndex: -1,
    soldPlayers: new Map(),
    unsoldPlayers: [],
  };
  activeAuctions.set(auctionId, instance);
  return instance;
}

export function getAuction(auctionId: string): AuctionInstance | undefined {
  return activeAuctions.get(auctionId);
}

export function startAuction(auctionId: string): LiveAuctionState | null {
  const auction = activeAuctions.get(auctionId);
  if (!auction) return null;
  auction.state.status = 'ACTIVE';
  return nextPlayer(auctionId);
}

export function nextPlayer(auctionId: string): LiveAuctionState | null {
  const auction = activeAuctions.get(auctionId);
  if (!auction) return null;

  auction.currentPlayerIndex++;
  if (auction.currentPlayerIndex >= auction.playerPool.length) {
    auction.state.status = 'COMPLETED';
    auction.state.currentPlayer = null;
    return auction.state;
  }

  const player = auction.playerPool[auction.currentPlayerIndex];
  auction.state.currentPlayer = player;
  auction.state.currentBid = player.basePrice;
  auction.state.leadingTeam = null;
  auction.state.bidHistory = [];
  auction.state.timerSeconds = 30;
  auction.state.rtmState = null;
  return auction.state;
}

export function getNextBidAmount(currentBid: number, slabs: BidIncrementSlab[]): number {
  for (const slab of slabs) {
    if (currentBid >= slab.minPriceCr && currentBid < slab.maxPriceCr) {
      return parseFloat((currentBid + slab.incrementCr).toFixed(2));
    }
  }
  // Fallback: +0.25 Cr
  return parseFloat((currentBid + 0.25).toFixed(2));
}

export interface BidResult {
  success: boolean;
  error?: string;
  newState?: LiveAuctionState;
}

export function placeBid(
  auctionId: string,
  teamId: string,
  bidderId: string,
  bidderName: string
): BidResult {
  const auction = activeAuctions.get(auctionId);
  if (!auction) return { success: false, error: 'Auction not found' };
  if (auction.state.status !== 'ACTIVE') return { success: false, error: 'Auction not active' };
  if (!auction.state.currentPlayer) return { success: false, error: 'No player on podium' };

  const team = auction.state.allTeams.find(t => t.id === teamId);
  if (!team) return { success: false, error: 'Team not found' };

  // Calculate next bid
  const nextBid = auction.state.leadingTeam
    ? getNextBidAmount(auction.state.currentBid, auction.settings.bidSlabs)
    : auction.state.currentPlayer.basePrice;

  // Validate purse
  if (nextBid > team.purseRemaining) {
    return { success: false, error: 'Insufficient purse' };
  }

  // Apply bid
  auction.state.currentBid = nextBid;
  auction.state.leadingTeam = team;
  auction.state.timerSeconds = 30; // Reset timer

  const bidRecord: BidRecord = {
    id: `bid_${Date.now()}`,
    playerId: auction.state.currentPlayer.id,
    teamShortName: team.shortName,
    teamName: team.name,
    amount: nextBid,
    bidderName,
    timestamp: new Date().toISOString(),
  };
  auction.state.bidHistory.push(bidRecord);

  return { success: true, newState: { ...auction.state } };
}

export function sellPlayer(auctionId: string): { player: Player; team: Team; price: number } | null {
  const auction = activeAuctions.get(auctionId);
  if (!auction || !auction.state.currentPlayer || !auction.state.leadingTeam) return null;

  const player = auction.state.currentPlayer;
  const team = auction.state.leadingTeam;
  const price = auction.state.currentBid;

  // Update team purse
  team.purseRemaining = parseFloat((team.purseRemaining - price).toFixed(2));
  team.totalSpent = parseFloat((team.totalSpent + price).toFixed(2));
  team.squadCount++;
  if (player.nationality === 'OS') team.overseasCount++;

  auction.soldPlayers.set(player.id, { player, team, price });
  return { player, team, price };
}

export function markUnsold(auctionId: string): Player | null {
  const auction = activeAuctions.get(auctionId);
  if (!auction || !auction.state.currentPlayer) return null;

  const player = auction.state.currentPlayer;
  auction.unsoldPlayers.push(player);
  return player;
}

export function removeAuction(auctionId: string) {
  activeAuctions.delete(auctionId);
}
