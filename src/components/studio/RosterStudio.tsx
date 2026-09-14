"use client";

import React, { useState, useEffect } from "react";
import { Menu, 
  Download,
  UploadCloud,
  Loader2,
  SlidersHorizontal, 
  Layers, 
  Plus, 
  Share2, 
  Trash2, 
  Copy, 
  Check, 
  Edit3, 
  Search, 
  Users, 
  Gavel, 
  Shield, 
  Clock, 
  DollarSign, 
  Sparkles, 
  ArrowLeft, 
  Send 
} from "lucide-react";
import { AuctionPreset, CustomRoster, Player, CustomRosterTeam } from "@/types/auction";
import { 
  getSavedPresets, 
  saveCustomPreset, 
  deleteCustomPreset, 
  getSavedRosters, 
  saveCustomRoster, 
  deleteCustomRoster,
  DEFAULT_IPL_TEAMS,
  shareToServer,
  fetchSharedFromServer
} from "@/lib/presetData";

interface RosterStudioProps {
  onStartAuctionWithPreset?: (preset: AuctionPreset, roster?: CustomRoster) => void;
  onShareToChat?: (itemType: "preset" | "roster", item: AuctionPreset | CustomRoster, targetChatId: string, shareCode?: string) => void;
  onOpenMenu?: () => void;
}


const POPULAR_COLORS = [
  { label: "CSK Gold", hex: "#FDB913" },
  { label: "MI Blue", hex: "#004BA0" },
  { label: "RCB Crimson", hex: "#DA1818" },
  { label: "KKR Purple", hex: "#3A225D" },
  { label: "SRH Orange", hex: "#F26522" },
  { label: "DC Cyan", hex: "#0078BC" },
  { label: "RR Pink", hex: "#EA1A85" },
  { label: "GT Navy", hex: "#1C2B4B" },
  { label: "LSG Sky", hex: "#005696" },
  { label: "PBKS Red", hex: "#ED1B24" },
  { label: "Teal Green", hex: "#0D9488" },
  { label: "Emerald", hex: "#10B981" },
  { label: "Royal Blue", hex: "#2563EB" },
  { label: "Indigo", hex: "#4F46E5" },
  { label: "Deep Violet", hex: "#6D28D9" },
  { label: "Charcoal", hex: "#334155" },
];

const CLASSIC_FRANCHISES = [
  { name: "Deccan Chargers", shortName: "DCH", primaryColor: "#2F4F4F", purseCr: 120 },
  { name: "Rising Pune Supergiant", shortName: "RPS", primaryColor: "#7B1FA2", purseCr: 120 },
  { name: "Pune Warriors India", shortName: "PWI", primaryColor: "#532380", purseCr: 120 },
  { name: "Gujarat Lions", shortName: "GL", primaryColor: "#E04F16", purseCr: 120 },
  { name: "Kochi Tuskers Kerala", shortName: "KTK", primaryColor: "#4D2177", purseCr: 120 },
  { name: "Delhi Daredevils", shortName: "DD", primaryColor: "#00008B", purseCr: 120 },
];

export const DEFAULT_LOGO_OPTIONS = [
  { label: "IPL Official", url: "/logos/ipl.png" },
  { label: "CSK", url: "/logos/CSK.png" },
  { label: "MI", url: "/logos/MI.png" },
  { label: "RCB", url: "/logos/RCB.png" },
  { label: "KKR", url: "/logos/KKR.png" },
  { label: "SRH", url: "/logos/SRH.png" },
  { label: "DC", url: "/logos/DC.png" },
  { label: "RR", url: "/logos/RR.png" },
  { label: "GT", url: "/logos/GT.png" },
  { label: "LSG", url: "/logos/LSG.png" },
  { label: "PBKS", url: "/logos/PBKS.png" },
];

