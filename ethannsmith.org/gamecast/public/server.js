const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  socket.on("join", ({ gameId, role }) => {
    socket.join(gameId);
    socket.data.gameId = gameId;
    socket.data.role = role;
    if (role === "viewer") socket.to(gameId).emit("watcher", { viewerId: socket.id });
  });

  socket.on("signal", ({ to, from, sdp, candidate }) => {
    if (to) io.to(to).emit("signal", { from, sdp, candidate });
  });

  socket.on("game:update", ({ gameId, state }) => {
    io.to(gameId).emit("game:update", state);
  });
});

server.listen(4000, () => console.log("Server running at http://localhost:4000"));
