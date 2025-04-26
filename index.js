const axios = require('axios');

async function testPrediction() {
    try {
        const response = await axios.post('http://127.0.0.1:5000/predict', {
            system_word: "Tsunami",
            player_word: "Drought"
        });
        console.log("Sending system_word as Tsunami and player_word as Drought")
        
        console.log("Prediction result:", response.data);
    } catch (error) {
        console.error("Error calling the Flask API:", error.message);
    }
}

testPrediction();
