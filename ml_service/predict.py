import os
import pickle
import numpy as np
import pandas as pd

class PriorityPredictor:
    def __init__(self, model_dir=None):
        # Lazy import of tensorflow to prevent import crashes on machines without tensorflow
        try:
            import tensorflow as tf
            self.tf = tf
        except ImportError as e:
            raise ImportError(
                "TensorFlow is not installed in this environment. "
                "For local inference with the Keras model, please run in an environment with TensorFlow installed."
            ) from e

        if model_dir is None:
            model_dir = os.path.dirname(__file__)
            
        self.model_path = os.path.join(model_dir, 'priority_model.keras')
        self.preprocessor_path = os.path.join(model_dir, 'preprocessor.pkl')
        
        if not os.path.exists(self.model_path) or not os.path.exists(self.preprocessor_path):
            raise FileNotFoundError(
                f"Model or preprocessor not found in {model_dir}. Please run train.py first to generate them."
            )
            
        print(f"Loading Keras model from: {self.model_path}")
        self.model = self.tf.keras.models.load_model(self.model_path)
        
        print(f"Loading preprocessor pipeline from: {self.preprocessor_path}")
        with open(self.preprocessor_path, 'rb') as f:
            self.preprocessor = pickle.load(f)
            
        self.priority_classes = ['critical', 'high', 'medium', 'low']
        
    def predict(self, incident_type, description, ward_name):
        # Format input exactly as expected by the preprocessor's ColumnTransformer
        df = pd.DataFrame([{
            'type': incident_type,
            'description': description,
            'ward': ward_name
        }])
        
        # Transform features
        X = self.preprocessor.transform(df).toarray()
        
        # Run inference
        preds = self.model.predict(X, verbose=0)
        pred_idx = np.argmax(preds[0])
        confidence = float(preds[0][pred_idx]) * 100
        
        return {
            'priority': self.priority_classes[pred_idx],
            'confidence': round(confidence, 2)
        }

if __name__ == '__main__':
    # Standard CLI verification test
    print("=========================================================")
    print("Starting CityPulse AI Priority Inference test...")
    print("=========================================================")
    try:
        predictor = PriorityPredictor()
        
        test_cases = [
            {
                'incident_type': 'fire',
                'description': 'Urgent: electric transformer caught fire and exploded near shop.',
                'ward_name': 'Malleshwaram'
            },
            {
                'incident_type': 'flooding',
                'description': 'Underpass flooded with heavy rain water. Traffic jam.',
                'ward_name': 'Mahadevapura'
            },
            {
                'incident_type': 'streetlight',
                'description': 'Flickering street lamp bulb needs replacement.',
                'ward_name': 'Koramangala'
            }
        ]
        
        for idx, test_case in enumerate(test_cases):
            result = predictor.predict(**test_case)
            print(f"\n[Test Case {idx + 1}]")
            print(f" - Input Type: {test_case['incident_type']}")
            print(f" - Input Desc: '{test_case['description']}'")
            print(f" - Input Ward: {test_case['ward_name']}")
            print(f" => PREDICTED PRIORITY: {result['priority'].upper()} (Confidence: {result['confidence']}%)")
            
    except Exception as e:
        print(f"Verification test failed: {e}")
        print("Please ensure you have run 'python train.py' in this directory first.")
