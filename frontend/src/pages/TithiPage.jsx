import React, { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import CitySearch from '../components/CitySearch';
import './SavedChartsPage.css'; // Reuse styles

const TithiPage = ({ onBack }) => {
    const { t } = useTranslation();

    // State
    const [mode, setMode] = useState('gregorian'); // 'gregorian' or 'hindu'

    // Globals
    const [location, setLocation] = useState({ lat: 28.61, lng: 77.20, name: 'New Delhi, India' });
    const [eventName, setEventName] = useState('Birthday');
    const [personName, setPersonName] = useState('');

    // Gregorian Input
    const [inputDate, setInputDate] = useState(new Date().toISOString().split('T')[0]);
    const [inputTime, setInputTime] = useState("12:00");
    const [currentDetails, setCurrentDetails] = useState(null);

    // Live Fetch Effect
    React.useEffect(() => {
        const fetchDetails = async () => {
            if (mode !== 'gregorian') return;
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                // We can reuse the same endpoint but searching for the SAME year as input.
                // Actually, we need a new "get-panchang" endpoint OR reuse 'calculate' with year=inputYear.
                // If year=inputYear, it will find the date?
                // No, 'calculate' finds the Gregorian date matching Tithi. 
                // We need simply "What is the Tithi for THIS date?"
                // We can call 'calculate' with mode='gregorian', year=inputYear.
                // But wait, the existing 'calculate' iterates to find a MATCH in that year.
                // It doesn't return the details of the input date itself explicitly as "current details".
                // Actually, it DOES. In 'gregorian' mode steps:
                // 1. Calculate Tithi for inputDate. -> Logged in console.
                // We should expose an endpoint just for "Get Panchang".
                // OR: Use the 'calculate' endpoint but add a flag `onlyDetails: true`?
                // Let's modify backend to support simplified "get-details".
                // OR better: Create a separate useEffect helper that calls a new lightweight endpoint? 
                // Or just use the existing `calculate` and parse the "Source" log? No.

                // Let's modify Backend `tithi.js` to return `sourceDetails` in the response.
                const year = new Date(inputDate).getFullYear();
                const payload = {
                    mode: 'gregorian',
                    year: year,
                    inputDate,
                    inputTime,
                    location,
                    returnSourceDetails: true // Flag I will add to backend
                };
                // We don't want to run the full year scan if we just want details.

                const res = await axios.post(`${API_URL}/api/tithi/calculate`, payload);
                if (res.data.sourceDetails) {
                    setCurrentDetails(res.data.sourceDetails);
                }
            } catch (e) {
                console.error("Failed to fetch details", e);
            }
        };
        // Debounce slightly? 
        const timer = setTimeout(fetchDetails, 500);
        return () => clearTimeout(timer);
    }, [inputDate, inputTime, location, mode]);

    // Hindu Input
    const [hinduMonth, setHinduMonth] = useState('Chaitra');
    const [paksha, setPaksha] = useState('Shukla');
    const [tithiName, setTithiName] = useState('Pratipada');

    // Search Year
    const [searchYear, setSearchYear] = useState(new Date().getFullYear());

    // Results
    const [resultDate, setResultDate] = useState(null);
    const [resultNote, setResultNote] = useState(null);
    const [loading, setLoading] = useState(false);

    // ...

    // Constants
    const HINDU_MONTHS = [
        "Chaitra", "Vaishakha", "Jyeshtha", "Ashadha", "Shravana", "Bhadrapada",
        "Ashvina", "Kartika", "Margashirsha", "Pausha", "Magha", "Phalguna"
    ];

    const TITHI_NAMES = [
        "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashti",
        "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi",
        "Trayodashi", "Chaturdashi", "Purnima", "Amavasya"
    ];

    const generateYears = () => {
        const current = new Date().getFullYear();
        const start = current - 500;
        const end = current + 200;
        const years = [];
        for (let y = start; y <= end; y++) years.push(y);
        return years;
    };

    const handleCitySelect = (cityData) => {
        setLocation({
            lat: cityData.latitude,
            lng: cityData.longitude,
            name: `${cityData.name}, ${cityData.country}`
        });
    };

    const handleDownloadICS = () => {
        if (!resultDate) return;

        const eventTitle = `${eventName} of ${personName || 'Person'}`;
        const eventDate = new Date(resultDate.date);

        // Format Date for ICS: YYYYMMDD
        const formatDate = (date) => {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            return `${y}${m}${d}`;
        };

        const dtStart = formatDate(eventDate);
        // All day event, so next day for end
        const nextDay = new Date(eventDate);
        nextDay.setDate(nextDay.getDate() + 1);
        const dtEnd = formatDate(nextDay);

        const description = `Tithi: ${resultDate.tithi} (${resultDate.paksha})\\n` +
            `Amanta Month: ${resultDate.hinduMonth}\\n` +
            `Purnimanta Month: ${resultDate.purnimantaMonth}\\n` +
            `Tamil Month: ${resultDate.tamilMonth}\\n` +
            `Generated by Vedic Astro App`;

        const icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//VedicAstroApp//NONSGML v1.0//EN',
            'BEGIN:VEVENT',
            `UID:${Date.now()}@vedicastroapp.com`,
            `DTSTAMP:${formatDate(new Date())}T120000Z`,
            `DTSTART;VALUE=DATE:${dtStart}`,
            `DTEND;VALUE=DATE:${dtEnd}`,
            `SUMMARY:${eventTitle}`,
            `DESCRIPTION:${description}`,
            'END:VEVENT',
            'END:VCALENDAR'
        ].join('\r\n');

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${eventName}_${personName}.ics`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleCalculate = async () => {
        setLoading(true);
        setResultDate(null);
        setResultNote(null);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

            const payload = {
                mode,
                year: searchYear,
                location: location // Use state location
            };

            if (mode === 'gregorian') {
                payload.inputDate = inputDate;
                payload.inputTime = inputTime;
            } else {
                payload.hinduDate = {
                    month: hinduMonth,
                    paksha: paksha,
                    tithi: tithiName === 'Amavasya' || tithiName === 'Purnima' ? tithiName : tithiName
                };
            }

            const res = await axios.post(`${API_URL}/api/tithi/calculate`, payload);

            if (res.data.success && res.data.results.length > 0) {
                // Usually returns one date per year for a specific Tithi/Month combo
                // With fallback, it might return dates from adjacent years
                setResultDate(res.data.results[0]);
                if (res.data.note) {
                    setResultNote(res.data.note);
                }
            } else {
                alert("No date found matching the criteria for that year.");
            }
        } catch (e) {
            console.error(e);
            alert("Calculation failed: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="saved-charts-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                <button
                    onClick={onBack}
                    style={{ background: '#151827', color: 'white', border: '1px solid #2a2f4a', padding: '10px 20px', cursor: 'pointer', borderRadius: '5px', marginRight: '20px' }}
                >
                    ← Back
                </button>
                <h1 style={{ color: '#e6c87a', margin: 0 }}>Thithi Calculator</h1>
            </div>

            <div style={{ background: '#0f1324', padding: '30px', borderRadius: '15px', border: '1px solid #2a2f4a' }}>

                {/* Mode Selection */}
                <div style={{ marginBottom: '25px', display: 'flex', gap: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: 'white' }}>
                        <input
                            type="radio"
                            name="mode"
                            value="gregorian"
                            checked={mode === 'gregorian'}
                            onChange={() => setMode('gregorian')}
                            style={{ marginRight: '10px' }}
                        />
                        Gregorian Calendar (Date of Event)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: 'white' }}>
                        <input
                            type="radio"
                            name="mode"
                            value="hindu"
                            checked={mode === 'hindu'}
                            onChange={() => setMode('hindu')}
                            style={{ marginRight: '10px' }}
                        />
                        Hindu Calendar (Tithi/Month)
                    </label>
                </div>

                {/* Location Selection */}
                <div style={{ marginBottom: '20px' }}>
                    <CitySearch
                        onCitySelect={handleCitySelect}
                        defaultValue={location.name}
                        label="Event Location"
                    />
                </div>

                {/* Event Details */}
                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ color: '#94a3b8', display: 'block', marginBottom: '5px' }}>Event Name</label>
                        <select
                            value={eventName}
                            onChange={(e) => setEventName(e.target.value)}
                            style={{ width: '100%', padding: '10px', background: '#1e293b', color: 'white', border: '1px solid #475569', borderRadius: '5px' }}
                        >
                            <option value="Anniversary">Anniversary</option>
                            <option value="Birthday">Birthday</option>
                            <option value="Shradha">Shradha</option>
                            <option value="Upavasa">Upavasa</option>
                            <option value="Utsava">Utsava</option>
                        </select>
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ color: '#94a3b8', display: 'block', marginBottom: '5px' }}>Name of Person</label>
                        <input
                            type="text"
                            value={personName}
                            onChange={(e) => setPersonName(e.target.value)}
                            placeholder="Enter Name"
                            style={{ width: '100%', padding: '10px', background: '#1e293b', color: 'white', border: '1px solid #475569', borderRadius: '5px' }}
                        />
                    </div>
                </div>

                {/* Inputs */}
                {mode === 'gregorian' ? (
                    <div>
                        <div style={{ display: 'flex', gap: '20px', marginBottom: '10px' }}>
                            <div>
                                <label style={{ color: '#94a3b8', display: 'block', marginBottom: '5px' }}>Date of Event</label>
                                <input
                                    type="date"
                                    value={inputDate}
                                    onChange={(e) => setInputDate(e.target.value)}
                                    style={{ padding: '10px', width: '200px', background: '#1e293b', border: '1px solid #475569', color: 'white', borderRadius: '5px' }}
                                />
                            </div>
                            <div>
                                <label style={{ color: '#94a3b8', display: 'block', marginBottom: '5px' }}>Time of Event</label>
                                <input
                                    type="time"
                                    value={inputTime}
                                    onChange={(e) => setInputTime(e.target.value)}
                                    style={{ padding: '10px', width: '150px', background: '#1e293b', border: '1px solid #475569', color: 'white', borderRadius: '5px' }}
                                />
                            </div>
                        </div>

                        {/* Current Date Details Display */}
                        {currentDetails && (
                            <div style={{ background: 'rgba(230, 200, 122, 0.1)', padding: '15px', borderRadius: '8px', border: '1px solid #e6c87a', marginBottom: '20px' }}>
                                <div style={{ color: '#e6c87a', fontWeight: 'bold', marginBottom: '10px' }}>Selected Date Details:</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', color: '#cbd5e1', fontSize: '0.9em' }}>
                                    <div style={{ fontWeight: '600' }}>✨ Tithi: {currentDetails.tithi} ({currentDetails.paksha})</div>
                                    <div style={{ fontWeight: '600' }}>🗓️ Day: {currentDetails.day}</div>
                                    <div style={{ gridColumn: '1 / -1', height: '1px', background: 'rgba(255,255,255,0.1)', margin: '5px 0' }}></div>
                                    <div>📅 Amanta (South): <br /><span style={{ color: '#e6c87a' }}>{currentDetails.hinduMonth}</span></div>
                                    <div>📅 Purnimanta (North): <br /><span style={{ color: '#e6c87a' }}>{currentDetails.purnimantaMonth}</span></div>
                                    <div>☀️ Tamil (Solar): <br /><span style={{ color: '#e6c87a' }}>{currentDetails.tamilMonth}</span></div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '150px' }}>
                            <label style={{ color: '#94a3b8', display: 'block', marginBottom: '5px' }}>Month</label>
                            <select value={hinduMonth} onChange={(e) => setHinduMonth(e.target.value)} style={{ width: '100%', padding: '10px', background: '#1e293b', color: 'white', border: '1px solid #475569', borderRadius: '5px' }}>
                                {HINDU_MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                        <div style={{ flex: 1, minWidth: '150px' }}>
                            <label style={{ color: '#94a3b8', display: 'block', marginBottom: '5px' }}>Paksha</label>
                            <select value={paksha} onChange={(e) => setPaksha(e.target.value)} style={{ width: '100%', padding: '10px', background: '#1e293b', color: 'white', border: '1px solid #475569', borderRadius: '5px' }}>
                                <option value="Shukla">Shukla (Waxing)</option>
                                <option value="Krishna">Krishna (Waning)</option>
                            </select>
                        </div>
                        <div style={{ flex: 1, minWidth: '150px' }}>
                            <label style={{ color: '#94a3b8', display: 'block', marginBottom: '5px' }}>Tithi</label>
                            <select value={tithiName} onChange={(e) => setTithiName(e.target.value)} style={{ width: '100%', padding: '10px', background: '#1e293b', color: 'white', border: '1px solid #475569', borderRadius: '5px' }}>
                                {TITHI_NAMES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '15px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ color: '#94a3b8', display: 'block', marginBottom: '5px' }}>Target Year</label>
                        <select
                            value={searchYear}
                            onChange={(e) => setSearchYear(e.target.value)}
                            style={{ width: '100%', padding: '10px', background: '#1e293b', color: 'white', border: '1px solid #475569', borderRadius: '5px' }}
                        >
                            {generateYears().map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <div>
                        <button
                            onClick={handleCalculate}
                            disabled={loading}
                            style={{
                                padding: '12px 30px',
                                background: 'linear-gradient(90deg, #e6c87a, #bfa24a)',
                                color: '#0f1220',
                                fontWeight: 'bold',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? 'Finding...' : 'Get Date'}
                        </button>
                    </div>
                </div>

            </div>

            {/* Results */}
            {resultDate && (
                <div style={{ marginTop: '30px', background: '#0f1324', padding: '30px', borderRadius: '15px', border: '1px solid #2a2f4a', textAlign: 'center' }}>
                    <h2 style={{ color: '#e6c87a', marginTop: 0, fontSize: '1.5em' }}>
                        {eventName} of {personName || 'Person'}
                    </h2>
                    <div style={{ color: '#94a3b8', marginBottom: '15px' }}>
                        is on
                    </div>
                    <div style={{ fontSize: '2.2em', color: '#fff', fontWeight: 'bold', margin: '10px 0' }}>
                        {new Date(resultDate.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>

                    {resultNote && (
                        <div style={{
                            marginTop: '10px',
                            padding: '10px',
                            background: 'rgba(234, 179, 8, 0.15)',
                            border: '1px solid rgba(234, 179, 8, 0.3)',
                            color: '#fbbf24',
                            borderRadius: '5px',
                            fontSize: '0.9em'
                        }}>
                            ⚠️ {resultNote}
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '30px', textAlign: 'left', background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '10px' }}>
                        <div>
                            <label style={{ color: '#64748b', fontSize: '0.9em' }}>Tithi</label>
                            <div style={{ color: '#e6c87a', fontWeight: '600' }}>{resultDate.tithi} ({resultDate.paksha})</div>
                        </div>
                        <div>
                            <label style={{ color: '#64748b', fontSize: '0.9em' }}>Amanta Month (South)</label>
                            <div style={{ color: '#fff' }}>{resultDate.hinduMonth}</div>
                        </div>
                        <div>
                            <label style={{ color: '#64748b', fontSize: '0.9em' }}>Purnimanta Month (North)</label>
                            <div style={{ color: '#fff' }}>{resultDate.purnimantaMonth}</div>
                        </div>
                        <div>
                            <label style={{ color: '#64748b', fontSize: '0.9em' }}>Tamil Month</label>
                            <div style={{ color: '#fff' }}>{resultDate.tamilMonth}</div>
                        </div>
                    </div>

                    <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
                        <button
                            onClick={handleDownloadICS}
                            style={{
                                background: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold',
                                display: 'flex', alignItems: 'center', gap: '10px'
                            }}
                        >
                            📅 Add to Calendar (iCal)
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TithiPage;
