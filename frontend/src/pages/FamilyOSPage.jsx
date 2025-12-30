import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { calculateAstroSignals, generateFamilyMatrix, generateOSReport } from '../utils/familyOSUtils';
import './PalmistryPage.css'; // Maintaining for global resets if any

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const RELATIONSHIPS = [
    'Husband', 'Wife',
    'Father', 'Mother',
    'Son', 'Daughter',
    'Brother', 'Sister',
    'Grandfather', 'Grandmother'
];

const FamilyOSPage = ({ onBack }) => {
    const [savedCharts, setSavedCharts] = useState([]);
    const [inputRows, setInputRows] = useState([{ id: Date.now(), chartId: '', relation: '' }]);
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
            // Merge logic (simplified)
            // Deduplicate based on _id if possible, or just concat
            const allCharts = [...cloudCharts, ...localCharts];
            // Remove potential duplicates by _id
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
        const newRows = inputRows.map(row => {
            if (row.id === id) {
                return { ...row, [field]: value };
            }
            return row;
        });
        setInputRows(newRows);
    };

    const generateOS = async () => {
        setLoading(true);
        setError('');
        try {
            // Filter valid rows
            const validRows = inputRows.filter(r => r.chartId && r.relation);
            if (validRows.length < 1) throw new Error("Please select at least one family member.");

            const processedMembers = [];

            for (const row of validRows) {
                const chart = savedCharts.find(c => c._id === row.chartId);
                if (!chart) continue;

                let chartData = chart.chartData;

                // Validation & Calculation logic
                // Check if missing or API format (Capitalized)
                if (!chartData || (!chartData.planets && !chartData.Sun)) {
                    try {
                        const payload = {
                            date: chart.dateOfBirth,
                            time: chart.timeOfBirth,
                            latitude: chart.placeOfBirth.lat,
                            longitude: chart.placeOfBirth.lng,
                            timezone: chart.placeOfBirth.timezone,
                            ayanamsa: 'lahiri' // Default
                        };
                        const res = await axios.post(`${API_URL}/api/calculate`, payload);
                        if (res.data.success) {
                            chartData = res.data.data;
                        }
                    } catch (err) {
                        console.error(`Failed to calculate for ${chart.name}`, err);
                    }
                }

                if (chartData) {
                    // Normalize Data Structure
                    let normalizedData = chartData;

                    // Check if data is in API format (Capitalized keys, no planets wrapper)
                    if (!chartData.planets && chartData.Sun) {
                        normalizedData = {
                            planets: {},
                            ascendant: chartData.Ascendant?.longitude || chartData.Ascendant || 0
                        };
                        ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'].forEach(p => {
                            const val = chartData[p];
                            normalizedData.planets[p.toLowerCase()] = val?.longitude ?? val;
                        });
                    }

                    if (normalizedData.planets && normalizedData.ascendant !== undefined) {
                        try {
                            const signals = calculateAstroSignals(normalizedData);
                            processedMembers.push({
                                _id: chart._id,
                                name: chart.name,
                                relation: row.relation,
                                chartData: normalizedData,
                                signals
                            });
                        } catch (sigErr) {
                            console.error("Signal calculation failed:", sigErr);
                        }
                    }
                }
            }

            if (processedMembers.length < 1) {
                throw new Error("Could not calculate signals for selected members.");
            }

            const { Matrix, AssignmentMeta } = generateFamilyMatrix(processedMembers);
            const reportContent = generateOSReport(Matrix, processedMembers);

            setReport({
                matrix: Matrix,
                meta: AssignmentMeta,
                textContent: reportContent,
                members: processedMembers
            });

        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to generate Family OS.");
        } finally {
            setLoading(false);
        }
    };

    // --- STYLES ---
    const pageStyle = {
        background: '#0f1220',
        color: '#e6e6e6',
        fontFamily: 'Arial, sans-serif',
        minHeight: '100vh',
        padding: '20px'
    };

    // ... (keep previously defined styles like h1Style, tableStyle, etc. - implied reuse if not changing) ...
    // Re-declaring for clarity in this replacement block as the user asked for full file updates often but I am doing block.
    // I will stick to updating the logic parts.

    // Helper for Card rendering
    const renderMemberCard = (role, members, meta) => {
        const m = meta[role];
        return (
            <div style={{ background: '#0f1324', border: '1px solid #2a2f4a', borderRadius: '8px', padding: '15px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ color: '#e6c87a', fontWeight: 'bold', fontSize: '1.1em', marginBottom: '5px' }}>{role}</div>
                <div style={{ fontSize: '0.8em', color: '#6c728f', marginBottom: '10px' }}>
                    {role === 'Architect' && 'Strategy & Authority'}
                    {role === 'Protector' && 'Safety & Support'}
                    {role === 'Stabilizer' && 'Continuity & Grounding'}
                    {role === 'Connector' && 'Emotional Flow'}
                </div>
                <div style={{ flex: 1 }}>
                    {members && members.length > 0 ? (
                        members.map(name => (
                            <div key={name} style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '4px', marginBottom: '5px' }}>
                                <div style={{ fontSize: '1em', fontWeight: 'bold' }}>{name}</div>
                                {m && m.name === name && (
                                    <div style={{ marginTop: '5px' }}>
                                        <span style={{
                                            fontSize: '0.7em',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            background: m.reason.startsWith('Resolution') ? '#2e1065' : '#064e3b',
                                            color: m.reason.startsWith('Resolution') ? '#d8b4fe' : '#6ee7b7',
                                            border: `1px solid ${m.reason.startsWith('Resolution') ? '#581c87' : '#065f46'}`
                                        }}>
                                            {m.reason.startsWith('Resolution') ? 'Resolved by System Rule' : 'Assigned by Astrology'}
                                        </span>
                                        <div style={{ fontSize: '0.7em', color: '#64748b', marginTop: '4px', fontStyle: 'italic' }}>
                                            {m.reason}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div style={{ color: '#ef4444', fontStyle: 'italic', fontSize: '0.9em', border: '1px dashed #ef4444', padding: '10px', borderRadius: '4px' }}>
                            Unassigned
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const h1Style = { color: '#e6c87a', textAlign: 'center' };
    const buttonStyle = { background: '#151827', color: '#e6e6e6', border: '1px solid #2e324a', padding: '8px', cursor: 'pointer' };

    if (report) {
        return (
            <div style={pageStyle}>
                <div style={{ borderBottom: '1px solid #22273d', paddingBottom: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
                    <button style={buttonStyle} onClick={() => setReport(null)}>← Format Selection</button>
                    <h1 style={{ ...h1Style, margin: '0 0 0 20px', fontSize: '24px' }}>Family OS Report v1.0</h1>
                </div>

                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

                    <Section title="1. Family Philosophy">
                        <p>{report.textContent.philosophy}</p>
                    </Section>

                    <Section title="2. Family Matrix">
                        <div className="grid-os">
                            {renderMemberCard('Architect', report.matrix.Architect, report.meta)}
                            {renderMemberCard('Protector', report.matrix.Protector, report.meta)}
                            {renderMemberCard('Stabilizer', report.matrix.Stabilizer, report.meta)}
                            {renderMemberCard('Connector', report.matrix.Connector, report.meta)}
                        </div>
                    </Section>

                    <div className="grid-os" style={{ gridTemplateColumns: '1fr 1fr' }}>
                        <Section title="3. Responsibility Distribution">
                            <p dangerouslySetInnerHTML={{ __html: report.textContent.distribution }}></p>
                        </Section>
                        <Section title="4. Emotional Architecture">
                            <p dangerouslySetInnerHTML={{ __html: report.textContent.emotional }}></p>
                        </Section>
                    </div>

                    <Section title="5. Decision Framework">
                        <p dangerouslySetInnerHTML={{ __html: report.textContent.decision }}></p>
                    </Section>

                    <div className="grid-os" style={{ gridTemplateColumns: '1fr 1fr' }}>
                        <Section title="6. Money & Work Model">
                            <p dangerouslySetInnerHTML={{ __html: report.textContent.money }}></p>
                        </Section>
                        <Section title="7. Boundaries & Dependency">
                            <p dangerouslySetInnerHTML={{ __html: report.textContent.boundaries }}></p>
                        </Section>
                    </div>

                    <Section title="8. Conflict & Repair">
                        <p dangerouslySetInnerHTML={{ __html: report.textContent.conflict }}></p>
                    </Section>

                    <div className="grid-os" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                        <Section title="9. Time Evolution">
                            <p dangerouslySetInnerHTML={{ __html: report.textContent.time }}></p>
                        </Section>
                        <Section title="10. Legacy">
                            <p dangerouslySetInnerHTML={{ __html: report.textContent.legacy }}></p>
                        </Section>
                        <Section title="11. Care & Aging">
                            <p dangerouslySetInnerHTML={{ __html: report.textContent.care }}></p>
                        </Section>
                    </div>

                    <Section title="12. Closure">
                        <p dangerouslySetInnerHTML={{ __html: report.textContent.closure }}></p>
                    </Section>

                    <Section title="System Map (Raw Signals)">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                            {report.members.map(m => (
                                <div key={m._id} style={{ background: '#0f1324', padding: '10px', borderRadius: '5px', border: '1px solid #2a2f4a' }}>
                                    <div style={{ fontWeight: 'bold', color: '#e6c87a' }}>{m.name}</div>
                                    <div style={{ fontSize: '0.8em', color: '#94a3b8' }}>{m.relation}</div>
                                    <div style={{ marginTop: '5px', fontSize: '0.75em' }}>
                                        <div>Auth: {m.signals.authority_capacity}</div>
                                        <div>Stab: {m.signals.stability_index.toFixed(1)}</div>
                                        <div>Supp: {m.signals.support_style}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Section>

                    <div style={{ textAlign: 'center', padding: '20px', color: '#6c728f', fontSize: '0.8em', borderTop: '1px solid #22273d', marginTop: '30px' }}>
                        © Astrogravity • Family OS v1.0
                    </div>

                </div>
            </div>
        );
    }

    const tableStyle = {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '20px',
        background: '#0f1220'
    };

    const thTdStyle = {
        border: '1px solid #2e324a',
        padding: '10px',
        textAlign: 'center'
    };

    const inputStyle = {
        background: '#151827',
        color: '#e6e6e6',
        border: '1px solid #2e324a',
        padding: '8px',
        width: '90%'
    };

    const primaryButtonStyle = {
        ...buttonStyle,
        background: 'linear-gradient(90deg,#e6c87a,#bfa24a)',
        color: '#0f1220',
        fontWeight: 'bold',
        fontSize: '16px',
        padding: '12px 24px',
        marginTop: '20px'
    };

    return (
        <div style={pageStyle}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                <button style={buttonStyle} onClick={onBack}>← Back</button>
                <div style={{ flex: 1, textAlign: 'center' }}>
                    <h1 style={{ ...h1Style, margin: 0 }}>Family OS – Input (v1.0)</h1>
                </div>
                <div style={{ width: '60px' }}></div> {/* Spacer for centering */}
            </div>

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
                                    <select
                                        style={inputStyle}
                                        value={row.chartId}
                                        onChange={(e) => updateRow(row.id, 'chartId', e.target.value)}
                                    >
                                        <option value="">Select Person</option>
                                        {savedCharts.map(chart => (
                                            <option key={chart._id} value={chart._id}>
                                                {chart.name} - {chart.placeOfBirth?.city || ''}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td style={thTdStyle}>
                                    <select
                                        style={inputStyle}
                                        value={row.relation}
                                        onChange={(e) => updateRow(row.id, 'relation', e.target.value)}
                                    >
                                        <option value="">Relationship</option>
                                        {RELATIONSHIPS.map(rel => (
                                            <option key={rel} value={rel}>{rel}</option>
                                        ))}
                                    </select>
                                </td>
                                <td style={thTdStyle}>
                                    {index === inputRows.length - 1 ? (
                                        <button style={buttonStyle} onClick={addRow}>Add</button>
                                    ) : (
                                        <button style={{ ...buttonStyle, color: '#ff6b6b' }} onClick={() => removeRow(row.id)}>Remove</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div style={{ textAlign: 'center', marginTop: '30px' }}>
                    <button style={primaryButtonStyle} onClick={generateOS} disabled={loading}>
                        {loading ? "Generating..." : "Generate Family OS Report"}
                    </button>
                </div>

                <div style={{ marginTop: '12px', color: '#9fa6c4', fontSize: '13px', textAlign: 'center' }}>
                    Astrology-driven Family OS report (Matrix, Maps, Dashboards).
                </div>

                {error && <div style={{ color: '#ef4444', textAlign: 'center', marginTop: '10px' }}>{error}</div>}
            </div>
        </div>
    );
};

const Section = ({ title, children }) => (
    <div style={{ background: '#12162a', margin: '20px 0', border: '1px solid #22273d', borderRadius: '10px', padding: '20px' }}>
        <h2 style={{ color: '#e6c87a', marginTop: 0, borderBottom: '1px solid #22273d', paddingBottom: '10px' }}>{title}</h2>
        <div style={{ color: '#d7d9e0', lineHeight: '1.6' }}>{children}</div>
    </div>
);

const Card = ({ title, members, desc }) => (
    <div style={{ background: '#0f1324', border: '1px solid #2a2f4a', borderRadius: '8px', padding: '15px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ color: '#e6c87a', fontWeight: 'bold', fontSize: '1.1em', marginBottom: '5px' }}>{title}</div>
        <div style={{ fontSize: '0.8em', color: '#6c728f', marginBottom: '10px' }}>{desc}</div>
        <div style={{ flex: 1 }}>
            {members && members.length > 0 ? (
                members.map(m => <div key={m} style={{ background: 'rgba(255,255,255,0.1)', padding: '5px 10px', borderRadius: '4px', marginBottom: '5px', fontSize: '0.9em' }}>{m}</div>)
            ) : (
                <div style={{ color: '#475569', fontStyle: 'italic' }}>Unassigned</div>
            )}
        </div>
    </div>
);

// CSS Grid Style injected purely for this component usage
const style = document.createElement('style');
style.textContent = `
    .grid-os { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }
`;
document.head.appendChild(style);

export default FamilyOSPage;
