import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CitySearch from '../components/CitySearch';
import { calculateSunPositionPrecise } from '../utils/sunPositionUtils';
import './BirthTimeRectificationPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ZODIAC_SIGNS = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const NAKSHATRAS = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
    'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
    'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
    'Moola', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
    'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
];

function timeToMinutes(timeString) {
    if (!timeString || typeof timeString !== 'string' || !timeString.includes(':')) return NaN;
    const [hours, minutes] = timeString.split(':').map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return NaN;
    return hours * 60 + minutes;
}

function minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

function normalizeLowerCase(value) {
    if (typeof value !== 'string') return '';
    return value.toLowerCase();
}

function mod(n, m) {
    return ((n % m) + m) % m;
}

async function fetchSunriseLocalTime(lat, lng, dateString, timezoneOffsetHours) {
    const response = await fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&date=${dateString}&formatted=0`);
    const data = await response.json();
    if (data.status !== 'OK') {
        throw new Error('Failed to fetch sunrise time');
    }

    const sunriseUTC = new Date(data.results.sunrise);
    const utcMinutes = (sunriseUTC.getUTCHours() * 60) + sunriseUTC.getUTCMinutes();
    const localMinutes = mod(utcMinutes + (timezoneOffsetHours * 60), 1440);
    return minutesToTime(localMinutes);
}

function subtractOneDay(dateString) {
    const d = new Date(`${dateString}T00:00:00`);
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
}

function computeAscendantFromGhatis(ghatis, sunLongitudeDegrees) {
    const lagnaDegree = mod((ghatis * 6) + sunLongitudeDegrees, 360);
    const signIndex = Math.floor(lagnaDegree / 30);
    const degreeInSign = lagnaDegree % 30;
    return {
        lagnaDegree,
        signIndex,
        signName: ZODIAC_SIGNS[signIndex] || ZODIAC_SIGNS[0],
        degreeInSign
    };
}

async function fetchAscendantSignFromBackend({ date, time, latitude, longitude, timezone, city }) {
    const response = await fetch(`${API_URL}/api/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'BTR-New',
            date,
            time,
            latitude,
            longitude,
            timezone,
            city,
            ayanamsa: 'lahiri'
        })
    });

    const data = await response.json();
    if (!data?.success) {
        throw new Error(data?.error || 'Ascendant lookup failed');
    }

    const ascLon = data?.data?.Ascendant?.longitude;
    if (typeof ascLon !== 'number' || Number.isNaN(ascLon)) {
        throw new Error('Ascendant longitude missing in backend response');
    }

    const signIndex = Math.floor(mod(ascLon, 360) / 30);
    return ZODIAC_SIGNS[signIndex] || ZODIAC_SIGNS[0];
}

function computeParasharaRemainder(vighatis) {
    const r = mod(vighatis * 4, 9);
    return r === 0 ? 9 : r;
}

function computeTargetRemainderForStar(starIndex1to27) {
    return mod(starIndex1to27 - 1, 9) + 1;
}

function kalidasaDetectedGender(k) {
    if (k >= 16 && k <= 45) return 'female';
    if (k >= 46 && k <= 90) return 'male';
    if (k >= 91 && k <= 150) return 'female';
    if (k >= 151 && k <= 225) return 'male';
    if (k >= 0 && k <= 15) return 'male';
    return 'undefined';
}

function kalidasaPass(k, gender) {
    const g = normalizeLowerCase(gender);
    if (g === 'male') return (k >= 0 && k <= 15) || (k >= 46 && k <= 90) || (k >= 151 && k <= 225);
    if (g === 'female') return (k >= 16 && k <= 45) || (k >= 91 && k <= 150);
    return false;
}

