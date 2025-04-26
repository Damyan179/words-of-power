require('dotenv').config();
// const axios = require("axios");
// const allPlayerWords = require("./player_word_cost.json");

// async function pickBestMove(systemWord) {
//   let candidates = [];

//   for (const [word, cost] of Object.entries(allPlayerWords)) {
//     const response = await axios.post('http://127.0.0.1:5000/predict', {
//       system_word: systemWord,
//       player_word: word
//     });

//     if (response.data.prediction === 1) {
//       candidates.push({ word, cost });
//     }
//   }

//   if (candidates.length === 0) {
//     console.log("⚠️ No winning words found, picking cheapest random word...");
//     const randomWord = Object.entries(allPlayerWords)[Math.floor(Math.random() * Object.keys(allPlayerWords).length)];
//     return { word: randomWord[0], cost: randomWord[1] };
//   }

//   candidates.sort((a, b) => a.cost - b.cost);
//   return candidates[0];
// }

// async function test() {
//   const res = await pickBestMove("Love");
//   console.log("Best move:", res);
// }

// test();

