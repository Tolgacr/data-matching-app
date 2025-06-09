from flask import Flask, request, jsonify
import tensorflow as tf
from tensorflow.keras.applications import ResNet50
from tensorflow.keras.preprocessing.image import load_img, img_to_array
from tensorflow.keras.applications.resnet50 import preprocess_input, decode_predictions
import os

app = Flask(__name__)

model = ResNet50(weights="imagenet")

@app.route('/analyze', methods=['POST'])
def analyze_image():
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    file = request.files['image']
    file_path = os.path.join("uploads", file.filename)
    file.save(file_path)

    image = load_img(file_path, target_size=(224, 224))
    image_array = img_to_array(image)
    image_array = preprocess_input(image_array)
    image_array = image_array.reshape((1, *image_array.shape))

    predictions = model.predict(image_array)
    decoded_predictions = decode_predictions(predictions, top=3)

    result = [{"label": label, "score": float(score)} for _, label, score in decoded_predictions[0]]
    return jsonify({"predictions": result})

if __name__ == '__main__':
    os.makedirs("uploads", exist_ok=True)
    app.run(debug=True)
