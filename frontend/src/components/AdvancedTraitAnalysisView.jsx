import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { calculateAdvancedTraitsCsv } from '../utils/traitUtils';
import './DetailedAnalysisView.css';

const AdvancedTraitAnalysisView = ({ data, formData }) => {
    const { t } = useTranslation();
    const advancedCsv = useMemo(() => calculateAdvancedTraitsCsv(data, t), [data, t]);

    if (!advancedCsv) return null;

    const flatTraits = advancedCsv.categories.flatMap((cat) =>
        (cat.traits || []).map((trait) => ({
            ...trait,
            category: cat.title,
        }))
    );

    return (
        <div className="detailed-analysis-container">
            <header className="analysis-header">
                <h2>{t('advancedTraits.title')}</h2>
                <p>
                    {t('advancedTraits.subtitle', { name: formData?.name })}
                </p>
            </header>

            {advancedCsv.categories.map((cat) => (
                <div key={cat.id} className="analysis-section">
                    <h3 className="section-head">{cat.title}</h3>
                    {cat.traits.map((trait) => {
                        const subtotal = (trait.breakdown || []).reduce(
                            (sum, row) => sum + (row.points || 0),
                            0
                        );

                        return (
                            <div
                                key={trait.id}
                                className="analysis-card"
                                style={{ overflowX: 'auto', marginBottom: '1rem' }}
                            >
                                <div className="analysis-item">
                                    <h4>
                                        {trait.name}
                                        <span
                                            style={{
                                                marginLeft: '0.5rem',
                                                fontSize: '0.85rem',
                                                color: '#6b7280',
                                            }}
                                        >
                                            {trait.score}/10
                                        </span>
                                    </h4>
                                    <p>{trait.description}</p>
                                    <table
                                        className="results-table"
                                        style={{ marginTop: '0.5rem' }}
                                    >
                                        <thead>
                                            <tr>
                                                <th style={{ textAlign: 'left' }}>
                                                    {t('advancedTraits.houseAndPlanets')}
                                                </th>
                                                <th style={{ textAlign: 'left' }}>{t('advancedTraits.status')}</th>
                                                <th style={{ textAlign: 'center' }}>{t('advancedTraits.points')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(trait.breakdown || []).map((row, idx) => {
                                                const tooltip =
                                                    row.allStatuses &&
                                                        row.allStatuses.length > 0
                                                        ? row.allStatuses.join(' | ')
                                                        : undefined;
                                                return (
                                                    <tr key={idx}>
                                                        <td title={tooltip}>{row.factor}</td>
                                                        <td title={tooltip}>{row.status}</td>
                                                        <td style={{ textAlign: 'center' }}>
                                                            {row.points}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            <tr>
                                                <td>
                                                    <strong>
                                                        {subtotal > 10
                                                            ? t('advancedTraits.totalClamped')
                                                            : t('advancedTraits.total')}
                                                    </strong>
                                                </td>
                                                <td></td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <strong>
                                                        {subtotal > 10 ? 10 : subtotal}
                                                    </strong>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ))}

            <div className="analysis-section">
                <h3 className="section-head">{t('advancedTraits.summaryTitle')}</h3>
                <p
                    style={{
                        fontSize: '0.85rem',
                        color: '#6b7280',
                        marginBottom: '0.5rem',
                    }}
                >
                    {t('advancedTraits.summaryDesc')}
                </p>
                <div className="analysis-card" style={{ overflowX: 'auto' }}>
                    <table className="results-table">
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'left' }}>{t('advancedTraits.category')}</th>
                                <th style={{ textAlign: 'left' }}>{t('advancedTraits.trait')}</th>
                                <th style={{ textAlign: 'center' }}>{t('advancedTraits.score')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {flatTraits.map((trait) => (
                                <tr key={`${trait.category}-${trait.id}`}>
                                    <td>{trait.category}</td>
                                    <td>{trait.name}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        {trait.score}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdvancedTraitAnalysisView;