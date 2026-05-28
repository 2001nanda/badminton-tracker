'use client';

import { AddMatchForm } from '@/components/add-match/AddMatchForm';
import { AddMatchHeader } from '@/components/add-match/AddMatchHeader';

export default function AddMatchPage() {
  return (
    <div className="min-h-screen">
      <AddMatchHeader />
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <AddMatchForm />
      </div>
    </div>
  );
}
