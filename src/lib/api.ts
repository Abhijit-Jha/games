import { GameId, Score, AggregatedScore } from "./mongodb";

export async function submitScore(
  twitterHandle: string,
  gameId: GameId,
  score: number
): Promise<{ success: boolean; rank?: number }> {
  const response = await fetch("/api/scores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ twitterHandle, gameId, score }),
  });
  return response.json();
}

export async function getGameLeaderboard(
  gameId: GameId,
  limit = 50
): Promise<Score[]> {
  const response = await fetch(`/api/leaderboard/${gameId}?limit=${limit}`);
  return response.json();
}

export async function getGlobalLeaderboard(
  limit = 50
): Promise<AggregatedScore[]> {
  const response = await fetch(`/api/leaderboard/global?limit=${limit}`);
  return response.json();
}

export async function getTopScoreForGame(gameId: GameId): Promise<Score | null> {
  const response = await fetch(`/api/leaderboard/${gameId}?limit=1`);
  const scores = await response.json();
  return scores[0] || null;
}
