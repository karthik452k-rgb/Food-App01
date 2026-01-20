const URL = "./model/";

let model, webcam, maxPredictions;

// 🔹 Calories + Macros database (APPROXIMATE)
const nutritionData = {
  "Chapati": {
    calories: 120,
    carbs: 18,
    protein: 3,
    fat: 3
  },
  "Biryani": {
    calories: 350,
    carbs: 45,
    protein: 15,
    fat: 12
  },
  "Dal Tadka": {
    calories: 180,
    carbs: 20,
    protein: 9,
    fat: 7
  },
  "Kachori": {
    calories: 250,
    carbs: 30,
    protein: 6,
    fat: 14
  },
  "Cake": {
    calories: 300,
    carbs: 40,
    protein: 4,
    fat: 15
  }
};

async function init() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  webcam = new tmImage.Webcam(300, 300, true);
  await webcam.setup();
  await webcam.play();
  window.requestAnimationFrame(loop);

  document.getElementById("webcam-container").appendChild(webcam.canvas);
}

async function loop() {
  webcam.update();
  await predict();
  window.requestAnimationFrame(loop);
}

async function predict() {
  const prediction = await model.predict(webcam.canvas);

  let best = prediction[0];
  for (let i = 1; i < prediction.length; i++) {
    if (prediction[i].probability > best.probability) {
      best = prediction[i];
    }
  }

  if (best.probability > 0.7) {
    const food = best.className;
    const data = nutritionData[food];

    document.getElementById("result").innerHTML = `
      <b>${food}</b><br><br>
      Calories: ${data.calories} kcal<br>
      Carbs: ${data.carbs} g<br>
      Protein: ${data.protein} g<br>
      Fat: ${data.fat} g
    `;
  } else {
    document.getElementById("result").innerHTML =
      "Food not recognized clearly";
  }
}
