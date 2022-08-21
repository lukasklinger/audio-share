var socket = null
var streaming = false

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

    var roomID = getRoomID()
    console.log("Joining room: " + roomID)

    player = document.getElementById("player")
    player.src = "./" + roomID + ".mp3"
    player.load()
    player.play().then(() => {
        showStopPlayback()
    })
}

function disconnect() {
    player = document.getElementById("player")
    player.pause()
    player.src = ""

    showJoinStream()
    streaming = false
}

function getRoomID() {
    var url = new URL(window.location);
    var params = new URLSearchParams(url.search.slice(1))
    console.log(params)
    return params.get("room")
}