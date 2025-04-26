require('dotenv').config();
const axios = require('axios')
const host = "http://10.41.186.9:8000"; 
const registerUrl = `${host}/register`;
const playerId = process.env.PLAYERID;

async function register(playerId) {
    if (!playerId) {
        console.error("PLAYERID is not defined!");
        return;
    }
    const payload = { player_id: playerId };
    const response = await axios.post(registerUrl, payload);
    console.log(response.data);
}

register(playerId);
