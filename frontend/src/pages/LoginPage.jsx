import React, { useState, useEffect } from 'react';
import EmailAuth from '../components/EmailAuth';
import './LoginPage.css';

const LoginPage = ({ onLogin }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [showEmailAuth, setShowEmailAuth] = useState(false);

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

    const handleGoogleCallback = (response) => {
        // Decode the JWT token to get user info
        const userInfo = parseJwt(response.credential);

        onLogin({
            name: userInfo.name,
            email: userInfo.email,
            picture: userInfo.picture,
            provider: 'google'
        });
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

    const handleZohoLogin = () => {
        setIsLoading(true);

        // Demo Zoho login
        setTimeout(() => {
            onLogin({
                name: 'Demo User (Zoho)',
                email: 'demo@zoho.com',
                provider: 'zoho'
            });
            setIsLoading(false);
        }, 1000);
    };

    const handleGuestLogin = () => {
        const guestUser = {
            name: 'Guest User',
            email: 'guest@example.com',
            isGuest: true
        };
        onLogin(guestUser);
    };

    const handleEmailAuthSuccess = (user) => {
        onLogin({
            name: user.name,
            email: user.email,
            provider: 'email'
        });
    };

    if (showEmailAuth) {
        return (
            <div>
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
                        fontWeight: '600'
                    }}
                >
                    ← Back to Options
                </button>
            </div>
        );
    }

    return (
        <div className="login-container">
            <div className="login-decoration">
                <div className="star star-1">✨</div>
                <div className="star star-2">✨</div>
                <div className="star star-3">✨</div>
                <div className="star star-4">✨</div>
            </div>

            <div className="login-card">
                <header className="login-header">
                    <div className="logo-icon">🕉️</div>
                    <h1 className="app-title">Vedic Astro</h1>
                    <p className="app-subtitle">Discover your cosmic blueprint</p>
                </header>

                <div className="login-body">
                    {/* Guest Mode Button */}
                    <button className="oauth-btn guest-btn" onClick={handleGuestLogin}>
                        <span>👤 Continue as Guest</span>
                    </button>

                    <div className="divider">
                        <span>OR</span>
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

                    {/* Custom styled button as fallback */}
                    <button
                        className="oauth-btn google-btn"
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        style={{ display: 'none' }}
                    >
                        <svg viewBox="0 0 24 24" width="20" height="20">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span>{isLoading ? 'Connecting...' : 'Continue with Google'}</span>
                    </button>

                    <button
                        className="oauth-btn zoho-btn"
                        onClick={handleZohoLogin}
                        disabled={isLoading}
                    >
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="#D32F2F">
                            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                        </svg>
                        <span>Continue with Zoho (Demo)</span>
                    </button>

                    <div className="divider">
                        <span>OR</span>
                    </div>

                    <button
                        className="oauth-btn email-btn"
                        onClick={() => setShowEmailAuth(true)}
                    >
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                        </svg>
                        <span>Sign in with Email</span>
                    </button>
                </div>

                <div className="login-footer">
                    <p className="privacy-note">
                        By signing in, you agree to our Terms of Service and Privacy Policy
                    </p>
                </div>
            </div>

            <div className="login-decoration">
                <div className="star star-1">✨</div>
                <div className="star star-2">⭐</div>
                <div className="star star-3">🌟</div>
                <div className="star star-4">💫</div>
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
