# Backend Architecture Documentation

## Overview

The Linkary backend has been restructured to follow FastAPI and Python best practices, implementing a clean architecture with clear separation of concerns and scalable organization.

## Directory Structure

```
backend/
├── app/
│   ├── __init__.py                 # Application package init
│   ├── main.py                     # FastAPI app initialization & entry point
│   │
│   ├── core/                       # Core application configuration
│   │   ├── __init__.py
│   │   ├── config.py              # Pydantic Settings configuration
│   │   ├── database.py            # MongoDB connection management
│   │   ├── exceptions.py          # Custom exception classes
│   │   └── constants.py           # Application constants & enums
│   │
│   ├── api/                        # API layer
│   │   ├── __init__.py
│   │   └── v1/                    # API version 1
│   │       ├── __init__.py
│   │       ├── router.py          # API v1 router aggregation
│   │       └── endpoints/         # Endpoint handlers
│   │           ├── __init__.py
│   │           ├── links.py       # Link endpoints
│   │           └── health.py      # Health check endpoint
│   │
│   ├── models/                     # Domain/database models
│   │   ├── __init__.py
│   │   └── link.py                # Link MongoDB model
│   │
│   ├── schemas/                    # Pydantic schemas (DTOs)
│   │   ├── __init__.py
│   │   ├── link.py                # Link request/response schemas
│   │   └── common.py              # Common schemas (responses, etc.)
│   │
│   ├── services/                   # Business logic layer
│   │   ├── __init__.py
│   │   ├── link_service.py        # Link business logic
│   │   └── metadata.py            # Metadata extraction service
│   │
│   ├── repositories/               # Data access layer
│   │   ├── __init__.py
│   │   └── link_repository.py     # Link database operations
│   │
│   ├── utils/                      # Utility functions
│   │   ├── __init__.py
│   │   └── helpers.py             # Helper functions (transformations)
│   │
│   └── middleware/                 # Custom middleware
│       └── __init__.py
│
├── tests/                          # Test suite
│   ├── __init__.py
│   ├── conftest.py                # Pytest configuration & fixtures
│   └── api/
│       └── v1/
│           └── test_links.py      # Link endpoint tests (future)
│
├── requirements.txt                # Python dependencies
└── .env                           # Environment configuration

```

## Architecture Layers

### 1. Core Layer (`app/core/`)

**Purpose**: Application-wide configuration, database connections, and shared utilities.

**Components**:
- `config.py`: Pydantic Settings for environment configuration
- `database.py`: MongoDB connection lifecycle management
- `exceptions.py`: Custom exception classes and HTTP exception helpers
- `constants.py`: Application constants, enums (CategoryEnum), magic values

**Key Features**:
- Centralized configuration with type validation
- Global database connection management
- Reusable exception classes for better error handling

### 2. API Layer (`app/api/`)

**Purpose**: HTTP endpoint handlers with API versioning support.

**Structure**:
- Organized by API version (currently v1)
- Endpoints grouped by domain (links, health)
- Router aggregation at version level

**Key Features**:
- API versioning ready (easy to add v2, v3)
- Clear endpoint organization
- Dependency injection for services
- Proper HTTP status codes and error handling

### 3. Models Layer (`app/models/`)

**Purpose**: Domain models representing MongoDB document structure.

**Components**:
- `link.py`: LinkModel with PyObjectId support

**Key Features**:
- Pydantic models for validation
- Custom ObjectId handling
- Field defaults and constraints

### 4. Schemas Layer (`app/schemas/`)

**Purpose**: Request/response validation and serialization (DTOs - Data Transfer Objects).

**Components**:
- `link.py`: LinkCreate, LinkUpdate, LinkResponse, GraphNode, GraphEdge, GraphData
- `common.py`: SuccessResponse, ErrorResponse, HealthCheckResponse

**Key Features**:
- Separation from database models
- Field aliasing (snake_case ↔ camelCase)
- Type-safe API contracts