const BirthTimeRectificationNewPage = ({ onBack, onCalculate, initialState, onStateChange }) => {
    const { t } = useTranslation();

    const [formData, setFormData] = useState(() => initialState?.formData || {
        dateOfBirth: '',
        timeRangeStart: '',
        timeRangeEnd: '',
        city: '',
        latitude: null,
        longitude: null,
        timezone: null,
        gender: 'male',
        knownBirthStar: '',
        knownAscendant: '',
        vighatisRoundingMode: 'round',
        sunriseOverrideToday: '',
        sunriseOverridePrevDay: ''
    });

    const [sunriseToday, setSunriseToday] = useState(() => initialState?.sunriseToday || '');
    const [sunrisePrevDay, setSunrisePrevDay] = useState(() => initialState?.sunrisePrevDay || '');
    const [sunLongitudeDeg, setSunLongitudeDeg] = useState(() => (typeof initialState?.sunLongitudeDeg === 'number' ? initialState.sunLongitudeDeg : null));

    const [results, setResults] = useState(() => initialState?.results || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [selectedCandidateTime, setSelectedCandidateTime] = useState(() => initialState?.selectedCandidateTime || '');
    const [chartName, setChartName] = useState(() => initialState?.chartName || '');

    useEffect(() => {
        if (typeof onStateChange !== 'function') return;
        onStateChange({
            formData,
            sunriseToday,
            sunrisePrevDay,
            sunLongitudeDeg,
            results,
            selectedCandidateTime,
            chartName
        });
    }, [formData, sunriseToday, sunrisePrevDay, sunLongitudeDeg, results, selectedCandidateTime, chartName, onStateChange]);

    const birthStarIndex = useMemo(() => {
        if (!formData.knownBirthStar) return null;
        const idx = NAKSHATRAS.findIndex(n => normalizeLowerCase(n) === normalizeLowerCase(formData.knownBirthStar));
        return idx === -1 ? null : idx + 1;
    }, [formData.knownBirthStar]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleCitySelect = async (cityData) => {
        setFormData(prev => ({
            ...prev,
            city: cityData.name,
            latitude: cityData.latitude,
            longitude: cityData.longitude,
            timezone: cityData.timezone
        }));

        if (formData.dateOfBirth) {
            await preloadAstronomy(cityData.latitude, cityData.longitude, formData.dateOfBirth, formData.timeRangeStart, cityData.timezone);
        }
    };

    const handleDateChange = async (date) => {
        setFormData(prev => ({ ...prev, dateOfBirth: date }));
        if (date && formData.latitude && formData.longitude) {
            await preloadAstronomy(formData.latitude, formData.longitude, date, formData.timeRangeStart, formData.timezone);
        }
    };

    const handleStartTimeChange = async (time) => {
        setFormData(prev => ({ ...prev, timeRangeStart: time }));
        if (formData.dateOfBirth) {
            const sunPos = calculateSunPositionPrecise(formData.dateOfBirth, time || '00:00');
            setSunLongitudeDeg(sunPos.totalLongitude);
        }
    };

    const preloadAstronomy = async (lat, lng, date, startTime, timezoneOffsetHours) => {
        if (!lat || !lng || !date) return null;

        const prevDate = subtractOneDay(date);
        const tz = typeof timezoneOffsetHours === 'number' ? timezoneOffsetHours : 0;
        setLoading(true);
        setError('');
        try {
            const [todaySunrise, prevSunrise] = await Promise.all([
                fetchSunriseLocalTime(lat, lng, date, tz),
                fetchSunriseLocalTime(lat, lng, prevDate, tz)
            ]);
            setSunriseToday(todaySunrise);
            setSunrisePrevDay(prevSunrise);

            const sunPos = calculateSunPositionPrecise(date, startTime || '00:00');
            setSunLongitudeDeg(sunPos.totalLongitude);

            return {
                todaySunrise,
                prevSunrise,
                sunLongitudeDeg: sunPos.totalLongitude
            };
        } catch (e) {
            setError(e?.message || 'Failed to preload sunrise/sun position');
            return null;
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setResults(null);
        setSelectedCandidateTime('');

        if (!formData.dateOfBirth || !formData.timeRangeStart || !formData.timeRangeEnd || !formData.city || !formData.gender || !formData.knownBirthStar) {
            setError('Please fill in all required fields');
            return;
        }

        if (!formData.latitude || !formData.longitude) {
            setError('Please select a city from the dropdown to get coordinates');
            return;
        }

        if (!birthStarIndex) {
            setError('Invalid birth star selection');
            return;
        }

        const startMin = timeToMinutes(formData.timeRangeStart);
        const endMin = timeToMinutes(formData.timeRangeEnd);
        if (Number.isNaN(startMin) || Number.isNaN(endMin)) {
            setError('Invalid time range');
            return;
        }
        if (endMin < startMin) {
            setError('Time range end must be after start');
            return;
        }

        setLoading(true);
        try {
            let apiSunriseToday = sunriseToday;
            let apiSunrisePrevDay = sunrisePrevDay;
            let apiSunLongitudeDeg = sunLongitudeDeg;

            if (!apiSunriseToday || !apiSunrisePrevDay || apiSunLongitudeDeg === null) {
                const preloaded = await preloadAstronomy(
                    formData.latitude,
                    formData.longitude,
                    formData.dateOfBirth,
                    formData.timeRangeStart,
                    formData.timezone
                );
                if (!preloaded) {
                    throw new Error('Failed to preload sunrise/sun position');
                }
                apiSunriseToday = preloaded.todaySunrise;
                apiSunrisePrevDay = preloaded.prevSunrise;
                apiSunLongitudeDeg = preloaded.sunLongitudeDeg;
            }

            const sunriseTodayMin = timeToMinutes(apiSunriseToday);
            const sunrisePrevMin = timeToMinutes(apiSunrisePrevDay);
            if (Number.isNaN(sunriseTodayMin) || Number.isNaN(sunrisePrevMin)) {
                throw new Error('Invalid sunrise time');
            }

            const sunriseTodayToUse = formData.sunriseOverrideToday || apiSunriseToday;
            const sunrisePrevToUse = apiSunrisePrevDay;
            const sunriseTodayToUseMin = timeToMinutes(sunriseTodayToUse);
            const sunrisePrevToUseMin = timeToMinutes(sunrisePrevToUse);
            if (Number.isNaN(sunriseTodayToUseMin) || Number.isNaN(sunrisePrevToUseMin)) {
                throw new Error('Invalid sunrise override time');
            }

            const targetR = computeTargetRemainderForStar(birthStarIndex);
            const expectedAscLower = normalizeLowerCase(formData.knownAscendant);
            const applyAscendantCheck = Boolean(expectedAscLower);

            const backendAscCache = new Map();

            const candidates = [];
            const traceRows = [];
            let checkedCount = 0;
            let parasharaPassCount = 0;
            let kalidasaPassCount = 0;
            let ascendantPassCount = 0;

            for (let m = startMin; m <= endMin; m += 1) {
                checkedCount += 1;
                const time = minutesToTime(m);

                const usePrevSunrise = m < sunriseTodayMin;
                const minutesPassed = usePrevSunrise
                    ? (m + 1440 - sunrisePrevToUseMin)
                    : (m - sunriseTodayToUseMin);

                const ghatis = minutesPassed / 24;
                const vighatisRaw = minutesPassed * 2.5;
                const vighatisMode = normalizeLowerCase(formData.vighatisRoundingMode);
                const vighatis = vighatisMode === 'floor' ? Math.floor(vighatisRaw) : Math.round(vighatisRaw);

                const parasharaR = computeParasharaRemainder(vighatis);
                const parasharaPass = parasharaR === targetR;
                if (parasharaPass) parasharaPassCount += 1;

                const k = mod(vighatis, 225);
                const detectedGender = kalidasaDetectedGender(k);
                const kaliPass = parasharaPass && kalidasaPass(k, formData.gender);
                if (kaliPass) kalidasaPassCount += 1;

                const asc = computeAscendantFromGhatis(ghatis, apiSunLongitudeDeg);
                let ascPass = kaliPass;
                if (ascPass && applyAscendantCheck) {
                    let ascSignToCheck = asc.signName;
                    try {
                        if (!backendAscCache.has(time)) {
                            const backendSign = await fetchAscendantSignFromBackend({
                                date: formData.dateOfBirth,
                                time,
                                latitude: formData.latitude,
                                longitude: formData.longitude,
                                timezone: formData.timezone,
                                city: formData.city
                            });
                            backendAscCache.set(time, backendSign);
                        }
                        ascSignToCheck = backendAscCache.get(time);
                    } catch (e) {
                        ascSignToCheck = asc.signName;
                    }
                    ascPass = normalizeLowerCase(ascSignToCheck) === expectedAscLower;
                }
                if (ascPass) ascendantPassCount += 1;

                const failReason = !parasharaPass
                    ? 'Parashara'
                    : !kaliPass
                        ? 'Kalidasa'
                        : !ascPass
                            ? 'Ascendant'
                            : '';

                const finalStatus = ascPass ? 'pass' : 'fail';

                const traceRow = {
                    time,
                    vighatis,
                    parasharaRemainder: parasharaR,
                    parasharaTarget: targetR,
                    kalidasaRemainder: k,
                    detectedGender,
                    parasharaPass,
                    kalidasaPass: kaliPass,
                    finalStatus,
                    failReason,
                    ascendantSign: asc.signName,
                    ascendantDegree: asc.degreeInSign
                };
                traceRows.push(traceRow);

                if (!ascPass) continue;

                candidates.push({
                    ...traceRow,
                    ascendantTotalDegree: asc.lagnaDegree,
                    usedPreviousDaySunrise: usePrevSunrise
                });
            }

            setResults({
                candidates,
                traceRows,
                sunLongitudeDeg: apiSunLongitudeDeg,
                sunriseToday: apiSunriseToday,
                sunrisePrevDay: apiSunrisePrevDay,
                sunriseTodayUsed: sunriseTodayToUse,
                sunrisePrevDayUsed: sunrisePrevToUse,
                targetR,
                diagnostics: {
                    checkedCount,
                    parasharaPassCount,
                    kalidasaPassCount,
                    ascendantPassCount,
                    ascendantCheckEnabled: applyAscendantCheck
                }
            });

            if (candidates.length === 0) {
                setError('No valid times found for the given inputs');
            }
        } catch (err) {
            setError('An error occurred during rectification: ' + (err?.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFormData({
            dateOfBirth: '',
            timeRangeStart: '',
            timeRangeEnd: '',
            city: '',
            latitude: null,
            longitude: null,
            timezone: null,
            gender: '',
            knownBirthStar: '',
            knownAscendant: '',
            vighatisRoundingMode: 'round',
            sunriseOverrideToday: '',
            sunriseOverridePrevDay: ''
        });
        setSunriseToday('');
        setSunrisePrevDay('');
        setSunLongitudeDeg(null);
        setResults(null);
        setSelectedCandidateTime('');
        setChartName('');
        setError('');
    };

    const handleGenerate = async (shouldSave) => {
        setError('');

        if (!chartName || !chartName.trim()) {
            setError('Please enter the name');
            return;
        }

        if (!selectedCandidateTime) {
            setError('Please select a time from the table');
            return;
        }

        if (typeof onCalculate !== 'function') {
            setError('Chart generation is not available');
            return;
        }

        const payload = {
            name: chartName.trim(),
            date: formData.dateOfBirth,
            time: selectedCandidateTime,
            latitude: formData.latitude,
            longitude: formData.longitude,
            timezone: formData.timezone,
            city: formData.city,
            gender: formData.gender,
            ayanamsa: 'lahiri'
        };

        await onCalculate(payload, Boolean(shouldSave), 'birth-time-rectification-new');
    };

    return (
        <div className="btr-container">
            <header className="btr-header page-header">
                <div className="page-header-left">
                    <button className="back-btn" onClick={onBack}>
                        ← Back
                    </button>
                </div>
                <h1 className="page-header-title">BTR - New</h1>
                <div className="page-header-right" />
            </header>

            <div className="btr-content">
                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="btr-form btr-new-form">
                    <div className="form-section">
                        <h2>Required Information</h2>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Date of Birth *</label>
                                <input
                                    type="date"
                                    value={formData.dateOfBirth}
                                    onChange={(e) => handleDateChange(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Place of Birth *</label>
                                <CitySearch
                                    defaultValue={formData.city}
                                    onCitySelect={handleCitySelect}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Time Range Start *</label>
                                <input
                                    type="time"
                                    value={formData.timeRangeStart}
                                    onChange={(e) => handleStartTimeChange(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Time Range End *</label>
                                <input
                                    type="time"
                                    value={formData.timeRangeEnd}
                                    onChange={(e) => handleInputChange('timeRangeEnd', e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Gender *</label>
                                <select
                                    value={formData.gender}
                                    onChange={(e) => handleInputChange('gender', e.target.value)}
                                    required
                                >
                                    <option value="">Select</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Known Birth Star *</label>
                                <select
                                    value={formData.knownBirthStar}
                                    onChange={(e) => handleInputChange('knownBirthStar', e.target.value)}
                                    required
                                >
                                    <option value="">Select</option>
                                    {NAKSHATRAS.map((nak) => (
                                        <option key={nak} value={nak}>{nak}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Vighatis Rounding *</label>
                                <select
                                    value={formData.vighatisRoundingMode}
                                    onChange={(e) => handleInputChange('vighatisRoundingMode', e.target.value)}
                                    required
                                >
                                    <option value="round">Round</option>
                                    <option value="floor">Floor</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Known Ascendant</label>
                                <select
                                    value={formData.knownAscendant}
                                    onChange={(e) => handleInputChange('knownAscendant', e.target.value)}
                                >
                                    <option value="">Unknown</option>
                                    {ZODIAC_SIGNS.map((sign) => (
                                        <option key={sign} value={sign}>{sign}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Sunrise (API)</label>
                                <input
                                    type="time"
                                    value={sunriseToday || ''}
                                    readOnly
                                />
                            </div>

                            <div className="form-group">
                                <label>Sunrise Override (Today)</label>
                                <input
                                    type="time"
                                    value={formData.sunriseOverrideToday}
                                    onChange={(e) => handleInputChange('sunriseOverrideToday', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? 'Calculating...' : 'Find Rectified Times'}
                            </button>
                            <button type="button" className="btn-secondary" onClick={handleReset} disabled={loading}>
                                Reset
                            </button>
                        </div>
                    </div>
                </form>

                {results && (
                    <div className="btr-results">
                        <h2>Rectified Times ({results.candidates.length})</h2>

                        <div className="method-breakdown">
                            <div className="method-scores">
                                <div className="method-item">
                                    <span className="method-name">Input Gender:</span>
                                    <span className="method-score">{formData.gender || '-'}</span>
                                </div>
                                <div className="method-item">
                                    <span className="method-name">Sunrise Today (API):</span>
                                    <span className="method-score">{results.sunriseToday || '-'}</span>
                                </div>
                                <div className="method-item">
                                    <span className="method-name">Sunrise Today (Used):</span>
                                    <span className="method-score">{results.sunriseTodayUsed || results.sunriseToday || '-'}</span>
                                </div>
                            </div>
                        </div>

                        {results.diagnostics && (
                            <div className="method-breakdown">
                                <h3>Diagnostics</h3>
                                <div className="method-scores">
                                    <div className="method-item">
                                        <span className="method-name">Minutes Checked:</span>
                                        <span className="method-score">{results.diagnostics.checkedCount}</span>
                                    </div>
                                    <div className="method-item">
                                        <span className="method-name">Passed Parashara:</span>
                                        <span className="method-score">{results.diagnostics.parasharaPassCount}</span>
                                    </div>
                                    <div className="method-item">
                                        <span className="method-name">Passed Kalidasa (after Parashara):</span>
                                        <span className="method-score">{results.diagnostics.kalidasaPassCount}</span>
                                    </div>
                                    <div className="method-item">
                                        <span className="method-name">Passed Ascendant (after Kalidasa):</span>
                                        <span className="method-score">
                                            {results.diagnostics.ascendantPassCount}
                                            {results.diagnostics.ascendantCheckEnabled ? '' : ' (Ascendant check disabled)'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {results.traceRows && results.traceRows.length > 0 && (
                            <div className="top-candidates">
                                <h3>Summary</h3>
                                <table className="candidates-table">
                                    <thead>
                                        <tr>
                                            <th>Time</th>
                                            <th>Vighatis</th>
                                            <th>Parashara (Target {results.targetR})</th>
                                            <th>Kalidasa Remainder</th>
                                            <th>Kalidasa Detected</th>
                                            <th>Final Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(() => {
                                            const passed = results.traceRows.filter(r => r.finalStatus === 'pass');
                                            const bestTime = passed.length > 0 ? passed[passed.length - 1].time : null;
                                            return passed.map((r) => {
                                                const label = r.time === bestTime ? ' (Best)' : ' (Alt)';
                                                return (
                                                    <tr key={`summary-${r.time}`} className={r.time === bestTime ? 'best-candidate' : ''}>
                                                        <td>{r.time}</td>
                                                        <td>{Number.isFinite(r.vighatis) ? r.vighatis.toFixed(0) : ''}</td>
                                                        <td>{r.parasharaRemainder} ({r.parasharaPass ? 'Pass' : 'Fail'})</td>
                                                        <td>{Number.isFinite(r.kalidasaRemainder) ? r.kalidasaRemainder.toFixed(0) : ''}</td>
                                                        <td>{r.detectedGender}</td>
                                                        <td>{`Pass${label}`}</td>
                                                    </tr>
                                                );
                                            });
                                        })()}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className="top-candidates">
                            <table className="candidates-table">
                                <thead>
                                    <tr>
                                        <th>Select</th>
                                        <th>#</th>
                                        <th>Time</th>
                                        <th>Vighatis</th>
                                        <th>Parashara R</th>
                                        <th>Kalidasa K</th>
                                        <th>Kalidasa Detected</th>
                                        <th>Ascendant</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.candidates.map((c, idx) => (
                                        <tr key={`${c.time}-${idx}`} className={idx === 0 ? 'best-candidate' : ''}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCandidateTime === c.time}
                                                    onChange={() => {
                                                        setSelectedCandidateTime(prev => (prev === c.time ? '' : c.time));
                                                    }}
                                                />
                                            </td>
                                            <td>{idx + 1}</td>
                                            <td>{c.time}</td>
                                            <td>{Number.isFinite(c.vighatis) ? c.vighatis.toFixed(0) : ''}</td>
                                            <td>{c.parasharaRemainder} / {c.parasharaTarget}</td>
                                            <td>{Number.isFinite(c.kalidasaRemainder) ? c.kalidasaRemainder.toFixed(0) : ''}</td>
                                            <td>{c.detectedGender}</td>
                                            <td>{c.ascendantSign} {Number.isFinite(c.ascendantDegree) ? c.ascendantDegree.toFixed(2) : ''}°</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="top-candidates">
                            <div className="form-row" style={{ marginBottom: 0 }}>
                                <div className="form-group">
                                    <label>Enter the name</label>
                                    <input
                                        type="text"
                                        value={chartName}
                                        onChange={(e) => setChartName(e.target.value)}
                                        placeholder="Enter the name"
                                    />
                                </div>

                                <div className="form-group" style={{ justifyContent: 'flex-end' }}>
                                    <label style={{ visibility: 'hidden' }}>Action</label>
                                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                        <button
                                            type="button"
                                            className="btn-secondary"
                                            onClick={() => handleGenerate(false)}
                                            disabled={loading}
                                        >
                                            Generate
                                        </button>
                                        <button
                                            type="button"
                                            className="btn-primary"
                                            onClick={() => handleGenerate(true)}
                                            disabled={loading}
                                        >
                                            Save &amp; Generate
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {results.traceRows && results.traceRows.length > 0 && (
                            <div className="top-candidates">
                                <h3>Full Trace (Every Minute)</h3>
                                <table className="candidates-table">
                                    <thead>
                                        <tr>
                                            <th>Time</th>
                                            <th>Vighatis</th>
                                            <th>Parashara</th>
                                            <th>Kalidasa</th>
                                            <th>Kalidasa Detected</th>
                                            <th>Ascendant</th>
                                            <th>Final</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.traceRows.map((r) => (
                                            <tr
                                                key={`trace-${r.time}`}
                                                className={r.finalStatus === 'pass' ? 'best-candidate' : ''}
                                            >
                                                <td>{r.time}</td>
                                                <td>{Number.isFinite(r.vighatis) ? r.vighatis.toFixed(0) : ''}</td>
                                                <td>
                                                    {r.parasharaRemainder} / {r.parasharaTarget}
                                                    {r.failReason === 'Parashara' ? ' (Fail)' : ' (Pass)'}
                                                </td>
                                                <td>
                                                    {Number.isFinite(r.kalidasaRemainder) ? r.kalidasaRemainder.toFixed(0) : ''}
                                                    {r.failReason === 'Kalidasa' ? ' (Fail)' : (r.failReason === 'Parashara' ? '' : ' (Pass)')}
                                                </td>
                                                <td>{r.detectedGender}</td>
                                                <td>{r.ascendantSign} {Number.isFinite(r.ascendantDegree) ? r.ascendantDegree.toFixed(2) : ''}°</td>
                                                <td>{r.finalStatus === 'pass' ? 'Pass' : `Fail (${r.failReason})`}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BirthTimeRectificationNewPage;
