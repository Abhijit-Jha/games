import { MongoClient, Db } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const MONGODB_DB = process.env.MONGODB_DB || "arcade_royale";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db(MONGODB_DB);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

export type GameId = "snake" | "flappy" | "typing" | "reaction" | "trex";

export interface Score {
  _id?: string;
  twitterHandle: string;
  gameId: GameId;
  score: number;
  createdAt: Date;
}

export interface AggregatedScore {
  twitterHandle: string;
  totalScore: number;
  gamesPlayed: number;
  scores: Record<GameId, number>;
}
