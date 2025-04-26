from flask import Flask, request, jsonify
import joblib

# 1. Load trained model and encoders
model = joblib.load('model.pkl')
system_encoder = joblib.load('system_encoder.pkl')
player_encoder = joblib.load('player_encoder.pkl')

# 2. Create Flask app
app = Flask(__name__)

# 3. Define a route for predictions
@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    system_word = data['system_word']
    player_word = data['player_word']
    
    try:
        system_encoded = system_encoder.transform([system_word])[0]
        player_encoded = player_encoder.transform([player_word])[0]
    except ValueError:
        return jsonify({'error': 'Word not found in encoder. Please train more words.'}), 400

    prediction = model.predict([[system_encoded, player_encoded]])
    result = int(prediction[0])

    return jsonify({'prediction': result})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
