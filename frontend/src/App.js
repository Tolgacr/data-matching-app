import React, { useState } from "react";
import axios from "axios";
import './App.css';

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    setSelectedImage(event.target.files[0]);
    setAnalysisResult(null);
  };

  const handleAnalyzeImage = async () => {
    if (!selectedImage) {
      alert("Lütfen bir görüntü seçin!");
      return;
    }
    const formData = new FormData();
    formData.append("image", selectedImage);

    try {
      setLoading(true);
      const response = await axios.post("http://127.0.0.1:5000/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAnalysisResult(response.data);
    } catch (error) {
      console.error("Analiz hatası:", error);
      alert("Analiz sırasında bir hata oluştu. Konsolu kontrol edin.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeDicom = async () => {
    if (!selectedImage) {
      alert("Lütfen bir DICOM dosyası seçin!");
      return;
    }
    const formData = new FormData();
    formData.append("dicom", selectedImage);

    try {
      setLoading(true);
      const response = await axios.post("http://127.0.0.1:5000/analyze_dicom", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAnalysisResult(response.data);
    } catch (error) {
      console.error("DICOM analizi hatası:", error);
      alert("DICOM analizi sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeMedical = async () => {
    if (!selectedImage) {
      alert("Lütfen bir görüntü seçin!");
      return;
    }
    const formData = new FormData();
    formData.append("image", selectedImage);

    try {
      setLoading(true);
      const response = await axios.post("http://127.0.0.1:5000/analyze_medical", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAnalysisResult(response.data);
    } catch (error) {
      console.error("Medikal analiz hatası:", error);
      alert("Medikal analiz sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>Medikal Görüntü ve DICOM Analizi</h1>
      <div className="input-group">
        <input type="file" accept="image/*,.dcm" onChange={handleFileChange} />
      </div>
      <div className="button-group">
        <button
          className="custom-button"
          onClick={handleAnalyzeImage}
          disabled={loading}
        >
          {loading ? "Görüntü Analiz Ediliyor..." : "Görüntü Analiz Et"}
        </button>
        <button
          className="custom-button"
          onClick={handleAnalyzeDicom}
          disabled={loading}
        >
          {loading ? "DICOM Analiz Ediliyor..." : "DICOM Analiz Et"}
        </button>
        <button
          className="custom-button"
          onClick={handleAnalyzeMedical}
          disabled={loading}
        >
          {loading ? "Medikal Analiz Ediliyor..." : "Medikal Analiz Et"}
        </button>
      </div>

      {/* Klasik analiz sonucu */}
      {analysisResult && analysisResult.predictions && (
        <div className="result-box">
          <h2>Analiz Sonuçları</h2>
          <ul>
            {analysisResult.predictions.map((item, idx) => (
              <li key={idx}>
                <b>{item.label}</b>: {Math.round(item.score * 100)}%
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Medikal analiz sonucu */}
      {analysisResult && analysisResult.description && (
        <div className="result-box">
          <h2>Medikal Analiz Sonucu</h2>
          <p><b>Açıklama:</b> {analysisResult.description}</p>
          <p><b>Olasılık:</b> {Math.round(analysisResult.confidence * 100)}%</p>
        </div>
      )}
    </div>
  );
}

export default App;
