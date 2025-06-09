import React, { useState } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";

const UploadImage = ({ setResults }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = (acceptedFiles) => {
    setFile(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const handleUpload = async () => {
    if (!file) return alert("Lütfen bir dosya seçin!");
    setIsUploading(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.post("http://127.0.0.1:5000/analyze", formData);
      setResults(response.data);
    } catch (error) {
      console.error("Yükleme hatası:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="upload-container">
      <div {...getRootProps({ className: "dropzone" })}>
        <input {...getInputProps()} />
        <p>Görüntüyü buraya sürükle ya da tıkla</p>
      </div>
      {file && <p>Seçilen dosya: {file.name}</p>}
      <button onClick={handleUpload} disabled={isUploading}>
        {isUploading ? "Yükleniyor..." : "Yükle ve Analiz Et"}
      </button>
    </div>
  );
};

export default UploadImage;
