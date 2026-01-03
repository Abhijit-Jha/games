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
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col">
      <div className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">{title}</h1>
            {isPlaying && (
              <p className="text-sm text-muted-foreground font-mono">
                Score: {score.toLocaleString()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isPlaying && !finalScore && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsPaused((prev) => !prev)}
              >
                {isPaused ? "Resume" : "Pause"}
              </Button>
            )}
            {!isPlaying && !finalScore && (
              <Button onClick={handleStart}>Start Game</Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        {!isPlaying && !finalScore ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h2 className="text-2xl font-semibold mb-4">{title}</h2>
            <p className="text-muted-foreground mb-6">Press Start to begin</p>
            <Button size="lg" onClick={handleStart}>
              Start Game
            </Button>
          </motion.div>
        ) : finalScore !== null ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <h2 className="text-2xl font-semibold mb-2">Game Over</h2>
            <p className="text-4xl font-mono font-bold mb-6">
              {finalScore.toLocaleString()}
            </p>
            {isSubmitting && (
              <p className="text-sm text-muted-foreground mb-4">
                Submitting score...
              </p>
            )}
            <div className="flex gap-3 justify-center">
              <Button onClick={handleStart}>Play Again</Button>
              <Button variant="secondary" onClick={() => window.location.href = "/leaderboard"}>
                Leaderboard
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="w-full max-w-4xl">
            {isPaused && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm"
              >
                <div className="text-center">
                  <h2 className="text-2xl font-semibold mb-4">Paused</h2>
                  <Button onClick={() => setIsPaused(false)}>Resume</Button>
                </div>
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
