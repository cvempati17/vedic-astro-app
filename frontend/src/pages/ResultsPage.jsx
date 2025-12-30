import React, { useState, useRef } from 'react';
import axios from 'axios';
import BirthChart from '../components/BirthChart';
import AspectsView from '../components/AspectsView';
import StrengthView from '../components/StrengthView';
import YogasView from '../components/YogasView';
import HouseAnalysisView from '../components/HouseAnalysisView';
import { generatePDF } from '../utils/pdfUtils';
import NakshatraInfo from '../components/NakshatraInfo';
import DashaView from '../components/DashaView';
import ResultsTable from '../components/ResultsTable';
import PredictionsView from '../components/PredictionsView';
import AspectOfLifeView from '../components/AspectOfLifeView';
import CombinedPredictionsView from '../components/CombinedPredictionsView';
import VariousBalasView from '../components/VariousBalasView';
import AboutMeView from '../components/AboutMeView';
import MandiView from '../components/MandiView';
import AdvancedChartView from '../components/AdvancedChartView';
import { calculateNakshatra } from '../utils/nakshatraUtils';
import { calculateAvastha, calculateDignity, getPlanetNature } from '../utils/strengthUtils';
import { calculateD9 } from '../utils/divisionalCharts';
import RibbonMenu from '../components/RibbonMenu';
import { Icons } from '../components/uiIcons.jsx';
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
    const [aboutMeSection, setAboutMeSection] = useState('subjects');
    const contentRef = useRef(null);
    const pdfRef = useRef(null);

    const signNames = [
        'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];

    const signLords = {
        Aries: 'Mars',
        Taurus: 'Venus',
        Gemini: 'Mercury',
        Cancer: 'Moon',
        Leo: 'Sun',
        Virgo: 'Mercury',
        Libra: 'Venus',
        Scorpio: 'Mars',
        Sagittarius: 'Jupiter',
        Capricorn: 'Saturn',
        Aquarius: 'Saturn',
        Pisces: 'Jupiter'
    };

    const getRasiName = (long) => {
        if (typeof long !== 'number' || Number.isNaN(long)) return '';
        return signNames[Math.floor((long % 360) / 30)] || '';
    };

    const formatDegInSignCompact = (long) => {
        if (typeof long !== 'number' || Number.isNaN(long)) return '';
        const degInSign = ((long % 360) + 360) % 360;
        const d = Math.floor(degInSign % 30);
        const mFloat = (degInSign % 30 - d) * 60;
        const m = Math.floor(mFloat);
        const s = Math.floor((mFloat - m) * 60);
        return `${String(d).padStart(2, '0')}${String(m).padStart(2, '0')}'${String(s).padStart(2, '0')}"`;
    };

    const getHouseFromRef = (planetLong, refLong) => {
        if (typeof planetLong !== 'number' || Number.isNaN(planetLong)) return '';
        if (typeof refLong !== 'number' || Number.isNaN(refLong)) return '';
        const planetSign = Math.floor(((planetLong % 360) + 360) % 360 / 30);
        const refSign = Math.floor(((refLong % 360) + 360) % 360 / 30);
        return ((planetSign - refSign + 12) % 12) + 1;
    };

    const angularSeparation = (a, b) => {
        const da = ((a % 360) + 360) % 360;
        const db = ((b % 360) + 360) % 360;
        const diff = Math.abs(da - db);
        return Math.min(diff, 360 - diff);
    };

    const isCombust = (planetName, planetLong, sunLong) => {
        if (typeof planetLong !== 'number' || Number.isNaN(planetLong)) return false;
        if (typeof sunLong !== 'number' || Number.isNaN(sunLong)) return false;
        if (planetName === 'Sun' || planetName === 'Rahu' || planetName === 'Ketu') return false;
        const sep = angularSeparation(planetLong, sunLong);
        const thresholds = {
            Moon: 12,
            Mercury: 14,
            Venus: 10,
            Mars: 17,
            Jupiter: 11,
            Saturn: 15
        };
        const th = thresholds[planetName];
        if (typeof th !== 'number') return false;
        return sep <= th;
    };

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

            <main className="results-main" ref={contentRef}>
                <RibbonMenu
                    logo={(
                        <span className="ribbon-logo" title="AstroGravity">
                            <img src="/AstroGravity_Logo_1.jpg" alt="AstroGravity" />
                        </span>
                    )}
                    title={t('results.yourCharts', 'Your Charts')}
                    defaultTabKey="aboutMe" // Start with About Me for demo if desired, or 'components'
                    tabs={[
                        {
                            key: 'yourCharts',
                            label: t('results.yourCharts', 'Your Charts'),
                            icon: Icons.home(),
                            groups: [
                                {
                                    key: 'navGroup',
                                    label: 'Navigation',
                                    actions: [
                                        { key: 'savedCharts', label: t('nav.savedCharts', 'Saved Charts'), onClick: onOpenSavedCharts, icon: Icons.grid() }
                                    ]
                                }
                            ]
                        },
                        {
                            key: 'components',
                            label: t('results.components', 'Components'),
                            icon: Icons.grid(),
                            groups: [
                                {
                                    key: 'chartsGroup',
                                    label: 'Charts',
                                    actions: [
                                        { key: 'charts', label: t('results.charts', 'Charts'), onClick: () => setActiveTab('charts'), variant: activeTab === 'charts' ? 'primary' : undefined, icon: Icons.chart() },
                                        { key: 'advancedChart', label: t('results.advancedChart', 'Advanced Chart'), onClick: () => setActiveTab('advancedChart'), variant: activeTab === 'advancedChart' ? 'primary' : undefined, icon: Icons.chart() }
                                    ]
                                },
                                {
                                    key: 'analysisGroup',
                                    label: 'Analysis',
                                    actions: [
                                        { key: 'nakshatra', label: t('results.nakshatra', 'Nakshatra & Predictions'), onClick: () => setActiveTab('nakshatra'), variant: activeTab === 'nakshatra' ? 'primary' : undefined, icon: Icons.star() },
                                        { key: 'dasha', label: t('results.dasha', 'Dasha'), onClick: () => setActiveTab('dasha'), variant: activeTab === 'dasha' ? 'primary' : undefined, icon: Icons.report() },
                                        { key: 'aspects', label: t('results.aspects', 'Aspects'), onClick: () => setActiveTab('aspects'), variant: activeTab === 'aspects' ? 'primary' : undefined, icon: Icons.report() },
                                        { key: 'strengths', label: t('results.strengths', 'Strengths'), onClick: () => setActiveTab('strengths'), variant: activeTab === 'strengths' ? 'primary' : undefined, icon: Icons.report() },
                                        { key: 'yogas', label: t('results.yogas', 'Yogas'), onClick: () => setActiveTab('yogas'), variant: activeTab === 'yogas' ? 'primary' : undefined, icon: Icons.report() },
                                        { key: 'houses', label: t('results.houses', 'Houses'), onClick: () => setActiveTab('houses'), variant: activeTab === 'houses' ? 'primary' : undefined, icon: Icons.table() }
                                    ]
                                },
                                {
                                    key: 'tablesGroup',
                                    label: 'Tables',
                                    actions: [
                                        { key: 'positions', label: t('results.positions', 'Positions Table'), onClick: () => setActiveTab('positions'), variant: activeTab === 'positions' ? 'primary' : undefined, icon: Icons.table() },
                                        { key: 'detailPositions', label: 'Detail Position Table', onClick: () => setActiveTab('detailPositions'), variant: activeTab === 'detailPositions' ? 'primary' : undefined, icon: Icons.table() }
                                    ]
                                },
                                {
                                    key: 'predictionsGroup',
                                    label: 'Predictions',
                                    actions: [
                                        { key: 'predictions', label: t('results.predictions', 'Predictions'), onClick: () => setActiveTab('predictions'), variant: activeTab === 'predictions' ? 'primary' : undefined, icon: Icons.star() },
                                        { key: 'detailedVedic', label: t('results.detailedVedic', 'Detailed Vedic Analysis'), onClick: onOpenVedicReport, icon: Icons.report() }
                                    ]
                                }
                            ]
                        },
                        {
                            key: 'aboutMe',
                            label: 'About Me',
                            icon: Icons.star(),
                            groups: [
                                {
                                    key: 'careerGroup',
                                    label: 'Career & Wealth',
                                    actions: [
                                        { key: 'subjects', label: 'My Subjects', onClick: () => { setActiveTab('aboutMe'); setAboutMeSection('subjects'); }, icon: Icons.star(), variant: (activeTab === 'aboutMe' && aboutMeSection === 'subjects') ? 'primary' : undefined },
                                        { key: 'profession', label: 'My Profession', onClick: () => { setActiveTab('aboutMe'); setAboutMeSection('profession'); }, icon: Icons.chart(), variant: (activeTab === 'aboutMe' && aboutMeSection === 'profession') ? 'primary' : undefined },
                                        { key: 'enterprise', label: 'My Enterprise', onClick: () => { setActiveTab('aboutMe'); setAboutMeSection('enterprise'); }, icon: Icons.chart(), variant: (activeTab === 'aboutMe' && aboutMeSection === 'enterprise') ? 'primary' : undefined },
                                        { key: 'finances', label: 'My Finances', onClick: () => { setActiveTab('aboutMe'); setAboutMeSection('finances'); }, icon: Icons.table(), variant: (activeTab === 'aboutMe' && aboutMeSection === 'finances') ? 'primary' : undefined },
                                        { key: 'properties', label: 'My Properties', onClick: () => { setActiveTab('aboutMe'); setAboutMeSection('properties'); }, icon: Icons.home(), variant: (activeTab === 'aboutMe' && aboutMeSection === 'properties') ? 'primary' : undefined }
                                    ]
                                },
                                {
                                    key: 'personalGroup',
                                    label: 'Personal & Life',
                                    actions: [
                                        { key: 'health', label: 'My Health', onClick: () => { setActiveTab('aboutMe'); setAboutMeSection('health'); }, icon: Icons.report(), variant: (activeTab === 'aboutMe' && aboutMeSection === 'health') ? 'primary' : undefined },
                                        { key: 'relationship', label: 'My Relationship', onClick: () => { setActiveTab('aboutMe'); setAboutMeSection('relationship'); }, icon: Icons.star(), variant: (activeTab === 'aboutMe' && aboutMeSection === 'relationship') ? 'primary' : undefined },
                                        { key: 'travel', label: 'Foreign Travel', onClick: () => { setActiveTab('aboutMe'); setAboutMeSection('travel'); }, icon: Icons.grid(), variant: (activeTab === 'aboutMe' && aboutMeSection === 'travel') ? 'primary' : undefined },
                                        { key: 'spiritual', label: 'Spiritual Growth', onClick: () => { setActiveTab('aboutMe'); setAboutMeSection('spiritual'); }, icon: Icons.star(), variant: (activeTab === 'aboutMe' && aboutMeSection === 'spiritual') ? 'primary' : undefined },
                                        { key: 'eol', label: 'Eq. of Life', onClick: () => { setActiveTab('aboutMe'); setAboutMeSection('eol'); }, icon: Icons.report(), variant: (activeTab === 'aboutMe' && aboutMeSection === 'eol') ? 'primary' : undefined }
                                    ]
                                }
                            ]
                        },
                        ...(userType === 'advance'
                            ? [
                                {
                                    key: 'advance',
                                    label: t('nav.advance', 'Advance'),
                                    icon: Icons.tool(),
                                    groups: [
                                        {
                                            key: 'reportsGroup',
                                            label: 'Reports',
                                            actions: [
                                                { key: 'detailedTrait', label: t('results.detailedTrait', 'Detailed Trait Analysis'), onClick: onOpenTraitReport, icon: Icons.report() },
                                                { key: 'advancedTrait', label: t('results.advancedTrait', 'Advance Trait Analysis'), onClick: onOpenAdvancedTrait, icon: Icons.report() }
                                            ]
                                        },
                                        {
                                            key: 'toolsGroup',
                                            label: 'Tools',
                                            actions: [
                                                { key: 'aspectOfLife', label: t('results.aspectOfLife', 'Aspect of Life'), onClick: () => setActiveTab('aspectOfLife'), variant: activeTab === 'aspectOfLife' ? 'primary' : undefined, icon: Icons.star() },
                                                { key: 'variousBalas', label: t('results.variousBalas', 'Various Balas'), onClick: () => setActiveTab('variousBalas'), variant: activeTab === 'variousBalas' ? 'primary' : undefined, icon: Icons.report() },
                                                { key: 'mandi', label: t('results.mandi', 'Mandi (Gulika)'), onClick: () => setActiveTab('mandi'), variant: activeTab === 'mandi' ? 'primary' : undefined, icon: Icons.report() }
                                            ]
                                        }
                                    ]
                                }
                            ]
                            : []),
                        {
                            key: 'logout',
                            label: t('settings.logout', 'Logout'),
                            icon: Icons.logout(),
                            groups: [
                                {
                                    key: 'logoutGroup',
                                    label: 'Account',
                                    actions: [
                                        { key: 'logoutBtn', label: `${t('settings.logout', 'Logout')} (${t('results.guestUser', 'Guest User')})`, onClick: onLogout, icon: Icons.logout() }
                                    ]
                                }
                            ]
                        }
                    ]}
                />

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
                                <DashaView
                                    moonLongitude={results?.Moon?.longitude}
                                    birthDate={formData?.date}
                                    chartData={results}
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

                        {activeTab === 'aboutMe' && (
                            <div className="card aspect-life-card-full" style={{ minHeight: '600px', display: 'flex' }}>
                                <AboutMeView
                                    chartData={results}
                                    birthDate={formData?.date}
                                    initialSection={aboutMeSection}
                                />
                            </div>
                        )}

                        {activeTab === 'advancedChart' && (
                            <div className="card advanced-chart-card-full" style={{ overflowX: 'auto' }}>
                                <AdvancedChartView
                                    results={results}
                                    formData={formData}
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

                        {activeTab === 'detailPositions' && (
                            <div className="card table-card" style={{ overflowX: 'auto' }}>
                                <h2>Detail Position Table</h2>
                                <table className="results-table">
                                    <thead>
                                        <tr>
                                            <th>Planet</th>
                                            <th>Sign</th>
                                            <th>Sign Lord</th>
                                            <th>Nakshatra</th>
                                            <th>Naksh Lord</th>
                                            <th>Degree</th>
                                            <th>Retro(R)</th>
                                            <th>Combust</th>
                                            <th>Avastha</th>
                                            <th>HSE frm ASC</th>
                                            <th>Status</th>
                                            <th>HSE frm Moon</th>
                                            <th>Navamasa</th>
                                            <th>Function</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(() => {
                                            const ascLong = results?.Ascendant?.longitude;
                                            const moonLong = results?.Moon?.longitude;
                                            const sunLong = results?.Sun?.longitude;

                                            const buildRow = (label, planetKey, info) => {
                                                const long = info?.longitude;
                                                const sign = getRasiName(long);
                                                const signLord = signLords[sign] || '';
                                                const nak = typeof long === 'number' ? calculateNakshatra(((long % 360) + 360) % 360) : null;
                                                const nakLabel = nak ? `${nak.name} - ${nak.pada}` : '';
                                                const nakLord = nak?.lord || '';
                                                const degree = formatDegInSignCompact(long);
                                                const retro = (typeof info?.speed === 'number' && info.speed < 0) ? 'Retro' : 'Direct';
                                                const combust = isCombust(planetKey, long, sunLong) ? 'Yes' : 'No';
                                                const avastha = typeof long === 'number' ? (calculateAvastha(((long % 360) + 360) % 360)?.state || '') : '';
                                                const hFromAsc = getHouseFromRef(long, ascLong);
                                                const dignity = (planetKey && typeof long === 'number' && typeof ascLong === 'number')
                                                    ? calculateDignity(planetKey, ((long % 360) + 360) % 360, ((ascLong % 360) + 360) % 360)
                                                    : null;
                                                const status = dignity?.status || '';
                                                const hFromMoon = getHouseFromRef(long, moonLong);
                                                const navLong = typeof long === 'number' ? calculateD9(((long % 360) + 360) % 360) : null;
                                                const navSign = typeof navLong === 'number' ? getRasiName(((navLong % 360) + 360) % 360) : '';
                                                const nature = (planetKey && typeof ascLong === 'number') ? getPlanetNature(planetKey, ((ascLong % 360) + 360) % 360) : null;
                                                const func = planetKey === 'Ascendant'
                                                    ? ''
                                                    : (nature?.isBenefic ? 'Very Benefic' : (planetKey ? 'Malefics' : ''));

                                                return (
                                                    <tr key={`detail-${planetKey || label}`}>
                                                        <td>{label}</td>
                                                        <td>{sign}</td>
                                                        <td>{signLord}</td>
                                                        <td>{nakLabel}</td>
                                                        <td>{nakLord}</td>
                                                        <td>{degree}</td>
                                                        <td>{retro}</td>
                                                        <td>{combust}</td>
                                                        <td>{avastha}</td>
                                                        <td>{hFromAsc}</td>
                                                        <td>{status}</td>
                                                        <td>{hFromMoon}</td>
                                                        <td>{navSign}</td>
                                                        <td>{func}</td>
                                                    </tr>
                                                );
                                            };

                                            const rows = [];
                                            if (results?.Ascendant) rows.push(buildRow('Ascendant', 'Ascendant', results.Ascendant));

                                            const planetOrder = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
                                            planetOrder.forEach((p) => {
                                                if (!results?.[p]) return;
                                                rows.push(buildRow(p, p, results[p]));
                                            });

                                            return rows;
                                        })()}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </ErrorBoundary>
                </div>
            </main>

            {/* Hidden Container for PDF Generation - Reusing existing structure */}
            <div style={{ position: 'absolute', left: '-9999px', top: 0, width: '210mm', background: '#0A192F', color: '#E6E6E6', padding: '20px' }} ref={pdfRef}>
                {/* ... PDF content (abbreviated in this restore, but should persist if I write full) ... */}
                {/* For brevity I'll trust the user wants the functional UI first. */}
                {/* Actually, I should include the PDF sections or they will be lost. */}
                {/* Using the previous file content for PDF sections */}
                <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '1px solid #C5A059', paddingBottom: '10px' }}>
                    <h1 style={{ color: '#C5A059', margin: '0 0 10px 0', fontFamily: 'Playfair Display' }}>Vedic Astrology Report</h1>
                    <h2 style={{ margin: '0 0 5px 0' }}>{formData?.name}</h2>
                    <p style={{ margin: 0, color: '#E6E6E6' }}>{formData?.date} | {formData?.time} | {formData?.city}</p>
                </div>

                <div className="pdf-section" style={{ marginBottom: '30px' }}>
                    <h3 style={{ color: '#C5A059', borderBottom: '1px solid #C5A059', paddingBottom: '5px', marginBottom: '15px', fontFamily: 'Playfair Display' }}>{t('results.birthChart', 'Birth Chart')} (Rasi)</h3>
                    <BirthChart data={results} formData={formData} />
                </div>

                <div className="pdf-section" style={{ marginBottom: '30px', pageBreakBefore: 'always' }}>
                    <h3 style={{ color: '#C5A059', borderBottom: '1px solid #C5A059', paddingBottom: '5px', marginBottom: '15px', fontFamily: 'Playfair Display' }}>Navamsa (D-9)</h3>
                    <BirthChart data={results} formData={formData} defaultDivision="d9" hideControls={true} />
                </div>

                <div className="pdf-section" style={{ marginBottom: '30px', pageBreakBefore: 'always' }}>
                    <h3 style={{ color: '#C5A059', borderBottom: '1px solid #C5A059', paddingBottom: '5px', marginBottom: '15px', fontFamily: 'Playfair Display' }}>{t('results.nakshatra', 'Nakshatra & Predictions')}</h3>
                    <NakshatraInfo data={results} />
                    <div style={{ marginTop: '20px' }}>
                        <PredictionsView data={results} />
                    </div>
                </div>

                <div className="pdf-section" style={{ marginBottom: '30px', pageBreakBefore: 'always' }}>
                    <h3 style={{ color: '#C5A059', borderBottom: '1px solid #C5A059', paddingBottom: '5px', marginBottom: '15px', fontFamily: 'Playfair Display' }}>{t('results.dasha', 'Dasha')}</h3>
                    <DashaView moonLongitude={results?.Moon?.longitude} birthDate={formData?.date} />
                </div>

                <div className="pdf-section" style={{ marginBottom: '30px', pageBreakBefore: 'always' }}>
                    <h3 style={{ color: '#C5A059', borderBottom: '1px solid #C5A059', paddingBottom: '5px', marginBottom: '15px', fontFamily: 'Playfair Display' }}>{t('results.aspectOfLife', 'Aspect of Life')}</h3>
                    <AspectOfLifeView chartData={results} birthDate={formData?.date} />
                </div>

                <div className="pdf-section" style={{ marginBottom: '30px', pageBreakBefore: 'always' }}>
                    <h3 style={{ color: '#C5A059', borderBottom: '1px solid #C5A059', paddingBottom: '5px', marginBottom: '15px', fontFamily: 'Playfair Display' }}>{t('results.aspects', 'Aspects')}</h3>
                    <AspectsView data={results} />
                </div>

                <div className="pdf-section" style={{ marginBottom: '30px', pageBreakBefore: 'always' }}>
                    <h3 style={{ color: '#C5A059', borderBottom: '1px solid #C5A059', paddingBottom: '5px', marginBottom: '15px', fontFamily: 'Playfair Display' }}>{t('results.strengths', 'Strengths')}</h3>
                    <StrengthView data={results} />
                </div>

                <div className="pdf-section" style={{ marginBottom: '30px', pageBreakBefore: 'always' }}>
                    <h3 style={{ color: '#C5A059', borderBottom: '1px solid #C5A059', paddingBottom: '5px', marginBottom: '15px', fontFamily: 'Playfair Display' }}>{t('results.yogas', 'Yogas')}</h3>
                    <YogasView data={results} />
                </div>

                <div className="pdf-section" style={{ marginBottom: '30px', pageBreakBefore: 'always' }}>
                    <h3 style={{ color: '#C5A059', borderBottom: '1px solid #C5A059', paddingBottom: '5px', marginBottom: '15px', fontFamily: 'Playfair Display' }}>{t('results.houses', 'Houses')}</h3>
                    <HouseAnalysisView data={results} />
                </div>

                <div className="pdf-section" style={{ marginBottom: '30px', pageBreakBefore: 'always' }}>
                    <h3 style={{ color: '#C5A059', borderBottom: '1px solid #C5A059', paddingBottom: '5px', marginBottom: '15px', fontFamily: 'Playfair Display' }}>{t('results.positions', 'Planetary Positions')}</h3>
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
