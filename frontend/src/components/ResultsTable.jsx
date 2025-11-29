import React from 'react';
import { calculateNakshatra, getNakshatraAbbr } from '../utils/nakshatraUtils';

const ResultsTable = ({ data }) => {
    if (!data) return null;

    const planets = Object.entries(data).filter(([key]) => key !== 'Ascendant');
    const ascendant = data.Ascendant;

    const formatLongitude = (long) => {
        if (long === undefined || long === null) return 'N/A';
        const d = Math.floor(long);
        const m = Math.floor((long - d) * 60);
        const s = Math.floor(((long - d) * 60 - m) * 60);
        return `${d}° ${m}' ${s}"`;
    };

    const getRasi = (long) => {
        if (long === undefined || long === null) return '';
        const rasis = [
            'Aries', 'Taurus', 'Gemini', 'Cancer',
            'Leo', 'Virgo', 'Libra', 'Scorpio',
            'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
        ];
        return rasis[Math.floor(long / 30)];
    };

    const isRetrograde = (speed) => {
        return speed !== undefined && speed < 0;
    };

    return (
        <div className="results-container">
            <h2>Planetary Positions</h2>
            <div className="ascendant-info">
                <strong>Ascendant:</strong> {getRasi(ascendant?.longitude)} ({formatLongitude(ascendant?.longitude)})
                {ascendant?.longitude && (
                    <>
                        {' '}- Nakshatra: <strong>{calculateNakshatra(ascendant.longitude).name}</strong>
                        {' '}Pada {calculateNakshatra(ascendant.longitude).pada}
                    </>
                )}
            </div>
            <table className="results-table">
                <thead>
                    <tr>
                        <th>Planet</th>
                        <th>Longitude</th>
                        <th>Rasi (Sign)</th>
                        <th>Nakshatra</th>
                        <th>Pada</th>
                        <th>Speed</th>
                    </tr>
                </thead>
                <tbody>
                    {planets.map(([planet, info]) => {
                        const nakshatra = info.longitude ? calculateNakshatra(info.longitude) : null;
                        const retrograde = isRetrograde(info.speed);

                        return (
                            <tr key={planet} className={retrograde ? 'retrograde-row' : ''}>
                                <td>
                                    {planet}
                                    {retrograde && <span className="retrograde-badge"> (R)</span>}
                                </td>
                                <td>{formatLongitude(info.longitude)}</td>
                                <td>{getRasi(info.longitude)}</td>
                                <td>{nakshatra ? getNakshatraAbbr(nakshatra.name) : '-'}</td>
                                <td>{nakshatra ? nakshatra.pada : '-'}</td>
                                <td className={retrograde ? 'speed-retrograde' : ''}>
                                    {info.speed?.toFixed(4)}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default ResultsTable;
