// function to handle the display of time and buttons
const displayStatus = function () {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, (tabs) => {
    const status = document.getElementById("status");
    const startButton = document.getElementById('start');
    const finishButton = document.getElementById('finish');

    chrome.runtime.sendMessage({currentTab: tabs[0].id}, (response) => {
      if (response) {
        status.innerHTML = "Listen to the stream at: <a href='" + response.stream + "'>" + response.stream + "</a>";
        finishButton.style.display = "block";
      } else {
        startButton.style.display = "block";
      }
    });
  });
}

// manipulation of the displayed buttons upon message from background
chrome.runtime.onMessage.addListener((request, sender) => {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, (tabs) => {
    const status = document.getElementById("status");
    const startButton = document.getElementById('start');
    const finishButton = document.getElementById('finish');

    if (request.captureStarted && request.captureStarted === tabs[0].id) {
      finishButton.style.display = "block";
      startButton.style.display = "none";
      status.innerHTML = "Listen to the stream at: <a href='" + request.stream + "'>" + request.stream + "</a>";
    } else if (request.captureStopped && request.captureStopped === tabs[0].id) {
      status.innerHTML = "";
      finishButton.style.display = "none";
      startButton.style.display = "block";
    }
  });
});

// initial display for popup menu when opened
document.addEventListener('DOMContentLoaded', function () {
  displayStatus();
  const startButton = document.getElementById('start');
  const finishButton = document.getElementById('finish');

  startButton.onclick = () => {chrome.runtime.sendMessage("startCapture")};
  finishButton.onclick = () => {chrome.runtime.sendMessage("stopCapture")};
});