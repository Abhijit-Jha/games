"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { playSound } from "@/lib/sounds";

interface TrexGameProps {
  isPlaying: boolean;
  isPaused: boolean;
  onGameOver: (score: number) => void;
  onScoreUpdate: (score: number) => void;
}

interface Obstacle {
  x: number;
  width: number;
  height: number;
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 200;
const GROUND_Y = 160;
const DINO_WIDTH = 40;
const DINO_HEIGHT = 44;
const DINO_X = 60;
const GRAVITY = 0.8;
const JUMP_FORCE = -14;
const INITIAL_SPEED = 6;
const MAX_SPEED = 14;
const SPEED_INCREMENT = 0.001;
const MIN_OBSTACLE_GAP = 300;
const MAX_OBSTACLE_GAP = 600;

export function TrexGame({ isPlaying, isPaused, onGameOver, onScoreUpdate }: TrexGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef({
    dinoY: GROUND_Y - DINO_HEIGHT,
    dinoVelocity: 0,
    isJumping: false,
    obstacles: [] as Obstacle[],
    score: 0,
    speed: INITIAL_SPEED,
    nextObstacleDistance: 0,
    distance: 0,
  });
  const animationRef = useRef<number>(undefined);
  const [, forceUpdate] = useState({});

  const resetGame = useCallback(() => {
    gameStateRef.current = {
      dinoY: GROUND_Y - DINO_HEIGHT,
      dinoVelocity: 0,
      isJumping: false,
      obstacles: [],
      score: 0,
      speed: INITIAL_SPEED,
      nextObstacleDistance: MIN_OBSTACLE_GAP,
      distance: 0,
    };
    onScoreUpdate(0);
  }, [onScoreUpdate]);

  const jump = useCallback(() => {
    const state = gameStateRef.current;
    if (!state.isJumping) {
      state.dinoVelocity = JUMP_FORCE;
      state.isJumping = true;
      playSound("jump");
    }
  }, []);

  const spawnObstacle = useCallback(() => {
    const height = 30 + Math.random() * 30;
    const width = 20 + Math.random() * 20;
    
    gameStateRef.current.obstacles.push({
      x: CANVAS_WIDTH,
      width,
      height,
    });

    gameStateRef.current.nextObstacleDistance = 
      MIN_OBSTACLE_GAP + Math.random() * (MAX_OBSTACLE_GAP - MIN_OBSTACLE_GAP);
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

    ctx.fillStyle = isDark ? "#27272a" : "#e4e4e7";
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, 2);

    ctx.fillStyle = isDark ? "#fafafa" : "#0a0a0a";
    ctx.fillRect(DINO_X, state.dinoY, DINO_WIDTH, DINO_HEIGHT);

    state.obstacles.forEach((obstacle) => {
      ctx.fillStyle = isDark ? "#71717a" : "#a1a1aa";
      ctx.fillRect(
        obstacle.x,
        GROUND_Y - obstacle.height,
        obstacle.width,
        obstacle.height
      );
    });

    ctx.fillStyle = isDark ? "#fafafa" : "#0a0a0a";
    ctx.font = "bold 24px var(--font-mono)";
    ctx.textAlign = "right";
    ctx.fillText(String(state.score), CANVAS_WIDTH - 20, 40);
  }, []);

  const update = useCallback((): boolean => {
    const state = gameStateRef.current;

    state.dinoVelocity += GRAVITY;
    state.dinoY += state.dinoVelocity;

    if (state.dinoY >= GROUND_Y - DINO_HEIGHT) {
      state.dinoY = GROUND_Y - DINO_HEIGHT;
      state.dinoVelocity = 0;
      state.isJumping = false;
    }

    state.distance += state.speed;
    state.nextObstacleDistance -= state.speed;

    if (state.nextObstacleDistance <= 0) {
      spawnObstacle();
    }

    state.obstacles = state.obstacles.filter((o) => o.x > -o.width);

    let collision = false;
    state.obstacles.forEach((obstacle) => {
      obstacle.x -= state.speed;

      const dinoRight = DINO_X + DINO_WIDTH - 8;
      const dinoLeft = DINO_X + 8;
      const dinoBottom = state.dinoY + DINO_HEIGHT;
      const dinoTop = state.dinoY + 4;

      const obstacleLeft = obstacle.x;
      const obstacleRight = obstacle.x + obstacle.width;
      const obstacleTop = GROUND_Y - obstacle.height;

      if (
        dinoRight > obstacleLeft &&
        dinoLeft < obstacleRight &&
        dinoBottom > obstacleTop &&
        dinoTop < GROUND_Y
      ) {
        collision = true;
      }
    });

    if (collision) {
      onGameOver(state.score);
      return false;
    }

    state.speed = Math.min(MAX_SPEED, INITIAL_SPEED + state.distance * SPEED_INCREMENT);

    const newScore = Math.floor(state.distance / 50);
    if (newScore > state.score) {
      state.score = newScore;
      onScoreUpdate(state.score);
      
      if (state.score % 20 === 0 && state.score > 0) {
        playSound("score");
      }
    }

    return true;
  }, [spawnObstacle, onGameOver, onScoreUpdate]);

  const gameLoop = useCallback(() => {
    if (!isPlaying || isPaused) {
      animationRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    const continueGame = update();
    if (!continueGame) return;

    draw();
    animationRef.current = requestAnimationFrame(gameLoop);
  }, [isPlaying, isPaused, update, draw]);

  useEffect(() => {
    if (isPlaying) {
      resetGame();
      forceUpdate({});
    }
  }, [isPlaying, resetGame]);

  useEffect(() => {
    if (isPlaying) {
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
      if (!isPlaying || isPaused) return;
      
      if (e.code === "Space" || e.key === " " || e.key === "ArrowUp") {
        e.preventDefault();
        jump();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, isPaused, jump]);

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
        Press Space, Up Arrow, or tap to jump
      </p>
    </div>
  );
}
