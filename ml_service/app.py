import os
import sys
from flask import Flask, request, jsonify

app = Flask(__name__)

# Lazy initialization of predictor so the Flask app can start even if train.py hasn't run yet
predictor = None

def get_predictor():
    global predictor
    if predictor is None:
        try:
            from predict import PriorityPredictor
            predictor = PriorityPredictor()
        except Exception as e:
            print(f"Warning: Could not load Keras model: {e}")
            print("The service will run in fallback rule-based mode until 'train.py' is executed.")
    return predictor

@app.route('/predict-priority', methods=['POST'])
def predict_priority():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No input data provided'}), 400
            
        incident_type = data.get('type', '')
        description = data.get('description', '')
        ward_name = data.get('ward', '')
        
        if not incident_type or not description or not ward_name:
            return jsonify({'success': False, 'error': 'Missing type, description, or ward'}), 400
            
        pred_service = get_predictor()
        if pred_service is None:
            # Fallback priority classification in Python if model is not yet compiled/saved
            fallback_map = {
                'fire': 'critical',
                'medical': 'critical',
                'flooding': 'high',
                'water-supply': 'high',
                'sewage': 'high',
                'road-damage': 'medium',
                'garbage': 'medium',
                'traffic': 'medium',
                'streetlight': 'low'
            }
            prio = fallback_map.get(incident_type, 'medium')
            return jsonify({
                'success': True,
                'priority': prio,
                'confidence': 99.00,
                'note': 'Fallback rule applied (Keras model not yet trained)'
            })
            
        result = pred_service.predict(incident_type, description, ward_name)
        return jsonify({
            'success': True,
            'priority': result['priority'],
            'confidence': result['confidence']
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health():
    pred_service = get_predictor()
    model_status = "loaded" if pred_service is not None else "not_trained"
    return jsonify({
        'status': 'ok',
        'service': 'CityPulse Priority Classifier API',
        'model_status': model_status
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"=========================================================")
    print(f"CityPulse AI Flask ML Service starting on port {port}...")
    print(f"API Health Check: http://localhost:{port}/health")
    print(f"Priority Endpoint: http://localhost:{port}/predict-priority")
    print(f"=========================================================")
    app.run(host='0.0.0.0', port=port, debug=False)
