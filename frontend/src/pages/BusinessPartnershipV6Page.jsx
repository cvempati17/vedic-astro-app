
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { executeBusinessPartnershipV6 } from '../utils/businessPartnershipV6Utils';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import './BusinessPartnershipInputPage.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const BusinessPartnershipV6Page = ({ onBack }) => {
    // State
    const [savedCharts, setSavedCharts] = useState([]);

    // Base Person State
    const [basePersonId, setBasePersonId] = useState('');

    // Partners State
    const [partners, setPartners] = useState([]);
    const [isPartnerDropdownOpen, setIsPartnerDropdownOpen] = useState(false);
    const [partnerSearch, setPartnerSearch] = useState('');

    // Business Context
    const [industry, setIndustry] = useState('');

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

    // Filter Logic
    const filteredCharts = savedCharts.filter(c =>
        c.name.toLowerCase().includes(partnerSearch.toLowerCase()) &&
        c._id !== basePersonId // Exclude base person from partners list
    );

    const togglePartnerSelection = (chartId) => {
        const chart = savedCharts.find(c => c._id === chartId);
        if (!chart) return;
        if (partners.some(p => p._id === chartId)) {
            setPartners(partners.filter(p => p._id !== chartId));
        } else {
            setPartners([...partners, chart]);
        }
    };

    const calculateChart = async (person) => {
        const payload = {
            name: person.name,
            date: person.dateOfBirth ? new Date(person.dateOfBirth).toISOString().split('T')[0] : '',
            time: person.timeOfBirth,
            latitude: person.placeOfBirth?.lat,
            longitude: person.placeOfBirth?.lng,
            timezone: person.placeOfBirth?.timezone || 5.5,
            city: person.placeOfBirth?.city || 'Unknown'
        };

        const res = await fetch(`${API_URL}/api/calculate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || "Calculation failed");

        const positions = data.data;
        const planets = {};
        Object.keys(positions).forEach(k => {
            if (positions[k] && typeof positions[k].longitude === 'number' && k !== 'Ascendant') {
                planets[k.toLowerCase()] = positions[k].longitude;
            }
        });
        const ascendant = positions.Ascendant?.longitude || 0;
        return { name: person.name, planets, ascendant };
    };

    const handleAnalyze = async () => {
        if (!basePersonId) { alert("Select Base Person"); return; }
        if (partners.length < 1) { alert("Select at least 1 partner"); return; }

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const basePersonMeta = savedCharts.find(c => c._id === basePersonId);
            const baseChart = await calculateChart(basePersonMeta);

            const partnerCharts = await Promise.all(partners.map(p => calculateChart(p)));

            const res = executeBusinessPartnershipV6([baseChart], partnerCharts);
            setResult(res);

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
                <h1>Business Partnership - V6.1 (Latest)</h1>
            </div>

            <div className="bp-content">
                {!result ? (
                    <div className="bp-input-section">
                        {/* Base Person Selection */}
                        <div className="glass-card">
                            <h2>Base Person (Reference)</h2>
                            <select className="chart-select" value={basePersonId} onChange={e => { setBasePersonId(e.target.value); setPartners([]); }}>
                                <option value="">-- Select Base Person --</option>
                                {savedCharts.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>
                        </div>

                        {/* Partners Multi-Select */}
                        <div className="glass-card partners-card">
                            <h2>Partners</h2>
                            <div className="multi-select-wrapper">
                                <div className="multi-select-trigger" onClick={() => setIsPartnerDropdownOpen(!isPartnerDropdownOpen)}>
                                    <span>{partners.length > 0 ? `${partners.length} Partner(s) Selected` : "Select Partners..."}</span>
                                    <span className="arrow">▼</span>
                                </div>
                                {isPartnerDropdownOpen && (
                                    <div className="multi-select-dropdown">
                                        <div className="dropdown-actions-header">
                                            <input type="text" className="dropdown-search-input" placeholder="Search..." value={partnerSearch} onChange={e => setPartnerSearch(e.target.value)} onClick={e => e.stopPropagation()} />
                                        </div>
                                        {filteredCharts.map(c => (
                                            <div key={c._id} className={`multi-select-option ${partners.some(p => p._id === c._id) ? 'selected' : ''}`} onClick={() => togglePartnerSelection(c._id)}>
                                                <div className={`checkbox-custom ${partners.some(p => p._id === c._id) ? 'checked' : ''}`}>{partners.some(p => p._id === c._id) && '✓'}</div>
                                                <div className="option-label">
                                                    <span className="name">{c.name}</span>
                                                    <span className="sub-text">({c.placeOfBirth?.city})</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="selected-partners-tags">
                                {partners.map(p => (
                                    <div key={p._id} className="partner-tag">{p.name} <button onClick={() => togglePartnerSelection(p._id)}>×</button></div>
                                ))}
                            </div>
                        </div>

                        {/* Business Context */}
                        <div className="glass-card">
                            <h3>Business Context</h3>
                            <label style={{ display: 'block', marginBottom: '5px', color: '#cbd5e1' }}>Industry</label>
                            <input type="text" className="dropdown-search-input" value={industry} onChange={e => setIndustry(e.target.value)} placeholder="e.g. Tech, Real Estate" />
                        </div>

                        <button className="analyze-btn" onClick={handleAnalyze} disabled={loading}>{loading ? "Analyzing V6..." : "Analyze Partnership"}</button>
                        {error && <div className="error-msg">{error}</div>}
                    </div>
                ) : (
                    <div className="bp-results-section animate-fade-in" style={{ color: '#fff' }}>
                        <div className="result-header">
                            <h2>Final Verdict: <span className={`verdict ${result.verdict === 'GO' ? 'strategic' : result.verdict === 'NO_GO' ? 'no-go' : 'conditional'}`}>{result.verdict} (Score: {result.finalScore}/100)</span></h2>
                            <button className="reset-btn" onClick={() => setResult(null)}>New Analysis</button>
                        </div>

                        {/* WHY Table */}
                        <div className="glass-card">
                            <h3>WHY Analysis</h3>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                    <thead>
                                        <tr style={{ textAlign: 'left', background: 'rgba(255,255,255,0.1)' }}>
                                            <th style={{ padding: '8px' }}>Person</th>
                                            <th style={{ padding: '8px' }}>Dimension</th>
                                            <th style={{ padding: '8px' }}>Factor</th>
                                            <th style={{ padding: '8px' }}>Cause/Condition</th>
                                            <th style={{ padding: '8px' }}>Points</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {result.whyTable.map((row, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td style={{ padding: '8px' }}>{row.Person}</td>
                                                <td style={{ padding: '8px' }}>{row.Dimension}</td>
                                                <td style={{ padding: '8px' }}>{row.Factor}</td>
                                                <td style={{ padding: '8px' }}>{row.Condition}</td>
                                                <td style={{ padding: '8px', color: row.Points.toString().includes('-') ? '#f87171' : '#4ade80' }}>{row.Points}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Roles */}
                        <div className="glass-card">
                            <h3>Role Allocation</h3>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', background: 'rgba(255,255,255,0.1)' }}>
                                        <th style={{ padding: '8px' }}>Person</th>
                                        <th style={{ padding: '8px' }}>Role</th>
                                        <th style={{ padding: '8px' }}>Role Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.rolesTable.map((row, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '8px' }}>{row.Person}</td>
                                            <td style={{ padding: '8px' }}>{row.Role}</td>
                                            <td style={{ padding: '8px' }}>{row.Role_Score}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Projection */}
                        <div className="glass-card">
                            <h3>30-Year Projection</h3>
                            <div style={{ height: '300px' }}>
                                <Line
                                    data={{
                                        labels: result.projection.labels,
                                        datasets: [{
                                            label: 'Composite Stability Score',
                                            data: result.projection.data,
                                            borderColor: '#4ade80',
                                            backgroundColor: 'rgba(74, 222, 128, 0.1)',
                                            fill: true
                                        }]
                                    }}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        scales: {
                                            y: { beginAtZero: true, max: 10, grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#cbd5e1' } },
                                            x: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#cbd5e1' } }
                                        },
                                        plugins: { legend: { labels: { color: 'white' } } }
                                    }}
                                />
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};

export default BusinessPartnershipV6Page;
