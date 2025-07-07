# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a monorepo for "La Pública", a business social network platform with:
- **Backend**: Node.js + Express + TypeScript + MongoDB (la-publica-backend/)
- **Frontend**: React + Vite + TypeScript + Tailwind + shadcn/ui (la-publica-frontend/)

## Development Commands

### Setup
```bash
npm run install:all    # Install dependencies in all projects
```

### Development
```bash
npm run dev            # Run both frontend and backend in development mode
npm run dev:backend    # Run only backend (port 3000)
npm run dev:frontend   # Run only frontend (port 5173)
```

### Build & Production
```bash
npm run build          # Build both projects
npm run start          # Run both in production mode
```

### Backend-specific commands
```bash
cd la-publica-backend
npm run build          # TypeScript compilation
npm run lint           # ESLint validation
npm test               # Jest tests
```

### Frontend-specific commands
```bash
cd la-publica-frontend
npm run build          # Vite build
npm run lint           # ESLint validation
npm run preview        # Preview production build
```

## Architecture Overview

### Backend Architecture
- **Entry point**: `src/server.ts` - Express server with Socket.io, middleware setup, and route mounting
- **Routes pattern**: Each module has separate `.routes.ts` and `.controller.ts` files
- **Models**: Mongoose schemas in `*.model.ts` files (User, Post)
- **Authentication**: JWT-based with middleware in `middleware/auth.ts`
- **Authorization**: Role-based access control (`user`, `admin`) in `middleware/authorize.ts`
- **Configuration**: Environment loading in `config/`, database connection, Cloudinary setup
- **File uploads**: Multer + Cloudinary integration for image handling

### API Structure
- `/api/auth` - Authentication (register, login)
- `/api/users` - User management, social features (follow/unfollow)
- `/api/posts` - Post CRUD, likes, comments, feed
- `/api/search` - Full-text search across users and posts
- `/api/admin` - Admin-only endpoints
- `/api/uploads` - File upload handling

### Frontend Architecture
- **Routing**: React Router with protected routes (`PrivateRoute` component)
- **State**: React Query for server state, localStorage for auth tokens
- **UI**: Tailwind CSS + shadcn/ui components
- **Forms**: React Hook Form with Zod validation
- **Rich text**: TipTap editor for post creation
- **Layout**: Sidebar navigation with responsive design

### Key Features
- JWT authentication with role-based authorization
- Social networking (posts, likes, comments, following)
- File upload with Cloudinary
- Real-time messaging (Socket.io setup)
- Full-text search
- Admin panel functionality
- Profile management with work experience and social links

### Database Models
- **User**: Profile info, work experience, social links, followers/following arrays
- **Post**: Content, author reference, likes array, comments with author references

### Important Implementation Details
- Social links are normalized on frontend (auto-adds https://) and validated on backend
- Follow/unfollow is atomic - updates both users' arrays simultaneously
- All protected routes require `Authorization: Bearer <token>` header
- Frontend uses query invalidation for real-time UI updates
- Post feed is paginated and sorted by creation date

### Testing
- Backend uses Jest with test files in `tests/` directory
- Single health check test exists: `tests/health.test.ts`