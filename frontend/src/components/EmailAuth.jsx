import React, { useState } from 'react';
import './EmailAuth.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const EmailAuth = ({ onAuthSuccess }) => {
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
                setMessage('OTP sent to your email!');
                setStep('otp');
                setTimer(600); // 10 minutes countdown
                startCountdown();
            } else {
                setError(data.error || 'Failed to send OTP');
            }
        } catch (err) {
            setError('Network error. Please try again.');
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
                setError(data.error || 'Invalid OTP');
            }
        } catch (err) {
            setError('Network error. Please try again.');
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
                setError(data.error || 'Registration failed');
            }
        } catch (err) {
            setError('Network error. Please try again.');
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
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            setError('Network error. Please try again.');
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
                    {step === 'email' && 'Sign In with Email'}
                    {step === 'otp' && 'Verify OTP'}
                    {step === 'register' && 'Complete Registration'}
                </h2>

                {error && <div className="email-auth-error">{error}</div>}
                {message && <div className="email-auth-success">{message}</div>}

                {/* Step 1: Enter Email */}
                {step === 'email' && (
                    <form onSubmit={handleSendOTP} className="email-auth-form">
                        <div className="email-auth-field">
                            <label>Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                                autoFocus
                            />
                        </div>
                        <button type="submit" className="email-auth-btn" disabled={loading}>
                            {loading ? 'Sending...' : 'Send OTP'}
                        </button>
                    </form>
                )}

                {/* Step 2: Enter OTP */}
                {step === 'otp' && (
                    <form onSubmit={handleVerifyOTP} className="email-auth-form">
                        <div className="email-auth-info">
                            OTP sent to <strong>{email}</strong>
                        </div>
                        <div className="email-auth-field">
                            <label>Enter OTP</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="Enter 6-digit OTP"
                                maxLength="6"
                                required
                                autoFocus
                            />
                        </div>
                        {timer > 0 && (
                            <div className="email-auth-timer">
                                Time remaining: {formatTime(timer)}
                            </div>
                        )}
                        <button type="submit" className="email-auth-btn" disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                        <button
                            type="button"
                            className="email-auth-link-btn"
                            onClick={handleResendOTP}
                            disabled={timer > 540} // Disable for first 60 seconds
                        >
                            Resend OTP
                        </button>
                        <button
                            type="button"
                            className="email-auth-link-btn"
                            onClick={() => setStep('email')}
                        >
                            Change Email
                        </button>
                    </form>
                )}

                {/* Step 3: Registration Form (New Users) */}
                {step === 'register' && (
                    <form onSubmit={handleRegister} className="email-auth-form">
                        <div className="email-auth-info">
                            Welcome! Please complete your registration
                        </div>
                        <div className="email-auth-field">
                            <label>Full Name *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Enter your full name"
                                required
                                autoFocus
                            />
                        </div>
                        <div className="email-auth-field">
                            <label>Email *</label>
                            <input
                                type="email"
                                value={email}
                                readOnly
                                className="readonly-field"
                            />
                        </div>
                        <div className="email-auth-field">
                            <label>Phone Number</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="Enter your phone number"
                            />
                        </div>
                        <div className="email-auth-field">
                            <label>Address</label>
                            <textarea
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Enter your address"
                                rows="3"
                            />
                        </div>
                        <button type="submit" className="email-auth-btn" disabled={loading}>
                            {loading ? 'Registering...' : 'Complete Registration'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default EmailAuth;