export default function RosterStudio({ onStartAuctionWithPreset, onShareToChat, onOpenMenu }: RosterStudioProps) {
  // Main Studio Mode: "presets" vs "rosters"
  const [activeTab, setActiveTab] = useState<"presets" | "rosters">("presets");

  // Presets State
  const [presets, setPresets] = useState<AuctionPreset[]>([]);
  const [presetFilter, setPresetFilter] = useState<"all" | "custom" | "official">("all");
  const [isCreatingPreset, setIsCreatingPreset] = useState(false);

  // Rosters State
  const [rosters, setRosters] = useState<CustomRoster[]>([]);
  const [rosterFilter, setRosterFilter] = useState<"all" | "custom" | "official">("all");
  const [editingRoster, setEditingRoster] = useState<CustomRoster | null>(null);
  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    isOpen: boolean;
    type: "roster" | "preset" | "team";
    id: string;
    name: string;
    details?: string;
  } | null>(null);

  // Roster Editor Internal State
  const [editorSubTab, setEditorSubTab] = useState<"players" | "teams">("players");
  const [playerSearch, setPlayerSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [natFilter, setNatFilter] = useState<string>("ALL");
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  // Franchise Editing State
  const [editingTeam, setEditingTeam] = useState<CustomRosterTeam | null>(null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isCreatingNewTeam, setIsCreatingNewTeam] = useState(false);
  const [teamFormName, setTeamFormName] = useState("");
  const [teamFormShortName, setTeamFormShortName] = useState("");
  const [teamFormPurse, setTeamFormPurse] = useState(120);
  const [teamFormColor, setTeamFormColor] = useState("#2563EB");

  // New Player Form State
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerRole, setNewPlayerRole] = useState<"BAT" | "BOWL" | "AR" | "WK">("BAT");
  const [newPlayerNat, setNewPlayerNat] = useState<"IND" | "OS">("IND");
  const [newPlayerBasePrice, setNewPlayerBasePrice] = useState(2.0);

  // Preset Creator Form State
  const [newPresetName, setNewPresetName] = useState("");
  const [newPresetDesc, setNewPresetDesc] = useState("");
  const [newPresetLogo, setNewPresetLogo] = useState("/logos/ipl.png");
  const [newPresetPurse, setNewPresetPurse] = useState(120.0);
  const [newPresetMinSquad, setNewPresetMinSquad] = useState(18);
  const [newPresetMaxSquad, setNewPresetMaxSquad] = useState(25);
  const [newPresetMaxOS, setNewPresetMaxOS] = useState(8);
  const [newPresetTimer, setNewPresetTimer] = useState(30);
  const [newPresetRtm, setNewPresetRtm] = useState(true);
  const [newPresetRtmCount, setNewPresetRtmCount] = useState(6);
  const [newPresetRtmStyle, setNewPresetRtmStyle] = useState<"ESCALATION_2025" | "CLASSIC_MATCH">("ESCALATION_2025");
  const [newPresetSlabs, setNewPresetSlabs] = useState<"IPL_STANDARD_SLABS" | "FLAT_25L" | "FREE_BID">("IPL_STANDARD_SLABS");
  const [newPresetApproval, setNewPresetApproval] = useState(false);
  const [newPresetAcceleratedRounds, setNewPresetAcceleratedRounds] = useState(2);
  const [newPresetAllowDiscount, setNewPresetAllowDiscount] = useState(false);
  const [newPresetDiscountPct, setNewPresetDiscountPct] = useState(50);
  const [newPresetPointSystem, setNewPresetPointSystem] = useState<"espn" | "custom" | "none">("espn");

  // Sharing Modal
  const [sharingItem, setSharingItem] = useState<{ type: "preset" | "roster"; data: AuctionPreset | CustomRoster } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  // Server Sharing & Import State
  const [generatedShareCode, setGeneratedShareCode] = useState<string | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [copiedCodeToast, setCopiedCodeToast] = useState(false);

  // Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importType, setImportType] = useState<"roster" | "preset">("roster");
  const [importCodeInput, setImportCodeInput] = useState("");
  const [isFetchingImport, setIsFetchingImport] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [fetchedImportItem, setFetchedImportItem] = useState<any | null>(null);


  // Load Data on Mount
  useEffect(() => {
    loadData();
    const handleStorage = () => loadData();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const loadData = () => {
    setPresets(getSavedPresets());
    setRosters(getSavedRosters());
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtered Presets (Saved custom presets shown first!)
  const filteredPresets = presets.filter(p => {
    if (presetFilter === "custom") return !p.isDefault;
    if (presetFilter === "official") return p.isDefault;
    return true;
  });

  // Filtered Rosters
  const filteredRosters = rosters.filter(r => {
    if (rosterFilter === "custom") return !r.isDefault;
    if (rosterFilter === "official") return r.isDefault;
    return true;
  });

  // Handle Save New Preset
  const handleSavePreset = () => {
    if (!newPresetName.trim()) {
      showToast("Please enter a preset name");
      return;
    }

    const customPreset: AuctionPreset = {
      id: `preset_${Date.now()}`,
      name: newPresetName.trim(),
      description: newPresetDesc.trim() || "Custom tournament auction rules created by user.",
      isDefault: false,
      createdBy: "You",
      logoUrl: newPresetLogo,
      totalPurse: newPresetPurse,
      minSquadSize: newPresetMinSquad,
      maxSquadSize: newPresetMaxSquad,
      maxOverseas: newPresetMaxOS,
      timerDuration: newPresetTimer,
      rtmEnabled: newPresetRtm,
      rtmCount: newPresetRtmCount,
      rtmStyle: newPresetRtmStyle,
      bidIncrementStyle: newPresetSlabs,
      requireApproval: newPresetApproval,
      acceleratedRounds: newPresetAcceleratedRounds,
      allowUnsoldDiscount: newPresetAllowDiscount,
      unsoldDiscountPercentage: newPresetDiscountPct,
      pointSystem: newPresetPointSystem,
    };

    saveCustomPreset(customPreset);
    loadData();
    setIsCreatingPreset(false);
    showToast("Preset saved to your account! Available in auction creator.");
  };

  // Handle Delete Preset (App Modal)
  const handleDeletePreset = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmState({
      isOpen: true,
      type: "preset",
      id,
      name,
      details: "This custom auction preset will be permanently removed from your account.",
    });
  };

  const handleConfirmDeleteAction = () => {
    if (!deleteConfirmState) return;

    if (deleteConfirmState.type === "roster") {
      deleteCustomRoster(deleteConfirmState.id);
      loadData();
      showToast(`Deleted custom roster "${deleteConfirmState.name}".`);
    } else if (deleteConfirmState.type === "preset") {
      deleteCustomPreset(deleteConfirmState.id);
      loadData();
      showToast(`Deleted custom preset "${deleteConfirmState.name}".`);
    } else if (deleteConfirmState.type === "team") {
      if (editingRoster) {
        const updatedTeams = editingRoster.teams.filter(t => t.id !== deleteConfirmState.id);
        const updatedRoster: CustomRoster = {
          ...editingRoster,
          teams: updatedTeams,
        };
        setEditingRoster(updatedRoster);
        saveCustomRoster(updatedRoster);
        loadData();
        showToast(`Removed franchise "${deleteConfirmState.name}".`);
      }
    }

    setDeleteConfirmState(null);
  };

  // Duplicate an official roster to customize
  const handleDuplicateRoster = (source: CustomRoster) => {
    const duplicated: CustomRoster = {
      ...source,
      id: `roster_custom_${Date.now()}`,
      name: `${source.name} (Custom Copy)`,
      description: `Personal custom version of ${source.name}. Editable teams & players.`,
      isDefault: false,
      createdBy: "You",
      createdAt: new Date().toISOString().split("T")[0],
    };
    saveCustomRoster(duplicated);
    loadData();
    setEditingRoster(duplicated);
    showToast("Roster duplicated! You can now customize all players and teams.");
  };

  // Add Custom Player to Editing Roster
  const handleAddCustomPlayer = () => {
    if (!newPlayerName.trim() || !editingRoster) return;

    const newPlayer: Player = {
      id: `p_custom_${Date.now()}`,
      name: newPlayerName.trim(),
      role: newPlayerRole,
      nationality: newPlayerNat,
      basePrice: newPlayerBasePrice,
      isCapped: true,
      rating: 85,
    };

    const updatedRoster: CustomRoster = {
      ...editingRoster,
      players: [newPlayer, ...editingRoster.players],
    };

    setEditingRoster(updatedRoster);
    saveCustomRoster(updatedRoster);
    loadData();
    setIsAddingPlayer(false);
    setNewPlayerName("");
    showToast(`Added ${newPlayer.name} to roster pool!`);
  };

  
  // Team Management Handlers
  const handleOpenEditTeam = (team: CustomRosterTeam) => {
    setEditingTeam(team);
    setIsCreatingNewTeam(false);
    setTeamFormName(team.name);
    setTeamFormShortName(team.shortName);
    setTeamFormPurse(team.purseCr);
    setTeamFormColor(team.primaryColor);
    setIsTeamModalOpen(true);
  };

  const handleOpenAddTeam = () => {
    setEditingTeam(null);
    setIsCreatingNewTeam(true);
    setTeamFormName("");
    setTeamFormShortName("");
    setTeamFormPurse(120);
    setTeamFormColor("#2563EB");
    setIsTeamModalOpen(true);
  };

  const handleSelectClassicTemplate = (template: typeof CLASSIC_FRANCHISES[0]) => {
    setTeamFormName(template.name);
    setTeamFormShortName(template.shortName);
    setTeamFormColor(template.primaryColor);
    setTeamFormPurse(template.purseCr);
  };

  const handleSaveTeam = () => {
    if (!editingRoster) return;
    if (!teamFormName.trim()) {
      showToast("Please enter a franchise name");
      return;
    }
    const cleanShort = (teamFormShortName.trim() || teamFormName.trim().substring(0, 3)).toUpperCase();

    let updatedTeams: CustomRosterTeam[];
    if (isCreatingNewTeam) {
      const newTeam: CustomRosterTeam = {
        id: `team_${Date.now()}`,
        name: teamFormName.trim(),
        shortName: cleanShort,
        primaryColor: teamFormColor,
        purseCr: teamFormPurse,
      };
      updatedTeams = [...editingRoster.teams, newTeam];
      showToast(`Added franchise "${newTeam.name}"!`);
    } else if (editingTeam) {
      updatedTeams = editingRoster.teams.map(t => 
        t.id === editingTeam.id 
          ? { ...t, name: teamFormName.trim(), shortName: cleanShort, primaryColor: teamFormColor, purseCr: teamFormPurse }
          : t
      );
      showToast(`Updated franchise "${teamFormName.trim()}"!`);
    } else {
      return;
    }

    const updatedRoster: CustomRoster = {
      ...editingRoster,
      teams: updatedTeams,
    };

    setEditingRoster(updatedRoster);
    saveCustomRoster(updatedRoster);
    loadData();
    setIsTeamModalOpen(false);
  };

  const handleDeleteTeam = (teamId: string, teamName: string) => {
    if (!editingRoster) return;
    if (editingRoster.teams.length <= 2) {
      showToast("An auction requires at least 2 participating franchises.");
      return;
    }
    setDeleteConfirmState({
      isOpen: true,
      type: "team",
      id: teamId,
      name: teamName,
      details: "This franchise will be removed from your custom roster pool.",
    });
  };

  // Delete Player from Editing Roster
  const handleDeletePlayer = (playerId: string) => {
    if (!editingRoster) return;
    const updatedPlayers = editingRoster.players.filter(p => p.id !== playerId);
    const updatedRoster: CustomRoster = {
      ...editingRoster,
      players: updatedPlayers,
    };
    setEditingRoster(updatedRoster);
    saveCustomRoster(updatedRoster);
    loadData();
  };

  
  // Open Share Modal & Save to Server for Compact Code
  const handleOpenShare = async (type: "preset" | "roster", data: AuctionPreset | CustomRoster) => {
    setSharingItem({ type, data });
    setGeneratedShareCode(null);
    setIsGeneratingCode(true);
    setCopiedCodeToast(false);

    try {
      const res = await shareToServer(data, type);
      if (res.success && res.code) {
        setGeneratedShareCode(res.code);
      } else {
        setGeneratedShareCode(type === "roster" ? "BCR-LOCAL" : "BCP-LOCAL");
      }
    } catch (e) {
      setGeneratedShareCode(type === "roster" ? "BCR-LOCAL" : "BCP-LOCAL");
    } finally {
      setIsGeneratingCode(false);
    }
  };

  // Open Import Modal
  const handleOpenImportModal = (type: "roster" | "preset") => {
    setImportType(type);
    setImportCodeInput("");
    setImportError(null);
    setFetchedImportItem(null);
    setIsImportModalOpen(true);
  };

  // Fetch Shared Item from Server by Code
  const handleFetchSharedCode = async () => {
    if (!importCodeInput.trim()) return;
    setIsFetchingImport(true);
    setImportError(null);
    setFetchedImportItem(null);

    try {
      const res = await fetchSharedFromServer(importCodeInput.trim());
      if (res.success && res.item) {
        setFetchedImportItem(res.item);
      } else {
        setImportError(res.error || "Share code not found on server.");
      }
    } catch (e: any) {
      setImportError("Network error contacting server.");
    } finally {
      setIsFetchingImport(false);
    }
  };

  // Confirm Import
  const handleConfirmImport = () => {
    if (!fetchedImportItem) return;

    if (importType === "roster" || fetchedImportItem.players) {
      const importedRoster: CustomRoster = {
        ...fetchedImportItem,
        id: `roster_imp_${Date.now()}`,
        name: fetchedImportItem.name.includes("(Imported)") ? fetchedImportItem.name : `${fetchedImportItem.name} (Imported)`,
        isDefault: false,
        createdBy: `Shared (${fetchedImportItem.createdBy || "Friend"})`,
        createdAt: new Date().toISOString().split("T")[0],
      };
      saveCustomRoster(importedRoster);
      loadData();
      showToast(`Successfully imported "${importedRoster.name}"!`);
      setIsImportModalOpen(false);
      setEditingRoster(importedRoster);
    } else {
      const importedPreset: AuctionPreset = {
        ...fetchedImportItem,
        id: `preset_imp_${Date.now()}`,
        name: fetchedImportItem.name.includes("(Imported)") ? fetchedImportItem.name : `${fetchedImportItem.name} (Imported)`,
        isDefault: false,
        createdBy: `Shared (${fetchedImportItem.createdBy || "Friend"})`,
      };
      saveCustomPreset(importedPreset);
      loadData();
      showToast(`Successfully imported preset "${importedPreset.name}"!`);
      setIsImportModalOpen(false);
    }
  };

  // Import from Local File
  const handleFileUploadImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const actualItem = parsed.item || parsed.data || parsed;
        if (actualItem && actualItem.name) {
          setFetchedImportItem(actualItem);
          setImportError(null);
        } else {
          setImportError("Uploaded file does not contain valid roster format.");
        }
      } catch (err) {
        setImportError("Failed to parse JSON file. Please check file format.");
      }
    };
    reader.readAsText(file);
  };

  // Send Preset or Roster to Chat
  const handleSendToChat = (chatId: string, chatName: string) => {
    if (!sharingItem) return;

    if (onShareToChat) {
      onShareToChat(sharingItem.type, sharingItem.data, chatId, generatedShareCode || undefined);
    }

    setSharingItem(null);
    showToast(`Shared "${sharingItem.data.name}" directly to ${chatName}!`);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FDFCFB] dark:bg-[#121212] overflow-hidden">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2 rounded-full bg-blue-600 text-white text-xs font-bold shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Roster Editor View (When active) */}
      {editingRoster ? (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Editor Header */}
          <header className="h-16 px-6 border-b border-slate-200 dark:border-[#2A2A2A] flex items-center justify-between shrink-0 bg-white/60 dark:bg-[#1A1A1A]/60 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setEditingRoster(null)}
                className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-[#2A2A2A] text-slate-600 dark:text-slate-400 transition-colors"
                title="Back to Rosters"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-lg font-bold tracking-tight">{editingRoster.name}</h2>
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <span>{editingRoster.players.length} Players</span>
                  <span>•</span>
                  <span>{editingRoster.teams.length} Franchises</span>
                  <span>•</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">Custom Roster</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {editorSubTab === "players" ? (
                <button
                  onClick={() => setIsAddingPlayer(true)}
                  className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Player</span>
                </button>
              ) : (
                <button
                  onClick={handleOpenAddTeam}
                  className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Franchise</span>
                </button>
              )}
            </div>
          </header>

          {/* Editor Sub-Tabs */}
          <div className="px-6 py-3 border-b border-slate-200 dark:border-[#2A2A2A] bg-slate-50/50 dark:bg-[#161616] flex items-center justify-between shrink-0">
            <div className="flex gap-2">
              <button
                onClick={() => setEditorSubTab("players")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  editorSubTab === "players"
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm"
                    : "bg-slate-200/60 dark:bg-[#2A2A2A] text-slate-600 dark:text-slate-400 hover:bg-slate-300"
                }`}
              >
                Players Pool ({editingRoster.players.length})
              </button>
              <button
                onClick={() => setEditorSubTab("teams")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  editorSubTab === "teams"
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm"
                    : "bg-slate-200/60 dark:bg-[#2A2A2A] text-slate-600 dark:text-slate-400 hover:bg-slate-300"
                }`}
              >
                Participating Franchises ({editingRoster.teams.length})
              </button>
            </div>

            {/* Quick Player Filters */}
            {editorSubTab === "players" && (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search cricketers..."
                    value={playerSearch}
                    onChange={(e) => setPlayerSearch(e.target.value)}
                    className="pl-8 pr-3 py-1 rounded-full bg-white dark:bg-[#2A2A2A] border border-slate-200 dark:border-transparent text-xs outline-none focus:ring-1 focus:ring-blue-500 w-48"
                  />
                </div>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-2.5 py-1 rounded-full bg-white dark:bg-[#2A2A2A] border border-slate-200 dark:border-transparent text-xs font-bold outline-none"
                >
                  <option value="ALL">All Roles</option>
                  <option value="BAT">Batsman</option>
                  <option value="BOWL">Bowler</option>
                  <option value="AR">All-Rounder</option>
                  <option value="WK">Wicketkeeper</option>
                </select>
              </div>
            )}
          </div>

          {/* Editor Body */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {editorSubTab === "players" ? (
              <div className="max-w-4xl mx-auto space-y-2">
                {editingRoster.players
                  .filter(p => p.name.toLowerCase().includes(playerSearch.toLowerCase()))
                  .filter(p => roleFilter === "ALL" || p.role === roleFilter)
                  .map((player) => (
                    <div 
                      key={player.id}
                      className="p-3.5 rounded-2xl bg-white dark:bg-[#1E1E1E] border border-slate-100 dark:border-transparent shadow-sm flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center shrink-0">
                          {player.role}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-sm truncate">{player.name}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2">
                            <span>{player.nationality === "OS" ? "✈️ Overseas" : "🇮🇳 Indian"}</span>
                            <span>•</span>
                            <span>Prev: {player.prevTeam || "New Entrant"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <div className="text-[10px] text-slate-400 uppercase font-bold">Base Price</div>
                          <div className="text-sm font-black text-blue-600 dark:text-blue-400">₹{player.basePrice} Cr</div>
                        </div>
                        <button
                          onClick={() => handleDeletePlayer(player.id)}
                          className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-500 transition-colors"
                          title="Remove from roster"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              /* Teams Tab */
              <div className="max-w-4xl mx-auto space-y-4">
                {/* Header Description & Count */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Participating Teams & Starting Purses ({editingRoster.teams.length})
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Change franchise names, short codes, team colors, and budget allocations for this tournament pool.
                    </p>
                  </div>
                  <button
                    onClick={handleOpenAddTeam}
                    className="self-start sm:self-auto px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Franchise</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {editingRoster.teams.map((team) => (
                    <div 
                      key={team.id} 
                      className="p-4 rounded-[22px] bg-white dark:bg-[#1E1E1E] border border-slate-200/80 dark:border-[#2A2A2A] shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Team Avatar Badge */}
                        <div 
                          className="w-12 h-12 rounded-2xl text-white font-black text-sm flex items-center justify-center shrink-0 shadow-md transition-transform group-hover:scale-105"
                          style={{ backgroundColor: team.primaryColor }}
                        >
                          {team.shortName}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{team.name}</h4>
                            <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-[#2A2A2A] text-[10px] font-bold text-slate-600 dark:text-slate-300">
                              {team.shortName}
                            </span>
                          </div>
                          <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                            Purse: ₹{team.purseCr} Cr
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleOpenEditTeam(team)}
                          className="p-2 rounded-xl bg-slate-100 dark:bg-[#2A2A2A] hover:bg-blue-100 dark:hover:bg-blue-900/30 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors"
                          title={`Edit ${team.name}`}
                          aria-label="Edit team"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTeam(team.id, team.name)}
                          className="p-2 rounded-xl bg-slate-100 dark:bg-[#2A2A2A] hover:bg-red-100 dark:hover:bg-red-950/40 text-slate-400 hover:text-red-500 transition-colors"
                          title={`Remove ${team.name}`}
                          aria-label="Remove team"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add Franchise Dashed Card */}
                  <button
                    onClick={handleOpenAddTeam}
                    className="p-4 rounded-[22px] border-2 border-dashed border-slate-300 dark:border-[#2A2A2A] hover:border-blue-500 dark:hover:border-blue-500/60 bg-slate-50/50 dark:bg-[#1A1A1A]/50 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-all flex items-center justify-center gap-3 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-bold text-sm min-h-[76px]"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <Plus className="w-4 h-4" />
                    </div>
                    <span>Add New Franchise</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Normal Studio View (Tabs for Presets vs Rosters) */
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Main Studio Header */}
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
                <h1 className="text-xl font-bold tracking-tight">Presets & Rosters Studio</h1>
                <p className="text-xs text-slate-500">Create, customize, and share tournament formats and player pools</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {activeTab === "presets" ? (
                <>
                  <button 
                    onClick={() => handleOpenImportModal("preset")}
                    className="px-3.5 py-2 rounded-full bg-slate-100 dark:bg-[#2A2A2A] hover:bg-slate-200 dark:hover:bg-[#333] text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Import Preset</span>
                  </button>
                  <button 
                    onClick={() => setIsCreatingPreset(true)}
                    className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Preset</span>
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => handleOpenImportModal("roster")}
                    className="px-3.5 py-2 rounded-full bg-slate-100 dark:bg-[#2A2A2A] hover:bg-slate-200 dark:hover:bg-[#333] text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Import Roster</span>
                  </button>
                  <button 
                    onClick={() => handleDuplicateRoster(rosters[0])}
                    className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Create Custom Roster</span>
                    <span className="sm:hidden">New Roster</span>
                  </button>
                </>
              )}
            </div>
          </header>

          {/* Top Segment Switcher (Auction Presets vs Custom Rosters) */}
          <div className="px-6 sm:px-8 py-3.5 border-b border-slate-200 dark:border-[#2A2A2A] bg-slate-50/50 dark:bg-[#161616] flex items-center justify-between shrink-0">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("presets")}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === "presets"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-200/60 dark:bg-[#2A2A2A] text-slate-600 dark:text-slate-400 hover:bg-slate-300"
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Auction Presets ({presets.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("rosters")}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === "rosters"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-200/60 dark:bg-[#2A2A2A] text-slate-600 dark:text-slate-400 hover:bg-slate-300"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Roster Pools ({rosters.length})</span>
              </button>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => activeTab === "presets" ? setPresetFilter("all") : setRosterFilter("all")}
                className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                  (activeTab === "presets" ? presetFilter === "all" : rosterFilter === "all")
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                    : "bg-slate-100 dark:bg-[#2A2A2A] text-slate-500 hover:bg-slate-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => activeTab === "presets" ? setPresetFilter("custom") : setRosterFilter("custom")}
                className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                  (activeTab === "presets" ? presetFilter === "custom" : rosterFilter === "custom")
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                    : "bg-slate-100 dark:bg-[#2A2A2A] text-slate-500 hover:bg-slate-200"
                }`}
              >
                My Saved
              </button>
              <button
                onClick={() => activeTab === "presets" ? setPresetFilter("official") : setRosterFilter("official")}
                className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                  (activeTab === "presets" ? presetFilter === "official" : rosterFilter === "official")
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                    : "bg-slate-100 dark:bg-[#2A2A2A] text-slate-500 hover:bg-slate-200"
                }`}
              >
                Official Defaults
              </button>
            </div>
          </div>

          {/* Main Grid View */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
            <div className="max-w-4xl mx-auto">
              
              {/* PRESETS LIST */}
              {activeTab === "presets" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredPresets.map((preset) => (
                    <div 
                      key={preset.id}
                      className={`p-6 rounded-[28px] bg-white dark:bg-[#1E1E1E] border transition-all flex flex-col justify-between gap-4 shadow-sm ${
                        !preset.isDefault 
                          ? "border-blue-400/80 dark:border-blue-500/30" 
                          : "border-slate-100 dark:border-transparent"
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                            !preset.isDefault
                              ? "bg-blue-50 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300"
                              : "bg-slate-100 dark:bg-[#2A2A2A] text-slate-500"
                          }`}>
                            {!preset.isDefault ? "★ My Saved Preset" : "Official Preset"}
                          </span>
                          <span className="text-xs text-slate-400">By {preset.createdBy}</span>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-[#252525] border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden p-1 shrink-0 shadow-xs">
                            <img src={preset.logoUrl || "/logos/ipl.png"} alt={preset.name} className="w-full h-full object-contain" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-base text-slate-900 dark:text-white truncate">{preset.name}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">{preset.description}</p>
                          </div>
                        </div>

                        {/* Rules Metrics Badges */}
                        <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                          <div className="p-2 rounded-2xl bg-slate-50 dark:bg-[#252525]">
                            <div className="text-[10px] text-slate-400 uppercase font-bold">Purse</div>
                            <div className="text-xs font-black text-blue-600 dark:text-blue-400">₹{preset.totalPurse} Cr</div>
                          </div>
                          <div className="p-2 rounded-2xl bg-slate-50 dark:bg-[#252525]">
                            <div className="text-[10px] text-slate-400 uppercase font-bold">Squad</div>
                            <div className="text-xs font-black">{preset.minSquadSize}-{preset.maxSquadSize}</div>
                          </div>
                          <div className="p-2 rounded-2xl bg-slate-50 dark:bg-[#252525]">
                            <div className="text-[10px] text-slate-400 uppercase font-bold">Timer</div>
                            <div className="text-xs font-black">{preset.timerDuration}s</div>
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-500 space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            {preset.pointSystem === "espn" && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold text-[10px]">
                                ⭐ ESPN MVP
                              </span>
                            )}
                            {preset.pointSystem === "custom" && (
                              <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold text-[10px]">
                                ⚡ Custom Pts
                              </span>
                            )}
                            {preset.pointSystem === "none" && (
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#2A2A2A] text-slate-600 dark:text-slate-400 font-bold text-[10px]">
                                🚫 Pure Auction
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold text-[10px]">
                              ⚡ {preset.acceleratedRounds || 2} Accel Rounds
                            </span>
                            {preset.allowUnsoldDiscount && (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                                🏷️ {preset.unsoldDiscountPercentage || 50}% Unsold Discount
                              </span>
                            )}
                          </div>
                          <div>• RTM: {preset.rtmEnabled ? `${preset.rtmCount} Cards (${preset.rtmStyle === "ESCALATION_2025" ? "2025 Escalation" : "Classic"})` : "Disabled"}</div>
                          <div>• Slabs: {preset.bidIncrementStyle === "IPL_STANDARD_SLABS" ? "Official IPL Slabs" : "Flat 25L"}</div>
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="pt-3 border-t border-slate-100 dark:border-[#2A2A2A] flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenShare("preset", preset)}
                            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-[#2A2A2A] text-slate-500 transition-colors"
                            title="Share with Friend or Group"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          {!preset.isDefault && (
                            <button
                              onClick={(e) => handleDeletePreset(preset.id, preset.name, e)}
                              className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-500 transition-colors"
                              title="Delete preset"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            if (onStartAuctionWithPreset) {
                              onStartAuctionWithPreset(preset);
                            }
                          }}
                          className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-sm"
                        >
                          Use in Auction
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ROSTERS LIST */}
              {activeTab === "rosters" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredRosters.map((roster) => (
                    <div 
                      key={roster.id}
                      className={`p-6 rounded-[28px] bg-white dark:bg-[#1E1E1E] border transition-all flex flex-col justify-between gap-4 shadow-sm ${
                        !roster.isDefault 
                          ? "border-blue-400/80 dark:border-blue-500/30" 
                          : "border-slate-100 dark:border-transparent"
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                            !roster.isDefault
                              ? "bg-blue-50 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300"
                              : "bg-slate-100 dark:bg-[#2A2A2A] text-slate-500"
                          }`}>
                            {!roster.isDefault ? "★ My Custom Pool" : "Official Registry"}
                          </span>
                          <span className="text-xs text-slate-400">{roster.createdAt || "2026"}</span>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-[#252525] border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden p-1 shrink-0 shadow-xs">
                            <img src={roster.logoUrl || "/logos/ipl.png"} alt={roster.name} className="w-full h-full object-contain" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-base text-slate-900 dark:text-white truncate">{roster.name}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">{roster.description}</p>
                          </div>
                        </div>

                        {/* Roster Metrics */}
                        <div className="flex items-center gap-3 pt-1">
                          <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#252525] text-xs font-bold">
                            🏏 {roster.players.length} Cricketers
                          </div>
                          <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#252525] text-xs font-bold">
                            🛡️ {roster.teams.length} Franchises
                          </div>
                        </div>

                        {/* Top Stars Preview */}
                        <div className="pt-2">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Marquee Sample</div>
                          <div className="flex flex-wrap gap-1.5">
                            {roster.players.slice(0, 5).map(p => (
                              <span key={p.id} className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#2A2A2A] text-[11px] font-medium">
                                {p.name} (₹{p.basePrice} Cr)
                              </span>
                            ))}
                            {roster.players.length > 5 && (
                              <span className="px-2 py-1 text-[11px] text-slate-400 font-bold">
                                +{roster.players.length - 5} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="pt-3 border-t border-slate-100 dark:border-[#2A2A2A] flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenShare("roster", roster)}
                            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-[#2A2A2A] text-slate-500 transition-colors"
                            title="Share with Friend"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          {!roster.isDefault && (
                            <button
                              onClick={() => {
                                setDeleteConfirmState({
                                  isOpen: true,
                                  type: "roster",
                                  id: roster.id,
                                  name: roster.name,
                                  details: "This custom tournament roster and its franchises/players will be permanently removed.",
                                });
                              }}
                              className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-500 transition-colors"
                              title="Delete custom roster"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {!roster.isDefault ? (
                            <button
                              onClick={() => setEditingRoster(roster)}
                              className="px-4 py-2 rounded-full bg-slate-100 dark:bg-[#2A2A2A] hover:bg-slate-200 dark:hover:bg-[#333] font-bold text-xs transition-colors flex items-center gap-1"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Customize</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDuplicateRoster(roster)}
                              className="px-4 py-2 rounded-full bg-slate-100 dark:bg-[#2A2A2A] hover:bg-slate-200 dark:hover:bg-[#333] font-bold text-xs transition-colors"
                            >
                              Duplicate & Edit
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* CREATE PRESET MODAL */}
      {isCreatingPreset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-[#1E1E1E] rounded-[28px] p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#2A2A2A]">
              <div>
                <h3 className="text-lg font-bold">Create Custom Auction Preset</h3>
                <p className="text-xs text-slate-500">Save custom bidding rules to your profile & easily share with friends</p>
              </div>
              <button onClick={() => setIsCreatingPreset(false)} className="rounded-full p-2 text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Preset Name</label>
                <input
                  type="text"
                  placeholder="e.g. My Fast 15s Tournament"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#2A2A2A] border border-slate-200 dark:border-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                <textarea
                  rows={2}
                  placeholder="Rules description..."
                  value={newPresetDesc}
                  onChange={(e) => setNewPresetDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#2A2A2A] border border-slate-200 dark:border-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1 resize-none"
                />
              </div>

              {/* Total Purse */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  <span>Total Purse</span>
                  <span className="text-blue-600 dark:text-blue-400 font-black">₹{newPresetPurse} Cr</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="200"
                  step="5"
                  value={newPresetPurse}
                  onChange={(e) => setNewPresetPurse(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              {/* Squad & Overseas */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Max Squad Size</label>
                  <input
                    type="number"
                    value={newPresetMaxSquad}
                    onChange={(e) => setNewPresetMaxSquad(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#2A2A2A] border border-slate-200 dark:border-transparent text-sm font-bold mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Max Overseas</label>
                  <input
                    type="number"
                    value={newPresetMaxOS}
                    onChange={(e) => setNewPresetMaxOS(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#2A2A2A] border border-slate-200 dark:border-transparent text-sm font-bold mt-1"
                  />
                </div>
              </div>

              {/* Timer Duration */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bid Countdown Timer</label>
                <div className="grid grid-cols-4 gap-2 mt-1">
                  {[15, 20, 30, 45].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setNewPresetTimer(sec)}
                      className={`py-2 rounded-2xl text-xs font-bold transition-colors ${
                        newPresetTimer === sec
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-slate-100 dark:bg-[#2A2A2A] text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                      }`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
              </div>

              {/* RTM */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#252525] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">Right To Match (RTM) Cards</span>
                  <input
                    type="checkbox"
                    checked={newPresetRtm}
                    onChange={(e) => setNewPresetRtm(e.target.checked)}
                    className="w-4 h-4 accent-blue-600 rounded"
                  />
                </div>
                {newPresetRtm && (
                  <div className="pt-2 border-t border-slate-200 dark:border-[#333] flex items-center justify-between text-xs">
                    <span>Number of RTM cards</span>
                    <select
                      value={newPresetRtmCount}
                      onChange={(e) => setNewPresetRtmCount(Number(e.target.value))}
                      className="px-2 py-1 rounded bg-white dark:bg-[#1A1A1A] font-bold"
                    >
                      {[1, 2, 3, 4, 5, 6].map(num => (
                        <option key={num} value={num}>{num} Cards</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Accelerated Rounds & Unsold Discount Settings */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#252525] space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">⚡ Accelerated Rounds</span>
                    <span className="text-xs font-black text-blue-600 dark:text-blue-400">{newPresetAcceleratedRounds} {newPresetAcceleratedRounds === 1 ? 'Round' : 'Rounds'}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2">Number of accelerated rounds where teams nominate unsold players and auctioneer calls them to podium.</p>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[1, 2, 3, 4, 5].map((rnd) => (
                      <button
                        key={rnd}
                        type="button"
                        onClick={() => setNewPresetAcceleratedRounds(rnd)}
                        className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                          newPresetAcceleratedRounds === rnd
                            ? "bg-blue-600 text-white shadow-xs"
                            : "bg-white dark:bg-[#1E1E1E] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {rnd} Rnd{rnd > 1 ? 's' : ''}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Unsold Discount Toggle */}
                <div className="pt-2 border-t border-slate-200 dark:border-[#333] space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-300">🏷️ Allow Discount on Unsold Round Buys</div>
                      <div className="text-[10px] text-slate-500">Apply discounted base price when calling unsold nominated players</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={newPresetAllowDiscount}
                      onChange={(e) => setNewPresetAllowDiscount(e.target.checked)}
                      className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                    />
                  </div>

                  {newPresetAllowDiscount && (
                    <div className="p-2.5 rounded-xl bg-white dark:bg-[#1E1E1E] border border-blue-200 dark:border-blue-900/50 space-y-2 animate-in fade-in">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">Discount Percentage:</span>
                        <span className="font-black text-emerald-600 dark:text-emerald-400">{newPresetDiscountPct}% OFF Base Price</span>
                      </div>
                      <div className="flex gap-2">
                        {[25, 50, 75].map((pct) => (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => setNewPresetDiscountPct(pct)}
                            className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${
                              newPresetDiscountPct === pct
                                ? "bg-emerald-600 text-white shadow-xs"
                                : "bg-slate-100 dark:bg-[#2A2A2A] text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                            }`}
                          >
                            {pct}% {pct === 50 ? "(Default)" : ""}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tournament Point System */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Tournament Point System
                </label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setNewPresetPointSystem("espn")}
                    className={`p-2.5 rounded-2xl text-left border transition-all ${
                      newPresetPointSystem === "espn"
                        ? "border-amber-500 bg-amber-50/60 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 ring-1 ring-amber-500"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-[#252525] text-slate-600 dark:text-slate-400 hover:border-slate-400"
                    }`}
                  >
                    <div className="text-xs font-black flex items-center gap-1">⭐ ESPN MVP</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">Official Cricinfo MVP algorithm</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewPresetPointSystem("custom")}
                    className={`p-2.5 rounded-2xl text-left border transition-all ${
                      newPresetPointSystem === "custom"
                        ? "border-purple-500 bg-purple-50/60 dark:bg-purple-950/30 text-purple-900 dark:text-purple-200 ring-1 ring-purple-500"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-[#252525] text-slate-600 dark:text-slate-400 hover:border-slate-400"
                    }`}
                  >
                    <div className="text-xs font-black flex items-center gap-1">⚡ Custom Pts</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">Editable custom tournament points</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewPresetPointSystem("none")}
                    className={`p-2.5 rounded-2xl text-left border transition-all ${
                      newPresetPointSystem === "none"
                        ? "border-blue-600 bg-blue-50/60 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 ring-1 ring-blue-500"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-[#252525] text-slate-600 dark:text-slate-400 hover:border-slate-400"
                    }`}
                  >
                    <div className="text-xs font-black flex items-center gap-1">🚫 Pure Auction</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">No points, squad & financial only</div>
                  </button>
                </div>
              </div>

              {/* Logo / Icon Picker */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Preset Logo / Icon</label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                  {DEFAULT_LOGO_OPTIONS.map((logo) => (
                    <button
                      key={logo.url}
                      type="button"
                      onClick={() => setNewPresetLogo(logo.url)}
                      className={`w-10 h-10 rounded-xl p-1 shrink-0 flex items-center justify-center border transition-all ${
                        newPresetLogo === logo.url
                          ? "border-blue-600 bg-blue-50 dark:bg-blue-950/40 ring-2 ring-blue-500/30"
                          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-[#252525] hover:border-slate-400"
                      }`}
                      title={logo.label}
                    >
                      <img src={logo.url} alt={logo.label} className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-[#2A2A2A]">
              <button
                onClick={() => setIsCreatingPreset(false)}
                className="px-5 py-2.5 rounded-full text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-[#2A2A2A]"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePreset}
                className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors"
              >
                Save Preset to Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD CUSTOM PLAYER MODAL */}
      {isAddingPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#1E1E1E] rounded-[28px] p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#2A2A2A]">
              <h3 className="text-base font-bold">Add Custom Cricketer to Pool</h3>
              <button onClick={() => setIsAddingPlayer(false)} className="rounded-full p-2 text-slate-400">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Player Name</label>
                <input
                  type="text"
                  placeholder="e.g. Jasprit Bumrah"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  className="w-full px-4 py-2 rounded-2xl bg-slate-50 dark:bg-[#2A2A2A] border border-slate-200 dark:border-transparent text-sm font-bold mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Role</label>
                  <select
                    value={newPlayerRole}
                    onChange={(e) => setNewPlayerRole(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-2xl bg-slate-50 dark:bg-[#2A2A2A] border border-slate-200 dark:border-transparent text-xs font-bold mt-1"
                  >
                    <option value="BAT">Batsman (BAT)</option>
                    <option value="BOWL">Bowler (BOWL)</option>
                    <option value="AR">All-Rounder (AR)</option>
                    <option value="WK">Wicketkeeper (WK)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nationality</label>
                  <select
                    value={newPlayerNat}
                    onChange={(e) => setNewPlayerNat(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-2xl bg-slate-50 dark:bg-[#2A2A2A] border border-slate-200 dark:border-transparent text-xs font-bold mt-1"
                  >
                    <option value="IND">Indian (IND)</option>
                    <option value="OS">Overseas (OS)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Base Price (Cr)</label>
                <select
                  value={newPlayerBasePrice}
                  onChange={(e) => setNewPlayerBasePrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-2xl bg-slate-50 dark:bg-[#2A2A2A] border border-slate-200 dark:border-transparent text-xs font-bold mt-1"
                >
                  <option value={2.0}>₹2.00 Cr (Tier 1)</option>
                  <option value={1.5}>₹1.50 Cr (Tier 2)</option>
                  <option value={1.0}>₹1.00 Cr (Tier 3)</option>
                  <option value={0.75}>₹0.75 Cr (Tier 4)</option>
                  <option value={0.5}>₹0.50 Cr (Tier 5)</option>
                  <option value={0.3}>₹0.30 Cr (Uncapped)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-[#2A2A2A]">
              <button
                onClick={() => setIsAddingPlayer(false)}
                className="px-4 py-2 rounded-full text-xs font-bold text-slate-500"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCustomPlayer}
                className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm"
              >
                Insert Player
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLEAN SERVER SHARE MODAL (NO BLOATED JSON) */}
      {sharingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-[#2A2A2A] rounded-[28px] p-6 shadow-2xl flex flex-col gap-4">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#2A2A2A]">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Share {sharingItem.type === "preset" ? "Preset" : "Roster Pool"}</h3>
                <p className="text-xs text-slate-400">Share via compact server code or directly into chat</p>
              </div>
              <button onClick={() => setSharingItem(null)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-[#2A2A2A]">✕</button>
            </div>

            {/* Target Item Name Banner */}
            <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/30">
              <div className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">
                {sharingItem.type === "preset" ? "Auction Preset" : "Custom Tournament Roster"}
              </div>
              <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{sharingItem.data.name}</div>
            </div>

            {/* COMPACT SERVER SHARE CODE CARD (NO BLOATED JSON) */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#161B28] border border-slate-200 dark:border-[#252F48] flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                  Server Share Code
                </span>
                <span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-[10px] font-bold">
                  Saved on Server
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 bg-white dark:bg-[#1A2234] px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#2A344A]">
                {isGeneratingCode ? (
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span>Saving to server...</span>
                  </div>
                ) : (
                  <span className="font-mono text-base font-black text-blue-600 dark:text-blue-400 tracking-widest">
                    {generatedShareCode || "BCR-SAVING"}
                  </span>
                )}

                <button
                  type="button"
                  disabled={isGeneratingCode || !generatedShareCode}
                  onClick={() => {
                    if (generatedShareCode) {
                      navigator.clipboard?.writeText(generatedShareCode);
                      setCopiedCodeToast(true);
                      showToast(`Copied clean share code "${generatedShareCode}"!`);
                      setTimeout(() => setCopiedCodeToast(false), 2500);
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
                >
                  {copiedCodeToast ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCodeToast ? "Copied!" : "Copy Code"}</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                ✨ No bloated JSON! Share this clean code with friends. They can tap <strong>"Import Roster"</strong> and paste this code to load your exact roster and teams.
              </p>
            </div>

            {/* In-App Direct Share to Chat */}
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Send to Group or DM</div>
              <div className="space-y-1.5">
                {[
                  { id: "c_1", name: "Weekend Bidding Boys", type: "Group Chat" },
                  { id: "c_2", name: "Rajat", type: "Direct Message" },
                  { id: "c_3", name: "CSK Team Dugout", type: "Franchise Dugout" },
                ].map((dest) => (
                  <button
                    key={dest.id}
                    onClick={() => handleSendToChat(dest.id, dest.name)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#252525] hover:bg-blue-50 dark:hover:bg-[#2E364A] flex items-center justify-between transition-colors text-left"
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white">{dest.name}</div>
                      <div className="text-[10px] text-slate-400">{dest.type}</div>
                    </div>
                    <Send className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-slate-100 dark:border-[#2A2A2A] flex justify-end">
              <button
                onClick={() => setSharingItem(null)}
                className="px-4 py-2 rounded-full text-xs font-bold text-slate-400 hover:bg-slate-100 dark:hover:bg-[#2A2A2A]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IN-APP CONFIRMATION MODAL (Replaces all browser popups) */}
      {deleteConfirmState?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-sm rounded-[28px] bg-white dark:bg-[#1A2234] border border-slate-200/80 dark:border-[#1E263E] p-6 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                  Delete {deleteConfirmState.type === "roster" ? "Custom Roster" : deleteConfirmState.type === "preset" ? "Custom Preset" : "Franchise"}?
                </h3>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 truncate">
                  "{deleteConfirmState.name}"
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {deleteConfirmState.details || "This action cannot be undone."}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-[#1E263E] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteConfirmState(null)}
                className="px-5 py-2.5 rounded-full font-bold text-xs bg-slate-100 dark:bg-[#252F48] hover:bg-slate-200 dark:hover:bg-[#2E3B5B] text-slate-700 dark:text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteAction}
                className="px-5 py-2.5 rounded-full font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/25 transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
