# Linkary Frontend

Next.js + React + TypeScript frontend for Linkary

## Features

- Obsidian-style knowledge graph visualization
- URL management (add, delete, view)
- Automatic metadata extraction display
- Dark mode support
- Responsive design

## Tech Stack

- Next.js 15
- React 18
- TypeScript
- Tailwind CSS
- react-force-graph-2d for graph visualization
- Axios for API calls

## Installation

```bash
npm install
```

## Configuration

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Running the application

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Main page
│   └── globals.css      # Global styles
├── components/
│   ├── KnowledgeGraph.tsx  # Graph visualization
│   ├── AddLinkForm.tsx     # Form to add links
│   └── LinkList.tsx        # List view of links
├── lib/
│   └── api.ts           # API client
└── public/              # Static assets
```

## Usage

1. Start the backend server first
2. Run the frontend with `npm run dev`
3. Open `http://localhost:3000`
4. Add URLs using the form on the left
5. Switch between Graph View and List View
6. Click on nodes in the graph to open URLs
