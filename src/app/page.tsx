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
    <div className="min-h-[calc(100vh-4rem)]">
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 grid-background opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="flex-1 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-block mb-6"
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border-2 border-primary rounded-full text-xs font-bold uppercase tracking-wider text-primary">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
                  Live Competition
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 uppercase tracking-tight leading-none"
              >
                <span className="text-neon-green">Arcade</span>
                <br />
                <span className="text-neon-blue">Royale</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed"
              >
                Classic arcade games reimagined for the modern web.
                Compete with players worldwide and dominate the leaderboard.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <Link href="/games">
                  <Button size="lg">Play Now</Button>
                </Link>
                <Link href="/leaderboard">
                  <Button size="lg" variant="secondary">View Leaderboard</Button>
                </Link>
              </motion.div>
            </div>

            {topPlayers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="lg:w-80 w-full shrink-0"
              >
                <div className="relative bg-card border-2 border-border-bright rounded-xl p-6 overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-sm font-black uppercase tracking-wider text-primary">Top Players</h3>
                      <span className="text-2xl">🏆</span>
                    </div>
                    <div className="space-y-4">
                      {topPlayers.map((player, index) => (
                        <motion.div
                          key={player.twitterHandle}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                          className="flex items-center justify-between p-3 rounded-lg bg-background-secondary/50 border border-border hover:border-primary/50 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <span className={`text-lg font-black font-mono w-6 ${
                              index === 0 ? "text-neon-yellow" :
                              index === 1 ? "text-neon-blue" :
                              index === 2 ? "text-neon-orange" : "text-muted-foreground"
                            }`}>
                              {index + 1}
                            </span>
                            <span className="text-sm font-bold truncate max-w-[140px]">@{player.twitterHandle}</span>
                          </div>
                          <span className="text-sm font-mono font-bold text-primary">{player.totalScore.toLocaleString()}</span>
                        </motion.div>
                      ))}
                    </div>
                    <Link href="/leaderboard" className="block mt-6 pt-4 border-t border-border">
                      <motion.span
                        className="text-sm text-muted-foreground hover:text-primary transition-colors font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                        whileHover={{ x: 5 }}
                      >
                        View Full Leaderboard
                        <span>→</span>
                      </motion.span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="text-4xl font-black mb-4 uppercase tracking-tight">
              <span className="text-neon-green">Choose Your</span>{" "}
              <span className="text-neon-pink">Challenge</span>
            </h2>
            <p className="text-muted-foreground text-lg">Five classic arcade games, endless competition</p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {GAMES.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
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

      <footer className="relative py-12 px-4 border-t-2 border-border-bright overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-background-secondary to-transparent opacity-50" />
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Built for competition. No fake stats. Real players only.
            </p>
            <div className="flex items-center justify-center gap-4 text-2xl">
              <motion.span animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0 }}>👾</motion.span>
              <motion.span animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}>🎮</motion.span>
              <motion.span animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}>🏆</motion.span>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
