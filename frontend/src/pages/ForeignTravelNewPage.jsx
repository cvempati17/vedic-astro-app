import React, { useState, useEffect } from 'react';
import { analyzeForeignTravel } from '../utils/foreignTravelUtils';
import BirthChart from '../components/BirthChart';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './ForeignTravelNewPage.css';

const ForeignTravelNewPage = ({ onBack }) => {
    const [charts, setCharts] = useState([]);
    const [selectedChartId, setSelectedChartId] = useState('');
    const [analysis, setAnalysis] = useState(null);
    const [selectedChart, setSelectedChart] = useState(null);
    const [trend, setTrend] = useState("Flat");

    useEffect(() => {
        const saved = localStorage.getItem('savedCharts');
        if (saved) {
            let parsed = JSON.parse(saved);
            setCharts(parsed);
        }
    }, []);

    const calculateTrend = (data) => {
        if (!data || data.length < 2) return "Flat";
        let diffs = [];
        for (let i = 1; i < data.length; i++) {
            diffs.push(data[i].score - data[i - 1].score);
        }
        const avg = diffs.reduce((a, b) => a + b, 0) / diffs.length;
        if (avg > 2) return "Rising";
        if (avg < -2) return "Falling";
        return "Flat";
    };

    const handleAnalyze = () => {
        const chart = charts.find(c => c._id === selectedChartId);
        if (!chart) return;

        setSelectedChart(chart);

        if (!chart.chartData) {
            alert("This chart does not have calculated data. Please edit and save it again.");
            return;
        }

        // V11 Logic Analysis
        // Try to extract country if available, else undefined (utils will default to India)
        const birthDetails = {
            dateOfBirth: chart.dateOfBirth,
            country: chart.placeOfBirth?.country || "India" // Simple inference or default
        };

        const result = analyzeForeignTravel(chart.chartData, birthDetails);
        if (result && result.error) {
            alert("Analysis Failed: " + result.error);
            setAnalysis(null);
        } else {
            setAnalysis(result);
            setTrend(calculateTrend(result.confidence_timeline));
        }
    };

    return (
        <div className="foreign-travel-container">
            <button className="back-btn" onClick={onBack}>← Back</button>

            <h1>Foreign Travel & Settlement Analysis (V11.0)</h1>

            {/* Selection */}
            <div className="section card selector">
                <div>
                    <label style={{ marginRight: '10px' }}><strong>Select Chart:</strong></label>
                    <select
                        value={selectedChartId}
                        onChange={(e) => {
                            setSelectedChartId(e.target.value);
                            setAnalysis(null);
                        }}
                    >
                        <option value="">-- Choose --</option>
                        {charts.map(chart => (
                            <option key={chart._id} value={chart._id}>
                                {chart.name} ({chart.placeOfBirth?.city})
                            </option>
                        ))}
                    </select>
                </div>
                <button
                    className="analyze-btn"
                    onClick={handleAnalyze}
                    disabled={!selectedChartId}
                    style={{ padding: '8px 16px', borderRadius: '4px', color: 'white' }}
                >
                    Analyze
                </button>
            </div>

            {analysis && selectedChart && (
                <div className="analysis-content">
                    {/* Profile */}
                    <div className="section card">
                        <p><strong>Name:</strong> {selectedChart.name}</p>
                        <p><strong>DOB:</strong> {new Date(selectedChart.dateOfBirth).toLocaleDateString()}</p>
                        <p><strong>Place:</strong> {selectedChart.placeOfBirth?.city}</p>
                        <p><strong>Homeland:</strong> {analysis.homeland}</p>
                        <p><strong>Chart Style:</strong> South Indian (Default)</p>
                    </div>

                    {/* D1 & D9 Visuals */}
                    <div className="section">
                        <h2>D1 & D9 Charts</h2>
                        <div className="grid">
                            <div className="card">
                                <h3>D1 (Rasi Chart)</h3>
                                <div className="chart-wrapper">
                                    <BirthChart
                                        data={selectedChart.chartData}
                                        formData={selectedChart}
                                        hideControls={true}
                                        defaultDivision="d1"
                                    />
                                </div>
                            </div>
                            <div className="card">
                                <h3>D9 (Navamsa Chart)</h3>
                                <div className="chart-wrapper">
                                    <BirthChart
                                        data={selectedChart.chartData}
                                        formData={selectedChart}
                                        hideControls={true}
                                        defaultDivision="d9"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Planetary Table */}
                    <div className="section card">
                        <h2>Planetary Position Table</h2>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Planet</th>
                                    <th>Sign</th>
                                    <th>Degree</th>
                                    <th>House</th>
                                    <th>Nakshatra</th>
                                    <th>Retro</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analysis.planetary_table && analysis.planetary_table.map((row, idx) => (
                                    <tr key={idx}>
                                        <td>{row.planet}</td>
                                        <td>{row.sign}</td>
                                        <td>{row.degree}</td>
                                        <td>{row.house}</td>
                                        <td>{row.nakshatra}</td>
                                        <td>{row.isRetro}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Analysis Sections */}
                    <div className="section card">
                        <h2>WHY</h2>
                        <div dangerouslySetInnerHTML={{ __html: analysis.why_analysis }}></div>
                    </div>

                    <div className="section card">
                        <h2>WHEN</h2>
                        <div dangerouslySetInnerHTML={{ __html: analysis.when_analysis }}></div>
                    </div>

                    <div className="section card">
                        <h2>WHERE</h2>
                        <div dangerouslySetInnerHTML={{ __html: analysis.where_analysis }}></div>
                    </div>

                    {/* Settlement Status */}
                    <div className="section card">
                        <h2>Settlement Status</h2>
                        <div style={{ marginBottom: '10px' }}>
                            <span className="badge physical">Physical: {analysis.physical_settlement}</span>
                            <span className="badge emotional">Emotional Roots: {analysis.emotional_roots} ({analysis.homeland})</span>
                            <span className="badge trend">Trend: {trend}</span>
                        </div>
                        <div dangerouslySetInnerHTML={{ __html: analysis.settlement_explanation }}></div>
                    </div>

                    {/* Confidence Timeline (Age Buckets) */}
                    <div className="section card">
                        <h2>Confidence Timeline (Age Buckets)</h2>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <LineChart data={analysis.confidence_timeline}>
                                    <XAxis dataKey="age_range" stroke="#94a3b8" label={{ value: 'Age Buckets (Years)', position: 'insideBottom', offset: -5 }} />
                                    <YAxis stroke="#94a3b8" domain={[0, 100]} label={{ value: 'Confidence Score', angle: -90, position: 'insideLeft' }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', color: '#fff' }}
                                    />
                                    <Line type="monotone" dataKey="score" stroke="#60a5fa" strokeWidth={2} dot={{ r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Final Verdict */}
                    <div className="section card">
                        <h2>Final Verdict</h2>
                        <div dangerouslySetInnerHTML={{ __html: analysis.final_summary }}></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ForeignTravelNewPage;
