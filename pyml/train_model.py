import pandas as pd
import random
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
import joblib

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

data = []
for system_word in player_words:
    for player_word in player_words:
        if system_word == player_word:
            outcome = 0
        elif (system_word == "Fire" and player_word == "Water") or (system_word == "War" and player_word == "Peace") or (system_word == "Tsunami" and player_word == "Drought"):
            outcome = 1
        else:
            outcome = random.choice([0, 1])

        data.append({
            "system_word": system_word,
            "player_word": player_word,
            "outcome": outcome
        })

df = pd.DataFrame(data)

all_words = pd.unique(df[['system_word', 'player_word']].values.ravel('K'))

system_encoder = LabelEncoder()
player_encoder = LabelEncoder()

system_encoder.fit(all_words)
player_encoder.fit(all_words)

df['system_encoded'] = system_encoder.transform(df['system_word'])
df['player_encoded'] = player_encoder.transform(df['player_word'])

X = df[['system_encoded', 'player_encoded']]
y = df['outcome']

model = RandomForestClassifier()
model.fit(X, y)

joblib.dump(model, 'model.pkl')
joblib.dump(system_encoder, 'system_encoder.pkl')
joblib.dump(player_encoder, 'player_encoder.pkl')

print("✅ Model and encoders saved successfully!")
