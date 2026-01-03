"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getGlobalLeaderboard, getGameLeaderboard } from "@/lib/api";
import { GameId, Score, AggregatedScore } from "@/lib/mongodb";

const GAMES: { id: GameId; name: string }[] = [
  { id: "snake", name: "Snake Royale" },
  { id: "flappy", name: "Flappy Bird" },
  { id: "typing", name: "Typing Race" },
  { id: "reaction", name: "Reaction Time" },
  { id: "trex", name: "T-Rex Runner" },
];

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<"global" | GameId>("global");
  const [globalData, setGlobalData] = useState<AggregatedScore[]>([]);
  const [gameData, setGameData] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        if (activeTab === "global") {
          const data = await getGlobalLeaderboard(50);
          setGlobalData(data);
        } else {
          const data = await getGameLeaderboard(activeTab, 50);
          setGameData(data);
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [activeTab]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
        <p className="text-muted-foreground">
          Top players across all games
        </p>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab("global")}
          className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
            activeTab === "global"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          Global
        </button>
        {GAMES.map((game) => (
          <button
            key={game.id}
            onClick={() => setActiveTab(game.id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeTab === game.id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {game.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : activeTab === "global" ? (
        <GlobalLeaderboard data={globalData} />
      ) : (
        <GameLeaderboard data={gameData} />
      )}
    </div>
  );
}

function GlobalLeaderboard({ data }: { data: AggregatedScore[] }) {
  if (data.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        No scores yet. Be the first to play!
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-secondary">
            <th className="px-4 py-3 text-left text-sm font-medium">Rank</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Player</th>
            <th className="px-4 py-3 text-right text-sm font-medium">Games</th>
            <th className="px-4 py-3 text-right text-sm font-medium">Total Score</th>
          </tr>
        </thead>
        <tbody>
          {data.map((entry, index) => (
            <motion.tr
              key={entry.twitterHandle}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="border-t border-border"
            >
              <td className="px-4 py-3 font-mono text-sm">
                {index + 1}
              </td>
              <td className="px-4 py-3 font-medium">
                @{entry.twitterHandle}
              </td>
              <td className="px-4 py-3 text-right text-muted-foreground">
                {entry.gamesPlayed}
              </td>
              <td className="px-4 py-3 text-right font-mono font-semibold">
                {entry.totalScore.toLocaleString()}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GameLeaderboard({ data }: { data: Score[] }) {
  if (data.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        No scores yet. Be the first to play!
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-secondary">
            <th className="px-4 py-3 text-left text-sm font-medium">Rank</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Player</th>
            <th className="px-4 py-3 text-right text-sm font-medium">Score</th>
          </tr>
        </thead>
        <tbody>
          {data.map((entry, index) => (
            <motion.tr
              key={`${entry.twitterHandle}-${index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="border-t border-border"
            >
              <td className="px-4 py-3 font-mono text-sm">
                {index + 1}
              </td>
              <td className="px-4 py-3 font-medium">
                @{entry.twitterHandle}
              </td>
              <td className="px-4 py-3 text-right font-mono font-semibold">
                {entry.score.toLocaleString()}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
