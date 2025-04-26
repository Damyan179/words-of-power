import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
import joblib

df = pd.read_csv('battle_dataset.csv')

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

print("✅ Model and encoders trained on real battle data!")
