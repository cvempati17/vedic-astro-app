import './index.css';
import './styles/header.css';
import './styles/headerDetailed.css';
import './components/StrengthView.css';
import './components/StrengthViewBadges.css';
import './components/StrengthViewAvastha.css';
import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n'; // Initialize i18n
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Suspense fallback={<div style={{ color: 'white', textAlign: 'center', marginTop: '20px' }}>Loading Application...</div>}>
      <App />
    </Suspense>
  </StrictMode>,
)
