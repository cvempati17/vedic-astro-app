
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import './AboutMeView.css';
import {
    getTopSubjects,
    getTopProfessions,
    getHealthAnalysis,
    getRelationshipProfile,
    getEntrepreneurshipPotential,
    getFinancialProjection,
    getPropertyAnalysis,
    getForeignTravelAnalysis,
    getSpiritualGrowth,
    getEquationOfLife
} from '../utils/aboutMeUtils';

const AboutMeView = ({ chartData, birthDate, initialSection }) => {
    const { t } = useTranslation();
    const [activeSection, setActiveSection] = useState(initialSection || 'subjects');
    const [financeData, setFinanceData] = useState([]);

    useEffect(() => {
        if (initialSection) {
            setActiveSection(initialSection);
        }
    }, [initialSection]);

    // --- Data Calculation ---
    // Memoize these calculations
    const subjects = useMemo(() => getTopSubjects(chartData), [chartData]);
    const professions = useMemo(() => getTopProfessions(chartData), [chartData]);
    const health = useMemo(() => getHealthAnalysis(chartData), [chartData]);
    const relationship = useMemo(() => getRelationshipProfile(chartData), [chartData]);
    const enterprise = useMemo(() => getEntrepreneurshipPotential(chartData), [chartData]);
    const properties = useMemo(() => getPropertyAnalysis(chartData), [chartData]);
    const travel = useMemo(() => getForeignTravelAnalysis(chartData, birthDate), [chartData, birthDate]);
    const spiritual = useMemo(() => getSpiritualGrowth(chartData), [chartData]);
    const eol = useMemo(() => getEquationOfLife(chartData), [chartData]);

    // Finance logic needs to be stateful for editing
    useEffect(() => {
        const initialData = getFinancialProjection(chartData, birthDate);
        setFinanceData(initialData);
    }, [chartData, birthDate]);

    const handleFinanceChange = (index, value) => {
        const newData = [...financeData];
        newData[index].userValue = value;

        // Simple Auto-fill Logic:
        // If user enters a value at index i, auto-fill i+1 to end with a growth rate (e.g. 15% every 3 years)
        if (value && !isNaN(value)) {
            const numVal = parseFloat(value);
            for (let j = index + 1; j < newData.length; j++) {
                // Growth assumption: 15% every 3 years
                const prevVal = parseFloat(newData[j - 1].userValue || newData[j - 1].userValue === 0 ? newData[j - 1].userValue : numVal);
                // Note: dealing with user typing, this might be jumpy.
                // Let's only auto-fill EMPTY future boxes or strictly if requested.
                // "remaining boxex will be auto filled based on the current finacical numbers"
                newData[j].userValue = (prevVal * 1.15).toFixed(0);
            }
        }

        setFinanceData(newData);
    };

    // --- Render Helpers ---

    const renderRankingList = (items, keyLabelStr = 'label', keyReasonStr = 'reason') => (
        <div className="ranking-list">
            {items.map((item, idx) => (
                <div key={idx} className="ranking-item">
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div className="rank-badge">{idx + 1}</div>
                        <div className="item-details">
                            <h4>{item[keyLabelStr] || item.subject || item.title || item.value || item.type}</h4>
                            <p>{item[keyReasonStr] || item.reason}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderBodyImage = () => (
        <div className="body-container">
            <svg viewBox="0 0 100 200" className="body-silhouette">
                {/* Simplified Human Silhouette */}
                <path d="M50,10 C60,10 65,18 65,25 C65,35 55,40 50,40 C45,40 35,35 35,25 C35,18 40,10 50,10 Z" fill="none" /> {/* Head */}
                <path d="M50,40 C65,45 80,50 85,70 L90,110 L80,110 L75,70 C75,70 70,100 70,110 L50,110 L30,110 C30,100 25,70 25,70 L20,110 L10,110 L15,70 C20,50 35,45 50,40 Z" fill="none" /> {/* Torso/Arms */}
                <path d="M30,110 L30,160 L25,200 L40,200 L45,150 L50,110 L55,150 L60,200 L75,200 L70,160 L70,110 Z" fill="none" /> {/* Legs */}

                {/* Highlight Areas Logic (Mocked visual positions) */}
                {health.map((h, i) => {
                    // Crude mapping of "area" string to SVG coordinates
                    let cx = 50, cy = 50;
                    const l = h.area.toLowerCase();
                    if (l.includes('head') || l.includes('eye')) { cx = 50; cy = 20; }
                    else if (l.includes('heart') || l.includes('lung')) { cx = 50; cy = 60; }
                    else if (l.includes('stomach') || l.includes('liver') || l.includes('kidney')) { cx = 50; cy = 90; }
                    else if (l.includes('leg') || l.includes('muscle') || l.includes('joint')) { cx = 50; cy = 150; }

                    return <circle key={i} cx={cx} cy={cy} r="5" className="body-part-highlight" />
                })}
            </svg>
        </div>
    );

    // --- Content Render Switch ---
    const renderContent = () => {
        switch (activeSection) {
            case 'subjects':
                return (
                    <div>
                        <h2 className="section-title">🎓 My Subjects</h2>
                        {renderRankingList(subjects, 'subject')}
                    </div>
                );
            case 'profession':
                return (
                    <div>
                        <h2 className="section-title">💼 My Profession</h2>
                        {renderRankingList(professions, 'title')}
                    </div>
                );
            case 'health':
                return (
                    <div>
                        <h2 className="section-title">⚕️ My Health</h2>
                        {renderBodyImage()}
                        <div className="ranking-list">
                            {health.map((item, idx) => (
                                <div key={idx} className="ranking-item" style={{ borderColor: '#EF4444' }}>
                                    <div className="item-details">
                                        <h4 style={{ color: '#FCA5A5' }}>⚠️ {item.area}</h4>
                                        <p>{item.reason}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'relationship':
                return (
                    <div>
                        <h2 className="section-title">❤️ My Relationship</h2>
                        <p style={{ marginBottom: '15px' }}>Ideal Partner Characteristics:</p>
                        {renderRankingList(relationship, 'value')}
                    </div>
                );
            case 'enterprise':
                return (
                    <div>
                        <h2 className="section-title">🚀 My Enterprise</h2>
                        <div className="ranking-item" style={{ marginBottom: '20px', background: enterprise.capable ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }}>
                            <div className="item-details">
                                <h4>Entrepreneurial Potential: {enterprise.capable ? 'HIGH' : 'LOW'}</h4>
                                <p>{enterprise.reason}</p>
                            </div>
                        </div>
                        {enterprise.capable && (
                            <>
                                <h3>Recommended Industries</h3>
                                {renderRankingList(enterprise.industries, 'name')}
                            </>
                        )}
                    </div>
                );
            case 'finances':
                return (
                    <div>
                        <h2 className="section-title">💰 My Finances (Projections)</h2>
                        <p style={{ fontSize: '0.9rem', color: '#aaa', marginBottom: '1rem' }}>
                            Enter your financial status at your current age to see projections.
                        </p>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="finance-table">
                                <thead>
                                    <tr>
                                        <th>Age</th>
                                        <th>Year</th>
                                        <th>Astrological Trend</th>
                                        <th>Reason</th>
                                        <th>Financial Status (Editable)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {financeData.map((row, idx) => (
                                        <tr key={idx}>
                                            <td>{row.age}</td>
                                            <td>{row.year}</td>
                                            <td>
                                                {/* Star Rating for Trend */}
                                                <span style={{ color: '#FCD34D' }}>{'★'.repeat(Math.round(row.score / 2))}</span>
                                            </td>
                                            <td>{row.reason}</td>
                                            <td>
                                                <input
                                                    type="number"
                                                    className="finance-input"
                                                    placeholder="Enter amount"
                                                    value={row.userValue}
                                                    onChange={(e) => handleFinanceChange(idx, e.target.value)}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'properties':
                return (
                    <div>
                        <h2 className="section-title">🏠 My Properties</h2>
                        <div className="eol-grid">
                            <div className="eol-card">
                                <h4>Inheritance</h4>
                                <p>{properties.inheritance}</p>
                            </div>
                            <div className="eol-card">
                                <h4>Self-Earned</h4>
                                <p>{properties.selfEarned}</p>
                            </div>
                        </div>
                        <div className="ranking-item" style={{ marginTop: '20px' }}>
                            <p>{properties.reason}</p>
                            <p><strong>Correction:</strong> {properties.prediction}</p>
                        </div>
                    </div>
                );
            case 'travel':
                return (
                    <div>
                        <h2 className="section-title">✈️ My Foreign Travel & Settlement</h2>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                            <div className="ranking-item" style={{ flexDirection: 'column', alignItems: 'flex-start', background: 'rgba(16, 185, 129, 0.1)' }}>
                                <h3 style={{ color: '#10B981', margin: '0 0 10px 0' }}>Overall Potential: {travel.ranking}</h3>
                                <p>{travel.reason}</p>
                            </div>
                            <div className="ranking-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                                <h3>🔮 Duration & Settlement</h3>
                                <ul style={{ margin: 0, paddingLeft: '20px', color: '#ccc' }}>
                                    {travel.rules?.durations.map((d, i) => (
                                        <li key={i} style={{ marginBottom: '5px' }}>
                                            <strong style={{ color: '#FCD34D' }}>{d.type}:</strong> {d.source}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <h3 className="section-title" style={{ fontSize: '1.2rem', marginTop: '30px' }}>Likelihood Over Time (Dasha Analysis)</h3>
                        <div style={{ height: '300px', width: '100%', marginBottom: '20px', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px' }}>
                            <ResponsiveContainer>
                                <AreaChart data={travel.graphData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorTravel" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#C5A059" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#C5A059" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="date" stroke="#9CA3AF" />
                                    <YAxis stroke="#9CA3AF" label={{ value: 'Intensity', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }} />
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #C5A059', color: '#F3F4F6' }}
                                        labelStyle={{ color: '#FCD34D' }}
                                    />
                                    <Area type="monotone" dataKey="score" stroke="#C5A059" fillOpacity={1} fill="url(#colorTravel)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: '#9CA3AF', marginBottom: '30px' }}>
                            * Graph shows the intensity of travel/foreign influence during major Dasha periods. Higher peaks indicate stronger possibilities.
                        </p>

                        <div className="ranking-list" style={{ marginTop: '20px' }}>
                            <h3 className="section-title" style={{ fontSize: '1.2rem' }}>Key Influencers (Houses & Planets)</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
                                {travel.rules?.houses.map((h, i) => (
                                    <div key={i} className="ranking-item">
                                        <div className="item-details">
                                            <h4 style={{ color: '#FCD34D' }}>{h.id} House</h4>
                                            <p>{h.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <h3 style={{ marginTop: '30px', borderBottom: '1px solid #374151', paddingBottom: '10px' }}>Purpose of Travel Analysis</h3>
                        {renderRankingList(travel.types, 'type', 'reason')}
                    </div>
                );
            case 'spiritual':
                return (
                    <div>
                        <h2 className="section-title">🕉️ Spiritual Growth</h2>
                        <div style={{ height: '300px', width: '100%', marginBottom: '20px' }}>
                            <ResponsiveContainer>
                                <AreaChart data={spiritual}>
                                    <defs>
                                        <linearGradient id="colorSpirit" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="age" stroke="#ccc" />
                                    <YAxis stroke="#ccc" />
                                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                    <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #444' }} />
                                    <Area type="monotone" dataKey="intensity" stroke="#8884d8" fillOpacity={1} fill="url(#colorSpirit)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        {renderRankingList(spiritual, 'reason', 'age')}
                    </div>
                );
            case 'eol':
                return (
                    <div>
                        <h2 className="section-title">⚖️ My Equation of Life (EOL)</h2>
                        <div className="eol-grid" style={{ marginBottom: '20px' }}>
                            <div className="eol-card">
                                <h4>Best Aspect</h4>
                                <h3 style={{ color: '#10B981' }}>{eol.bestAspect}</h3>
                            </div>
                            <div className="eol-card">
                                <h4>Challenging Aspect</h4>
                                <h3 style={{ color: '#EF4444' }}>{eol.worstAspect}</h3>
                            </div>
                        </div>

                        <h3>Priorities Analysis</h3>
                        <div className="ranking-list" style={{ marginBottom: '20px' }}>
                            {eol.priorities.map((p, i) => (
                                <div key={i} className="ranking-item">
                                    <div className="item-details">
                                        <h4>{p.pair}</h4>
                                        <p>Winner: <strong style={{ color: '#FCD34D' }}>{p.winner}</strong> (Diff: {p.score})</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <h3>Life Priorities Ranking</h3>
                        {renderRankingList(eol.ranking, 'aspect')}
                    </div>
                );
            default:
                return <div>Select a section</div>;
        }
    };

    return (
        <div className="about-me-container">
            <div className="about-me-sidebar">
                {[
                    { key: 'subjects', icon: '🎓', label: 'My Subjects' },
                    { key: 'profession', icon: '💼', label: 'My Profession' },
                    { key: 'health', icon: '⚕️', label: 'My Health' },
                    { key: 'relationship', icon: '❤️', label: 'My Relationship' },
                    { key: 'enterprise', icon: '🚀', label: 'My Enterprise' },
                    { key: 'finances', icon: '💰', label: 'My Finances' },
                    { key: 'properties', icon: '🏠', label: 'My Properties' },
                    { key: 'travel', icon: '✈️', label: 'My For. Travel' },
                    { key: 'spiritual', icon: '🕉️', label: 'Spiritual Growth' },
                    { key: 'eol', icon: '⚖️', label: 'Equation of Life' }
                ].map(item => (
                    <div
                        key={item.key}
                        className={`about-me-nav-item ${activeSection === item.key ? 'active' : ''}`}
                        onClick={() => setActiveSection(item.key)}
                    >
                        <span>{item.icon}</span>
                        {item.label}
                    </div>
                ))}
            </div>
            <div className="about-me-content">
                {renderContent()}
            </div>
        </div>
    );
};

export default AboutMeView;
