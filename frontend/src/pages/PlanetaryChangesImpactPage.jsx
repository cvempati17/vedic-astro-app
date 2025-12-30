import React, { useMemo, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const postJson = async (url, payload) => {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const contentType = res.headers.get('content-type') || '';
    const rawText = await res.text();
    const looksLikeJson = contentType.includes('application/json') || rawText.trim().startsWith('{') || rawText.trim().startsWith('[');

    let data = null;
    if (looksLikeJson) {
        try {
            data = JSON.parse(rawText);
        } catch {
            data = null;
        }
    }

    return { res, rawText, data };
};

const PlanetaryChangesImpactPage = ({ onBack }) => {
    const today = useMemo(() => {
        const d = new Date();
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }, []);

    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [events, setEvents] = useState([]);

    const handleFetch = async () => {
        setError('');
        setEvents([]);

        if (!startDate || !endDate) {
            setError('Please select start and end dates');
            return;
        }
        if (endDate < startDate) {
            setError('End date must be on or after start date');
            return;
        }

        setLoading(true);
        try {
            const primaryUrl = `${API_URL}/api/planetary-events`;
            const fallbackUrl = 'http://localhost:5001/api/planetary-events';

            let { res, rawText, data } = await postJson(primaryUrl, { startDate, endDate });

            if (!res.ok && primaryUrl !== fallbackUrl && res.status === 404) {
                const html404 = rawText && rawText.toLowerCase().includes('<!doctype');
                const cannotPost = rawText && rawText.toLowerCase().includes('cannot post');
                if (html404 || cannotPost) {
                    ({ res, rawText, data } = await postJson(fallbackUrl, { startDate, endDate }));
                }
            }

            if (!res.ok) {
                const apiError = data?.error || data?.message;
                const snippet = rawText ? rawText.slice(0, 140) : '';
                throw new Error(apiError || `Request failed (${res.status}). URL: ${res.url}. Response: ${snippet}`);
            }

            if (!data) {
                const snippet = rawText ? rawText.slice(0, 140) : '';
                throw new Error(`Invalid JSON response. URL: ${res.url}. Response: ${snippet}`);
            }

            setEvents(Array.isArray(data?.events) ? data.events : []);
        } catch (e) {
            setError(e?.message || 'Failed to fetch events');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="results-page" style={{ width: '100%' }}>
            <header className="results-header page-header">
                <div className="page-header-left">
                    <button className="back-btn" onClick={onBack}>← Back</button>
                </div>
                <h1 className="page-header-title">Planetry Changes and Its Impact</h1>
                <div className="page-header-right" />
            </header>

            <div style={{ width: '100%', marginTop: '1rem' }}>
                {error && (
                    <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>
                )}

                <div className="card" style={{ maxWidth: '100%', marginBottom: '1rem' }}>
                    <div className="form-row" style={{ alignItems: 'flex-end', flexWrap: 'wrap' }}>
                        <div className="form-group" style={{ minWidth: 220 }}>
                            <label>Start Date</label>
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        </div>
                        <div className="form-group" style={{ minWidth: 220 }}>
                            <label>End Date</label>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        </div>
                        <div className="form-group" style={{ minWidth: 200 }}>
                            <button className="btn-primary" type="button" onClick={handleFetch} disabled={loading}>
                                {loading ? 'Loading…' : 'Get Events'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ maxWidth: '100%' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="candidates-table" style={{ minWidth: 900 }}>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Planet</th>
                                    <th>Event</th>
                                    <th>Description</th>
                                    <th>Impact</th>
                                    <th>Suitability</th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.length === 0 && !loading ? (
                                    <tr>
                                        <td colSpan={6} style={{ color: '#ffffff' }}>No events</td>
                                    </tr>
                                ) : (
                                    events.map((ev, idx) => (
                                        <tr key={`${ev.date || 'date'}-${ev.planet || 'planet'}-${ev.eventType || ev.planetaryEvent || 'event'}-${idx}`}>
                                            <td>{ev.date || ''}</td>
                                            <td>{ev.planet || ''}</td>
                                            <td>{ev.planetaryEvent || ev.event || ev.eventType || ''}</td>
                                            <td>{ev.description || ''}</td>
                                            <td>{ev.impact || ''}</td>
                                            <td>{ev.auspiciousness || ev.suitability || ''}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlanetaryChangesImpactPage;
