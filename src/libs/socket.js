import { Server } from "socket.io";

let ioInstance = null;

export function initSocket(httpServer) {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  ioInstance.on("connection", (socket) => {
    socket.on("join_recipe", (recipeId) => {
      if (!recipeId) return;
      socket.join(String(recipeId));
    });
  });

  console.log("[Socket.IO] ready");
  return ioInstance;
}

export function getIO() {
  if (!ioInstance) {
    throw new Error("Socket.IO not initialized");
  }
  return ioInstance;
}
