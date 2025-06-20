# ADI CHEATS - Gaming Products Platform

## Overview

ADI CHEATS is a full-stack web application for selling gaming-related products (cheats, panels, and utilities). The system features a dark-themed, gaming-focused interface with real-time chat support, admin management capabilities, and a comprehensive product catalog.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack Query for server state, React Context for auth
- **UI Components**: Radix UI primitives with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom dark theme and gaming aesthetics
- **Build Tool**: Vite with hot module replacement

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Authentication**: Passport.js with local strategy and session-based auth
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Real-time Communication**: WebSocket implementation for live chat
- **API Pattern**: RESTful endpoints with error handling middleware

### Database Architecture
- **ORM**: Drizzle ORM with TypeScript-first approach
- **Database**: PostgreSQL (configured for Neon serverless)
- **Migration Strategy**: Drizzle Kit for schema management
- **Connection**: Connection pooling with @neondatabase/serverless

## Key Components

### Authentication System
- Session-based authentication with secure cookie configuration
- Role-based access control (owner, admin, user)
- Password hashing using Node.js crypto scrypt
- Protected routes with middleware validation

### Product Management
- CRUD operations for gaming products
- Categories: External Panel, Internal Panel, Bypass, Silent Aim, AimKill
- Multi-currency support (USD, INR, BDT)
- Image upload and management capabilities
- Search and filtering functionality

### Real-time Chat System
- WebSocket-based live chat for customer support
- Session persistence with database storage
- Message history and chat session management
- Admin chat monitoring and response capabilities

### Admin Dashboard
- Comprehensive product management interface
- User management with role assignment
- Live chat monitoring and response system
- Announcement management for site-wide notifications
- Real-time statistics and activity monitoring

### UI/UX Features
- Dark gaming theme with red accent colors
- Particle background effects and animations
- Loading screens with progress indicators
- Responsive design for mobile and desktop
- Toast notifications for user feedback

## Data Flow

### User Authentication Flow
1. User submits credentials via login form
2. Passport.js validates credentials against database
3. Session created and stored in PostgreSQL
4. User context updated throughout application
5. Protected routes enforce authentication status

### Product Management Flow
1. Admin creates/updates products through admin interface
2. Form validation using Zod schemas
3. Data persisted to PostgreSQL via Drizzle ORM
4. Real-time updates to product catalog
5. Search and filtering applied client-side

### Chat System Flow
1. User initiates chat session with generated session ID
2. WebSocket connection established between client and server
3. Messages stored in database with session association
4. Admin receives real-time notifications of new chats
5. Chat history persisted and retrievable

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection and pooling
- **drizzle-orm**: Type-safe database operations
- **passport**: Authentication middleware
- **express-session**: Session management
- **ws**: WebSocket implementation

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **@tanstack/react-query**: Server state management
- **react-hook-form**: Form handling and validation
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library

### Development Dependencies
- **vite**: Build tool and development server
- **tsx**: TypeScript execution for development
- **esbuild**: Production bundling
- **drizzle-kit**: Database schema management

## Deployment Strategy

### Build Process
- Client-side: Vite builds React application to `dist/public`
- Server-side: esbuild bundles Express server to `dist/index.js`
- Static assets served from build output directory

### Environment Configuration
- Database URL configuration for PostgreSQL connection
- Session secret for secure cookie signing
- Production/development environment detection
- WebSocket configuration for real-time features

### Hosting Requirements
- Node.js runtime environment
- PostgreSQL database instance
- WebSocket support for real-time chat
- Static file serving capabilities

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- June 20, 2025. Initial setup