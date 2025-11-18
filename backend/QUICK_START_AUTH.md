# Quick Start: Google OAuth Authentication

## 🚀 5-Minute Setup

### 1. Get Google Client ID (2 minutes)

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID (Web application)
3. Add `http://localhost:3000` to Authorized JavaScript origins
4. Copy the Client ID

### 2. Configure Backend (1 minute)

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
JWT_SECRET_KEY=$(openssl rand -hex 32)
```

### 3. Start Services (1 minute)

```bash
# Terminal 1: Start MongoDB
docker-compose up -d

# Terminal 2: Start Backend
cd backend
python -m app.main
```

### 4. Test Authentication (1 minute)

Visit http://localhost:8000/docs and test the endpoints!

## 📝 Environment Variables

**Required:**
- `GOOGLE_CLIENT_ID` - From Google Cloud Console
- `JWT_SECRET_KEY` - Generate with: `openssl rand -hex 32`

**Optional (have defaults):**
- `MONGODB_URI` - Default: `mongodb://localhost:27017/linkary`
- `PORT` - Default: `8000`
- `FRONTEND_URL` - Default: `http://localhost:3000`

## 🔑 API Endpoints

### Login
```bash
POST /api/auth/google
Body: { "credential": "google_token" }
Response: { "access_token": "jwt", "user": {...} }
```

### Get Current User
```bash
GET /api/auth/me
Header: Authorization: Bearer <token>
```

### Use Protected Endpoints
```bash
# All /api/links endpoints now require:
Header: Authorization: Bearer <token>
```

## 🧪 Quick Test

```bash
# 1. Get a token (replace GOOGLE_TOKEN with real token from frontend)
curl -X POST http://localhost:8000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"credential": "GOOGLE_TOKEN"}'

# 2. Use the token
TOKEN="<access_token_from_above>"

curl http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

curl http://localhost:8000/api/links \
  -H "Authorization: Bearer $TOKEN"
```

## 📚 Full Documentation

- Setup Guide: [AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md)
- Implementation Details: [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

## ⚠️ Migration (If you have existing data)

```bash
# View what would change
python migrate_add_user_id.py --dry-run

# Apply migration
python migrate_add_user_id.py
```

## 🐛 Common Issues

**"Token verification failed"**
→ Check GOOGLE_CLIENT_ID is correct

**"Not authenticated"**
→ Add `Authorization: Bearer <token>` header

**"No users found"**
→ Login via `/api/auth/google` first

## 🎯 Next Steps

1. Integrate Google Sign-In button in frontend
2. Store JWT token in localStorage
3. Add Authorization header to all API requests
4. Handle 401 errors (redirect to login)

See [AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md) for frontend integration guide.
