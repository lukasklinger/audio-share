var socket = io()

function connect() {
    console.log("connect")

    var roomID = "hello";

    socket.emit("roomID", roomID);

    socket.on("connect", () => {
        socket.emit("roomID", roomID);
    })

    socket.on("audio", function (data) {
        console.log(data);
    });
}