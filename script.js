const URL = "./model/";

let model, webcam;
let capturedImage = null;

// Nutrition database (keys must match model labels after lowercase + trim)
const nutritionData = {
  "biryani": { calories: 350, carbs: "45 g", protein: "15 g", fat: "12 g" },
  "chapati": { calories: 120, carbs: "20 g", protein: "4 g", fat: "3 g" },
  "dal tadka": { calories: 180, carbs: "18 g", protein: "9 g", fat: "6 g" },
  "kachori": { calories: 250, carbs: "28 g", protein: "6 g", fat: "14 g" },
  "cake": { calories: 300, carbs: "40 g", protein: "5 g", fat: "15 g" }
};

async function init() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  model = await tmImage.load(modelURL, metadataURL);

  webcam = new tmImage.Webcam(300, 300, false);
  await webcam.setup();
  await webcam.play();

  document.getElementById("webcam-container").innerHTML = "";
  document.getElementById("webcam-container").appendChild(webcam.canvas);

  loop(); // start camera rendering
}

// Continuously update webcam canvas
function loop() {
  webcam.update();
  requestAnimationFrame(loop);
}

// Capture current frame
function capture() {
  capturedImage = document.createElement("canvas");
  capturedImage.width = webcam.canvas.width;
  capturedImage.height = webcam.canvas.height;

  const ctx = capturedImage.getContext("2d");
  ctx.drawImage(webcam.canvas, 0, 0);

  predictCaptured();
}

// Predict on captured image
async function predictCaptured() {
  if (!capturedImage || !model) return;

  const prediction = await model.predict(capturedImage);

  const best = prediction.reduce((a, b) =>
    a.probability > b.probability ? a : b
  );

  const food = best.className.toLowerCase().trim();
  const confidence = (best.probability * 100).toFixed(1);

  // Update confidence bar
  document.getElementById("confidence-bar").style.width = confidence + "%";
  document.getElementById("confidence-text").innerText =
    "Confidence: " + confidence + "%";

  const resultDiv = document.getElementById("result");

  if (best.probability < 0.35) {
    resultDiv.innerHTML =
      "<b>No food detected clearly.</b><br>Try capturing again.";
    return;
  }

  if (nutritionData[food]) {
    const d = nutritionData[food];
    resultDiv.innerHTML = `
      <h3>${food.toUpperCase()}</h3>
      Calories: ${d.calories} kcal<br>
      Carbs: ${d.carbs}<br>
      Protein: ${d.protein}<br>
      Fat: ${d.fat}
    `;
  } else {
    resultDiv.innerHTML = `
      Detected: ${food}<br>
      Nutrition data not available
    `;
  }
}
