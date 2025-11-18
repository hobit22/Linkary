# Google OAuth Authentication Setup Guide

This guide will help you set up Google OAuth authentication for Linkary.

## Prerequisites

- A Google account
- Access to Google Cloud Console

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter project name (e.g., "Linkary")
5. Click "Create"

## Step 2: Enable Google+ API (Optional but Recommended)

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on it and enable it

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - Choose "External" user type
   - Fill in the app name: "Linkary"
   - Add your email as developer contact
   - Add scopes: `email`, `profile`, `openid`
   - Save and continue
4. Back in Credentials, click "Create Credentials" > "OAuth client ID"
5. Select "Web application"
6. Configure the settings:
   - **Name**: Linkary Frontend
   - **Authorized JavaScript origins**:
     - `http://localhost:3000`
     - Add production URLs later (e.g., `https://yourdomain.com`)
   - **Authorized redirect URIs**: (Leave empty for now, not needed for implicit flow)
7. Click "Create"
8. Copy the **Client ID** (looks like: `xxxxx.apps.googleusercontent.com`)

## Step 4: Configure Frontend Environment

1. Copy the example environment file:
   ```bash
   cd frontend
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your Google Client ID:
   ```env
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```

3. Replace `your-actual-client-id.apps.googleusercontent.com` with the Client ID you copied in Step 3

## Step 5: Test the Authentication

1. Start the backend server:
   ```bash
   cd backend
   source venv/bin/activate
   python -m app.main
   ```

2. Start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

3. Open your browser to `http://localhost:3000`
4. You should see the login screen with a "Sign in with Google" button
5. Click the button and sign in with your Google account
6. After successful authentication, you should be redirected to the main app

## Troubleshooting

### "Invalid Client ID" Error

- Verify that the Client ID in `.env.local` matches exactly with the one in Google Cloud Console
- Make sure there are no extra spaces or quotes
- Restart the Next.js dev server after changing `.env.local`

### "Redirect URI Mismatch" Error

- Verify that `http://localhost:3000` is listed in "Authorized JavaScript origins"
- The URL must match exactly (no trailing slashes)

### Google Sign-In Button Not Showing

- Check the browser console for errors
- Verify that `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set in `.env.local`
- Make sure the environment variable name starts with `NEXT_PUBLIC_`

### Token Expired or 401 Errors

- The JWT token expires after a certain time (configured in backend)
- You'll be automatically logged out and redirected to the login page
- Simply sign in again to get a new token

## Production Deployment

When deploying to production:

1. Create a new OAuth client ID in Google Cloud Console
2. Add your production domain to "Authorized JavaScript origins"
3. Set the `NEXT_PUBLIC_GOOGLE_CLIENT_ID` environment variable in your hosting platform
4. Update the backend API URL in production environment

## Security Notes

- **Never commit `.env.local` to version control** (it's already in `.gitignore`)
- Keep your Client Secret secure (not used in frontend, but important for backend)
- Use HTTPS in production
- Regularly review authorized domains in Google Cloud Console
- Consider implementing refresh tokens for better UX

## Architecture Overview

### Authentication Flow

1. User clicks "Sign in with Google"
2. Google OAuth popup opens
3. User authenticates with Google
4. Google returns a credential (JWT token)
5. Frontend sends this credential to backend `/api/auth/google`
6. Backend verifies the token with Google
7. Backend creates/updates user in database
8. Backend returns access token + user data
9. Frontend stores token in localStorage
10. Frontend redirects to main app

### Token Management

- Access tokens are stored in `localStorage`
- Tokens are automatically added to API requests via axios interceptors
- Expired tokens trigger automatic logout and redirect to login page
- Token expiration is checked on page load to restore sessions

### Components

- `AuthContext`: Manages authentication state globally
- `GoogleLoginButton`: Renders Google OAuth button
- `UserMenu`: Displays user info and logout option
- `Header`: Shows login button or user menu based on auth state
- `page.tsx`: Guards the main app, shows login screen when not authenticated
