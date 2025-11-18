# Quick Start Guide - Google OAuth Authentication

## TL;DR Setup (5 minutes)

### 1. Install Dependencies (Already Done)
```bash
npm install @react-oauth/google jwt-decode
```

### 2. Get Google Client ID

1. Go to: https://console.cloud.google.com/apis/credentials
2. Create OAuth Client ID → Web application
3. Add origin: `http://localhost:3000`
4. Copy the Client ID

### 3. Configure Environment

Edit `/frontend/.env.local`:
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=paste-your-client-id-here.apps.googleusercontent.com
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 4. Start Both Servers

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
python -m app.main
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Test

1. Open: `http://localhost:3000`
2. Click "Sign in with Google"
3. Authenticate
4. You should see the main app

---

## What Was Implemented

### New Files Created (7)
- `lib/auth.ts` - Token management utilities
- `contexts/AuthContext.tsx` - Global auth state
- `hooks/useAuth.ts` - Auth context hook
- `components/GoogleLoginButton.tsx` - OAuth login button
- `components/UserMenu.tsx` - User profile menu
- `.env.local.example` - Environment template
- `AUTH_SETUP.md` - Detailed setup guide

### Files Modified (5)
- `lib/api.ts` - Added auth endpoints & interceptors
- `app/layout.tsx` - Added OAuth & Auth providers
- `components/Header.tsx` - Added login/user menu
- `app/page.tsx` - Added auth guards
- `.env.local` - Added Google Client ID

---

## How It Works

### User Perspective

**First Visit:**
1. See login screen with Google button
2. Click button → Google popup
3. Sign in with Google
4. Automatically redirected to app
5. See your name/picture in top-right

**Returning Visit:**
1. Page loads → automatically logged in
2. If token expired → see login screen again

**Logout:**
1. Click your profile picture
2. Click "Sign out"
3. Redirected to login screen

### Technical Flow

```
[Frontend]                [Backend]               [Google]
    |                         |                       |
    |-- Sign in with Google --|                       |
    |                         |                       |
    |<-------- Google OAuth Popup ------------------->>|
    |                         |                       |
    |-- Send credential ----->|                       |
    |                         |                       |
    |                         |-- Verify with Google ->|
    |                         |<----- User info -------|
    |                         |                       |
    |                         |-- Save user to DB     |
    |                         |-- Generate JWT        |
    |                         |                       |
    |<-- Access token + user -|                       |
    |                         |                       |
    |-- Store in localStorage |                       |
    |-- Update UI             |                       |
```

---

## API Endpoints Used

### Frontend Calls Backend:

**POST `/api/auth/google`**
- Body: `{ token: "google-credential" }`
- Returns: `{ access_token, token_type, user }`

**GET `/api/auth/me`**
- Headers: `Authorization: Bearer <token>`
- Returns: `{ success: true, data: user }`

### All Link Endpoints Now Protected:
- Requires `Authorization: Bearer <token>` header
- Automatically added by axios interceptor
- 401 errors trigger automatic logout

---

## File Structure

```
frontend/
├── app/
│   ├── layout.tsx          (✏️ Modified - Added providers)
│   └── page.tsx            (✏️ Modified - Added auth guards)
├── components/
│   ├── GoogleLoginButton.tsx  (✅ New - OAuth button)
│   ├── UserMenu.tsx           (✅ New - Profile menu)
│   └── Header.tsx             (✏️ Modified - Login/menu)
├── contexts/
│   └── AuthContext.tsx        (✅ New - Global state)
├── hooks/
│   └── useAuth.ts             (✅ New - Auth hook)
├── lib/
│   ├── api.ts              (✏️ Modified - Auth endpoints)
│   └── auth.ts             (✅ New - Token utils)
├── .env.local              (✏️ Modified - Added Client ID)
├── .env.local.example      (✅ New - Template)
├── AUTH_SETUP.md           (✅ New - Full guide)
├── IMPLEMENTATION_SUMMARY.md  (✅ New - Details)
└── QUICK_START.md          (✅ New - This file)
```

---

## Troubleshooting

### Problem: Google button not showing
**Solution**: Check `.env.local` has correct Client ID

### Problem: "Invalid Client ID" error
**Solution**:
1. Verify Client ID in Google Cloud Console
2. Make sure no extra spaces in `.env.local`
3. Restart Next.js dev server

### Problem: 401 errors on API calls
**Solution**:
1. Check backend is running
2. Verify token in localStorage (DevTools → Application → Local Storage)
3. Try logging out and back in

### Problem: Redirect URI mismatch
**Solution**: Add `http://localhost:3000` to Google Cloud Console authorized origins

---

## Next Steps

1. ✅ Set up Google OAuth (you're here!)
2. Test login/logout flows
3. Verify token persistence across page reloads
4. Check API calls include auth token
5. Set up production OAuth credentials when deploying

---

## Need More Help?

- **Detailed Setup**: See `AUTH_SETUP.md`
- **Implementation Details**: See `IMPLEMENTATION_SUMMARY.md`
- **Backend Setup**: Check if backend has corresponding auth endpoints
- **Google Console**: https://console.cloud.google.com/

---

**Status**: ✅ Implementation Complete
**Last Updated**: 2025-11-18
