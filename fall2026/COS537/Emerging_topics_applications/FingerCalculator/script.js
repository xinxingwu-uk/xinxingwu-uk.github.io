// Get HTML elements
var videoElement = document.getElementById('webcam');
var canvasElement = document.getElementById('canvas');
var canvasCtx = canvasElement.getContext('2d');
//canvasElement.getContext('2d') is a method that returns a drawing context on the canvas element.
// The parameter '2d' specifies that you want a 2D rendering context.
var resultText = document.getElementById('result');
var checkbox = document.getElementById("myCheckbox");


// Function to count the number of extended fingers
function countFingers(landmarks, handLabel) {
    var count = 0;
    var tips = [8, 12, 16, 20]; // Tip indexes of fingers
    var base = [6, 10, 14, 18]; // Base of each finger

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

    // Count other fingers
    for (var i = 0; i < tips.length; i++) {
        if (landmarks[tips[i]].y < landmarks[base[i]].y) {
            count++;
        }
    }
    return count;
}

// Configure MediaPipe Hands model
var hands = new Hands({
    locateFile: function (file) {
        return "https://cdn.jsdelivr.net/npm/@mediapipe/hands/" + file;
    }
});

hands.setOptions({
    maxNumHands: 2,// Number of hands to detect
    modelComplexity: 1,// Higher for accuracy, lower for speed
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7
});

// Process results from the hand tracking model
hands.onResults(function (results) {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    var leftCount = 0;
    var rightCount = 0;
    var outputText = "";

    // Check if hands are detected
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        for (var i = 0; i < results.multiHandLandmarks.length; i++) {
            var landmarks = results.multiHandLandmarks[i];
            var handedness = results.multiHandedness[i].label;

			if (false) {
            // Draw hand landmarks and connections
            drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 3 });
            drawLandmarks(canvasCtx, landmarks, { color: '#FF0000', lineWidth: 1 });
			}
            // Count fingers for each hand
            var fingerCount = countFingers(landmarks, handedness);

            if (handedness === "Left") {
                leftCount = fingerCount;
            } else if (handedness === "Right") {
                rightCount = fingerCount;
            }

            outputText += handedness + " hand: " + fingerCount + " fingers\n";
        }

        // Calculate and display the sum of both hands
        var total = leftCount + rightCount;
        outputText += "\n" + leftCount + " + " + rightCount + " = " + total;
    } else {
        outputText = "No hand detected";
    }

    // Update the result box
    resultText.innerText = outputText;
    canvasCtx.restore();
});

// Configure the camera for capturing video frames
var camera = new Camera(videoElement, {
    onFrame: async function () {
        // Properly use await inside an async function
        await hands.send({ image: videoElement });
    },
    width: 640,
    height: 480
});

// Start the camera
camera.start();
