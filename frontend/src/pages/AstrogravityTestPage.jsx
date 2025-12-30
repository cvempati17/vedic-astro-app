
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UNIVERSAL_RULES } from '../utils/universalRules';
import { executeUniversalEngine } from '../utils/universalEngine';
import './BusinessPartnershipInputPage.css'; // Reuse existing styles for now

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AstrogravityTestPage = ({ onBack }) => {
    // Input State
    const [domain, setDomain] = useState("Business Partnership");
    const [savedCharts, setSavedCharts] = useState([]);

    // Person 1 (Manual or Select)
    const [p1Type, setP1Type] = useState('select'); // or 'manual'
    const [p1Id, setP1Id] = useState('');
    const [p1Data, setP1Data] = useState({ name: '', date: '', time: '', city: '', latitude: '', longitude: '', timezone: 5.5 });

    // Person 2
    const [p2Type, setP2Type] = useState('select');
    const [p2Id, setP2Id] = useState('');
    const [p2Data, setP2Data] = useState({ name: '', date: '', time: '', city: '', latitude: '', longitude: '', timezone: 5.5 });

    const [domainInputs, setDomainInputs] = useState({ currentStatus: '', goal: '', risk: '' });

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

    const handleP1Select = (e) => {
        const id = e.target.value;
        setP1Id(id);
        const c = savedCharts.find(x => x._id === id);
        if (c) setP1Data({
            name: c.name,
            date: c.dateOfBirth ? new Date(c.dateOfBirth).toISOString().split('T')[0] : '',
            time: c.timeOfBirth,
            city: c.placeOfBirth?.city,
            latitude: c.placeOfBirth?.lat,
            longitude: c.placeOfBirth?.lng,
            timezone: c.placeOfBirth?.timezone || 5.5
        });
    };

    const handleP2Select = (e) => {
        const id = e.target.value;
        setP2Id(id);
        const c = savedCharts.find(x => x._id === id);
        if (c) setP2Data({
            name: c.name,
            date: c.dateOfBirth ? new Date(c.dateOfBirth).toISOString().split('T')[0] : '',
            time: c.timeOfBirth,
            city: c.placeOfBirth?.city,
            latitude: c.placeOfBirth?.lat,
            longitude: c.placeOfBirth?.lng,
            timezone: c.placeOfBirth?.timezone || 5.5
        });
    };

    const calculateChart = async (person) => {
        const payload = {
            name: person.name || 'User',
            date: person.date,
            time: person.time,
            latitude: parseFloat(person.latitude),
            longitude: parseFloat(person.longitude),
            timezone: parseFloat(person.timezone),
            city: person.city || 'Unknown'
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResult(null);

        try {
            if (!p1Data.latitude) throw new Error("Person 1 Location Required");

            const chart1 = await calculateChart(p1Data);
            let chart2 = null;
            if (p2Data.date && p2Data.latitude) {
                chart2 = await calculateChart(p2Data);
            }

            const res = executeUniversalEngine(domain, chart1, chart2);
            if (res.error) throw new Error(res.error);
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
                <h1>Astrogravity Intelligence System</h1>
            </div>

            <div className="bp-content">
                {!result ? (
                    <form onSubmit={handleSubmit} className="bp-input-section">
                        <div className="glass-card">
                            <h2>Configuration</h2>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Select Domain</label>
                            <select className="chart-select" value={domain} onChange={e => setDomain(e.target.value)}>
                                {UNIVERSAL_RULES.engine.metadata.domains.map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>

                        <div className="glass-card">
                            <h2>Person 1 (Subject)</h2>
                            <div className="select-container">
                                <select className="chart-select" value={p1Id} onChange={handleP1Select}>
                                    <option value="">-- Select Saved Chart --</option>
                                    {savedCharts.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                            </div>
                            {/* Manual Entry Fallback could go here but skipping for brevity as saved charts is primary */}
                            {p1Data.name && <div style={{ marginTop: '10px', color: '#ccc' }}>Selected: {p1Data.name} ({p1Data.city})</div>}
                        </div>

                        {/* Optional Person 2 */}
                        {(domain.includes("Partnership") || domain.includes("Matching") || domain.includes("Compatibility") || domain.includes("Marriage")) && (
                            <div className="glass-card">
                                <h2>Person 2 (Optional)</h2>
                                <div className="select-container">
                                    <select className="chart-select" value={p2Id} onChange={handleP2Select}>
                                        <option value="">-- Select Saved Chart --</option>
                                        {savedCharts.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        )}

                        <div className="glass-card">
                            <h2>Context Inputs</h2>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Goal / Description</label>
                            <textarea
                                className="dropdown-search-input"
                                style={{ height: '80px' }}
                                value={domainInputs.goal}
                                onChange={e => setDomainInputs({ ...domainInputs, goal: e.target.value })}
                            />
                        </div>

                        <button type="submit" className="analyze-btn" disabled={loading}>
                            {loading ? "Processing Rules..." : "Run Decision Engine"}
                        </button>
                        {error && <div className="error-msg">{error}</div>}
                    </form>
                ) : (
                    <div className="bp-results-section animate-fade-in">
                        <div className="result-header">
                            <h2>Verdict: <span className={`verdict ${result.verdict === 'GO' ? 'strategic' : 'conditional'}`}>{result.verdict}</span></h2>
                            <button className="reset-btn" onClick={() => setResult(null)}>New Analysis</button>
                        </div>

                        <div className="glass-card">
                            <h3>Scores</h3>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                <li>Promise: {result.scores.promise}</li>
                                <li>Activation: {result.scores.activation}</li>
                                <li>Timing: {result.scores.timing}</li>
                                {result.scores.compatibility !== 'N/A' && <li>Compatibility: {result.scores.compatibility}</li>}
                            </ul>
                        </div>

                        <div className="glass-card">
                            <h3>What Is</h3>
                            <p>{result.what_is}</p>
                        </div>

                        <div className="glass-card">
                            <h3>Why (Explainability)</h3>
                            <ul>
                                {result.why.map((w, i) => <li key={i}>{w}</li>)}
                            </ul>
                        </div>

                        <div className="glass-card">
                            <h3>When</h3>
                            <p><strong>Best:</strong> {typeof result.when.best === 'string' ? result.when.best : JSON.stringify(result.when.best)}</p>
                            <p><strong>Worst:</strong> {typeof result.when.worst === 'string' ? result.when.worst : JSON.stringify(result.when.worst)}</p>
                        </div>

                        <div className="glass-card">
                            <h3>Projections (Confidence: Medium)</h3>
                            <p>12 Months: {result.projections["12_month"]}/10</p>
                            <p>24 Months: {result.projections["24_month"]}/10</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AstrogravityTestPage;
