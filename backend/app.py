from flask import Flask, request, jsonify
import os

from tensorflow.keras.applications import ResNet50
from tensorflow.keras.preprocessing.image import load_img, img_to_array
from tensorflow.keras.applications.resnet50 import preprocess_input, decode_predictions

import pydicom
import numpy as np
from flask_cors import CORS

# MedMNIST için ek importlar
from medmnist import INFO
import torch
from torchvision import transforms
from PIL import Image as PILImage

app = Flask(__name__)
CORS(app)

# Keras modeli
model = ResNet50(weights="imagenet")

# MedMNIST modelini yükle
info = INFO['pneumoniamnist']
medmnist_model = torch.hub.load(
    'MedMNIST/MedMNIST', 'pneumoniamnist_resnet18', pretrained=True
)
medmnist_model.eval()

@app.route('/analyze', methods=['POST'])
def analyze_image():
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    file = request.files['image']
    filename = os.path.basename(file.filename)
    file_path = os.path.join("uploads", filename)
    file.save(file_path)

    image = load_img(file_path, target_size=(224, 224))
    image_array = img_to_array(image)
    image_array = preprocess_input(image_array)
    image_array = image_array.reshape((1, *image_array.shape))

    predictions = model.predict(image_array)
    decoded_predictions = decode_predictions(predictions, top=3)

    label_descriptions = {
        "spotlight": "Görüntüde ışık yoğunluğu yüksek bir alan tespit edildi.",
        "stethoscope": "Görüntüde bir stetoskop tespit edildi, bu tıbbi bir ekipmandır.",
        "dog": "Görüntüde bir köpek tespit edildi.",
        "cat": "Görüntüde bir kedi tespit edildi.",
        "person": "Görüntüde bir insan tespit edildi.",
    }

    result = []
    for _, label, score in decoded_predictions[0]:
        description = label_descriptions.get(label, f"{label} tespit edildi. Bu nesne model tarafından yüksek olasılıkla algılandı.")
        result.append({
            "label": label,
            "score": float(score),
            "description": description
        })

    return jsonify({"predictions": result})

@app.route('/analyze_medical', methods=['POST'])
def analyze_medical():
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided"}), 400

        file = request.files['image']
        filename = os.path.basename(file.filename)
        file_path = os.path.join("uploads", filename)
        file.save(file_path)

        image = PILImage.open(file_path).convert('L').resize((28, 28))
        transform = transforms.Compose([
            transforms.ToTensor(),
            transforms.Normalize(mean=[.5], std=[.5])
        ])
        img_tensor = transform(image).unsqueeze(0)

        with torch.no_grad():
            output = medmnist_model(img_tensor)
            pred = torch.argmax(output, 1).item()
            confidence = float(torch.softmax(output, 1)[0][pred])

        disease_map = {
            0: "Normal akciğer dokusu tespit edildi. Görüntüde pnömoni bulgusu yok.",
            1: "Pnömoni (zatürre) tespit edildi. Görüntüde enfeksiyon bulguları mevcut."
        }
        description = disease_map.get(pred, "Bilinmeyen sonuç.")

        return jsonify({
            "prediction": int(pred),
            "confidence": confidence,
            "description": description
        })
    except Exception as e:
        print("ANALYZE_MEDICAL ERROR:", e)
        return jsonify({"error": str(e)}), 500

@app.route('/analyze_dicom', methods=['POST'])
def analyze_dicom():
    if 'dicom' not in request.files:
        return jsonify({"error": "No DICOM file provided"}), 400

    file = request.files['dicom']
    filename = os.path.basename(file.filename)
    file_path = os.path.join("uploads", filename)
    file.save(file_path)

    dicom_data = pydicom.dcmread(file_path)
    pixel_array = dicom_data.pixel_array

    min_intensity = np.min(pixel_array)
    max_intensity = np.max(pixel_array)
    mean_intensity = np.mean(pixel_array)

    analysis_result = {
        "min_intensity": float(min_intensity),
        "max_intensity": float(max_intensity),
        "mean_intensity": float(mean_intensity),
        "diagnosis": "Normal" if mean_intensity > 500 else "Anormal"
    }

    return jsonify(analysis_result)

if __name__ == '__main__':
    os.makedirs("uploads", exist_ok=True)
    app.run(debug=True)
