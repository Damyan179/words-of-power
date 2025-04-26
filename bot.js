require('dotenv').config();
const axios = require("axios");
const fs = require("fs");
const OpenAI = require("openai");
const allPlayerWords = require("./player_word_cost.json");

const openai = new OpenAI({
    apiKey: process.env.APIKEY,
    baseURL: "https://api.deepseek.com",
  });
  

const playerId = process.env.PLAYERID;
const baseUrl = "http://10.41.186.9:8000";
const flaskUrl = "http://127.0.0.1:5000/predict";
const datasetPath = "./dataset.json";

const fallbackOptions = ["Persistence", "Satellite", "Seismic Dampener", "Kevlar Vest", "Reality Resynchronizer"];


const wordToId = {};
const idToWord = {};
let id = 1;
for (const word of Object.keys(allPlayerWords)) {
    wordToId[word] = id;
    idToWord[id] = word;
    id++;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function gptJudge(systemWord) {
    try {
        const prompt = `
You are playing a strategic battle game.

Rules:
- You have ONLY the following 77 words you can pick from: [${Object.keys(allPlayerWords).join(", ")}].
- Each word has a cost.
- You MUST pick the CHEAPEST word that can most likely WIN against "${systemWord}".
- You must ONLY answer with the WORD NAME exactly as given. No extra symbols, no price, no explanation.

Example good answer: Fire Extinguisher
Example bad answer: Fire Extinguisher ($50)

Question:
Which word should you pick from the list to beat "${systemWord}"? 
(Answer ONLY with the word name!)
`;

        const response = await openai.chat.completions.create({
            model: "deepseek-chat",
            messages: [
                { role: "system", content: "You are a strict judge that only responds with one clean word name from the provided list." },
                { role: "user", content: prompt }
            ],
            temperature: 0,
        });

        let answer = response.choices[0].message.content.trim();
        console.log(`🤖 GPT picked: "${answer}" against "${systemWord}"`);

        // Validate answer
        if (!Object.keys(allPlayerWords).includes(answer)) {
            console.warn(`⚠️ GPT picked unknown word: "${answer}". Falling back to random.`);
            answer = fallbackOptions[Math.floor(Math.random() * fallbackOptions.length)];
        }

        return answer;

    } catch (err) {
        console.error("⚠️ GPT Error:", err.message);
        const fallbackWord = fallbackOptions[Math.floor(Math.random() * fallbackOptions.length)];
        console.warn(`⚠️ Falling back to random: "${fallbackWord}"`);
        return fallbackWord;
    }
}

async function pickBestMove(systemWord) {
    let dataset = [];

    try {
        if (fs.existsSync(datasetPath)) {
            const raw = fs.readFileSync(datasetPath);
            dataset = JSON.parse(raw);
        }
    } catch (err) {
        console.error("⚠️ Error reading dataset:", err.message);
    }

    const existing = dataset.find(entry => entry.system_word === systemWord);

    if (existing) {
        console.log(`📚 Memory: using saved best move "${existing.best_player_word}" for "${systemWord}"`);
        return { word: existing.best_player_word, cost: allPlayerWords[existing.best_player_word] };
    }    

    let bestWord = await gptJudge(systemWord);

    if (!bestWord || !allPlayerWords[bestWord]) {
        console.warn(`⚠️ GPT picked an unknown word "${bestWord}". Using fallback...`);
        bestWord = fallbackOptions[Math.floor(Math.random() * fallbackOptions.length)];
    }

    dataset.push({
        system_word: systemWord,
        best_player_word: bestWord,
        cost: allPlayerWords[bestWord]
    });

    try {
        fs.writeFileSync(datasetPath, JSON.stringify(dataset, null, 2));
    } catch (err) {
        console.error("⚠️ Error saving updated dataset:", err.message);
    }

    return { word: bestWord, cost: allPlayerWords[bestWord] };
}

async function playRound() {
    try {
        const getResponse = await axios.get(`${baseUrl}/get-word`);
        const systemWord = getResponse.data.word;
        const serverRoundId = getResponse.data.round;

        console.log(`🔵 Round ${serverRoundId}: System word is "${systemWord}"`);

        const move = await pickBestMove(systemWord);
        console.log(`🟢 Chose "${move.word}" (Cost: ${move.cost})`);

        const wordId = wordToId[move.word];

        const postResponse = await axios.post(`${baseUrl}/submit-word`, {
            player_id: playerId,
            word_id: wordId,
            round_id: serverRoundId // 🛠️ USE THE FRESH ONE
        });

        console.log(`📝 Result:`, postResponse.data);

        return { systemWord, playerWord: move.word };

    } catch (err) {
        console.error("⚠️ Error during round:", err.message);
        return null;
    }
}


async function checkStatus() {
    try {
        const response = await axios.post(`${baseUrl}/status`, {
            player_id: playerId
        });
        const cleanStatus = JSON.parse(response.data.status);
        return cleanStatus;
    } catch (err) {
        console.error("⚠️ Error getting status:", err.message);
        return null;
    }
}

async function saveTrainingData(systemWord, playerWord, outcome) {
    let dataset = [];

    try {
        if (fs.existsSync(datasetPath)) {
            const raw = fs.readFileSync(datasetPath);
            dataset = JSON.parse(raw);
        }
    } catch (err) {
        console.error("⚠️ Error reading dataset file:", err.message);
    }

    dataset.push({
        system_word: systemWord,
        player_word: playerWord,
        outcome: outcome,
        cost: allPlayerWords[playerWord]
    });

    try {
        fs.writeFileSync(datasetPath, JSON.stringify(dataset, null, 2));
    } catch (err) {
        console.error("⚠️ Error writing dataset:", err.message);
    }
}

async function main() {
    console.log("🤖 Starting bot...");

    let lastRoundId = -1;

    while (true) {
        await sleep(500);

        const status = await checkStatus();
        if (!status) continue;

        if (status.game_over) {
            console.log("🏁 Game Over detected from server.");
            console.log("🔄 Restarting bot to keep training...");
            await sleep(2000); // wait 3 seconds
            lastRoundId = -1;
            continue;
        }

        if (status.round === lastRoundId) {
            console.log(`⏳ Waiting for next round... (still round ${status.round})`);
            continue;
        }

        lastRoundId = status.round;

        const result = await playRound();

        if (result) {
            await sleep(1000);

            const newStatus = await checkStatus();
            if (newStatus && newStatus.players_stats) {
                const stats = newStatus.players_stats;
                const myTeam = Object.keys(stats).find(team => stats[team].word === result.playerWord);

                if (myTeam) {
                    const outcome = stats[myTeam].won ? 1 : 0;
                    await saveTrainingData(result.systemWord, result.playerWord, outcome);
                    console.log(`✅ Saved training data: { "${result.systemWord}" vs "${result.playerWord}" = ${outcome} }`);
                }
            }
        }
    }
}



main();
