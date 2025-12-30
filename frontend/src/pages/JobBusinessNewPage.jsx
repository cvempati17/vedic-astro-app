import React, { useState, useEffect } from 'react';
import { analyzeJobVsBusiness } from '../utils/jobBusinessUtils';
import BirthChart from '../components/BirthChart';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './JobBusinessNewPage.css';

const JobBusinessNewPage = ({ onBack }) => {
    const [charts, setCharts] = useState([]);
    const [selectedChartId, setSelectedChartId] = useState('');
    const [analysis, setAnalysis] = useState(null);
    const [selectedChart, setSelectedChart] = useState(null);

    useEffect(() => {
        const saved = localStorage.getItem('savedCharts');
        if (saved) {
            let parsed = JSON.parse(saved);
            setCharts(parsed);
        }
    }, []);

    const handleAnalyze = () => {
        const chart = charts.find(c => c._id === selectedChartId);
        if (!chart) return;

        setSelectedChart(chart);

        if (!chart.chartData) {
            alert("This chart does not have calculated data. Please edit and save it again.");
            return;
        }

        const birthDetails = {
            name: chart.name,
            dateOfBirth: chart.dateOfBirth,
            placeOfBirth: chart.placeOfBirth
        };

        const result = analyzeJobVsBusiness(chart.chartData, birthDetails);
        if (result && result.error) {
            alert("Analysis Failed: " + result.error);
            setAnalysis(null);
        } else {
            setAnalysis(result);
        }
    };

    return (
        <div className="job-business-container">
            <button className="back-btn" onClick={onBack}>← Back</button>

            <h1>Job vs Business Analysis (V1.0)</h1>

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
                    <div className="card">
                        <p><strong>Name:</strong> {selectedChart.name}</p>
                        <p><strong>DOB:</strong> {new Date(selectedChart.dateOfBirth).toLocaleDateString()}</p>
                        <p><strong>Place:</strong> {selectedChart.placeOfBirth?.city}</p>
                    </div>

                    {/* D1 & D9 Visuals */}
                    <div className="grid">
                        <div className="card">
                            <h2>D1 Chart</h2>
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
                            <h2>D9 Chart</h2>
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

                    {/* WHY */}
                    <div className="card">
                        <h2>WHY</h2>
                        <div dangerouslySetInnerHTML={{ __html: analysis.why_analysis }}></div>
                    </div>

                    {/* WHEN */}
                    <div className="card">
                        <h2>WHEN</h2>
                        <div dangerouslySetInnerHTML={{ __html: analysis.when_analysis }}></div>
                    </div>

                    {/* HOW */}
                    <div className="card">
                        <h2>HOW</h2>
                        <div dangerouslySetInnerHTML={{ __html: analysis.how_analysis }}></div>
                    </div>

                    {/* Career Pattern */}
                    <div className="card">
                        <h2>Career Pattern</h2>
                        <span className={`badge ${analysis.career_type_class}`}>{analysis.career_pattern}</span>
                    </div>

                    {/* Confidence Timeline */}
                    <div className="card">
                        <h2>Confidence Timeline</h2>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <LineChart data={analysis.confidence_timeline}>
                                    <XAxis dataKey="age_range" stroke="#94a3b8" label={{ value: 'Age Buckets', position: 'insideBottom', offset: -5 }} />
                                    <YAxis stroke="#94a3b8" domain={[0, 100]} label={{ value: 'Business Potential', angle: -90, position: 'insideLeft' }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', color: '#fff' }}
                                    />
                                    <Line type="monotone" dataKey="score" stroke="#60a5fa" strokeWidth={2} dot={{ r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                            <p style={{ fontSize: '0.8em', color: '#94a3b8', marginTop: '10px', textAlign: 'center' }}>
                                Higher Score = Stronger Business Potential | Lower Score = Stronger Job Stability
                            </p>
                        </div>
                    </div>

                    {/* Final Recommendation */}
                    <div className="card">
                        <h2>Final Recommendation</h2>
                        <div>{analysis.final_recommendation}</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobBusinessNewPage;
