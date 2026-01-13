import { GameCard } from "@/components/game-card";

const GAMES = [
  {
    id: "snake" as const,
    name: "Snake Royale",
    description: "Classic snake with increasing speed. Eat to grow, avoid walls and yourself.",
  },
  {
    id: "flappy" as const,
    name: "Flappy Bird Duel",
    description: "One-button gameplay. Navigate through procedural pipes.",
  },
  {
    id: "typing" as const,
    name: "Typing Race",
    description: "Terminal-style typing test. Same daily text for all players.",
  },
  {
    id: "reaction" as const,
    name: "Reaction Time",
    description: "Test your reflexes with millisecond precision.",
  },
  {
    id: "trex" as const,
    name: "T-Rex Runner",
    description: "Endless runner with increasing speed. Jump over obstacles.",
  },
  {
    id: "quickmath" as const,
    name: "QuickMath Rush",
    description: "Fast-paced mental math game. Solve timed arithmetic questions with increasing difficulty.",
  },
];

export default function GamesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Games</h1>
        <p className="text-muted-foreground">
          Choose a game and compete for the top spot
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {GAMES.map((game) => (
          <GameCard
            key={game.id}
            id={game.id}
            name={game.name}
            description={game.description}
          />
        ))}
      </div>
    </div>
  );
}
