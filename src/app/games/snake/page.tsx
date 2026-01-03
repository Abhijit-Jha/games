"use client";

import { GameWrapper } from "@/components/game-wrapper";
import { SnakeGame } from "./snake-game";

export default function SnakePage() {
  return (
    <GameWrapper gameId="snake" title="Snake Royale">
      {(props) => <SnakeGame {...props} />}
    </GameWrapper>
  );
}
