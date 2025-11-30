import React from 'react';
import { calculateVimshottariDasha } from '../utils/dashaUtils';
import './DashaView.css';

const DashaView = ({ moonLongitude, birthDate }) => {
    if (!moonLongitude || !birthDate) return null;

    const dashas = calculateVimshottariDasha(moonLongitude, birthDate);
    const currentDasha = dashas.find(d => d.isCurrent);

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="dasha-container">
            <h3 className="dasha-header">🔮 Vimshottari Dasha</h3>

            {currentDasha && (
                <div className="current-dasha-card">
                    <div className="dasha-label">Current Mahadasha</div>
                    <div className="dasha-planet">{currentDasha.planet}</div>
                    <div className="dasha-dates">
                        {formatDate(currentDasha.startDate)} — {formatDate(currentDasha.endDate)}
                    </div>
                </div>
            )}

            <div className="dasha-timeline">
                <table className="dasha-table">
                    <thead>
                        <tr>
                            <th>Planet</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Duration</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dashas.map((dasha, index) => (
                            <tr key={index} className={dasha.isCurrent ? 'active-dasha-row' : ''}>
                                <td className="planet-cell">
                                    <span className={`planet-dot planet-${dasha.planet.toLowerCase()}`}></span>
                                    {dasha.planet}
                                </td>
                                <td>{formatDate(dasha.startDate)}</td>
                                <td>{formatDate(dasha.endDate)}</td>
                                <td>{dasha.duration.toFixed(1)} yrs</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DashaView;
