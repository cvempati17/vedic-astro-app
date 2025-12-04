import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { calculateAspectsOfLife, getAspectLabel } from '../utils/aspectLifeUtils';
import './AspectOfLifeView.css';

const AspectOfLifeView = ({ chartData, birthDate }) => {
    const { t } = useTranslation();
    const [viewMode, setViewMode] = useState('intensity'); // 'intensity', 'reasons', 'graphs'
    const [selectedAspect, setSelectedAspect] = useState(null); // For scrolling to specific reason

    const aspectData = useMemo(() => {
        return calculateAspectsOfLife(chartData, birthDate);
    }, [chartData, birthDate]);

    if (!aspectData || aspectData.length === 0) {
        return <div className="no-data">Insufficient data to calculate aspects.</div>;
    }

    const allAspects = [
        'career', 'marriage', 'health', 'finances', 'kids',
        'parents', 'siblings', 'business', 'spiritual'
    ];

    const [selectedAspects, setSelectedAspects] = useState(allAspects.slice(0, 4));
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleScoreClick = (aspectKey) => {
        setSelectedAspect(aspectKey);
        setViewMode('reasons');
    };

    const toggleAspect = (key) => {
        setSelectedAspects((prev) => {
            if (prev.includes(key)) {
                const next = prev.filter((k) => k !== key);
                return next.length === 0 ? allAspects.slice(0, 4) : next;
            }
            return [...prev, key];
        });
    };

    const handleSelectAllAspects = () => {
        if (selectedAspects.length === allAspects.length) {
            // Clear -> revert to default 4
            setSelectedAspects(allAspects.slice(0, 4));
        } else {
            setSelectedAspects(allAspects);
        }
    };

    return (
        <div className="aspect-life-container">
            <div className="aspect-filter-bar">
                <div className="aspect-filter-label">Select Aspects of Life:</div>
                <div className="multi-select-container aspect-multi-select">
                    <div
                        className="multi-select-header"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                        <span>
                            {selectedAspects.length === 0
                                ? 'Select Aspects...'
                                : `${selectedAspects.length} Selected`}
                        </span>
                        <span>{dropdownOpen ? '▲' : '▼'}</span>
                    </div>

                    {dropdownOpen && (
                        <div className="multi-select-options">
                            <div
                                className="candidate-item aspect-select-all"
                                onClick={handleSelectAllAspects}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedAspects.length === allAspects.length}
                                    readOnly
                                />
                                <span>Select All</span>
                            </div>
                            {allAspects.map((key) => (
                                <div
                                    key={key}
                                    className="candidate-item"
                                    onClick={() => toggleAspect(key)}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedAspects.includes(key)}
                                        readOnly
                                    />
                                    <span>{getAspectLabel(key)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="aspect-tabs">
                <button
                    className={`aspect-tab ${viewMode === 'intensity' ? 'active' : ''}`}
                    onClick={() => setViewMode('intensity')}
                >
                    Intensity Table
                </button>
                <button
                    className={`aspect-tab ${viewMode === 'reasons' ? 'active' : ''}`}
                    onClick={() => setViewMode('reasons')}
                >
                    Detailed Reasons
                </button>
                <button
                    className={`aspect-tab ${viewMode === 'graphs' ? 'active' : ''}`}
                    onClick={() => setViewMode('graphs')}
                >
                    Graphs
                </button>
            </div>

            {viewMode === 'intensity' && (
                <div className="aspect-table-wrapper">
                    <h3 className="section-title">Dasha-Bhukti Intensity Table (1-10)</h3>
                    <p className="hint-text">Click on any score to see the reasoning.</p>
                    <table className="aspect-table">
                        <thead>
                            <tr>
                                <th>Mahadasha</th>
                                <th>Bhukti</th>
                                <th>Years</th>
                                {selectedAspects.map(key => (
                                    <th key={key}>{getAspectLabel(key)}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {aspectData.map((row, idx) => (
                                <tr key={idx}>
                                    <td>{row.mahadasha}</td>
                                    <td>{row.bhukti}</td>
                                    <td>{row.yearRange}</td>
                                    {selectedAspects.map(key => {
                                        const score = row.aspects[key].score;
                                        const color = score >= 7
                                            ? '#166534' // good
                                            : score <= 4
                                                ? '#b91c1c' // challenging
                                                : '#1f2937'; // average (between 4 and 7)

                                        let quality = 'Average';
                                        if (score >= 7) quality = 'Good';
                                        else if (score <= 4) quality = 'Challenging';

                                        return (
                                            <td
                                                key={key}
                                                className="score-cell"
                                                onClick={() => handleScoreClick(key)}
                                                style={{
                                                    cursor: 'pointer',
                                                    fontWeight: 'bold',
                                                    color
                                                }}
                                                title={`${quality} intensity – click to see detailed reasons`}
                                            >
                                                {score}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {viewMode === 'reasons' && (
                <div className="aspect-table-wrapper">
                    <h3 className="section-title">Detailed Reasons</h3>
                    <button className="back-link" onClick={() => setViewMode('intensity')}>Back to Intensity</button>
                    <table className="aspect-table reasons-table">
                        <thead>
                            <tr>
                                <th>Period</th>
                                {selectedAspects.map(key => (
                                    <th key={key} className={selectedAspect === key ? 'highlight-header' : ''}>
                                        {getAspectLabel(key)} Reason
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {aspectData.map((row, idx) => (
                                <tr key={idx}>
                                    <td>
                                        <div className="period-cell">
                                            <strong>{row.mahadasha}-{row.bhukti}</strong>
                                            <span>{row.yearRange}</span>
                                        </div>
                                    </td>
                                    {selectedAspects.map(key => (
                                        <td key={key} className={selectedAspect === key ? 'highlight-cell' : ''}>
                                            {row.aspects[key].reason}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {viewMode === 'graphs' && (
                <div className="aspect-graphs-wrapper">
                    {selectedAspects.map(key => (
                        <div key={key} className="graph-container">
                            <h4 className="graph-title">{getAspectLabel(key)} — Trend Across Dasha-Bhukti</h4>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <LineChart data={aspectData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="yearRange"
                                            angle={-45}
                                            textAnchor="end"
                                            height={60}
                                            interval={Math.floor(aspectData.length / 10)}
                                            tick={{ fontSize: 10 }}
                                        />
                                        <YAxis domain={[0, 10]} />
                                        <Tooltip
                                            content={({ active, payload, label }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload;
                                                    return (
                                                        <div className="custom-tooltip">
                                                            <p className="label">{`${data.mahadasha}-${data.bhukti} (${label})`}</p>
                                                            <p className="intro">{`Score: ${payload[0].value}`}</p>
                                                            <p className="desc">{data.aspects[key].reason}</p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey={(d) => d.aspects[key].score}
                                            stroke="#8884d8"
                                            strokeWidth={2}
                                            dot={{ r: 3 }}
                                            activeDot={{ r: 6 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AspectOfLifeView;
