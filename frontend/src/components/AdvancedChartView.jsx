import React from 'react';
import AdvancedChartBox from './AdvancedChartBox';
import HousePredictionReport from './HousePredictionReport';

const AdvancedChartView = ({ results, formData }) => {

    if (!results) return <div>No data available</div>;

    const ascendantLong = results.Ascendant?.longitude || 0;
    const moonLong = results.Moon?.longitude || 0;
    const sunLong = results.Sun?.longitude || 0;

    // Process planets into Sign buckets
    const planetsBySign = Array(12).fill(null).map(() => []);
    const PLANET_NAMES = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

    PLANET_NAMES.forEach(p => {
        const pData = results[p];
        if (pData) {
            const signIndex = Math.floor(pData.longitude / 30);
            planetsBySign[signIndex].push({ name: p, data: pData });
        }
    });

    // Determine the sign index for each grid cell
    // Grid 4x4.
    // Row 0: 11(Pisces), 0(Aries), 1(Taurus), 2(Gemini)
    // Row 1: 10(Aqua), null, null, 3(Cancer)
    // Row 2: 9(Capri), null, null, 4(Leo)
    // Row 3: 8(Sagit), 7(Scorpio), 6(Libra), 5(Virgo)

    const gridMap = [
        [11, 0, 1, 2],
        [10, null, null, 3],
        [9, null, null, 4],
        [8, 7, 6, 5]
    ];

    const [reportData, setReportData] = React.useState(null);

    const handleBoxClick = (signIndex) => {
        const ascSign = Math.floor(ascendantLong / 30);
        const houseNum = ((signIndex - ascSign + 12) % 12) + 1;
        setReportData({
            houseNum,
            signIndex,
            planetsInHouse: planetsBySign[signIndex],
            allPlanetsData: results,
            ascendantLong
        });
    };

    return (
        <div className="advanced-chart-container" style={{ padding: '10px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#e2e8f0' }}>Advanced Detailed Chart (Abhinav Style)</h2>

            <div className="advanced-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gridTemplateRows: 'repeat(4, 1fr)',
                aspectRatio: '1/1',
                gap: '4px',
                width: '100%',
                margin: '0 auto',
                maxWidth: '1100px'
            }}>
                {gridMap.flat().map((signIndex, idx) => {
                    if (signIndex === null) {
                        // Render empty center cells once, or just empty divs
                        return <div key={`empty-${idx}`} style={{ backgroundColor: 'transparent' }} />;
                    }

                    return (
                        <AdvancedChartBox
                            key={signIndex}
                            signIndex={signIndex}
                            ascendantLong={ascendantLong}
                            moonLong={moonLong}
                            sunLong={sunLong}
                            planetsInSign={planetsBySign[signIndex]}
                            allPlanets={results}
                            onClick={() => handleBoxClick(signIndex)}
                        />
                    );
                })}
            </div>

            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '10px', color: '#000000', fontWeight: 'bold' }}>Legend</h3>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '0.9rem', color: '#000000', fontWeight: 'bold' }}>
                    <span>(B) = Bala/Infant</span>
                    <span>(K) = Kumara/Youth</span>
                    <span>(Y) = Yuva/Adult</span>
                    <span>(V) = Vriddha/Old</span>
                    <span>(M) = Mrita/Dead</span>
                    <span style={{ color: '#dc2626', fontWeight: 'bold' }}>(C) = Combust</span>
                    <span><span style={{ color: '#16a34a', fontWeight: 'bold' }}>(B)</span> = Func. Benefic</span>
                    <span><span style={{ color: '#dc2626', fontWeight: 'bold' }}>(M)</span> = Func. Malefic</span>
                </div>
            </div>

            {reportData && (
                <HousePredictionReport
                    houseNum={reportData.houseNum}
                    signIndex={reportData.signIndex}
                    planetsInHouse={reportData.planetsInHouse}
                    allPlanetsData={reportData.allPlanetsData}
                    ascendantLong={reportData.ascendantLong}
                    onClose={() => setReportData(null)}
                />
            )}
        </div>
    );
};

export default AdvancedChartView;
