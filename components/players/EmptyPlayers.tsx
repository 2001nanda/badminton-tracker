import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, Users } from 'lucide-react';
import { usePlayerStore } from '@/lib/store/usePlayerStore';

export function EmptyPlayers() {
  const { setShowAddModal } = usePlayerStore();

  return (
    <Card className="border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm">
      <div className="p-12 text-center">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-500/20 to-yellow-500/20 flex items-center justify-center">
          <Users className="w-12 h-12 text-emerald-400" />
        </div>
        
        <h3 className="text-2xl font-bold text-white mb-3">
          No Players Yet
        </h3>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          Add your badminton squad to start tracking matches and building your leaderboard!
        </p>
        
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/30"
        >
          <UserPlus className="w-5 h-5 mr-2" />
          Add Your First Player
        </Button>
      </div>
    </Card>
  );
}
