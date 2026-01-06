import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, ReferenceArea, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AXES = [
    { key: 'career', label: 'Career' },
    { key: 'wealth', label: 'Wealth' },
    { key: 'family', label: 'Family' },
    { key: 'authority', label: 'Authority' },
    { key: 'care', label: 'Care' },
    { key: 'conflict', label: 'Conflict' },
    { key: 'legacy', label: 'Legacy' },
    { key: 'emotional_load', label: 'Emotional Load' }
];

const FamilyTimeline = ({ members, familyId }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedAxis, setSelectedAxis] = useState('career');

    useEffect(() => {
        const fetchData = async () => {
            if (!members || members.length < 2) return;
            setLoading(true);

            // Self-Healing: Enrich members if chart data is missing (e.g. only summary passed)
            const enrichedMembers = await Promise.all(members.map(async m => {
                const co = m.chart_object || {};
                const keys = Object.keys(co).map(k => k.toLowerCase());
                const hasPlanets = keys.includes('sun') || keys.includes('ascendant');

                // If planets missing but ID exists, try to fetch full chart
                if (!hasPlanets && m.id && m.id.length > 10) {
                    try {
                        const res = await axios.get(`${API_URL}/api/charts/${m.id}`);
                        if (res.data.success && res.data.chart) {
                            // Found valid chart, extract planets
                            const fullPlanets = res.data.chart.planets || res.data.chart.chart_object;
                            return { ...m, chart_object: fullPlanets };
                        }
                    } catch (e) {
                        console.warn("Auto-fetch failed for member:", m.name);
                    }
                }
                return m;
            }));

            // Validate Enriched Data
            const hasData = enrichedMembers.some(m => m.chart_object && (m.chart_object.Sun || m.chart_object.sun || Object.keys(m.chart_object).length > 8));
            if (!hasData) {
                setError(`Data Error: Charts not found. Please ensure members are linked to Saved Charts. Received Keys: ${Object.keys(members[0]?.chart_object || {}).join(', ')}`);
                setLoading(false);
                return;
            }

            try {
                // Get Start Date (Current Month)
                const start = new Date().toISOString().slice(0, 7); // YYYY-MM
                const response = await axios.post(`${API_URL}/api/time-engine/calculate`, {
                    members: enrichedMembers,
                    familyId,
                    startDate: start
                });
                if (response.data.success) {
                    setData(response.data.data);
                } else {
                    setError('Failed to load timeline.');
                }
            } catch (e) {
                console.error(e);
                setError('Error loading timeline: ' + e.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [members, familyId]);

    const getAxisData = () => {
        if (!data || !data.effective_intensity_layer) return [];
        const effLayer = data.effective_intensity_layer.axes[selectedAxis] || [];
        const transLayer = data.transit_layer.axes[selectedAxis] || [];
        const guideLayer = data.guidance_layer.axes[selectedAxis] || [];

        // Merge
        return effLayer.map((pt, idx) => {
            const tr = transLayer[idx] || {};
            const gd = guideLayer[idx] || {};
            return {
                time: pt.time,
                intensity: pt.effective_intensity, // 0-135
                familyBase: pt.family_intensity, // 0-100
                gate: tr.gate, // OPEN, HOLD, BLOCK
                guidance: gd.state,
                message: gd.message,
                dominant_planet: tr.dominant_planet
            };
        });
    };

    const chartData = getAxisData();

    // Helper for Reference Areas (Gates)
    const getGateRegions = () => {
        if (!chartData.length) return [];
        const regions = [];
        let start = 0;
        let currentGate = chartData[0]?.gate;

        for (let i = 1; i < chartData.length; i++) {
            if (chartData[i].gate !== currentGate) {
                regions.push({ start: chartData[start].time, end: chartData[i - 1].time, gate: currentGate });
                start = i;
                currentGate = chartData[i].gate;
            }
        }
        regions.push({ start: chartData[start].time, end: chartData[chartData.length - 1].time, gate: currentGate });
        return regions;
    };

    const gateColors = {
        OPEN: '#2ECC71', // Green
        HOLD: '#F1C40F', // Amber
        BLOCK: '#E74C3C' // Red
    };

    if (loading) return <div style={{ color: '#fff' }}>Loading Time Engine...</div>;
    if (error) return <div style={{ color: '#ef4444' }}>{error}</div>;

    return (
        <div style={{ background: '#0f1220', color: '#e6e6e6', padding: '20px' }}>
            <h2 style={{ color: '#e6c87a' }}>Family Timeline & Guidance</h2>

            {/* Axis Selector */}
            <div style={{ marginBottom: '20px' }}>
                <label style={{ marginRight: '10px' }}>Select Life Axis:</label>
                <select
                    value={selectedAxis}
                    onChange={(e) => setSelectedAxis(e.target.value)}
                    style={{ background: '#151827', color: '#fff', border: '1px solid #4b5563', padding: '8px' }}
                >
                    {AXES.map(a => <option key={a.key} value={a.key}>{a.label}</option>)}
                </select>
            </div>

            {/* Graph */}
            {data && (
                <div style={{ height: '400px', background: '#151827', padding: '10px', borderRadius: '8px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2e324a" />
                            <XAxis dataKey="time" stroke="#9ca3af" />
                            <YAxis domain={[0, 140]} stroke="#9ca3af" label={{ value: 'Effective Intensity', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} />
                            <Tooltip
                                contentStyle={{ background: '#1f2937', border: '1px solid #4b5563', color: '#fff' }}
                                labelStyle={{ color: '#e6c87a' }}
                            />
                            <Legend />

                            {/* Gate Backgrounds */}
                            {getGateRegions().map((r, i) => (
                                <ReferenceArea
                                    key={i}
                                    x1={r.start}
                                    x2={r.end}
                                    fill={gateColors[r.gate] || '#333'}
                                    fillOpacity={0.15}
                                />
                            ))}

                            {/* Lines */}
                            <Line type="monotone" dataKey="familyBase" stroke="#6b7280" strokeDasharray="5 5" name="Family Base (Promise)" dot={false} strokeWidth={2} />
                            <Line type="monotone" dataKey="intensity" stroke="#e6c87a" strokeWidth={3} name="Effective Intensity" dot={{ r: 4 }} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Guidance Panel */}
            {data && chartData.length > 0 && (
                <div style={{ marginTop: '20px', padding: '15px', background: '#1f2937', borderRadius: '8px', borderLeft: '4px solid #e6c87a' }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#e6c87a' }}>Current Guidance ({chartData[0].time})</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <strong>Status:</strong> <span style={{
                                color: gateColors[chartData[0].gate] || '#fff',
                                fontWeight: 'bold'
                            }}>{chartData[0].gate}</span>
                        </div>
                        <div>
                            <strong>Action:</strong> <span style={{ fontWeight: 'bold' }}>{chartData[0].guidance}</span>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <strong>Message:</strong> {chartData[0].message}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FamilyTimeline;
