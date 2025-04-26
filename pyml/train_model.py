import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
import joblib

data = [
    {"system_word": "Fire", "player_word": "Water", "outcome": 1},
    {"system_word": "Water", "player_word": "Fire", "outcome": 0},
    {"system_word": "War", "player_word": "Peace", "outcome": 1},
    {"system_word": "Peace", "player_word": "War", "outcome": 1},
    {"system_word": "Tsunami", "player_word": "Drought", "outcome": 1},
    {"system_word": "Drought", "player_word": "Tsunami", "outcome": 1},
    {"system_word": "Explosion", "player_word": "Fire", "outcome": 1},
    {"system_word": "Virus", "player_word": "Anti-Virus Nanocloud", "outcome": 1},
    {"system_word": "Lion", "player_word": "Grizzly", "outcome": 1},
    {"system_word": "Rocket", "player_word": "Satellite", "outcome": 1},
    {"system_word": "Disease", "player_word": "Therapy", "outcome": 1},
    {"system_word": "Avalanche", "player_word": "Seismic Dampener", "outcome": 1},
]

df = pd.DataFrame(data)

system_encoder = LabelEncoder()
player_encoder = LabelEncoder()

df['system_encoded'] = system_encoder.fit_transform(df['system_word'])
df['player_encoded'] = player_encoder.fit_transform(df['player_word'])

X = df[['system_encoded', 'player_encoded']]
y = df['outcome']

model = RandomForestClassifier()
model.fit(X, y)

joblib.dump(model, 'model.pkl')
joblib.dump(system_encoder, 'system_encoder.pkl')
joblib.dump(player_encoder, 'player_encoder.pkl')

print("✅ Model and encoders saved!")
