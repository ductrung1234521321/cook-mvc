import { EventEmitter } from "events";

// Central event bus for intra-process pub/sub (e.g., to fan out to WebSockets)
export const appEvents = new EventEmitter();
appEvents.setMaxListeners(0); // Unlimited listeners for modular features

export const EVENT_NAMES = {
    COMMENT_CREATED: "comment.created",
    RECIPE_LIKED: "recipe.liked",
    USER_FOLLOWED: "user.followed",
};
