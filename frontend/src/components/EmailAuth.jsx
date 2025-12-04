import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './EmailAuth.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const EmailAuth = ({ onAuthSuccess }) => {
    const { t } = useTranslation();
    const [step, setStep] = useState('email'); // 'email', 'otp', 'register'
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [timer, setTimer] = useState(0);

    // Send OTP to email
    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(t('auth.otpSentMsg'));
                setStep('otp');
                setTimer(600); // 10 minutes countdown
                startCountdown();
            } else {
                setError(data.error || t('auth.failedToSendOtp'));
            }
        } catch (err) {
            setError(t('auth.networkError'));
        } finally {
            setLoading(false);
        }
    };

    // Start countdown timer
    const startCountdown = () => {
        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    // Verify OTP
    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp })
            });

            const data = await response.json();

            if (response.ok) {
                if (data.isNewUser) {
                    // New user - show registration form
                    setStep('register');
                    setFormData({ ...formData, email });
                } else {
                    // Existing user - log them in
                    handleLogin();
                }
            } else {
                setError(data.error || t('auth.invalidOtp'));
            }
        } catch (err) {
            setError(t('auth.networkError'));
        } finally {
            setLoading(false);
        }
    };

    // Register new user
    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, ...formData })
            });

            const data = await response.json();

            if (response.ok) {
                // Save token
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                // Call success callback
                onAuthSuccess(data.user);
            } else {
                setError(data.error || t('auth.registrationFailed'));
            }
        } catch (err) {
            setError(t('auth.networkError'));
        } finally {
            setLoading(false);
        }
    };

    // Login existing user
    const handleLogin = async () => {
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                // Save token
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                // Call success callback
                onAuthSuccess(data.user);
            } else {
                setError(data.error || t('auth.loginFailed'));
            }
        } catch (err) {
            setError(t('auth.networkError'));
        } finally {
            setLoading(false);
        }
    };

    // Resend OTP
    const handleResendOTP = () => {
        setOtp('');
        handleSendOTP({ preventDefault: () => { } });
    };

    // Format timer display
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="email-auth-container">
            <div className="email-auth-card">
                <h2 className="email-auth-title">
                    {step === 'email' && t('auth.signInTitle')}
                    {step === 'otp' && t('auth.verifyOtpTitle')}
                    {step === 'register' && t('auth.registerTitle')}
                </h2>

                {error && <div className="email-auth-error">{error}</div>}
                {message && <div className="email-auth-success">{message}</div>}

                {/* Step 1: Enter Email */}
                {step === 'email' && (
                    <form onSubmit={handleSendOTP} className="email-auth-form">
                        <div className="email-auth-field">
                            <label>{t('auth.emailLabel')}</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={t('auth.emailPlaceholder')}
                                required
                                autoFocus
                            />
                        </div>
                        <button type="submit" className="email-auth-btn" disabled={loading}>
                            {loading ? t('auth.sendingBtn') : t('auth.sendOtpBtn')}
                        </button>
                    </form>
                )}

                {/* Step 2: Enter OTP */}
                {step === 'otp' && (
                    <form onSubmit={handleVerifyOTP} className="email-auth-form">
                        <div className="email-auth-info">
                            {t('auth.otpSentToMsg')} <strong>{email}</strong>
                        </div>
                        <div className="email-auth-field">
                            <label>{t('auth.otpLabel')}</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder={t('auth.otpPlaceholder')}
                                maxLength="6"
                                required
                                autoFocus
                            />
                        </div>
                        {timer > 0 && (
                            <div className="email-auth-timer">
                                {t('auth.timeRemaining')}: {formatTime(timer)}
                            </div>
                        )}
                        <button type="submit" className="email-auth-btn" disabled={loading}>
                            {loading ? t('auth.verifyingBtn') : t('auth.verifyOtpBtn')}
                        </button>
                        <button
                            type="button"
                            className="email-auth-link-btn"
                            onClick={handleResendOTP}
                            disabled={timer > 540} // Disable for first 60 seconds
                        >
                            {t('auth.resendOtpBtn')}
                        </button>
                        <button
                            type="button"
                            className="email-auth-link-btn"
                            onClick={() => setStep('email')}
                        >
                            {t('auth.changeEmailBtn')}
                        </button>
                    </form>
                )}

                {/* Step 3: Registration Form (New Users) */}
                {step === 'register' && (
                    <form onSubmit={handleRegister} className="email-auth-form">
                        <div className="email-auth-info">
                            {t('auth.welcomeMsg')}
                        </div>
                        <div className="email-auth-field">
                            <label>{t('auth.nameLabel')}</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder={t('auth.namePlaceholder')}
                                required
                                autoFocus
                            />
                        </div>
                        <div className="email-auth-field">
                            <label>{t('auth.emailReadOnlyLabel')}</label>
                            <input
                                type="email"
                                value={email}
                                readOnly
                                className="readonly-field"
                            />
                        </div>
                        <div className="email-auth-field">
                            <label>{t('auth.phoneLabel')}</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder={t('auth.phonePlaceholder')}
                            />
                        </div>
                        <div className="email-auth-field">
                            <label>{t('auth.addressLabel')}</label>
                            <textarea
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder={t('auth.addressPlaceholder')}
                                rows="3"
                            />
                        </div>
                        <button type="submit" className="email-auth-btn" disabled={loading}>
                            {loading ? t('auth.registeringBtn') : t('auth.completeRegBtn')}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default EmailAuth;
