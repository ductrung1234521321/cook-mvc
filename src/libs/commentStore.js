import { getDb } from "./mongo.js";

function commentsCollection() {
  return getDb().collection("comments");
}

export async function insertComment(doc) {
  await commentsCollection().insertOne(doc);
  return doc;
}

export async function findCommentById(id) {
  return commentsCollection().findOne({ id });
}

export async function listCommentsByRecipe(recipeId, skip = 0, limit = 50) {
  return commentsCollection()
    .find({ recipeId })
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(limit)
    .toArray();
}

export async function countCommentsByRecipe(recipeId) {
  return commentsCollection().countDocuments({ recipeId });
}

export async function countReplies(parentId) {
  return commentsCollection().countDocuments({ parentId });
}

export async function listAllCommentsForRecipe(recipeId) {
  return commentsCollection().find({ recipeId }).sort({ createdAt: 1 }).toArray();
}