### 5. Services Layer (`app/services/`)

**Purpose**: Business logic implementation, orchestrates repositories and external services.

**Components**:
- `link_service.py`: Link CRUD business logic, validation, orchestration
- `metadata.py`: URL metadata extraction

**Key Features**:
- Business rule enforcement
- Transaction coordination
- Exception handling with custom exceptions
- Service composition

### 6. Repositories Layer (`app/repositories/`)

**Purpose**: Data access abstraction, database operations.

**Components**:
- `link_repository.py`: Link database CRUD operations

**Key Features**:
- Encapsulates database operations
- Async/await MongoDB operations
- Reusable query methods
- Easier testing (can mock repositories)

### 7. Utils Layer (`app/utils/`)

**Purpose**: Helper functions and utilities.

**Components**:
- `helpers.py`: Data transformation functions (e.g., `link_document_to_dict`)

**Key Features**:
- Pure functions
- Reusable across layers
- Data format conversions

### 8. Middleware Layer (`app/middleware/`)

**Purpose**: Custom middleware for request/response processing.

**Current Status**: Placeholder for future middleware (authentication, logging, etc.)

## Data Flow

### Request Flow (GET /api/links/{id})
```
1. Client Request
   ↓
2. API Endpoint (app/api/v1/endpoints/links.py)
   - Route: @router.get("/{link_id}")
   - Dependency Injection: get_link_service()
   ↓
3. Service Layer (app/services/link_service.py)
   - Business logic: validate ID, check existence
   - Exception handling
   ↓
4. Repository Layer (app/repositories/link_repository.py)
   - Database query: find_by_id()
   ↓
5. MongoDB
   - Returns document
   ↓
6. Service → Utils (app/utils/helpers.py)
   - Transform: link_document_to_dict()
   ↓
7. API Response
   - JSON: {"success": true, "data": {...}}
```

### Create Flow (POST /api/links)
```
1. Client Request (LinkCreate schema)
   ↓
2. API Endpoint
   - Validation: Pydantic schema
   - Dependency: get_link_service()
   ↓
3. Service Layer
   - Check duplicate (repository.exists_by_url)
   - Extract metadata (metadata_extractor.extract)
   - Prepare document
   ↓
4. Repository Layer
   - Create document
   ↓
5. MongoDB
   - Insert and return
   ↓
6. Service → Utils
   - Transform response
   ↓
7. API Response (201 Created)
```

## Key Design Patterns

### 1. Dependency Injection
```python
def get_link_service() -> LinkService:
    db = get_database()
    repository = LinkRepository(db)
    return LinkService(repository)

@router.get("/")
async def get_links(service: LinkService = Depends(get_link_service)):
    # Use service
```

**Benefits**:
- Testability (easy to mock)
- Loose coupling
- Clear dependencies

### 2. Repository Pattern
```python
# Repository handles all database operations
repository = LinkRepository(database)
links = await repository.find_all()
```

**Benefits**:
- Database abstraction
- Reusable queries
- Easier testing and swapping databases

### 3. Service Layer Pattern
```python
# Service orchestrates business logic
service = LinkService(repository)
link = await service.create_link(link_data)
```

**Benefits**:
- Business logic centralization
- Transaction management
- Validation enforcement

### 4. Custom Exceptions
```python
try:
    link = await service.get_link_by_id(link_id)
except LinkNotFoundException as e:
    raise link_not_found_exception(e.link_id)
```

**Benefits**:
- Clear error handling
- Consistent error responses
- Better debugging

## API Versioning

The API is versioned at the URL level:
- Current: `/api/links` (v1 implicit)
- Future: Can add `/api/v2/links` without breaking v1

To add a new API version:
1. Create `app/api/v2/` directory
2. Copy and modify endpoints
3. Update `main.py` to include v2 router

## Configuration Management

Environment variables (`.env`):
```bash
PORT=8000
MONGODB_URI=mongodb://localhost:27017/linkary
ENVIRONMENT=development
```

