const axios = require("axios");
const allPlayerWords = require("./player_word_cost.json");
const playerId = "YOUR_PLAYER_ID_HERE";
const baseUrl = "http://their-hackathon-api.com";
const flaskUrl = "http://127.0.0.1:5000/predict";

const wordToId = {};
const idToWord = {};
let id = 1;
for (const word of Object.keys(allPlayerWords)) {
    wordToId[word] = id;
    idToWord[id] = word;
    id++;
}

async function pickBestMove(systemWord) {
    let candidates = [];

    for (const [word, cost] of Object.entries(allPlayerWords)) {
        const response = await axios.post(flaskUrl, {
            system_word: systemWord,
            player_word: word
        });

        if (response.data.prediction === 1) {
            candidates.push({ word, cost });
        }
    }

    if (candidates.length === 0) {
        console.log("⚠️ No winning words found, picking random cheap word...");
        const randomWord = Object.entries(allPlayerWords)[Math.floor(Math.random() * Object.keys(allPlayerWords).length)];
        return { word: randomWord[0], cost: randomWord[1] };
    }

    candidates.sort((a, b) => a.cost - b.cost);
    return candidates[0];
}

async function playRound(roundId) {
    try {
        const getResponse = await axios.get(`${baseUrl}/get-word`);
        const systemWord = getResponse.data.word;
        console.log(`🔵 Round ${roundId}: System word is "${systemWord}"`);

        const move = await pickBestMove(systemWord);
        console.log(`🟢 Chose "${move.word}" (Cost: ${move.cost})`);

        const wordId = wordToId[move.word];

        const postResponse = await axios.post(`${baseUrl}/submit-word`, {
            player_id: playerId,
            word_id: wordId,
            round_id: roundId
        });

        console.log(`📝 Result:`, postResponse.data);
        return { success: postResponse.data.success, cost: move.cost };

    } catch (err) {
        console.error("⚠️ Error during round:", err.message);
        return { success: false, cost: 0 };
    }
}

async function main() {
    console.log("🤖 Starting bot...");

    let totalCost = 0;
    let wins = 0;
    let losses = 0;

    for (let roundId = 1; roundId <= 10; roundId++) {
        const result = await playRound(roundId);
        
        if (result.success) {
            wins++;
            totalCost += result.cost;
        } else {
            losses++;
            totalCost += result.cost + 75;
        }

        console.log(`🏁 After round ${roundId}: Wins ${wins}, Losses ${losses}, Total Cost: $${totalCost}`);
    }

    const discount = wins * 5;
    const finalCost = totalCost * (1 - discount / 100);

    console.log("🎉 Final Results:");
    console.log(`🏆 Wins: ${wins}`);
    console.log(`💔 Losses: ${losses}`);
    console.log(`💸 Total Spent: $${totalCost}`);
    console.log(`🎯 Final Cost after ${discount}% discount: $${finalCost.toFixed(2)}`);
}

main();
