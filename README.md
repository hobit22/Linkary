# Linkary

URL을 통해 만드는 나만의 지식 도서관

## Features

- URL 추가, 삭제, 조회
- Obsidian 스타일의 그래프 시각화
- URL 메타데이터 자동 추출
- 링크 간 관계 관리

## Tech Stack

### Frontend
- Next.js
- React
- Graph Visualization (TBD: D3.js / React Flow / Cytoscape.js / Force Graph)

### Backend
- Node.js
- Express

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

### Running the application

```bash
# Run backend (from backend directory)
npm run dev

# Run frontend (from frontend directory)
npm run dev
```

## Development

- Frontend runs on `http://localhost:3000`
- Backend API runs on `http://localhost:5000`
