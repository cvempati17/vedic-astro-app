import React from 'react';
import { createPortal } from 'react-dom';
import { getPlanetShortName, getSignData, getAspectingPlanets, formatPlanetLine } from '../utils/advancedChartUtils';
import { calculateYogas } from '../utils/yogaUtils';
import { getHouseType, getPurushartha } from '../utils/houseUtils';
import { SIGN_INTERPRETATIONS, HOUSE_INTERPRETATIONS, PLANET_HOUSE_INTERPRETATIONS, PLANET_KEYWORDS, CONJUNCTION_INTERPRETATIONS, ASPECT_INTERPRETATIONS } from '../utils/interpretationData';

const HousePredictionReport = ({ houseNum, signIndex, planetsInHouse, allPlanetsData, ascendantLong, onClose }) => {
    // Merge basic sign data with detailed interpretation data to ensure all props exist
    const signDataBasic = getSignData(signIndex);
    const signDataDetailed = SIGN_INTERPRETATIONS[signIndex] || {};
    // detailed has: element, quality, traits, ruler, etc.
    // basic has: name, ruler, tatva, goal
    const signData = { ...signDataBasic, ...signDataDetailed };

    const aspectingPlanets = getAspectingPlanets(signIndex, allPlanetsData);
    const allYogas = calculateYogas(allPlanetsData);

    // Filter relevant Yogas
    const relevantYogas = allYogas.filter(yoga => {
        const planetNamesInHouse = planetsInHouse.map(p => p.name);
        if (planetNamesInHouse.some(pName => yoga.description.includes(pName))) return true;

        // Include Mahapurusha yogas for this house's sign lord if applicable? 
        // For simplicity, let's stick to planets IN the house or aspects.
        return false;
    });

    // Content Generators
    const getPlanetText = (planetName, house) => {
        const key = `${planetName}-${house}`;
        if (PLANET_HOUSE_INTERPRETATIONS[key]) return PLANET_HOUSE_INTERPRETATIONS[key];
        return PLANET_HOUSE_INTERPRETATIONS['default'](planetName, house);
    };

    const getSignText = (signIdx, planetName) => {
        const signInfo = SIGN_INTERPRETATIONS[signIdx];
        if (planetName && signInfo[planetName.toLowerCase()]) return signInfo[planetName.toLowerCase()];
        return signInfo.traits; // Fallback to general sign traits
    };

    const styles = {
        overlay: {
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: '#f8fafc', // Light background, full screen
            zIndex: 9999,
            overflowY: 'auto',
            fontFamily: '"Inter", sans-serif' // Ensure clean font
        },
        container: {
            maxWidth: '1000px', margin: '0 auto', padding: '40px 20px',
            backgroundColor: '#ffffff', minHeight: '100vh',
            boxShadow: '0 0 20px rgba(0,0,0,0.05)'
        },
        header: {
            borderBottom: '2px solid #e2e8f0', paddingBottom: '20px', marginBottom: '30px',
            position: 'relative'
        },
        backButton: {
            position: 'absolute', top: '0', right: '0',
            padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px',
            cursor: 'pointer', fontWeight: '600'
        },
        sectionHeading: {
            color: '#1e3a8a', fontSize: '1.4rem', fontWeight: '700',
            borderLeft: '5px solid #3b82f6', paddingLeft: '12px', marginTop: '40px', marginBottom: '20px',
            display: 'flex', alignItems: 'center'
        },
        subHeading: {
            fontSize: '1.1rem', fontWeight: '600', color: '#334155', marginTop: '20px', marginBottom: '10px'
        },
        paragraph: {
            color: '#475569', lineHeight: '1.7', fontSize: '1rem', marginBottom: '16px'
        },
        card: {
            backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', marginBottom: '15px'
        },
        bulletList: {
            listStyleType: 'disc', paddingLeft: '20px', color: '#475569'
        },
        badge: {
            display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '600', marginRight: '8px'
        }
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.container}>
                <div style={styles.header}>
                    <h1 style={{ color: '#0f172a', fontSize: '2.5rem', margin: 0 }}>House {houseNum} Analysis</h1>
                    <div style={{ color: '#64748b', fontSize: '1.2rem', marginTop: '8px' }}>
                        {signData.name} Ascendant • {HOUSE_INTERPRETATIONS[houseNum]}
                    </div>
                    <button style={styles.backButton} onClick={onClose}>Back to Advanced Chart</button>
                </div>

                {/* 1. Ascendant & House Strength */}
                <div id="section-1">
                    <div style={styles.sectionHeading}>
                        1. Sign & House Influence
                    </div>
                    <div style={styles.paragraph}>
                        <strong>{signData.name}</strong> is in the {getOrdinal(houseNum)} House.
                        This sign is ruled by <strong>{signData.ruler}</strong> and belongs to the <strong>{signData.tatva}</strong> element.
                    </div>
                    <div style={styles.card}>
                        <h4 style={{ marginTop: 0, color: '#3b82f6' }}>Core Themes of {signData.name} in House {houseNum}</h4>
                        <p style={styles.paragraph}>{getSignText(signIndex)}</p>
                        <p style={styles.paragraph}>
                            This house governs <strong>{HOUSE_INTERPRETATIONS[houseNum]}</strong>.
                            The influence of {signData.name} (a {signData.tatva} sign) suggests that matters related to this house will be approached with
                            {signData.tatva === 'Fire' ? ' energy, passion, and directness' :
                                signData.tatva === 'Earth' ? ' practicality, patience, and stability' :
                                    signData.tatva === 'Air' ? ' intellect, communication, and social connection' :
                                        ' emotion, intuition, and depth'}.
                        </p>
                    </div>
                </div>

                {/* 2. Planets in House */}
                <div id="section-2">
                    <div style={styles.sectionHeading}>
                        2. Planets in the {getOrdinal(houseNum)} House (Very Important)
                    </div>
                    {planetsInHouse.length > 0 ? (
                        planetsInHouse.map((p, idx) => {
                            const lineData = formatPlanetLine(p.name, p.data, ascendantLong, allPlanetsData.Sun.longitude);
                            return (
                                <div key={idx} style={styles.card}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '10px' }}>
                                        <h3 style={{ margin: 0, color: '#1e293b' }}>
                                            {p.name} <span style={{ fontWeight: 'normal', fontSize: '0.9em', color: '#64748b' }}>at {lineData.degStr}</span>
                                        </h3>
                                        <div>
                                            {lineData.nature === 'B' && <span style={{ ...styles.badge, backgroundColor: '#dcfce7', color: '#166534' }}>Benefic</span>}
                                            {lineData.nature !== 'B' && <span style={{ ...styles.badge, backgroundColor: '#fee2e2', color: '#991b1b' }}>Malefic</span>}
                                            <span style={{ ...styles.badge, backgroundColor: '#e2e8f0', color: '#334155' }}>{lineData.avastha} Avastha</span>
                                            {lineData.isCombust && <span style={{ ...styles.badge, backgroundColor: '#ffedd5', color: '#9a3412' }}>Combust</span>}
                                        </div>
                                    </div>

                                    <h4 style={styles.subHeading}>Impact</h4>
                                    <p style={styles.paragraph}>
                                        {getPlanetText(p.name, houseNum)}
                                    </p>

                                    <h4 style={styles.subHeading}>Detailed Effects</h4>
                                    <ul style={styles.bulletList}>
                                        <li><strong>Sign Placement:</strong> {p.name} in {signData.name} ({signData.element}) - {getSignText(signIndex, p.name)}</li>
                                        <li><strong>Strength:</strong> Being in {lineData.avastha} avastha, {p.name} is {lineData.avastha === 'Yuva' ? 'fully capable of delivering results' : lineData.avastha === 'Mrita' ? 'unable to deliver strong results' : 'moderately capable'}.</li>
                                        {lineData.isCombust && <li style={{ color: '#dc2626' }}><strong>Warning:</strong> {p.name} is Combust (too close to Sun), which may weaken its external expression or internalize its energy.</li>}
                                    </ul>
                                </div>
                            );
                        })
                    ) : (
                        <p style={styles.paragraph}>
                            There are no planets present in this house. The results will primarily be delivered by the House Ruler ({signData.ruler}) and any planets aspecting this house.
                        </p>
                    )}
                </div>

                {/* 3. Conjunctions & Interaction */}
                {planetsInHouse.length > 1 && (
                    <div id="section-3">
                        <div style={styles.sectionHeading}>
                            3. Planetary Interactions (Conjunctions)
                        </div>
                        <p style={styles.paragraph}>Multiple planets in one house create a blending of energies.</p>
                        {getConjunctions(planetsInHouse).map((conj, idx) => (
                            <div key={idx} style={styles.card}>
                                <strong>{conj.pair}</strong>: {conj.text}
                            </div>
                        ))}
                    </div>
                )}

                {/* 4. Aspects */}
                <div id="section-4">
                    <div style={styles.sectionHeading}>
                        4. Aspects to this House
                    </div>
                    <p style={styles.paragraph}>
                        The following aspects modify the results of this house:
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {aspectingPlanets.length > 0 ? aspectingPlanets.map((p, i) => (
                            <div key={i} style={{ ...styles.card, border: '1px solid #bae6fd', borderLeft: '5px solid #0284c7', backgroundColor: '#f0f9ff' }}>
                                <h4 style={{ marginTop: 0, color: '#0369a1' }}>{p} Aspect</h4>
                                <p style={{ ...styles.paragraph, marginBottom: 0 }}>
                                    {ASPECT_INTERPRETATIONS[p] || "This aspect brings the energy of " + p + " to this house."}
                                </p>
                            </div>
                        )) : <div style={{ color: '#64748b', fontStyle: 'italic' }}>No major planetary aspects to this house.</div>}
                    </div>
                </div>

                {/* 5. Yoga Analysis */}
                <div id="section-5">
                    <div style={styles.sectionHeading}>
                        5. Yoga Analysis (Special Combinations)
                    </div>
                    {relevantYogas.length > 0 ? (
                        relevantYogas.map((yoga, idx) => (
                            <div key={idx} style={{ ...styles.card, borderLeft: '5px solid #f59e0b' }}>
                                <h3 style={{ marginTop: 0, color: '#b45309' }}>{yoga.name}</h3>
                                <div style={{ fontWeight: '600', color: '#78350f', marginBottom: '8px' }}>{yoga.type}</div>
                                <p style={styles.paragraph}>{yoga.description}</p>
                                <div style={{ fontSize: '0.9rem', color: '#b45309' }}>
                                    Rating: <span style={{ color: '#f59e0b' }}>★★★★☆</span> (Strong)
                                </div>
                            </div>
                        ))
                    ) : (
                        <p style={styles.paragraph}>No specific major Yogas detected primarily involving this house's planets.</p>
                    )}
                </div>

                {/* 6. Summary */}
                <div id="section-6">
                    <div style={styles.sectionHeading}>
                        6. Overall Prediction Summary
                    </div>
                    <div style={{ backgroundColor: '#f0fdf4', padding: '20px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                        <h4 style={{ marginTop: 0, color: '#166534' }}>Final Verdict</h4>
                        <div style={styles.paragraph}>
                            <ul style={styles.bulletList}>
                                <li><strong>Personality/Vibe:</strong> {getSummary(houseNum, planetsInHouse, signData, 'personality')}</li>
                                <li><strong>Impact on Life:</strong> {getSummary(houseNum, planetsInHouse, signData, 'impact')}</li>
                            </ul>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

// --- Helpers ---

const getOrdinal = (n) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const getConjunctions = (planets) => {
    // Generate simple pairs
    const pairs = [];
    for (let i = 0; i < planets.length; i++) {
        for (let j = i + 1; j < planets.length; j++) {
            const p1 = planets[i].name;
            const p2 = planets[j].name;
            const key1 = `${p1}-${p2}`;
            const key2 = `${p2}-${p1}`;
            const text = CONJUNCTION_INTERPRETATIONS[key1] || CONJUNCTION_INTERPRETATIONS[key2] || `${p1} and ${p2} combine their energies. This blends ${PLANET_KEYWORDS[p1]} with ${PLANET_KEYWORDS[p2]}.`;
            pairs.push({ pair: `${p1} + ${p2}`, text });
        }
    }
    return pairs;
};

const getSummary = (house, planets, sign, type) => {
    // Ensure properties exist to prevent crash
    const traits = sign.traits ? sign.traits.toLowerCase() : 'active';
    const quality = sign.quality ? sign.quality.toLowerCase() : 'variable';
    const element = sign.element || sign.tatva || 'mixed';

    if (type === 'personality') {
        if (house === 1) return `You present yourself as ${traits}`;
        return `This area of life (${HOUSE_INTERPRETATIONS[house].split(',')[0]}) is characterized by ${quality} energy and ${element.toLowerCase()} stability/passion.`;
    }
    if (type === 'impact') {
        if (planets.length === 0) return "Results will come steadily through the sign ruler's placement.";
        return `With ${planets.length} planets here, this is a highly active area of life. Focus on ${HOUSE_INTERPRETATIONS[house].split(',')[0]} will be central.`;
    }
    return '';
};

export default HousePredictionReport;
