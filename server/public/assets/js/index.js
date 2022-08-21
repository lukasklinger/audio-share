var socket = null
var streaming = false
var audioBuffer = new Queue()

function clickHandler() {
    if (!streaming) {
        // start
        showLoading();
        connect();
    } else {
        // stop
        showJoinStream();
        disconnect();
    }
}

function showJoinStream() {
    var button = document.getElementById("playButton")
    button.innerText = "Join Stream"
    button.classList.add("is-info")
    button.classList.remove("is-primary")
    button.classList.remove("is-active")
    button.classList.remove("is-loading")
}

function showStopPlayback() {
    var button = document.getElementById("playButton")
    button.innerText = "Stop Playback"
    button.classList.add("is-primary")
    button.classList.add("is-active")
    button.classList.remove("is-info")
    button.classList.remove("is-loading")
}

function showLoading() {
    var button = document.getElementById("playButton")
    button.classList.add("is-loading")
}

function connect() {
    console.log("connect")
    streaming = true
    showStopPlayback()

    var roomID = getRoomID()
    socket = io()

    console.log("Joining room: " + roomID)

    // join room to start receiving data
    socket.emit("roomID", roomID)

    // join room on reconnect
    socket.on("connect", () => {
        socket.emit("roomID", roomID)
    })

    // pipe audio chunks into decoder
    socket.on("audio", function (b64DataURL) {
        audioBuffer.enqueue(b64DataURL)
        console.log("data")
    });

    setTimeout(startPlayback, 2000)
}

function startPlayback() {
    setInterval(() => {
        var audio = new Audio(audioBuffer.dequeue())
        audio.play()
    }, 500)
}

function disconnect() {
    socket.disconnect()
    showJoinStream()
    streaming = false
}

function getRoomID() {
    var pathArray = window.location.pathname.split('/')
    return pathArray[1]
}