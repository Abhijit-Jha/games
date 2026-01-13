"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GameId } from "@/lib/mongodb";

interface GameCardProps {
  id: GameId;
  name: string;
  description: string;
}

const gameColors: Record<GameId, string> = {
  snake: "from-green-500/20 to-emerald-500/20 border-green-500/50 hover:border-green-500 hover:shadow-[0_0_30px_rgba(34,197,94,0.4)]",
  flappy: "from-cyan-500/20 to-blue-500/20 border-cyan-500/50 hover:border-cyan-500 hover:shadow-[0_0_30px_rgba(6,182,212,0.4)]",
  typing: "from-purple-500/20 to-pink-500/20 border-purple-500/50 hover:border-purple-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.4)]",
  reaction: "from-yellow-500/20 to-orange-500/20 border-yellow-500/50 hover:border-yellow-500 hover:shadow-[0_0_30px_rgba(234,179,8,0.4)]",
  trex: "from-red-500/20 to-pink-500/20 border-red-500/50 hover:border-red-500 hover:shadow-[0_0_30px_rgba(239,68,68,0.4)]",
};

export function GameCard({ id, name, description }: GameCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Link
        href={`/games/${id}`}
        className={`block p-6 bg-gradient-to-br ${gameColors[id]} bg-card/50 backdrop-blur-sm border-2 rounded-xl transition-all h-full relative overflow-hidden group`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative z-10">
          <h3 className="text-xl font-black mb-3 uppercase tracking-wide group-hover:text-primary transition-colors">
            {name}
          </h3>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            {description}
          </p>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center justify-center h-10 px-5 bg-primary text-primary-foreground text-sm font-bold uppercase tracking-wider rounded-lg shadow-[0_0_20px_rgba(0,255,136,0.3)] group-hover:shadow-[0_0_30px_rgba(0,255,136,0.6)] transition-all">
              Play Now
            </span>
            <motion.div
              className="text-2xl"
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              →
            </motion.div>
          </div>
        </div>

        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all duration-500" />
      </Link>
    </motion.div>
  );
}
