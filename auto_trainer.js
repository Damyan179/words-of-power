const { exec } = require("child_process");
const fs = require("fs");

const datasetPath = "./dataset.json";
const CHECK_INTERVAL_MS = 60000; // Check every 60 seconds
const BATTLES_THRESHOLD = 50; // Retrain after 50 new battles

let lastBattleCount = 0;

function getBattleCount() {
    if (!fs.existsSync(datasetPath)) return 0;

    const raw = fs.readFileSync(datasetPath);
    const dataset = JSON.parse(raw);
    return dataset.length;
}

function retrainModel() {
    console.log(`🧠 Retraining model... Current battles: ${getBattleCount()}`);

    exec("python pyml/train_from_dataset.py", (error, stdout, stderr) => {
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
