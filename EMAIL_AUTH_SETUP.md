# Email Authentication Setup Guide

## Overview
We've added a comprehensive email-based authentication system with OTP verification to your Vedic Astrology application. This complements the existing Google and Zoho OAuth options.

## Features Implemented

### 1. **Backend Authentication API**
   - **File**: `backend/routes/auth.js`
   - **Endpoints**:
     - `POST /api/auth/send-otp` - Sends 6-digit OTP to user's email
     - `POST /api/auth/verify-otp` - Verifies the OTP
     - `POST /api/auth/register` - Registers new users
     - `POST /api/auth/login` - Logs in existing users

### 2. **Frontend Components**
   - **File**: `frontend/src/components/EmailAuth.jsx`
   - **Features**:
     - Step 1: Email entry
     - Step 2: OTP verification with 10-minute timer
     - Step 3: Registration form for new users (Name, Email, Phone, Address)
     - Automatic login for existing users

### 3. **Integration**
   - Updated `LoginPage.jsx` to include "Sign in with Email" button
   - Seamless navigation between OAuth and email authentication

## Setup Instructions

### Step 1: Install Backend Dependencies
```bash
cd backend
npm install
```

This will install:
- `nodemailer` - For sending emails
- `bcrypt` - For password hashing (future use)
- `jsonwebtoken` - For JWT tokens
- `mongodb` - For database (optional)
- `dotenv` - For environment variables

### Step 2: Configure Email Service

1. Create `.env` file in `backend/` directory (copy from `.env.example`):
```bash
cp .env.example .env
```

2. Update `.env` with your email credentials:

**For Gmail:**
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
```

**How to get Gmail App Password:**
- Go to Google Account settings
- Security → 2-Step Verification (enable if not enabled)
- App passwords → Generate new password
- Copy the 16-character password to `.env`

**For Other Email Services:**
Update transporter configuration in `backend/routes/auth.js`:
```javascript
const transporter = nodemailer.createTransport({
    host: 'smtp.your-service.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});
```

### Step 3: Set JWT Secret
In `.env`, add a strong secret key:
```env
JWT_SECRET=your-super-secret-random-string-here
```

Generate a random secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 4: Start the Backend
```bash
npm start
```

## Authentication Flow

### New User Registration:
```
1. User enters email
   ↓
2. System sends 6-digit OTP to email
   ↓
3. User enters OTP (10-minute expiry)
   ↓
4. System verifies OTP
   ↓
5. User fills registration form:
   - Name (required)
   - Email (pre-filled, readonly)
   - Phone (optional)
   - Address (optional)
   ↓
6. User registered and logged in
   ↓
7. JWT token stored in localStorage
```

### Existing User Login:
```
1. User enters email
   ↓
2. System sends OTP
   ↓
3. User enters OTP
   ↓
4. System recognizes existing user
   ↓
5. User logged in directly (no registration form)
   ↓
6. JWT token stored in localStorage
```

## Security Features

1. **OTP Expiry**: OTPs expire after 10 minutes
2. **Auto Cleanup**: Expired OTPs are automatically removed
3. **JWT Tokens**: Secure tokens with 7-day expiry
4. **Email Validation**: Email format validation on both frontend and backend

## Database Integration (Future)

Currently, user data is not persisted (demo mode). To add database:

1. **MongoDB Setup**:
```bash
# Install MongoDB or use MongoDB Atlas
```

2. **Update** `backend/routes/auth.js`:
```javascript
const { MongoClient } = require('mongodb');
const client = new MongoClient(process.env.MONGODB_URI);

// In verify-otp endpoint:
const db = client.db('vedic-astro');
const users = db.collection('users');
const existingUser = await users.findOne({ email });

// In register endpoint:
await users.insertOne(userData);
```

## UI Features

### Email Auth Component Styling:
- Modern gradient background
- Smooth animations
- Responsive design
- Error/success message display
- Countdown timer for OTP expiry
- Resend OTP option

### Login Page Updates:
- Added "OR" divider
- Email button with envelope icon
- "Back to Options" button when in email auth mode

## Testing

### Test the OTP Flow:
1. Click "Sign in with Email"
2. Enter your email
3. Check your inbox for OTP
4. Enter the 6-digit code
5. Complete registration (if new user)

### Common Issues:

**OTP not received:**
- Check spam folder
- Verify EMAIL_USER and EMAIL_PASSWORD in `.env`
- Check email service settings (SMTP enabled for Gmail)

**"Network error":**
- Ensure backend is running on port 5000
- Check CORS settings in backend

## Next Steps

1. **Add Database** - Persist user data in MongoDB
2. **Password Option** - Add password-based login alongside OTP
3. **Remember Me** - Extend JWT expiry for trusted devices
4. **Rate Limiting** - Prevent OTP spam (max 3 OTPs per hour)
5. **Email Templates** - Professional HTML email templates
6. **SMS OTP** - Alternative OTP via SMS using Twilio

## File Structure

```
backend/
├── routes/
│   └── auth.js          # Authentication routes
├── .env                 # Environment variables (create this)
├── .env.example         # Template
├── package.json         # Updated with new dependencies
└── server.js            # Updated with auth routes

frontend/
├── src/
│   ├── components/
│   │   ├── EmailAuth.jsx     # Email authentication component
│   │   └── EmailAuth.css     # Styling
│   └── pages/
│       ├── LoginPage.jsx     # Updated with email option
│       └── LoginPage.css     # Updated styles
```

## Support

If you encounter any issues:
1. Check backend console for errors
2. Check browser console for frontend errors
3. Verify .env configuration
4. Ensure all npm packages are installed

---

**Authentication is now complete with three options:**
- ✅ Google OAuth
- ✅ Zoho OAuth (Demo)
- ✅ Email + OTP
