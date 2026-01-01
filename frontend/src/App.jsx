import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ResultsPage from './pages/ResultsPage';
import SavedChartsPage from './pages/SavedChartsPage';
import DetailedReportPage from './pages/DetailedReportPage';
import DetailedTraitPage from './pages/DetailedTraitPage';
import DetailedVedicPage from './pages/DetailedVedicPage';
import AdvancedTraitPage from './pages/AdvancedTraitPage';
import MatchMakingPage from './pages/MatchMakingPage';
import ConventionalMatchMakingPage from './pages/ConventionalMatchMakingPage';
import NamakaranPage from './pages/NamakaranPage';
import SettingsPage from './pages/SettingsPage';
import BirthTimeRectificationPage from './pages/BirthTimeRectificationPage';
import BirthTimeRectificationNewPage from './pages/BirthTimeRectificationNewPage';
import PlanetaryChangesImpactPage from './pages/PlanetaryChangesImpactPage';
import Disclaimer from './components/Disclaimer';
import BalasInfoPage from './pages/BalasInfoPage';
import MandiInfoPage from './pages/MandiInfoPage';
import ForeignTravelNewPage from './pages/ForeignTravelNewPage';
import JobBusinessNewPage from './pages/JobBusinessNewPage';
import BusinessPartnershipInputPage from './pages/BusinessPartnershipInputPage';
import BusinessPartnershipV6Page from './pages/BusinessPartnershipV6Page';
import AstrogravityTestPage from './pages/AstrogravityTestPage';
import GeminiTestPage from './pages/GeminiTestPage';
import PalmistryPage from './pages/PalmistryPage';
import FamilyOSPage from './pages/FamilyOSPage';
import MuhuratPage from './pages/MuhuratPage';
import TithiPage from './pages/TithiPage';
import FamilyVisionPage from './pages/FamilyVisionPage';
import SnapshotPage from './pages/SnapshotPage';
import ErrorBoundary from './components/ErrorBoundary';
import './ThemeToggle.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [results, setResults] = useState(null);
  const [formData, setFormData] = useState(null);
  const [theme, setTheme] = useState('light');
  const [userType, setUserType] = useState(() => {
    if (typeof window === 'undefined') return 'basic';
    return localStorage.getItem('userType') || 'basic';
  });
  const [editingChart, setEditingChart] = useState(null);
  const [resultsInitialTab, setResultsInitialTab] = useState('charts');
  const [resultsReturnPage, setResultsReturnPage] = useState('saved-charts');
  const [settingsReturnPage, setSettingsReturnPage] = useState('saved-charts');
  const [btrNewPageState, setBtrNewPageState] = useState(null);

  // ValueStream Widget Integration
  React.useEffect(() => {
    const scriptId = 'valuestream-widget-script';

    // Cleanup function helper
    const removeScript = () => {
      const existing = document.getElementById(scriptId);
      if (existing) {
        existing.remove();
      }
    };

    // Exclude Logic: "Except Homa ('home') and login page"
    if (currentPage === 'login' || currentPage === 'home') {
      removeScript();
      return;
    }

    // Determine User ID
    const userId = user?.name || user?.email || 'Guest';

    // Re-mount script to update attributes (Page & User)
    removeScript();

    console.log(`Mounting ValueStream Widget for ${currentPage} as ${userId}`);
    const script = document.createElement('script');
    script.id = scriptId;
    // Add timestamp to bypass cache and avoid potential redirect loops
    script.src = `https://speak.valuestream.in/widget/widget_modern.js?v=${Date.now()}`;
    script.setAttribute('data-project', 'vedic-astro-app.vercel.app');
    script.setAttribute('data-page', currentPage);
    script.setAttribute('data-user-id', userId);
    script.setAttribute('data-api-url', 'https://speak.valuestream.in');
    script.async = true;

    document.head.appendChild(script);

    return () => {
      // Optional: clean up on unmount, but mostly handled by the re-mount logic above
      // We don't want to remove it blindly on every effect run if we are just updating, 
      // but here we ARE removing and re-adding.
    };
  }, [currentPage, user]);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    // Land on Your Charts (Saved Charts) after login
    setCurrentPage('saved-charts');
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setCurrentPage('login');
    localStorage.removeItem('token'); // Ensure token is cleared
    // keep userType so mode preference persists across sessions
  };

  const handleUserTypeChange = (nextType) => {
    setUserType(nextType);
    if (typeof window !== 'undefined') {
      localStorage.setItem('userType', nextType);
    }
  };

  const handleCalculate = async (data, shouldSave = false, returnPage = 'saved-charts') => {
    try {
      setResultsReturnPage(returnPage);
      const response = await fetch(`${API_URL}/api/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (responseData.success) {
        setResults(responseData.data);
        setFormData(data);
        setCurrentPage('results');

        if (shouldSave) {
          if (isAuthenticated) {
            // Save to Backend
            try {
              const token = localStorage.getItem('token');
              const saveResponse = await fetch(`${API_URL}/api/charts`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                  name: data.name,
                  dateOfBirth: data.date,
                  timeOfBirth: data.time,
                  placeOfBirth: {
                    city: data.city,
                    lat: data.latitude,
                    lng: data.longitude,
                    timezone: data.timezone
                  },
                  chartData: responseData.data
                })
              });

              if (!saveResponse.ok) {
                const errorData = await saveResponse.json();
                console.error('Failed to save chart to backend:', errorData);
                alert(`Save Failed: ${errorData.error || saveResponse.statusText}`);
                // Fallback to local? Or just error? Let's fallback for safety.
                saveLocally(data, responseData.data);
              } else {
                // Optionally refresh saved charts list if we were on that page, but we are going to results page.
                // We might want to show a success toast.
              }
            } catch (saveErr) {
              console.error('Error saving to backend:', saveErr);
              alert(`Save Error (Network/Server): ${saveErr.message}`);
              saveLocally(data, responseData.data);
            }
          } else {
            // Save Locally (Guest Mode)
            saveLocally(data, responseData.data);
          }
        }
      } else {
        alert(t('errors.generic', { error: responseData.error }));
      }
    } catch (err) {
      alert(t('errors.network'));
    }
  };

  const saveLocally = (data, chartData) => {
    const localCharts = JSON.parse(localStorage.getItem('savedCharts') || '[]');
    const newChart = {
      _id: Date.now().toString(),
      isLocal: true,
      name: data.name,
      gender: data.gender,
      dateOfBirth: data.date,
      timeOfBirth: data.time,
      placeOfBirth: {
        city: data.city,
        lat: data.latitude,
        lng: data.longitude,
        timezone: data.timezone
      },
      ayanamsa: data.ayanamsa || 'lahiri',
      chartData: chartData,
      createdAt: new Date().toISOString()
    };
    localCharts.push(newChart);
    localStorage.setItem('savedCharts', JSON.stringify(localCharts));
  };

  const handleLoadChart = (chartData, chartFormData) => {
    setResults(chartData);
    setFormData(chartFormData);
    setResultsInitialTab('charts');
    setResultsReturnPage('saved-charts');
    setCurrentPage('results');
  };

  const handleOpenSnapshot = (chartData, chartFormData) => {
    setResults(chartData);
    setFormData(chartFormData);
    setCurrentPage('snapshot');
  };

  const handleEditChart = (chartFormData) => {
    setEditingChart(chartFormData);
    setCurrentPage('home');
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.body.className = next === 'dark' ? 'dark-theme' : 'light-theme';
  };

  return (
    <div className={`app-container ${theme}-theme`}>
      <div className="content-wrapper">
        {isAuthenticated && (
          <div className="theme-toggle-btn" onClick={toggleTheme}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </div>
        )}

        {currentPage === 'login' && (
          <ErrorBoundary>
            <LoginPage onLogin={handleLogin} />
          </ErrorBoundary>
        )}

        {currentPage === 'home' && isAuthenticated && (
          <HomePage
            onCalculate={handleCalculate}
            initialData={editingChart}
            onBack={() => setCurrentPage('saved-charts')}
            onOpenSettings={() => { setSettingsReturnPage('saved-charts'); setCurrentPage('settings'); }}
          />
        )}

        {currentPage === 'saved-charts' && (
          <SavedChartsPage
            onBack={handleBackToHome}
            onLoadChart={handleLoadChart}
            onEditChart={handleEditChart}
            onOpenMatchNew={() => setCurrentPage('match-making')}
            onOpenMatchTraditional={() => setCurrentPage('match-making-traditional')}
            onOpenNamakaran={() => setCurrentPage('namakaran')}
            onOpenBTR={() => setCurrentPage('birth-time-rectification')}
            onOpenBTRNew={() => setCurrentPage('birth-time-rectification-new')}
            onOpenForeignTravelNew={() => setCurrentPage('foreign-travel-new')}
            onOpenJobBusinessNew={() => setCurrentPage('job-vs-business-new')}
            onOpenBusinessPartnershipInput={() => setCurrentPage('business-partnership-input')}
            onOpenBusinessPartnershipV6={() => setCurrentPage('business-partnership-v6')}
            onOpenAstrogravityTest={() => setCurrentPage('astrogravity-test')}
            onOpenGeminiTest={() => setCurrentPage('gemini-test')}
            onOpenPalmistry={() => setCurrentPage('palmistry')}
            onOpenFamilyOS={() => setCurrentPage('family-os')}
            onOpenFamilyVision={() => setCurrentPage('family-vision')}
            onOpenMuhurat={() => setCurrentPage('muhurat')}
            onOpenTithi={() => setCurrentPage('tithi')}
            onOpenPlanetaryChangesImpact={() => setCurrentPage('planetary-changes-impact')}

            onOpenSettings={() => { setSettingsReturnPage('saved-charts'); setCurrentPage('settings'); }}
            onOpenSnapshot={handleOpenSnapshot}
            onLogout={handleLogout}
            userType={userType}
          />
        )}

        {currentPage === 'snapshot' && (
          <SnapshotPage
            results={results}
            formData={formData}
            onBack={() => setCurrentPage('saved-charts')}
          />
        )}

        {currentPage === 'results' && (
          <ResultsPage
            results={results}
            formData={formData}
            onBack={() => setCurrentPage(resultsReturnPage || 'saved-charts')}
            onOpenTraitReport={() => setCurrentPage('detailed-trait')}
            onOpenVedicReport={() => setCurrentPage('detailed-vedic')}
            onOpenAdvancedTrait={() => setCurrentPage('advanced-trait')}
            onOpenSavedCharts={() => setCurrentPage('saved-charts')}
            onOpenMatchNew={() => setCurrentPage('match-making')}
            onOpenMatchTraditional={() => setCurrentPage('match-making-traditional')}
            onOpenBalasInfo={() => setCurrentPage('balas-info')}
            onOpenMandiInfo={() => { setResultsInitialTab('mandi'); setCurrentPage('mandi-info'); }}
            initialActiveTab={resultsInitialTab}
            onLogout={handleLogout}
            onOpenSettings={() => { setSettingsReturnPage('results'); setCurrentPage('settings'); }}
            userType={userType}
          />
        )}

        {currentPage === 'detailed-report' && (
          <DetailedReportPage
            results={results}
            formData={formData}
            onBack={() => setCurrentPage('results')}
          />
        )}

        {currentPage === 'detailed-trait' && (
          <DetailedTraitPage
            results={results}
            formData={formData}
            onBack={() => setCurrentPage('results')}
          />
        )}

        {currentPage === 'detailed-vedic' && (
          <DetailedVedicPage
            results={results}
            formData={formData}
            onBack={() => setCurrentPage('results')}
          />
        )}

        {currentPage === 'advanced-trait' && (
          <AdvancedTraitPage
            results={results}
            formData={formData}
            onBack={() => setCurrentPage('results')}
          />
        )}

        {currentPage === 'match-making' && (
          <MatchMakingPage
            onBack={() => setCurrentPage('saved-charts')}
          />
        )}

        {currentPage === 'match-making-traditional' && (
          <ConventionalMatchMakingPage
            onBack={() => setCurrentPage('saved-charts')}
          />
        )}

        {currentPage === 'namakaran' && (
          <NamakaranPage
            onBack={() => setCurrentPage('saved-charts')}
          />
        )}

        {currentPage === 'birth-time-rectification' && (
          <BirthTimeRectificationPage
            onBack={() => setCurrentPage('saved-charts')}
          />
        )}

        {currentPage === 'birth-time-rectification-new' && (
          <BirthTimeRectificationNewPage
            onBack={() => setCurrentPage('saved-charts')}
            onCalculate={handleCalculate}
            initialState={btrNewPageState}
            onStateChange={setBtrNewPageState}
          />
        )}

        {currentPage === 'planetary-changes-impact' && (
          <PlanetaryChangesImpactPage
            onBack={() => setCurrentPage('saved-charts')}
          />
        )}

        {currentPage === 'foreign-travel-new' && (
          <ForeignTravelNewPage
            onBack={() => setCurrentPage('saved-charts')}
          />
        )}

        {currentPage === 'job-vs-business-new' && (
          <JobBusinessNewPage
            onBack={() => setCurrentPage('saved-charts')}
          />
        )}

        {currentPage === 'business-partnership-input' && (
          <BusinessPartnershipInputPage
            onBack={() => setCurrentPage('saved-charts')}
          />
        )}

        {currentPage === 'business-partnership-v6' && (
          <BusinessPartnershipV6Page
            onBack={() => setCurrentPage('saved-charts')}
          />
        )}

        {currentPage === 'astrogravity-test' && (
          <AstrogravityTestPage
            onBack={() => setCurrentPage('saved-charts')}
          />
        )}

        {currentPage === 'gemini-test' && (
          <GeminiTestPage
            onBack={() => setCurrentPage('saved-charts')}
          />
        )}

        {currentPage === 'palmistry' && (
          <ErrorBoundary>
            <PalmistryPage
              onBack={() => setCurrentPage('saved-charts')}
            />
          </ErrorBoundary>
        )}

        {currentPage === 'family-os' && (
          <ErrorBoundary>
            <FamilyOSPage
              onBack={() => setCurrentPage('saved-charts')}
            />
          </ErrorBoundary>
        )}

        {currentPage === 'muhurat' && (
          <ErrorBoundary>
            <MuhuratPage
              onBack={() => setCurrentPage('saved-charts')}
            />
          </ErrorBoundary>
        )}

        {currentPage === 'tithi' && (
          <ErrorBoundary>
            <TithiPage
              onBack={() => setCurrentPage('saved-charts')}
            />
          </ErrorBoundary>
        )}

        {currentPage === 'family-vision' && (
          <ErrorBoundary>
            <FamilyVisionPage
              onBack={() => setCurrentPage('saved-charts')}
            />
          </ErrorBoundary>
        )}

        {currentPage === 'balas-info' && (
          <BalasInfoPage
            onBack={() => setCurrentPage('results')}
          />
        )}

        {currentPage === 'mandi-info' && (
          <MandiInfoPage
            onBack={() => setCurrentPage('results')}
          />
        )}

        {currentPage === 'settings' && (
          <SettingsPage
            onBack={() => setCurrentPage(settingsReturnPage || 'saved-charts')}
            onLogout={handleLogout}
            userType={userType}
            onUserTypeChange={handleUserTypeChange}
          />
        )}

      </div>
      {currentPage !== 'snapshot' && <Disclaimer />}
    </div>
  );
}

export default App;
