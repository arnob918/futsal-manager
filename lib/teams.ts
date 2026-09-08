// lib/teams.ts
// Pure team-balancing logic — no DB access so it runs on client or server.

export const POSITIONS = [
  "GOALKEEPER",
  "DEFENDER",
  "MIDFIELDER",
  "FORWARD",
] as const;
export type Position = (typeof POSITIONS)[number];
export type TeamName = "A" | "B";

export const DEFAULT_SCORE = 5;

export type PlayerInput = {
  id: string;
  name: string;
  scores: Record<Position, number>; // 1-10, default 5 when unrated
};

export type AssignedPlayer = PlayerInput & {
  position: Position; // slot they fill on this team
  value: number; // score at that position (used for balancing)
};

export type GeneratedTeams = {
  teamA: AssignedPlayer[];
  teamB: AssignedPlayer[];
  totalA: number;
  totalB: number;
};

const OUTFIELD: Position[] = ["DEFENDER", "MIDFIELDER", "FORWARD"];

function bestOutfield(p: PlayerInput): { position: Position; value: number } {
  let position: Position = "DEFENDER";
  let value = -Infinity;
  for (const pos of OUTFIELD) {
    const s = p.scores[pos] ?? DEFAULT_SCORE;
    if (s > value) {
      value = s;
      position = pos;
    }
  }
  return { position, value };
}

const total = (team: AssignedPlayer[]) =>
  team.reduce((acc, p) => acc + p.value, 0);

/**
 * Split players into two balanced teams: the two best goalkeepers are
 * separated (one per team), everyone else is valued at their best outfield
 * score and snake-drafted, then improved by greedy pairwise swaps until the
 * total-score gap can't shrink. Ties are broken randomly so regenerating
 * yields different but equally balanced splits.
 */
export function generateTeams(players: PlayerInput[]): GeneratedTeams {
  if (players.length < 4) throw new Error("Need at least 4 players");

  // Keepers: top 2 by GK score (random among ties)
  const byGk = [...players].sort(
    (a, b) =>
      (b.scores.GOALKEEPER ?? DEFAULT_SCORE) -
        (a.scores.GOALKEEPER ?? DEFAULT_SCORE) || Math.random() - 0.5
  );
  const [gk1, gk2] = byGk;
  const keeperA: AssignedPlayer = {
    ...gk1,
    position: "GOALKEEPER",
    value: gk1.scores.GOALKEEPER ?? DEFAULT_SCORE,
  };
  const keeperB: AssignedPlayer = {
    ...gk2,
    position: "GOALKEEPER",
    value: gk2.scores.GOALKEEPER ?? DEFAULT_SCORE,
  };

  // Outfielders valued at their best non-GK position, sorted with tie jitter
  const outfielders = players
    .filter((p) => p.id !== gk1.id && p.id !== gk2.id)
    .map((p) => ({ ...p, ...bestOutfield(p) }))
    .sort((a, b) => b.value - a.value || Math.random() - 0.5);

  // Snake draft: A B B A A B B A ...
  const teamA: AssignedPlayer[] = [keeperA];
  const teamB: AssignedPlayer[] = [keeperB];
  outfielders.forEach((p, i) => {
    const pickA = i % 4 === 0 || i % 4 === 3;
    // keep sizes within 1 of each other when count is odd
    const target =
      teamA.length - teamB.length >= 1
        ? teamB
        : teamB.length - teamA.length >= 1
        ? teamA
        : pickA
        ? teamA
        : teamB;
    target.push(p);
  });

  // Greedy improvement: swap the outfielder pair that most narrows the gap
  let improved = true;
  while (improved) {
    improved = false;
    const gap = Math.abs(total(teamA) - total(teamB));
    let best: { i: number; j: number; gap: number } | null = null;
    for (let i = 1; i < teamA.length; i++) {
      for (let j = 1; j < teamB.length; j++) {
        const diff = teamA[i].value - teamB[j].value;
        const newGap = Math.abs(total(teamA) - total(teamB) - 2 * diff);
        if (newGap < gap && (!best || newGap < best.gap))
          best = { i, j, gap: newGap };
      }
    }
    if (best) {
      const tmp = teamA[best.i];
      teamA[best.i] = teamB[best.j];
      teamB[best.j] = tmp;
      improved = true;
    }
  }

  return { teamA, teamB, totalA: total(teamA), totalB: total(teamB) };
}
