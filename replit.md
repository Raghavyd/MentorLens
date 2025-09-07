# MentorLens - Student Analytics Platform

## Overview

MentorLens is a comprehensive student analytics platform designed to monitor student progress and assess risk levels through data visualization and tracking. The application provides educators with tools to upload student data via CSV files, view detailed analytics through charts and tables, and manage student interventions and alerts. The platform focuses on identifying at-risk students through attendance rates, score averages, and comprehensive risk assessment metrics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built using React with TypeScript, utilizing a modern component-based architecture. The application uses Wouter for client-side routing, providing navigation between dashboard, student detail, and upload pages. State management is handled through TanStack Query for server state and React's built-in hooks for local state. The UI is constructed with shadcn/ui components built on top of Radix UI primitives, providing a consistent and accessible design system with Tailwind CSS for styling.

### Backend Architecture
The backend follows a RESTful Express.js server architecture with TypeScript. The server implements a modular route-based structure with centralized error handling middleware. Database operations are abstracted through a storage interface pattern, promoting separation of concerns and testability. The API provides endpoints for student CRUD operations, file uploads, authentication, and data analytics.

### Authentication System
The application implements Replit's OAuth authentication system using OpenID Connect. Session management is handled through express-session with PostgreSQL session storage via connect-pg-simple. The authentication flow includes passport.js strategy configuration and middleware for protecting routes. User sessions are persistent with configurable TTL and secure cookie settings.

### Database Design
The data layer uses Drizzle ORM with PostgreSQL, providing type-safe database operations. The schema includes tables for users, students, alerts, interventions, score history, and attendance history. The database design supports relational data with proper foreign key constraints and indexing for performance. Session storage is handled through a dedicated sessions table for authentication persistence.

### File Processing System
CSV file upload functionality is implemented using multer for multipart form handling. The system includes file validation, parsing with csv-parse library, and preview generation before final import. Error handling ensures data integrity and provides user feedback for validation issues.

### Data Visualization
Charts and analytics are powered by Recharts library, providing interactive line charts for attendance and score tracking. The visualization system supports responsive design and real-time data updates through the query system.

## External Dependencies

### Database and ORM
- **PostgreSQL**: Primary database using Neon serverless for cloud hosting
- **Drizzle ORM**: Type-safe database operations with migration support
- **drizzle-kit**: Schema management and database migrations

### Authentication
- **Replit OAuth**: OpenID Connect authentication provider
- **Passport.js**: Authentication middleware with openid-client strategy
- **express-session**: Session management with PostgreSQL storage

### Frontend Libraries
- **React**: Core UI framework with TypeScript support
- **TanStack Query**: Server state management and caching
- **Wouter**: Lightweight client-side routing
- **shadcn/ui**: Component library built on Radix UI primitives
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Recharts**: Data visualization and charting library

### Backend Framework
- **Express.js**: Web application framework
- **multer**: File upload handling middleware
- **csv-parse**: CSV file parsing and validation

### Development Tools
- **Vite**: Build tool with hot module replacement
- **TypeScript**: Type safety across the entire stack
- **ESBuild**: Fast JavaScript bundler for production builds