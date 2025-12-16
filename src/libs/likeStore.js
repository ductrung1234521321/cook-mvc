import { getDb } from "./mongo.js";

function likesCollection() {
  return getDb().collection("recipe_likes");
}

export async function isRecipeLiked(recipeId, userId) {
  const found = await likesCollection().findOne({ recipeId, userId });
  return !!found;
}

export async function likeRecipeMongo(recipeId, userId) {
  await likesCollection().updateOne(
    { recipeId, userId },
    { $setOnInsert: { recipeId, userId, createdAt: new Date().toISOString() } },
    { upsert: true }
  );
  return countRecipeLikes(recipeId);
}

export async function unlikeRecipeMongo(recipeId, userId) {
  await likesCollection().deleteOne({ recipeId, userId });
  return countRecipeLikes(recipeId);
}

export async function countRecipeLikes(recipeId) {
  return likesCollection().countDocuments({ recipeId });
}
