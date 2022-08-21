const child_process = require('child_process')
const pathFFMPEG = require('ffmpeg-static')
const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const { Server } = require("socket.io")
const io = new Server(server, {cors: {origin: '*'}})

var pipes = new Map();

app.use(express.static(__dirname + '/public'))

app.get('/*.mp3', (req, res) => {
  roomID = req.path.replace("/", "").replace(".mp3", "")

  if (!pipes.has(roomID)) {
    res.statusCode = 404
    res.end()
  } else {
    res.set({"Content-Type": "audio/mpeg"})
    pipes.get(roomID).pipe(res)
  }
})

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html')
})

io.on('connection', (socket) => {
  console.log('a user connected')
  var ffmpeg = child_process.spawn(pathFFMPEG, ["-i", "-", "-c:a", "libmp3lame", "-b:a", "64k", "-f", "mp3", "pipe:1"])
  var roomID

  socket.on("roomID", (idString) => {
    // set ffmpeg output pipe for room
    pipes.set(idString, ffmpeg.stdout)
    roomID = idString
  })

  socket.on("audio", (data) => {ffmpeg.stdin.write(data)})

  socket.on('disconnect', () => {
    ffmpeg.kill('SIGINT')
    pipes.delete(roomID)
  })

  ffmpeg.on('close', (code, signal) => {console.log("ffmpeg gone bye-bye... " + code + " " + signal)})
  ffmpeg.stdin.on('error', (e) => {console.log("stdin err: " + e)})
  ffmpeg.stderr.on('data', (data) => {console.log("err: " + data)})
});

server.listen(3000, () => {console.log('listening on *:3000')})