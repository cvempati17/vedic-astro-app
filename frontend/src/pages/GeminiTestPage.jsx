
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { executeGeminiEngine } from '../utils/geminiEngine';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import './BusinessPartnershipInputPage.css'; // Reusing styles

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const GeminiTestPage = ({ onBack }) => {
    // State
    const [savedCharts, setSavedCharts] = useState([]);
    const [selectedId, setSelectedId] = useState('');
    const [domain, setDomain] = useState('career');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCharts = async () => {
            const token = localStorage.getItem('token');
            const localCharts = JSON.parse(localStorage.getItem('savedCharts') || '[]');
            let cloudCharts = [];
            if (token) {
                try {
                    const response = await axios.get(`${API_URL}/api/charts`, { headers: { Authorization: `Bearer ${token}` } });
                    cloudCharts = response.data;
                } catch (e) { console.error(e); }
            }
            setSavedCharts([...cloudCharts, ...localCharts]);
        };
        fetchCharts();
    }, []);

    const handleAnalyze = async (e) => {
        e.preventDefault();
        if (!selectedId) { alert("Select a chart"); return; }

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const chartMeta = savedCharts.find(c => c._id === selectedId);

            // 1. Calculate Chart logic (or retrieve if stored, but we recalc to ensure data correctness)
            const payload = {
                name: chartMeta.name,
                date: chartMeta.dateOfBirth ? new Date(chartMeta.dateOfBirth).toISOString().split('T')[0] : '',
                time: chartMeta.timeOfBirth,
                latitude: chartMeta.placeOfBirth?.lat,
                longitude: chartMeta.placeOfBirth?.lng,
                timezone: chartMeta.placeOfBirth?.timezone || 5.5,
                city: chartMeta.placeOfBirth?.city || 'Unknown'
            };

            const res = await fetch(`${API_URL}/api/calculate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);

            // Parse Data
            const positions = data.data;
            const planets = {};
            Object.keys(positions).forEach(k => {
                if (positions[k] && typeof positions[k].longitude === 'number' && k !== 'Ascendant') {
                    planets[k.toLowerCase()] = positions[k].longitude;
                }
            });
            const ascendant = positions.Ascendant?.longitude || 0;
            const chartData = { planets, ascendant };

            // 2. Execute Gemini Engine
            const geminiOutput = executeGeminiEngine(domain, chartData);
            if (geminiOutput.error) throw new Error(geminiOutput.error);

            geminiOutput.user_details = {
                name: chartMeta.name,
                dob: payload.date,
                tob: payload.time,
                pob: payload.city
            };

            setResult(geminiOutput);

        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bp-page-container">
            <div className="bp-header">
                <button className="back-btn" onClick={onBack}>← Back</button>
                <h1>Test 1Engines (Gemini Vibe)</h1>
            </div>

            <div className="bp-content">
                {!result ? (
                    <form onSubmit={handleAnalyze} className="bp-input-section">
                        <div className="glass-card">
                            <h2>Engine Input</h2>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Select Saved Chart</label>
                            <select className="chart-select" value={selectedId} onChange={e => setSelectedId(e.target.value)} required>
                                <option value="">-- Choose Person --</option>
                                {savedCharts.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>

                            <label style={{ display: 'block', marginBottom: '5px', marginTop: '15px' }}>Report Focus (The "Why" Analysis)</label>
                            <select className="chart-select" value={domain} onChange={e => setDomain(e.target.value)}>
                                <option value="career">Career & Profession</option>
                                <option value="finance">Finance & Wealth</option>
                                <option value="health">Health & Well-being</option>
                                <option value="education">Education & Studies</option>
                                <option value="business_partnership">Business Partnership</option>
                                <option value="foreign_travel">Foreign Travel & Immigration</option>
                                <option value="marriage">Marriage & Relationships</option>
                            </select>
                        </div>

                        <button type="submit" className="analyze-btn" disabled={loading}>
                            {loading ? "Crunching Logic..." : "Generate Detailed Analysis"}
                        </button>
                        {error && <div className="error-msg">{error}</div>}
                    </form>
                ) : (
                    <div className="bp-results-section animate-fade-in" style={{ color: '#333' }}>
                        {/* Header */}
                        <div style={{ background: '#2c3e50', color: 'white', padding: '20px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div>
                                <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Astrological Analysis</h1>
                                <small>User: {result.user_details.name}</small>
                            </div>
                            <div style={{ background: '#e74c3c', padding: '5px 15px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase' }}>{domain} FOCUS</div>
                        </div>

                        {/* Opinion Card */}
                        <div style={{ background: 'white', padding: '25px', borderRadius: '10px', marginBottom: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '15px', color: '#2c3e50', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Opinion & Decision</div>
                            <div style={{ textAlign: 'center', padding: '20px', background: '#f9f9f9', borderLeft: `5px solid ${result.summary_prediction.status === 'Excellent' ? '#27ae60' : result.summary_prediction.status === 'Good' ? '#f1c40f' : '#e74c3c'}` }}>
                                <p style={{ fontSize: '1.3rem', fontWeight: '600', margin: 0 }}>{result.summary_prediction.primary_text}</p>
                                <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '10px' }}>(Status: {result.summary_prediction.status})</p>
                            </div>
                        </div>

                        {/* Chart Card */}
                        <div style={{ background: 'white', padding: '25px', borderRadius: '10px', marginBottom: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '15px', color: '#2c3e50', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Ranking / Intensity Over Time</div>
                            <div style={{ height: '300px' }}>
                                <Line
                                    data={result.intensity_chart_data}
                                    options={{ responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 100 } } }}
                                />
                            </div>
                        </div>

                        {/* Why Table */}
                        <div style={{ background: 'white', padding: '25px', borderRadius: '10px', marginBottom: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '15px', color: '#2c3e50', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Why? (Astrological Reasoning)</div>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#f8f9fa', color: '#2c3e50', textAlign: 'left' }}>
                                        <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Planet/Logic</th>
                                        <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Effect</th>
                                        <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Reasoning</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.astrological_reasoning.map((reason, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #ddd' }}>
                                            <td style={{ padding: '12px' }}>{reason.logic}</td>
                                            <td style={{ padding: '12px' }}>
                                                <span style={{
                                                    padding: '3px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold',
                                                    background: reason.effect === 'Positive' ? '#e8f5e9' : '#ffebee',
                                                    color: reason.effect === 'Positive' ? '#2e7d32' : '#c62828'
                                                }}>
                                                    {reason.effect}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px' }}>{reason.description}</td>
                                        </tr>
                                    ))}
                                    {result.astrological_reasoning.length === 0 && (
                                        <tr><td colSpan="3" style={{ padding: '12px', textAlign: 'center', color: '#999' }}>No specific strong logic rules triggered (Neutral).</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Specifics */}
                        <div style={{ background: 'white', padding: '25px', borderRadius: '10px', marginBottom: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '15px', color: '#2c3e50', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Specifics</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                                <div style={{ background: '#fafafa', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
                                    <span style={{ fontSize: '0.9rem', color: '#777', display: 'block', marginBottom: '5px' }}>Direction</span>
                                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{result.specifics.direction}</span>
                                </div>
                                {domain === 'health' && (
                                    <div style={{ background: '#fafafa', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
                                        <span style={{ fontSize: '0.9rem', color: '#777', display: 'block', marginBottom: '5px' }}>Vulnerable Area</span>
                                        <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{result.specifics.body_part}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button className="reset-btn" onClick={() => setResult(null)}>Analyze Another</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GeminiTestPage;
