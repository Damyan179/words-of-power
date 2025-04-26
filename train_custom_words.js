require('dotenv').config();
const fs = require("fs");
const OpenAI = require("openai");
const allPlayerWords = require("./player_word_cost.json");

const openai = new OpenAI({
    apiKey: process.env.APIKEY,
    baseURL: "https://api.deepseek.com",
});

const datasetPath = "./dataset.json";
const customWordsPath = "./words_custom_list.json"; // your 1000 system words

const fallbackOptions = ["Persistence", "Satellite", "Seismic Dampener", "Kevlar Vest", "Reality Resynchronizer"];

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

async function main() {
    console.log("🚀 Starting custom words training...");

    // Load custom system words
    let customWords = [];
    try {
        const raw = fs.readFileSync(customWordsPath);
        customWords = JSON.parse(raw);
    } catch (err) {
        console.error("❌ Failed to load custom words list:", err.message);
        return;
    }

    // Load existing dataset
    let dataset = [];
    try {
        if (fs.existsSync(datasetPath)) {
            const raw = fs.readFileSync(datasetPath);
            dataset = JSON.parse(raw);
        }
    } catch (err) {
        console.error("⚠️ Error reading dataset:", err.message);
    }

    const existingSystemWords = new Set(dataset.map(entry => entry.system_word));

    for (const systemWord of customWords) {
        if (existingSystemWords.has(systemWord)) {
            console.log(`✅ Already trained for "${systemWord}", skipping...`);
            continue;
        }

        const bestWord = await gptJudge(systemWord);

        dataset.push({
            system_word: systemWord,
            best_player_word: bestWord,
            cost: allPlayerWords[bestWord]
        });

        console.log(`💾 Saved best move "${bestWord}" for system word "${systemWord}".`);

        // Save after every word to prevent data loss
        try {
            fs.writeFileSync(datasetPath, JSON.stringify(dataset, null, 2));
        } catch (err) {
            console.error("⚠️ Error writing dataset:", err.message);
        }

        await sleep(500); // Tiny delay to avoid hammering API too fast
    }

    console.log("🎯 Finished training custom words!");
}

main();
