"use client";

import { GameWrapper } from "@/components/game-wrapper";
import { ReactionGame } from "./reaction-game";

export default function ReactionPage() {
  return (
    <GameWrapper gameId="reaction" title="Reaction Time">
      {(props) => <ReactionGame {...props} />}
    </GameWrapper>
  );
}
