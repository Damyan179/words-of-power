import pandas as pd
import random

player_words = [
    "Sandpaper", "Oil", "Steam", "Acid", "Gust", "Boulder", "Drill", "Vacation",
    "Fire", "Drought", "Water", "Vacuum", "Laser", "Life Raft", "Bear Trap",
    "Hydraulic Jack", "Diamond Cage", "Dam", "Sunshine", "Mutation",
    "Kevlar Vest", "Jackhammer", "Signal Jammer", "Grizzly", "Reinforced Steel Door",
    "Bulldozer", "Sonic Boom", "Robot", "Glacier", "Love",
    "Fire Blanket", "Super Glue", "Therapy", "Disease", "Fire Extinguisher",
    "Satellite", "Confidence", "Absorption", "Neutralizing Agent", "Freeze", "Encryption",
    "Proof", "Molotov Cocktail", "Rainstorm", "Viral Meme", "War",
    "Dynamite", "Seismic Dampener", "Propaganda", "Explosion", "Lightning",
    "Evacuation", "Flood", "Lava", "Reforestation", "Avalanche", "Earthquake",
    "H-bomb", "Dragon", "Innovation", "Hurricane", "Tsunami", "Persistence",
    "Resilience", "Terraforming Device", "Anti-Virus Nanocloud", "AI Kill Switch",
    "Nanobot Swarm", "Reality Resynchronizer", "Cataclysm Containment Field",
    "Solar Deflection Array", "Planetary Evacuation Fleet", "Antimatter Cannon",
    "Planetary Defense Shield", "Singularity Stabilizer", "Orbital Laser", "Time"
]

word_types = {
    "Water": ["Water", "Rainstorm", "Flood", "Tsunami", "Drought"],
    "Fire": ["Fire", "Explosion", "Lava", "Molotov Cocktail", "Lightning"],
    "Nature": ["Avalanche", "Earthquake", "Reforestation", "Glacier"],
    "Weapons": ["War", "Dynamite", "H-bomb", "Dragon", "Antimatter Cannon"],
    "Defense": ["Dam", "Kevlar Vest", "Fire Blanket", "Fire Extinguisher", "Reinforced Steel Door", "Seismic Dampener"],
    "Tech": ["AI Kill Switch", "Nanobot Swarm", "Satellite", "Robot", "Terraforming Device", "Reality Resynchronizer", "Cataclysm Containment Field", "Solar Deflection Array", "Planetary Evacuation Fleet", "Planetary Defense Shield", "Singularity Stabilizer", "Orbital Laser"],
    "Mind": ["Persistence", "Innovation", "Confidence", "Propaganda", "Proof", "Therapy", "Absorption"],
    "Other": ["Sandpaper", "Oil", "Steam", "Acid", "Gust", "Boulder", "Drill", "Vacation", "Love", "Life Raft", "Freeze", "Neutralizing Agent", "Encryption", "Viral Meme", "Evacuation"]
}

def get_type(word):
    for t, words in word_types.items():
        if word in words:
            return t
    return "Other"

def determine_outcome(system_word, player_word):
    sys_type = get_type(system_word)
    ply_type = get_type(player_word)

    if system_word == player_word:
        return 0

    if (ply_type == "Water" and sys_type == "Fire"):
        return 1
    if (ply_type == "Tech" and sys_type == "Nature"):
        return 1
    if (ply_type == "Defense" and sys_type == "Weapons"):
        return 1
    if (ply_type == "Mind" and sys_type in ["Fire", "Weapons", "Nature", "Water"]):
        return random.choices([1, 0], weights=[70, 30])[0]
    if (ply_type == "Other" and sys_type == "Other"):
        return random.choices([1, 0], weights=[50, 50])[0]  
    return random.choices([1, 0], weights=[30, 70])[0]  

data = []
for _ in range(100_000):
    system_word = random.choice(player_words)
    player_word = random.choice(player_words)

    outcome = determine_outcome(system_word, player_word)

    data.append({
        "system_word": system_word,
        "player_word": player_word,
        "outcome": outcome
    })

df = pd.DataFrame(data)
df.to_csv('battle_dataset.csv', index=False)

print("✅ Generated 100,000 real battle examples and saved to battle_dataset.csv!")
