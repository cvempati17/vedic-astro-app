import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import './PalmistryPage.css'; // Reuse existing styles

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const RELATIONSHIPS = [
    'Father', 'Mother', 'Son', 'Daughter'
];

const FamilyVisionPage = ({ onBack }) => {
    const [savedCharts, setSavedCharts] = useState([]);
    const [inputRows, setInputRows] = useState([
        { id: 1, chartId: '', relation: 'Father' },
        { id: 2, chartId: '', relation: 'Mother' },
        { id: 3, chartId: '', relation: 'Son' }
    ]);
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
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
            const allCharts = [...cloudCharts, ...localCharts];
            const uniqueCharts = Array.from(new Map(allCharts.map(item => [item._id, item])).values());
            setSavedCharts(uniqueCharts);
        };
        fetchCharts();
    }, []);

    const addRow = () => {
        if (inputRows.length >= 8) {
            alert("Maximum 8 persons allowed");
            return;
        }
        setInputRows([...inputRows, { id: Date.now(), chartId: '', relation: '' }]);
    };

    const removeRow = (id) => {
        if (inputRows.length > 1) {
            setInputRows(inputRows.filter(row => row.id !== id));
        }
    };

    const updateRow = (id, field, value) => {
        setInputRows(inputRows.map(row => row.id === id ? { ...row, [field]: value } : row));
    };

    const generateVision = async () => {
        setLoading(true);
        setError('');
        setReport(null);
        try {
            const validRows = inputRows.filter(r => r.chartId && r.relation);
            if (validRows.length < 1) throw new Error("Please select at least one family member.");

            const members = [];
            for (const row of validRows) {
                const chart = savedCharts.find(c => c._id === row.chartId);
                if (!chart) continue;

                // Ensure chart data availability (simplified for Vision)
                let chartData = chart.chartData;
                if (!chartData || (!chartData.planets && !chartData.Sun)) {
                    // Recalculate if needed (simplified block from FamilyOSPage)
                    const payload = {
                        date: chart.dateOfBirth,
                        time: chart.timeOfBirth,
                        latitude: chart.placeOfBirth.lat,
                        longitude: chart.placeOfBirth.lng,
                        timezone: chart.placeOfBirth.timezone,
                        ayanamsa: 'lahiri'
                    };
                    const res = await axios.post(`${API_URL}/api/calculate`, payload);
                    if (res.data.success) chartData = res.data.data;
                }

                if (chartData) {
                    members.push({
                        role: row.relation,
                        chart_object: chartData,
                        name: chart.name // Used for UI only, report uses Role
                    });
                }
            }

            const response = await axios.post(`${API_URL}/api/family-values/vision`, {
                family_context: {
                    cultural_context: "Indian",
                    family_structure: "parents_with_child"
                },
                members: members
            });

            if (response.data.success) {
                setReport(response.data.report);
            } else {
                throw new Error(response.data.error || "Generation failed");
            }

        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to generate Vision Report.");
        } finally {
            setLoading(false);
        }
    };

    // Styles
    const pageStyle = { background: '#0f1220', color: '#e6e6e6', minHeight: '100vh', padding: '20px', fontFamily: 'Arial, sans-serif' };
    const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '20px', background: '#0f1220' };
    const thTdStyle = { border: '1px solid #2e324a', padding: '10px', textAlign: 'center' };
    const inputStyle = { background: '#151827', color: '#e6e6e6', border: '1px solid #2e324a', padding: '8px', width: '90%' };
    const buttonStyle = { background: '#151827', color: '#e6e6e6', border: '1px solid #2e324a', padding: '8px', cursor: 'pointer' };
    const primaryButtonStyle = { ...buttonStyle, background: 'linear-gradient(90deg,#e6c87a,#bfa24a)', color: '#0f1220', fontWeight: 'bold', padding: '12px 24px', marginTop: '20px' };

    return (
        <div style={pageStyle}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                <button style={buttonStyle} onClick={onBack}>← Back</button>
                <div style={{ flex: 1, textAlign: 'center' }}>
                    <h1 style={{ color: '#e6c87a', margin: 0 }}>Family OS – Input (v1.0)</h1>
                </div>
                <div style={{ width: '60px' }}></div>
            </div>

            {!report ? (
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <table style={tableStyle}>
                        <thead>
                            <tr>
                                <th style={thTdStyle}>Person</th>
                                <th style={thTdStyle}>Relationship</th>
                                <th style={thTdStyle}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inputRows.map((row, index) => (
                                <tr key={row.id}>
                                    <td style={thTdStyle}>
                                        <select style={inputStyle} value={row.chartId} onChange={(e) => updateRow(row.id, 'chartId', e.target.value)}>
                                            <option value="">Select Person</option>
                                            {savedCharts.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                        </select>
                                    </td>
                                    <td style={thTdStyle}>
                                        <select style={inputStyle} value={row.relation} onChange={(e) => updateRow(row.id, 'relation', e.target.value)}>
                                            <option value="">Relationship</option>
                                            {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </td>
                                    <td style={thTdStyle}>
                                        {index > 2 ? (
                                            <button style={{ ...buttonStyle, color: '#ff6b6b' }} onClick={() => removeRow(row.id)}>Remove</button>
                                        ) : index === inputRows.length - 1 && index < 7 ? (
                                            <button style={buttonStyle} onClick={addRow}>Add</button>
                                        ) : (
                                            <span style={{ color: '#6c728f', fontSize: '0.8em' }}>Fixed</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div style={{ textAlign: 'center', marginTop: '30px' }}>
                        <button style={primaryButtonStyle} onClick={generateVision} disabled={loading}>
                            {loading ? "Generating..." : "Generate Family OS Report"}
                        </button>
                    </div>
                    {error && <div style={{ color: '#ef4444', textAlign: 'center', marginTop: '10px' }}>{error}</div>}
                </div>
            ) : (
                <div style={{ maxWidth: '800px', margin: '0 auto', background: '#12162a', padding: '40px', borderRadius: '10px', border: '1px solid #2a2f4a', whiteSpace: 'pre-line', lineHeight: '1.6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #2a2f4a', paddingBottom: '20px' }}>
                        <h2 style={{ color: '#e6c87a', margin: 0 }}>Family Vision Statement</h2>
                        <button style={buttonStyle} onClick={() => setReport(null)}>Reset</button>
                    </div>
                    <div style={{ color: '#d1d5db' }}>
                        {report}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FamilyVisionPage;
