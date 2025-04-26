require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const host = "http://10.41.186.9:8000"; 
const postUrl = `${host}/submit-word`;
const getUrl = `${host}/get-word`;
const statusUrl = `${host}/status`;
const registerUrl = `${host}/register`;
const playerId = process.env.PLAYERID;

const NUM_ROUNDS = 10;
const datasetPath = path.join(__dirname, 'dataset.json');

const fallbackSafeWords = [
    "Sandpaper", "Oil", "Steam", "Gust", "Boulder", "Drill",
    "Fire", "Water", "Laser", "Sunshine", "Dam", "Kevlar Vest"
];

const allPlayerWords = require("./player_word_cost.json");
const wordToId = {};
let id = 1;
for (const word of Object.keys(allPlayerWords)) {
    wordToId[word] = id++;
}

function smartPick(systemWord) {
    try {
        if (!fs.existsSync(datasetPath)) {
            console.warn("⚠️ Dataset not found! Falling back to random safe choice.");
            return fallbackSafeWords[Math.floor(Math.random() * fallbackSafeWords.length)];
        }

        const raw = fs.readFileSync(datasetPath);
        const dataset = JSON.parse(raw);

        const goodCandidates = dataset.filter(entry => {
            if (entry.system_word !== systemWord) return false;
            if (entry.best_player_word) return true;
            if (entry.player_word && entry.outcome === 1) return true;
            return false;
        });

        if (goodCandidates.length > 0) {
            const chosen = goodCandidates[0];
            return chosen.best_player_word || chosen.player_word;
        }

    } catch (err) {
        console.error("⚠️ Error reading or parsing dataset:", err.message);
    }

    return fallbackSafeWords[Math.floor(Math.random() * fallbackSafeWords.length)];
}

async function playGame(playerId) {
    for (let roundId = 1; roundId <= NUM_ROUNDS; roundId++) {
        let roundNum = -1;

        while (roundNum !== roundId) {
            const response = await axios.get(getUrl);
            const data = response.data;
            console.log(data);

            roundNum = data.round;
            var sysWord = data.word;

            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        if (roundId > 1) {
            const status = await axios.post(statusUrl, { player_id: playerId }, { timeout: 2000 });
            console.log(status.data);
        }
        

        const chosenWordName = smartPick(sysWord);
        const wordId = wordToId[chosenWordName];

        if (!wordId) {
            console.error(`❌ FATAL: Word "${chosenWordName}" not found in word list!`);
            process.exit(1);
        }

        const payload = {
            player_id: playerId,
            word_id: wordId,
            round_id: roundId
        };

        console.log(`🟢 Submitting: ${chosenWordName} (ID ${wordId}) for round ${roundId}`);

        const submit = await axios.post(postUrl, payload);
        console.log(submit.data);

        await new Promise(resolve => setTimeout(resolve, 1000)); 
    }
}

playGame(playerId);
