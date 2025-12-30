
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import CitySearch from '../components/CitySearch';
import { executeAstrogravityEngine } from '../utils/astrogravityEngine';
import './BusinessPartnershipInputPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const BusinessPartnershipInputPage = ({ onBack }) => {
    const { t } = useTranslation();

    // Charts State
    const [savedCharts, setSavedCharts] = useState([]);

    // Input State
    const [basePerson, setBasePerson] = useState({
        name: '', gender: 'male', date: '', time: '',
        city: '', latitude: null, longitude: null, timezone: 5.5, _id: null
    });

    const [partners, setPartners] = useState([]);

    // UI State for Multi-Select
    const [isPartnerDropdownOpen, setIsPartnerDropdownOpen] = useState(false);
    const [partnerSearch, setPartnerSearch] = useState('');

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    // Fetch Saved Charts on Mount
    useEffect(() => {
        const fetchCharts = async () => {
            const token = localStorage.getItem('token');
            const localCharts = JSON.parse(localStorage.getItem('savedCharts') || '[]');
            let cloudCharts = [];

            if (token) {
                try {
                    const response = await axios.get(`${API_URL}/api/charts`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    cloudCharts = response.data;
                } catch (err) {
                    console.error('Error fetching cloud charts:', err);
                }
            }
            setSavedCharts([...cloudCharts, ...localCharts]);
        };
        fetchCharts();
    }, []);

    // Handlers
    const handleBaseSelect = (e) => {
        const chartId = e.target.value;
        if (!chartId) return;

        const chart = savedCharts.find(c => c._id === chartId);
        if (chart) {
            setBasePerson({
                name: chart.name,
                gender: chart.gender || 'male',
                date: chart.dateOfBirth ? new Date(chart.dateOfBirth).toISOString().split('T')[0] : '',
                time: chart.timeOfBirth,
                city: chart.placeOfBirth?.city || '',
                latitude: chart.placeOfBirth?.lat,
                longitude: chart.placeOfBirth?.lng,
                timezone: chart.placeOfBirth?.timezone || 5.5,
                _id: chart._id
            });
        }
    };

    const togglePartnerSelection = (chartId) => {
        const chart = savedCharts.find(c => c._id === chartId);
        if (!chart) return;

        const isSelected = partners.some(p => p._id === chartId);
        if (isSelected) {
            setPartners(partners.filter(p => p._id !== chartId));
        } else {
            setPartners([...partners, {
                name: chart.name,
                gender: chart.gender || 'male',
                date: chart.dateOfBirth ? new Date(chart.dateOfBirth).toISOString().split('T')[0] : '',
                time: chart.timeOfBirth,
                city: chart.placeOfBirth?.city || '',
                latitude: chart.placeOfBirth?.lat,
                longitude: chart.placeOfBirth?.lng,
                timezone: chart.placeOfBirth?.timezone || 5.5,
                _id: chart._id
            }]);
        }
    };

    const handleSelectAll = () => {
        const filteredCharts = savedCharts.filter(c =>
            c._id !== basePerson._id &&
            c.name.toLowerCase().includes(partnerSearch.toLowerCase())
        );

        // If all filtered are selected, then deselect them. Otherwise, select all filtered.
        const allFilteredSelected = filteredCharts.length > 0 && filteredCharts.every(c => partners.some(p => p._id === c._id));

        if (allFilteredSelected) {
            // Deselect filtered
            const filteredIds = filteredCharts.map(c => c._id);
            setPartners(partners.filter(p => !filteredIds.includes(p._id)));
        } else {
            // Select filtered (merge with existing)
            const newPartners = [...partners];
            filteredCharts.forEach(c => {
                if (!newPartners.some(p => p._id === c._id)) {
                    newPartners.push({
                        name: c.name,
                        gender: c.gender || 'male',
                        date: c.dateOfBirth ? new Date(c.dateOfBirth).toISOString().split('T')[0] : '',
                        time: c.timeOfBirth,
                        city: c.placeOfBirth?.city || '',
                        latitude: c.placeOfBirth?.lat,
                        longitude: c.placeOfBirth?.lng,
                        timezone: c.placeOfBirth?.timezone || 5.5,
                        _id: c._id
                    });
                }
            });
            setPartners(newPartners);
        }
    };

    const handleClearSelection = () => {
        setPartners([]);
    };

    // Recalculate Logic
    const calculateChart = async (person) => {
        if (!person.date || !person.time) {
            throw new Error(`Birth date/time missing for ${person.name}.`);
        }

        const payload = {
            name: person.name,
            date: person.date,
            time: person.time,
            latitude: parseFloat(person.latitude),
            longitude: parseFloat(person.longitude),
            timezone: parseFloat(person.timezone || 5.5),
            city: person.city || 'Unknown',
            ayanamsa: 'lahiri'
        };

        const response = await fetch(`${API_URL}/api/calculate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (!data.success) throw new Error(data.error || "Calculation failed");

        // API returns data.data as a map of { Sun: { longitude: 10, ... }, ... }
        // It does NOT have a 'planets' key.
        const positions = data.data;

        if (!positions || !positions.Sun) {
            console.error("Invalid API Response for", person.name, data);
            throw new Error(`Received invalid chart data for ${person.name}. Please check birth details.`);
        }

        const planets = {};
        try {
            Object.keys(positions).forEach(key => {
                // key is 'Sun', 'Moon', 'Ascendant', etc.
                const pData = positions[key];
                // Check if it's a planet object with longitude
                if (key !== 'Ascendant' && pData && typeof pData.longitude === 'number') {
                    planets[key.toLowerCase()] = pData.longitude;
                }
            });
        } catch (e) {
            console.error("Error parsing planets for", person.name, e);
            throw new Error(`Error processing chart data for ${person.name}`);
        }

        let ascendant = 0;
        if (positions.Ascendant && typeof positions.Ascendant.longitude === 'number') {
            ascendant = positions.Ascendant.longitude;
        }

        return {
            name: person.name,
            planets,
            ascendant
        };
    };

    const handleAnalyze = async () => {
        if (!basePerson.name || !basePerson.date || !basePerson.time || !basePerson.latitude) {
            alert("Please select a valid Base Person.");
            return;
        }
        if (partners.length === 0) {
            alert("Please select at least one partner.");
            return;
        }

        // Validate Partners
        const invalidPartners = partners.filter(p => !p.latitude || !p.longitude);
        if (invalidPartners.length > 0) {
            const names = invalidPartners.map(p => p.name).join(", ");
            alert(`The following partners are missing location coordinates: ${names}. Please update their charts with a valid City.`);
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const people = [basePerson, ...partners];
            const calculatedData = await Promise.all(people.map(p => calculateChart(p)));
            const engineResult = executeAstrogravityEngine(calculatedData);

            if (engineResult.error) {
                setError(engineResult.error);
            } else {
                setResult(engineResult);
            }
        } catch (err) {
            console.error(err);
            setError(err.message || "An error occurred during analysis.");
        } finally {
            setLoading(false);
        }
    };

    // Filter logic for render
    const filteredCharts = savedCharts.filter(c =>
        c._id !== basePerson._id &&
        c.name.toLowerCase().includes(partnerSearch.toLowerCase())
    );
    const isAllFilteredSelected = filteredCharts.length > 0 && filteredCharts.every(c => partners.some(p => p._id === c._id));

    return (
        <div className="bp-page-container">
            <div className="bp-header">
                <button className="back-btn" onClick={onBack}>← Back</button>
                <h1>Business Partnership Analysis (Astrogravity)</h1>
            </div>

            <div className="bp-content">
                {!result && (
                    <div className="bp-input-section">
                        {/* BASE PERSON SELECTION */}
                        <div className="glass-card base-person-card">
                            <h2>Base Person</h2>
                            <div className="select-container">
                                <select
                                    className="chart-select"
                                    onChange={handleBaseSelect}
                                    value={basePerson._id || ''}
                                >
                                    <option value="">-- Select Base Person from Saved Charts --</option>
                                    {savedCharts.map(chart => (
                                        <option key={chart._id} value={chart._id}>
                                            {chart.name} ({chart.placeOfBirth?.city})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {basePerson.name && (
                                <div className="selected-details animate-fade-in">
                                    <div className="detail-row">
                                        <span><strong>Name:</strong> {basePerson.name}</span>
                                        <span><strong>DOB:</strong> {basePerson.date}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span><strong>Time:</strong> {basePerson.time}</span>
                                        <span><strong>Place:</strong> {basePerson.city}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* PARTNER SELECTION (MULTI-SELECT DROPDOWN) */}
                        <div className="glass-card">
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

                        <div className="action-row">
                            <button className="analyze-btn" onClick={handleAnalyze} disabled={loading}>
                                {loading ? "Computing..." : "Run Compatibility Engine"}
                            </button>
                        </div>

                        {error && <div className="error-msg">{error}</div>}
                    </div>
                )}

                {/* OUTPUT SECTION */}
                {result && (
                    <div className="bp-results-section animate-fade-in">
                        <div className="result-header">
                            <h2>Partnership Verdict: <span className={`verdict ${result.verdict.split(' ')[0].toLowerCase()}`}>{result.verdict}</span></h2>
                            <button className="reset-btn" onClick={() => setResult(null)}>New Analysis</button>
                        </div>

                        <div className="score-summary">
                            <div className="score-card">
                                <div className="score-value">{result.overall_compatibility}%</div>
                                <div className="score-label">Compatibility</div>
                            </div>
                            <div className="score-card">
                                <div className="score-value">{result.composite_stability}/10</div>
                                <div className="score-label">Composite Stability</div>
                            </div>
                        </div>

                        <div className="glass-card projections-card">
                            <h3>Projected Compatibility (24 Months)</h3>
                            <div className="projections-graph">
                                {result.timeline.map((t) => (
                                    <div key={t.month} className="projection-bar-container">
                                        <div className="projection-bar" style={{ height: `${t.score}%` }}></div>
                                        <span className="month-label">M{t.month}</span>
                                        <span className="val-label">{t.score}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="glass-card roles-card">
                            <h3>Recommended Roles</h3>
                            <ul>
                                {result.roles.map((r, i) => (
                                    <li key={i}>
                                        <strong>{r.name}</strong> → <span className="role-tag">{r.role}</span> (Score: {r.axis_score.toFixed(1)})
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="glass-card confidence-card">
                            <h3>Confidence Band</h3>
                            <p>High confidence (Deterministic Model v3.1). No historical data adjustment applied.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BusinessPartnershipInputPage;
