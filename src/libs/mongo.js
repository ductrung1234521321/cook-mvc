import { MongoClient } from "mongodb";
import env from "../config/env.js";

let client;
let db;

export async function initMongo() {
  if (db) return db;
  client = new MongoClient(env.MONGODB_URI);
  await client.connect();
  db = client.db();

  // indexes
  await db.collection("comments").createIndex({ recipeId: 1 });
  await db.collection("comments").createIndex({ parentId: 1 });
  await db.collection("comments").createIndex({ path: 1 });
  await db.collection("comments").createIndex({ recipeId: 1, createdAt: 1 });
  await db.collection("recipe_likes").createIndex({ recipeId: 1, userId: 1 }, { unique: true });

  console.log("[MongoDB] connected");
  return db;
}

export function getDb() {
  if (!db) throw new Error("MongoDB not initialized");
  return db;
}
