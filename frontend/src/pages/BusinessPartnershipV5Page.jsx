
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { executeBusinessPartnershipV5 } from '../utils/businessPartnershipV5Utils';
import './BusinessPartnershipInputPage.css'; // Reuse existing styles

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const BusinessPartnershipV5Page = ({ onBack }) => {
    // State for Persons
    const [savedCharts, setSavedCharts] = useState([]);

    // Multi-Select State
    const [partners, setPartners] = useState([]);
    const [isPartnerDropdownOpen, setIsPartnerDropdownOpen] = useState(false);
    const [partnerSearch, setPartnerSearch] = useState('');

    // State for Business Context
    const [industry, setIndustry] = useState('');
    const [partnershipType, setPartnershipType] = useState('Equal');

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

    // Filter logic
    const filteredCharts = savedCharts.filter(c =>
        c.name.toLowerCase().includes(partnerSearch.toLowerCase())
    );
    const isAllFilteredSelected = filteredCharts.length > 0 && filteredCharts.every(c => partners.some(p => p._id === c._id));

    // Handlers
    const togglePartnerSelection = (chartId) => {
        const chart = savedCharts.find(c => c._id === chartId);
        if (!chart) return;

        const isSelected = partners.some(p => p._id === chartId);
        if (isSelected) {
            setPartners(partners.filter(p => p._id !== chartId));
        } else {
            setPartners([...partners, { ...chart }]);
        }
    };

    const handleSelectAll = () => {
        if (isAllFilteredSelected) {
            // Deselect filtered
            const filteredIds = filteredCharts.map(c => c._id);
            setPartners(partners.filter(p => !filteredIds.includes(p._id)));
        } else {
            // Select filtered
            const newPartners = [...partners];
            filteredCharts.forEach(c => {
                if (!newPartners.some(p => p._id === c._id)) {
                    newPartners.push({ ...c });
                }
            });
            setPartners(newPartners);
        }
    };

    const handleClearSelection = () => {
        setPartners([]);
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
        if (!positions || !positions.Sun) throw new Error("Invalid chart data");

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
        if (partners.length < 2) {
            alert("Please select at least 2 partners to analyze.");
            return;
        }
        if (partners.length > 2) {
            alert("Note: V5 Analysis currently supports pairwise optimization. The first two selected partners will be analyzed.");
        }

        const personA = partners[0];
        const personB = partners[1];

        if (!personA.placeOfBirth?.lat || !personB.placeOfBirth?.lat) {
            alert("Selected partners must have valid city/coordinates.");
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const chartA = await calculateChart(personA);
            const chartB = await calculateChart(personB);

            const results = executeBusinessPartnershipV5(chartA, chartB);
            if (results.error) setError(results.error);
            else setResult(results);
        } catch (e) {
            console.error(e);
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bp-page-container">
            <div className="bp-header">
                <button className="back-btn" onClick={onBack}>← Back</button>
                <h1>Business Partnership - V5</h1>
            </div>

            <div className="bp-content">
                {!result ? (
                    <div className="bp-input-section">

                        {/* Partners Multi-Select */}
                        <div className="glass-card partners-card">
                            <h2>Partners</h2>
                            <div className="multi-select-wrapper">
                                <div
                                    className="multi-select-trigger"
                                    onClick={() => setIsPartnerDropdownOpen(!isPartnerDropdownOpen)}
                                >
                                    <span>{partners.length > 0 ? `${partners.length} Partner(s) Selected` : "Select Partners..."}</span>
                                    <span className="arrow">▼</span>
                                </div>

                                {isPartnerDropdownOpen && (
                                    <div className="multi-select-dropdown">
                                        {/* Search & Actions Header */}
                                        <div className="dropdown-actions-header" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="text"
                                                className="dropdown-search-input"
                                                placeholder="Search partners..."
                                                value={partnerSearch}
                                                onChange={(e) => setPartnerSearch(e.target.value)}
                                            />
                                        </div>
                                        <div className="dropdown-actions-sub" onClick={(e) => e.stopPropagation()}>
                                            <button className="action-link" onClick={handleSelectAll}>
                                                {isAllFilteredSelected ? "Deselect All Found" : "Select All Found"}
                                            </button>
                                            {partners.length > 0 && (
                                                <button className="action-link clear-link" onClick={handleClearSelection}>
                                                    Clear All
                                                </button>
                                            )}
                                        </div>

                                        {filteredCharts.map(chart => {
                                            const isSelected = partners.some(p => p._id === chart._id);
                                            return (
                                                <div
                                                    key={chart._id}
                                                    className={`multi-select-option ${isSelected ? 'selected' : ''}`}
                                                    onClick={() => togglePartnerSelection(chart._id)}
                                                >
                                                    <div className={`checkbox-custom ${isSelected ? 'checked' : ''}`}>
                                                        {isSelected && <span>✓</span>}
                                                    </div>
                                                    <div className="option-label">
                                                        <span className="name">{chart.name}</span>
                                                        <span className="sub-text">({chart.placeOfBirth?.city})</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {filteredCharts.length === 0 && <div className="no-options">No matches found</div>}
                                    </div>
                                )}
                            </div>

                            {/* Selected Partners Tags */}
                            <div className="selected-partners-tags">
                                {partners.map((p, idx) => (
                                    <div key={idx} className="partner-tag">
                                        {p.name}
                                        <button onClick={() => togglePartnerSelection(p._id)}>×</button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Business Context */}
                        <div className="glass-card">
                            <h3>Business Context</h3>
                            <div style={{ marginBottom: '10px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', color: '#cbd5e1' }}>Industry</label>
                                <input
                                    type="text"
                                    className="dropdown-search-input"
                                    value={industry}
                                    onChange={e => setIndustry(e.target.value)}
                                    placeholder="e.g. Tech, Real Estate"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', color: '#cbd5e1' }}>Partnership Type</label>
                                <select
                                    className="chart-select"
                                    value={partnershipType}
                                    onChange={e => setPartnershipType(e.target.value)}
                                >
                                    <option>Equal</option>
                                    <option>Investor–Operator</option>
                                    <option>Advisory</option>
                                </select>
                            </div>
                        </div>

                        <div className="action-row">
                            <button className="analyze-btn" onClick={handleAnalyze} disabled={loading}>
                                {loading ? "Computing V5 Logic..." : "Analyze Partnership"}
                            </button>
                        </div>
                        {error && <div className="error-msg">{error}</div>}
                    </div>
                ) : (
                    <div className="bp-results-section animate-fade-in">
                        {/* Output Header */}
                        <div className="result-header">
                            <h2>Final Verdict: <span className={`verdict ${result.verdict === 'GO' ? 'strategic' : result.verdict === 'NO_GO' ? 'no-go' : 'conditional'}`}>{result.verdict}</span></h2>
                            <button className="reset-btn" onClick={() => setResult(null)}>New Analysis</button>
                        </div>

                        {/* Scores List */}
                        <div className="glass-card">
                            <h3>Scores</h3>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                <li style={{ marginBottom: '8px' }}><strong>Promise:</strong> {result.scores.promise}/10</li>
                                <li style={{ marginBottom: '8px' }}><strong>Activation:</strong> {result.scores.activation}/10</li>
                                <li style={{ marginBottom: '8px' }}><strong>Stability:</strong> {result.scores.stability}/10</li>
                                <li style={{ marginBottom: '8px', fontSize: '1.1em' }}><strong>Compatibility:</strong> {result.scores.compatibility}%</li>
                            </ul>
                        </div>

                        {/* Explainability */}
                        <div className="glass-card">
                            <h3>WHY (Explainability)</h3>
                            {result.explain.length > 0 ? (
                                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                                    <thead>
                                        <tr style={{ textAlign: 'left', borderBottom: '1px solid #475569' }}>
                                            <th style={{ padding: '8px' }}>Factor</th>
                                            <th style={{ padding: '8px' }}>Cause</th>
                                            <th style={{ padding: '8px' }}>Condition</th>
                                            <th style={{ padding: '8px' }}>Points</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {result.explain.map((item, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td style={{ padding: '8px' }}>{item.Factor}</td>
                                                <td style={{ padding: '8px' }}>{item.Cause}</td>
                                                <td style={{ padding: '8px' }}>{item.Condition}</td>
                                                <td style={{ padding: '8px', color: item.Points > 0 ? '#4ade80' : '#f87171' }}>{item.Points > 0 ? '+' : ''}{item.Points}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : <p>No specific synergy/friction factors found.</p>}
                        </div>

                        {/* Time Series */}
                        <div className="glass-card">
                            <h3>WHEN (Time)</h3>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {result.timeline.map((t, i) => (
                                    <li key={i} style={{ marginBottom: '8px' }}>
                                        {t.label}: <strong>{t.score}%</strong>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Roles */}
                        <div className="glass-card">
                            <h3>WHERE / ROLE</h3>
                            {result.roles.map((r, i) => (
                                <div key={i} style={{ marginBottom: '5px' }}>
                                    <strong>{r.name}</strong>: {r.role.toUpperCase()} (Score: {r.score})
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BusinessPartnershipV5Page;
