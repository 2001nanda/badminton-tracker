'use client';

import { memo } from 'react';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PlayerSearchProps {
  value: string;
  onChange: (value: string) => void;
  resultCount: number;
}

export const PlayerSearch = memo(function PlayerSearch({
  value,
  onChange,
  resultCount,
}: PlayerSearchProps) {
  return (
    <div className="mb-6">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search players..."
          className="bg-white/5 border-white/10 text-white pl-12 pr-12 h-12 text-base"
        />
        {value && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onChange('')}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
      {value && (
        <p className="text-sm text-gray-400 mt-2">
          {resultCount} {resultCount === 1 ? 'player' : 'players'} found
        </p>
      )}
    </div>
  );
});
