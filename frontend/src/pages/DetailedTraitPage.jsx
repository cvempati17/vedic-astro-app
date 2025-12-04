import { useTranslation } from 'react-i18next';
import TraitAnalysisView from '../components/TraitAnalysisView';
import './DetailedReportPage.css';

const DetailedTraitPage = ({ results, formData, onBack }) => {
    const { t } = useTranslation();
    return (
        <div className="detailed-report-page">
            <button className="back-btn" onClick={onBack}>
                ← {t('detailedReport.backToSummary')}
            </button>

            <main className="report-content">
                <TraitAnalysisView data={results} />
            </main>
        </div>
    );
};

export default DetailedTraitPage;
