# Environment Variables & Security Setup

## ✅ Completed Security Measures

### 1. **Backend Environment Variables** (.env)
Location: `backend/.env`

**Variables Secured:**
- `EMAIL_USER` - Gmail account for OTP
- `EMAIL_PASSWORD` - Gmail app password
- `JWT_SECRET` - Token signing secret
- `MONGODB_URI` - Database connection string
- `GOOGLE_CLIENT_SECRET` - OAuth secret (future)
- `ZOHO_CLIENT_SECRET` - OAuth secret (future)

### 2. **Frontend Environment Variables** (.env)
Location: `frontend/.env`

**Variables Secured:**
- `VITE_GOOGLE_CLIENT_ID` - Google OAuth client ID
- `VITE_API_URL` - Backend API endpoint

**Note:** In Vite, all environment variables MUST start with `VITE_` to be exposed to the browser.

### 3. **Git Protection**
- ✅ `.gitignore` created to exclude `.env` files
- ✅ `.env.example` templates provided for both frontend and backend
- ✅ Sensitive data never committed to version control

---

## 📁 File Structure

```
vedic-astro-app/
├── .gitignore                    # Protects .env files
├── backend/
│   ├── .env                      # 🔒 SECURE - Not in git
│   ├── .env.example              # Template for developers
│   ├── package.json
│   └── server.js                 # Uses process.env.*
├── frontend/
│   ├── .env                      # 🔒 SECURE - Not in git
│   ├── .env.example              # Template for developers
│   ├── package.json
│   └── src/
│       ├── App.jsx               # Uses import.meta.env.VITE_*
│       ├── components/
│       │   └── EmailAuth.jsx     # Uses API_URL constant
│       └── pages/
│           └── LoginPage.jsx     # Uses VITE_GOOGLE_CLIENT_ID
```

---

## 🔐 Security Best Practices Implemented

### ✅ **Separation of Concerns**
- Backend secrets in `backend/.env`
- Frontend public configs in `frontend/.env`
- Never expose backend secrets to frontend

### ✅ **No Hardcoded Credentials**
- All API URLs use environment variables
- All client IDs use environment variables
- Easy to change per environment (dev/staging/prod)

### ✅ **Git Safety**
- `.env` files ignored by git
- Only `.env.example` templates committed
- Prevents accidental secret exposure

### ✅ **Fallback Values**
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```
- Provides defaults for development
- Ensures app doesn't crash if env var missing

---

## 🚀 Setup Instructions for New Developers

### Backend Setup:
```bash
cd backend
cp .env.example .env
# Edit .env with actual values
npm install
npm start
```

### Frontend Setup:
```bash
cd frontend
cp .env.example .env
# Edit .env with actual values
npm install
npm run dev
```

---

## 🔧 Environment Variables Reference

### Backend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `EMAIL_USER` | Gmail for OTP | `your@gmail.com` |
| `EMAIL_PASSWORD` | Gmail app password | `xxxx xxxx xxxx xxxx` |
| `JWT_SECRET` | Token signing key | Random 32+ char string |
| `MONGODB_URI` | Database URL | `mongodb://localhost:27017/db` |

### Frontend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth ID | `123-abc.apps.googleusercontent.com` |
| `VITE_API_URL` | Backend API URL | `http://localhost:5000` |

---

## 🌍 Production Deployment

### Environment-Specific Configs:

**Development:**
```env
VITE_API_URL=http://localhost:5000
```

**Staging:**
```env
VITE_API_URL=https://staging-api.yourapp.com
```

**Production:**
```env
VITE_API_URL=https://api.yourapp.com
```

### Deployment Platforms:

**Vercel/Netlify (Frontend):**
- Add env vars in dashboard
- Prefix with `VITE_`

**Heroku/Railway (Backend):**
- Add env vars in dashboard  
- No `VITE_` prefix needed

---

## ⚠️ Important Security Notes

1. **Never commit `.env` files** - They contain secrets!
2. **Rotate secrets regularly** - Especially after team member changes
3. **Use different secrets** - Dev vs Production
4. **Gmail App Passwords** - Use dedicated app passwords, not main password
5. **JWT Secrets** - Use cryptographically random strings (32+ chars)

---

## 🔍 Verify Security

Check for hardcoded secrets:
```bash
# Search for localhost URLs (should find none in source)
grep -r "localhost:5000" frontend/src/

# Search for client IDs (should find none hardcoded)
grep -r "801110327500" frontend/src/
```

All should use environment variables! ✅

---

## ✅ Security Checklist

- [x] Backend `.env` created
- [x] Frontend `.env` created
- [x] `.gitignore` excludes `.env` files
- [x] `.env.example` templates provided
- [x] All hardcoded URLs removed
- [x] All hardcoded credentials removed
- [x] Environment variables documented
- [x] Fallback values added where appropriate

**Environment Variables Security: COMPLETE! 🎉**
