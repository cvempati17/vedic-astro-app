import React, { useState, useEffect } from 'react';
import EmailAuth from '../components/EmailAuth';
import './LoginPage.css';
import parrotImage from '../assets/parrot_astrologer.png';

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
            <div className="login-content-wrapper">
                <div className="login-image-section">
                    <img src={parrotImage} alt="Vedic Astrologer" className="parrot-image" />
                    <div className="image-overlay"></div>
                </div>

                <div className="login-card">
                    <header className="login-header">
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
