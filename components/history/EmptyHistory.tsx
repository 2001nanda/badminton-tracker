import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, PlusCircle } from 'lucide-react';
import Link from 'next/link';

export function EmptyHistory() {
  return (
    <Card className="border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm">
      <div className="p-12 text-center">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
          <History className="w-12 h-12 text-purple-400" />
        </div>
        
        <h3 className="text-2xl font-bold text-white mb-3">
          No Matches Found
        </h3>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          No matches match your current filters. Try adjusting your search or add your first match!
        </p>
        
        <Link href="/add-match">
          <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/30">
            <PlusCircle className="w-5 h-5 mr-2" />
            Add Match
          </Button>
        </Link>
      </div>
    </Card>
  );
}
