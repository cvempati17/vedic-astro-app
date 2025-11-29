import React, { useState } from 'react';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ResultsPage from './pages/ResultsPage';
import SavedChartsPage from './pages/SavedChartsPage';
import DetailedReportPage from './pages/DetailedReportPage';
import MatchMakingPage from './pages/MatchMakingPage';
import './ThemeToggle.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [results, setResults] = useState(null);
  const [formData, setFormData] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [editingChart, setEditingChart] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setCurrentPage('login');
    localStorage.removeItem('token'); // Ensure token is cleared
  };

  const handleCalculate = async (data, shouldSave = false) => {
    try {
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
          const localCharts = JSON.parse(localStorage.getItem('savedCharts') || '[]');

          // Check for duplicates
          const isDuplicate = localCharts.some(chart =>
            chart.name.toLowerCase() === data.name.toLowerCase() &&
            chart.dateOfBirth === data.date &&
            chart.timeOfBirth === data.time &&
            chart.placeOfBirth.city.toLowerCase() === data.city.toLowerCase()
          );

          if (isDuplicate) {
            console.log("Chart already exists, skipping save.");
            // Optional: alert("Chart already saved!"); 
          } else {
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
              chartData: responseData.data,
              createdAt: new Date().toISOString()
            };

            localCharts.push(newChart);
            localStorage.setItem('savedCharts', JSON.stringify(localCharts));
          }
        }
      } else {
        alert('Error: ' + responseData.error);
      }
    } catch (err) {
      alert('Network error. Ensure backend is running.');
    }
  };

  const handleLoadChart = (chartData, chartFormData) => {
    setResults(chartData);
    setFormData(chartFormData);
    setCurrentPage('results');
  };

  const handleEditChart = (chartFormData) => {
    setEditingChart(chartFormData);
    setCurrentPage('home');
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
    document.body.className = theme === 'dark' ? 'light-theme' : 'dark-theme';
  };

  return (
    <div className={`app-container ${theme}-theme`}>
      {isAuthenticated && (
        <div className="theme-toggle-btn" onClick={toggleTheme}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </div>
      )}

      {isAuthenticated && (
        <div className="user-info">
          <span>👤 {user?.name}</span>
          <button className="nav-btn" onClick={() => setCurrentPage('saved-charts')}>📂 Saved Charts</button>
          <button className="nav-btn" onClick={() => setCurrentPage('match-making')}>💞 Match Making</button>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      )}

      {currentPage === 'login' && (
        <LoginPage onLogin={handleLogin} />
      )}

      {currentPage === 'home' && isAuthenticated && (
        <HomePage onCalculate={handleCalculate} initialData={editingChart} />
      )}

      {currentPage === 'saved-charts' && (
        <SavedChartsPage
          onBack={handleBackToHome}
          onLoadChart={handleLoadChart}
          onEditChart={handleEditChart}
        />
      )}

      {currentPage === 'results' && (
        <ResultsPage
          results={results}
          formData={formData}
          onBack={() => setCurrentPage('home')}
          onViewDetailed={() => setCurrentPage('detailed-report')}
        />
      )}

      {currentPage === 'detailed-report' && (
        <DetailedReportPage
          results={results}
          formData={formData}
          onBack={() => setCurrentPage('results')}
        />
      )}

      {currentPage === 'match-making' && (
        <MatchMakingPage
          onBack={() => setCurrentPage('home')}
        />
      )}
    </div>
  );
}

export default App;
