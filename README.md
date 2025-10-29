# A.S.H.I.Y.A Frontend

Advanced Solar Heuristic Intelligence for Yield Audit - Frontend Application

## Features

- Modern Next.js 14 with TypeScript
- Tailwind CSS for styling
- Axios for API communication
- Responsive design matching the provided UI
- Chat interface with message history
- Sidebar navigation with search functionality

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Main chat page
│   └── pricing/
│       └── page.tsx         # Pricing page (example)
├── components/
│   ├── Sidebar/
│   │   ├── Sidebar.tsx      # Sidebar component with collapse
│   │   └── index.ts         # Export file
│   ├── Header/
│   │   ├── Header.tsx       # Header component
│   │   └── index.ts         # Export file
│   └── Chat/
│       ├── ChatInterface.tsx # Chat message display
│       ├── ChatInput.tsx    # Chat input component
│       └── index.ts         # Export file
├── lib/
│   └── api.ts               # API service with Axios
├── types/
│   └── index.ts             # TypeScript interfaces
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── next.config.js
```

### Component Organization

- **Components**: Reusable UI components organized by feature
- **Types**: Shared TypeScript interfaces and types
- **Pages**: Next.js app router pages (each folder = a route)
- **Lib**: Utility functions and services

## API Configuration

The API service is configured in `lib/api.ts`. Update the base URL and API key as needed:

```typescript
const apiService = new ApiService('http://your-api-url', 'your-api-key');
```

## API Endpoints Expected

- `POST /api/chat` - Send message to LLM
- `GET /api/chat/history` - Get chat history
- `DELETE /api/chat/history` - Clear chat history

## Features Implemented

- ✅ Responsive sidebar with logo and navigation
- ✅ "Start new chat" button with gradient styling
- ✅ Search functionality
- ✅ Chat history display
- ✅ User profile section
- ✅ Main chat interface
- ✅ Message input with send button
- ✅ API integration with Axios
- ✅ Loading states and error handling
- ✅ Disclaimer text

## Adding New Pages

To add new pages (e.g., About, Contact, Settings):

1. Create a new folder in `app/` directory:
```bash
app/about/page.tsx
```

2. Use the same layout structure with Sidebar and Header:
```typescript
'use client';

import Header from '@/components/Header/Header';
import Sidebar from '@/components/Sidebar/Sidebar';
// ... your page content
```

## Customization

- Update colors in `tailwind.config.js`
- Modify API endpoints in `lib/api.ts`
- Customize components in their respective folders
- Add new components in `components/` directory

## Build for Production

```bash
npm run build
npm start
```