Accessed via:
```python
from app.core.config import get_settings
settings = get_settings()
```

## Testing Strategy

### Test Structure
- Unit tests: Test individual functions/methods
- Integration tests: Test API endpoints with test database
- Use pytest fixtures for database and client setup

### Running Tests
```bash
pytest tests/
```

## Migration from Old Structure

### What Changed

**Old Structure**:
```
app/
├── main.py
├── config.py
├── database.py
├── routers/
│   └── links.py  (mixed concerns: routing + business logic + DB ops)
├── models/
│   └── link.py
├── schemas/
│   └── link.py
├── services/
│   └── metadata.py
└── utils/
```

**Issues**:
1. Business logic in routers
2. Direct database calls in routers
3. No API versioning
4. Helper functions in routers
5. No repository pattern
6. Mixed responsibilities

**New Structure**: See above

### Breaking Changes

**None** - All API endpoints remain the same:
- `GET /api/links` - Get all links
- `GET /api/links/{id}` - Get single link
- `POST /api/links` - Create link
- `PUT /api/links/{id}` - Update link
- `DELETE /api/links/{id}` - Delete link
- `GET /api/links/graph` - Get graph data
- `GET /health` - Health check

### Import Updates

Old imports:
```python
from app.config import get_settings
from app.database import get_database
from app.routers import links
```

New imports:
```python
from app.core.config import get_settings
from app.core.database import get_database
from app.api.v1.router import api_v1_router
```

## Best Practices Implemented

1. **Separation of Concerns**: Each layer has a single responsibility
2. **Dependency Injection**: Services and repositories injected via FastAPI Depends
3. **Custom Exceptions**: Type-safe error handling
4. **Constants Management**: No magic strings, centralized in constants.py
5. **Type Hints**: Full type annotations throughout
6. **Async/Await**: Proper async database operations
7. **Docstrings**: Comprehensive documentation for all modules and functions
8. **API Versioning**: Ready for future versions
9. **Repository Pattern**: Database abstraction
10. **Service Layer**: Business logic separation

## Future Enhancements

1. **Authentication**: Add JWT authentication middleware
2. **Caching**: Redis integration for frequently accessed data
3. **Pagination**: Add pagination schemas and repository methods
4. **Logging**: Structured logging with correlation IDs
5. **Metrics**: Prometheus metrics endpoints
6. **Rate Limiting**: Request rate limiting middleware
7. **Background Tasks**: Celery integration for async jobs
8. **Search**: Full-text search with MongoDB Atlas Search
9. **Webhooks**: Event-driven architecture
10. **API Documentation**: Enhanced OpenAPI documentation with examples

## Performance Considerations

1. **Connection Pooling**: Motor handles connection pooling automatically
2. **Async Operations**: All database operations are async
3. **Indexing**: Add MongoDB indexes for frequently queried fields
4. **Caching**: Use `@lru_cache` for settings (already implemented)
5. **Lazy Loading**: Only load data when needed

## Security Considerations

1. **Input Validation**: Pydantic schemas validate all inputs
2. **ObjectId Validation**: Check ObjectId validity before queries
3. **CORS**: Currently allows all origins (restrict in production)
4. **Environment Variables**: Sensitive data in .env (not committed)
5. **SQL Injection**: N/A (using MongoDB, but ObjectId validation prevents injection)

## Monitoring and Debugging

1. **Logs**: Print statements in database.py (enhance with proper logging)
2. **FastAPI Docs**: Available at `/docs` (Swagger UI)
3. **Error Responses**: Consistent JSON error format
4. **Health Check**: `/health` endpoint for monitoring

## Conclusion

The new architecture provides:
- ✅ Better code organization
- ✅ Clear separation of concerns
- ✅ Easier testing
- ✅ Scalability for future features
- ✅ Industry best practices
- ✅ Maintainability
- ✅ Type safety
- ✅ API versioning support
