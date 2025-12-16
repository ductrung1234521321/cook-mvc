import { prisma } from './prisma.js';
import { appEvents, EVENT_NAMES } from './events.js';
import { sendPushToUser } from './push.js';

let registered = false;

function formatUserName(user) {
  return user?.fullName || user?.nickName || user?.email || 'Someone';
}

async function handleCommentCreated(payload) {
  const { recipeId, comment } = payload;
  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    select: { authorId: true, title: true },
  });
  if (!recipe || !recipe.authorId) return;
  if (recipe.authorId === comment.userId) return; // do not notify self

  const actorName = formatUserName(comment.user);
  await sendPushToUser(recipe.authorId, {
    notification: {
      title: 'Bình luận mới',
      body: `${actorName} đã bình luận công thức của bạn`,
    },
    data: {
      type: 'COMMENT_RECIPE',
      recipeId,
      commentId: comment.id,
    },
  });
}

async function handleRecipeLiked(payload) {
  const { recipeId, actorId } = payload;
  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    select: { authorId: true, title: true },
  });
  if (!recipe || !recipe.authorId) return;
  if (recipe.authorId === actorId) return;

  const actor = await prisma.user.findUnique({
    where: { id: actorId },
    select: { fullName: true, nickName: true, email: true },
  });

  const actorName = formatUserName(actor);
  await sendPushToUser(recipe.authorId, {
    notification: {
      title: 'Có lượt thích mới',
      body: `${actorName} đã thích: ${recipe.title ?? 'công thức của bạn'}`,
    },
    data: {
      type: 'LIKE_RECIPE',
      recipeId,
    },
  });
}

async function handleUserFollowed(payload) {
  const { followerId, targetUserId } = payload;
  if (followerId === targetUserId) return;
  const follower = await prisma.user.findUnique({
    where: { id: followerId },
    select: { fullName: true, nickName: true, email: true },
  });
  const actorName = formatUserName(follower);

  await sendPushToUser(targetUserId, {
    notification: {
      title: 'Bạn có người theo dõi mới',
      body: `${actorName} đã theo dõi bạn`,
    },
    data: {
      type: 'FOLLOW',
      followerId,
    },
  });
}

export function registerNotificationListeners() {
  if (registered) return;
  registered = true;

  appEvents.on(EVENT_NAMES.COMMENT_CREATED, (payload) => {
    handleCommentCreated(payload).catch((err) =>
      console.warn('[push] comment handler failed:', err.message)
    );
  });

  appEvents.on(EVENT_NAMES.RECIPE_LIKED, (payload) => {
    handleRecipeLiked(payload).catch((err) =>
      console.warn('[push] like handler failed:', err.message)
    );
  });

  appEvents.on(EVENT_NAMES.USER_FOLLOWED, (payload) => {
    handleUserFollowed(payload).catch((err) =>
      console.warn('[push] follow handler failed:', err.message)
    );
  });
}
