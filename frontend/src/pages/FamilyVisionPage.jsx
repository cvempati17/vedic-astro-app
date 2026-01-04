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
    // Family Management State
    const [savedFamilies, setSavedFamilies] = useState([]);
    const [familyName, setFamilyName] = useState('');
    const [selectedFamilyId, setSelectedFamilyId] = useState('');
    const [report, setReport] = useState(null);
    const [missionReport, setMissionReport] = useState(null);
    const [philosophyReport, setPhilosophyReport] = useState(null);
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

        const fetchFamilies = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/families`);
                if (res.data.success) setSavedFamilies(res.data.families);
            } catch (e) { console.error("Failed to fetch families", e); }
        };

        fetchCharts();
        fetchFamilies();
    }, []);

    const addRow = () => {
        if (inputRows.length >= 12) {
            alert("Maximum 12 persons allowed");
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

    // Helper: Prepare Members Logic
    const prepareMembers = async () => {
        const validRows = inputRows.filter(r => r.chartId && r.relation);
        if (validRows.length < 1) throw new Error("Please select at least one family member.");

        const members = [];
        for (const row of validRows) {
            const chart = savedCharts.find(c => c._id === row.chartId);
            if (!chart) continue;

            // Ensure chart data availability
            let chartData = chart.chartData;
            if (!chartData || (!chartData.planets && !chartData.Sun)) {
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
                    name: chart.name
                });
            }
        }
        return members;
    };

    const generateVision = async (members) => {
        const response = await axios.post(`${API_URL}/api/family-values/vision`, {
            family_context: {
                cultural_context: "Indian",
                family_structure: "parents_with_child"
            },
            members: members
        });

        if (response.data.success) {
            setReport(response.data.report);
            return response.data.report;
        } else {
            throw new Error(response.data.error || "Generation failed");
        }
    };

    const generateMission = async (members) => {
        const response = await axios.post(`${API_URL}/api/family-mission/mission`, {
            members: members
        });
        if (response.data.success) {
            setMissionReport(response.data.report);
            return response.data.report;
        } else {
            throw new Error(response.data.error || "Mission Generation failed");
        }
    };

    const generatePhilosophy = async (members, visionOutput, missionOutput) => {
        const response = await axios.post(`${API_URL}/api/family-philosophy/family-philosophy`, {
            members,
            visionOutput,
            missionOutput,
            familyId: 'session_' + Date.now()
        });

        if (response.data.success) {
            setPhilosophyReport(response.data.report);
        } else {
            throw new Error(response.data.error || "Philosophy Generation failed");
        }
    };

    const generateMatrix = async (members, context = {}, famIdOverride = null) => {
        const response = await axios.post(`${API_URL}/api/family-matrix`, {
            members,
            userContext: context,
            familyId: famIdOverride || 'session_' + Date.now()
        });
        if (response.data.success) {
            setMatrixReport(response.data.data.family_matrix_output);
        } else {
            throw new Error(response.data.error || "Matrix Generation failed");
        }
    };

    const [activeTab, setActiveTab] = useState('01_vision');
    const [missionError, setMissionError] = useState('');
    const [philosophyError, setPhilosophyError] = useState('');
    const [matrixReport, setMatrixReport] = useState(null);
    const [matrixError, setMatrixError] = useState('');
    const [statusMessage, setStatusMessage] = useState('');

    // Support Mode State
    const [supportModeEnabled, setSupportModeEnabled] = useState(false);
    const [showConsentModal, setShowConsentModal] = useState(false);
    const [currentMembers, setCurrentMembers] = useState([]);
    const [consentChecks, setConsentChecks] = useState({ understand: false, choose: false });

    // Trace View State
    const [traceData, setTraceData] = useState(null);
    const [showTraceModal, setShowTraceModal] = useState(false);
    const [activeTraceTab, setActiveTraceTab] = useState('planets');

    const openTrace = (axisKey) => {
        if (matrixReport?.baseline?.trace_data?.[axisKey]) {
            setTraceData(matrixReport.baseline.trace_data[axisKey]);
            setShowTraceModal(true);
            setActiveTraceTab('planets');
        }
    };

    const handleSupportToggle = () => {
        if (!supportModeEnabled) {
            // Turning ON -> Show Modal
            setShowConsentModal(true);
            setConsentChecks({ understand: false, choose: false });
        } else {
            // Turning OFF -> Disable immediately
            setSupportModeEnabled(false);
            if (currentMembers.length > 0) {
                setStatusMessage('Reverting to Diagnostic Mode...');
                setLoading(true);
                generateMatrix(currentMembers, { user_consent_explicit: false })
                    .then(() => {
                        setLoading(false);
                        setStatusMessage('');
                    })
                    .catch(err => {
                        setLoading(false);
                        setError(err.message);
                    });
            }
        }
    };

    const confirmSupportMode = () => {
        if (consentChecks.understand && consentChecks.choose) {
            setShowConsentModal(false);
            setSupportModeEnabled(true);
            if (currentMembers.length > 0) {
                setStatusMessage('Activating Support Mode...');
                setLoading(true);
                generateMatrix(currentMembers, { user_consent_explicit: true, support_mode_requested: true })
                    .then(() => {
                        setLoading(false);
                        setStatusMessage('');
                    })
                    .catch(err => {
                        setLoading(false);
                        setError(err.message);
                    });
            }
        }
    };

    // Handle "Generate Family OS Report"
    const handleGenerate = async () => {
        setLoading(true);
        setStatusMessage('Preparing User Data...');
        setError('');
        setReport(null);
        setMissionReport(null);
        setPhilosophyReport(null);
        setMatrixReport(null);
        setMissionError('');
        setPhilosophyError('');
        setMatrixError('');

        try {
            const members = await prepareMembers();
            setCurrentMembers(members);

            // 1. Run Vision
            setStatusMessage('Generating Family Vision (AI Analysis)...');
            const visionOut = await generateVision(members);

            // 2. Run Mission
            let missionOut = null;
            try {
                setStatusMessage('Generating Family Mission (Deterministic Engine)...');
                missionOut = await generateMission(members);
            } catch (e) {
                setMissionError(e.message);
            }

            // 3. Run Philosophy (Only if Vision and Mission succeeded)
            if (visionOut && missionOut) {
                try {
                    setStatusMessage('Generating Family Philosophy (Deterministic Engine)...');
                    await generatePhilosophy(members, visionOut, missionOut);
                } catch (e) {
                    const serverMsg = e.response?.data?.error || e.response?.data?.details || e.message;
                    setPhilosophyError(serverMsg);
                }
            }

            // 4. Run Matrix
            try {
                setStatusMessage('Generating Family Matrix (Database Renderer)...');

                // Check for Regression Test Targets
                let fId = null;
                if (familyName && familyName.toLowerCase().includes('thiyagarajan')) fId = 'FAM_THIYAGRAJAN_001';
                if (familyName && familyName.toLowerCase().includes('chandra')) fId = 'FAM_CHANDRA_001';

                await generateMatrix(members, {}, fId);
            } catch (e) {
                const msg = e.response?.data?.error || e.message;
                setMatrixError(msg);
            }

        } catch (err) {
            console.error(err);
            const serverMsg = err.response?.data?.error || err.message || "Failed to generate reports.";
            setError(serverMsg);
        } finally {
            setLoading(false);
            setStatusMessage('');
        }
    };

    // Handler: Load Family
    const handleLoadFamily = (famId) => {
        const fam = savedFamilies.find(f => f._id === famId);
        if (fam) {
            setSelectedFamilyId(famId);
            setFamilyName(fam.name);
            // Map members to rows. Add unique IDs if needed.
            const newRows = fam.members.map((m, idx) => ({
                id: Date.now() + idx,
                chartId: m.chartId,
                relation: m.relation
            }));
            // Pad with empty rows if needed
            while (newRows.length < 3) {
                newRows.push({ id: Date.now() + newRows.length + 100, chartId: '', relation: '' });
            }
            setInputRows(newRows);
        } else {
            setSelectedFamilyId('');
            setFamilyName('');
            setInputRows([
                { id: 1, chartId: '', relation: 'Father' },
                { id: 2, chartId: '', relation: 'Mother' },
                { id: 3, chartId: '', relation: 'Son' }
            ]);
        }
    };

    // Handler: Save & Generate
    const handleSaveAndGenerate = async () => {
        if (!familyName.trim()) {
            setError("Please enter a Family Name");
            return;
        }
        const validMembers = inputRows.filter(r => r.chartId && r.relation);
        if (validMembers.length < 2) {
            setError("Please add at least 2 family members");
            return;
        }

        setLoading(true);
        setStatusMessage("Saving Family Data...");
        setError('');

        try {
            // 1. Save
            const saveRes = await axios.post(`${API_URL}/api/families`, {
                name: familyName,
                members: validMembers
            });
            if (!saveRes.data.success) throw new Error(saveRes.data.error || "Failed to save family");

            // Update List (Upsert logic in state)
            const updatedFamily = saveRes.data.family;
            setSavedFamilies(prev => {
                const others = prev.filter(f => f._id !== updatedFamily._id); // Assuming ID match, or name match. Backend returns new obj.
                return [updatedFamily, ...others];
            });
            setSelectedFamilyId(updatedFamily._id);

            // 2. Generate
            await handleGenerate();

        } catch (err) {
            console.error(err);
            setError(err.message || "Error saving family");
            setLoading(false);
        }
    };

    // --- Helper: Matrix Score Visuals & Tooltips ---
    const getAxisTooltip = (key, score) => {
        const footer = "\n\nScores range from 0–100 and are relative indicators,\nnot absolute judgments or predictions.\nThey describe flow intensity, not outcomes.";
        let title = "", body = "", bands = [];

        if (key === 'authority_flow') {
            title = "Authority Flow";
            body = "Authority indicates how much directional influence\none person exerts over another in decisions,\nstructure, or role-setting.";
            bands = [{ m: 30, t: "Minimal authority influence" }, { m: 60, t: "Shared or situational authority" }, { m: 80, t: "Strong authority presence" }, { m: 100, t: "Centralized authority" }];
        } else if (key === 'care_flow') {
            title = "Care Flow";
            body = "Care reflects visible support, nurturing,\nand practical or emotional assistance\nflowing from one person to another.";
            bands = [{ m: 30, t: "Limited expressed care" }, { m: 60, t: "Moderate or situational care" }, { m: 80, t: "Strong care presence" }, { m: 100, t: "Highly nurturing relationship" }];
        } else if (key === 'emotional_dependency') {
            title = "Emotional Dependency";
            body = "Dependency indicates how much one person\nrelies on another for emotional stability,\nvalidation, or reassurance.";
            bands = [{ m: 30, t: "Independent emotional functioning" }, { m: 60, t: "Balanced dependency" }, { m: 80, t: "High emotional reliance" }, { m: 100, t: "Strong dependency patterns" }];
        } else if (key === 'decision_influence') {
            title = "Decision Influence";
            body = "Decision influence reflects how strongly\none person affects choices, timing,\nor direction of actions for another.";
            bands = [{ m: 30, t: "Independent decision-making" }, { m: 60, t: "Shared decision influence" }, { m: 80, t: "Strong decision influence" }, { m: 100, t: "Centralized decision control" }];
        } else if (key === 'resource_flow') {
            title = "Resource Flow";
            body = "Resource flow reflects transfer or control\nof material, time, attention, or logistical support\nfrom one person to another.";
            bands = [{ m: 30, t: "Minimal resource exchange" }, { m: 60, t: "Moderate sharing" }, { m: 80, t: "Strong resource support" }, { m: 100, t: "High dependency on resources" }];
        } else { return ""; }

        const band = bands.find(b => score <= b.m) || bands[bands.length - 1];
        return `${title}\n\n${body}\n\nA score of ${score} reflects ${band.t}.${footer}`;
    };

    // Handler: Delete Family
    const handleDeleteFamily = async () => {
        if (!selectedFamilyId) return;
        if (!window.confirm("Are you sure you want to delete this family? This action cannot be undone.")) return;

        setLoading(true);
        setStatusMessage('Deleting Family...');
        try {
            const res = await axios.delete(`${API_URL}/api/families/${selectedFamilyId}`);
            if (res.data.success) {
                setSavedFamilies(prev => prev.filter(f => f._id !== selectedFamilyId));
                setSelectedFamilyId('');
                setFamilyName('');
                setInputRows([
                    { id: 1, chartId: '', relation: 'Father' },
                    { id: 2, chartId: '', relation: 'Mother' },
                    { id: 3, chartId: '', relation: 'Son' }
                ]);
                setStatusMessage('Family deleted.');
                setTimeout(() => setStatusMessage(''), 2000);
            }
        } catch (e) {
            console.error(e);
            setError('Failed to delete family');
        } finally {
            setLoading(false);
        }
    };

    // Styles
    const pageStyle = { background: '#0f1220', color: '#e6e6e6', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif' };
    const containerStyle = { flex: 1, display: 'flex' };

    const sidebarStyle = {
        width: '250px',
        background: '#151827',
        borderRight: '1px solid #2e324a',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column'
    };

    const mainContentStyle = {
        flex: 1,
        padding: '40px',
        overflowY: 'auto'
    };

    const menuLinkStyle = (isActive) => ({
        display: 'block',
        padding: '12px 16px',
        color: isActive ? '#0f1220' : '#e6e6e6',
        background: isActive ? 'linear-gradient(90deg,#e6c87a,#bfa24a)' : 'transparent',
        borderRadius: '6px',
        marginBottom: '10px',
        textDecoration: 'none',
        fontWeight: isActive ? 'bold' : 'normal',
        cursor: 'pointer'
    });

    const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '20px', background: '#0f1220' };
    const thTdStyle = { border: '1px solid #2e324a', padding: '10px', textAlign: 'center' };
    const inputStyle = { background: '#151827', color: '#e6e6e6', border: '1px solid #2e324a', padding: '8px', width: '90%' };
    const buttonStyle = { background: '#151827', color: '#e6e6e6', border: '1px solid #2e324a', padding: '8px', cursor: 'pointer' };
    const primaryButtonStyle = { ...buttonStyle, background: 'linear-gradient(90deg,#e6c87a,#bfa24a)', color: '#0f1220', fontWeight: 'bold', padding: '12px 24px', marginTop: '20px' };

    return (
        <div style={pageStyle}>
            {/* Top Bar */}
            <div style={{ background: '#151827', borderBottom: '1px solid #2e324a', padding: '15px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <button style={{ ...buttonStyle, marginRight: '20px' }} onClick={onBack}>← Back</button>
                    <h1 style={{ color: '#e6c87a', margin: 0, fontSize: '1.2rem' }}>Family OS – V1.0</h1>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', paddingRight: '80px' }}>
                    <select
                        style={{ ...inputStyle, width: '250px', marginLeft: '20px' }}
                        value={selectedFamilyId}
                        onChange={(e) => handleLoadFamily(e.target.value)}
                    >
                        <option value="">-- Load Saved Family --</option>
                        {savedFamilies.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                    </select>
                    {selectedFamilyId && (
                        <button
                            style={{ ...buttonStyle, marginLeft: '10px', color: '#ef4444', borderColor: '#ef4444', padding: '8px 12px' }}
                            onClick={handleDeleteFamily}
                            title="Delete this family"
                        >
                            🗑️
                        </button>
                    )}
                </div>
            </div>

            <div style={containerStyle}>

                {/* 1. INPUT MODE (If no report generated yet) */}
                {!report && (
                    <div style={{ width: '100%', padding: '40px', maxWidth: '900px', margin: '0 auto' }}>
                        <h2 style={{ color: '#e6c87a', textAlign: 'center', marginBottom: '30px' }}>Input Family Details</h2>

                        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <label style={{ marginRight: '15px', color: '#e6e6e6', fontWeight: 'bold' }}>Family Name:</label>
                            <input
                                type="text"
                                style={{ ...inputStyle, width: '300px' }}
                                placeholder="Enter Family Name (e.g. The Vempati Family)"
                                value={familyName}
                                onChange={(e) => setFamilyName(e.target.value)}
                            />
                        </div>

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
                                            {index > 1 ? (
                                                <button style={{ ...buttonStyle, color: '#ff6b6b' }} onClick={() => removeRow(row.id)}>Remove</button>
                                            ) : (
                                                <span style={{ color: '#6c728f', fontSize: '0.8em' }}>Fixed</span>
                                            )}
                                            {index === inputRows.length - 1 && index < 11 && (
                                                <button style={{ ...buttonStyle, marginLeft: '10px' }} onClick={addRow}>Add Member</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div style={{ textAlign: 'center', marginTop: '30px' }}>
                            <button style={primaryButtonStyle} onClick={handleSaveAndGenerate} disabled={loading}>
                                {loading ? "Saving & Generating..." : "Save & Generate OS Family"}
                            </button>
                        </div>
                        {error && <div style={{ color: '#ef4444', textAlign: 'center', marginTop: '10px' }}>{error}</div>}
                    </div>
                )}

                {/* 2. RESULT MODE (Sidebar + Content) */}
                {report && (
                    <>
                        {/* Sidebar */}
                        <div style={sidebarStyle}>
                            <div style={{ marginBottom: '20px', color: '#6c728f', fontSize: '0.9em', textTransform: 'uppercase', letterSpacing: '1px' }}>Modules</div>

                            <div
                                style={{
                                    padding: '12px 16px',
                                    cursor: 'pointer',
                                    borderRadius: '6px',
                                    marginBottom: '10px',
                                    backgroundColor: activeTab === 'family_os_info' ? '#374151' : '#2e324a',
                                    color: activeTab === 'family_os_info' ? '#fff' : '#60a5fa',
                                    display: 'flex',
                                    alignItems: 'center',
                                    fontWeight: 'bold',
                                    border: activeTab === 'family_os_info' ? '1px solid #4b5563' : '1px solid #4b5563',
                                    textDecoration: 'none'
                                }}
                                onClick={() => setActiveTab('family_os_info')}
                            >
                                <span style={{ marginRight: '10px' }}>ℹ️</span>
                                What is Family OS?
                            </div>

                            <div onClick={() => setActiveTab('01_vision')} style={menuLinkStyle(activeTab === '01_vision')}>
                                01_Vision
                            </div>
                            <div onClick={() => setActiveTab('02_mission')} style={menuLinkStyle(activeTab === '02_mission')}>
                                02_Mission
                            </div>
                            <div onClick={() => setActiveTab('03_philosophy')} style={menuLinkStyle(activeTab === '03_philosophy')}>
                                03_Philosophy
                            </div>
                            <div onClick={() => setActiveTab('04_matrix')} style={menuLinkStyle(activeTab === '04_matrix')}>
                                04. Family Matrix – Baseline (Natal Structure)
                            </div>

                            <div style={{ marginTop: 'auto' }}>
                                <button style={{ ...buttonStyle, width: '100%' }} onClick={() => { setReport(null); setMissionReport(null); setPhilosophyReport(null); setActiveTab('01_vision'); }}>
                                    ↻ New Report
                                </button>
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div style={mainContentStyle}>

                            {activeTab === '01_vision' && (
                                <div style={{ background: '#12162a', padding: '40px', borderRadius: '10px', border: '1px solid #2a2f4a', whiteSpace: 'pre-line', lineHeight: '1.6', color: '#d1d5db' }}>
                                    <h2 style={{ color: '#e6c87a', marginTop: 0, marginBottom: '20px', borderBottom: '1px solid #2a2f4a', paddingBottom: '15px' }}>
                                        Family Vision Statement
                                    </h2>
                                    {report}
                                </div>
                            )}

                            {activeTab === '02_mission' && (
                                <div style={{ background: '#12162a', padding: '40px', borderRadius: '10px', border: '1px solid #2a2f4a', whiteSpace: 'pre-line', lineHeight: '1.6', color: '#d1d5db' }}>
                                    <h2 style={{ color: '#e6c87a', marginTop: 0, marginBottom: '20px', borderBottom: '1px solid #2a2f4a', paddingBottom: '15px' }}>
                                        Family Mission Statement
                                    </h2>
                                    {missionReport ? missionReport : (
                                        <div style={{ textAlign: 'center', color: '#6c728f' }}>
                                            {missionError ? (
                                                <span style={{ color: '#ef4444' }}>Error: {missionError}</span>
                                            ) : (
                                                "Loading..."
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === '03_philosophy' && (
                                <div style={{ background: '#12162a', padding: '40px', borderRadius: '10px', border: '1px solid #2a2f4a', whiteSpace: 'pre-line', lineHeight: '1.6', color: '#d1d5db' }}>
                                    <h2 style={{ color: '#e6c87a', marginTop: 0, marginBottom: '20px', borderBottom: '1px solid #2a2f4a', paddingBottom: '15px' }}>
                                        Family Philosophy
                                    </h2>
                                    {philosophyReport ? philosophyReport : (
                                        <div style={{ textAlign: 'center', color: '#6c728f' }}>
                                            {philosophyError ? (
                                                <span style={{ color: '#ef4444' }}>Error: {philosophyError}</span>
                                            ) : (
                                                missionReport ? "Loading..." : "Waiting for dependencies..."
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === '04_matrix' && (
                                <div style={{ background: '#12162a', padding: '40px', borderRadius: '10px', border: '1px solid #2a2f4a', color: '#d1d5db' }}>
                                    <h2 style={{ color: '#e6c87a', marginTop: 0, marginBottom: '20px', borderBottom: '1px solid #2a2f4a', paddingBottom: '15px' }}>
                                        04. Family Matrix – Baseline (Natal Structure)
                                    </h2>
                                    {matrixError ? (
                                        <div style={{ color: '#ef4444', padding: '20px', border: '1px solid #ef4444', borderRadius: '8px' }}>
                                            <strong>Generation Failed:</strong> {matrixError}
                                        </div>
                                    ) : (
                                        matrixReport && matrixReport.baseline ? (
                                            <div>
                                                {/* 1. Matrix Axes - Family Level */}
                                                <div style={{ background: '#1a1f35', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                                                    <h3 style={{ color: '#e6c87a', marginTop: 0, borderBottom: '1px solid #2e324a', paddingBottom: '10px' }}>Family Matrix Structure</h3>
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px', textAlign: 'center' }}>
                                                        {Object.entries(matrixReport.baseline.matrix_axes).map(([key, value]) => (
                                                            <div
                                                                key={key}
                                                                onClick={() => openTrace(key)}
                                                                style={{ background: '#0f1220', padding: '15px', borderRadius: '6px', border: '1px solid #2e324a', cursor: 'pointer', transition: 'border-color 0.2s' }}
                                                                title={`${getAxisTooltip(key, value)}\n\n👉 Click for full provenance trace.`}
                                                                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#60a5fa'}
                                                                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#2e324a'}
                                                            >
                                                                <div style={{ color: '#9ca3af', fontSize: '0.8em', textTransform: 'uppercase', marginBottom: '5px' }}>{key.replace('_', ' ')}</div>
                                                                <div style={{ color: '#fff', fontSize: '1.2em', fontWeight: 'bold' }}>{value}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* 2. Role Pair Matrix - Table View */}
                                                <div style={{ background: '#1a1f35', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                                                    <h3 style={{ color: '#e6c87a', marginTop: 0, borderBottom: '1px solid #2e324a', paddingBottom: '10px' }}>Interpersonal Flow Matrix</h3>
                                                    <div style={{ overflowX: 'auto' }}>
                                                        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#d1d5db', fontSize: '0.9em' }}>
                                                            <thead>
                                                                <tr style={{ background: '#0f1220', textAlign: 'left' }}>
                                                                    <th style={{ padding: '12px', borderBottom: '1px solid #2e324a' }}>Relationships</th>
                                                                    <th style={{ padding: '12px', borderBottom: '1px solid #2e324a' }}>Authority</th>
                                                                    <th style={{ padding: '12px', borderBottom: '1px solid #2e324a' }}>Care</th>
                                                                    <th style={{ padding: '12px', borderBottom: '1px solid #2e324a' }}>Dependency</th>
                                                                    <th style={{ padding: '12px', borderBottom: '1px solid #2e324a' }}>Decision</th>
                                                                    <th style={{ padding: '12px', borderBottom: '1px solid #2e324a' }}>Resource</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {matrixReport.baseline.role_pair_matrix.map((row, idx) => (
                                                                    <tr key={idx} style={{ borderBottom: '1px solid #2e324a' }}>
                                                                        <td style={{ padding: '12px', color: '#a5b4fc', fontWeight: 'bold' }}>{row.role_pair.replace(/_/g, ' ')}</td>
                                                                        <td style={{ padding: '12px', cursor: 'help' }} title={getAxisTooltip('authority_flow', row.authority_flow)}>{row.authority_flow}</td>
                                                                        <td style={{ padding: '12px', cursor: 'help' }} title={getAxisTooltip('care_flow', row.care_flow)}>{row.care_flow}</td>
                                                                        <td style={{ padding: '12px', cursor: 'help' }} title={getAxisTooltip('emotional_dependency', row.emotional_dependency)}>{row.emotional_dependency}</td>
                                                                        <td style={{ padding: '12px', cursor: 'help' }} title={getAxisTooltip('decision_influence', row.decision_influence)}>{row.decision_influence}</td>
                                                                        <td style={{ padding: '12px', cursor: 'help' }} title={getAxisTooltip('resource_flow', row.resource_flow)}>{row.resource_flow}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>

                                                {/* 3. Member-Level Flows (MANDATORY) */}
                                                <div style={{ background: '#1a1f35', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                                                    <h3 style={{ color: '#e6c87a', marginTop: 0, borderBottom: '1px solid #2e324a', paddingBottom: '10px' }}>Member-Level Flow Analysis</h3>
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                                                        {matrixReport.baseline.member_flows.map((member, idx) => (
                                                            <div key={idx} style={{ background: '#0f1220', padding: '15px', borderRadius: '6px', border: '1px solid #2e324a' }}>
                                                                <div style={{ color: '#60a5fa', fontWeight: 'bold', marginBottom: '10px', fontSize: '1.1em' }}>Member: {member.member_id}</div>
                                                                {/* Outgoing */}
                                                                <div style={{ marginBottom: '15px' }}>
                                                                    <div style={{ fontSize: '0.8em', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '5px' }}>Outgoing Flows (Capacity)</div>
                                                                    <table style={{ width: '100%', fontSize: '0.85em', color: '#d1d5db' }}>
                                                                        <tbody>
                                                                            {Object.entries(member.outgoing_flows).map(([key, value]) => (
                                                                                <tr key={key}>
                                                                                    <td style={{ padding: '4px 0', color: '#9ca3af' }}>{key.replace('_', ' ')}</td>
                                                                                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{value}</td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                                {/* Incoming */}
                                                                <div>
                                                                    <div style={{ fontSize: '0.8em', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '5px' }}>Incoming Flows (Load)</div>
                                                                    <table style={{ width: '100%', fontSize: '0.85em', color: '#d1d5db' }}>
                                                                        <tbody>
                                                                            {Object.entries(member.incoming_flows).map(([key, value]) => (
                                                                                <tr key={key}>
                                                                                    <td style={{ padding: '4px 0', color: '#9ca3af' }}>{key.replace('_', ' ')}</td>
                                                                                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{value}</td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* 4. Time Evolution - Phase & Deltas */}
                                                {matrixReport.time_evolution && (
                                                    <div style={{ background: '#1a1f35', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #60a5fa', marginBottom: '20px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                                                            <h3 style={{ color: '#60a5fa', margin: 0 }}>Time Evolution Phase</h3>
                                                            <div style={{ marginLeft: '10px', fontSize: '1.2em', cursor: 'help' }} title={`Time Evolution Deltas\n\nCohesion Δ and Friction Δ are relative indicators.\nThey do not represent absolute conditions, predictions, or permanent states.\n\nThey describe temporary structural influence based on the current time phase.`}>ℹ️</div>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                                                            <div>
                                                                <div style={{ fontSize: '0.9em', color: '#9ca3af' }}>Current Structural Phase</div>
                                                                <div style={{ fontSize: '1.2em', color: '#fff', fontWeight: 'bold' }}>{matrixReport.time_evolution.current_phase.phase_label}</div>
                                                            </div>
                                                            <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                                                                <div style={{ textAlign: 'center' }}>
                                                                    <div style={{ fontSize: '0.8em', color: '#9ca3af', cursor: 'help', borderBottom: '1px dotted #9ca3af' }} title={`Cohesion Δ\n\nCohesion Δ indicates how the current time phase affects family alignment and coordination relative to the family's baseline structure.\n\nNegative values reflect temporary reduction in cohesion. This state is reversible.`}>Cohesion Δ</div>
                                                                    <div style={{ color: matrixReport.time_evolution.deltas.cohesion_delta >= 0 ? '#6ee7b7' : '#fca5a5', fontWeight: 'bold', fontSize: '1.2em' }}>
                                                                        {matrixReport.time_evolution.deltas.cohesion_delta > 0 ? '+' : ''}{matrixReport.time_evolution.deltas.cohesion_delta}
                                                                    </div>
                                                                </div>
                                                                <div style={{ textAlign: 'center' }}>
                                                                    <div style={{ fontSize: '0.8em', color: '#9ca3af', cursor: 'help', borderBottom: '1px dotted #9ca3af' }} title={`Friction Δ\n\nFriction Δ indicates how the current time phase affects internal pressure or resistance relative to the family's baseline structure.\n\nPositive values reflect increased load, not predicted outcomes.`}>Friction Δ</div>
                                                                    <div style={{ color: matrixReport.time_evolution.deltas.friction_delta >= 0 ? '#fca5a5' : '#6ee7b7', fontWeight: 'bold', fontSize: '1.2em' }}>
                                                                        {matrixReport.time_evolution.deltas.friction_delta > 0 ? '+' : ''}{matrixReport.time_evolution.deltas.friction_delta}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* 4.5 Support Mode Toggle (GOVERNANCE GATE) */}
                                                <div style={{ marginBottom: '20px', padding: '15px', background: '#111827', borderRadius: '8px', border: '1px solid #374151', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div>
                                                        <div style={{ color: '#e5e7eb', fontWeight: 'bold' }}>Support Mode (optional)</div>
                                                        <div style={{ color: '#9ca3af', fontSize: '0.85em' }}>Enables structured support overlays. Analysis remains unchanged.</div>
                                                    </div>
                                                    <div
                                                        onClick={handleSupportToggle}
                                                        style={{
                                                            width: '48px', height: '26px', borderRadius: '13px',
                                                            background: supportModeEnabled ? '#10b981' : '#4b5563',
                                                            position: 'relative', cursor: 'pointer', transition: 'background 0.3s'
                                                        }}
                                                    >
                                                        <div style={{
                                                            width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
                                                            position: 'absolute', top: '3px',
                                                            left: supportModeEnabled ? '25px' : '3px',
                                                            transition: 'left 0.3s'
                                                        }} />
                                                    </div>
                                                </div>

                                                {supportModeEnabled && (
                                                    <>
                                                        <div style={{ marginBottom: '20px', padding: '10px 15px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #059669', borderRadius: '6px', color: '#34d399', fontSize: '0.9em', display: 'flex', alignItems: 'center' }}>
                                                            <span style={{ marginRight: '8px' }}>✅</span>
                                                            <strong>Support Mode: Enabled.</strong>
                                                            <span style={{ marginLeft: '8px', opacity: 0.8 }}>Support overlays are active. Core analysis remains unchanged.</span>
                                                        </div>

                                                        {/* Conflict Repair Overlay Blocks (Demo/Static Logic) */}
                                                        <div style={{ background: '#111827', padding: '20px', borderRadius: '8px', border: '1px solid #374151', marginBottom: '20px' }}>
                                                            <h3 style={{ color: '#e6c87a', marginTop: 0, borderBottom: '1px solid #374151', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                                                                <span>🛠 Conflict Repair Overlay</span>
                                                                <span style={{ fontSize: '0.6em', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center' }}>✅ Status: Allowed by gate</span>
                                                            </h3>

                                                            <div style={{ color: '#9ca3af', fontSize: '0.9em', marginBottom: '20px', fontStyle: 'italic', borderLeft: '3px solid #e6c87a', paddingLeft: '10px' }}>
                                                                These blocks are not advice, not prediction, and not diagnosis. They are structured repair signals, rendered only because the user explicitly enabled Support Mode.
                                                            </div>

                                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>

                                                                {/* Signal 1 */}
                                                                <div style={{ background: '#1f2937', padding: '15px', borderRadius: '6px' }}>
                                                                    <div style={{ color: '#60a5fa', fontWeight: 'bold', marginBottom: '10px' }}>Signal 1 — Decision Load Concentration</div>
                                                                    <div style={{ fontSize: '0.85em', color: '#d1d5db', marginBottom: '10px' }}>
                                                                        <strong style={{ color: '#9ca3af' }}>Observation:</strong> Decision-making authority is concentrated and propagates quickly, while overall cohesion is under time-based pressure.
                                                                    </div>
                                                                    <div style={{ fontSize: '0.85em', color: '#a7f3d0' }}>
                                                                        <strong style={{ color: '#34d399' }}>Repair:</strong> Introduce deliberate pauses or shared checkpoints in decision flow to reduce unilateral load accumulation.
                                                                    </div>
                                                                </div>

                                                                {/* Signal 2 */}
                                                                <div style={{ background: '#1f2937', padding: '15px', borderRadius: '6px' }}>
                                                                    <div style={{ color: '#60a5fa', fontWeight: 'bold', marginBottom: '10px' }}>Signal 2 — Authority vs Emotional Load</div>
                                                                    <div style={{ fontSize: '0.85em', color: '#d1d5db', marginBottom: '10px' }}>
                                                                        <strong style={{ color: '#9ca3af' }}>Observation:</strong> Authority-bearing roles may absorb emotional strain indirectly, increasing internal stress without visible conflict.
                                                                    </div>
                                                                    <div style={{ fontSize: '0.85em', color: '#a7f3d0' }}>
                                                                        <strong style={{ color: '#34d399' }}>Repair:</strong> Separate structural authority from emotional processing channels to prevent silent overload.
                                                                    </div>
                                                                </div>

                                                                {/* Signal 3 */}
                                                                <div style={{ background: '#1f2937', padding: '15px', borderRadius: '6px' }}>
                                                                    <div style={{ color: '#60a5fa', fontWeight: 'bold', marginBottom: '10px' }}>Signal 3 — Care Flow Asymmetry</div>
                                                                    <div style={{ fontSize: '0.85em', color: '#d1d5db', marginBottom: '10px' }}>
                                                                        <strong style={{ color: '#9ca3af' }}>Observation:</strong> Support demand exceeds visible care exchange, creating latent imbalance.
                                                                    </div>
                                                                    <div style={{ fontSize: '0.85em', color: '#a7f3d0' }}>
                                                                        <strong style={{ color: '#34d399' }}>Repair:</strong> Rebalance care expression across roles to reduce dependency tension.
                                                                    </div>
                                                                </div>

                                                            </div>
                                                        </div>

                                                        {/* Emotional Risk Overlay (New) */}
                                                        {supportModeEnabled && (
                                                            <div style={{ background: '#111827', padding: '20px', borderRadius: '8px', border: '1px solid #7f1d1d', marginBottom: '20px' }}>
                                                                <h3 style={{ color: '#fca5a5', marginTop: 0, borderBottom: '1px solid #7f1d1d', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                                                                    <span>🧠 Emotional Risk Overlay</span>
                                                                    <span style={{ fontSize: '0.6em', color: '#fca5a5', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center' }}>
                                                                        {matrixReport.intervention_gate?.selected_mode === 'safety_escalation' ? '⚠️ Mode: Safety Escalation' : '✅ Mode: User-Enabled'}
                                                                    </span>
                                                                </h3>

                                                                <div style={{ color: '#9ca3af', fontSize: '0.9em', marginBottom: '20px', fontStyle: 'italic', borderLeft: '3px solid #fca5a5', paddingLeft: '10px' }}>
                                                                    ⚠️ This overlay is not diagnostic, not predictive, and not clinical. It is rendered only because Support Mode is enabled and Gate conditions are satisfied.
                                                                </div>

                                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>

                                                                    {/* Risk Signal 1: Accumulated Emotional Load */}
                                                                    {(matrixReport.baseline.matrix_axes.emotional_dependency >= 30 && matrixReport.time_evolution.deltas.cohesion_delta < 0) && (
                                                                        <div style={{ background: '#1f2937', padding: '15px', borderRadius: '6px', borderLeft: '3px solid #ef4444' }}>
                                                                            <div style={{ color: '#fca5a5', fontWeight: 'bold', marginBottom: '10px' }}>Risk Signal 1 — Accumulated Emotional Load</div>
                                                                            <div style={{ fontSize: '0.85em', color: '#d1d5db', marginBottom: '10px' }}>
                                                                                <strong style={{ color: '#9ca3af' }}>Condition:</strong> Emotional dependency moderate/high while cohesion is declining.
                                                                            </div>
                                                                            <div style={{ fontSize: '0.85em', color: '#d1d5db' }}>
                                                                                <strong style={{ color: '#ffb3b3' }}>Risk Framing:</strong> Unexpressed strain may compound internally rather than surface through explicit conflict.
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {/* Risk Signal 2: Silent Stress Channels */}
                                                                    {(matrixReport.baseline.matrix_axes.decision_influence > 55 && matrixReport.baseline.matrix_axes.care_flow < 45) && (
                                                                        <div style={{ background: '#1f2937', padding: '15px', borderRadius: '6px', borderLeft: '3px solid #ef4444' }}>
                                                                            <div style={{ color: '#fca5a5', fontWeight: 'bold', marginBottom: '10px' }}>Risk Signal 2 — Silent Stress Channels</div>
                                                                            <div style={{ fontSize: '0.85em', color: '#d1d5db', marginBottom: '10px' }}>
                                                                                <strong style={{ color: '#9ca3af' }}>Condition:</strong> High decision influence combined with low care flow.
                                                                            </div>
                                                                            <div style={{ fontSize: '0.85em', color: '#d1d5db' }}>
                                                                                <strong style={{ color: '#ffb3b3' }}>Risk Framing:</strong> Responsibility-bearing roles may experience stress without corresponding emotional support exchange.
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {/* Risk Signal 3: Parent-Child Compression */}
                                                                    {(matrixReport.baseline.matrix_axes.emotional_dependency > matrixReport.baseline.matrix_axes.care_flow) && (
                                                                        <div style={{ background: '#1f2937', padding: '15px', borderRadius: '6px', borderLeft: '3px solid #ef4444' }}>
                                                                            <div style={{ color: '#fca5a5', fontWeight: 'bold', marginBottom: '10px' }}>Risk Signal 3 — Parent–Child Emotional Compression</div>
                                                                            <div style={{ fontSize: '0.85em', color: '#d1d5db', marginBottom: '10px' }}>
                                                                                <strong style={{ color: '#9ca3af' }}>Condition:</strong> Dependency levels exceed visible care signals.
                                                                            </div>
                                                                            <div style={{ fontSize: '0.85em', color: '#d1d5db' }}>
                                                                                <strong style={{ color: '#ffb3b3' }}>Risk Framing:</strong> Emotional needs may be internalized rather than actively processed across roles.
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {/* Risk Signal 4: Phase Sensitivity */}
                                                                    {(matrixReport.time_evolution.current_phase.phase_code === 'fracture_risk') && (
                                                                        <div style={{ background: '#1f2937', padding: '15px', borderRadius: '6px', borderLeft: '3px solid #ef4444' }}>
                                                                            <div style={{ color: '#fca5a5', fontWeight: 'bold', marginBottom: '10px' }}>Risk Signal 4 — Phase Sensitivity</div>
                                                                            <div style={{ fontSize: '0.85em', color: '#d1d5db', marginBottom: '10px' }}>
                                                                                <strong style={{ color: '#9ca3af' }}>Condition:</strong> Current phase = Fracture Risk Phase.
                                                                            </div>
                                                                            <div style={{ fontSize: '0.85em', color: '#d1d5db' }}>
                                                                                <strong style={{ color: '#ffb3b3' }}>Risk Framing:</strong> Awareness and pacing are more critical during this phase.
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {/* Fallback if no risks detected but mode is on */}
                                                                    {!(
                                                                        (matrixReport.baseline.matrix_axes.emotional_dependency >= 30 && matrixReport.time_evolution.deltas.cohesion_delta < 0) ||
                                                                        (matrixReport.baseline.matrix_axes.decision_influence > 55 && matrixReport.baseline.matrix_axes.care_flow < 45) ||
                                                                        (matrixReport.baseline.matrix_axes.emotional_dependency > matrixReport.baseline.matrix_axes.care_flow) ||
                                                                        (matrixReport.time_evolution.current_phase.phase_code === 'fracture_risk')
                                                                    ) && (
                                                                            <div style={{ color: '#9ca3af', fontStyle: 'italic', gridColumn: '1 / -1', textAlign: 'center' }}>
                                                                                No specific high-priority emotional risk signals detected in the current matrix structure.
                                                                            </div>
                                                                        )}

                                                                </div>
                                                            </div>
                                                        )}
                                                    </>
                                                )}

                                                {/* Consent Modal Overlay */}
                                                {showConsentModal && (
                                                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                        <div style={{ background: '#1f2937', padding: '30px', borderRadius: '12px', width: '500px', maxWidth: '90%', border: '1px solid #4b5563', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                                                            <h2 style={{ color: '#e5e7eb', marginTop: 0 }}>Enable Support Mode</h2>
                                                            <div style={{ color: '#d1d5db', lineHeight: '1.6', marginBottom: '20px' }}>
                                                                <p>Support Mode enables additional structured overlays designed to assist with understanding and repair.</p>
                                                                <p>This does not change the underlying analysis. No predictions or diagnoses are generated.</p>
                                                                <p style={{ fontWeight: 'bold' }}>Do you want to proceed?</p>
                                                            </div>

                                                            <div style={{ marginBottom: '15px' }}>
                                                                <label style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', textAlign: 'left', cursor: 'pointer', color: '#9ca3af' }}>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={consentChecks.understand}
                                                                        onChange={(e) => setConsentChecks({ ...consentChecks, understand: e.target.checked })}
                                                                        style={{ marginTop: '4px', marginRight: '10px', flexShrink: 0, width: 'auto' }}
                                                                    />
                                                                    <span style={{ lineHeight: '1.4' }}>I understand this enables optional support overlays.</span>
                                                                </label>
                                                            </div>
                                                            <div style={{ marginBottom: '25px' }}>
                                                                <label style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', textAlign: 'left', cursor: 'pointer', color: '#9ca3af' }}>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={consentChecks.choose}
                                                                        onChange={(e) => setConsentChecks({ ...consentChecks, choose: e.target.checked })}
                                                                        style={{ marginTop: '4px', marginRight: '10px', flexShrink: 0, width: 'auto' }}
                                                                    />
                                                                    <span style={{ lineHeight: '1.4' }}>I am choosing to enable this explicitly.</span>
                                                                </label>
                                                            </div>

                                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                                                                <button
                                                                    onClick={() => setShowConsentModal(false)}
                                                                    style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #4b5563', color: '#9ca3af', borderRadius: '6px', cursor: 'pointer' }}
                                                                >
                                                                    Cancel
                                                                </button>
                                                                <button
                                                                    onClick={confirmSupportMode}
                                                                    disabled={!consentChecks.understand || !consentChecks.choose}
                                                                    style={{
                                                                        padding: '10px 20px',
                                                                        background: (!consentChecks.understand || !consentChecks.choose) ? '#374151' : '#3b82f6',
                                                                        color: (!consentChecks.understand || !consentChecks.choose) ? '#6b7280' : '#fff',
                                                                        border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
                                                                    }}
                                                                >
                                                                    Confirm & Enable
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* 5. Interpretation Layer (OPTIONAL) */}
                                                {matrixReport.interpretation && matrixReport.interpretation.length > 0 && (
                                                    <div style={{ background: '#1a1f35', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                                                        <h3 style={{ color: '#e6c87a', marginTop: 0, borderBottom: '1px solid #2e324a', paddingBottom: '10px' }}>Interpretation</h3>
                                                        {matrixReport.interpretation.map((text, idx) => (
                                                            <p key={idx} style={{ color: '#d1d5db', lineHeight: '1.6', marginBottom: '15px' }}>{text}</p>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* 6. Audit Metadata (MANDATORY) */}
                                                <div style={{ marginTop: '30px', borderTop: '1px solid #2e324a', paddingTop: '20px' }}>
                                                    <details>
                                                        <summary style={{ cursor: 'pointer', color: '#6b7280', fontSize: '0.8em' }}>Global Validator Metadata (System Audit)</summary>
                                                        <div style={{ background: '#0f1220', padding: '15px', marginTop: '10px', borderRadius: '6px', fontSize: '0.75em', fontFamily: 'monospace', color: '#9ca3af' }}>
                                                            <div>FAMILY_ID: <span style={{ color: '#d1d5db' }}>{matrixReport.family_id}</span></div>
                                                            <div>MODULE: <span style={{ color: '#d1d5db' }}>{matrixReport.module}</span></div>
                                                            <div>SCOPE: <span style={{ color: '#d1d5db' }}>{JSON.stringify(matrixReport.scope)}</span></div>
                                                            <div style={{ marginTop: '10px', color: '#a5b4fc' }}>VALIDATION STATUS:</div>
                                                            {matrixReport.validation && Object.entries(matrixReport.validation).map(([k, v]) => (
                                                                <div key={k}> - {k}: {v.toString()}</div>
                                                            ))}
                                                        </div>
                                                    </details>
                                                </div>

                                            </div>
                                        ) : <div style={{ textAlign: 'center', color: '#6c728f' }}>Loading Matrix Data...</div>
                                    )}
                                </div>
                            )}

                            {/* Status Message */}
                            {loading && (
                                <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3b82f6', borderRadius: '8px', color: '#60a5fa', fontSize: '0.9em', textAlign: 'center' }}>
                                    {statusMessage || 'Processing...'}
                                </div>
                            )}

                            {error && (
                                <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '8px', color: '#fca5a5', fontSize: '0.9em' }}>
                                    {error}
                                </div>
                            )}

                            {activeTab === 'family_os_info' && (
                                <div style={{ animation: 'fadeIn 0.5s ease' }}>
                                    {/* Hero Section */}
                                    <div style={{ textAlign: 'center', marginBottom: '40px', padding: '40px', background: 'linear-gradient(135deg, #1f2937, #111827)', borderRadius: '12px' }}>
                                        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.5em', color: '#e6c87a', marginBottom: '15px' }}>Family Operating System (V1.0)</h1>
                                        <p style={{ color: '#9ca3af', fontSize: '1.1em', maxWidth: '700px', margin: '0 auto' }}>
                                            A Conscious Framework for Multi-Generational Family Evolution.
                                            Treating the family as a living organism bound by karma, purpose, and structural dynamics.
                                        </p>
                                    </div>

                                    {/* Visuals Section */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px', marginBottom: '50px' }}>
                                        <div style={{ background: '#1a1f35', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                                            <h3 style={{ color: '#60a5fa', marginBottom: '15px' }}>Structural Overview</h3>
                                            <img src="/Summary_Family_OS.png" alt="Summary Family OS" style={{ maxWidth: '100%', borderRadius: '6px', border: '1px solid #2e324a' }} />
                                        </div>
                                        <div style={{ background: '#1a1f35', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                                            <h3 style={{ color: '#e6c87a', marginBottom: '15px' }}>Detailed Architecture</h3>
                                            <img src="/Detail_Family_OS.png" alt="Detail Family OS" style={{ maxWidth: '100%', borderRadius: '6px', border: '1px solid #2e324a' }} />
                                        </div>
                                    </div>

                                    {/* 7 Layers Grid */}
                                    <h2 style={{ textAlign: 'center', color: '#e6e6e6', marginBottom: '30px', fontFamily: 'Playfair Display, serif' }}>The Seven Layers of Evolution</h2>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>

                                        {[
                                            { title: "1. The Existential Layer", color: "#5a7d9a", question: "Why the family exists.", points: ["Vision: Karmic direction.", "Mission: Active duty."] },
                                            { title: "2. The Ideological Layer", color: "#66b39a", question: "What the family believes.", points: ["Philosophy: Core ethics.", "Matrix: Power structure."] },
                                            { title: "3. The Material Layer", color: "#e9a749", question: "How the family executes.", points: ["Roles & Responsibilities.", "Wealth Logic."] },
                                            { title: "4. The Emotional Layer", color: "#e67e5e", question: "How emotions move.", points: ["Emotional Architecture.", "Conflict Repair."] },
                                            { title: "5. The Relational Layer", color: "#c95d8e", question: "Who is bound to whom.", points: ["Karmic Contracts.", "Boundaries."] },
                                            { title: "6. The Temporal Layer", color: "#8a6faf", question: "How the family evolves.", points: ["Time Evolution Phases.", "Unified Timeline."] },
                                            { title: "7. The Terminal Layer", color: "#6b9e78", question: "How the family closes.", points: ["Legacy Care.", "Transition Logic."] }
                                        ].map((layer, i) => (
                                            <div key={i} style={{ background: '#1a1f35', borderRadius: '10px', overflow: 'hidden', border: '1px solid #2e324a', transition: 'transform 0.2s' }}>
                                                <div style={{ background: layer.color, padding: '15px', color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>{layer.title}</div>
                                                <div style={{ padding: '20px' }}>
                                                    <div style={{ fontStyle: 'italic', marginBottom: '15px', color: '#9ca3af', fontSize: '0.9em' }}>{layer.question}</div>
                                                    <ul style={{ paddingLeft: '20px', margin: 0, color: '#d1d5db', fontSize: '0.9em' }}>
                                                        {layer.points.map((p, j) => <li key={j} style={{ marginBottom: '8px' }}>{p}</li>)}
                                                    </ul>
                                                </div>
                                            </div>
                                        ))}

                                    </div>

                                    {/* Footer Quote */}
                                    <div style={{ marginTop: '50px', padding: '30px', textAlign: 'center', borderTop: '1px solid #2e324a', color: '#6b7280', fontStyle: 'italic' }}>
                                        "By aligning these seven layers, families evolve from random biological groups into conscious, purposeful organisms."
                                    </div>
                                </div>
                            )}

                        </div>
                    </>
                )}
                {/* Trace Modal */}
                {showTraceModal && traceData && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <div style={{ background: '#111827', width: '800px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '12px', border: '1px solid #374151', display: 'flex', flexDirection: 'column' }}>
                            {/* Header */}
                            <div style={{ padding: '20px', borderBottom: '1px solid #374151', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ margin: 0, color: '#e6c87a' }}>Why this score? <span style={{ color: '#9ca3af' }}>{(traceData.axis || '').replace('_', ' ').toUpperCase()} = {traceData.final_score}</span></h3>
                                    <div style={{ fontSize: '0.8em', color: '#6b7280' }}>Provenance Trace: {new Date().toLocaleTimeString()}</div>
                                </div>
                                <button onClick={() => setShowTraceModal(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '1.5em', cursor: 'pointer' }}>×</button>
                            </div>

                            {/* Tabs */}
                            <div style={{ display: 'flex', borderBottom: '1px solid #374151', background: '#1f2937' }}>
                                {['planets', 'rules', 'axis', 'aggregation'].map(tab => (
                                    <div
                                        key={tab}
                                        onClick={() => setActiveTraceTab(tab)}
                                        style={{
                                            padding: '15px 25px',
                                            cursor: 'pointer',
                                            color: activeTraceTab === tab ? '#60a5fa' : '#9ca3af',
                                            borderBottom: activeTraceTab === tab ? '2px solid #60a5fa' : 'none',
                                            fontWeight: activeTraceTab === tab ? 'bold' : 'normal',
                                            textTransform: 'capitalize'
                                        }}
                                    >
                                        {tab}
                                    </div>
                                ))}
                            </div>

                            {/* Content */}
                            <div style={{ padding: '20px', color: '#d1d5db', fontSize: '0.9em' }}>
                                {activeTraceTab === 'planets' && (
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ textAlign: 'left', color: '#9ca3af', borderBottom: '1px solid #374151' }}>
                                                <th style={{ padding: '10px' }}>Planet</th>
                                                <th style={{ padding: '10px' }}>Chart</th>
                                                <th style={{ padding: '10px' }}>Strength</th>
                                                <th style={{ padding: '10px' }}>Source File</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {traceData.trace.planets.map((p, i) => (
                                                <tr key={i} style={{ borderBottom: '1px solid #1f2937' }}>
                                                    <td style={{ padding: '10px' }}>{p.planet}</td>
                                                    <td style={{ padding: '10px' }}>{p.chart}</td>
                                                    <td style={{ padding: '10px' }}>{p.strength}</td>
                                                    <td style={{ padding: '10px', fontFamily: 'monospace', color: '#6b7280' }}>{p.source}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}

                                {/* Rules Tab */}
                                {activeTraceTab === 'rules' && (
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ textAlign: 'left', color: '#9ca3af', borderBottom: '1px solid #374151' }}>
                                                <th style={{ padding: '10px' }}>Rule ID</th>
                                                <th style={{ padding: '10px' }}>Type</th>
                                                <th style={{ padding: '10px' }}>Effect</th>
                                                <th style={{ padding: '10px' }}>Source File</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {traceData.trace.rules_applied.map((r, i) => (
                                                <tr key={i} style={{ borderBottom: '1px solid #1f2937' }}>
                                                    <td style={{ padding: '10px', color: '#ea580c' }}>{r.rule_id}</td>
                                                    <td style={{ padding: '10px' }}>{r.rule_type}</td>
                                                    <td style={{ padding: '10px' }}>{r.effect}</td>
                                                    <td style={{ padding: '10px', fontFamily: 'monospace', color: '#6b7280' }}>{r.file}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}

                                {/* Axis Tab */}
                                {activeTraceTab === 'axis' && (
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ textAlign: 'left', color: '#9ca3af', borderBottom: '1px solid #374151' }}>
                                                <th style={{ padding: '10px' }}>Axis</th>
                                                <th style={{ padding: '10px' }}>Contribution Value</th>
                                                <th style={{ padding: '10px' }}>Weight</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {traceData.trace.axis_contributions.map((a, i) => (
                                                <tr key={i} style={{ borderBottom: '1px solid #1f2937' }}>
                                                    <td style={{ padding: '10px', textTransform: 'uppercase' }}>{a.axis.replace('_', ' ')}</td>
                                                    <td style={{ padding: '10px' }}>{a.value}</td>
                                                    <td style={{ padding: '10px' }}>{a.weight}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}

                                {/* Aggregation Tab */}
                                {activeTraceTab === 'aggregation' && (
                                    <div style={{ padding: '20px', background: '#1f2937', borderRadius: '8px' }}>
                                        <div style={{ marginBottom: '10px' }}><strong style={{ color: '#9ca3af' }}>Method:</strong> {traceData.trace.aggregation.method.replace('_', ' ')}</div>
                                        <div style={{ marginBottom: '10px' }}><strong style={{ color: '#9ca3af' }}>Normalization:</strong> {traceData.trace.aggregation.normalization}</div>
                                        <div style={{ fontSize: '1.2em', color: '#60a5fa' }}><strong style={{ color: '#9ca3af' }}>Final Score:</strong> {traceData.trace.aggregation.final_score}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FamilyVisionPage;
