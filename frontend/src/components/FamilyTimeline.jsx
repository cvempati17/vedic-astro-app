import React, { useState, useEffect } from 'react';
import PhaseTraceDrawer from './PhaseTraceDrawer';
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
    const [interpretations, setInterpretations] = useState(null);
    const [language, setLanguage] = useState('en');
    const [drawerState, setDrawerState] = useState({ isOpen: false, data: null, time: null, phase: null });
    const [focusedMemberId, setFocusedMemberId] = useState(null);
    const [hoveredMemberId, setHoveredMemberId] = useState(null);
    const [frozenPoint, setFrozenPoint] = useState(null);

    // Fetch Interpretations
    useEffect(() => {
        const fetchInterpretations = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/time-engine/interpretations?lang=${language}`);
                if (res.data.success) {
                    setInterpretations(res.data.data);
                }
            } catch (e) {
                console.warn("Failed to fetch interpretations", e);
            }
        };
        fetchInterpretations();
    }, [language]);

    useEffect(() => {
        const fetchData = async () => {
            if (!members || members.length < 2) return;
            setLoading(true);

            // Self-Healing
            const enrichedMembers = await Promise.all(members.map(async m => {
                const co = m.chart_object || {};
                const keys = Object.keys(co).map(k => k.toLowerCase());
                const hasPlanets = keys.includes('sun') || keys.includes('ascendant');

                if (!hasPlanets && m.id && m.id.length > 10) {
                    try {
                        const res = await axios.get(`${API_URL}/api/charts/${m.id}`);
                        if (res.data.success && res.data.chart) {
                            const fullPlanets = res.data.chart.planets || res.data.chart.chart_object;
                            return { ...m, chart_object: fullPlanets };
                        }
                    } catch (e) {
                        // silent fail
                    }
                }
                return m;
            }));

            const hasData = enrichedMembers.some(m => m.chart_object && (m.chart_object.Sun || m.chart_object.sun || Object.keys(m.chart_object).length > 8));
            if (!hasData) {
                setError(`Data Error: Charts not found.`);
                setLoading(false);
                return;
            }

            try {
                const start = new Date().toISOString().slice(0, 7);
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
                setError('Error loading timeline: ' + e.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [members, familyId]);

    // Deep Link Logic
    useEffect(() => {
        if (!data) return;
        const params = new URLSearchParams(window.location.search);
        if (params.get("trace") === "open") {
            const axisParam = params.get("axis");
            const periodParam = params.get("period");

            if (axisParam && periodParam) {
                if (axisParam !== selectedAxis) {
                    setSelectedAxis(axisParam);
                }
                const traceArr = data.trace_layer?.axes?.[axisParam];
                const trace = traceArr?.find(tr => tr.time === periodParam);
                if (trace) {
                    setDrawerState({ isOpen: true, data: trace, time: periodParam, phase: trace.phase_resolution });
                }
            }
        }
    }, [data]);

    const getAxisData = () => {
        if (!data || !data.effective_intensity_layer) return [];
        const effLayer = data.effective_intensity_layer.axes[selectedAxis] || [];
        const transLayer = data.transit_layer.axes[selectedAxis] || [];
        const guideLayer = data.guidance_layer.axes[selectedAxis] || [];

        return effLayer.map((pt, idx) => {
            const tr = transLayer[idx] || {};
            const gd = guideLayer[idx] || {};
            const memberPoints = {};
            if (members && data.individual_dasha_layer) {
                members.forEach(m => {
                    const mLayer = data.individual_dasha_layer[m.id]?.[selectedAxis];
                    if (mLayer && mLayer[idx]) {
                        memberPoints[`member_${m.id}`] = mLayer[idx].intensity;
                    }
                });
            }
            return {
                time: pt.time,
                intensity: pt.effective_intensity,
                familyBase: pt.family_intensity,
                gate: tr.gate,
                guidance_key: gd.guidance_key,
                dominant_planet: tr.dominant_planet,
                ...memberPoints
            };
        });
    };

    const chartData = getAxisData();

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
        OPEN: '#2ECC71',
        HOLD: '#F39C12',
        BLOCK: '#8E44AD'
    };

    // Custom Tooltip Component
    const CustomTooltip = ({ active, payload, label, isFrozen }) => {
        const [showComparison, setShowComparison] = useState(false);

        // Reset comparison logic
        const activeMemberInfo = hoveredMemberId || focusedMemberId;
        useEffect(() => {
            if (!isFrozen) setShowComparison(false); // Only reset if NOT interacting in frozen mode
        }, [activeMemberInfo, isFrozen]);

        if (active && payload && payload.length) {
            const point = payload[0].payload;
            const gate = point.gate;
            const familyIntensity = point.intensity;

            // Determine Active Member
            const activeMemberId = hoveredMemberId || focusedMemberId || null;
            const activeMember = activeMemberId ? members.find(m => m.id === activeMemberId) : null;
            const memberIntensity = activeMember ? point[`member_${activeMemberId}`] : null;

            const phaseKey = `FM_PHASE_${gate}`;
            const semantics = interpretations?.governance?.phase_semantics?.phases?.[phaseKey];
            const phaseColor = gateColors[gate] || '#ccc';

            return (
                <div style={{
                    backgroundColor: 'rgba(31, 41, 55, 0.95)',
                    border: '1px solid #4b5563',
                    borderRadius: '8px',
                    padding: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                    maxWidth: '300px',
                    color: '#e6e6e6',
                    zIndex: 1000,
                    pointerEvents: isFrozen ? 'auto' : 'none', // FIX: Allow click-through to freeze, then interact
                    position: 'relative'
                }}>
                    {isFrozen && (
                        <button
                            onClick={(e) => { e.stopPropagation(); setFrozenPoint(null); }}
                            style={{ position: 'absolute', top: '4px', right: '4px', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                            ✕
                        </button>
                    )}

                    <div style={{ marginBottom: '8px', borderBottom: '1px solid #374151', paddingBottom: '4px', paddingRight: '16px' }}>
                        <strong style={{ color: '#9ca3af', fontSize: '12px' }}>{label}</strong>
                    </div>

                    {activeMember ? (
                        <>
                            <div style={{ marginBottom: '8px', padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                                <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#e6c87a', marginBottom: '4px' }}>
                                    {activeMember.name}
                                </div>
                                <div style={{ fontSize: '12px', color: '#d1d5db' }}>
                                    Intensity: <strong>{memberIntensity?.toFixed(0)}</strong>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: phaseColor, marginRight: '8px' }} />
                                <span style={{ fontWeight: 'bold', color: phaseColor, fontSize: '12px' }}>
                                    {gate} (Family Context)
                                </span>
                            </div>
                        </>
                    ) : (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: phaseColor, marginRight: '8px' }} />
                                <span style={{ fontWeight: 'bold', color: phaseColor, fontSize: '14px' }}>
                                    {gate} PHASE
                                </span>
                            </div>
                            <div style={{ marginBottom: '4px', fontSize: '12px', color: '#d1d5db', display: 'flex', justifyContent: 'space-between' }}>
                                <span>Family Intensity:</span>
                                <strong>{familyIntensity?.toFixed(0)}</strong>
                            </div>
                        </>
                    )}

                    {semantics && (
                        <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #374151', fontSize: '12px', lineHeight: '1.4', fontStyle: 'italic', color: '#e6c87a' }}>
                            {semantics.short_explanation}
                        </div>
                    )}

                    {activeMember && !showComparison && members.length > 1 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowComparison(true); }}
                            style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: '11px', cursor: 'pointer', marginTop: '8px', padding: 0 }}
                        >
                            Compare others ▸
                        </button>
                    )}

                    {showComparison && (
                        <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid #374151' }}>
                            {members.filter(m => m.id !== activeMemberId).map(m => (
                                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>
                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4b5563' }} />
                                    <span style={{}}>
                                        {m.name}:
                                    </span>
                                    <span style={{ color: '#d1d5db' }}>
                                        {point[`member_${m.id}`]?.toFixed(0)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {data?.trace_layer && (
                        <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const trace = data.trace_layer?.axes?.[selectedAxis]?.find(t => t.time === point.time);
                                    if (trace) {
                                        setDrawerState({ isOpen: true, data: trace, time: point.time, phase: trace.phase_resolution });
                                    }
                                }}
                                style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid #4b5563', borderRadius: '4px', padding: '2px 8px', color: '#e5e7eb', fontSize: '11px', cursor: 'pointer' }}
                            >
                                Using Logic?
                            </button>
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };


    if (loading) return <div style={{ color: '#fff' }}>Loading Time Engine...</div>;
    if (error) return <div style={{ color: '#ef4444' }}>{error}</div>;

    const currentDisplayPoint = frozenPoint ? frozenPoint.payload[0].payload : (chartData.length > 0 ? chartData[0] : null);

    return (
        <div style={{ background: '#0f1220', color: '#e6e6e6', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ color: '#e6c87a' }}>Family Timeline & Guidance</h2>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ background: '#333', color: '#fff', border: 'none', padding: '5px' }}>
                    <option value="en">English</option> <option value="hi">Hindi</option> <option value="te">Telugu</option> <option value="ta">Tamil</option>
                </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <label style={{ marginRight: '10px' }}>Select Life Axis:</label>
                <select value={selectedAxis} onChange={(e) => setSelectedAxis(e.target.value)} style={{ background: '#151827', color: '#fff', border: '1px solid #4b5563', padding: '8px' }}>
                    {interpretations ? Object.keys(interpretations.axes).map(key => <option key={key} value={key}>{interpretations.axes[key].title || key}</option>)
                        : AXES.map(a => <option key={a.key} value={a.key}>{a.label}</option>)}
                </select>
                {interpretations && interpretations.axes[selectedAxis] && (
                    <div style={{ marginTop: '10px', color: '#9ca3af', fontSize: '14px', fontStyle: 'italic' }}>{interpretations.axes[selectedAxis].description.medium}</div>
                )}
            </div>

            {/* Graph */}
            {data && (
                <div style={{ height: '400px', background: '#151827', padding: '10px', borderRadius: '8px', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '12px', color: '#6b7280', zIndex: 10 }}>
                        {frozenPoint ? "Interactive Mode (Click X to resume)" : "Click point to freeze & interact"}
                    </div>

                    {/* Frozen Tooltip Overlay */}
                    {frozenPoint && (
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 20 }}>
                            <div style={{ position: 'absolute', left: frozenPoint.x, top: frozenPoint.y, pointerEvents: 'auto' }}>
                                <CustomTooltip active={true} payload={frozenPoint.payload} label={frozenPoint.label} isFrozen={true} />
                            </div>
                        </div>
                    )}

                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={chartData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            onClick={(e) => {
                                if (e && e.activePayload && e.activePayload.length) {
                                    if (frozenPoint && frozenPoint.label === e.activePayload[0].payload.time) {
                                        setFrozenPoint(null);
                                    } else {
                                        setFrozenPoint({
                                            x: e.activeCoordinate.x,
                                            y: e.activeCoordinate.y,
                                            payload: e.activePayload,
                                            label: e.activePayload[0].payload.time
                                        });
                                    }
                                }
                            }}
                            onMouseLeave={() => setHoveredMemberId(null)}
                            style={{ cursor: 'pointer' }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#2e324a" />
                            <XAxis dataKey="time" stroke="#9ca3af" />
                            <YAxis domain={[0, 140]} stroke="#9ca3af" label={{ value: 'Effective Intensity', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} />
                            {!frozenPoint && <Tooltip content={<CustomTooltip />} wrapperStyle={{ pointerEvents: 'none' }} cursor={{ stroke: '#9ca3af', strokeWidth: 1, pointerEvents: 'none' }} isAnimationActive={false} />}


                            {getGateRegions().map((r, i) => (
                                <ReferenceArea key={i} x1={r.start} x2={r.end} fill={gateColors[r.gate] || '#333'} fillOpacity={0.15} />
                            ))}

                            {members && members.map((m, idx) => {
                                const isFocused = focusedMemberId === m.id;
                                const isDimmed = focusedMemberId && !isFocused;
                                const opacity = isDimmed ? 0.25 : 0.8;
                                return (
                                    <Line
                                        key={m.id} type="monotone" dataKey={`member_${m.id}`} stroke="#9ca3af" strokeOpacity={opacity} strokeWidth={1} dot={false}
                                        name={m.name || `Member ${idx + 1}`} strokeDasharray="3 3"
                                        onMouseEnter={() => setHoveredMemberId(m.id)} onMouseLeave={() => setHoveredMemberId(null)} isAnimationActive={false}
                                        activeDot={false} interaction="none"
                                    />
                                );
                            })}
                            <Line type="monotone" dataKey="familyBase" stroke="#6b7280" strokeDasharray="5 5" name="Family Base (Promise)" dot={false} strokeWidth={2} isAnimationActive={false} activeDot={false} />
                            <Line
                                type="monotone"
                                dataKey="intensity"
                                stroke="#e6c87a"
                                strokeWidth={3}
                                name="Effective Intensity"
                                dot={{ r: 4 }}
                                activeDot={{ r: 8, pointerEvents: 'none' }}
                                isAnimationActive={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Custom Interactive Legend */}
            {members && (
                <div style={{ display: 'flex', gap: '15px', marginTop: '10px', padding: '10px', background: '#111827', borderRadius: '8px', alignItems: 'center' }}>
                    <span style={{ color: '#9ca3af', fontSize: '12px' }}>Focus Member:</span>
                    {members.map(m => {
                        const isFocused = focusedMemberId === m.id;
                        return (
                            <button
                                key={m.id} onClick={() => setFocusedMemberId(isFocused ? null : m.id)}
                                style={{ background: isFocused ? 'rgba(255,255,255,0.1)' : 'transparent', border: isFocused ? '1px solid #6b7280' : '1px solid transparent', borderRadius: '4px', padding: '4px 8px', color: isFocused ? '#fff' : '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '12px', transition: 'all 0.2s' }}
                            >
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#9ca3af', marginRight: '6px', opacity: 0.8 }} />
                                {m.name}
                            </button>
                        );
                    })}
                </div>
            )}

            {data && chartData.length > 0 && currentDisplayPoint && (
                <div style={{ marginTop: '20px', padding: '15px', background: '#1f2937', borderRadius: '8px', borderLeft: '4px solid #e6c87a' }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#e6c87a' }}>Current Guidance ({currentDisplayPoint.time})</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <strong>Status:</strong> <span style={{ color: gateColors[currentDisplayPoint.gate] || '#fff', fontWeight: 'bold' }}>{currentDisplayPoint.gate}</span>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <strong>Strategic Context:</strong>
                            <div style={{ marginTop: '5px', fontStyle: 'italic', color: '#e6c87a' }}>
                                {interpretations && currentDisplayPoint.guidance_key ?
                                    (interpretations.guidance[currentDisplayPoint.guidance_key.split('.')[0]]?.[currentDisplayPoint.guidance_key.split('.')[1]]?.[currentDisplayPoint.guidance_key.split('.')[2]] || currentDisplayPoint.guidance_key)
                                    : "Loading..."
                                }
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <PhaseTraceDrawer
                isOpen={drawerState.isOpen}
                onClose={() => setDrawerState(prev => ({ ...prev, isOpen: false }))}
                traceData={drawerState.data}
                axis={selectedAxis}
                time={drawerState.time}
                phase={drawerState.phase}
            />

        </div>
    );
};

export default FamilyTimeline;
