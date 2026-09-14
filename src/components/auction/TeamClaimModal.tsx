'use client';

import React, { useState } from 'react';
import { Shield, Crown, UserPlus, Check, X, Clock } from 'lucide-react';

interface TeamSlot {
  id: string;
  name: string;
  shortName: string;
  primaryColor: string;
  ownerId: string | null;
  ownerName: string | null;
  memberCount: number;
  maxMembers: number;
  ownerApprovalRequired: boolean;
}

interface TeamClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: TeamSlot[];
  currentUserId: string;
  onClaimTeam: (teamId: string) => void;
  onRequestJoin: (teamId: string) => void;
}

export default function TeamClaimModal({
  isOpen,
  onClose,
  teams,
  currentUserId,
  onClaimTeam,
  onRequestJoin,
}: TeamClaimModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white dark:bg-[#1E1E1E] rounded-[28px] shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-[#2A2A2A]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Pick Your Franchise</h2>
              <p className="text-sm text-slate-500 mt-1">First to claim becomes the Team Owner.</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#2A2A2A] hover:bg-slate-200 dark:hover:bg-[#333] flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Team Grid */}
        <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 gap-3">
            {teams.map((team) => {
              const isOwner = team.ownerId === currentUserId;
              const isClaimed = !!team.ownerId;
              const isFull = team.memberCount >= team.maxMembers;

              return (
                <div
                  key={team.id}
                  className={`p-4 rounded-[20px] border-2 transition-all ${
                    isOwner
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                      : isClaimed
                      ? 'border-slate-200 dark:border-[#333] bg-slate-50 dark:bg-[#1A1A1A]'
                      : 'border-slate-200 dark:border-[#333] bg-white dark:bg-[#1E1E1E] hover:border-blue-400 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm"
                      style={{ backgroundColor: team.primaryColor }}
                    >
                      {team.shortName.substring(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm truncate">{team.name}</div>
                      <div className="text-[10px] text-slate-500">
                        {team.memberCount}/{team.maxMembers} members
                      </div>
                    </div>
                  </div>

                  {/* Status / Actions */}
                  {isOwner ? (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                      <Crown className="w-3.5 h-3.5" />
                      <span>You are the Owner</span>
                    </div>
                  ) : !isClaimed ? (
                    <button
                      onClick={() => onClaimTeam(team.id)}
                      className="w-full py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      Claim Team
                    </button>
                  ) : isFull ? (
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                      <Check className="w-3.5 h-3.5" />
                      <span>Full</span>
                    </div>
                  ) : team.ownerApprovalRequired ? (
                    <button
                      onClick={() => onRequestJoin(team.id)}
                      className="w-full py-2 rounded-full bg-slate-100 dark:bg-[#2A2A2A] hover:bg-slate-200 dark:hover:bg-[#333] font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      Request to Join
                    </button>
                  ) : (
                    <button
                      onClick={() => onRequestJoin(team.id)}
                      className="w-full py-2 rounded-full bg-slate-100 dark:bg-[#2A2A2A] hover:bg-slate-200 dark:hover:bg-[#333] font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Join Team
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
