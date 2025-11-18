# Google OAuth Authentication Setup Guide

## Overview

This guide walks you through setting up Google OAuth authentication for the Linkary backend.

## Prerequisites

- Python 3.13+
- MongoDB running (locally or via Docker)
- Google Cloud Console account

## Step 1: Google Cloud Console Setup

### 1.1 Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (or Google Identity Services)

### 1.2 Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth 2.0 Client ID**
3. Configure the consent screen if prompted:
   - User Type: External (for testing) or Internal (for organization)
   - App name: Linkary
   - User support email: Your email
   - Developer contact: Your email
4. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: Linkary Web Client
   - Authorized JavaScript origins:
     - `http://localhost:3000`
   - Authorized redirect URIs (if needed):
     - `http://localhost:3000`
5. Click **Create**
6. Copy the **Client ID** (you'll need this for the .env file)

## Step 2: Backend Environment Configuration

### 2.1 Create .env file

Copy the example environment file:

```bash
cp .env.example .env
```

### 2.2 Configure Environment Variables

Edit `.env` and set the following values:

```env
# Server Configuration
PORT=8000
ENVIRONMENT=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/linkary

# Google OAuth Configuration
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com

# JWT Configuration
# Generate using: openssl rand -hex 32
JWT_SECRET_KEY=your-generated-secret-key-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Frontend Configuration
FRONTEND_URL=http://localhost:3000
```

### 2.3 Generate JWT Secret Key

Generate a secure JWT secret key:

```bash
openssl rand -hex 32
```

Copy the output and paste it as the `JWT_SECRET_KEY` value.

## Step 3: Install Dependencies

Dependencies are already installed (python-jose[cryptography] and google-auth).

Verify installation:

```bash
pip list | grep -E "google-auth|python-jose"
```

## Step 4: Start the Backend

```bash
# Make sure MongoDB is running
docker-compose up -d

# Start the backend server
python -m app.main
# OR
uvicorn app.main:app --reload --port 8000
```

The server should start on `http://localhost:8000`

## Step 5: Test Authentication Endpoints

### Test 1: Health Check

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

### Test 2: Google OAuth Login (Requires Google Token)

To get a Google credential token, you need to integrate Google Sign-In on the frontend. For testing purposes, you can use Google's OAuth playground.

**Using curl (with a valid Google credential token):**

```bash
curl -X POST http://localhost:8000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{
    "credential": "YOUR_GOOGLE_CREDENTIAL_TOKEN_HERE"
  }'
```

Expected response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "picture": "https://example.com/photo.jpg",
    "createdAt": "2024-01-01T00:00:00",
    "updatedAt": "2024-01-01T00:00:00"
  }
}
```

### Test 3: Get Current User (Authenticated)

```bash
# Save the access_token from the previous response
TOKEN="your_access_token_here"

curl http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "picture": "https://example.com/photo.jpg",
    "createdAt": "2024-01-01T00:00:00",
    "updatedAt": "2024-01-01T00:00:00"
  }
}
```

### Test 4: Create a Link (Authenticated)

```bash
curl -X POST http://localhost:8000/api/links \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://github.com/microsoft/vscode",
    "tags": ["coding", "editor"],
    "category": "Tool"
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "url": "https://github.com/microsoft/vscode",
    "title": "microsoft/vscode: Visual Studio Code",
    "description": "Visual Studio Code - Open Source",
    "favicon": "https://github.com/favicon.ico",
    "image": "",
    "tags": ["coding", "editor"],
    "category": "Tool",
    "relatedLinks": [],
    "notes": "",
    "createdAt": "2024-01-01T00:00:00",
    "updatedAt": "2024-01-01T00:00:00"
  }
}
```

### Test 5: Get All Links (Authenticated)

```bash
curl http://localhost:8000/api/links \
  -H "Authorization: Bearer $TOKEN"
```

Expected response:
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "url": "https://github.com/microsoft/vscode",
      ...
    }
  ]
}
```

### Test 6: Unauthorized Access (No Token)

```bash
curl http://localhost:8000/api/links
```

Expected response (401 Unauthorized):
```json
{
  "detail": "Not authenticated"
}
```

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/auth/google` | No | Authenticate with Google OAuth token |
| GET | `/api/auth/me` | Yes | Get current user information |

### Link Endpoints (All Require Authentication)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/links` | Get all links for authenticated user |
| GET | `/api/links/graph` | Get graph data for visualization |
| GET | `/api/links/{id}` | Get single link (ownership verified) |
| POST | `/api/links` | Create new link |
| PUT | `/api/links/{id}` | Update link (ownership verified) |
| DELETE | `/api/links/{id}` | Delete link (ownership verified) |

## Database Collections

### users
```javascript
{
  _id: ObjectId,
  email: String,
  name: String,
  picture: String,
  google_id: String,
  created_at: Date,
  updated_at: Date
}
```

### links
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,  // References users collection
  url: String,
  title: String,
  description: String,
  favicon: String,
  image: String,
  tags: [String],
  category: String,
  related_links: [ObjectId],
  notes: String,
  created_at: Date,
  updated_at: Date
}
```

## Troubleshooting

### Issue: "Token verification failed"

**Cause**: Invalid or expired Google credential token.

**Solution**:
- Make sure you're using a fresh Google credential token
- Verify the `GOOGLE_CLIENT_ID` in your `.env` matches the one from Google Cloud Console
- Ensure the token was generated for the correct client ID

### Issue: "Not authenticated" on protected routes

**Cause**: Missing or invalid JWT token.

**Solution**:
- Make sure you include the `Authorization: Bearer <token>` header
- Verify the JWT token hasn't expired (default: 24 hours)
- Check that `JWT_SECRET_KEY` is set correctly in `.env`

### Issue: "Link not found" when accessing own links

**Cause**: Database contains links without `user_id` field (created before authentication).

**Solution**:
- Clear the database or add `user_id` to existing links:

```javascript
// MongoDB shell
use linkary
db.links.updateMany(
  { user_id: { $exists: false } },
  { $set: { user_id: ObjectId("YOUR_USER_ID") } }
)
```

### Issue: CORS errors from frontend

**Cause**: Frontend URL not matching `FRONTEND_URL` in `.env`.

**Solution**:
- Verify `FRONTEND_URL=http://localhost:3000` in `.env`
- Make sure frontend is running on port 3000
- Restart the backend server after changing `.env`

## Security Best Practices

1. **Never commit .env file**: The `.env` file contains secrets and should never be committed to version control.

2. **Use strong JWT secret**: Generate a random 32+ character secret key.

3. **HTTPS in production**: Always use HTTPS in production environments.

4. **Restrict CORS origins**: In production, set `FRONTEND_URL` to your actual frontend domain.

5. **Token expiry**: Adjust `ACCESS_TOKEN_EXPIRE_MINUTES` based on your security requirements.

6. **Rate limiting**: Consider implementing rate limiting for authentication endpoints in production.

## Next Steps

1. **Frontend Integration**: Implement Google Sign-In button in the frontend using `@react-oauth/google`
2. **Token Refresh**: Implement token refresh mechanism for long-lived sessions
3. **Profile Management**: Add endpoints for users to update their profile
4. **Password Authentication**: Add email/password authentication as an alternative
5. **OAuth Providers**: Add support for GitHub, Microsoft, etc.

## Support

For issues or questions, please refer to:
- FastAPI documentation: https://fastapi.tiangolo.com/
- Google Identity documentation: https://developers.google.com/identity
- MongoDB documentation: https://www.mongodb.com/docs/
