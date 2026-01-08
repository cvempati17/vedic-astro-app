import React, { useState, useEffect, useRef } from 'react';
import PhaseTraceDrawer from './PhaseTraceDrawer';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, ReferenceArea, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

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

const MEMBER_COLORS = ['#60a5fa', '#34d399', '#f87171', '#a78bfa', '#fbbf24', '#f472b6'];

const FamilyTimeline = ({ members, familyId }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedAxis, setSelectedAxis] = useState('career');
    const [interpretations, setInterpretations] = useState(null);
    const [language, setLanguage] = useState('en');

    // Trace Drawer State
    const [drawerState, setDrawerState] = useState({ isOpen: false, data: null, time: null, phase: null, subjectType: null, memberId: null });

    const [focusedMemberId, setFocusedMemberId] = useState(null);
    const [hoveredMemberId, setHoveredMemberId] = useState(null);
    const [hoveringFamilyLine, setHoveringFamilyLine] = useState(false);
    const [activePoint, setActivePoint] = useState(null);

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
            const memberIdParam = params.get("memberId");

            if (axisParam && periodParam) {
                if (axisParam !== selectedAxis) {
                    setSelectedAxis(axisParam);
                }
                const traceArr = data.trace_layer?.axes?.[axisParam];
                const trace = traceArr?.find(tr => tr.time === periodParam);
                if (trace) {
                    setDrawerState({ isOpen: true, data: trace, time: periodParam, phase: trace.phase_resolution, subjectType: memberIdParam ? 'member' : 'family', memberId: memberIdParam });
                }
            }
        }
    }, [data]);

    const getAxisData = () => {
        if (!data || !data.effective_intensity_layer) return [];
        const effLayer = data.effective_intensity_layer.axes[selectedAxis] || [];
        const transLayer = data.transit_layer.axes[selectedAxis] || [];
        const guideLayer = data.guidance_layer.axes[selectedAxis] || [];
        // ROBUST: Ensure we access the correct trace point by Time
        const traceLayer = data.trace_layer?.axes?.[selectedAxis] || [];

        return effLayer.map((pt, idx) => {
            const tr = transLayer[idx] || {};
            const gd = guideLayer[idx] || {};

            // ROBUST: Find by time to avoid index misalignment
            const trace = traceLayer.find(t => t.time === pt.time) || {};

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
                familyBase: trace.family_intensity !== undefined ? trace.family_intensity : (pt.family_intensity || 0),
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

    const axisSpecificSemantics = {
        wealth: {
            HOLD: "Resource stability is supported, but expansion is limited. Conservation and steady management are favored over aggressive growth.",
            BLOCK: "External resource flow may be restricted. Focus on consolidating existing assets rather than seeking new gains.",
            OPEN: "Conditions favor material expansion and conversion. Strategic investments and resource acquisition are supported."
        },
        career: {
            HOLD: "Professional momentum is stable but slow. Focus on reliable performance rather than seeking promotion or visibility.",
        }
    };

    // --- HUD COMPONENT ---
    const InfoHUD = () => {
        const pt = activePoint ? activePoint.payload : (chartData.length > 0 ? chartData[0] : null);
        if (!pt) return null;

        const gate = pt.gate;

        const getMemberColor = (id) => {
            const index = members.findIndex(m => m.id === id);
            return index >= 0 ? MEMBER_COLORS[index % MEMBER_COLORS.length] : '#9ca3af';
        };

        let subjectId = null;
        if (hoveringFamilyLine) {
            subjectId = null;
        } else {
            subjectId = hoveredMemberId || focusedMemberId;
        }

        const subjectMember = subjectId ? members.find(m => m.id === subjectId) : null;
        const subjectColor = subjectMember ? getMemberColor(subjectMember.id) : '#e6e6e6';

        const phaseKey = `FM_PHASE_${gate}`;
        const genericSemantics = interpretations?.governance?.phase_semantics?.phases?.[phaseKey];
        const specificText = axisSpecificSemantics[selectedAxis]?.[gate];
        const explanationText = specificText || genericSemantics?.short_explanation;
        const phaseColor = gateColors[gate] || '#ccc';

        const dateStr = pt.time;
        const nowStr = new Date().toISOString().slice(0, 7);
        let timeContext = "";
        if (dateStr > nowStr) timeContext = "(Future)";
        if (dateStr < nowStr) timeContext = "(Historical)";

        const [showComparison, setShowComparison] = useState(false);
        useEffect(() => { setShowComparison(false); }, [subjectId, pt.time]);

        return (
            <div style={{
                marginBottom: '10px',
                background: 'rgba(31, 41, 55, 0.4)',
                border: '1px solid #4b5563',
                borderRadius: '8px',
                padding: '10px 15px',
                color: '#e6e6e6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '15px',
                minHeight: '60px'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#e6e6e6' }}>{pt.time} <span style={{ fontSize: '12px', fontWeight: 'normal', opacity: 0.7 }}>{timeContext}</span></div>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', color: phaseColor }}>{gate} PHASE</div>
                </div>

                <div style={{ flex: 1, padding: '0 10px', borderLeft: '1px solid #4b5563', borderRight: '1px solid #4b5563' }}>
                    {subjectMember ? (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '14px', fontWeight: 'bold', color: subjectColor }}>{subjectMember.name}</span>
                                <span style={{ fontSize: '12px', background: '#374151', padding: '1px 5px', borderRadius: '4px' }}>Intensity: {pt[`member_${subjectId}`]?.toFixed(0)}</span>
                            </div>
                            {explanationText && <div style={{ fontSize: '11px', color: '#9ca3af', fontStyle: 'italic', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '400px' }}>{explanationText}</div>}

                            {!showComparison && members.length > 1 && (
                                <button onClick={() => setShowComparison(true)} style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: '10px', cursor: 'pointer', padding: 0, marginTop: '4px' }}>Compare family members ▸</button>
                            )}
                            {showComparison && (
                                <div style={{ marginTop: '4px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {members.filter(m => m.id !== subjectMember.id).map(m => (
                                        <div key={m.id} style={{ fontSize: '10px', color: '#d1d5db', background: 'rgba(0,0,0,0.3)', padding: '2px 4px', borderRadius: '3px', borderLeft: `2px solid ${getMemberColor(m.id)}` }}>
                                            {m.name}: <strong>{pt[`member_${m.id}`]?.toFixed(0)}</strong>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#e6e6e6' }}>Family Context</span>
                                <span style={{ fontSize: '12px', background: '#374151', padding: '1px 5px', borderRadius: '4px' }}>Avg Intensity: {Math.round(pt.familyBase)}</span>
                            </div>
                            <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>Aggregate family timeline view. Select a member to see specifics.</div>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {subjectMember && (
                        <button
                            onClick={() => {
                                const trace = data.trace_layer?.axes?.[selectedAxis]?.find(t => t.time === pt.time);
                                if (trace) {
                                    setDrawerState({ isOpen: true, data: trace, time: pt.time, phase: trace.phase_resolution, subjectType: 'member', memberId: subjectMember.id, memberName: subjectMember.name, comparisonData: null });
                                }
                            }}
                            style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid #4b5563', borderRadius: '4px', padding: '6px 12px', color: '#e5e7eb', fontSize: '12px', cursor: 'pointer' }}
                        >
                            Analyze Trace
                        </button>
                    )}
                </div>
            </div>
        );
    };

    if (loading) return <div style={{ color: '#fff' }}>Loading Time Engine...</div>;
    if (error) return <div style={{ color: '#ef4444' }}>{error}</div>;

    const currentDisplayPoint = activePoint ? activePoint.payload : (chartData.length > 0 ? chartData[0] : null);

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

            {data && (
                <>
                    <InfoHUD />

                    <div style={{ height: '400px', background: '#151827', padding: '10px', borderRadius: '8px', position: 'relative' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={chartData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                onMouseMove={(e) => {
                                    if (e && e.activeLabel) {
                                        const point = chartData.find(p => p.time === e.activeLabel);
                                        if (point) {
                                            setActivePoint({ payload: point, label: point.time });
                                        }
                                    }
                                }}
                                style={{ cursor: 'crosshair' }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#2e324a" />
                                <XAxis dataKey="time" stroke="#9ca3af" />
                                <YAxis domain={[0, 140]} stroke="#9ca3af" label={{ value: 'Effective Intensity', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} />

                                <Tooltip content={() => null} cursor={{ stroke: '#9ca3af', strokeWidth: 1 }} />

                                {getGateRegions().map((r, i) => (
                                    <ReferenceArea key={i} x1={r.start} x2={r.end} fill={gateColors[r.gate] || '#333'} fillOpacity={0.15} />
                                ))}

                                {members && members.map((m, idx) => {
                                    const isFocused = focusedMemberId === m.id;
                                    const isDimmed = focusedMemberId && !isFocused;
                                    const opacity = isDimmed ? 0.3 : 1;
                                    const width = isFocused ? 3 : 1;
                                    const color = MEMBER_COLORS[idx % MEMBER_COLORS.length]; // Stable Color

                                    return (
                                        <Line
                                            key={m.id} type="monotone" dataKey={`member_${m.id}`}
                                            stroke={color} strokeOpacity={opacity} strokeWidth={width} dot={false}
                                            name={m.name} strokeDasharray={isFocused ? "0" : "3 3"}
                                            onMouseEnter={() => {
                                                setHoveringFamilyLine(false);
                                                setHoveredMemberId(m.id);
                                            }}
                                            onMouseLeave={() => setHoveredMemberId(null)}
                                            onClick={() => setFocusedMemberId(m.id)}
                                            isAnimationActive={false} activeDot={false}
                                        />
                                    );
                                })}

                                <Line
                                    type="monotone" dataKey="familyBase" stroke="#6b7280" strokeDasharray="5 5" strokeWidth={2} dot={false}
                                    name="Family Base" isAnimationActive={false} activeDot={false}
                                    onMouseEnter={() => {
                                        setHoveringFamilyLine(true);
                                        setHoveredMemberId(null);
                                    }}
                                    onMouseLeave={() => setHoveringFamilyLine(false)}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </>
            )}

            {members && (
                <div style={{ display: 'flex', gap: '15px', marginTop: '10px', padding: '10px', background: '#111827', borderRadius: '8px', alignItems: 'center' }}>
                    <span style={{ color: '#9ca3af', fontSize: '12px' }}>Focus Member:</span>
                    {members.map((m, idx) => {
                        const isFocused = focusedMemberId === m.id;
                        const color = MEMBER_COLORS[idx % MEMBER_COLORS.length];
                        return (
                            <button
                                key={m.id} onClick={() => setFocusedMemberId(isFocused ? null : m.id)}
                                style={{
                                    background: isFocused ? 'rgba(255,255,255,0.05)' : 'transparent',
                                    border: `1px solid ${isFocused ? color : 'transparent'}`,
                                    borderRadius: '4px', padding: '4px 10px',
                                    color: isFocused ? '#fff' : '#9ca3af',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '12px', transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, marginRight: '8px' }} />
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
                comparisonData={drawerState.comparisonData} // Pass it if we have it
                axis={selectedAxis}
                time={drawerState.time}
                phase={drawerState.phase}
                subjectType={drawerState.subjectType}
                memberId={drawerState.memberId}
                memberName={drawerState.memberName}
            />

        </div>
    );
};

export default FamilyTimeline;
