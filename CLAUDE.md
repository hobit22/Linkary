# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Linkary is a knowledge library application that lets users create a personal collection of URLs with Obsidian-style graph visualization. The system automatically extracts metadata from URLs and allows users to define relationships between links.

**Tech Stack:**
- Frontend: Next.js 15, React 18, TypeScript, Tailwind CSS, react-force-graph-2d
- Backend: FastAPI (Python), Motor (async MongoDB driver), Pydantic
- Database: MongoDB

**Important:** The README mentions Node.js/Express backend, but the actual implementation uses FastAPI/Python. The backend was refactored from Node.js to Python (see commit: e9adb6c).

## Development Setup

### Prerequisites
- Python 3.13+ (backend uses venv)
- Node.js 18+ (frontend)
- MongoDB 7.0

### Starting the Development Environment

**Option 1: Using Docker (MongoDB only)**
```bash
# Start MongoDB
docker-compose up -d
```

**Option 2: Full Manual Setup**

1. **Backend (from backend/ directory):**
```bash
# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run development server (auto-reload enabled)
python -m app.main
# OR
uvicorn app.main:app --reload --port 8000
```

2. **Frontend (from frontend/ directory):**
```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

### Environment Configuration

**Backend `.env`** (required):
```
PORT=8000
MONGODB_URI=mongodb://localhost:27017/linkary
ENVIRONMENT=development
```

**Frontend `.env.local`**:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Default Ports
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs (Swagger): http://localhost:8000/docs
- MongoDB: localhost:27017

## Architecture

### Backend Structure (FastAPI)

The backend follows a clean architecture pattern with separation of concerns:

```
backend/app/
├── main.py           # FastAPI app, CORS, lifespan events, router registration
├── config.py         # Pydantic Settings with env loading
├── database.py       # Motor async MongoDB client, connection management
├── models/           # MongoDB document models (Pydantic BaseModel)
├── schemas/          # API request/response schemas (Pydantic)
├── routers/          # API endpoint handlers
├── services/         # Business logic (e.g., metadata extraction)
└── utils/            # Shared utilities
```

**Key Architecture Points:**

1. **Async MongoDB with Motor**: All database operations use async/await. Use `get_database()` to get the database instance.

2. **Lifespan Management**: MongoDB connection is established on app startup and closed on shutdown via the `lifespan` context manager in main.py:13-19.

3. **Data Flow**:
   - Router receives request → validates via Pydantic schema
   - Router calls service (if needed) for business logic
   - Service/router interacts with MongoDB via Motor
   - Response formatted using `link_helper()` to convert MongoDB docs to API response format

4. **ObjectId Handling**: MongoDB ObjectIds are converted to strings in API responses. The `PyObjectId` custom type in models/link.py handles Pydantic validation. Always use `ObjectId.is_valid()` before querying.

5. **Metadata Extraction**: When creating links, the system automatically fetches and extracts metadata (title, description, favicon, image) from the URL using BeautifulSoup4 (services/metadata.py).

### Frontend Structure (Next.js 15)

```
frontend/
├── app/
│   ├── page.tsx         # Main page: manages state, view switching (graph/list)
│   ├── layout.tsx       # Root layout with metadata
│   └── globals.css      # Tailwind + global styles
├── components/
│   ├── KnowledgeGraph.tsx  # react-force-graph-2d visualization
│   ├── AddLinkForm.tsx     # Form to create new links
│   └── LinkList.tsx        # Card-based list view
└── lib/
    └── api.ts           # Axios-based API client, type definitions
```

**Key Architecture Points:**

1. **Client-Side Only**: All components use `'use client'` directive (Next.js App Router).

2. **State Management**: Main page (page.tsx) manages state for both graph and list views. Data fetching happens in `fetchData()` which is called on mount and after mutations.

3. **API Integration**: All backend communication goes through `lib/api.ts`. The API client uses axios and returns typed responses.

4. **Graph Visualization**: KnowledgeGraph.tsx uses react-force-graph-2d. Node clicks open URLs in new tabs.

### API Endpoints

All endpoints return JSON with structure: `{ success: boolean, data?: any, count?: number }`

- `GET /api/links` - Get all links
- `GET /api/links/{id}` - Get single link
- `POST /api/links` - Create link (auto-extracts metadata)
- `PUT /api/links/{id}` - Update link
- `DELETE /api/links/{id}` - Delete link
- `GET /api/links/graph` - Get graph data (nodes + edges)
- `GET /health` - Health check

**Note**: The `/api/links/graph` route MUST be defined before `GET /api/links/{id}` in the router to avoid path collision (FastAPI matches routes in order).

## Common Tasks

### Adding Backend Dependencies
```bash
cd backend
source venv/bin/activate
pip install <package-name>
pip freeze > requirements.txt
```

### Adding Frontend Dependencies
```bash
cd frontend
npm install <package-name>
```

### Database Access

MongoDB database name: `linkary`
Collection: `links`

Direct MongoDB access (if needed):
```bash
docker exec -it linkary-mongodb mongosh
use linkary
db.links.find()
```

### Testing API Endpoints

Use FastAPI's built-in Swagger UI at http://localhost:8000/docs or use curl:

```bash
# Health check
curl http://localhost:8000/health

# Get all links
curl http://localhost:8000/api/links

# Create link
curl -X POST http://localhost:8000/api/links \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "tags": ["example"], "category": "Tech"}'
```

## Code Conventions

### Backend (Python)
- Follow PEP 8 style guide
- Use async/await for all database operations
- Use Pydantic models for validation
- Convert ObjectIds to strings in API responses using `link_helper()`
- Always validate ObjectId strings before database queries

### Frontend (TypeScript)
- Use TypeScript for type safety
- Define interfaces in lib/api.ts for shared types
- Use Tailwind CSS for styling (utility-first approach)
- Handle loading/error states in components

## Known Issues / Gotchas

1. **README is outdated**: Documentation mentions Node.js/Express backend but actual implementation is FastAPI/Python.

2. **Port Configuration**: Backend runs on port 8000 (not 5000 as mentioned in old README).

3. **CORS**: Currently set to allow all origins (`allow_origins=["*"]`). Should be restricted in production.

4. **Date/Time Fields**: Backend uses `datetime.utcnow()` but this is deprecated in Python 3.12+. Consider migrating to `datetime.now(timezone.utc)`.

5. **Field Name Mapping**: MongoDB uses snake_case (`related_links`, `created_at`) but API returns camelCase (`relatedLinks`, `createdAt`). The `link_helper()` function handles this conversion.
