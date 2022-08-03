const audioCapture = (muteTab) => {
  chrome.tabCapture.capture({
    audio: true
  }, (stream) => { // sets up stream for capture
    let startTabId; //tab when the capture is started

    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, (tabs) => startTabId = tabs[0].id) //saves start tab

    const liveStream = stream;
    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaStreamSource(stream);

    // TODO do something with the source

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
        }
      })
    }

    //removes the audio context and closes recorder to save memory
    const closeStream = function (endTabId) {
      chrome.runtime.onMessage.removeListener(onStopClick);
      audioCtx.close();
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
    sendResponse(sessionStorage.getItem(request.currentTab));
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
      sessionStorage.setItem(tabs[0].id, Date.now());
      chrome.storage.sync.get({
        maxTime: 1200000,
        muteTab: false,
        format: "mp3",
        quality: 192,
        limitRemoved: false
      }, (options) => {
        let time = options.maxTime;
        if (time > 1200000) {
          time = 1200000
        }
        audioCapture(time, options.muteTab, options.format, options.quality, options.limitRemoved);
      });
      chrome.runtime.sendMessage({
        captureStarted: tabs[0].id,
        startTime: Date.now()
      });
    }
  });
};


chrome.commands.onCommand.addListener((command) => {
  if (command === "start") {
    startCapture();
  }
});