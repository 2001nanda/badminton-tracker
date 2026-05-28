'use client';

import { memo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Player } from '@/lib/types';
import { ArrowLeft, Edit } from 'lucide-react';
import { getPlayerInitials } from '@/lib/utils/statsUtils';
import { EditPlayerModal } from '@/components/players/EditPlayerModal';

interface PlayerProfileHeaderProps {
  player: Player;
}

export const PlayerProfileHeader = memo(function PlayerProfileHeader({
  player,
}: PlayerProfileHeaderProps) {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const initials = getPlayerInitials(player.name);

  return (
    <>
      <div className="border-b border-white/10 bg-gradient-to-b from-gray-900/50 to-transparent">
        <div className="container mx-auto px-4 py-6 max-w-5xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link href="/players">
                <button className="p-2 rounded-lg hover:bg-white/5 transition-colors text-slate-400 hover:text-white">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </Link>
              <h2 className="text-sm text-slate-400">Back to Players</h2>
            </div>
            
            {/* Edit Button */}
            <Button
              onClick={() => setEditModalOpen(true)}
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-white"
              size="sm"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Player
            </Button>
          </div>

          <div className="flex items-center gap-6">
            {player.photoURL ? (
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-emerald-500/30 shadow-xl shadow-emerald-500/20">
                <Image
                  src={player.photoURL}
                  alt={player.name}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-500/30">
                <span className="text-white font-bold text-3xl">{initials}</span>
              </div>
            )}
            
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {player.name}
              </h1>
              <p className="text-slate-400">
                Player Profile
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <EditPlayerModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        player={player}
      />
    </>
  );
});
