'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export function AddMatchHeader() {
  return (
    <div className="border-b border-white/10 bg-gradient-to-b from-gray-900/50 to-transparent">
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2 rounded-lg hover:bg-white/5 transition-colors text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Add Match
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">Record a new badminton match</p>
          </div>
        </div>
      </div>
    </div>
  );
}
