import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CitySearch from '../components/CitySearch';
import { rectifyBirthTime } from '../utils/btrUtils';
import { calculateSunPositionPrecise } from '../utils/sunPositionUtils';
import './BirthTimeRectificationPage.css';

const BirthTimeRectificationPage = ({ onBack }) => {
    const { t } = useTranslation();

    const [formData, setFormData] = useState({
        dateOfBirth: '',
        city: '',
        latitude: null,
        longitude: null,
        timezone: null,
        timeWindowStart: '',
        timeWindowEnd: '',
        sunriseTime: '',
        sunLongitudeDeg: '',
        sunSignIndex: 0,
        gender: 'unknown',
        knownNakshatra: '',
        expectedAscendant: ''
    });

    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const zodiacSigns = [
        'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];

    const nakshatras = [
        'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
        'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
        'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
        'Moola', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
        'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
    ];

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleCitySelect = (cityData) => {
        setFormData(prev => ({
            ...prev,
            city: cityData.name,
            latitude: cityData.latitude,
            longitude: cityData.longitude,
            timezone: cityData.timezone
        }));

        // Fetch sunrise time if date is already selected
        if (formData.dateOfBirth) {
            fetchSunriseTime(cityData.latitude, cityData.longitude, formData.dateOfBirth);
        }
    };

    // Fetch sunrise time when date changes and city is already selected
    const handleDateChange = (date) => {
        // Calculate sun position automatically
        if (date) {
            const sunPosition = calculateSunPositionPrecise(date);

            setFormData(prev => ({
                ...prev,
                dateOfBirth: date,
                sunLongitudeDeg: sunPosition.longitudeInSign.toString(),
                sunSignIndex: sunPosition.signIndex
            }));

            // Fetch sunrise time if city is selected
            if (formData.latitude && formData.longitude) {
                fetchSunriseTime(formData.latitude, formData.longitude, date);
            }
        } else {
            setFormData(prev => ({ ...prev, dateOfBirth: date }));
        }
    };

    // Fetch sunrise time from API
    const fetchSunriseTime = async (lat, lng, date) => {
        try {
            const response = await fetch(
                `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&date=${date}&formatted=0`
            );
            const data = await response.json();

            if (data.status === 'OK') {
                // Convert UTC time to local time
                const sunriseUTC = new Date(data.results.sunrise);

                // Format as HH:MM in local time
                const hours = String(sunriseUTC.getHours()).padStart(2, '0');
                const minutes = String(sunriseUTC.getMinutes()).padStart(2, '0');
                const localSunrise = `${hours}:${minutes}`;

                setFormData(prev => ({ ...prev, sunriseTime: localSunrise }));
            }
        } catch (error) {
            console.error('Error fetching sunrise time:', error);
            // Don't show error to user, just let them enter manually
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.dateOfBirth || !formData.city || !formData.timeWindowStart ||
            !formData.timeWindowEnd || !formData.sunriseTime || formData.sunLongitudeDeg === '') {
            setError('Please fill in all required fields');
            return;
        }

        if (!formData.latitude || !formData.longitude) {
            setError('Please select a city from the dropdown to get coordinates');
            return;
        }

        const sunLong = parseFloat(formData.sunLongitudeDeg);
        if (isNaN(sunLong) || sunLong < 0 || sunLong > 30) {
            setError('Sun longitude must be between 0 and 30 degrees');
            return;
        }

        setLoading(true);

        try {
            const params = {
                dateOfBirth: formData.dateOfBirth,
                placeOfBirth: {
                    latitude: formData.latitude,
                    longitude: formData.longitude,
                    timezone: formData.timezone
                },
                timeWindowStart: formData.timeWindowStart,
                timeWindowEnd: formData.timeWindowEnd,
                sunriseTime: formData.sunriseTime,
                sunLongitudeDeg: sunLong,
                sunSignIndex: parseInt(formData.sunSignIndex),
                gender: formData.gender,
                knownNakshatra: formData.knownNakshatra || null,
                expectedAscendant: formData.expectedAscendant || null
            };

            const result = rectifyBirthTime(params);
            setResults(result);
        } catch (err) {
            console.error('BTR Error:', err);
            setError('An error occurred during rectification: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFormData({
            dateOfBirth: '',
            city: '',
            latitude: null,
            longitude: null,
            timezone: null,
            timeWindowStart: '',
            timeWindowEnd: '',
            sunriseTime: '',
            sunLongitudeDeg: '',
            sunSignIndex: 0,
            gender: 'unknown',
            knownNakshatra: '',
            expectedAscendant: ''
        });
        setResults(null);
        setError('');
    };

    return (
        <div className="btr-container">
            <header className="btr-header">
                <button className="back-btn" onClick={onBack}>
                    ← Back
                </button>
                <h1>🔮 Birth Time Rectification</h1>
                <div className="header-spacer"></div>
            </header>

            <div className="btr-content">
                <div className="btr-intro">
                    <p>
                        Birth Time Rectification uses classical Vedic astrology methods to determine
                        the most probable birth time within a given time window. This tool employs
                        multiple algorithms including Parashara, Kalidasa, and Sun Longitude methods.
                    </p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="btr-form">
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
                                <label>Time Window Start *</label>
                                <input
                                    type="time"
                                    value={formData.timeWindowStart}
                                    onChange={(e) => handleInputChange('timeWindowStart', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Time Window End *</label>
                                <input
                                    type="time"
                                    value={formData.timeWindowEnd}
                                    onChange={(e) => handleInputChange('timeWindowEnd', e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Sunrise Time (Auto-filled) *</label>
                                <input
                                    type="time"
                                    value={formData.sunriseTime}
                                    onChange={(e) => handleInputChange('sunriseTime', e.target.value)}
                                    required
                                    placeholder="Will auto-fill when city & date are selected"
                                />
                            </div>

                            <div className="form-group">
                                <label>Sun Longitude (Auto-filled) *</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="30"
                                    step="0.01"
                                    value={formData.sunLongitudeDeg}
                                    onChange={(e) => handleInputChange('sunLongitudeDeg', e.target.value)}
                                    placeholder="Auto-calculated from date"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Sun Sign (Auto-filled) *</label>
                                <select
                                    value={formData.sunSignIndex}
                                    onChange={(e) => handleInputChange('sunSignIndex', e.target.value)}
                                    required
                                >
                                    {zodiacSigns.map((sign, index) => (
                                        <option key={index} value={index}>{sign}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h2>Optional Information (Improves Accuracy)</h2>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Gender</label>
                                <select
                                    value={formData.gender}
                                    onChange={(e) => handleInputChange('gender', e.target.value)}
                                >
                                    <option value="unknown">Unknown</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Known Nakshatra</label>
                                <select
                                    value={formData.knownNakshatra}
                                    onChange={(e) => handleInputChange('knownNakshatra', e.target.value)}
                                >
                                    <option value="">Unknown</option>
                                    {nakshatras.map((nak, index) => (
                                        <option key={index} value={nak}>{nak}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Expected Ascendant</label>
                                <select
                                    value={formData.expectedAscendant}
                                    onChange={(e) => handleInputChange('expectedAscendant', e.target.value)}
                                >
                                    <option value="">Unknown</option>
                                    {zodiacSigns.map((sign, index) => (
                                        <option key={index} value={sign}>{sign}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Calculating...' : 'Rectify Birth Time'}
                        </button>
                        <button type="button" className="btn-secondary" onClick={handleReset}>
                            Reset
                        </button>
                    </div>
                </form>

                {results && (
                    <div className="btr-results">
                        <h2>Rectification Results</h2>

                        <div className="result-summary">
                            <div className="result-card primary-result">
                                <h3>Rectified Birth Time</h3>
                                <div className="result-value">{results.rectifiedTime}</div>
                                <div className={`confidence-badge ${(results.confidence || 'Low').toLowerCase()}`}>
                                    {results.confidence} Confidence
                                </div>
                            </div>

                            <div className="result-card">
                                <h3>Ascendant Sign</h3>
                                <div className="result-value">{results.ascendantSign}</div>
                            </div>

                            <div className="result-card">
                                <h3>Nakshatra</h3>
                                <div className="result-value">{results.nakshatra}</div>
                            </div>

                            <div className="result-card">
                                <h3>Total Score</h3>
                                <div className="result-value">{results.totalScore}</div>
                            </div>
                        </div>

                        <div className="method-breakdown">
                            <h3>Method Breakdown</h3>
                            <div className="method-scores">
                                <div className="method-item">
                                    <span className="method-name">Parashara Method (Nakshatra):</span>
                                    <span className="method-score">
                                        {results.topCandidates[0].methods.parashara.score} / 3
                                    </span>
                                </div>
                                <div className="method-item">
                                    <span className="method-name">Kalidasa Method (Gender):</span>
                                    <span className="method-score">
                                        {results.topCandidates[0].methods.kalidasa.score} / 2
                                    </span>
                                </div>
                                <div className="method-item">
                                    <span className="method-name">Sun Longitude Method (Ascendant):</span>
                                    <span className="method-score">
                                        {results.topCandidates[0].methods.sunLongitude.score} / 3
                                    </span>
                                </div>
                                <div className="method-item">
                                    <span className="method-name">Sodasamsa Method:</span>
                                    <span className="method-score">
                                        {results.topCandidates[0].methods.sodasamsa.score} / 1
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="top-candidates">
                            <h3>Top 5 Candidate Times</h3>
                            <table className="candidates-table">
                                <thead>
                                    <tr>
                                        <th>Rank</th>
                                        <th>Time</th>
                                        <th>Score</th>
                                        <th>Confidence</th>
                                        <th>Ascendant</th>
                                        <th>Nakshatra</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.topCandidates.map((candidate, index) => (
                                        <tr key={index} className={index === 0 ? 'best-candidate' : ''}>
                                            <td>{index + 1}</td>
                                            <td>{candidate.time}</td>
                                            <td>{candidate.totalScore}</td>
                                            <td>
                                                <span className={`confidence-badge ${(candidate.confidence || 'Low').toLowerCase()}`}>
                                                    {candidate.confidence}
                                                </span>
                                            </td>
                                            <td>{candidate.methods.sunLongitude.derivedValues.ascendantSign}</td>
                                            <td>{candidate.methods.parashara.derivedValues.nakshatra}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BirthTimeRectificationPage;
