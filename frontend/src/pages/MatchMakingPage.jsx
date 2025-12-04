import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { analyzeCandidates } from '../utils/matchUtils';
import './MatchMakingPage.css';

const MatchMakingPage = ({ savedCharts, onBack }) => {
    const { t } = useTranslation();
    const [perspective, setPerspective] = useState('girl_looking_boy');
    const [selectedCandidates, setSelectedCandidates] = useState([]);
    const [results, setResults] = useState(null);
    const [baseProfileId, setBaseProfileId] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [candidateSearch, setCandidateSearch] = useState('');

    // Load charts from local storage if not provided prop (fallback)
    const [charts, setCharts] = useState(savedCharts || []);

    useEffect(() => {
        if (!savedCharts) {
            const saved = localStorage.getItem('savedCharts');
            if (saved) {
                let parsed = JSON.parse(saved);
                // Normalize data structure
                parsed = parsed.map(c => ({
                    ...c,
                    id: c._id || c.id,
                    data: c.chartData || c.data
                }));
                setCharts(parsed);
            }
        } else {
            setCharts(savedCharts);
        }
    }, [savedCharts]);

    // Filter Base Profile Options based on Perspective
    const baseProfileOptions = charts.filter(c => {
        const gender = (c.gender || 'male').toLowerCase();
        if (perspective === 'girl_looking_boy') return gender === 'female';
        if (perspective === 'boy_looking_girl') return gender === 'male';
        return true;
    }).sort((a, b) => a.name.localeCompare(b.name));

    // Filter Candidates based on Perspective (Opposite Gender)
    const candidateOptions = charts.filter(c => {
        if (c.id === baseProfileId) return false; // Exclude self
        const gender = (c.gender || 'male').toLowerCase();

        if (perspective === 'girl_looking_boy') return gender === 'male';
        if (perspective === 'boy_looking_girl') return gender === 'female';
        return true;
    }).sort((a, b) => a.name.localeCompare(b.name));

    // Filter candidates for display in dropdown
    const displayedCandidates = candidateOptions.filter(c =>
        c.name.toLowerCase().includes(candidateSearch.toLowerCase())
    );

    // Reset selections when perspective changes
    useEffect(() => {
        setBaseProfileId('');
        setSelectedCandidates([]);
        setCandidateSearch('');
    }, [perspective]);

    const handleSelectCandidate = (id) => {
        setSelectedCandidates(prev => {
            if (prev.includes(id)) return prev.filter(c => c !== id);
            return [...prev, id];
        });
    };

    const handleSelectAll = () => {
        const displayedIds = displayedCandidates.map(c => c.id);
        const allDisplayedSelected = displayedIds.length > 0 && displayedIds.every(id => selectedCandidates.includes(id));

        if (allDisplayedSelected) {
            // Deselect displayed
            setSelectedCandidates(prev => prev.filter(id => !displayedIds.includes(id)));
        } else {
            // Select displayed (add missing ones)
            const newIds = displayedIds.filter(id => !selectedCandidates.includes(id));
            setSelectedCandidates(prev => [...prev, ...newIds]);
        }
    };

    const handleAnalyze = () => {
        const candidates = charts.filter(c => selectedCandidates.includes(c.id));
        const baseProfile = charts.find(c => c.id === baseProfileId);
        const analysisResults = analyzeCandidates(candidates, perspective, baseProfile?.data, false, t);
        setResults(analysisResults);
    };

    const getPerspectiveLabel = () => {
        switch (perspective) {
            case 'girl_looking_boy': return t('matchMaking.girlLookingBoy');
            case 'boy_looking_girl': return t('matchMaking.boyLookingGirl');
            case 'employer_looking_employee': return t('matchMaking.employerLookingEmployee');
            case 'employee_looking_employer': return t('matchMaking.employeeLookingEmployer');
            case 'business_partner': return t('matchMaking.businessPartner');
            default: return t('matchMaking.selectPerspective');
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const closeDropdown = (e) => {
            if (!e.target.closest('.multi-select-container')) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('click', closeDropdown);
        return () => document.removeEventListener('click', closeDropdown);
    }, []);

    return (
        <div className="match-making-container">
            <header className="match-header">
                <button className="back-btn" onClick={onBack} style={{ float: 'left' }}>← {t('common.back')}</button>
                <h1>{t('matchMaking.title')}</h1>
                <p>{t('matchMaking.subtitle')}</p>
            </header>

            <div className="match-controls">
                <div className="control-group">
                    <label>{t('matchMaking.step1')}</label>
                    <select
                        className="perspective-select"
                        value={perspective}
                        onChange={(e) => setPerspective(e.target.value)}
                    >
                        <option value="girl_looking_boy">{t('matchMaking.optionGirlBoy')}</option>
                        <option value="boy_looking_girl">{t('matchMaking.optionBoyGirl')}</option>
                        <option value="employer_looking_employee">{t('matchMaking.optionEmployerEmployee')}</option>
                        <option value="employee_looking_employer">{t('matchMaking.optionEmployeeEmployer')}</option>
                        <option value="business_partner">{t('matchMaking.optionBusinessPartner')}</option>
                    </select>
                </div>

                <div className="control-group">
                    <label>{t('matchMaking.step2')}</label>
                    {charts.length === 0 ? (
                        <div style={{ color: '#fbbf24', padding: '0.5rem', background: 'rgba(251, 191, 36, 0.1)', borderRadius: '0.3rem' }}>
                            ⚠️ {t('matchMaking.noChartsWarning')}
                        </div>
                    ) : (
                        <select
                            className="perspective-select"
                            value={baseProfileId}
                            onChange={(e) => {
                                setBaseProfileId(e.target.value);
                                setSelectedCandidates([]); // Reset selection
                            }}
                        >
                            <option value="">-- {t('matchMaking.selectProfile')} --</option>
                            {baseProfileOptions.map(chart => (
                                <option key={chart.id} value={chart.id}>{chart.name} ({chart.gender})</option>
                            ))}
                        </select>
                    )}
                </div>

                <div className="control-group">
                    <label>{t('matchMaking.step3')} ({selectedCandidates.length})</label>
                    <div className="multi-select-container">
                        <div
                            className="multi-select-header"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                        >
                            <span style={{ display: 'flex', alignItems: 'center' }}>
                                {selectedCandidates.length === 0
                                    ? t('matchMaking.selectCandidates')
                                    : `${selectedCandidates.length} ${t('matchMaking.selected')}`}

                                {selectedCandidates.length > 0 && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedCandidates([]);
                                        }}
                                        style={{
                                            background: 'rgba(239, 68, 68, 0.2)',
                                            color: '#fca5a5',
                                            border: '1px solid rgba(239, 68, 68, 0.3)',
                                            borderRadius: '0.2rem',
                                            padding: '0.1rem 0.4rem',
                                            fontSize: '0.75rem',
                                            cursor: 'pointer',
                                            marginLeft: '0.8rem'
                                        }}
                                        title={t('matchMaking.clearAll')}
                                    >
                                        {t('matchMaking.clear')}
                                    </button>
                                )}
                            </span>
                            <span>{dropdownOpen ? '▲' : '▼'}</span>
                        </div>

                        {dropdownOpen && (
                            <div className="multi-select-options">
                                <div style={{ padding: '0.5rem', borderBottom: '1px solid #374151', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <input
                                        type="text"
                                        placeholder={t('matchMaking.searchPlaceholder')}
                                        value={candidateSearch}
                                        onChange={(e) => setCandidateSearch(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        style={{
                                            flex: 1,
                                            padding: '0.5rem',
                                            borderRadius: '0.3rem',
                                            border: '1px solid #4b5563',
                                            background: '#1f2937',
                                            color: 'white',
                                            fontSize: '0.9rem'
                                        }}
                                    />
                                    {candidateSearch && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setCandidateSearch('');
                                            }}
                                            style={{
                                                background: 'rgba(75, 85, 99, 0.5)',
                                                border: 'none',
                                                color: '#e5e7eb',
                                                borderRadius: '50%',
                                                width: '24px',
                                                height: '24px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                fontSize: '1rem',
                                                lineHeight: 1
                                            }}
                                            title="Clear Filter"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>

                                {displayedCandidates.length === 0 ? (
                                    <div style={{ padding: '1rem', color: '#94a3b8', textAlign: 'center' }}>
                                        {t('matchMaking.noCandidatesFound')}
                                    </div>
                                ) : (
                                    <>
                                        <div
                                            className="candidate-item"
                                            onClick={handleSelectAll}
                                            style={{ fontWeight: 'bold', color: 'var(--accent-color)' }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={displayedCandidates.length > 0 && displayedCandidates.every(c => selectedCandidates.includes(c.id))}
                                                readOnly
                                            />
                                            {t('matchMaking.selectAll')} {candidateSearch && `(${t('matchMaking.filtered')})`}
                                        </div>
                                        {displayedCandidates.map(chart => (
                                            <div
                                                key={chart.id}
                                                className="candidate-item"
                                                onClick={() => handleSelectCandidate(chart.id)}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCandidates.includes(chart.id)}
                                                    readOnly
                                                />
                                                <span>{chart.name} <small style={{ color: '#94a3b8' }}>({chart.gender})</small></span>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <button
                    className="analyze-btn"
                    onClick={handleAnalyze}
                    disabled={selectedCandidates.length === 0}
                >
                    {t('matchMaking.analyzeBtn')}
                </button>
            </div>

            {results && (
                <div className="results-section">
                    <h2>{t('matchMaking.rankingResults')}: {getPerspectiveLabel()}</h2>
                    {results.map((result, index) => (
                        <div key={result.id} className="result-card">
                            <div className="rank-badge">#{index + 1}</div>
                            <div className="result-header">
                                <div>
                                    <h3>{result.name}</h3>
                                    {result.role && <span className="role-badge">{result.role}</span>}
                                </div>
                                <div className="score-display">
                                    <span
                                        className="total-score"
                                        title={
                                            baseProfileId
                                                ? t('matchMaking.calculationBlended', { name: result.name, merit: result.individualScore, synastry: result.compatibilityScore })
                                                : t('matchMaking.calculationIndividual', { name: result.name })
                                        }
                                        style={{ cursor: 'help' }}
                                    >
                                        {result.score}/10
                                    </span>
                                    <small>{t('matchMaking.overallScore')}</small>
                                    {result.compatibilityDetails && result.compatibilityDetails.length > 0 && (
                                        <div style={{ textAlign: 'right', marginTop: '0.5rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                                            <div>{t('matchMaking.merit', { name: result.name.split(' ')[0], score: result.individualScore })}</div>
                                            <div>{t('matchMaking.synastry', { score: result.compatibilityScore })}</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {result.compatibilityDetails && result.compatibilityDetails.length > 0 && (
                                <div className="compatibility-section" style={{ margin: '0 0 1.5rem 0', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.5rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#10b981' }}>❤️ {t('matchMaking.compatibilityAnalysis')}</h4>
                                    <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#065f46' }}>
                                        {result.compatibilityDetails.map((detail, i) => (
                                            <li key={i}>{detail}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="details-grid">
                                {result.details.sections.map((section, idx) => (
                                    <div key={idx} className="detail-section">
                                        <h4>{section.title}</h4>
                                        {section.traits.map(trait => (
                                            <div key={trait.id} className="trait-row">
                                                <span className="trait-name" title={trait.description} style={{ cursor: 'help' }}>{trait.name}</span>
                                                <span
                                                    className="trait-val"
                                                    title={[...(trait.reasons || []), ...(trait.indicators || [])].join('\n')}
                                                    style={{ cursor: 'help', borderBottom: '1px dotted rgba(255,255,255,0.3)' }}
                                                >
                                                    {trait.score}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MatchMakingPage;
