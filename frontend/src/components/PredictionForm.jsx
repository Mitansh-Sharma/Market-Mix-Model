import React, { useState, useEffect, useRef } from "react";

function PredictionForm() {
  const [formData, setFormData] = useState({
    totalBudget: 200,
    facebook: 50,
    google: 50,
    influencer: 30,
    tv: 40,
    promo: 15
  });
  const [prediction, setPrediction] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const canvasRef = useRef(null);
  const efficiencyCanvasRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const predictOrders = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      setPrediction(data.predictedOrders);
    } catch (error) {
      console.error(error);
    }
  };

  const currentTotal =
    formData.facebook + formData.google + formData.influencer + formData.tv;
  const utilization =
    formData.totalBudget > 0 ? (currentTotal / formData.totalBudget) * 100 : 0;

  const scenarios = {
    Current: [formData.facebook, formData.google, formData.influencer, formData.tv, formData.promo],
    "Digital Heavy": [
      0.4 * currentTotal,
      0.4 * currentTotal,
      0.1 * currentTotal,
      0.1 * currentTotal,
      formData.promo
    ],
    "TV Heavy": [
      0.2 * currentTotal,
      0.2 * currentTotal,
      0.1 * currentTotal,
      0.5 * currentTotal,
      formData.promo
    ],
    "Even Split": [0.25 * currentTotal, 0.25 * currentTotal, 0.25 * currentTotal, 0.25 * currentTotal, formData.promo]
  };

  const scenarioResults = Object.entries(scenarios).map(([name, alloc]) => {
    const pred = 100 + alloc.slice(0, 4).reduce((a, b) => a + b, 0) * 0.5;
    const roi = alloc.slice(0, 4).reduce((a, b) => a + b, 0) > 0 ? pred / alloc.slice(0, 4).reduce((a, b) => a + b, 0) : 0;
    return { Scenario: name, Facebook: alloc[0].toFixed(1), Google: alloc[1].toFixed(1), Influencer: alloc[2].toFixed(1), TV: alloc[3].toFixed(1), "Promo %": alloc[4], "Predicted Orders": pred.toFixed(0), ROI: roi.toFixed(2) };
  });

  const weights = [0.4, 0.25, 0.15, 0.15];

  // Draw pie chart
  useEffect(() => {
    if (!canvasRef.current || currentTotal === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 80;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const data = [
      { label: "Facebook", value: formData.facebook, color: "#4267B2" },
      { label: "Google", value: formData.google, color: "#4285F4" },
      { label: "Influencer", value: formData.influencer, color: "#E4405F" },
      { label: "TV", value: formData.tv, color: "#000" }
    ];

    let currentAngle = -Math.PI / 2;

    data.forEach((item) => {
      const sliceAngle = (item.value / currentTotal) * 2 * Math.PI;
      
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fill();

      const labelAngle = currentAngle + sliceAngle / 2;
      const labelX = centerX + Math.cos(labelAngle) * (radius * 0.65);
      const labelY = centerY + Math.sin(labelAngle) * (radius * 0.65);

      const percent = ((item.value / currentTotal) * 100).toFixed(0);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${percent}%`, labelX, labelY);

      currentAngle += sliceAngle;
    });
  }, [formData, currentTotal]);

  // Draw efficiency chart
  useEffect(() => {
    if (!efficiencyCanvasRef.current) return;

    const canvas = efficiencyCanvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const channels = ["Facebook", "Google", "Influencer", "TV"];
    const amounts = [formData.facebook, formData.google, formData.influencer, formData.tv];
    const efficiency = amounts.map((amt, i) => (amt > 0 ? (prediction * weights[i]) / amt : 0));

    const maxEff = Math.max(...efficiency, 1);
    const barWidth = canvas.width / channels.length - 20;
    const scale = (canvas.height - 40) / maxEff;

    channels.forEach((ch, i) => {
      const x = i * (barWidth + 20) + 10;
      const barHeight = efficiency[i] * scale;
      const y = canvas.height - 30 - barHeight;

      ctx.fillStyle = "#0066cc";
      ctx.fillRect(x, y, barWidth, barHeight);

      ctx.fillStyle = "#333";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(ch, x + barWidth / 2, canvas.height - 5);
      ctx.fillText(efficiency[i].toFixed(2), x + barWidth / 2, y - 5);
    });
  }, [formData, prediction, weights]);

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", fontFamily: "'Segoe UI', sans-serif", color: "#333" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem" }}>
        
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: 600, margin: "0 0 0.5rem 0" }}>Marketing Spend Optimizer</h1>
          <p style={{ margin: 0, color: "#666", fontSize: "0.95rem" }}>Marketing Budget Allocation & ROI Analytics</p>
        </div>

        {/* Main Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "2rem" }}>
          
          {/* Left: Controls */}
          <div style={{ background: "white", borderRadius: "8px", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginTop: 0, marginBottom: "1.5rem" }}>Budget Allocation</h2>
            
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, marginBottom: "0.5rem" }}>Total Weekly Budget (₹000)</label>
              <input
                type="number"
                name="totalBudget"
                value={formData.totalBudget}
                onChange={handleChange}
                style={{ width: "100%", padding: "0.5rem", border: "1px solid #ddd", borderRadius: "4px", fontSize: "0.95rem", boxSizing: "border-box" }}
              />
            </div>

            {["facebook", "google", "influencer", "tv", "promo"].map((key) => (
              <div key={key} style={{ marginBottom: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                  <label style={{ fontSize: "0.9rem", fontWeight: 500 }}>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                  <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#0066cc" }}>₹{formData[key]}k</span>
                </div>
                <input
                  type="range"
                  name={key}
                  min="0"
                  max="200"
                  value={formData[key]}
                  onChange={handleChange}
                  style={{ width: "100%", height: "5px", borderRadius: "3px", cursor: "pointer", accentColor: "#0066cc" }}
                />
              </div>
            ))}

            <div style={{ marginTop: "1.5rem", padding: "1rem", background: utilization > 100 ? "#fee" : "#efe", borderRadius: "6px", fontSize: "0.9rem" }}>
              {utilization > 100 ? (
                <span style={{ color: "#d32f2f" }}>⚠ Over budget by ₹{currentTotal - formData.totalBudget}k</span>
              ) : (
                <span style={{ color: "#388e3c" }}>✓ Budget utilization: {utilization.toFixed(1)}%</span>
              )}
            </div>

            <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid #eee" }}>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 600, marginTop: 0, marginBottom: "0.8rem" }}>Channel Share</h3>
              {currentTotal > 0 && ["facebook", "google", "influencer", "tv"].map((key) => (
                <p key={key} style={{ fontSize: "0.85rem", margin: "0.4rem 0", display: "flex", justifyContent: "space-between" }}>
                  <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                  <span style={{ fontWeight: 600 }}>{((formData[key] / currentTotal) * 100).toFixed(1)}%</span>
                </p>
              ))}
            </div>
          </div>

          {/* Right: Metrics & Pie */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ background: "white", borderRadius: "8px", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginTop: 0, marginBottom: "1.5rem" }}>Key Metrics</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                <div>
                  <p style={{ fontSize: "0.85rem", color: "#666", margin: "0 0 0.4rem 0" }}>Predicted Orders</p>
                  <p style={{ fontSize: "1.8rem", fontWeight: 700, margin: 0, color: "#0066cc" }}>{prediction.toFixed(0)}</p>
                </div>
                <div>
                  <p style={{ fontSize: "0.85rem", color: "#666", margin: "0 0 0.4rem 0" }}>ROI</p>
                  <p style={{ fontSize: "1.8rem", fontWeight: 700, margin: 0, color: "#0066cc" }}>{currentTotal > 0 ? (prediction / currentTotal).toFixed(2) + "x" : "—"}</p>
                </div>
              </div>
              <div>
                <p style={{ fontSize: "0.85rem", color: "#666", margin: "0 0 0.4rem 0" }}>Total Spend</p>
                <p style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>₹{currentTotal}k</p>
              </div>
              <button onClick={predictOrders} style={{ marginTop: "1.5rem", width: "100%", padding: "0.75rem", background: "#0066cc", color: "white", border: "none", borderRadius: "4px", fontSize: "0.95rem", fontWeight: 600, cursor: "pointer" }}>Predict Orders</button>
            </div>

            {currentTotal > 0 && (
              <div style={{ background: "white", borderRadius: "8px", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 600, margin: "0 0 1rem 0" }}>Spend Allocation</h3>
                <canvas ref={canvasRef} width={260} height={260} style={{ maxWidth: "100%" }} />
              </div>
            )}
          </div>
        </div>

        {/* Advanced Analysis Toggle */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "flex", alignItems: "center", cursor: "pointer", fontSize: "0.95rem", fontWeight: 500 }}>
            <input
              type="checkbox"
              checked={showAdvanced}
              onChange={() => setShowAdvanced(!showAdvanced)}
              style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "#0066cc", marginRight: "0.5rem" }}
            />
            Advanced Analysis
          </label>
        </div>

        {/* Advanced Charts */}
        {showAdvanced && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "2rem" }}>
            <div style={{ background: "white", borderRadius: "8px", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, marginTop: 0, marginBottom: "1rem" }}>SHAP Feature Importance</h3>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end", height: "200px", padding: "1rem 0" }}>
                {[
                  { name: "Facebook", val: 0.4 },
                  { name: "Google", val: 0.25 },
                  { name: "Influencer", val: 0.15 },
                  { name: "TV", val: 0.15 },
                  { name: "Promo", val: 0.05 }
                ].map((item, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: "100%", background: "#0066cc", height: `${item.val * 200}px`, borderRadius: "4px 4px 0 0" }} />
                    <span style={{ fontSize: "0.8rem", marginTop: "0.5rem", textAlign: "center", color: "#666" }}>{item.name}</span>
                    <span style={{ fontSize: "0.75rem", color: "#0066cc", fontWeight: 600 }}>{item.val.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "white", borderRadius: "8px", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, marginTop: 0, marginBottom: "1rem" }}>Spend Efficiency (Orders per ₹)</h3>
              <canvas ref={efficiencyCanvasRef} width={450} height={280} style={{ width: "100%", height: "auto" }} />
            </div>
          </div>
        )}

        {/* Scenario Comparison */}
        <div style={{ background: "white", borderRadius: "8px", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginTop: 0, marginBottom: "1.5rem" }}>Scenario Comparison</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ background: "#f5f5f5", borderBottom: "2px solid #ddd" }}>
                  {Object.keys(scenarioResults[0]).map((col) => (
                    <th key={col} style={{ padding: "0.75rem", textAlign: "left", fontWeight: 600 }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {scenarioResults.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                    {Object.values(row).map((val, i) => (
                      <td key={i} style={{ padding: "0.75rem" }}>{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PredictionForm;