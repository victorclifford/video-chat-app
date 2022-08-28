const express = require("express");
const app = express();
const server = require("http").createServer(app);
const cors = require("cors");
const path = require("path");

const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

app.use(cors());

const PORT = process.env.PORT || 5050;

app.get("/api", (req, res) => {
  res.send("server is running...");
});

//deployement---------------------
app.use(express.static(path.join(__dirname, "/client/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "/client/build", "index.html"));
});

io.on("connection", (Socket) => {
  Socket.emit("me", Socket.id);

  Socket.on("disconnect", () => {
    Socket.broadcast.emit("callended");
  });

  Socket.on("calluser", ({ userToCall, signalData, from, name }) => {
    io.to(userToCall).emit("calluser", { signal: signalData, from, name });
  });

  Socket.on("answercall", (data) => {
    io.to(data.to).emit("callaccepted", data.signal);
  });
});

server.listen(PORT, () => console.log(`server is running on port ${PORT}...`));
