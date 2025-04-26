const axios = require("axios");
const allPlayerWords = require("./player_word_cost.json");

const playerId = "dcIuX82X";
const baseUrl = "http://10.41.186.9:8000";
const flaskUrl = "http://127.0.0.1:5000/predict";

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

async function pickBestMove(systemWord) {
    let candidates = [];

    for (const [word, cost] of Object.entries(allPlayerWords)) {
        try {
            const response = await axios.post(flaskUrl, {
                system_word: systemWord,
                player_word: word
            });

            if (response.data.prediction === 1) {
                candidates.push({ word, cost });
            }
        } catch (err) {
            console.warn(`⚠️ ML prediction failed for "${systemWord}" vs "${word}" — fallback mode.`);
            break;
        }
    }

    if (candidates.length === 0) {
        console.log("⚠️ No winning words found from ML. Picking manual fallback...");
        const fallbackOptions = ["Persistence", "Satellite", "Seismic Dampener", "Kevlar Vest", "Reality Resynchronizer"];
        const fallbackWord = fallbackOptions[Math.floor(Math.random() * fallbackOptions.length)];
        return { word: fallbackWord, cost: allPlayerWords[fallbackWord] };
    }

    candidates.sort((a, b) => a.cost - b.cost);
    return candidates[0];
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
            round_id: serverRoundId
        });

        console.log(`📝 Result:`, postResponse.data);
        return { success: postResponse.data.success, cost: move.cost };

    } catch (err) {
        console.error("⚠️ Error during round:", err.message);
        return { success: false, cost: 0 };
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

async function main() {
    console.log("🤖 Starting bot...");

    let totalCost = 0;
    let wins = 0;
    let losses = 0;
    let roundsPlayed = 0;

    while (roundsPlayed < 10) {
        await sleep(500);

        const status = await checkStatus();
        if (status && status.game_over) {
            console.log("🏁 Game Over detected from server.");
            break;
        }

        const result = await playRound();
        
        // if (result.success) {
        //     wins++;
        //     totalCost += result.cost;
        // } else {
        //     losses++;
        //     totalCost += result.cost + 75; // Penalty for losing
        // }

        roundsPlayed++;
    }

    const discount = wins * 5;
    const finalCost = totalCost * (1 - discount / 100);

    // console.log("\n🎉 FINAL RESULTS:");
    // console.log(`🏆 Wins: ${wins}`);
    // console.log(`💔 Losses: ${losses}`);
    // console.log(`💸 Total Spent (Before Discount): $${totalCost}`);
    // console.log(`🎯 Final Cost (After ${discount}% discount): $${finalCost.toFixed(2)}`);
}

main();
