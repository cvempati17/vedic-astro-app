import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { NAKSHATRA_SYLLABLES, generateNames, fetchNameDatabase } from '../utils/namakaranUtils';
import CitySearch from '../components/CitySearch';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const NamakaranPage = ({ onBack }) => {
    const { t } = useTranslation();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        gender: 'male',
        religion: 'Hindu',
        dob: '',
        time: '',
        place: '',
        latitude: '',
        longitude: '',
        timezone: '',
        basedOn: 'Nakshatra',
        specificPreference: ''
    });
    const [nakshatraData, setNakshatraData] = useState(null);
    const [generatedNames, setGeneratedNames] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [nameDatabase, setNameDatabase] = useState([]);
    const [result, setResult] = useState(null);

    useEffect(() => {
        // Load external name database on mount
        const loadNames = async () => {
            const names = await fetchNameDatabase();
            if (names && names.length > 0) {
                console.log(`Loaded ${names.length} names from external database.`);
                setNameDatabase(names);
            }
        };
        loadNames();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCitySelect = (cityData) => {
        setFormData(prev => ({
            ...prev,
            place: cityData.name,
            latitude: cityData.latitude,
            longitude: cityData.longitude,
            timezone: cityData.timezone
        }));
    };

    const handleGetNakshatra = async () => {
        if (!formData.dob || !formData.time || !formData.place) {
            alert(t('namakaran.fillDetailsAlert', "Please fill in all birth details."));
            return;
        }

        setLoading(true);
        setError('');

        try {
            const payload = {
                date: formData.dob,
                time: formData.time,
                latitude: parseFloat(formData.latitude),
                longitude: parseFloat(formData.longitude),
                timezone: parseFloat(formData.timezone)
            };

            const response = await fetch(`${API_URL}/api/calculate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            console.log('Full API Response:', JSON.stringify(data, null, 2));

            if (data.success) {
                const moonData = data.data.Moon;
                console.log('Moon Data:', JSON.stringify(moonData, null, 2));

                if (moonData) {
                    const nakshatra = moonData.nakshatra;
                    console.log('Nakshatra:', nakshatra);

                    const syllables = getNakshatraSyllables(nakshatra);
                    console.log('Syllables:', syllables);

                    setNakshatraData({
                        nakshatra: nakshatra,
                        syllables: syllables
                    });
                    // Stay on same page but show next section or just update state
                } else {
                    console.error('Moon data missing in response');
                    setError(t('namakaran.moonError', 'Could not calculate Moon position.'));
                }
            } else {
                console.error('API returned success: false', data);
                setError(data.error || t('namakaran.calcError', 'Calculation failed.'));
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setError(t('namakaran.networkError', 'Network error. Please try again.'));
        } finally {
            setLoading(false);
        }
    };

    const getNakshatraSyllables = (nakshatra) => {
        return NAKSHATRA_SYLLABLES[nakshatra] || [];
    };

    const handleFindNames = () => {
        const criteria = {
            gender: formData.gender,
            religion: formData.religion,
            basedOn: formData.basedOn,
            specificPreference: formData.specificPreference,
            nakshatraSyllables: nakshatraData ? nakshatraData.syllables : []
        };

        const names = generateNames(criteria, nameDatabase);
        setResult({
            criteria: criteria,
            names: names
        });
    };

    const getSpecificOptions = () => {
        if (formData.basedOn === 'Deity') {
            if (formData.religion === 'Hindu') {
                return ['Shiva', 'Rama', 'Krishna', 'Vishnu', 'Lakshmi', 'Durga'];
            }
            return [];
        } else if (formData.basedOn === 'Alphabet') {
            return Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
        }
        return [];
    };

    return (
        <div className="namakaran-container" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', color: 'var(--text-color)' }}>
            <button onClick={onBack} style={{ marginBottom: '1rem', background: 'none', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', fontSize: '1rem' }}>
                ← {t('namakaran.backToSaved', 'Back to Saved Charts')}
            </button>

            <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--accent-color)' }}>{t('namakaran.title', 'Namakaran (Select Name)')}</h1>

            <div className="form-section" style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <h3>{t('namakaran.birthDetails', '1. Birth Details')}</h3>
                <div className="input-group" style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>{t('cols.name', 'Name')} ({t('namakaran.optional', 'Optional')})</label>
                    <input
                        type="text"
                        name="name" // Added name attribute
                        value={formData.name || ''}
                        onChange={handleInputChange}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)' }}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="input-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>{t('cols.dob', 'Date of Birth')}</label>
                        <input
                            type="date"
                            name="dob"
                            value={formData.dob}
                            onChange={handleInputChange}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)' }}
                        />
                    </div>
                    <div className="input-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>{t('cols.time', 'Time of Birth')}</label>
                        <input
                            type="time"
                            name="time"
                            value={formData.time}
                            onChange={handleInputChange}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)' }}
                        />
                    </div>
                </div>

                <div className="input-group" style={{ marginBottom: '1rem' }}>
                    <CitySearch
                        onCitySelect={handleCitySelect}
                    />
                    {formData.place && <p style={{ marginTop: '0.5rem', color: 'green', fontSize: '0.9rem' }}>{t('namakaran.selected', 'Selected')}: {formData.place}</p>}
                </div>

                <button
                    onClick={handleGetNakshatra}
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'var(--accent-color)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold',
                        marginTop: '1rem'
                    }}
                >
                    {loading ? t('namakaran.calculating', 'Calculating...') : t('namakaran.getNakshatra', 'Get Nakshatra')}
                </button>

                {error && <div style={{ color: '#ef4444', marginTop: '1rem', textAlign: 'center' }}>{error}</div>}
            </div>

            {nakshatraData && (
                <div className="nakshatra-result" style={{ marginTop: '2rem', background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--accent-color)' }}>
                    <h3 style={{ textAlign: 'center', color: 'var(--accent-color)' }}>{t('namakaran.janmaNakshatra', 'Janma Nakshatra')}: {nakshatraData.nakshatra}</h3>
                    <p style={{ textAlign: 'center', fontSize: '1.1rem' }}>
                        {t('namakaran.startingSyllables', 'Starting Syllables')}: <strong>{nakshatraData.syllables.join(', ')}</strong>
                    </p>

                    <hr style={{ margin: '1.5rem 0', borderColor: 'var(--border-color)' }} />

                    <h3>{t('namakaran.namingPreferences', '2. Naming Preferences')}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>{t('cols.gender', 'Gender')}</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleInputChange}
                            >
                                <option value="male">{t('gender.male', 'Male')}</option>
                                <option value="female">{t('gender.female', 'Female')}</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>{t('namakaran.religion', 'Religion')}</label>
                            <select
                                name="religion"
                                value={formData.religion}
                                onChange={handleInputChange}
                            >
                                <option value="Hindu">Hindu</option>
                                <option value="Muslim">Muslim</option>
                                <option value="Christian">Christian</option>
                                <option value="Sikh">Sikh</option>
                                <option value="Jain">Jain</option>
                            </select>
                        </div>
                    </div>

                    <div className="input-group" style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>{t('namakaran.basedOn', 'Based On')}</label>
                        <select
                            name="basedOn"
                            value={formData.basedOn}
                            onChange={(e) => setFormData({ ...formData, basedOn: e.target.value, specificPreference: '' })}
                        >
                            <option value="Nakshatra">{t('namakaran.nakshatraSyllables', 'Nakshatra Syllables')} ({nakshatraData.syllables.join(', ')})</option>
                            <option value="Religion">{t('namakaran.religionOnly', 'Religion Only')}</option>
                            <option value="Deity">{t('namakaran.deity', 'Deity (God/Goddess)')}</option>
                            <option value="Alphabet">{t('namakaran.startingAlphabet', 'Starting Alphabet')}</option>
                        </select>
                    </div>

                    {(formData.basedOn === 'Deity' || formData.basedOn === 'Alphabet') && (
                        <div className="input-group" style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                                {formData.basedOn === 'Deity' ? t('namakaran.selectDeity', 'Select Deity') : t('namakaran.selectLetter', 'Select Starting Letter')}
                            </label>
                            <select
                                name="specificPreference"
                                value={formData.specificPreference}
                                onChange={handleInputChange}
                            >
                                <option value="">-- {t('namakaran.select', 'Select')} --</option>
                                {getSpecificOptions().map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <button
                        onClick={handleFindNames}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            background: 'var(--accent-color)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            marginTop: '1rem'
                        }}
                    >
                        {t('namakaran.findNames', 'Find Names')}
                    </button>
                </div>
            )}

            {result && (
                <div className="results-section" style={{ marginTop: '2rem' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--accent-color)' }}>{t('namakaran.suggestedNames', 'Suggested Names')}</h2>
                    {result.names.length === 0 ? (
                        <p style={{ textAlign: 'center' }}>{t('namakaran.noNamesFound', 'No names found matching your criteria.')}</p>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--card-bg)', borderRadius: '0.5rem', overflow: 'hidden' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(255,255,255,0.1)' }}>
                                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>{t('cols.name', 'Name')}</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>{t('namakaran.meaning', 'Meaning')}</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>{t('cols.gender', 'Gender')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.names.map((n, index) => (
                                        <tr key={index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '1rem', fontWeight: 'bold' }}>{n.name}</td>
                                            <td style={{ padding: '1rem' }}>{n.meaning || '-'}</td>
                                            <td style={{ padding: '1rem', textTransform: 'capitalize' }}>{n.gender}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NamakaranPage;
