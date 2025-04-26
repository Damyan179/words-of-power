const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const datasetPath = path.join(__dirname, "../dataset.json"); // go UP one level to dataset
const CHECK_INTERVAL_MS = 60000; 
const BATTLES_THRESHOLD = 50;

let lastBattleCount = 0;

function getBattleCount() {
    if (!fs.existsSync(datasetPath)) return 0;

    const raw = fs.readFileSync(datasetPath);
    const dataset = JSON.parse(raw);
    return dataset.length;
}

function retrainModel() {
    console.log(`🧠 Retraining model... Current battles: ${getBattleCount()}`);

    // Now relative path is just "train_from_dataset.py"
    exec("py train_from_dataset.py", (error, stdout, stderr) => {
        if (error) {
            console.error(`❌ Error retraining: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`⚠️ Python warning: ${stderr}`);
        }
        console.log(`✅ Retrain output:\n${stdout}`);
    });
}

function watchDataset() {
    console.log("👀 Watching dataset.json for enough new data...");

    lastBattleCount = getBattleCount();

    setInterval(() => {
        const currentBattleCount = getBattleCount();
        const newBattles = currentBattleCount - lastBattleCount;

        console.log(`🔎 Checked: ${newBattles} new battles since last retrain.`);

        if (newBattles >= BATTLES_THRESHOLD) {
            retrainModel();
            lastBattleCount = currentBattleCount;
        }
    }, CHECK_INTERVAL_MS);
}

watchDataset();
