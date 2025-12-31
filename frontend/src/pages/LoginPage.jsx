import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import EmailAuth from '../components/EmailAuth';
import './LoginPage.css';
import parrotImage from '../assets/parrot_astrologer.png';

const LoginPage = ({ onLogin }) => {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [showEmailAuth, setShowEmailAuth] = useState(false);
    const [showGuestInput, setShowGuestInput] = useState(false);
    const [guestName, setGuestName] = useState('');

    useEffect(() => {
        // Load Google's Sign-In JavaScript library
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);

        script.onload = () => {
            // Initialize Google Sign-In
            window.google.accounts.id.initialize({
                client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                callback: handleGoogleCallback
            });
        };

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const handleGoogleCallback = async (response) => {
        // Decode the JWT token to get user info
        const userInfo = parseJwt(response.credential);

        try {
            // Exchange Google token for App Token
            const res = await fetch(`${API_URL}/api/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: userInfo.email,
                    name: userInfo.name,
                    picture: userInfo.picture,
                    googleToken: response.credential
                })
            });
            const data = await res.json();

            if (data.success) {
                localStorage.setItem('token', data.token);
                onLogin(data.user);
            } else {
                console.error("Login verification failed:", data.error);
                alert(t('auth.loginFailed', "Login verification failed"));
            }
        } catch (err) {
            console.error("Login error:", err);
            // Fallback for demo/offline logic if preferred, but explicit failure is better for debugging
            alert(t('auth.networkError', "Login network error"));
        }
    };

    const parseJwt = (token) => {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    };

    const handleGoogleLogin = () => {
        setIsLoading(true);

        // Trigger Google One Tap or redirect
        window.google.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                // Fallback to manual button click
                setIsLoading(false);
            }
        });
    };

    const handleGuestLoginClick = () => {
        setShowGuestInput(true);
    };

    const handleGuestSubmit = (e) => {
        e.preventDefault();
        if (!guestName.trim()) {
            alert(t('auth.enterName', 'Please enter your name'));
            return;
        }

        const guestUser = {
            name: guestName,
            email: 'guest@example.com',
            isGuest: true
        };

        // Persist guest session
        localStorage.setItem('guestName', guestName);
        localStorage.setItem('isGuest', 'true');

        onLogin(guestUser);
    };

    const handleEmailAuthSuccess = (user) => {
        onLogin({
            name: user.name,
            email: user.email,
            provider: 'email'
        });
    };

    if (showGuestInput) {
        return (
            <div className="login-container" style={{ zIndex: 1, position: 'relative' }}>
                <div className="login-content-wrapper">
                    <div className="login-image-section">
                        <img src={parrotImage} alt="Vedic Astrologer" className="parrot-image" />
                        <div className="image-overlay"></div>
                    </div>

                    <div className="login-card">
                        <header className="login-header">
                            <h1 className="app-title">{t('auth.guestLogin', 'Guest Login')}</h1>
                            <p className="app-subtitle">{t('auth.enterNameSubtitle', 'Please enter your name to continue')}</p>
                        </header>

                        <div className="login-body">
                            <form onSubmit={handleGuestSubmit} style={{ width: '100%' }}>
                                <div className="input-group" style={{ marginBottom: '20px' }}>
                                    <input
                                        type="text"
                                        placeholder={t('auth.yourName', 'Your Name')}
                                        value={guestName}
                                        onChange={(e) => setGuestName(e.target.value)}
                                        className="auth-input"
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '8px',
                                            color: 'white',
                                            fontSize: '16px'
                                        }}
                                        autoFocus
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <button type="submit" className="oauth-btn guest-btn" style={{ justifyContent: 'center' }}>
                                        {t('auth.continue', 'Continue')}
                                    </button>
                                    <button
                                        type="button"
                                        className="oauth-btn"
                                        onClick={() => setShowGuestInput(false)}
                                        style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', justifyContent: 'center' }}
                                    >
                                        {t('auth.back', 'Back')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (showEmailAuth) {
        console.log("LoginPage: Rendering EmailAuth component");
        return (
            <div style={{ position: 'relative', width: '100vw', minHeight: '100vh', background: 'var(--bg-deep)' }}>
                <EmailAuth onAuthSuccess={handleEmailAuthSuccess} />
                <button
                    className="back-to-login-btn"
                    onClick={() => setShowEmailAuth(false)}
                    style={{
                        position: 'fixed',
                        top: '20px',
                        left: '20px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(10px)',
                        border: 'none',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        zIndex: 1000
                    }}
                >
                    {t('auth.backToOptions')}
                </button>
            </div>
        );
    }

    return (
        <div className="login-container" style={{ zIndex: 1, position: 'relative' }}>
            <div className="login-content-wrapper">
                <div className="login-image-section">
                    <img src={parrotImage} alt="Vedic Astrologer" className="parrot-image" />
                    <div className="image-overlay"></div>
                </div>

                <div className="login-card">
                    <header className="login-header">
                        <h1 className="app-title">{t('auth.appTitle')}</h1>
                        <p className="app-subtitle">{t('auth.appSubtitle')}</p>
                    </header>

                    <div className="login-body">
                        {/* Guest Mode Button */}
                        <button className="oauth-btn guest-btn" onClick={handleGuestLoginClick}>
                            <span>{t('auth.continueGuest')}</span>
                        </button>

                        <div className="divider">
                            <span>{t('auth.or')}</span>
                        </div>

                        <div
                            className="g_id_signin google-signin-custom"
                            data-type="standard"
                            data-shape="rectangular"
                            data-theme="outline"
                            data-text="signin_with"
                            data-size="large"
                            data-logo_alignment="left"
                            onClick={handleGoogleLogin}>
                        </div>

                        <button
                            className="oauth-btn email-btn"
                            onClick={() => {
                                console.log("Sign in with Email clicked");
                                setShowEmailAuth(true);
                            }}
                            type="button"
                            style={{ zIndex: 10, position: 'relative' }}
                        >
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                            </svg>
                            <span>{t('auth.signInEmail')}</span>
                        </button>
                    </div>

                    <div className="login-footer">
                        <p className="privacy-note">
                            {t('auth.terms')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Make callback available globally for Google SDK
window.handleGoogleCallback = function (response) {
    const event = new CustomEvent('googleSignIn', { detail: response });
    window.dispatchEvent(event);
};

export default LoginPage;
