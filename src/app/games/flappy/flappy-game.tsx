"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { playSound } from "@/lib/sounds";

interface FlappyGameProps {
  isPlaying: boolean;
  isPaused: boolean;
  onGameOver: (score: number) => void;
  onScoreUpdate: (score: number) => void;
}

interface Pipe {
  x: number;
  gapY: number;
  passed: boolean;
}

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const BIRD_SIZE = 24;
const BIRD_X = 80;
const GRAVITY = 0.35;
const JUMP_FORCE = -7;
const PIPE_WIDTH = 52;
const PIPE_GAP = 180;
const PIPE_SPEED = 2.5;
const PIPE_SPAWN_INTERVAL = 2200;

export function FlappyGame({ isPlaying, isPaused, onGameOver, onScoreUpdate }: FlappyGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef({
    birdY: CANVAS_HEIGHT / 2,
    birdVelocity: 0,
    pipes: [] as Pipe[],
    score: 0,
    lastPipeSpawn: 0,
    started: false,
  });
  const animationRef = useRef<number>(undefined);
  const [showTapHint, setShowTapHint] = useState(true);

  const resetGame = useCallback(() => {
    gameStateRef.current = {
      birdY: CANVAS_HEIGHT / 2,
      birdVelocity: 0,
      pipes: [],
      score: 0,
      lastPipeSpawn: 0,
      started: false,
    };
    setShowTapHint(true);
    onScoreUpdate(0);
  }, [onScoreUpdate]);

  const jump = useCallback(() => {
    if (!isPlaying || isPaused) return;
    const state = gameStateRef.current;
    if (!state.started) {
      state.started = true;
      setShowTapHint(false);
    }
    state.birdVelocity = JUMP_FORCE;
    playSound("flap");
  }, [isPlaying, isPaused]);

  const spawnPipe = useCallback(() => {
    const minGapY = PIPE_GAP / 2 + 80;
    const maxGapY = CANVAS_HEIGHT - PIPE_GAP / 2 - 80;
    const gapY = Math.random() * (maxGapY - minGapY) + minGapY;
    
    gameStateRef.current.pipes.push({
      x: CANVAS_WIDTH,
      gapY,
      passed: false,
    });
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const state = gameStateRef.current;
    const isDark = document.documentElement.classList.contains("dark");

    ctx.fillStyle = isDark ? "#18181b" : "#f4f4f5";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = isDark ? "#3f3f46" : "#d4d4d8";
    state.pipes.forEach((pipe) => {
      const topPipeHeight = pipe.gapY - PIPE_GAP / 2;
      ctx.fillRect(pipe.x, 0, PIPE_WIDTH, topPipeHeight);
      
      const bottomPipeY = pipe.gapY + PIPE_GAP / 2;
      ctx.fillRect(pipe.x, bottomPipeY, PIPE_WIDTH, CANVAS_HEIGHT - bottomPipeY);
    });

    ctx.fillStyle = isDark ? "#fafafa" : "#18181b";
    ctx.beginPath();
    ctx.arc(BIRD_X, state.birdY, BIRD_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = isDark ? "#fafafa" : "#18181b";
    ctx.font = "bold 48px var(--font-mono)";
    ctx.textAlign = "center";
    ctx.fillText(String(state.score), CANVAS_WIDTH / 2, 70);

    if (!state.started) {
      ctx.fillStyle = isDark ? "rgba(250,250,250,0.7)" : "rgba(24,24,27,0.7)";
      ctx.font = "18px var(--font-sans)";
      ctx.fillText("Tap or Press Space to Start", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60);
    }
  }, []);

  const update = useCallback((): boolean => {
    const state = gameStateRef.current;

    if (!state.started) {
      return true;
    }

    state.birdVelocity += GRAVITY;
    state.birdY += state.birdVelocity;

    if (state.birdY < BIRD_SIZE / 2 || state.birdY > CANVAS_HEIGHT - BIRD_SIZE / 2) {
      onGameOver(state.score * 10);
      return false;
    }

    state.pipes = state.pipes.filter((pipe) => pipe.x > -PIPE_WIDTH);

    let collision = false;
    state.pipes.forEach((pipe) => {
      pipe.x -= PIPE_SPEED;

      if (!pipe.passed && pipe.x + PIPE_WIDTH < BIRD_X) {
        pipe.passed = true;
        state.score += 1;
        onScoreUpdate(state.score * 10);
        playSound("score");
      }

      const birdLeft = BIRD_X - BIRD_SIZE / 2 + 4;
      const birdRight = BIRD_X + BIRD_SIZE / 2 - 4;
      const birdTop = state.birdY - BIRD_SIZE / 2 + 4;
      const birdBottom = state.birdY + BIRD_SIZE / 2 - 4;

      const pipeLeft = pipe.x;
      const pipeRight = pipe.x + PIPE_WIDTH;
      const gapTop = pipe.gapY - PIPE_GAP / 2;
      const gapBottom = pipe.gapY + PIPE_GAP / 2;

      if (birdRight > pipeLeft && birdLeft < pipeRight) {
        if (birdTop < gapTop || birdBottom > gapBottom) {
          collision = true;
        }
      }
    });

    if (collision) {
      onGameOver(state.score * 10);
      return false;
    }

    return true;
  }, [onGameOver, onScoreUpdate]);

  const gameLoop = useCallback(
    (timestamp: number) => {
      if (!isPlaying || isPaused) {
        animationRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      const state = gameStateRef.current;
      
      if (state.started && timestamp - state.lastPipeSpawn > PIPE_SPAWN_INTERVAL) {
        spawnPipe();
        state.lastPipeSpawn = timestamp;
      }

      const continueGame = update();
      if (!continueGame) return;

      draw();
      animationRef.current = requestAnimationFrame(gameLoop);
    },
    [isPlaying, isPaused, update, draw, spawnPipe]
  );

  useEffect(() => {
    if (isPlaying) {
      resetGame();
    }
  }, [isPlaying, resetGame]);

  useEffect(() => {
    if (isPlaying) {
      gameStateRef.current.lastPipeSpawn = performance.now();
      animationRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, gameLoop]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        jump();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [jump]);

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border border-border rounded-lg cursor-pointer touch-none max-w-full"
        onClick={jump}
        onTouchStart={(e) => {
          e.preventDefault();
          jump();
        }}
      />
      <p className="text-sm text-muted-foreground">
        Press Space or tap to jump
      </p>
    </div>
  );
}
