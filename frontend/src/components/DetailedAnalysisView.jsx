import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { calculateDignity, getPlanetNature, calculateAvastha } from '../utils/strengthUtils';
import { getHouseType, getPurushartha } from '../utils/houseUtils';
import { calculateAspects, getAspectsOnSign } from '../utils/aspectUtils';
import './DetailedAnalysisView.css';

import DetailedAIReportModal from './DetailedAIReportModal';

const DetailedAnalysisView = ({ data, formData }) => {
    const { t } = useTranslation();
    const [selectedReport, setSelectedReport] = React.useState(null);

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

    // Helper: Get Ordinal (kept for English, but used less in translations)
    const getOrdinal = (n) => {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return s[(v - 20) % 10] || s[v] || s[0];
    };

    const tPlanet = (p) => t(`planets.${p}`, p);
    const tSign = (s) => t(`signs.${s}`, s);
    const tElement = (e) => t(`elements.${e}`, e);
    const tHouseType = (h) => h.split(', ').map(type => t(`houseTypes.${type}`, type)).join(', ');
    const tPurushartha = (p) => t(`purusharthas.${p}`, p);
    const tStatus = (s) => t(`dignity.${s}`, s);
    const tNature = (n) => t(`nature.${n}`, n);
    const tAvastha = (a) => t(`avastha.${a}`, a);

    const handleOpenReport = (type, houseNum, refLong, title) => {
        // Prepare data for AI model
        const refRasi = Math.floor(refLong / 30);
        const houseRasi = (refRasi + houseNum - 1) % 12;
        const signIndex = houseRasi;

        // Find planets in this house
        const planetsInHouse = planets.filter(p => {
            return data[p] && data[p].longitude !== undefined && getHouseNum(data[p].longitude, refLong) === houseNum;
        }).map(p => ({
            name: p,
            data: data[p]
        }));

        setSelectedReport({
            houseNum,
            signIndex,
            planetsInHouse,
            allPlanetsData: data,
            ascendantLong: ascLong,
            title
        });
    };

    // Generate Planet Analysis Text
    const generatePlanetText = (planet) => {
        const info = data[planet];
        if (!info || info.longitude === undefined) return null;

        const planetLong = info.longitude;
        const rasiIndex = Math.floor(planetLong / 30);
        const house = getHouseNum(planetLong, ascLong);
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
            lordText = t('detailedAnalysis.lordOfSign', {
                signLord: tPlanet(signLord),
                lordHouse,
                lordSign: tSign(lordSign),
                ordinal: getOrdinal(lordHouse)
            });
        }

        // Aspects Logic
        const aspectsReceived = getAspectsOnSign(rasiIndex, allAspects)
            .filter(a => a.planet !== planet);

        const aspectText = aspectsReceived.length > 0
            ? t('detailedAnalysis.aspectsReceived', { aspects: aspectsReceived.map(a => `${tPlanet(a.planet)} (${a.type})`).join(', ') })
            : t('detailedAnalysis.noAspects');

        return (
            <div className="analysis-item">
                <h4>{tPlanet(planet)}</h4>
                <p dangerouslySetInnerHTML={{
                    __html: t('detailedAnalysis.planetText', {
                        state: tAvastha(avastha.state),
                        natural: tNature(nature.natural),
                        planet: tPlanet(planet),
                        deg: formatDeg(planetLong % 30),
                        sign: tSign(sign),
                        house,
                        ordinal: getOrdinal(house),
                        element: tElement(element),
                        purushartha: tPurushartha(purushartha),
                        houseType: tHouseType(houseType)
                    })
                }} />
                <p dangerouslySetInnerHTML={{
                    __html: t('detailedAnalysis.planetStatus', {
                        status: tStatus(dignity.status),
                        functional: tNature(nature.functional),
                        meaning: avastha.meaning // This is a long string, might need its own translation or just leave as is for now
                    })
                }} />
                <p>
                    {lordText} {aspectText}
                </p>
                {/* AI Report Link */}
                <button
                    style={{
                        marginTop: '10px', padding: '6px 12px', border: '1px solid #3b82f6',
                        color: '#3b82f6', background: 'white', borderRadius: '4px', cursor: 'pointer',
                        fontSize: '0.9rem'
                    }}
                    onClick={() => handleOpenReport('planet', house, ascLong, tPlanet(planet))}
                >
                    ✨ View Detailed AI Insight
                </button>
            </div>
        );
    };

    // Generate House Analysis Text
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
            ? t('detailedAnalysis.planetsInHouse', { planets: planetsInHouse.map(p => `${tPlanet(p)} (${tAvastha(calculateAvastha(data[p].longitude).state)})`).join(', ') })
            : t('detailedAnalysis.noPlanetsInHouse');

        // Lordship Logic
        const houseLord = SIGN_LORDS[houseRasi];
        const lordInfo = data[houseLord];
        let lordText = '';
        if (lordInfo) {
            const lordHouse = getHouseNum(lordInfo.longitude, refLong);
            const lordSign = getSignName(lordInfo.longitude);
            lordText = t('detailedAnalysis.lordOfHouse', {
                houseLord: tPlanet(houseLord),
                lordHouse,
                lordSign: tSign(lordSign),
                ordinal: getOrdinal(lordHouse)
            });
        }

        // Aspects Logic
        const aspectsReceived = getAspectsOnSign(houseRasi, allAspects);
        const externalAspects = aspectsReceived.filter(a => a.type !== '1th Aspect' && a.type !== '1st Aspect');

        const aspectText = externalAspects.length > 0
            ? t('detailedAnalysis.houseAspects', { aspects: externalAspects.map(a => `${tPlanet(a.planet)} (${a.type})`).join(', ') })
            : t('detailedAnalysis.noHouseAspects');

        let title = t('detailedAnalysis.houseTitle', { prefix: labelPrefix === 'Lagna' ? t('detailedAnalysis.lagna') : t('detailedAnalysis.moon'), house: houseNum, ordinal: getOrdinal(houseNum) });
        if (houseNum === 1) {
            title = labelPrefix === 'Moon' ? t('detailedAnalysis.moonFirstHouse') : t('detailedAnalysis.lagnaFirstHouse');
        }

        return (
            <div className="analysis-item">
                <h4>{title}</h4>
                <p dangerouslySetInnerHTML={{
                    __html: t('detailedAnalysis.houseDesc', {
                        house: houseNum,
                        ordinal: getOrdinal(houseNum),
                        sign: tSign(sign),
                        element: tElement(element),
                        purushartha: tPurushartha(purushartha)
                    })
                }} />
                <p>{planetsText}</p>
                <p>{lordText} {aspectText}</p>
                {/* AI Report Link */}
                <button
                    style={{
                        marginTop: '10px', padding: '6px 12px', border: '1px solid #8b5cf6',
                        color: '#8b5cf6', background: 'white', borderRadius: '4px', cursor: 'pointer',
                        fontSize: '0.9rem'
                    }}
                    onClick={() => handleOpenReport('house', houseNum, refLong, title)}
                >
                    ✨ View Detailed AI Insight
                </button>
            </div>
        );
    };

    return (
        <div className="detailed-analysis-container">
            <header className="analysis-header">
                <h2>{t('detailedAnalysis.title', 'Detailed Vedic Analysis')}</h2>
                <p>{t('detailedAnalysis.reportFor', 'Comprehensive report for')} <strong>{formData?.name}</strong></p>
            </header>

            <div className="analysis-section">
                <h3 className="section-head">{t('detailedAnalysis.planetaryDetails', 'Planetary Details')}</h3>
                <div className="analysis-grid">
                    {planets.map(planet => (
                        <div key={planet} className="analysis-card">
                            {generatePlanetText(planet)}
                        </div>
                    ))}
                </div>
            </div>

            <div className="analysis-section">
                <h3 className="section-head">{t('detailedAnalysis.houseDetailsLagna', 'House Details (From Ascendant / Lagna)')}</h3>
                <div className="analysis-grid">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(houseNum => (
                        <div key={houseNum} className="analysis-card">
                            {generateHouseText(houseNum, ascLong, 'Lagna')}
                        </div>
                    ))}
                </div>
            </div>

            <div className="analysis-section">
                <h3 className="section-head">{t('detailedAnalysis.houseDetailsMoon', 'House Details (From Moon / Chandra Lagna)')}</h3>
                <div className="analysis-grid">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(houseNum => (
                        <div key={houseNum} className="analysis-card">
                            {generateHouseText(houseNum, moonLong, 'Moon')}
                        </div>
                    ))}
                </div>
            </div>

            {selectedReport && (
                <DetailedAIReportModal
                    houseNum={selectedReport.houseNum}
                    signIndex={selectedReport.signIndex}
                    planetsInHouse={selectedReport.planetsInHouse}
                    allPlanetsData={selectedReport.allPlanetsData}
                    ascendantLong={selectedReport.ascendantLong}
                    onClose={() => setSelectedReport(null)}
                />
            )}
        </div>
    );
};

export default DetailedAnalysisView;

