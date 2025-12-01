import React, { useState } from 'react';
import { transformToVarga, getDivisionalChartName } from '../utils/divisionalCharts';
import './NorthIndianChart.css';

const BirthChart = ({ data, formData, defaultDivision = 'd1', hideControls = false }) => {
    const [chartStyle, setChartStyle] = useState('south');
    const [division, setDivision] = useState(defaultDivision);

    if (!data) return null;

    const getRasiNumber = (longitude) => Math.floor(longitude / 30);

    const getRasiName = (rasiNum) => {
        const rasis = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
            'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
        return rasis[rasiNum];
    };

    const getRasiAbbr = (rasiNum) => {
        const abbr = ['Ar', 'Ta', 'Ge', 'Cn', 'Le', 'Vi', 'Li', 'Sc', 'Sg', 'Cp', 'Aq', 'Pi'];
        return abbr[rasiNum];
    };

    const getDegreesInSign = (longitude) => (longitude % 30).toFixed(2);

    const getPlanetAbbr = (planet) => {
        const abbr = {
            'Sun': 'Su', 'Moon': 'Mo', 'Mars': 'Ma', 'Mercury': 'Me',
            'Jupiter': 'Ju', 'Venus': 'Ve', 'Saturn': 'Sa',
            'Rahu': 'Ra', 'Ketu': 'Ke'
        };
        return abbr[planet] || planet.substring(0, 2);
    };

    // Transform data based on selected division
    const displayData = transformToVarga(data, division);
    const ascendantLong = displayData.Ascendant?.longitude || 0;
    const ascendantRasi = getRasiNumber(ascendantLong);

    const planetsByRasi = {};
    for (let i = 0; i < 12; i++) {
        planetsByRasi[i] = [];
    }

    planetsByRasi[ascendantRasi].push({
        abbr: 'Asc',
        degrees: getDegreesInSign(ascendantLong)
    });

    Object.entries(displayData).forEach(([planet, info]) => {
        if (planet !== 'Ascendant' && info.longitude !== undefined) {
            const rasiNum = getRasiNumber(info.longitude);
            planetsByRasi[rasiNum].push({
                abbr: getPlanetAbbr(planet),
                degrees: getDegreesInSign(info.longitude)
            });
        }
    });

    const renderSouthIndian = () => {
        const rasiGrid = [
            [11, 0, 1, 2],
            [10, 'center', 'center', 3],
            [9, 'center', 'center', 4],
            [8, 7, 6, 5]
        ];

        let centerRendered = false;

        return (
            <div className="south-indian-chart">
                <div className="chart-grid-south">
                    {rasiGrid.map((row, rowIdx) => (
                        <div key={rowIdx} className="chart-row-south">
                            {row.map((rasiNum, colIdx) => {
                                if (rasiNum === 'center') {
                                    if (!centerRendered) {
                                        centerRendered = true;
                                        return (
                                            <div key="center" className="chart-cell-south center-merged">
                                                <div className="chart-title-south">{getDivisionalChartName(division)}</div>
                                                <div className="birth-details">
                                                    {formData?.name && (
                                                        <div className="detail-row">
                                                            <strong>Name:</strong> {formData.name}
                                                        </div>
                                                    )}
                                                    <div className="detail-row lagna-highlight">
                                                        <strong>Lagna:</strong> {getRasiName(ascendantRasi)}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }

                                if (typeof rasiNum !== 'number') return null;

                                const houseNum = ((rasiNum - ascendantRasi + 12) % 12) + 1;
                                const isAscendant = houseNum === 1;

                                return (
                                    <div
                                        key={colIdx}
                                        className={`chart-cell-south ${isAscendant ? 'ascendant-cell-south' : ''}`}
                                    >
                                        <div className="cell-header-south">
                                            <span className="rasi-label-south">{getRasiName(rasiNum)}</span>
                                            <span className="house-label-south">{houseNum}</span>
                                        </div>
                                        <div className="cell-content-south">
                                            {planetsByRasi[rasiNum].map((planet, idx) => (
                                                <div key={idx} className="planet-item-south">
                                                    {planet.abbr}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderNorthIndian = () => {
        const houses = [
            { num: 1, x: 200, y: 90, rasiNum: ascendantRasi, isAsc: true },
            { num: 2, x: 115, y: 75, rasiNum: (ascendantRasi + 1) % 12 },
            { num: 3, x: 85, y: 115, rasiNum: (ascendantRasi + 2) % 12 },
            { num: 4, x: 85, y: 200, rasiNum: (ascendantRasi + 3) % 12 },
            { num: 5, x: 85, y: 275, rasiNum: (ascendantRasi + 4) % 12 },
            { num: 6, x: 115, y: 325, rasiNum: (ascendantRasi + 5) % 12 },
            { num: 7, x: 200, y: 310, rasiNum: (ascendantRasi + 6) % 12 },
            { num: 8, x: 285, y: 325, rasiNum: (ascendantRasi + 7) % 12 },
            { num: 9, x: 315, y: 275, rasiNum: (ascendantRasi + 8) % 12 },
            { num: 10, x: 315, y: 200, rasiNum: (ascendantRasi + 9) % 12 },
            { num: 11, x: 315, y: 125, rasiNum: (ascendantRasi + 10) % 12 },
            { num: 12, x: 285, y: 75, rasiNum: (ascendantRasi + 11) % 12 },
        ];

        return (
            <div className="north-indian-chart">
                <svg viewBox="0 0 400 400" className="north-svg">
                    <rect x="50" y="50" width="300" height="300" fill="var(--card-bg)" stroke="var(--text-primary)" strokeWidth="3" />
                    <line x1="50" y1="50" x2="350" y2="350" stroke="var(--text-primary)" strokeWidth="2" />
                    <line x1="350" y1="50" x2="50" y2="350" stroke="var(--text-primary)" strokeWidth="2" />
                    <line x1="200" y1="50" x2="350" y2="200" stroke="var(--text-primary)" strokeWidth="2" />
                    <line x1="350" y1="200" x2="200" y2="350" stroke="var(--text-primary)" strokeWidth="2" />
                    <line x1="200" y1="350" x2="50" y2="200" stroke="var(--text-primary)" strokeWidth="2" />
                    <line x1="50" y1="200" x2="200" y2="50" stroke="var(--text-primary)" strokeWidth="2" />

                    {houses.map(({ num, x, y, rasiNum, isAsc }) => {
                        const planetsInHouse = planetsByRasi[rasiNum].map(p => p.abbr).join(', ');

                        return (
                            <g key={num}>
                                <text
                                    x={x}
                                    y={y}
                                    textAnchor="middle"
                                    fill={isAsc ? "#3b82f6" : "var(--accent-color)"}
                                    fontSize="8"
                                    fontWeight="700"
                                >
                                    H{num}
                                </text>

                                {isAsc && (
                                    <text
                                        x={x}
                                        y={y + 10}
                                        textAnchor="middle"
                                        fill="var(--accent-color)"
                                        fontSize="6"
                                        fontWeight="600"
                                    >
                                        Rising Lagna
                                    </text>
                                )}

                                <text
                                    x={x}
                                    y={isAsc ? y + 19 : y + 10}
                                    textAnchor="middle"
                                    fill="var(--text-primary)"
                                    fontSize="8"
                                    fontWeight="600"
                                >
                                    {getRasiAbbr(rasiNum)}
                                </text>

                                {planetsInHouse && (
                                    <text
                                        x={x}
                                        y={isAsc ? y + 28 : y + 19}
                                        textAnchor="middle"
                                        fill="#8b5cf6"
                                        fontSize="7"
                                        fontWeight="700"
                                    >
                                        {planetsInHouse}
                                    </text>
                                )}
                            </g>
                        );
                    })}
                </svg>
            </div>
        );
    };

    const renderWestern = () => {
        const cx = 200;
        const cy = 200;
        const outerRadius = 150;
        const innerRadius = 100;
        const planetRadius = 125;

        const getWesternAngle = (longitude) => {
            const adjustedLong = (180 - longitude) % 360;
            return (adjustedLong * Math.PI) / 180;
        };

        const houseCusps = [];
        for (let i = 0; i < 12; i++) {
            const houseLongitude = (ascendantLong + (i * 30)) % 360;
            const angle = getWesternAngle(houseLongitude);
            const x1 = cx + innerRadius * Math.cos(angle);
            const y1 = cy - innerRadius * Math.sin(angle);
            const x2 = cx + outerRadius * Math.cos(angle);
            const y2 = cy - outerRadius * Math.sin(angle);
            houseCusps.push({ x1, y1, x2, y2, num: i + 1 });
        }

        const planetsWithPositions = Object.entries(displayData)
            .filter(([planet, info]) => info.longitude !== undefined)
            .map(([planet, info]) => {
                const angle = getWesternAngle(info.longitude);
                const x = cx + planetRadius * Math.cos(angle);
                const y = cy - planetRadius * Math.sin(angle);
                return {
                    name: planet,
                    abbr: planet === 'Ascendant' ? 'Asc' : getPlanetAbbr(planet),
                    x,
                    y,
                    longitude: info.longitude
                };
            });

        const zodiacSigns = [];
        for (let i = 0; i < 12; i++) {
            const signLongitude = (i * 30 + 15) % 360;
            const angle = getWesternAngle(signLongitude);
            const x = cx + (outerRadius + 20) * Math.cos(angle);
            const y = cy - (outerRadius + 20) * Math.sin(angle);
            zodiacSigns.push({ x, y, abbr: getRasiAbbr(i) });
        }

        const ascAngle = getWesternAngle(ascendantLong);
        const ascX = cx + (outerRadius + 15) * Math.cos(ascAngle);
        const ascY = cy - (outerRadius + 15) * Math.sin(ascAngle);

        return (
            <div className="western-chart">
                <svg viewBox="0 0 400 400" className="western-svg">
                    <circle cx={cx} cy={cy} r={outerRadius} fill="none" stroke="var(--text-primary)" strokeWidth="2" />
                    <circle cx={cx} cy={cy} r={innerRadius} fill="var(--card-bg)" stroke="var(--text-primary)" strokeWidth="2" />

                    {houseCusps.map((cusp, idx) => (
                        <line
                            key={idx}
                            x1={cusp.x1}
                            y1={cusp.y1}
                            x2={cusp.x2}
                            y2={cusp.y2}
                            stroke="var(--text-primary)"
                            strokeWidth="1"
                        />
                    ))}

                    {houseCusps.map((cusp, idx) => {
                        const midAngle = getWesternAngle((ascendantLong + (idx * 30 + 15)) % 360);
                        const textX = cx + (innerRadius * 0.7) * Math.cos(midAngle);
                        const textY = cy - (innerRadius * 0.7) * Math.sin(midAngle);

                        return (
                            <text
                                key={`house-${idx}`}
                                x={textX}
                                y={textY}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="var(--accent-color)"
                                fontSize="12"
                                fontWeight="700"
                            >
                                {cusp.num}
                            </text>
                        );
                    })}

                    {zodiacSigns.map((sign, idx) => (
                        <text
                            key={`sign-${idx}`}
                            x={sign.x}
                            y={sign.y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="var(--text-primary)"
                            fontSize="10"
                            fontWeight="600"
                        >
                            {sign.abbr}
                        </text>
                    ))}

                    {planetsWithPositions.map((planet, idx) => (
                        <g key={`planet-${idx}`}>
                            <circle cx={planet.x} cy={planet.y} r="3" fill="#8b5cf6" />
                            <text
                                x={planet.x}
                                y={planet.y - 8}
                                textAnchor="middle"
                                fill="#8b5cf6"
                                fontSize="9"
                                fontWeight="700"
                            >
                                {planet.abbr}
                            </text>
                        </g>
                    ))}

                    <text
                        x={ascX}
                        y={ascY}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#3b82f6"
                        fontSize="11"
                        fontWeight="800"
                    >
                        ASC
                    </text>
                </svg>
            </div>
        );
    };

    const renderEastIndian = () => {
        const signs = [
            { num: 1, name: 'Ar', x: 200, y: 50 },
            { num: 2, name: 'Ta', x: 50, y: 50 },
            { num: 3, name: 'Ge', x: 50, y: 200 },
            { num: 4, name: 'Cn', x: 50, y: 350 },
            { num: 5, name: 'Le', x: 200, y: 350 },
            { num: 6, name: 'Vi', x: 350, y: 350 },
            { num: 7, name: 'Li', x: 350, y: 200 },
            { num: 8, name: 'Sc', x: 350, y: 50 },
            { num: 9, name: 'Sg', x: 275, y: 125 },
            { num: 10, name: 'Cp', x: 275, y: 275 },
            { num: 11, name: 'Aq', x: 125, y: 275 },
            { num: 12, name: 'Pi', x: 125, y: 125 },
        ];

        return (
            <div className="east-indian-chart">
                <svg viewBox="0 0 400 400" className="east-svg">
                    <rect x="0" y="0" width="400" height="400" fill="var(--card-bg)" stroke="var(--text-primary)" strokeWidth="3" />
                    <line x1="133" y1="0" x2="133" y2="400" stroke="var(--text-primary)" strokeWidth="2" />
                    <line x1="266" y1="0" x2="266" y2="400" stroke="var(--text-primary)" strokeWidth="2" />
                    <line x1="0" y1="133" x2="400" y2="133" stroke="var(--text-primary)" strokeWidth="2" />
                    <line x1="0" y1="266" x2="400" y2="266" stroke="var(--text-primary)" strokeWidth="2" />
                    <line x1="0" y1="0" x2="400" y2="400" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="5,5" />
                    <line x1="400" y1="0" x2="0" y2="400" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="5,5" />

                    {signs.map((sign) => {
                        const rasiIdx = sign.num - 1;
                        const planetsInSign = planetsByRasi[rasiIdx];
                        const isAscendant = rasiIdx === ascendantRasi;
                        const houseNum = ((rasiIdx - ascendantRasi + 12) % 12) + 1;

                        return (
                            <g key={sign.num}>
                                <text x={sign.x} y={sign.y - 15} textAnchor="middle" fill="var(--text-primary)" fontSize="10" fontWeight="700">{sign.name}</text>
                                <rect x={sign.x - 16} y={sign.y - 12} width="32" height="20" rx="4" ry="4" fill="#2563eb" />
                                <text x={sign.x} y={sign.y + 3} textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="800">{houseNum}</text>
                                {planetsInSign.map((planet, idx) => (
                                    <text key={idx} x={sign.x} y={sign.y + 15 + (idx * 10)} textAnchor="middle" fill="#8b5cf6" fontSize="9" fontWeight="600">{planet.abbr} {planet.degrees}</text>
                                ))}
                                {isAscendant && <text x={sign.x} y={sign.y - 25} textAnchor="middle" fill="#3b82f6" fontSize="8" fontWeight="700">ASC</text>}
                            </g>
                        );
                    })}
                </svg>
            </div>
        );
    };

    const vargaOptions = [
        { id: 'd1', label: 'D-1 Rasi (Body)' },
        { id: 'd2', label: 'D-2 Hora (Wealth)' },
        { id: 'd3', label: 'D-3 Drekkana (Siblings)' },
        { id: 'd4', label: 'D-4 Chaturthamsa (Fortune)' },
        { id: 'd7', label: 'D-7 Saptamsa (Children)' },
        { id: 'd9', label: 'D-9 Navamsa (Spouse & Dharma)' },
        { id: 'd10', label: 'D-10 Dasamsa (Profession)' },
        { id: 'd12', label: 'D-12 Dwadasamsa (Parents)' },
        { id: 'd16', label: 'D-16 Shodasamsa (Vehicles & Comforts)' },
        { id: 'd20', label: 'D-20 Vimsamsa (Spiritual)' },
        { id: 'd24', label: 'D-24 Chaturvimsamsa (Education)' },
        { id: 'd27', label: 'D-27 Saptavimsamsa (Strengths)' },
        { id: 'd30', label: 'D-30 Trimsamsa (Evils)' },
        { id: 'd40', label: 'D-40 Khavedamsa (Auspiciousness)' },
        { id: 'd45', label: 'D-45 Akshavedamsa (General)' },
        { id: 'd60', label: 'D-60 Shastiamsa (Past Karma)' },
        { id: 'bhava', label: 'Bhava Chalit (Houses)' }
    ];

    return (
        <div className="birth-chart-container">
            <div className="chart-header">
                <h2>{getDivisionalChartName(division)}</h2>

                {!hideControls && (
                    <div className="division-selector">
                        <select
                            value={division}
                            onChange={(e) => setDivision(e.target.value)}
                            className="varga-select"
                        >
                            {vargaOptions.map(opt => (
                                <option key={opt.id} value={opt.id}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="chart-style-selector">
                    {['north', 'south', 'east', 'western'].map(style => (
                        <button
                            key={style}
                            className={chartStyle === style ? 'active' : ''}
                            onClick={() => setChartStyle(style)}
                        >
                            {style.charAt(0).toUpperCase() + style.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="chart-info">
                <strong>Ascendant (Lagna):</strong> {getRasiName(ascendantRasi)} {getDegreesInSign(ascendantLong)}°
                {division !== 'd1' && <span className="division-note"> ({getDivisionalChartName(division)} Position)</span>}
            </div>

            {chartStyle === 'north' && renderNorthIndian()}
            {chartStyle === 'south' && renderSouthIndian()}
            {chartStyle === 'east' && renderEastIndian()}
            {chartStyle === 'western' && renderWestern()}
        </div>
    );
};

export default BirthChart;
