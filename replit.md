# QR Patrol System

## Overview
A full-stack React/Express application for security patrol management using QR codes. The system allows security officers to scan QR codes at patrol points and track their patrol activities.

## Architecture
- **Frontend**: React with TypeScript, Vite dev server, Tailwind CSS
- **Backend**: Express.js server with PostgreSQL database
- **Development**: Frontend (port 5000) with proxy to backend (port 3001)
- **Production**: Single server serves both API and static files

## Recent Changes (September 29, 2025)
- ✅ Installed Node.js dependencies and configured development environment
- ✅ Set up proper package.json with frontend and backend dependencies
- ✅ Configured Vite development server on port 5000 with proxy to backend
- ✅ Set up Express backend server on port 3001
- ✅ Created workflows for both frontend and backend development
- ✅ Configured deployment settings for production
- ⚠️ **DATABASE REQUIRED**: PostgreSQL database needs to be created manually

## Database Setup Required
⚠️ **Important**: The application requires a PostgreSQL database to function fully. To set this up:

1. In the Replit workspace, go to the "Tool dock" on the left
2. Select "All tools" → "Database" (or search for "Replit Database")
3. Click "Create a database"
4. The database will be automatically connected via environment variables

The backend server will automatically create the required tables when it connects to the database.

## Current Status
- ✅ Frontend development server running on port 5000
- ✅ Backend API server running on port 3001  
- ✅ Application interface loads correctly
- ✅ Navigation and routing working
- ⚠️ API calls failing due to missing database (expected until database is created)

## Development Workflow
- Frontend: React development server with hot reload
- Backend: Express server with automatic database schema initialization
- Both services run simultaneously via configured workflows

## Project Structure
- `/components/` - React UI components
- `/pages/` - Main application pages (Dashboard, Setup, Patrol, Reports)
- `/services/` - API client for backend communication
- `/contexts/` - React context providers
- `server.js` - Express backend server
- `vite.config.ts` - Frontend build configuration

## Next Steps
1. Create PostgreSQL database through Replit's database tool
2. Test full application functionality with database connected
3. Deploy to production when ready