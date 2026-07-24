import os
import json
import random
import pickle
import numpy as np
import pandas as pd
import tensorflow as tf
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer

# Set random seeds for reproducibility
random.seed(42)
np.random.seed(42)
tf.random.set_seed(42)

print("=========================================================")
print("Starting CityPulse AI MLP priority model training...")
print("=========================================================")

# 1. GPU Check
gpus = tf.config.list_physical_devices('GPU')
if gpus:
    print(f"GPU Acceleration Available! Found GPU: {gpus}")
    # Enable memory growth to avoid locking all GPU memory
    try:
        for gpu in gpus:
            tf.config.experimental.set_memory_growth(gpu, True)
    except Exception as e:
        print(f"GPU config error: {e}")
else:
    print("ℹ️ GPU Acceleration NOT Available. Training will run on CPU.")

# 2. Generate Synthetic Training Data (~1,200 samples)
print("\nGenerating synthetic municipal incident dataset...")

types_and_wards = {
    'fire': {
        'priority': 'critical',
        'templates': [
            "Severe fire outbreak in a residential apartment building.",
            "Kitchen fire reported at a restaurant on main road, smoke billowing.",
            "Electric transformer caught fire and exploded, sparks flying.",
            "Gas cylinder leakage and minor fire in shop basement.",
            "Warehouse fire reported in commercial zone, fire engines dispatched."
        ]
    },
    'medical': {
        'priority': 'critical',
        'templates': [
            "Major road accident with multiple injuries, urgent ambulance required.",
            "Citizen collapsed on the footpath showing heart attack symptoms.",
            "Construction site accident, worker fell from third floor with head injury.",
            "Severe burn victim needs immediate medical attention.",
            "Vehicle collision on flyover, passengers trapped and injured."
        ]
    },
    'flooding': {
        'priority': 'high',
        'templates': [
            "Underpass completely flooded with 3 feet of water, two cars stranded.",
            "Heavy rain causing severe waterlogging on main road, traffic blocked.",
            "Stormwater drain choked, rainwater entering residential houses.",
            "Outer ring road flooded, vehicles floating and traffic backed up for miles.",
            "Flooding in basement parking, electrical panels threatened."
        ]
    },
    'water-supply': {
        'priority': 'high',
        'templates': [
            "Main water supply pipeline burst, drinking water overflowing on road.",
            "No water supply in the locality for past 4 consecutive days.",
            "Contaminated, muddy water coming from municipal taps.",
            "BWSSB pipeline leaking high pressure water, flooding the footpath.",
            "Drinking water leakage from main valve near park."
        ]
    },
    'sewage': {
        'priority': 'high',
        'templates': [
            "Sewage overflow from open manhole, spreading bad smell on street.",
            "Blocked sewer line causing backflow into household toilets.",
            "Drainage water overflowing onto public walkway, safety hazard.",
            "Manhole cover broken and sewage bubbling out on main road.",
            "Sewage leakage contaminating nearby fresh water sump."
        ]
    },
    'road-damage': {
        'priority': 'medium',
        'templates': [
            "Large deep pothole on main road causing accidents for two-wheelers.",
            "Road caved in near construction site, needs barricades.",
            "Footpath tiles broken and damaged, unsafe for senior citizens.",
            "Road surface eroded completely after recent heavy rains.",
            "Speed breaker has no paint/markings, causing vehicle damage."
        ]
    },
    'garbage': {
        'priority': 'medium',
        'templates': [
            "Huge pile of garbage dumped near public school entrance, unhygienic.",
            "Garbage bin overflowing, stray dogs and cows spreading waste.",
            "Illegal trash dumping on the corner of the cross road.",
            "Waste accumulated in park, bad odor spreading in neighborhood.",
            "Dry and wet waste mixed and dumped on vacant plot."
        ]
    },
    'traffic': {
        'priority': 'medium',
        'templates': [
            "Traffic signal completely non-functional at busy intersection.",
            "Illegal parking on double lanes causing heavy congestion.",
            "Broken down truck blocking main road lane, heavy jam.",
            "Chaos at crossroad junction due to lack of traffic police.",
            "Road construction work blocking two lanes, severe bottleneck."
        ]
    },
    'streetlight': {
        'priority': 'low',
        'templates': [
            "Streetlight non-functional for past 5 days, dark and unsafe.",
            "Multiple streetlights off on the main avenue, dark spots.",
            "Lamp post bulb flickering constantly, causing visibility issues.",
            "Street lights not switched off during daytime, wasting power.",
            "New streetlight installed but not connected to electricity grid."
        ]
    }
}

