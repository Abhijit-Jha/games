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

const rankColors = ["text-yellow-400", "text-gray-300", "text-amber-600"];
const rankIcons = ["👑", "🥈", "🥉"];

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
        <div className="absolute inset-0 arcade-grid opacity-30" />
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="flex-1 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-6"
              >
                <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black mb-4 tracking-tighter uppercase">
                  <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent glow-text">
                    Arcade
                  </span>
                  <span className="block bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent glow-text">
                    Royale
                  </span>
                </h1>
              </motion.div>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed"
              >
                Classic arcade games reimagined for the modern web. 
                <span className="text-primary font-bold"> Compete globally.</span>
                <span className="text-accent font-bold"> Dominate the leaderboard.</span>
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <Link href="/games">
                  <Button size="lg" className="w-full sm:w-auto">
                    🎮 Start Playing
                  </Button>
                </Link>
                <Link href="/leaderboard">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    🏆 View Rankings
                  </Button>
                </Link>
              </motion.div>
            </div>

            {topPlayers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="lg:w-80 w-full shrink-0"
              >
                <div className="bg-card/50 backdrop-blur-sm border-2 border-primary/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(0,255,136,0.2)] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
                  
                  <div className="relative z-10">
                    <h3 className="text-sm font-black uppercase tracking-wider text-primary mb-6 flex items-center gap-2">
                      <span className="text-2xl">🏆</span>
                      Top Players
                    </h3>
                    
                    <div className="space-y-4">
                      {topPlayers.map((player, index) => (
                        <motion.div
                          key={player.twitterHandle}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                          className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg border border-border hover:border-primary/50 transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <span className={`text-xl font-black w-8 ${index < 3 ? rankColors[index] : "text-muted-foreground"}`}>
                              {index < 3 ? rankIcons[index] : `#${index + 1}`}
                            </span>
                            <span className="text-sm font-bold truncate max-w-[140px] group-hover:text-primary transition-colors">
                              @{player.twitterHandle}
                            </span>
                          </div>
                          <span className="text-base font-mono font-bold text-primary">
                            {player.totalScore.toLocaleString()}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                    
                    <Link href="/leaderboard" className="block mt-6 pt-4 border-t-2 border-border">
                      <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2">
                        View Full Leaderboard
                        <span className="text-lg">→</span>
                      </span>
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
            <h2 className="text-4xl sm:text-5xl font-black mb-4 uppercase tracking-tight">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Choose Your Game
              </span>
            </h2>
            <p className="text-muted-foreground text-lg">
              5 games. Infinite competition. One leaderboard.
            </p>
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

      <footer className="py-10 px-4 border-t-2 border-primary/20 mt-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent" />
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Built for competition. No fake stats. Real players only.
          </p>
          <p className="text-xs text-muted-foreground/60">
            Powered by skill, determination, and a love for arcade classics.
          </p>
        </div>
      </footer>
    </div>
  );
}
