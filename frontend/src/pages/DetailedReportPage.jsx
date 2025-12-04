import React from 'react';
import { useTranslation } from 'react-i18next';
import TraitAnalysisView from '../components/TraitAnalysisView';
import DetailedAnalysisView from '../components/DetailedAnalysisView';
import './DetailedReportPage.css';

const DetailedReportPage = ({ results, formData, onBack }) => {
    const { t } = useTranslation();
    return (
        <div className="detailed-report-page">
            <header className="report-page-header">
                <button className="back-btn" onClick={onBack}>
                    ← {t('detailedReport.backToSummary', 'Back to Summary')}
                </button>
                <h1>{t('detailedReport.title', 'Detailed Analysis Report')}</h1>
            </header>

            <main className="report-content">
                <TraitAnalysisView data={results} />
                <DetailedAnalysisView data={results} formData={formData} />
            </main>
        </div>
    );
};

export default DetailedReportPage;
