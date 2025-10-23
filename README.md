# Linkary

URL을 통해 만드는 나만의 지식 도서관

## Features

- URL 추가, 삭제, 조회
- Obsidian 스타일의 그래프 시각화
- URL 메타데이터 자동 추출
- 링크 간 관계 관리

## Tech Stack

### Frontend
- Next.js 15
- React 18
- TypeScript
- Tailwind CSS
- react-force-graph-2d (Graph visualization)

### Backend
- Node.js
- Express
- Mongoose
- Axios & Cheerio (Metadata extraction)

### Database
- MongoDB

## Project Structure

```
Linkary/
├── frontend/          # Next.js application
├── backend/           # Node.js API server
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/hobit22/Linkary.git
cd Linkary

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### Configuration

Backend `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/linkary
NODE_ENV=development
```

Frontend `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Running the application

```bash
# Start MongoDB (if not already running)
mongod

# Run backend (from backend directory)
cd backend
npm run dev

# Run frontend (from frontend directory, in a new terminal)
cd frontend
npm run dev
```

## Development

- Frontend runs on `http://localhost:3000`
- Backend API runs on `http://localhost:5000`

## API Endpoints

- `GET /api/links` - Get all links
- `GET /api/links/:id` - Get single link
- `POST /api/links` - Create new link
- `PUT /api/links/:id` - Update link
- `DELETE /api/links/:id` - Delete link
- `GET /api/links/graph` - Get graph data for visualization

## Screenshots

### Graph View
Visualize your links as an interactive knowledge graph, similar to Obsidian's graph view.

### List View
Browse all your saved links in a card-based layout with metadata.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
