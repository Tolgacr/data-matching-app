import React, { useState } from "react";
import axios from "axios";

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (event) => {
    setSelectedImage(event.target.files[0]);
    setAnalysisResult(null); // Önceki sonucu temizle
  };

  const handleAnalyze = async () => {
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

  return (
    <div className="p-6 space-y-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold">Medikal Görüntü Analizi</h1>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      <button
        onClick={handleAnalyze}
        className={`bg-blue-500 text-white px-4 py-2 rounded ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        disabled={loading}
      >
        {loading ? "Analiz Ediliyor..." : "Analiz Et"}
      </button>

      {analysisResult && (
        <div className="mt-4">
          <h2 className="text-lg font-bold">Sonuçlar</h2>
          <pre className="bg-gray-200 p-2 rounded">{JSON.stringify(analysisResult, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
