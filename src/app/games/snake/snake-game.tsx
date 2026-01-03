"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { playSound } from "@/lib/sounds";

interface SnakeGameProps {
  isPlaying: boolean;
  isPaused: boolean;
  onGameOver: (score: number) => void;
  onScoreUpdate: (score: number) => void;
}

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Position = { x: number; y: number };

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;
const SPEED_INCREMENT = 5;
const MIN_SPEED = 50;

export function SnakeGame({ isPlaying, isPaused, onGameOver, onScoreUpdate }: SnakeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef({
    snake: [{ x: 10, y: 10 }] as Position[],
    direction: "RIGHT" as Direction,
    nextDirection: "RIGHT" as Direction,
    food: { x: 15, y: 10 } as Position,
    score: 0,
    speed: INITIAL_SPEED,
  });
  const animationRef = useRef<number>(undefined);
  const lastUpdateRef = useRef<number>(0);
  const [, forceUpdate] = useState({});

  const generateFood = useCallback((): Position => {
    const state = gameStateRef.current;
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (state.snake.some((s) => s.x === newFood.x && s.y === newFood.y));
    return newFood;
  }, []);

  const resetGame = useCallback(() => {
    gameStateRef.current = {
      snake: [{ x: 10, y: 10 }],
      direction: "RIGHT",
      nextDirection: "RIGHT",
      food: { x: 15, y: 10 },
      score: 0,
      speed: INITIAL_SPEED,
    };
    onScoreUpdate(0);
  }, [onScoreUpdate]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const state = gameStateRef.current;
    const isDark = document.documentElement.classList.contains("dark");

    ctx.fillStyle = isDark ? "#18181b" : "#f4f4f5";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = isDark ? "#27272a" : "#e4e4e7";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, GRID_SIZE * CELL_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(GRID_SIZE * CELL_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }

    ctx.fillStyle = isDark ? "#fafafa" : "#0a0a0a";
    state.snake.forEach((segment, index) => {
      const opacity = 1 - (index / state.snake.length) * 0.5;
      ctx.globalAlpha = opacity;
      ctx.fillRect(
        segment.x * CELL_SIZE + 1,
        segment.y * CELL_SIZE + 1,
        CELL_SIZE - 2,
        CELL_SIZE - 2
      );
    });
    ctx.globalAlpha = 1;

    ctx.fillStyle = isDark ? "#fafafa" : "#0a0a0a";
    ctx.beginPath();
    ctx.arc(
      state.food.x * CELL_SIZE + CELL_SIZE / 2,
      state.food.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }, []);

  const update = useCallback(() => {
    const state = gameStateRef.current;
    state.direction = state.nextDirection;

    const head = { ...state.snake[0] };
    switch (state.direction) {
      case "UP":
        head.y -= 1;
        break;
      case "DOWN":
        head.y += 1;
        break;
      case "LEFT":
        head.x -= 1;
        break;
      case "RIGHT":
        head.x += 1;
        break;
    }

    if (
      head.x < 0 ||
      head.x >= GRID_SIZE ||
      head.y < 0 ||
      head.y >= GRID_SIZE ||
      state.snake.some((s) => s.x === head.x && s.y === head.y)
    ) {
      onGameOver(state.score);
      return false;
    }

    state.snake.unshift(head);

    if (head.x === state.food.x && head.y === state.food.y) {
      state.score += 10;
      state.food = generateFood();
      state.speed = Math.max(MIN_SPEED, state.speed - SPEED_INCREMENT);
      onScoreUpdate(state.score);
      playSound("score");
    } else {
      state.snake.pop();
    }

    return true;
  }, [generateFood, onGameOver, onScoreUpdate]);

  const gameLoop = useCallback(
    (timestamp: number) => {
      if (!isPlaying || isPaused) {
        animationRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      const elapsed = timestamp - lastUpdateRef.current;
      if (elapsed >= gameStateRef.current.speed) {
        lastUpdateRef.current = timestamp;
        const continueGame = update();
        if (!continueGame) return;
      }

      draw();
      animationRef.current = requestAnimationFrame(gameLoop);
    },
    [isPlaying, isPaused, update, draw]
  );

  useEffect(() => {
    if (isPlaying) {
      resetGame();
      forceUpdate({});
    }
  }, [isPlaying, resetGame]);

  useEffect(() => {
    if (isPlaying) {
      lastUpdateRef.current = performance.now();
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

      const state = gameStateRef.current;
      const keyMap: Record<string, Direction> = {
        ArrowUp: "UP",
        ArrowDown: "DOWN",
        ArrowLeft: "LEFT",
        ArrowRight: "RIGHT",
        w: "UP",
        s: "DOWN",
        a: "LEFT",
        d: "RIGHT",
        W: "UP",
        S: "DOWN",
        A: "LEFT",
        D: "RIGHT",
      };

      const newDirection = keyMap[e.key];
      if (!newDirection) return;

      const opposites: Record<Direction, Direction> = {
        UP: "DOWN",
        DOWN: "UP",
        LEFT: "RIGHT",
        RIGHT: "LEFT",
      };

      if (opposites[newDirection] !== state.direction) {
        state.nextDirection = newDirection;
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, isPaused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isPlaying || isPaused) return;

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const dx = touchEndX - touchStartX;
      const dy = touchEndY - touchStartY;

      if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return;

      const state = gameStateRef.current;
      let newDirection: Direction;

      if (Math.abs(dx) > Math.abs(dy)) {
        newDirection = dx > 0 ? "RIGHT" : "LEFT";
      } else {
        newDirection = dy > 0 ? "DOWN" : "UP";
      }

      const opposites: Record<Direction, Direction> = {
        UP: "DOWN",
        DOWN: "UP",
        LEFT: "RIGHT",
        RIGHT: "LEFT",
      };

      if (opposites[newDirection] !== state.direction) {
        state.nextDirection = newDirection;
      }
    };

    canvas.addEventListener("touchstart", handleTouchStart);
    canvas.addEventListener("touchend", handleTouchEnd);

    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isPlaying, isPaused]);

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas
        ref={canvasRef}
        width={GRID_SIZE * CELL_SIZE}
        height={GRID_SIZE * CELL_SIZE}
        className="border border-border rounded-lg"
      />
      <p className="text-sm text-muted-foreground">
        Use arrow keys or WASD to move. Swipe on mobile.
      </p>
    </div>
  );
}
