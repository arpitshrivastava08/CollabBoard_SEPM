const { createServer } = require("http");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = Number(process.env.PORT || 3000);
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const rooms = new Map();

function roomUsers(roomId) {
  const room = rooms.get(roomId);
  if (!room) return [];
  return Array.from(room.values()).map((user) => ({ id: user.id, name: user.name }));
}

function ensureRoom(roomId) {
  if (!rooms.has(roomId)) rooms.set(roomId, new Map());
  return rooms.get(roomId);
}

app.prepare().then(() => {
  const httpServer = createServer((req, res) => handle(req, res));
  const io = new Server(httpServer, {
    cors: { origin: process.env.SOCKET_CORS_ORIGIN || true },
    maxHttpBufferSize: 1e6
  });

  io.on("connection", (socket) => {
    socket.on("room:join", ({ roomId, name }) => {
      if (typeof roomId !== "string" || !/^[a-zA-Z0-9_-]{1,40}$/.test(roomId)) {
        socket.emit("room:error", "Room ID must be 1–40 letters, numbers, underscores or hyphens.");
        return;
      }
      const safeName = String(name || "Guest").trim().slice(0, 24) || "Guest";
      const previous = socket.data.roomId;
      if (previous && previous !== roomId) {
        socket.leave(previous);
        const oldRoom = rooms.get(previous);
        if (oldRoom) {
          oldRoom.delete(socket.id);
          io.to(previous).emit("room:users", roomUsers(previous));
          if (oldRoom.size === 0) rooms.delete(previous);
        }
      }
      socket.data.roomId = roomId;
      socket.data.name = safeName;
      socket.join(roomId);
      ensureRoom(roomId).set(socket.id, { id: socket.id, name: safeName });
      socket.emit("room:joined", { roomId, users: roomUsers(roomId) });
      io.to(roomId).emit("room:users", roomUsers(roomId));
    });

    socket.on("board:stroke", (stroke) => {
      const roomId = socket.data.roomId;
      if (!roomId || !stroke || !Array.isArray(stroke.points) || stroke.points.length > 3000) return;
      const clean = {
        id: String(stroke.id || socket.id + "-" + Date.now()).slice(0, 100),
        color: /^#[0-9a-fA-F]{6}$/.test(stroke.color) ? stroke.color : "#111827",
        width: Math.max(1, Math.min(24, Number(stroke.width) || 3)),
        points: stroke.points.slice(0, 3000).map((p) => ({
          x: Math.max(0, Math.min(1, Number(p.x) || 0)),
          y: Math.max(0, Math.min(1, Number(p.y) || 0))
        }))
      };
      socket.to(roomId).emit("board:stroke", clean);
    });

    socket.on("board:erase", ({ id }) => {
      const roomId = socket.data.roomId;
      if (roomId && typeof id === "string") socket.to(roomId).emit("board:erase", { id });
    });

    socket.on("board:clear", () => {
      const roomId = socket.data.roomId;
      if (roomId) io.to(roomId).emit("board:clear");
    });

    socket.on("disconnect", () => {
      const roomId = socket.data.roomId;
      if (!roomId) return;
      const room = rooms.get(roomId);
      if (room) {
        room.delete(socket.id);
        io.to(roomId).emit("room:users", roomUsers(roomId));
        if (room.size === 0) rooms.delete(roomId);
      }
    });
  });

  httpServer.listen(port, () => {
    console.log(`> CollabBoard ready on http://${hostname}:${port}`);
  });
});
