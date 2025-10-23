# Linkary Backend

Node.js + Express + MongoDB backend for Linkary

## API Endpoints

### Links

- `GET /api/links` - Get all links
- `GET /api/links/:id` - Get single link
- `POST /api/links` - Create new link
- `PUT /api/links/:id` - Update link
- `DELETE /api/links/:id` - Delete link
- `GET /api/links/graph` - Get graph data for visualization

### Health Check

- `GET /health` - Server health check

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file in the backend directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/linkary
NODE_ENV=development
```

## Running the server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## API Usage Examples

### Create a new link

```bash
curl -X POST http://localhost:5000/api/links \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "tags": ["example", "test"],
    "category": "Reference",
    "notes": "Example website"
  }'
```

### Get all links

```bash
curl http://localhost:5000/api/links
```

### Get graph data

```bash
curl http://localhost:5000/api/links/graph
```

### Update a link

```bash
curl -X PUT http://localhost:5000/api/links/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "tags": ["updated"],
    "relatedLinks": ["{relatedLinkId}"]
  }'
```

### Delete a link

```bash
curl -X DELETE http://localhost:5000/api/links/{id}
```
