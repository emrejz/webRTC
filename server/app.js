const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);

let users = [];

io.on("connection", (socket) => {
  users.push(socket.id);

  socket.emit("all users", users);

  socket.on("sending signal", (payload) => {
    socket.broadcast.emit("user joined", {
      signal: payload.signal,
      callerID: payload.callerID,
    });
  });

  socket.on("returning signal", (payload) => {
    socket.broadcast.emit("receiving returned signal", {
      signal: payload.signal,
      id: socket.id,
    });
  });

  socket.on("disconnect", () => {
    users = users.filter((id) => id != socket.id);
  });
});
server.listen(process.env.PORT || 3001, () =>
  console.log("server is running on port 3001")
);
