const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);

io.on("connection", (socket) => {
  console.log(socket.id);
  socket.on("disconnect", () => {
    console.log("disconnect");
  });
});

server.listen(process.env.PORT || 3001, () =>
  console.log("server is running on port 3001")
);
