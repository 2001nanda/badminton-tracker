import * as z from 'zod';

export const matchFormSchema = z.object({
  type: z.enum(['singles', 'doubles']),
  playerA: z.string().min(1, 'Player A is required'),
  playerB: z.string().min(1, 'Player B is required'),
  playerC: z.string().optional(),
  playerD: z.string().optional(),
  set1TeamA: z.number().min(0, 'Score must be 0 or higher').max(30, 'Score must be 30 or lower'),
  set1TeamB: z.number().min(0, 'Score must be 0 or higher').max(30, 'Score must be 30 or lower'),
  set2TeamA: z.number().min(0, 'Score must be 0 or higher').max(30, 'Score must be 30 or lower'),
  set2TeamB: z.number().min(0, 'Score must be 0 or higher').max(30, 'Score must be 30 or lower'),
  set3TeamA: z.number().min(0).max(30).optional(),
  set3TeamB: z.number().min(0).max(30).optional(),
}).refine((data) => {
  // Validate doubles requires all 4 players
  if (data.type === 'doubles') {
    return data.playerC && data.playerD;
  }
  return true;
}, {
  message: 'Doubles requires 4 players',
  path: ['playerC'],
}).refine((data) => {
  // Prevent duplicate players
  const players = [data.playerA, data.playerB, data.playerC, data.playerD].filter(Boolean);
  return new Set(players).size === players.length;
}, {
  message: 'Players must be unique',
  path: ['playerB'],
});

export type MatchFormData = z.infer<typeof matchFormSchema>;
