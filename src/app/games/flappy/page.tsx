"use client";

import { GameWrapper } from "@/components/game-wrapper";
import { FlappyGame } from "./flappy-game";

export default function FlappyPage() {
  return (
    <GameWrapper gameId="flappy" title="Flappy Bird Duel">
      {(props) => <FlappyGame {...props} />}
    </GameWrapper>
  );
}
