const serverURL = "https://audioshare.cyaniccerulean.com"
var socket = null;
var roomID = "";

const audioCapture = (muteTab, socket) => {
  console.log("capturing audio")

  chrome.tabCapture.capture({audio: true}, (stream) => { // sets up stream for capture
    let startTabId; //tab when the capture is started

    chrome.tabs.query({active: true, currentWindow: true},
      (tabs) => startTabId = tabs[0].id) //saves start tab

    const liveStream = stream;

    // media recorder to fetch audio data
    const mediaRecorder = new MediaRecorder(liveStream, {mimeType: 'audio/webm'});
    mediaRecorder.addEventListener("dataavailable", function(event) {
      sendAudioChunk(event.data, socket);
    })

    mediaRecorder.start(500);

    function onStopClick(request) { //click on popup
      if (request === "stopCapture") {
        stopCapture();
      }
    }

    chrome.runtime.onMessage.addListener(onStopClick);

    const stopCapture = function () {
      let endTabId;
      //check to make sure the current tab is the tab being captured
      chrome.tabs.query({
        active: true,
        currentWindow: true
      }, (tabs) => {
        endTabId = tabs[0].id;
        if (startTabId === endTabId) {
          closeStream(endTabId);
          socket.close();
        }
      })
    }

    // removes the audio context and closes recorder to save memory
    const closeStream = function (endTabId) {
      chrome.runtime.onMessage.removeListener(onStopClick);

      mediaRecorder.stop();
      liveStream.getAudioTracks()[0].stop();

      sessionStorage.removeItem(endTabId);
      chrome.runtime.sendMessage({
        captureStopped: endTabId
      });
    }

    if (!muteTab) {
      let audio = new Audio();
      audio.srcObject = liveStream;
      audio.play();
    }
  });
}

//sends reponses to and from the popup menu
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.currentTab && sessionStorage.getItem(request.currentTab)) {
    sendResponse({item: sessionStorage.getItem(request.currentTab), stream: serverURL + "/?room=" + roomID});
  } else if (request.currentTab) {
    sendResponse(false);
  } else if (request === "startCapture") {
    startCapture();
  }
});

const startCapture = function () {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, (tabs) => {
    if (!sessionStorage.getItem(tabs[0].id)) {
      roomID = generateString(8);
      sessionStorage.setItem(tabs[0].id, Date.now());

      socket = io.connect(serverURL);
      socket.emit("roomID", roomID);

      socket.on("connect", () => {
        socket.emit("roomID", roomID);
      })

      audioCapture(false, socket);

      chrome.runtime.sendMessage({captureStarted: tabs[0].id, startTime: Date.now(), stream: serverURL + "/?room=" + roomID});
    }
  });
};

function sendAudioChunk(audioBlob, socket) {
  socket.emit("audio", audioBlob);
}

// declare all characters
const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function generateString(length) {
    let result = '';
    const charactersLength = characters.length;

    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}