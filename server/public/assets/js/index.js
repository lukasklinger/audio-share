var socket = null
var streaming = false
var audioBuffer = new Queue()

var mediaSource = null
var sourceBuffer = null
var audio = document.createElement('audio')

function init() {
    mediaSource = new MediaSource();
    
    mediaSource.addEventListener('sourceopen', () => {
        sourceBuffer = mediaSource.addSourceBuffer('audio/webm')
    })

    audio.src = URL.createObjectURL(mediaSource)
}

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

    // join room to start receiving data
    socket.emit("roomID", roomID)

    // join room on reconnect
    socket.on("connect", () => {
        socket.emit("roomID", roomID)
    })

    // pipe audio chunks into decoder
    socket.on("audio", function (b64DataURL) {
        sourceBuffer.appendBuffer(dataURItoArrayBuffer(b64DataURL))
    });

    setTimeout(startPlayback, 2000)
}

function startPlayback() {
    audio.play()
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

function dataURItoArrayBuffer(dataURI) {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    var byteString = atob(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);

    // create a view into the buffer
    var ia = new Uint8Array(ab);

    // set the bytes of the buffer to the correct values
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    
    return ab;
}