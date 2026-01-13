"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GameId } from "@/lib/mongodb";
import { playSound } from "@/lib/sounds";
import { useState } from "react";

interface GameCardProps {
  id: GameId;
  name: string;
  description: string;
}

const cardColors = {
  snake: { border: "var(--neon-green)", glow: "var(--primary-glow)" },
  flappy: { border: "var(--neon-blue)", glow: "var(--accent-glow)" },
  typing: { border: "var(--neon-magenta)", glow: "var(--secondary-glow)" },
  reaction: { border: "var(--neon-yellow)", glow: "rgba(255, 255, 0, 0.3)" },
  trex: { border: "var(--neon-orange)", glow: "rgba(255, 107, 0, 0.3)" },
};

export function GameCard({ id, name, description }: GameCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const colors = cardColors[id];

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onHoverStart={() => {
        setIsHovered(true);
        playSound("click");
      }}
      onHoverEnd={() => setIsHovered(false)}
      className="h-full"
    >
      <Link
        href={`/games/${id}`}
        className="block relative overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${colors.glow} 0%, transparent 70%)`,
          }}
        />
        <motion.div
          className="relative p-6 bg-card border-2 rounded-xl h-full flex flex-col"
          style={{
            borderColor: isHovered ? colors.border : "var(--border)",
            boxShadow: isHovered
              ? `0 0 30px ${colors.glow}, 0 0 60px ${colors.glow}`
              : "0 4px 12px rgba(0, 0, 0, 0.5)",
          }}
          animate={{
            borderColor: isHovered ? colors.border : "var(--border)",
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex-1">
            <h3 className="text-xl font-black mb-3 uppercase tracking-wide" style={{ color: isHovered ? colors.border : "var(--foreground)" }}>
              {name}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <motion.span
              className="inline-flex items-center justify-center h-10 px-5 text-xs font-bold uppercase tracking-wider rounded-lg relative overflow-hidden"
              style={{
                backgroundColor: isHovered ? colors.border : "var(--primary)",
                color: "var(--primary-foreground)",
                boxShadow: isHovered ? `0 0 20px ${colors.glow}` : "none",
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10">Play Now</span>
            </motion.span>
            <motion.div
              className="text-4xl opacity-20"
              animate={{ rotate: isHovered ? 360 : 0 }}
              transition={{ duration: 0.5 }}
            >
              {id === "snake" && "🐍"}
              {id === "flappy" && "🐦"}
              {id === "typing" && "⌨️"}
              {id === "reaction" && "⚡"}
              {id === "trex" && "🦖"}
            </motion.div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
