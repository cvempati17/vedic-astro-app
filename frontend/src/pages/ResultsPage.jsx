import React, { useState, useRef } from 'react';
import axios from 'axios';
import BirthChart from '../components/BirthChart';
import ResultsTable from '../components/ResultsTable';
import NakshatraInfo from '../components/NakshatraInfo';
import DashaTable from '../components/DashaTable';
import AspectsView from '../components/AspectsView';
import StrengthView from '../components/StrengthView';
import YogasView from '../components/YogasView';
import HouseAnalysisView from '../components/HouseAnalysisView';
import { generatePDF } from '../utils/pdfUtils';
import PredictionsView from '../components/PredictionsView';
import AspectOfLifeView from '../components/AspectOfLifeView';
import CombinedPredictionsView from '../components/CombinedPredictionsView';
import VariousBalasView from '../components/VariousBalasView';
import MandiView from '../components/MandiView';
import { calculateNakshatra } from '../utils/nakshatraUtils';
import ErrorBoundary from '../components/ErrorBoundary';

import { useTranslation } from 'react-i18next';

const ResultsPage = ({
    results,
    formData,
    onBack,
    onOpenTraitReport,
    onOpenVedicReport,
    onOpenAdvancedTrait,
    onOpenSavedCharts,
    onOpenMatchNew,
    onOpenMatchTraditional,
    onLogout,
    onOpenBalasInfo,
    onOpenMandiInfo,
    initialActiveTab = 'charts',
    onOpenSettings,
    userType = 'basic'
}) => {
    const { t } = useTranslation();
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [exporting, setExporting] = useState(false);
    const [activeTab, setActiveTab] = useState(initialActiveTab || 'charts');
    const [componentsOpen, setComponentsOpen] = useState(true);
    const [toolsOpen, setToolsOpen] = useState(true);
    const [miscOpen, setMiscOpen] = useState(true);
    const [otherOpen, setOtherOpen] = useState(true);
    const contentRef = useRef(null);
    const pdfRef = useRef(null);

    const signNames = [
        'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];

    const moonSignIndex = results?.Moon?.longitude !== undefined
        ? Math.floor(results.Moon.longitude / 30)
        : null;
    const lagnaSignIndex = results?.Ascendant?.longitude !== undefined
        ? Math.floor(results.Ascendant.longitude / 30)
        : null;
    const moonNak = results?.Moon?.longitude !== undefined
        ? calculateNakshatra(results.Moon.longitude)
        : null;

    const handleSaveChart = async () => {
        setSaving(true);
        setSaveMessage('');

        const token = localStorage.getItem('token');

        // Prepare chart data
        const chartPayload = {
            name: formData.name || 'My Chart',
            dateOfBirth: formData.date,
            timeOfBirth: formData.time,
            placeOfBirth: {
                city: formData.city,
                lat: formData.latitude,
                lng: formData.longitude
            },
            chartData: results
        };

        // If Guest (no token), save to LocalStorage
        if (!token) {
            try {
                const localCharts = JSON.parse(localStorage.getItem('savedCharts') || '[]');
                const newChart = {
                    ...chartPayload,
                    _id: 'local_' + Date.now(),
                    createdAt: new Date().toISOString(),
                    isLocal: true
                };
                localCharts.push(newChart);
                localStorage.setItem('savedCharts', JSON.stringify(localCharts));

                setSaveMessage('Saved to Browser (Guest Mode)');
                setTimeout(() => setSaveMessage(''), 3000);
            } catch (error) {
                console.error('Error saving locally:', error);
                setSaveMessage('Failed to save locally');
            } finally {
                setSaving(false);
            }
            return;
        }

        // If Logged In, save to Backend
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.post(`${API_URL}/api/charts`, chartPayload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSaveMessage('Chart saved to Cloud!');
            setTimeout(() => setSaveMessage(''), 3000);
        } catch (error) {
            console.error('Error saving chart:', error);
            setSaveMessage('Failed to save chart');
        } finally {
            setSaving(false);
        }
    };

    const handleDownloadPDF = async () => {
        setExporting(true);
        const fileName = `${formData.name || 'Birth_Chart'}_Vedic_Report.pdf`;
        await generatePDF(pdfRef.current, fileName);
        setExporting(false);
    };

    return (
        <>
            <header className="results-header" style={{ position: 'relative' }}>
                <div className="header-left">
                    <button className="back-btn" onClick={onBack}>
                        ← {t('common.back', 'Back')}
                    </button>
                </div>

                <div className="birth-info" style={{ flex: 1, textAlign: 'center' }}>
                    <h1>{formData?.name || t('results.birthChart', 'Birth Chart')}</h1>
                    <p>
                        {t('results.bornOn', 'Born on')} {formData?.date} {t('results.at', 'at')} {formData?.time}
                        {formData?.city && ` ${t('results.in', 'in')} ${formData.city}`}
                    </p>
                    {(moonSignIndex !== null || moonNak || lagnaSignIndex !== null) && (
                        <p>
                            {moonSignIndex !== null && (
                                <span>
                                    Rasi: {t(`signs.${signNames[moonSignIndex]}`, signNames[moonSignIndex])}
                                </span>
                            )}
                            {moonNak && (
                                <span style={{ marginLeft: moonSignIndex !== null ? 12 : 0 }}>
                                    , Nakshatra: {moonNak.name} - {moonNak.pada}
                                </span>
                            )}
                            {lagnaSignIndex !== null && (
                                <span style={{ marginLeft: 12 }}>
                                    , Lagna: {t(`signs.${signNames[lagnaSignIndex]}`, signNames[lagnaSignIndex])}
                                </span>
                            )}
                        </p>
                    )}
                </div>

                <div className="header-right" />

                {onOpenSettings && (
                    <button
                        type="button"
                        className="gear-btn"
                        onClick={onOpenSettings}
                        title={t('settings.settings', 'Settings')}
                        style={{ position: 'absolute', top: 0, right: 0 }}
                    >
                        ⚙️
                    </button>
                )}
            </header>

            <main className="results-main results-layout" ref={contentRef}>
                <aside className="sticky-sidebar">
                    <div className="sidebar-header" style={{ marginBottom: '0.5rem' }}>
                        <h3>{t('results.yourCharts', 'Your Charts')}</h3>
                    </div>
                    <div className="sidebar-tabs" style={{ marginBottom: '1rem' }}>
                        <button
                            type="button"
                            className="sidebar-tab"
                            onClick={onOpenSavedCharts}
                        >
                            {t('nav.savedCharts', 'Saved Charts')}
                        </button>
                    </div>

                    <div className="sidebar-header" onClick={() => setComponentsOpen(!componentsOpen)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h3>{t('results.components', 'Components')}</h3>
                        <span>{componentsOpen ? '▾' : '▸'}</span>
                    </div>
                    {componentsOpen && (
                        <div className="sidebar-tabs">
                            <button
                                type="button"
                                className={activeTab === 'charts' ? 'sidebar-tab active' : 'sidebar-tab'}
                                onClick={() => setActiveTab('charts')}
                            >
                                {t('results.charts', 'Charts')}
                            </button>
                            <button
                                type="button"
                                className={activeTab === 'nakshatra' ? 'sidebar-tab active' : 'sidebar-tab'}
                                onClick={() => setActiveTab('nakshatra')}
                            >
                                {t('results.nakshatra', 'Nakshatra & Predictions')}
                            </button>
                            <button
                                type="button"
                                className={activeTab === 'dasha' ? 'sidebar-tab active' : 'sidebar-tab'}
                                onClick={() => setActiveTab('dasha')}
                            >
                                {t('results.dasha', 'Dasha')}
                            </button>
                            <button
                                type="button"
                                className={activeTab === 'aspects' ? 'sidebar-tab active' : 'sidebar-tab'}
                                onClick={() => setActiveTab('aspects')}
                            >
                                {t('results.aspects', 'Aspects')}
                            </button>
                            <button
                                type="button"
                                className={activeTab === 'strengths' ? 'sidebar-tab active' : 'sidebar-tab'}
                                onClick={() => setActiveTab('strengths')}
                            >
                                {t('results.strengths', 'Strengths')}
                            </button>
                            <button
                                type="button"
                                className={activeTab === 'yogas' ? 'sidebar-tab active' : 'sidebar-tab'}
                                onClick={() => setActiveTab('yogas')}
                            >
                                {t('results.yogas', 'Yogas')}
                            </button>
                            <button
                                type="button"
                                className={activeTab === 'houses' ? 'sidebar-tab active' : 'sidebar-tab'}
                                onClick={() => setActiveTab('houses')}
                            >
                                {t('results.houses', 'Houses')}
                            </button>
                            <button
                                type="button"
                                className={activeTab === 'positions' ? 'sidebar-tab active' : 'sidebar-tab'}
                                onClick={() => setActiveTab('positions')}
                            >
                                {t('results.positions', 'Positions Table')}
                            </button>
                            <button
                                type="button"
                                className={activeTab === 'predictions' ? 'sidebar-tab active' : 'sidebar-tab'}
                                onClick={() => setActiveTab('predictions')}
                            >
                                {t('results.predictions', 'Predictions')}
                            </button>
                            <button
                                type="button"
                                className="sidebar-tab"
                                onClick={onOpenVedicReport}
                            >
                                {t('results.detailedVedic', 'Detailed Vedic Analysis')}
                            </button>
                        </div>
                    )}

                    {userType === 'advance' && (
                        <>
                            <div className="sidebar-header" onClick={() => setMiscOpen(!miscOpen)} style={{ cursor: 'pointer', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <h3>{t('nav.advance', 'Advance')}</h3>
                                <span>{miscOpen ? '▾' : '▸'}</span>
                            </div>
                            {miscOpen && (
                                <div className="sidebar-tabs">
                                    <button
                                        type="button"
                                        className="sidebar-tab"
                                        onClick={onOpenTraitReport}
                                    >
                                        {t('results.detailedTrait', 'Detailed Trait Analysis')}
                                    </button>
                                    <button
                                        type="button"
                                        className="sidebar-tab"
                                        onClick={onOpenAdvancedTrait}
                                    >
                                        {t('results.advancedTrait', 'Advance Trait Analysis')}
                                    </button>
                                    <button
                                        type="button"
                                        className={activeTab === 'aspectOfLife' ? 'sidebar-tab active' : 'sidebar-tab'}
                                        onClick={() => setActiveTab('aspectOfLife')}
                                    >
                                        {t('results.aspectOfLife', 'Aspect of Life')}
                                    </button>
                                    <button
                                        type="button"
                                        className={activeTab === 'variousBalas' ? 'sidebar-tab active' : 'sidebar-tab'}
                                        onClick={() => setActiveTab('variousBalas')}
                                    >
                                        {t('results.variousBalas', 'Various Balas')}
                                    </button>
                                    <button
                                        type="button"
                                        className={activeTab === 'mandi' ? 'sidebar-tab active' : 'sidebar-tab'}
                                        onClick={() => setActiveTab('mandi')}
                                    >
                                        {t('results.mandi', 'Mandi (Gulika)')}
                                    </button>
                                </div>
                            )}
                        </>
                    )}

                    <div className="sidebar-header" style={{ marginTop: '1rem' }}>
                        <h3>{t('settings.logout', 'Logout')}</h3>
                    </div>
                    <div className="sidebar-tabs">
                        <button
                            type="button"
                            className="sidebar-tab"
                            onClick={onLogout}
                        >
                            {t('settings.logout', 'Logout')} ({t('results.guestUser', 'Guest User')})
                        </button>
                    </div>
                </aside>

                <div className="results-content-column">
                    <ErrorBoundary>
                        <div className="report-header-print" style={{ display: 'none' }}>
                            <h1>Vedic Astrology Report</h1>
                            <h2>{formData?.name}</h2>
                            <p>{formData?.date} | {formData?.time} | {formData?.city}</p>
                        </div>

                        {activeTab === 'charts' && (
                            <>
                                <div className="card chart-card">
                                    <BirthChart data={results} formData={formData} />
                                </div>

                                <div className="card chart-card">
                                    <BirthChart
                                        data={results}
                                        formData={formData}
                                        defaultDivision="d9"
                                        hideControls={true}
                                    />
                                </div>
                            </>
                        )}

                        {activeTab === 'nakshatra' && (
                            <>
                                <div className="card nakshatra-card">
                                    <NakshatraInfo data={results} />
                                </div>
                                <div className="card predictions-card">
                                    <PredictionsView data={results} />
                                </div>
                            </>
                        )}

                        {activeTab === 'dasha' && (
                            <div className="card dasha-card">
                                <DashaTable
                                    moonLongitude={results?.Moon?.longitude}
                                    birthDate={formData?.date}
                                />
                            </div>
                        )}

                        {activeTab === 'aspects' && (
                            <div className="card aspects-card">
                                <AspectsView data={results} />
                            </div>
                        )}

                        {activeTab === 'strengths' && (
                            <div className="card strength-card-full">
                                <StrengthView data={results} />
                            </div>
                        )}

                        {activeTab === 'yogas' && (
                            <div className="card yogas-card-full">
                                <YogasView data={results} />
                            </div>
                        )}

                        {activeTab === 'houses' && (
                            <div className="card house-analysis-card-full">
                                <HouseAnalysisView data={results} />
                            </div>
                        )}

                        {activeTab === 'aspectOfLife' && (
                            <div className="card aspect-life-card-full">
                                <AspectOfLifeView
                                    chartData={results}
                                    birthDate={formData?.date}
                                />
                            </div>
                        )}

                        {activeTab === 'predictions' && (
                            <div className="card aspect-life-card-full">
                                <CombinedPredictionsView
                                    chartData={results}
                                    birthDate={formData?.date}
                                />
                            </div>
                        )}

                        {activeTab === 'variousBalas' && (
                            <div className="card various-balas-card-full">
                                <VariousBalasView chartData={results} onOpenInfo={onOpenBalasInfo} />
                            </div>
                        )}

                        {activeTab === 'mandi' && (
                            <div className="card mandi-card-full">
                                <MandiView chartData={results} formData={formData} onOpenInfo={onOpenMandiInfo} />
                            </div>
                        )}

                        {activeTab === 'positions' && (
                            <div className="card table-card">
                                <h2>{t('results.planetaryPositions', 'Planetary Positions')}</h2>
                                <ResultsTable data={results} />
                            </div>
                        )}
                    </ErrorBoundary >
                </div >
            </main >

            <footer className="app-footer">
                <p>{t('home.footer', 'Powered by Swiss Ephemeris & Node.js')}</p>
            </footer>

            {/* Hidden Container for PDF Generation */}
            <div style={{ position: 'absolute', left: '-9999px', top: 0, width: '210mm', background: '#0f172a', color: '#e2e8f0', padding: '20px' }} ref={pdfRef}>
                <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
                    <h1 style={{ color: '#a78bfa', margin: '0 0 10px 0' }}>Vedic Astrology Report</h1>
                    <h2 style={{ margin: '0 0 5px 0' }}>{formData?.name}</h2>
                    <p style={{ margin: 0, color: '#94a3b8' }}>{formData?.date} | {formData?.time} | {formData?.city}</p>
                </div>

                <div className="pdf-section" style={{ marginBottom: '30px' }}>
                    <h3 style={{ color: '#f472b6', borderBottom: '1px solid #334155', paddingBottom: '5px', marginBottom: '15px' }}>{t('results.birthChart', 'Birth Chart')} (Rasi)</h3>
                    <BirthChart data={results} formData={formData} />
                </div>

                <div className="pdf-section" style={{ marginBottom: '30px', pageBreakBefore: 'always' }}>
                    <h3 style={{ color: '#f472b6', borderBottom: '1px solid #334155', paddingBottom: '5px', marginBottom: '15px' }}>Navamsa (D-9)</h3>
                    <BirthChart data={results} formData={formData} defaultDivision="d9" hideControls={true} />
                </div>

                <div className="pdf-section" style={{ marginBottom: '30px', pageBreakBefore: 'always' }}>
                    <h3 style={{ color: '#f472b6', borderBottom: '1px solid #334155', paddingBottom: '5px', marginBottom: '15px' }}>{t('results.nakshatra', 'Nakshatra & Predictions')}</h3>
                    <NakshatraInfo data={results} />
                    <div style={{ marginTop: '20px' }}>
                        <PredictionsView data={results} />
                    </div>
                </div>

                <div className="pdf-section" style={{ marginBottom: '30px', pageBreakBefore: 'always' }}>
                    <h3 style={{ color: '#f472b6', borderBottom: '1px solid #334155', paddingBottom: '5px', marginBottom: '15px' }}>{t('results.dasha', 'Dasha')}</h3>
                    <DashaTable moonLongitude={results?.Moon?.longitude} birthDate={formData?.date} />
                </div>

                <div className="pdf-section" style={{ marginBottom: '30px', pageBreakBefore: 'always' }}>
                    <h3 style={{ color: '#f472b6', borderBottom: '1px solid #334155', paddingBottom: '5px', marginBottom: '15px' }}>{t('results.aspects', 'Aspects')}</h3>
                    <AspectsView data={results} />
                </div>

                <div className="pdf-section" style={{ marginBottom: '30px', pageBreakBefore: 'always' }}>
                    <h3 style={{ color: '#f472b6', borderBottom: '1px solid #334155', paddingBottom: '5px', marginBottom: '15px' }}>{t('results.strengths', 'Strengths')}</h3>
                    <StrengthView data={results} />
                </div>

                <div className="pdf-section" style={{ marginBottom: '30px', pageBreakBefore: 'always' }}>
                    <h3 style={{ color: '#f472b6', borderBottom: '1px solid #334155', paddingBottom: '5px', marginBottom: '15px' }}>{t('results.yogas', 'Yogas')}</h3>
                    <YogasView data={results} />
                </div>

                <div className="pdf-section" style={{ marginBottom: '30px', pageBreakBefore: 'always' }}>
                    <h3 style={{ color: '#f472b6', borderBottom: '1px solid #334155', paddingBottom: '5px', marginBottom: '15px' }}>{t('results.houses', 'Houses')}</h3>
                    <HouseAnalysisView data={results} />
                </div>

                <div className="pdf-section" style={{ marginBottom: '30px', pageBreakBefore: 'always' }}>
                    <h3 style={{ color: '#f472b6', borderBottom: '1px solid #334155', paddingBottom: '5px', marginBottom: '15px' }}>{t('results.positions', 'Planetary Positions')}</h3>
                    <ResultsTable data={results} />
                </div>

                <div style={{ textAlign: 'center', marginTop: '50px', borderTop: '1px solid #334155', paddingTop: '10px', color: '#64748b', fontSize: '0.8rem' }}>
                    <p>{t('home.footer', 'Powered by Swiss Ephemeris & Node.js')}</p>
                </div>
            </div>
        </>
    );
};

export default ResultsPage;
