const { desktopCapturer, remote } = require("electron");

const { writeFile } = require("fs");

const { dialog, Menu } = remote;

// Global state
let mediaRecorder; // MediaRecorder instance to capture footage
const recordedChunks = [];
const mimeType = "video/webm";

// Buttons
const videoElement = document.querySelector("video");

const startBtn = document.getElementById("startBtn");
startBtn.onclick = (e) => {
  window.mediaRecorder.start();
  startBtn.classList.add("is-danger");
  startBtn.innerText = "Recording";
};

const stopBtn = document.getElementById("stopBtn");

stopBtn.onclick = (e) => {
  window.mediaRecorder.stop();
  startBtn.classList.remove("is-danger");
  startBtn.innerText = "Start";
};

const videoSelectBtn = document.getElementById("videoSelectBtn");
videoSelectBtn.onclick = getVideoSources;

// Get the available video sources
async function getVideoSources() {
  const inputSources = await desktopCapturer.getSources({
    types: ["window", "screen"],
  });

  const videoOptionsMenu = Menu.buildFromTemplate(
    inputSources.map((source) => {
      return {
        label: source.name,
        click: () => selectSource(source),
      };
    })
  );

  videoOptionsMenu.popup();
}

// Change the videoSource window to record
async function selectSource(source) {
  videoSelectBtn.innerText = source.name;
  const constraintsTest = {
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      sampleRate: 44100,
      // chromeMediaSource: "desktop",
      // mandatory: {
      //   echoCancellation: true,
      //   noiseSuppression: true,
      //   sampleRate: 44100,
      //   chromeMediaSource: "desktop",
      // },
    },
    video: false,
    // video: {
    //   chromeMediaSource: "desktop",
    //   chromeMediaSourceId: source.id,

    //   // mandatory: {
    //   //   chromeMediaSource: "desktop",
    //   // },
    // },
  };

  const constraints = {
    audio: true,
    video: {
      // optional: {
      //   frameRate: 60,
      // },
      mandatory: {
        minFrameRate: 60,
        minWidth: 1920,
        minHeight: 1080,
        chromeMediaSource: "desktop",
        chromeMediaSourceId: source.id,
      },
    },
  };

  // Create a Stream
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      sampleRate: 44100,
    },
    video: true,
  });

  // Preview the source in a video element
  videoElement.srcObject = stream;
  videoElement.play();
  // Create the Media Recorder
  const options = { mimeType: "video/webm" };
  // mediaRecorder = new MediaRecorder(stream, options);

  // // Register Event Handlers
  // mediaRecorder.ondataavailable = handleDataAvailable;
  // mediaRecorder.onstop = handleStop;
  window.mediaRecorder = new MediaRecorder(stream, options);
  window.mediaRecorder.ondataavailable = handleDataAvailable;
  window.mediaRecorder.onstop = handleStop;
  // Updates the UI
}

// Captures all recorded chunks
function handleDataAvailable(e) {
  console.log("video data available");
  recordedChunks.push(e.data);
}

// Saves the video file on stop
async function handleStop(e) {
  const blob = new Blob(recordedChunks, {
    type: "video/mp4",
    // type: 'video/webm; codecs=vp9'
  });

  const buffer = Buffer.from(await blob.arrayBuffer());

  const { filePath } = await dialog.showSaveDialog({
    buttonLabel: "Save video",
    defaultPath: `vid-${Date.now()}.mp4`,
  });

  if (filePath) {
    writeFile(filePath, buffer, () => console.log("video saved successfully!"));
  }
}
