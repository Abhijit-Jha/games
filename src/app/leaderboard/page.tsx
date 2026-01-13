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
    <div className="max-w-5xl mx-auto px-4 py-12 min-h-[calc(100vh-4rem)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <div className="inline-flex items-center gap-3 mb-4">
          <motion.span
            className="text-5xl"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🏆
          </motion.span>
          <h1 className="text-5xl font-black uppercase tracking-tight">
            <span className="text-neon-green">Leader</span>
            <span className="text-neon-pink">board</span>
          </h1>
          <motion.span
            className="text-5xl"
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🏆
          </motion.span>
        </div>
        <p className="text-muted-foreground text-lg">
          Top players competing for glory
        </p>
      </motion.div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 justify-center flex-wrap">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab("global")}
          className={`px-6 py-3 text-sm font-black uppercase tracking-wider rounded-xl whitespace-nowrap transition-all border-2 ${
            activeTab === "global"
              ? "bg-primary text-primary-foreground border-primary shadow-[0_0_20px_var(--primary-glow)]"
              : "bg-card text-muted-foreground border-border-bright hover:border-primary/50 hover:text-foreground"
          }`}
        >
          🌍 Global
        </motion.button>
        {GAMES.map((game) => (
          <motion.button
            key={game.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab(game.id)}
            className={`px-6 py-3 text-sm font-black uppercase tracking-wider rounded-xl whitespace-nowrap transition-all border-2 ${
              activeTab === game.id
                ? "bg-primary text-primary-foreground border-primary shadow-[0_0_20px_var(--primary-glow)]"
                : "bg-card text-muted-foreground border-border-bright hover:border-primary/50 hover:text-foreground"
            }`}
          >
            {game.name}
          </motion.button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <motion.div
            className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            style={{ boxShadow: "0 0 20px var(--primary-glow)" }}
          />
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
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-20"
      >
        <div className="text-6xl mb-4">🎮</div>
        <p className="text-muted-foreground text-lg uppercase tracking-wider">
          No scores yet. Be the first to play!
        </p>
      </motion.div>
    );
  }

  return (
    <div className="border-2 border-border-bright rounded-xl overflow-hidden bg-card">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-background-secondary border-b-2 border-border-bright">
              <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-muted-foreground">Rank</th>
              <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-muted-foreground">Player</th>
              <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-wider text-muted-foreground">Games</th>
              <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-wider text-muted-foreground">Total Score</th>
            </tr>
          </thead>
          <tbody>
            {data.map((entry, index) => (
              <motion.tr
                key={entry.twitterHandle}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="border-b border-border hover:bg-background-secondary/50 transition-colors group"
              >
                <td className="px-6 py-4">
                  <span className={`text-lg font-black font-mono ${
                    index === 0 ? "text-neon-yellow" :
                    index === 1 ? "text-neon-blue" :
                    index === 2 ? "text-neon-orange" : "text-muted-foreground"
                  }`}>
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-foreground group-hover:text-primary transition-colors">
                  @{entry.twitterHandle}
                </td>
                <td className="px-6 py-4 text-right text-muted-foreground">
                  {entry.gamesPlayed}
                </td>
                <td className="px-6 py-4 text-right font-mono font-black text-lg text-primary">
                  {entry.totalScore.toLocaleString()}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GameLeaderboard({ data }: { data: Score[] }) {
  if (data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-20"
      >
        <div className="text-6xl mb-4">🎮</div>
        <p className="text-muted-foreground text-lg uppercase tracking-wider">
          No scores yet. Be the first to play!
        </p>
      </motion.div>
    );
  }

  return (
    <div className="border-2 border-border-bright rounded-xl overflow-hidden bg-card">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-background-secondary border-b-2 border-border-bright">
              <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-muted-foreground">Rank</th>
              <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-muted-foreground">Player</th>
              <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-wider text-muted-foreground">Score</th>
            </tr>
          </thead>
          <tbody>
            {data.map((entry, index) => (
              <motion.tr
                key={`${entry.twitterHandle}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="border-b border-border hover:bg-background-secondary/50 transition-colors group"
              >
                <td className="px-6 py-4">
                  <span className={`text-lg font-black font-mono ${
                    index === 0 ? "text-neon-yellow" :
                    index === 1 ? "text-neon-blue" :
                    index === 2 ? "text-neon-orange" : "text-muted-foreground"
                  }`}>
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-foreground group-hover:text-primary transition-colors">
                  @{entry.twitterHandle}
                </td>
                <td className="px-6 py-4 text-right font-mono font-black text-lg text-primary">
                  {entry.score.toLocaleString()}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
