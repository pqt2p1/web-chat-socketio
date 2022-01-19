const mongoose = require("mongoose");
const Msg = require("./models/messages");
const mongoDB =
  "mongodb+srv://headknocker12:Phamthao123@cluster0.m0bcl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");

const superagent = require("superagent");

// Connect to database
mongoose.connect(mongoDB).then(() => {
  console.log("Database connected");
});

// Create socket io Server
const io = new Server(server);

app.use(express.static(__dirname + "/public"));

// Display index.html if user connected
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// Connect to socket
io.on("connection", (socket) => {
  console.log(`new client connected, socket id: ${socket.id}`);
  console.log();
  // Find 5 lastest messages
  Msg.find()
    .limit(5)
    .sort({ date: -1 })
    .exec((err, result) => {
      // Send 5 lastest messages to client
      io.to(socket.id).emit("output-messages", result);
    });

  // Listen to user chat input
  socket.on("on-chat", (data) => {
    // Save to MongoDB
    const message = new Msg({ name: data.name, msg: data.message });
    message.save().then(() => {
      // Send back to client
      io.emit("user-chat", data);
      console.log(`This is message from '${data.name}': ${data.message}`);
    });
  });

  // Listen to user search input
  socket.on("on-search", (data) => {
    console.log(data);
    Msg.find({name: data.searchMessage}).exec((err, result) => {
      // Send 5 lastest messages to client
      console.log(result);
      io.to(socket.id).emit('output-search-messages', result);
    });
  });

  // broadcastBitcoinPrice();
});

// Bitcoin price
// async function broadcastBitcoinPrice() {
//   const url = "http://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT";
//   const ms = 1000;
//   const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

//   while (true) {
//     superagent.get(url).end((err, res) => {
//       io.emit("btc-price", res.body.price);
//     });
//     await delay(5000);
//   }
// }

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

server.listen(port, () => {
  console.log("Server is running on port 3000");
});
