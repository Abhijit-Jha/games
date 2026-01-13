"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "./button";
import { TwitterHandleModal } from "./twitter-handle-modal";
import { getTwitterHandle } from "@/lib/user";
import { submitScore } from "@/lib/api";
import { GameId } from "@/lib/mongodb";
import { showToast } from "./toaster";
import { playSound } from "@/lib/sounds";

interface GameWrapperProps {
  gameId: GameId;
  title: string;
  children: (props: {
    isPlaying: boolean;
    isPaused: boolean;
    onGameOver: (score: number) => void;
    onScoreUpdate: (score: number) => void;
  }) => React.ReactNode;
}

export function GameWrapper({ gameId, title, children }: GameWrapperProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [showHandleModal, setShowHandleModal] = useState(false);
  const [twitterHandle, setTwitterHandleState] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setTwitterHandleState(getTwitterHandle());
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isPlaying && !finalScore) {
        setIsPaused((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, finalScore]);

  const handleStart = () => {
    if (!twitterHandle) {
      setShowHandleModal(true);
      return;
    }
    setIsPlaying(true);
    setIsPaused(false);
    setScore(0);
    setFinalScore(null);
  };

  const handleHandleComplete = (handle: string) => {
    setTwitterHandleState(handle);
    setShowHandleModal(false);
    setIsPlaying(true);
    setIsPaused(false);
    setScore(0);
    setFinalScore(null);
  };

  const handleGameOver = useCallback(async (endScore: number) => {
    setFinalScore(endScore);
    setIsPlaying(false);
    playSound("gameOver");

    const handle = getTwitterHandle();
    if (handle && endScore > 0) {
      setIsSubmitting(true);
      try {
        const result = await submitScore(handle, gameId, endScore);
        if (result.rank && result.rank <= 10) {
          showToast(`New high score! Rank #${result.rank}`, "success");
        }
      } catch {
        showToast("Failed to submit score", "error");
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [gameId]);

  const handleScoreUpdate = useCallback((newScore: number) => {
    setScore(newScore);
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      <div className="border-b-2 border-border-bright bg-card/90 backdrop-blur-md sticky top-16 z-40">
        <div className="max-w-4xl mx-auto px-4 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-neon-green">{title}</h1>
            {isPlaying && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mt-2 flex items-center gap-3"
              >
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Score</span>
                <motion.span
                  key={score}
                  initial={{ scale: 1.2, color: "var(--neon-green)" }}
                  animate={{ scale: 1, color: "var(--foreground)" }}
                  className="text-2xl font-black font-mono"
                >
                  {score.toLocaleString()}
                </motion.span>
              </motion.div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {isPlaying && !finalScore && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPaused((prev) => !prev)}
              >
                {isPaused ? "▶ Resume" : "⏸ Pause"}
              </Button>
            )}
            {!isPlaying && !finalScore && (
              <Button onClick={handleStart} size="md">▶ Start Game</Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 relative">
        {!isPlaying && !finalScore ? (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="text-center relative"
          >
            <div className="absolute inset-0 blur-3xl bg-primary/10 rounded-full" />
            <div className="relative bg-card border-2 border-border-bright rounded-2xl p-12 max-w-md">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-6xl mb-6"
              >
                🎮
              </motion.div>
              <h2 className="text-3xl font-black mb-4 uppercase">{title}</h2>
              <p className="text-muted-foreground mb-8 text-lg">Ready to compete?</p>
              <Button size="lg" onClick={handleStart}>
                ▶ Start Game
              </Button>
              <p className="text-xs text-muted-foreground mt-6 uppercase tracking-wider">
                Press ESC to pause during game
              </p>
            </div>
          </motion.div>
        ) : finalScore !== null ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="text-center relative"
          >
            <div className="absolute inset-0 blur-3xl bg-destructive/20 rounded-full" />
            <div className="relative bg-card border-2 border-destructive rounded-2xl p-12 max-w-md">
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
                className="text-6xl mb-6"
              >
                💀
              </motion.div>
              <h2 className="text-3xl font-black mb-4 uppercase text-destructive">Game Over</h2>
              <div className="mb-8">
                <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Final Score</p>
                <motion.p
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="text-6xl font-black font-mono text-neon-green"
                  style={{ textShadow: "0 0 20px var(--primary-glow)" }}
                >
                  {finalScore.toLocaleString()}
                </motion.p>
              </div>
              {isSubmitting && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-muted-foreground mb-4 uppercase tracking-wider"
                >
                  📡 Submitting score...
                </motion.p>
              )}
              <div className="flex flex-col gap-3 justify-center">
                <Button onClick={handleStart} size="lg">🔄 Play Again</Button>
                <Button variant="secondary" size="lg" onClick={() => window.location.href = "/leaderboard"}>
                  🏆 View Leaderboard
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="w-full max-w-4xl">
            {isPaused && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-40 flex items-center justify-center bg-background/90 backdrop-blur-md"
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="text-center bg-card border-2 border-border-bright rounded-2xl p-12 max-w-sm"
                >
                  <div className="text-5xl mb-6">⏸️</div>
                  <h2 className="text-3xl font-black mb-6 uppercase">Paused</h2>
                  <div className="space-y-3">
                    <Button onClick={() => setIsPaused(false)} size="lg">▶ Resume Game</Button>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      Press ESC to resume
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}
            {children({
              isPlaying,
              isPaused,
              onGameOver: handleGameOver,
              onScoreUpdate: handleScoreUpdate,
            })}
          </div>
        )}
      </div>

      <TwitterHandleModal
        isOpen={showHandleModal}
        onComplete={handleHandleComplete}
      />
    </div>
  );
}
