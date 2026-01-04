import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import BirthChart from '../components/BirthChart';
import { calculateNakshatra } from '../utils/nakshatraUtils';
import { calculateVimshottariDasha, formatDate, calculateAntardashas } from '../utils/dashaUtils';
import { calculateDignity, getPlanetNature, calculateAvastha } from '../utils/strengthUtils';
import './SnapshotPage.css';

const SnapshotPage = ({ results, formData, onBack, onUpdate }) => {
    const { t } = useTranslation();
    const [theme, setTheme] = useState('light'); // Force light for snapshot or respect app? User said "without color".

    if (!results || !formData) return <div className="loading">Loading Snapshot...</div>;

    const [charts, setCharts] = useState([]);
    const [selectedChartId, setSelectedChartId] = useState('');
    const [loadingCharts, setLoadingCharts] = useState(false);

    // Fetch Charts for Dropdown
    useEffect(() => {
        const fetchCharts = async () => {
            setLoadingCharts(true);
            const token = localStorage.getItem('token');
            const localCharts = JSON.parse(localStorage.getItem('savedCharts') || '[]');

            let allCharts = localCharts;

            if (token) {
                try {
                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                    const response = await axios.get(`${API_URL}/api/charts`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    // Merge, avoiding duplicates if any (simple concat for now as in SavedChartsPage)
                    allCharts = [...response.data, ...localCharts];
                } catch (err) {
                    console.error('Error fetching charts for snapshot dropdown:', err);
                }
            }
            setCharts(allCharts);

            // Try to set default selection based on current formData
            // Matching by Name and Date to be relatively safe
            const current = allCharts.find(c =>
                c.name === formData.name &&
                (c.dateOfBirth === formData.date || new Date(c.dateOfBirth).toISOString().split('T')[0] === formData.date)
            );
            if (current) {
                setSelectedChartId(current._id);
            }
            setLoadingCharts(false);
        };

        fetchCharts();
    }, [formData]); // Re-run if formData changes (e.g. after Generate) to update selection

    const handleGenerate = () => {
        const chart = charts.find(c => c._id === selectedChartId);
        if (!chart) return;

        if (!chart.chartData) {
            alert("This chart data has not been calculated yet. Please open it in Saved Charts and save it properly.");
            return;
        }

        const newFormData = {
            name: chart.name,
            date: chart.dateOfBirth, // Or format if needed
            time: chart.timeOfBirth,
            city: chart.placeOfBirth?.city,
            latitude: chart.placeOfBirth?.lat,
            longitude: chart.placeOfBirth?.lng,
            timezone: chart.placeOfBirth?.timezone,
            gender: chart.gender
        };

        if (onUpdate) {
            onUpdate(chart.chartData, newFormData);
        }
    };

    // --- Helpers ---
    const getRasiName = (long) => {
        if (long === undefined) return '';
        const rasis = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
        return rasis[Math.floor(long / 30)];
    };

    const formatLongitude = (long) => {
        if (long === undefined) return '';
        const d = Math.floor(long);
        const m = Math.floor((long - d) * 60);
        const s = Math.floor(((long - d) * 60 - m) * 60);
        return `${d}°${m}'${s}"`; // Simplified
    };

    const getHouse = (pLong, ascLong) => {
        if (pLong === undefined || ascLong === undefined) return '-';
        return (Math.floor(pLong / 30) - Math.floor(ascLong / 30) + 12) % 12 + 1;
    };

    const getNavamsaSign = (long) => {
        // Simple Navamsa Calc: (Total Mins / 200) % 12 ... 
        const deg = long % 30;
        const rasi = Math.floor(long / 30);
        // Each pada is 3 deg 20 min = 3.333 deg
        const pada = Math.floor(deg / 3.333333333333);

        // Aries, Leo, Sag start at Aries
        // Tau, Vir, Cap start at Capricorn
        // Gem, Lib, Aq start at Libra
        // Can, Sco, Pis start at Cancer
        // This is a rough approx, better to use division logic if available, but let's try standard mapping
        // Fire: 1,5,9 -> Start 1
        // Earth: 2,6,10 -> Start 10
        // Air: 3,7,11 -> Start 7
        // Water: 4,8,12 -> Start 4

        const type = (rasi % 4);
        let startSign = 0;
        if (type === 0) startSign = 0; // Aries (0), Leo(4), Sag(8) -> ? relative.
        // Wait:
        // Fiery (0,4,8): Starts at Aries(0)
        // Earthy (1,5,9): Starts at Capricorn(9)
        // Airy (2,6,10): Starts at Libra(6)
        // Watery (3,7,11): Starts at Cancer(3)

        if ([0, 4, 8].includes(rasi)) startSign = 0;
        else if ([1, 5, 9].includes(rasi)) startSign = 9;
        else if ([2, 6, 10].includes(rasi)) startSign = 6;
        else if ([3, 7, 11].includes(rasi)) startSign = 3;

        const navamsaSignIdx = (startSign + pada) % 12;
        const rasis = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
        return rasis[navamsaSignIdx];
    }

    // --- Components ---

    const DetailTable = () => {
        const asc = results.Ascendant?.longitude;
        const moon = results.Moon?.longitude;
        const planets = ['Ascendant', 'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
        const sunLon = results.Sun?.longitude || 0;

        return (
            <table className="display-table">
                <thead>
                    <tr>
                        <th>Planet</th>
                        <th>Sign</th>
                        {/* <th>Sign Lord</th> */}
                        <th>Nakshatra</th>
                        {/* <th>Naksh Lord</th> */}
                        <th>Degree</th>
                        <th>Retro</th>
                        <th>Combust</th>
                        <th>Avastha</th>
                        <th>Hse (Asc)</th>
                        <th>Status</th>
                        <th>Hse (Moon)</th>
                        <th>Navamsa</th>
                        <th>Function</th>
                    </tr>
                </thead>
                <tbody>
                    {planets.map(p => {
                        const info = results[p];
                        if (!info) return null;
                        const long = info.longitude;
                        const isRetro = info.speed < 0;
                        const nak = calculateNakshatra(long);

                        // Calculations
                        const dignity = (p !== 'Ascendant') ? calculateDignity(p, long, asc) : { status: '-' };
                        const nature = (p !== 'Ascendant') ? getPlanetNature(p, asc) : { functional: '-' };
                        const avastha = (p !== 'Ascendant' && p !== 'Rahu' && p !== 'Ketu') ? calculateAvastha(long) : { state: '-' };

                        // Combustion
                        let isCombust = 'No';
                        if (p !== 'Sun' && p !== 'Rahu' && p !== 'Ketu' && p !== 'Ascendant') {
                            const dist = Math.abs(long - sunLon);
                            const orb = dist > 180 ? 360 - dist : dist;
                            if (orb < 6) isCombust = 'Yes';
                        }

                        // Function display
                        let funcDisplay = '-';
                        if (nature.functional === 'Functional Benefic') funcDisplay = 'Very Benefic';
                        else if (nature.functional === 'Functional Malefic') funcDisplay = 'Malefics';
                        else if (nature.functional) funcDisplay = nature.functional;

                        // Dignity for Ascendant
                        let statusDisplay = dignity.status;
                        if (p === 'Ascendant') statusDisplay = 'Neutral';

                        return (
                            <tr key={p}>
                                <td>{p}</td>
                                <td>{getRasiName(long)}</td>
                                {/* <td>-</td> */}
                                <td>{nak.name} - {nak.pada}</td>
                                {/* <td>-</td> */}
                                <td>{formatLongitude(long % 30)}</td>
                                <td>{isRetro && p !== 'Rahu' && p !== 'Ketu' ? 'Retro(R)' : 'Direct'}</td>
                                <td>{isCombust}</td>
                                <td>{avastha.state}</td>
                                <td>{p === 'Ascendant' ? 1 : getHouse(long, asc)}</td>
                                <td>{statusDisplay}</td>
                                <td>{p === 'Ascendant' ? getHouse(asc, moon) : getHouse(long, moon)}</td>
                                <td>{getNavamsaSign(long)}</td>
                                <td>{funcDisplay}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        );
    };

    const parseDateSafe = (dateStr, timeStr) => {
        try {
            if (!dateStr) return null;
            if (dateStr instanceof Date) return isNaN(dateStr.getTime()) ? null : dateStr;

            const str = String(dateStr).trim();

            // Normalize Time
            let h = 0, m = 0;
            if (timeStr && typeof timeStr === 'string') {
                const parts = timeStr.split(':');
                if (parts.length >= 2) {
                    h = parseInt(parts[0], 10) || 0;
                    m = parseInt(parts[1], 10) || 0;
                }
            }

            let dateObj = null;

            // 1. Try ISO YYYY-MM-DD
            const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
            if (isoMatch) {
                const year = parseInt(isoMatch[1], 10);
                const month = parseInt(isoMatch[2], 10) - 1; // 0-indexed
                const day = parseInt(isoMatch[3], 10);
                dateObj = new Date(year, month, day, h, m);
            }
            // 2. Try DD/MM/YYYY or DD-MM-YYYY (allow single digits)
            else {
                const ddmmyyyy = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
                if (ddmmyyyy) {
                    const day = parseInt(ddmmyyyy[1], 10);
                    const month = parseInt(ddmmyyyy[2], 10) - 1;
                    const year = parseInt(ddmmyyyy[3], 10);
                    dateObj = new Date(year, month, day, h, m);
                } else {
                    // 3. Fallback: try parsing with Date (risky but last resort)
                    // Ensure time is padded for ISO string compatibility
                    const hStr = h < 10 ? `0${h}` : h;
                    const mStr = m < 10 ? `0${m}` : m;
                    const normalizedTime = `${hStr}:${mStr}`;
                    dateObj = new Date(`${str}T${normalizedTime}`);
                }
            }

            return (dateObj && !isNaN(dateObj.getTime())) ? dateObj : null;
        } catch (e) {
            console.error("Date parsing error:", e);
            return null;
        }
    };

    const DashaSection = () => {
        // Calculate Dashas on the fly
        const moonLon = results.Moon?.longitude;
        const birthDate = formData ? parseDateSafe(formData.date, formData.time) : null;

        let dashaRows = [];
        let currentMahadasha = null;
        let antardashaRows = [];

        if (moonLon && birthDate) {
            const dashaData = calculateVimshottariDasha(moonLon, birthDate);
            if (dashaData && dashaData.dashas) {
                dashaRows = dashaData.dashas;
                // Find current
                currentMahadasha = dashaRows.find(d => d.isCurrent);
                if (currentMahadasha) {
                    // Since calculateVimshottariDasha might return a partial duration for the first one,
                    // we need the FULL duration of that planet to calculate sub-periods correctly.
                    // Fortunately, dashaUtils logic seems to handle start/end.
                    // But calculateAntardashas uses DASHA_PERIODS lookup for full duration years.
                    // The start date passed to it should be the START of the mahadasha.
                    antardashaRows = calculateAntardashas(currentMahadasha.planet, currentMahadasha.startDate);
                }
            }
        }

        return (
            <div className="dasha-section-container">
                <div className="dasha-block">
                    <h3>Vimshottari Dasha</h3>
                    <table className="display-table">
                        <thead>
                            <tr><th>Period Lord</th><th>Start Date</th><th>End Date</th><th>Duration</th></tr>
                        </thead>
                        <tbody>
                            {dashaRows.length > 0 ? dashaRows.map((d, i) => (
                                <tr key={i} className={d.isCurrent ? "current-row-highlight" : ""}>
                                    <td>{d.planet} {d.isCurrent ? '(Current)' : ''}</td>
                                    <td>{formatDate(d.startDate)}</td>
                                    <td>{formatDate(d.endDate)}</td>
                                    <td>{i === 0 ? 'Balance' : `${d.fullDuration} Years`}</td>
                                </tr>
                            )) : <tr><td colSpan="4">Dasha data not available in this snapshot.</td></tr>}
                        </tbody>
                    </table>
                </div>

                {currentMahadasha && (
                    <div className="dasha-block mt-4">
                        <h3>Current Antardasha ({currentMahadasha.planet})</h3>
                        <table className="display-table">
                            <thead>
                                <tr><th>Sub-Period Lord</th><th>Start Date</th><th>End Date</th><th>Status</th></tr>
                            </thead>
                            <tbody>
                                {antardashaRows.map((ad, i) => (
                                    <tr key={i} className={ad.isCurrent ? "current-row-highlight" : ""}>
                                        <td>{currentMahadasha.planet} - {ad.planet}</td>
                                        <td>{formatDate(ad.startDate)}</td>
                                        <td>{formatDate(ad.endDate)}</td>
                                        <td>{ad.isCurrent ? 'Current' : 'Passed/Future'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="snapshot-page-wrapper">
            <div className="no-print snapshot-controls">
                <button onClick={onBack}>&larr; Back</button>
                <button className="print-btn" onClick={() => window.print()}>Print / Save PDF</button>
            </div>

            <div className="snapshot-printable-area">
                {/* Fixed Header for Print - Repeats on every page */}
                <div className="print-fixed-header">
                    <div className="header-content">
                        <h2>{formData.name}</h2>
                        <p>{formData.date}, {formData.time} | {formData.city}</p>
                    </div>
                </div>

                {/* Main Content Header (First Page) */}
                <div className="snapshot-header-center">
                    <div className="snapshot-selection-container no-print">
                        <select
                            value={selectedChartId}
                            onChange={(e) => setSelectedChartId(e.target.value)}
                            className="snapshot-member-select"
                        >
                            <option value="" disabled>Select Member</option>
                            {charts.map((c, idx) => (
                                <option key={c._id || idx} value={c._id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                        <button onClick={handleGenerate} className="snapshot-generate-btn">
                            Generate
                        </button>
                    </div>
                    {/* Print-only static name, or keeping it visible but subtle? 
                        User requested "bring name, make that as dropdown". 
                        So the dropdown REPLACES the H1 in view mode. 
                        But on print, we want the text. */}
                    <h1 className="print-only-title" style={{ display: 'none' }}>{formData.name}</h1>
                    <p>Born on {formData.date} at {formData.time} in {formData.city}</p>
                    <div className="basic-info-row">
                        <span>Rasi: {getRasiName(results.Moon?.longitude)}</span>
                        <span>, Nakshatra: {calculateNakshatra(results.Moon?.longitude).name} - {calculateNakshatra(results.Moon?.longitude).pada}</span>
                        <span>, Lagna: {getRasiName(results.Ascendant?.longitude)}</span>
                    </div>
                </div>

                <div className="section-block">
                    <h3>Detail Position Table</h3>
                    <DetailTable />
                </div>

                <div className="section-block charts-block">
                    <div className="chart-wrapper">
                        <h4>D-1 Rasi</h4>
                        <BirthChart data={results} formData={formData} defaultDivision="d1" hideControls={true} />
                    </div>
                    <div className="chart-wrapper">
                        <h4>D-9 Navamsa</h4>
                        <BirthChart data={results} formData={formData} defaultDivision="d9" hideControls={true} />
                    </div>
                </div>

                <div className="section-block">
                    <DashaSection />
                </div>

                {/* Disclaimer Footer */}
                {/* Disclaimer Footer */}
                <div className="snapshot-footer">
                    <p className="copyright">© 2026 AstroGravity. All rights reserved.</p>
                    <div className="disclaimer-section">
                        <div className="disclaimer-title">Disclaimer</div>
                        <p className="disclaimer-text">These astrological readings provided by AstroGravity are based on ancient wisdom. The actual events are based on infinite static & dynamic and known & known factors. This prediction is based on only few of those known factors. Hence, act on the prediction accepting it as directional & probabilistic and owning all the associated risks with such a prediction. No guarantee is given regarding the accuracy, completeness, or outcome of any information provided. By using this website, you acknowledge that you are solely responsible for your own choices, actions, and decisions.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SnapshotPage;
