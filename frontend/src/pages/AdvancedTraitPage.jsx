import { useTranslation } from 'react-i18next';
import AdvancedTraitAnalysisView from '../components/AdvancedTraitAnalysisView';
import './DetailedReportPage.css';

const AdvancedTraitPage = ({ results, formData, onBack }) => {
    const { t } = useTranslation();
    return (
        <div className="detailed-report-page">
            <button className="back-btn" onClick={onBack}>
                ← {t('detailedReport.backToSummary')}
            </button>

            <main className="report-content">
                <AdvancedTraitAnalysisView data={results} formData={formData} />
            </main>
        </div>
    );
};

export default AdvancedTraitPage;
