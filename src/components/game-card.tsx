"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GameId } from "@/lib/mongodb";

interface GameCardProps {
  id: GameId;
  name: string;
  description: string;
}

export function GameCard({ id, name, description }: GameCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        href={`/games/${id}`}
        className="block p-6 bg-card border border-border rounded-lg hover:border-foreground/20 transition-colors h-full"
      >
        <h3 className="text-lg font-semibold mb-2">{name}</h3>
        <p className="text-sm text-muted-foreground mb-6">{description}</p>
        <div>
          <span className="inline-flex items-center justify-center h-9 px-4 bg-primary text-primary-foreground text-sm font-medium rounded-md">
            Play
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
