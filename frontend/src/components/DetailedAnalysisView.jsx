import React, { useMemo } from 'react';
import { calculateDignity, getPlanetNature, calculateAvastha } from '../utils/strengthUtils';
import { getHouseType, getPurushartha } from '../utils/houseUtils';
import { calculateAspects, getAspectsOnSign } from '../utils/aspectUtils';
import './DetailedAnalysisView.css';

const DetailedAnalysisView = ({ data, formData }) => {
    if (!data || !data.Ascendant) return null;

    const ascLong = data.Ascendant.longitude;
    const moonLong = data.Moon?.longitude || 0;

    const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const elements = ['Fire', 'Earth', 'Air', 'Water'];

    const SIGN_LORDS = [
        'Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury',
        'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'
    ];

    // Memoize aspects calculation
    const allAspects = useMemo(() => calculateAspects(data), [data]);

    // Helper: Get House Number relative to a reference
    const getHouseNum = (planetLong, refLong) => {
        const planetRasi = Math.floor(planetLong / 30);
        const refRasi = Math.floor(refLong / 30);
        return ((planetRasi - refRasi + 12) % 12) + 1;
    };

    // Helper: Get Sign Name
    const getSignName = (longitude) => signs[Math.floor(longitude / 30)];

    // Helper: Get Element
    const getElement = (longitude) => {
        const rasi = Math.floor(longitude / 30);
        return elements[rasi % 4];
    };

    // Helper: Format Degrees
    const formatDeg = (deg) => {
        const d = Math.floor(deg);
        const m = Math.floor((deg - d) * 60);
        return `${d}°${m}'`;
    };

    // Helper: Get Ordinal
    const getOrdinal = (n) => {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return s[(v - 20) % 10] || s[v] || s[0];
    };

    // Generate Planet Analysis Text (Always relative to Ascendant for general planet description)
    const generatePlanetText = (planet) => {
        const info = data[planet];
        if (!info || info.longitude === undefined) return null;

        const planetLong = info.longitude;
        const rasiIndex = Math.floor(planetLong / 30);
        const house = getHouseNum(planetLong, ascLong); // Planet positions usually described from Ascendant
        const sign = signs[rasiIndex];
        const element = getElement(planetLong);

        const dignity = calculateDignity(planet, planetLong, ascLong);
        const nature = getPlanetNature(planet, ascLong);
        const avastha = calculateAvastha(planetLong);
        const houseType = getHouseType(house).join(', ');
        const purushartha = getPurushartha(house);

        // Lordship Logic
        const signLord = SIGN_LORDS[rasiIndex];
        const lordInfo = data[signLord];
        let lordText = '';
        if (lordInfo) {
            const lordHouse = getHouseNum(lordInfo.longitude, ascLong);
            const lordSign = getSignName(lordInfo.longitude);
            lordText = `The lord of its sign is ${signLord}, who is placed in the ${lordHouse}${getOrdinal(lordHouse)} House (${lordSign}).`;
        }

        // Aspects Logic
        const aspectsReceived = getAspectsOnSign(rasiIndex, allAspects)
            .filter(a => a.planet !== planet);

        const aspectText = aspectsReceived.length > 0
            ? `It receives aspects from: ${aspectsReceived.map(a => `${a.planet} (${a.type})`).join(', ')}.`
            : "It receives no major planetary aspects.";

        return (
            <div className="analysis-item">
                <h4>{planet}</h4>
                <p>
                    <strong>{avastha.state}</strong> {nature.natural} <strong>{planet}</strong> is at <strong>{formatDeg(planetLong % 30)}</strong> in <strong>{sign}</strong>,
                    which is the <strong>{house}{getOrdinal(house)} House</strong>. This is a <strong>{element}</strong> sign.
                    It is currently in the <strong>{purushartha}</strong> house ({houseType}).
                </p>
                <p>
                    The planet is <strong>{dignity.status}</strong> and acts as a <strong>{nature.functional}</strong> for this chart.
                    Its state indicates <strong>{avastha.meaning}</strong>.
                </p>
                <p>
                    {lordText} {aspectText}
                </p>
            </div>
        );
    };

    // Generate House Analysis Text (Generic for Ascendant or Moon)
    const generateHouseText = (houseNum, refLong, labelPrefix) => {
        // Find sign on this house cusp
        const refRasi = Math.floor(refLong / 30);
        const houseRasi = (refRasi + houseNum - 1) % 12;
        const sign = signs[houseRasi];
        const element = elements[houseRasi % 4];
        const purushartha = getPurushartha(houseNum);

        // Find planets in this house
        const planetsInHouse = planets.filter(p => {
            return data[p] && data[p].longitude !== undefined && getHouseNum(data[p].longitude, refLong) === houseNum;
        });

        const planetsText = planetsInHouse.length > 0
            ? `Planets sitting in this house: ${planetsInHouse.map(p => `${p} (${calculateAvastha(data[p].longitude).state})`).join(', ')}.`
            : "No planets are sitting in this house.";

        // Lordship Logic
        const houseLord = SIGN_LORDS[houseRasi];
        const lordInfo = data[houseLord];
        let lordText = '';
        if (lordInfo) {
            const lordHouse = getHouseNum(lordInfo.longitude, refLong); // Lord's house relative to THIS reference
            const lordSign = getSignName(lordInfo.longitude);
            lordText = `The lord of this house is ${houseLord}, placed in the ${lordHouse}${getOrdinal(lordHouse)} House (${lordSign}).`;
        }

        // Aspects Logic
        const aspectsReceived = getAspectsOnSign(houseRasi, allAspects);
        const externalAspects = aspectsReceived.filter(a => a.type !== '1th Aspect' && a.type !== '1st Aspect');

        const aspectText = externalAspects.length > 0
            ? `This house receives aspects from: ${externalAspects.map(a => `${a.planet} (${a.type})`).join(', ')}.`
            : "This house receives no external planetary aspects.";

        let title = `${labelPrefix} ${houseNum}${getOrdinal(houseNum)} House`;
        if (houseNum === 1) {
            title = labelPrefix === 'Moon' ? 'Moon 1st House (Rashi)' : `${labelPrefix} 1st House (Lagna)`;
        }

        return (
            <div className="analysis-item">
                <h4>{title}</h4>
                <p>
                    The {houseNum}{getOrdinal(houseNum)} house is <strong>{sign}</strong> sign ({element} element).
                    It is a <strong>{purushartha}</strong> house.
                </p>
                <p>{planetsText}</p>
                <p>{lordText} {aspectText}</p>
            </div>
        );
    };

    return (
        <div className="detailed-analysis-container">
            <header className="analysis-header">
                <h2>Detailed Vedic Analysis</h2>
                <p>Comprehensive report for <strong>{formData?.name}</strong></p>
            </header>

            <div className="analysis-section">
                <h3 className="section-head">Planetary Details</h3>
                <div className="analysis-grid">
                    {planets.map(planet => (
                        <div key={planet} className="analysis-card">
                            {generatePlanetText(planet)}
                        </div>
                    ))}
                </div>
            </div>

            <div className="analysis-section">
                <h3 className="section-head">House Details (From Ascendant / Lagna)</h3>
                <div className="analysis-grid">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(houseNum => (
                        <div key={houseNum} className="analysis-card">
                            {generateHouseText(houseNum, ascLong, 'Lagna')}
                        </div>
                    ))}
                </div>
            </div>

            <div className="analysis-section">
                <h3 className="section-head">House Details (From Moon / Chandra Lagna)</h3>
                <div className="analysis-grid">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(houseNum => (
                        <div key={houseNum} className="analysis-card">
                            {generateHouseText(houseNum, moonLong, 'Moon')}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DetailedAnalysisView;
