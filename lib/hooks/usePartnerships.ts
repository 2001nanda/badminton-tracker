'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useMatches } from './useMatches';
import { useOptimizedPlayers } from './useOptimizedPlayers';
import {
  calculateAllPartnershipStats,
  getCanonicalDuoKey,
} from '@/lib/utils/combinationStats';
import { PartnershipStats, PermanentPartnershipDoc, MatchResult } from '@/lib/types';

export function usePartnerships() {
  const { matches, loading: matchesLoading } = useMatches();
  const { players, playerMap, loading: playersLoading } = useOptimizedPlayers();
  const [permanentDocs, setPermanentDocs] = useState<PermanentPartnershipDoc[]>([]);
  const [docsLoading, setDocsLoading] = useState(true);

  // Real-time listener for permanent partnershipStats collection
  useEffect(() => {
    try {
      const partRef = collection(db, 'partnershipStats');
      const unsubscribe = onSnapshot(
        partRef,
        (snapshot) => {
          const docs = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          })) as PermanentPartnershipDoc[];
          setPermanentDocs(docs);
          setDocsLoading(false);
        },
        (error) => {
          console.error('Error fetching partnershipStats:', error);
          setDocsLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error('Failed to setup partnershipStats listener:', err);
      setDocsLoading(false);
    }
  }, []);

  const loading = (matchesLoading && playersLoading) || (docsLoading && playersLoading);

  // Build full PartnershipStats records from permanent collection
  const partnerships = useMemo<PartnershipStats[]>(() => {
    if (players.length === 0) return [];

    if (permanentDocs.length > 0) {
      const enriched: PartnershipStats[] = permanentDocs
        .map((doc) => {
          const playerIds: [string, string] =
            Array.isArray(doc.playerIds) && doc.playerIds.length >= 2
              ? doc.playerIds
              : doc.id && doc.id.includes('_')
              ? (doc.id.split('_').slice(0, 2) as [string, string])
              : ['', ''];

          const p1Id = playerIds[0];
          const p2Id = playerIds[1];
          if (!p1Id || !p2Id) return null;

          const p1 = playerMap.get(p1Id);
          const p2 = playerMap.get(p2Id);
          const p1Name = p1?.name || 'Unknown';
          const p2Name = p2?.name || 'Unknown';
          const duoName = `${p1Name} + ${p2Name}`;

          const totalMatches = doc.totalMatches || 0;
          const wins = doc.wins || 0;
          const losses = doc.losses || 0;
          const winPercentage = totalMatches > 0 ? (wins / totalMatches) * 100 : 0;
          const pointsScored = doc.pointsScored || 0;
          const pointsConceded = doc.pointsConceded || 0;
          const pointsDifference = pointsScored - pointsConceded;
          const averagePointsPerSet = totalMatches > 0 ? pointsScored / totalMatches : 0;

          // Recent form from available matches in the 14-day history window
          const duoMatches = matches
            .filter(
              (m) =>
                m.type === 'doubles' &&
                m.players &&
                ((getCanonicalDuoKey(m.players[0], m.players[1]) === doc.id) ||
                  (getCanonicalDuoKey(m.players[2], m.players[3]) === doc.id))
            )
            .sort((a, b) => {
              const timeA = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
              const timeB = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
              return timeB - timeA; // newest first
            });

          const recentForm: MatchResult[] = duoMatches.slice(0, 5).map((m) => {
            const isWinner = m.winner.includes(p1Id);
            return isWinner ? 'W' : 'L';
          });

          return {
            id: doc.id,
            player1Id: p1Id,
            player2Id: p2Id,
            player1Name: p1Name,
            player2Name: p2Name,
            duoName,
            matchesPlayed: totalMatches,
            wins,
            losses,
            winPercentage,
            pointsScored,
            pointsConceded,
            pointsDifference,
            averagePointsPerSet,
            currentStreak: doc.currentWinningStreak || 0,
            longestWinningStreak: doc.longestWinningStreak || 0,
            recentForm,
            isQualified: totalMatches >= 5,
          };
        })
        .filter((p): p is PartnershipStats => p !== null);

      // Sort by win percentage (descending) with matchesPlayed and pointsDiff tie-breaker
      enriched.sort((a, b) => {
        if (b.winPercentage !== a.winPercentage) return b.winPercentage - a.winPercentage;
        if (b.matchesPlayed !== a.matchesPlayed) return b.matchesPlayed - a.matchesPlayed;
        return b.pointsDifference - a.pointsDifference;
      });

      return enriched.map((p, idx) => ({ ...p, rank: idx + 1 }));
    }

    // Fallback: calculate from matches in memory
    return calculateAllPartnershipStats(matches, playerMap);
  }, [permanentDocs, matches, playerMap, players.length]);

  const qualifiedPartnerships = useMemo(() => {
    return partnerships.filter((p) => p.isQualified);
  }, [partnerships]);

  const unqualifiedPartnerships = useMemo(() => {
    return partnerships.filter((p) => !p.isQualified);
  }, [partnerships]);

  const bestPartnership = useMemo(() => {
    return qualifiedPartnerships[0] || partnerships[0] || null;
  }, [qualifiedPartnerships, partnerships]);

  const mostPlayedPartnership = useMemo(() => {
    if (partnerships.length === 0) return null;
    return [...partnerships].sort((a, b) => b.matchesPlayed - a.matchesPlayed)[0];
  }, [partnerships]);

  const mostWinsPartnership = useMemo(() => {
    if (partnerships.length === 0) return null;
    return [...partnerships].sort((a, b) => b.wins - a.wins)[0];
  }, [partnerships]);

  const longestStreakPartnership = useMemo(() => {
    if (partnerships.length === 0) return null;
    return [...partnerships].sort((a, b) => b.longestWinningStreak - a.longestWinningStreak)[0];
  }, [partnerships]);

  const getPartnershipByKey = (key: string): PartnershipStats | null => {
    return partnerships.find((p) => p.id === key) || null;
  };

  const getPartnershipBetween = (playerAId: string, playerBId: string): PartnershipStats | null => {
    const key = getCanonicalDuoKey(playerAId, playerBId);
    return getPartnershipByKey(key);
  };

  return {
    partnerships,
    qualifiedPartnerships,
    unqualifiedPartnerships,
    bestPartnership,
    mostPlayedPartnership,
    mostWinsPartnership,
    longestStreakPartnership,
    getPartnershipByKey,
    getPartnershipBetween,
    matches,
    players,
    playerMap,
    loading,
  };
}
