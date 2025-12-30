import React from 'react';
import './NorthIndianChart.css'; // borrowing some styles or we can create new ones
import { formatPlanetLine, getSignData, getAspectingPlanets, getAvasthaCode, getFunctionalNatureCode, calculateCombustion, getPlanetShortName } from '../utils/advancedChartUtils';

const AdvancedChartBox = ({
    signIndex,
    ascendantLong,
    moonLong,
    planetsInSign,
    allPlanets,
    sunLong,
    onClick
}) => {

    const signData = getSignData(signIndex);

    // 1. House Number relative to Ascendant
    const ascSign = Math.floor(ascendantLong / 30);
    const houseNum = ((signIndex - ascSign + 12) % 12) + 1;

    // 2. Post From Moon (House from Moon)
    let moonHouseNum = null;
    if (moonLong !== undefined) {
        const moonSign = Math.floor(moonLong / 30);
        moonHouseNum = ((signIndex - moonSign + 12) % 12) + 1;
    }

    // 3. Rashi Ruler info
    const rulerName = signData.ruler;
    const rulerData = allPlanets[rulerName];
    let rulerHouseInfo = 'Unknown';
    if (rulerData) {
        const rulerSign = Math.floor(rulerData.longitude / 30);
        const rulerHouse = ((rulerSign - ascSign + 12) % 12) + 1;
        rulerHouseInfo = `${rulerHouse}`;
    }

    // 4. Aspects
    const aspectingPlanets = getAspectingPlanets(signIndex, allPlanets);

    // 5. Stylings
    // Tatva colors
    const tatvaColors = {
        'Fire': '#fee2e2', // red-100
        'Earth': '#dcfce7', // green-100
        'Air': '#e0f2fe', // sky-100
        'Water': '#dbeafe' // blue-100
    };

    const boxStyle = {
        border: '1px solid #64748b', // Lighter border
        height: '100%', // Flexible height
        width: '100%',
        padding: '6px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        backgroundColor: '#020617', // Very dark background
        color: '#ffffff', // Absolute white for text
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
        overflowY: 'auto', // Scroll if content overflows
        scrollbarWidth: 'thin',
        cursor: 'pointer' // Indicate clickable
    };

    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #475569',
        marginBottom: '6px',
        paddingBottom: '4px',
        fontWeight: 'bold'
    };

    const houseBadgeStyle = {
        backgroundColor: '#dc2626', // Red-600 mostly
        color: 'white',
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '1rem',
        fontWeight: 'bold'
    };

    return (
        <div className="advanced-chart-box" style={boxStyle} onClick={onClick}>
            {/* Header: Sign Name & House Num */}
            <div style={headerStyle}>
                <span className="sign-name" style={{ fontSize: '1.1rem', textTransform: 'uppercase', color: '#fff', letterSpacing: '0.05em' }}>
                    {signData.name}
                </span>
                <div style={{ textAlign: 'right' }}>
                    <div style={houseBadgeStyle} title="House from Ascendant">
                        {houseNum}
                    </div>
                </div>
            </div>

            {/* Planets List */}
            <div className="planets-list" style={{ flex: 1, marginBottom: '5px', textAlign: 'center' }}>
                {planetsInSign.map(p => {
                    const lineData = formatPlanetLine(p.name, p.data, ascendantLong, sunLong);
                    return (
                        <div key={p.name} style={{ fontSize: '0.95rem', margin: '4px 0', lineHeight: '1.2' }}>
                            <span style={{ fontWeight: 'bold', color: '#fcd34d' }}>{lineData.name}</span>
                            <span style={{ marginLeft: '4px', color: '#e2e8f0', fontSize: '0.85rem' }}>{lineData.degStr}</span>
                            <span style={{ marginLeft: '4px', color: '#fbbf24', fontSize: '0.85rem' }}>({lineData.avastha})</span>
                            <span style={{ marginLeft: '4px', color: lineData.nature === 'B' ? '#4ade80' : '#f87171', fontSize: '0.85rem' }}>
                                ({lineData.nature})
                            </span>
                            {lineData.isCombust && <span style={{ marginLeft: '4px', color: '#ef4444', fontWeight: 'bold' }}>(C)</span>}
                        </div>
                    );
                })}
            </div>

            {/* Middle Section: Ruler Position & Moon Post */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', borderTop: '1px solid #334155', paddingTop: '6px', marginBottom: '4px' }}>
                <div style={{ marginRight: '5px' }}>
                    <div style={{ color: '#cbd5e1' }}>Ruler in HSE</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#c084fc', marginTop: '2px' }}>
                        {rulerHouseInfo}
                    </div>
                </div>

                <div>
                    <div style={{ color: '#cbd5e1', textAlign: 'right' }}>From Moon</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#38bdf8', textAlign: 'right', marginTop: '2px' }}>
                        {moonHouseNum}
                    </div>
                </div>
            </div>

            {/* Bottom: Aspects */}
            <div style={{ marginTop: 'auto', borderTop: '1px solid #334155', paddingTop: '4px' }}>
                <div style={{ fontSize: '0.8rem', backgroundColor: '#15803d', color: 'white', padding: '3px', textAlign: 'center', marginBottom: '2px', borderRadius: '2px', fontWeight: 'bold', letterSpacing: '0.05em' }}>
                    ASPECT to this HSE
                </div>
                <div style={{ fontSize: '0.9rem', minHeight: '1.4rem', textAlign: 'center', color: '#f8fafc', fontWeight: '500' }}>
                    {aspectingPlanets.length > 0 ? aspectingPlanets.map(p => getPlanetShortName(p)).join(', ') : '-'}
                </div>
            </div>

        </div>
    );
};

export default AdvancedChartBox;
