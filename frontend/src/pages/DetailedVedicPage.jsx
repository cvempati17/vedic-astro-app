import { useTranslation } from 'react-i18next';
import DetailedAnalysisView from '../components/DetailedAnalysisView';
import './DetailedReportPage.css';

const DetailedVedicPage = ({ results, formData, onBack }) => {
    const { t } = useTranslation();
    return (
        <div className="detailed-report-page">
            <button className="back-btn" onClick={onBack}>
                ← {t('detailedReport.backToSummary')}
            </button>

            <main className="report-content">
                <DetailedAnalysisView data={results} formData={formData} />
            </main>
        </div>
    );
};

export default DetailedVedicPage;
