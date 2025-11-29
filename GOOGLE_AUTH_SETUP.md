# Google OAuth Setup Guide

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Enter project name: `Vedic-Horoscope-App`
4. Click **"Create"**

## Step 2: Enable Google+ API

1. In the Google Cloud Console, select your project
2. Go to **"APIs & Services"** → **"Library"**
3. Search for **"Google+ API"**
4. Click on it and press **"Enable"**

## Step 3: Configure OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Select **"External"** (unless you have a Google Workspace)
3. Click **"Create"**

4. Fill in the required fields:
   - **App name**: `Vedic Horoscope Generator`
   - **User support email**: Your email
   - **App logo**: (Optional) Upload a logo
   - **Application home page**: `http://localhost:5173` (for development)
   - **Authorized domains**: Leave empty for localhost
   - **Developer contact email**: Your email

5. Click **"Save and Continue"**

6. **Scopes**: Click **"Add or Remove Scopes"**
   - Select: `userinfo.email`
   - Select: `userinfo.profile`
   - Click **"Update"** → **"Save and Continue"**

7. **Test users**: Click **"Add Users"**
   - Add your Gmail address for testing
   - Click **"Save and Continue"**

8. Review and click **"Back to Dashboard"**

## Step 4: Create OAuth Client ID

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. Select **"Web application"**

4. Fill in the details:
   - **Name**: `Vedic Horoscope Web Client`
   - **Authorized JavaScript origins**:
     - `http://localhost:5173` (for development)
     - `http://localhost:3000` (if needed)
   - **Authorized redirect URIs**:
     - `http://localhost:5173/auth/google/callback`
     - `http://localhost:5173` (fallback)

5. Click **"Create"**

6. **IMPORTANT**: Copy your **Client ID** - it will look like:
   ```
   123456789-abcdefghijklmnop.apps.googleusercontent.com
   ```

## Step 5: Update Your Code

1. Open `LoginPage.jsx`
2. Find line with `const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';`
3. Replace it with your actual Client ID:
   ```javascript
   const GOOGLE_CLIENT_ID = '123456789-abcdefghijklmnop.apps.googleusercontent.com';
   ```

4. Uncomment the OAuth redirect line (around line 34):
   ```javascript
   // Change from:
   // window.location.href = googleAuthUrl;
   
   // To:
   window.location.href = googleAuthUrl;
   ```

5. Comment out the demo simulation (lines 26-32):
   ```javascript
   // setTimeout(() => {
   //     onLogin({
   //         name: 'Demo User (Google)',
   //         email: 'demo@gmail.com',
   //         provider: 'google'
   //     });
   //     setIsLoading(false);
   // }, 1000);
   ```

## Step 6: Handle OAuth Callback

You'll need to add code to handle the OAuth callback. Create this file:

`frontend/src/utils/authCallback.js`:

```javascript
export const handleGoogleCallback = () => {
    const hash = window.location.hash;
    if (hash) {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        
        if (accessToken) {
            // Fetch user info
            fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })
            .then(res => res.json())
            .then(userData => {
                return {
                    name: userData.name,
                    email: userData.email,
                    picture: userData.picture,
                    provider: 'google'
                };
            });
        }
    }
    return null;
};
```

## Step 7: Test Your Setup

1. Start your app: `npm run dev`
2. Click "Continue with Google"
3. Google will show a consent screen
4. Select your account
5. Allow permissions
6. You'll be redirected back with authentication

## Troubleshooting

### Error: redirect_uri_mismatch
- Make sure the redirect URI in Google Console exactly matches your app's URL
- Include `/auth/google/callback` path

### Error: invalid_client
- Double-check your Client ID is correct
- Make sure you're using the Web Application client

### Error: access_denied
- User declined permissions
- Check if user is added to test users list

### App is stuck on loading
- Check browser console for errors
- Verify network requests in DevTools

## Production Setup

When deploying to production:

1. Update **Authorized JavaScript origins** with your domain:
   ```
   https://yourapp.com
   ```

2. Update **Authorized redirect URIs**:
   ```
   https://yourapp.com/auth/google/callback
   ```

3. Update OAuth consent screen to "Production"

4. Submit for Google verification (if needed)

---

## Security Notes

- Never commit Client ID to public repositories (use environment variables)
- For production, implement backend token verification
- Store tokens securely (use httpOnly cookies)
- Implement token refresh logic for long sessions
