# Linkary Backend (FastAPI)

Modern Python-based backend for Linkary knowledge management system.

## Features

- 🚀 **FastAPI**: High-performance async Python web framework
- 🗄️ **MongoDB**: NoSQL database with Motor async driver
- 🔍 **Metadata Extraction**: Automatic extraction from URLs
- 📊 **Knowledge Graph**: Relationship visualization support
- 🤖 **AI-Ready**: Easy integration with AI/ML libraries

## Tech Stack

- **FastAPI**: Web framework
- **Motor**: Async MongoDB driver
- **Pydantic**: Data validation
- **BeautifulSoup4**: HTML parsing for metadata
- **Uvicorn**: ASGI server

## Setup

### 1. Create Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

Create `.env` file:

```
PORT=8000
MONGODB_URI=mongodb://localhost:27017/linkary
ENVIRONMENT=development
```

### 4. Run Server

```bash
# Development (with auto-reload)
python -m app.main

# Or with uvicorn directly
uvicorn app.main:app --reload --port 8000
```

## API Endpoints

### Links

- `GET /api/links` - Get all links
- `GET /api/links/{id}` - Get single link
- `POST /api/links` - Create new link
- `PUT /api/links/{id}` - Update link
- `DELETE /api/links/{id}` - Delete link

### Graph

- `GET /api/links/graph` - Get graph visualization data

### Health

- `GET /health` - Health check

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI application
│   ├── config.py            # Configuration
│   ├── database.py          # MongoDB connection
│   ├── models/              # Database models
│   ├── schemas/             # Pydantic schemas
│   ├── routers/             # API endpoints
│   ├── services/            # Business logic
│   └── utils/               # Utilities
├── requirements.txt         # Python dependencies
├── .env                     # Environment variables
└── README.md
```

## Development

### Adding New Dependencies

```bash
pip install package-name
pip freeze > requirements.txt
```

### Code Style

Follow PEP 8 Python style guide.

## Future Enhancements

- [ ] AI-powered auto-tagging
- [ ] Content summarization
- [ ] Similar link recommendations
- [ ] Full-text search
- [ ] Vector embeddings for semantic search
