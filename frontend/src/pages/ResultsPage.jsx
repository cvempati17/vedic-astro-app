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

const ResultsPage = ({ results, formData, onBack, onViewDetailed }) => {
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [exporting, setExporting] = useState(false);
    const contentRef = useRef(null);

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
        await generatePDF(contentRef.current, fileName);
        setExporting(false);
    };

    return (
        <>
            <header className="results-header">
                <div className="header-left">
                    <button className="back-btn" onClick={onBack}>
                        ← Back
                    </button>
                </div>

                <div className="birth-info">
                    <h1>{formData?.name || 'Birth Chart'}</h1>
                    <p>
                        Born on {formData?.date} at {formData?.time}
                        {formData?.city && ` in ${formData.city}`}
                    </p>
                </div>

                <div className="header-right">
                    <button
                        className="detailed-btn"
                        onClick={onViewDetailed}
                        title="View Detailed Text Report"
                    >
                        📜 Detailed Report
                    </button>
                    <button
                        className="pdf-btn"
                        onClick={handleDownloadPDF}
                        disabled={exporting}
                        title="Download PDF Report"
                    >
                        {exporting ? 'Generating...' : '📄 PDF'}
                    </button>
                    <button
                        className="save-btn"
                        onClick={handleSaveChart}
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : '💾 Save'}
                    </button>
                    {saveMessage && <span className="save-msg">{saveMessage}</span>}
                </div>
            </header>

            <main className="results-main results-layout" ref={contentRef}>
                {/* Sticky Sidebar */}
                <aside className="sticky-sidebar">
                    <div className="sidebar-header">
                        <h3>Profile Details</h3>
                    </div>

                    <div className="sidebar-content">
                        <div className="sidebar-item">
                            <label>Name</label>
                            <div className="value">{formData?.name || 'Unknown'}</div>
                        </div>

                        <div className="sidebar-item">
                            <label>Ascendant</label>
                            <div className="value highlight">
                                {results?.Ascendant ? (
                                    ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'][Math.floor(results.Ascendant.longitude / 30)]
                                ) : '-'}
                            </div>
                        </div>
                    </div>
                </aside>

                <div className="results-content-column">
                    <div className="report-header-print" style={{ display: 'none' }}>
                        <h1>Vedic Astrology Report</h1>
                        <h2>{formData?.name}</h2>
                        <p>{formData?.date} | {formData?.time} | {formData?.city}</p>
                    </div>

                    <div className="card chart-card">
                        <BirthChart data={results} formData={formData} />
                    </div>

                    <div className="card nakshatra-card">
                        <NakshatraInfo data={results} />
                    </div>

                    <div className="card dasha-card">
                        <DashaTable
                            moonLongitude={results?.Moon?.longitude}
                            birthDate={formData?.date}
                        />
                    </div>

                    <div className="card aspects-card">
                        <AspectsView data={results} />
                    </div>

                    <div className="card strength-card-full">
                        <StrengthView data={results} />
                    </div>

                    <div className="card yogas-card-full">
                        <YogasView data={results} />
                    </div>

                    <div className="card house-analysis-card-full">
                        <HouseAnalysisView data={results} />
                    </div>

                    <div className="card table-card">
                        <h2>Planetary Positions</h2>
                        <ResultsTable data={results} />
                    </div>
                </div>
            </main>

            <footer className="app-footer">
                <p>Powered by Swiss Ephemeris & Node.js</p>
            </footer>
        </>
    );
};

export default ResultsPage;
