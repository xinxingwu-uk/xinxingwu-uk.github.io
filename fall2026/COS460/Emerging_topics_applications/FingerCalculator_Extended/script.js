// Get HTML elements
var videoElement = document.getElementById("webcam");
var canvasElement = document.getElementById("canvas");
var canvasCtx = canvasElement.getContext("2d");

var startOverlay = document.getElementById("startOverlay");
var startBtn = document.getElementById("startBtn");
var landmarkBtn = document.getElementById("landmarkBtn");
var statusPill = document.getElementById("statusPill");

var leftCountText = document.getElementById("leftCount");
var rightCountText = document.getElementById("rightCount");
var totalCountText = document.getElementById("totalCount");
var equationText = document.getElementById("equationText");
var handMessage = document.getElementById("handMessage");

var leftDots = document.getElementById("leftDots");
var rightDots = document.getElementById("rightDots");

var showLandmarks = true;
var camera = null;

function resizeCanvas() {
  canvasElement.width = window.innerWidth;
  canvasElement.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function setStatus(message, mode) {
  statusPill.textContent = message;
  statusPill.className = "status " + mode;
}

function makeFingerDots(count) {
  var html = "";

  for (var i = 0; i < 5; i++) {
    if (i < count) {
      html += "<span class='on'></span>";
    } else {
      html += "<span></span>";
    }
  }

  return html;
}

function updateDisplay(leftCount, rightCount, handCount) {
  var total = leftCount + rightCount;

  leftCountText.textContent = leftCount;
  rightCountText.textContent = rightCount;
  totalCountText.textContent = total;

  equationText.textContent = leftCount + " + " + rightCount + " = " + total;

  leftDots.innerHTML = makeFingerDots(leftCount);
  rightDots.innerHTML = makeFingerDots(rightCount);

  if (handCount === 0) {
    handMessage.textContent = "No hand detected yet";
  } else if (handCount === 1) {
    handMessage.textContent = "1 hand detected";
  } else {
    handMessage.textContent = "2 hands detected";
  }
}

// Function to count the number of extended fingers
function countFingers(landmarks, handLabel) {
  var count = 0;

  // Finger tip indexes
  var tips = [8, 12, 16, 20];

  // Finger lower-joint indexes
  var base = [6, 10, 14, 18];

  // Thumb logic
  if (handLabel === "Right") {
    if (landmarks[4].x < landmarks[3].x) {
      count++;
    }
  } else {
    if (landmarks[4].x > landmarks[3].x) {
      count++;
    }
  }

  // Count index, middle, ring, and pinky fingers
  for (var i = 0; i < tips.length; i++) {
    if (landmarks[tips[i]].y < landmarks[base[i]].y) {
      count++;
    }
  }

  return count;
}

function getImageFit(image) {
  var canvasWidth = canvasElement.width;
  var canvasHeight = canvasElement.height;

  var imageWidth = image.videoWidth || image.width || 640;
  var imageHeight = image.videoHeight || image.height || 480;

  var scale = Math.max(canvasWidth / imageWidth, canvasHeight / imageHeight);

  var drawWidth = imageWidth * scale;
  var drawHeight = imageHeight * scale;

  var drawX = (canvasWidth - drawWidth) / 2;
  var drawY = (canvasHeight - drawHeight) / 2;

  return {
    x: drawX,
    y: drawY,
    width: drawWidth,
    height: drawHeight
  };
}

function drawFullScreenCamera(image) {
  var fit = getImageFit(image);

  canvasCtx.save();

  // Mirror the camera view so it feels like a selfie camera.
  canvasCtx.translate(canvasElement.width, 0);
  canvasCtx.scale(-1, 1);

  canvasCtx.drawImage(image, fit.x, fit.y, fit.width, fit.height);

  canvasCtx.restore();
}

function landmarkToCanvasPoint(landmark, image) {
  var fit = getImageFit(image);

  return {
    x: fit.x + (1 - landmark.x) * fit.width,
    y: fit.y + landmark.y * fit.height
  };
}

function drawHandLandmarks(landmarks, image, color) {
  if (!showLandmarks) {
    return;
  }

  canvasCtx.save();

  canvasCtx.lineCap = "round";
  canvasCtx.lineJoin = "round";
  canvasCtx.lineWidth = 5;
  canvasCtx.strokeStyle = color;

  // Draw hand connections
  for (var i = 0; i < HAND_CONNECTIONS.length; i++) {
    var connection = HAND_CONNECTIONS[i];

    var start = landmarkToCanvasPoint(landmarks[connection[0]], image);
    var end = landmarkToCanvasPoint(landmarks[connection[1]], image);

    canvasCtx.beginPath();
    canvasCtx.moveTo(start.x, start.y);
    canvasCtx.lineTo(end.x, end.y);
    canvasCtx.stroke();
  }

  // Draw landmark points
  for (var j = 0; j < landmarks.length; j++) {
    var point = landmarkToCanvasPoint(landmarks[j], image);

    canvasCtx.beginPath();
    canvasCtx.arc(point.x, point.y, 6, 0, Math.PI * 2);
    canvasCtx.fillStyle = "rgba(255, 255, 255, 0.95)";
    canvasCtx.fill();

    canvasCtx.beginPath();
    canvasCtx.arc(point.x, point.y, 3, 0, Math.PI * 2);
    canvasCtx.fillStyle = color;
    canvasCtx.fill();
  }

  // Highlight fingertips
  var fingertips = [4, 8, 12, 16, 20];

  for (var k = 0; k < fingertips.length; k++) {
    var tip = landmarkToCanvasPoint(landmarks[fingertips[k]], image);

    canvasCtx.beginPath();
    canvasCtx.arc(tip.x, tip.y, 13, 0, Math.PI * 2);
    canvasCtx.strokeStyle = "rgba(255, 255, 255, 0.75)";
    canvasCtx.lineWidth = 3;
    canvasCtx.stroke();
  }

  canvasCtx.restore();
}

// Configure MediaPipe Hands model
var hands = new Hands({
  locateFile: function(file) {
    return "https://cdn.jsdelivr.net/npm/@mediapipe/hands/" + file;
  }
});

hands.setOptions({
  maxNumHands: 2,
  modelComplexity: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7
});

// Process results from the hand tracking model
hands.onResults(function(results) {
  resizeCanvas();

  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

  drawFullScreenCamera(results.image);

  var leftCount = 0;
  var rightCount = 0;
  var handCount = 0;

  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    handCount = results.multiHandLandmarks.length;

    for (var i = 0; i < results.multiHandLandmarks.length; i++) {
      var landmarks = results.multiHandLandmarks[i];
      var handedness = results.multiHandedness[i].label;
      var fingerCount = countFingers(landmarks, handedness);

      if (handedness === "Left") {
        leftCount = fingerCount;
        drawHandLandmarks(landmarks, results.image, "rgba(96, 165, 250, 0.95)");
      } else if (handedness === "Right") {
        rightCount = fingerCount;
        drawHandLandmarks(landmarks, results.image, "rgba(34, 197, 94, 0.95)");
      }
    }

    setStatus("Tracking hands", "good");
  } else {
    setStatus("Show your hands", "waiting");
  }

  updateDisplay(leftCount, rightCount, handCount);
});

async function startCamera() {
  try {
    startBtn.disabled = true;
    startBtn.textContent = "Loading...";

    setStatus("Starting camera", "waiting");

    camera = new Camera(videoElement, {
      onFrame: async function() {
        await hands.send({
          image: videoElement
        });
      },
      width: 1280,
      height: 720
    });

    await camera.start();

    startOverlay.classList.add("hidden");
    setStatus("Camera started", "good");
  } catch (error) {
    console.error(error);

    startBtn.disabled = false;
    startBtn.textContent = "Start Camera";

    setStatus("Camera error", "error");

    alert("Camera failed. Please use localhost or HTTPS and allow camera access.");
  }
}

landmarkBtn.addEventListener("click", function() {
  showLandmarks = !showLandmarks;

  if (showLandmarks) {
    landmarkBtn.textContent = "Landmarks On";
    landmarkBtn.classList.add("active");
  } else {
    landmarkBtn.textContent = "Landmarks Off";
    landmarkBtn.classList.remove("active");
  }
});

startBtn.addEventListener("click", startCamera);

updateDisplay(0, 0, 0);
setStatus("Ready", "waiting");