wards = ['Mahadevapura', 'Whitefield', 'Koramangala', 'Indiranagar', 'Jayanagar', 
         'Rajajinagar', 'Malleshwaram', 'Basavanagudi', 'Yelahanka', 'Hebbal', 
         'BTM Layout', 'HSR Layout', 'Electronic City', 'Marathahalli', 'JP Nagar']

dataset = []
for _ in range(1200):
    inc_type = random.choice(list(types_and_wards.keys()))
    ward = random.choice(wards)
    info = types_and_wards[inc_type]
    priority = info['priority']
    
    # Select template and add slight variations to simulate raw text
    template = random.choice(info['templates'])
    variations = [
        lambda t: t,
        lambda t: t.lower(),
        lambda t: f"Urgent: {t}",
        lambda t: f"Please fix. {t}",
        lambda t: f"Reported at {ward} ward - {t}",
        lambda t: f"{t} Urgent action needed."
    ]
    description = random.choice(variations)(template)
    
    dataset.append({
        'type': inc_type,
        'description': description,
        'ward': ward,
        'priority': priority
    })

df = pd.DataFrame(dataset)
print(f"Generated {len(df)} training examples.")

# 3. Preprocessing Setup
print("Building preprocessor pipeline...")
preprocessor = ColumnTransformer(
    transformers=[
        ('text', TfidfVectorizer(max_features=400, stop_words='english'), 'description'),
        ('cat_type', OneHotEncoder(handle_unknown='ignore'), ['type']),
        ('cat_ward', OneHotEncoder(handle_unknown='ignore'), ['ward'])
    ]
)

X = preprocessor.fit_transform(df).toarray()

# Encode labels
priority_classes = ['critical', 'high', 'medium', 'low']
priority_map = {priority_classes[i]: i for i in range(len(priority_classes))}
y_encoded = df['priority'].map(priority_map).values
y = tf.keras.utils.to_categorical(y_encoded, num_classes=4)

print(f"Input features shape: {X.shape}")
print(f"Output classes shape: {y.shape}")

# Split into train and test sets
indices = np.random.permutation(len(X))
split_idx = int(0.8 * len(X))
X_train, X_test = X[indices[:split_idx]], X[indices[split_idx:]]
y_train, y_test = y[indices[:split_idx]], y[indices[split_idx:]]

# 4. Define TensorFlow/Keras MLP Model
print("Compiling TensorFlow Multi-Layer Perceptron (MLP)...")
model = tf.keras.Sequential([
    tf.keras.layers.Input(shape=(X.shape[1],)),
    tf.keras.layers.Dense(128, activation='relu'),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.Dropout(0.3),
    tf.keras.layers.Dense(64, activation='relu'),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.Dropout(0.2),
    tf.keras.layers.Dense(32, activation='relu'),
    tf.keras.layers.Dense(4, activation='softmax')
])

model.compile(
    optimizer='adam',
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

model.summary()

# 5. Model Training
epochs = 15
batch_size = 32
print(f"\nTraining model for {epochs} epochs on batch size {batch_size}...")
history = model.fit(
    X_train, y_train,
    epochs=epochs,
    batch_size=batch_size,
    validation_data=(X_test, y_test),
    verbose=1
)

# 6. Evaluate Model
loss, accuracy = model.evaluate(X_test, y_test, verbose=0)
print(f"\nTest loss: {loss:.4f}, Test Accuracy: {accuracy*100:.2f}%")

# 7. Save Artifacts
print("\nSaving trained artifacts...")
os.makedirs(os.path.dirname(__file__), exist_ok=True)

model_path = os.path.join(os.path.dirname(__file__), 'priority_model.keras')
model.save(model_path)
print(f"Saved TensorFlow model to: {model_path}")

preprocessor_path = os.path.join(os.path.dirname(__file__), 'preprocessor.pkl')
with open(preprocessor_path, 'wb') as f:
    pickle.dump(preprocessor, f)
print(f"Saved preprocessor pipeline to: {preprocessor_path}")

print("\nModel training successful!")
