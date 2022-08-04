const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const { Server } = require("socket.io");
const io = new Server(server, {cors: {origin: '*'}});

app.use(express.static(__dirname + '/public'))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html')
})

server.listen(3000, () => {
    console.log('listening on *:3000')
})

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on("roomID", (idString) => {
    console.log("Joining room: " + idString)
    socket.join(idString)
  })

  socket.on("audio", (blob) => {
    socket.in(Array.from(socket.rooms)[1]).volatile.emit("audio", blob)
  })
});