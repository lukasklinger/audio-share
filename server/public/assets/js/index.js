var socket = null;
var headerReceived = false;
var streaming = false;
var audioStreamer = null;

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

    var roomID = "hello"
    socket = io()
    audioStreamer = new ScarletsAudioStreamer(500)

    // join room to start receiving data
    socket.emit("roomID", roomID)

    // join room on reconnect
    socket.on("connect", () => {
        socket.emit("roomID", roomID)
    })

    // pipe audio chunks into decoder
    socket.on("audio", function (data) {
        if (headerReceived) {audioStreamer.receiveBuffer(data)}
    });

    // buffer header is needed to decode audio correctly
    socket.on("bufferHeader", function (data) {
        if (!headerReceived) {
            audioStreamer.setBufferHeader(data)
            audioStreamer.playStream()
            headerReceived = true
            showStopPlayback()
        }
    });
}

function disconnect() {
    streaming = false;
    showJoinStream();

    if (audioStreamer != undefined) {
        audioStreamer.stop();
        socket.disconnect();
        headerReceived = false;
    }
}