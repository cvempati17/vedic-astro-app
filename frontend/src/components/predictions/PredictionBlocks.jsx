import React from 'react';

// Common Styles
const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    marginBottom: '24px',
    border: '1px solid #f1f5f9'
};

const sectionTitleStyle = {
    fontSize: '0.875rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#64748b',
    fontWeight: '600',
    marginBottom: '16px'
};

// --- Block 1: Hero ---
export const AstrologyHero = ({ data }) => (
    <div style={{
        background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
        padding: '60px 20px',
        textAlign: 'center',
        borderRadius: '0 0 24px 24px',
        marginBottom: '40px',
        borderBottom: '1px solid #fcd34d'
    }}>
        <h1 style={{ fontFamily: 'Georgia, serif', color: '#92400e', fontSize: '2.5rem', marginBottom: '12px' }}>
            {data.title}
        </h1>
        <div style={{ fontFamily: '"Inter", sans-serif', color: '#b45309', fontSize: '1.1rem', letterSpacing: '0.5px' }}>
            {data.subtitle}
        </div>
    </div>
);

// --- Block 2: House Overview ---
export const HouseOverviewCard = ({ data }) => (
    <div style={cardStyle}>
        <div style={sectionTitleStyle}>House Overview</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <InfoItem label="House" value={data.house} />
            <InfoItem label="Kendra" value={data.kendra} />
            <InfoItem label="Trikona" value={data.trikona} />
            <InfoItem label="Purushartha" value={data.purushartha} />
        </div>
    </div>
);

const InfoItem = ({ label, value }) => (
    <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
        <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '4px' }}>{label}</div>
        <div style={{ color: '#334155', fontWeight: '600' }}>{value}</div>
    </div>
);

// --- Block 3: Rashi Details ---
export const RashiDetailsBlock = ({ data }) => (
    <div style={{ ...cardStyle, background: '#fdfbf7', borderLeft: '4px solid #d97706' }}>
        <div style={sectionTitleStyle}>Rashi (Sign) Nature</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, color: '#78350f', fontSize: '1.5rem' }}>{data.sign}</h3>
            <span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                {data.element}
            </span>
        </div>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <Badge label={data.nature} />
            <Badge label={data.qualities} />
        </div>
        <p style={{ color: '#4b5563', lineHeight: '1.6', fontStyle: 'italic' }}>
            "{data.impact}"
        </p>
    </div>
);

const Badge = ({ label }) => (
    <span style={{ border: '1px solid #e5e7eb', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', color: '#4b5563' }}>
        {label}
    </span>
);

// --- Block 4: Bhava Significations ---
export const BhavaSignifications = ({ data }) => (
    <div style={cardStyle}>
        <div style={sectionTitleStyle}>Key Themes (Bhava)</div>
        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {data.map((item, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'center', color: '#334155' }}>
                    <span style={{ color: '#3b82f6', change: 'marginRight: 8px' }}>•</span> {item}
                </li>
            ))}
        </ul>
    </div>
);

// --- Block 5: Planet Placement ---
export const PlanetPlacementCard = ({ data }) => (
    <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, color: '#1e293b' }}>{data.planet}</h3>
            <div style={{ textAlign: 'right' }}>
                <span style={{ display: 'block', fontSize: '0.9rem', color: '#64748b' }}>{data.degree}</span>
                <span style={{ fontSize: '0.8rem', fontWeight: '600', color: data.nature.includes('Benefic') ? '#166534' : '#991b1b' }}>
                    {data.nature}
                </span>
            </div>
        </div>
        <div style={{ marginBottom: '12px' }}>
            <span style={{ backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', color: '#475569' }}>
                Avastha: {data.avastha}
            </span>
        </div>
        <p style={{ color: '#475569', lineHeight: '1.6' }}>{data.interpretation}</p>
    </div>
);

// --- Block 6: Conjunction Analysis ---
export const ConjunctionAnalysis = ({ data }) => (
    <div style={{ ...cardStyle, borderLeft: '4px solid #8b5cf6' }}>
        <div style={sectionTitleStyle}>Conjunction</div>
        <h3 style={{ color: '#4c1d95', marginTop: 0 }}>{data.pair}</h3>
        <div style={{ color: '#6d28d9', fontSize: '0.9rem', marginBottom: '16px' }}>{data.nature}</div>
        <div style={{ backgroundColor: '#f5f3ff', padding: '16px', borderRadius: '8px' }}>
            <strong style={{ display: 'block', marginBottom: '8px', color: '#5b21b6' }}>Key Results:</strong>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#4c1d95' }}>
                {data.results.map((res, i) => <li key={i}>{res}</li>)}
            </ul>
        </div>
    </div>
);

// --- Block 7: Aspect Influence ---
export const AspectInfluence = ({ data }) => (
    <div style={{ ...cardStyle, border: '1px solid #fed7aa' }}>
        <div style={{ ...sectionTitleStyle, color: '#c2410c' }}>Aspect Influence</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <strong>{data.planet}</strong>
            <span style={{ color: '#9a3412' }}>{data.type}</span>
        </div>
        <p style={{ color: '#475569' }}>{data.impact}</p>
    </div>
);

// --- Block 8: Balance Table ---
export const BeneficMaleficBalance = ({ data }) => (
    <div style={cardStyle}>
        <div style={sectionTitleStyle}>Planetary Balance</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <StatCard label="Benefic Influence" value={data.beneficScore} color="#166534" bg="#dcfce7" />
            <StatCard label="Malefic Influence" value={data.maleficScore} color="#991b1b" bg="#fee2e2" />
            <StatCard label="Stability" value={data.stability} color="#1e40af" bg="#dbeafe" />
            <StatCard label="Protection" value={data.protection} color="#854d0e" bg="#fef9c3" />
        </div>
    </div>
);

const StatCard = ({ label, value, color, bg }) => (
    <div style={{ backgroundColor: bg, padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
        <div style={{ fontSize: '0.8rem', color: color, opacity: 0.8 }}>{label}</div>
        <div style={{ fontWeight: 'bold', color: color, fontSize: '1.1rem' }}>{value}</div>
    </div>
);

// --- Block 9: Yoga Strength ---
export const YogaStrength = ({ data }) => (
    <div style={{ ...cardStyle, background: '#fafafa', border: '2px solid #fbbf24' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <div style={sectionTitleStyle}>Yoga Strength</div>
                <h3 style={{ margin: 0, color: '#111827' }}>{data.name}</h3>
            </div>
            <div style={{ backgroundColor: '#fbbf24', color: '#fff', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>
                {data.score}
            </div>
        </div>
        <div style={{ marginTop: '16px' }}>
            {data.reasons.map((reason, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: '4px', color: '#4b5563' }}>
                    <span style={{ color: '#f59e0b', marginRight: '8px' }}>✓</span> {reason}
                </div>
            ))}
        </div>
    </div>
);

// --- Block 10: Predictive Summary ---
export const PredictiveSummary = ({ data }) => (
    <div style={{ ...cardStyle, backgroundColor: '#f0fdf4', border: 'none' }}>
        <div style={{ ...sectionTitleStyle, color: '#166534' }}>Final Prediction</div>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#14532d', fontSize: '1.05rem', lineHeight: '1.8' }}>
            {data.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
    </div>
);

// --- Block 11: Quote ---
export const AstrologyQuote = ({ quote }) => (
    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b', fontStyle: 'italic', maxWidth: '600px', margin: '0 auto' }}>
        <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', marginBottom: '24px' }} />
        "{quote}"
        <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', marginTop: '24px' }} />
    </div>
);
