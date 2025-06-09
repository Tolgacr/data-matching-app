import React from "react";

const Results = ({ results }) => {
  if (!results) return null;

  return (
    <div className="results-container">
      <h3>Analiz Sonuçları:</h3>
      <ul>
        {results.map((item, idx) => (
          <li key={idx}>
            <strong>{item.label}</strong>: {item.confidence}%
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Results;
