import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import './SavedChartsPage.css'; // Reusing styles

const MuhuratPage = ({ onBack }) => {
    const { t } = useTranslation();
    const [savedCharts, setSavedCharts] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form State
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]); // +30 days
    const [ceremony, setCeremony] = useState('Marriage');
    const [businessType, setBusinessType] = useState('retail_shop');
    const [selectedMembers, setSelectedMembers] = useState([]); // [{ chartId, role }]

    // Reset Logic if ceremony changes
    useEffect(() => {
        if (ceremony !== 'Business Opening') {
            setBusinessType('');
        } else {
            setBusinessType('retail_shop');
        }
    }, [ceremony]);

    // Results
    const [results, setResults] = useState(null);

    // Load Charts
    useEffect(() => {
        const loadCharts = async () => {
            const token = localStorage.getItem('token');
            const localCharts = JSON.parse(localStorage.getItem('savedCharts') || '[]');

            try {
                if (token) {
                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                    const res = await axios.get(`${API_URL}/api/charts`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setSavedCharts([...res.data]);
                } else {
                    setSavedCharts(localCharts);
                }
            } catch (e) {
                console.error("Error loading charts", e);
                setSavedCharts(localCharts); // Fallback
            }
        };
        loadCharts();
    }, []);

    const handleAddMember = (chartId, role) => {
        if (!chartId || !role) return;
        // Avoid duplicates
        if (selectedMembers.find(m => m.chartId === chartId && m.role === role)) return;

        const chart = savedCharts.find(c => c._id === chartId);

        if (!chart) return;

        const memberData = {
            chartId,
            role,
            name: chart.name,
            chartData: chart.chartData,
            placeOfBirth: chart.placeOfBirth
        };

        setSelectedMembers([...selectedMembers, memberData]);
    };

    const handleRemoveMember = (index) => {
        const newM = [...selectedMembers];
        newM.splice(index, 1);
        setSelectedMembers(newM);
    };

    const handleCalculate = async () => {
        if (selectedMembers.length === 0) {
            alert("Please add at least one person.");
            return;
        }

        setLoading(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const payload = {
                startDate,
                endDate,
                ceremony: ceremony === 'Business Opening' ? 'business_opening' : ceremony,
                businessType: ceremony === 'Business Opening' ? businessType : null,
                members: selectedMembers,
            };

            const response = await axios.post(`${API_URL}/api/muhurat/calculate`, payload, { headers });
            if (response.data.success) {
                setResults(response.data.data);
            } else {
                alert("Calculation failed: " + response.data.error);
            }
        } catch (err) {
            console.error(err);
            alert("Error calculating Muhurat: " + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    const getChartName = (id) => {
        const c = savedCharts.find(x => x._id === id);
        return c ? c.name : id;
    };

    return (
        <div className="saved-charts-container" style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                <button
                    onClick={onBack}
                    style={{ background: '#151827', color: 'white', border: '1px solid #2a2f4a', padding: '10px 20px', cursor: 'pointer', borderRadius: '5px', marginRight: '20px' }}
                >
                    ← Back
                </button>
                <h1 style={{ color: '#e6c87a', margin: 0 }}>Vedic Muhurat Engine</h1>
            </div>

            {/* Input Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>

                {/* Left: Configuration */}
                <div style={{ background: '#0f1324', padding: '20px', borderRadius: '10px', border: '1px solid #2a2f4a' }}>
                    <h3 style={{ color: '#94a3b8', borderBottom: '1px solid #2a2f4a', paddingBottom: '10px', marginTop: 0 }}>1. Ceremony & Date</h3>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ color: '#a1a1aa', display: 'block', marginBottom: '5px' }}>Ceremony/Event Type</label>
                        <select
                            value={ceremony}
                            onChange={(e) => setCeremony(e.target.value)}
                            style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #2a2f4a', color: 'white', borderRadius: '5px' }}
                        >
                            <option value="Marriage">Marriage (Vivaha)</option>
                            <option value="House Warming">House Warming (Griha Pravesh)</option>
                            <option value="Business Opening">Business Opening</option>
                            <option value="Ground Breaking">Ground Breaking (Bhoomi Puja)</option>
                            <option value="Naming Ceremony">Naming Ceremony (Namakaran)</option>
                            <option value="Gestation">Conception (Garbhadhana)</option>
                            <option value="Annaprashana">First Feeding (Annaprashana)</option>
                            <option value="Mundan">Tonsure (Mundan)</option>
                        </select>
                    </div>

                    {ceremony === 'Business Opening' && (
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ color: '#a1a1aa', display: 'block', marginBottom: '5px' }}>Business Type</label>
                            <select
                                value={businessType}
                                onChange={(e) => setBusinessType(e.target.value)}
                                style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #2a2f4a', color: 'white', borderRadius: '5px' }}
                            >
                                <option value="retail_shop">Retail Shop</option>
                                <option value="wholesale_trade">Wholesale Trade</option>
                                <option value="manufacturing">Manufacturing</option>
                                <option value="finance_banking">Finance & Banking</option>
                                <option value="technology_it">Technology & IT</option>
                                <option value="food_restaurant">Food & Restaurant</option>
                                <option value="luxury_fashion">Luxury & Fashion</option>
                                <option value="education_training">Education & Training</option>
                                <option value="healthcare_medical">Healthcare & Medical</option>
                                <option value="real_estate">Real Estate</option>
                                <option value="logistics_transport">Logistics & Transport</option>
                                <option value="spiritual_ashram">Spiritual Ashram</option>
                            </select>
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                            <label style={{ color: '#a1a1aa', display: 'block', marginBottom: '5px' }}>Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #2a2f4a', color: 'white', borderRadius: '5px' }}
                            />
                        </div>
                        <div>
                            <label style={{ color: '#a1a1aa', display: 'block', marginBottom: '5px' }}>End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #2a2f4a', color: 'white', borderRadius: '5px' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Right: Participants */}
                <div style={{ background: '#0f1324', padding: '20px', borderRadius: '10px', border: '1px solid #2a2f4a' }}>
                    <h3 style={{ color: '#94a3b8', borderBottom: '1px solid #2a2f4a', paddingBottom: '10px', marginTop: 0 }}>2. Participants</h3>

                    <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                        <select id="selChart" style={{ flex: 2, padding: '10px', background: '#1e293b', border: '1px solid #2a2f4a', color: 'white', borderRadius: '5px' }}>
                            <option value="">Select Person...</option>
                            {savedCharts.map(c => (
                                <option key={c._id} value={c._id}>{c.name}</option>
                            ))}
                        </select>
                        <select id="selRole" style={{ flex: 1, padding: '10px', background: '#1e293b', border: '1px solid #2a2f4a', color: 'white', borderRadius: '5px' }}>
                            {ceremony === 'Business Opening' ? (
                                <option value="owner">Owner</option>
                            ) : (
                                <>
                                    <option value="husband">Husband</option>
                                    <option value="wife">Wife</option>
                                    <option value="child">Child</option>
                                    <option value="owner">Owner</option>
                                </>
                            )}
                        </select>
                        <button
                            onClick={() => {
                                const c = document.getElementById('selChart').value;
                                const r = document.getElementById('selRole').value;
                                handleAddMember(c, r);
                            }}
                            style={{ background: '#059669', color: 'white', border: 'none', padding: '0 15px', borderRadius: '5px', cursor: 'pointer' }}
                        >
                            + Add
                        </button>
                    </div>

                    <div style={{ minHeight: '100px' }}>
                        {selectedMembers.map((m, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'rgba(255,255,255,0.05)', marginBottom: '5px', borderRadius: '4px' }}>
                                <span><strong style={{ color: '#e6c87a' }}>{getChartName(m.chartId)}</strong> as {m.role}</span>
                                <span
                                    onClick={() => handleRemoveMember(idx)}
                                    style={{ color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    ✕
                                </span>
                            </div>
                        ))}
                        {selectedMembers.length === 0 && <div style={{ color: '#64748b', fontStyle: 'italic' }}>No participants added.</div>}
                    </div>
                </div>
            </div>

            {/* Calculate Button */}
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <button
                    onClick={handleCalculate}
                    disabled={loading}
                    style={{
                        background: 'linear-gradient(90deg, #e6c87a, #bfa24a)',
                        color: '#0f1220',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        padding: '12px 40px',
                        border: 'none',
                        borderRadius: '50px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1,
                        boxShadow: '0 4px 15px rgba(230, 200, 122, 0.3)'
                    }}
                >
                    {loading ? 'Calculating...' : '🔮 Find Muhurat Windows'}
                </button>
            </div>

            {/* Results Table */}
            {results && (
                <div style={{ background: '#0f1324', padding: '20px', borderRadius: '10px', border: '1px solid #2a2f4a' }}>
                    <h3 style={{ color: '#e6c87a', marginTop: 0 }}>Recommended Muhurats ({results.length})</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#e2e8f0' }}>
                            <thead>
                                <tr style={{ background: '#1e293b', textAlign: 'left' }}>
                                    <th style={{ padding: '12px', borderBottom: '2px solid #2a2f4a' }}>Rank</th>
                                    <th style={{ padding: '12px', borderBottom: '2px solid #2a2f4a' }}>Date & Time Window</th>
                                    <th style={{ padding: '12px', borderBottom: '2px solid #2a2f4a' }}>Panchang (Tithi/Nak/Yoga)</th>
                                    <th style={{ padding: '12px', borderBottom: '2px solid #2a2f4a' }}>Lagna (Asc)</th>
                                    <th style={{ padding: '12px', borderBottom: '2px solid #2a2f4a' }}>Score</th>
                                    <th style={{ padding: '12px', borderBottom: '2px solid #2a2f4a' }}>Quality</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((r, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #2a2f4a' }}>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{
                                                width: '30px', height: '30px', background: i < 3 ? '#e6c87a' : '#334155',
                                                color: i < 3 ? 'black' : 'white', borderRadius: '50%',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                                            }}>
                                                {i + 1}
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ fontWeight: 'bold', fontSize: '1.1em' }}>{r.date}</div>
                                            <div style={{ color: '#94a3b8' }}>~ {r.time} ({r.weekday})</div>
                                            {r.hora && <div style={{ color: '#a78bfa', fontSize: '0.8em' }}>Hora: {r.hora}</div>}
                                        </td>
                                        <td style={{ padding: '12px', fontSize: '0.9em' }}>
                                            <div>🌙 {r.nakshatra}</div>
                                            <div>📅 {r.tithi}</div>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{ color: '#a78bfa', fontWeight: 'bold' }}>{r.lagna}</span>
                                        </td>
                                        <td style={{ padding: '12px', fontWeight: 'bold' }}>{r.score}</td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{
                                                padding: '4px 8px', borderRadius: '4px', fontSize: '0.8em',
                                                background: r.quality === 'Excellent' ? 'rgba(16, 185, 129, 0.2)' : r.quality === 'Good' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                                color: r.quality === 'Excellent' ? '#34d399' : r.quality === 'Good' ? '#60a5fa' : '#f87171'
                                            }}>
                                                {r.quality}
                                            </span>
                                            {r.analysis && r.analysis.log && (
                                                <div style={{ fontSize: '0.75em', marginTop: '5px', color: '#64748b' }}>
                                                    {r.analysis.log.slice(0, 2).map((l, li) => <div key={li}>{l}</div>)}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MuhuratPage;
