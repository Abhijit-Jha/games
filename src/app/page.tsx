"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { GameCard } from "@/components/game-card";
import { Button } from "@/components/button";
import { getGlobalLeaderboard } from "@/lib/api";
import { GameId, AggregatedScore } from "@/lib/mongodb";

const GAMES: { id: GameId; name: string; description: string }[] = [
  {
    id: "snake",
    name: "Snake Royale",
    description: "Classic snake with increasing speed. Eat to grow, avoid walls and yourself.",
  },
  {
    id: "flappy",
    name: "Flappy Bird Duel",
    description: "One-button gameplay. Navigate through procedural pipes.",
  },
  {
    id: "typing",
    name: "Typing Race",
    description: "Terminal-style typing test. Same daily text for all players.",
  },
  {
    id: "reaction",
    name: "Reaction Time",
    description: "Test your reflexes with millisecond precision.",
  },
  {
    id: "trex",
    name: "T-Rex Runner",
    description: "Endless runner with increasing speed. Jump over obstacles.",
  },
];

export default function HomePage() {
  const [topPlayers, setTopPlayers] = useState<AggregatedScore[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const global = await getGlobalLeaderboard(5);
        setTopPlayers(global);
      } catch (error) {
        console.error("Failed to fetch top scores:", error);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="flex-1">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight"
              >
                Arcade Royale
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-lg text-muted-foreground mb-8 max-w-xl"
              >
                Classic arcade games reimagined for the modern web. 
                Compete with players worldwide and climb the leaderboard.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex gap-4"
              >
                <Link href="/games">
                  <Button size="lg">Play Now</Button>
                </Link>
                <Link href="/leaderboard">
                  <Button size="lg" variant="secondary">Leaderboard</Button>
                </Link>
              </motion.div>
            </div>

            {topPlayers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="lg:w-72 shrink-0"
              >
                <div className="bg-card border border-border rounded-lg p-5">
                  <h3 className="text-sm font-medium text-muted-foreground mb-4">Top Players</h3>
                  <div className="space-y-3">
                    {topPlayers.map((player, index) => (
                      <div key={player.twitterHandle} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-mono text-muted-foreground w-4">{index + 1}</span>
                          <span className="text-sm font-medium truncate max-w-[120px]">@{player.twitterHandle}</span>
                        </div>
                        <span className="text-sm font-mono">{player.totalScore.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/leaderboard" className="block mt-4 pt-4 border-t border-border">
                    <span className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      View full leaderboard
                    </span>
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-8">Games</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {GAMES.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <GameCard
                  id={game.id}
                  name={game.name}
                  description={game.description}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p>Built for competition. No fake stats. Real players only.</p>
        </div>
      </footer>
    </div>
  );
}
