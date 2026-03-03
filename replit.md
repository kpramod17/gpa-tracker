# Overview

This is a full-stack web application for managing academic terms and courses with GPA tracking capabilities. The application allows users to create academic terms (semesters), add courses to those terms, and automatically calculate both term-specific and cumulative GPAs. It features a modern, responsive UI with data visualization components including GPA progression charts and statistics dashboards.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript for type safety and modern component development
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: Comprehensive design system built on Radix UI primitives with shadcn/ui styling
- **Styling**: Tailwind CSS with CSS variables for theming support, including dark mode capabilities
- **Form Management**: React Hook Form with Zod validation for type-safe form handling

## Backend Architecture
- **Runtime**: Node.js with Express.js framework for RESTful API development
- **Language**: TypeScript throughout the stack for consistency and type safety
- **API Design**: RESTful endpoints following conventional HTTP methods and status codes
- **Data Storage**: In-memory storage implementation with interface-based design allowing for easy database integration
- **Validation**: Zod schemas shared between frontend and backend for consistent data validation

## Database Design
- **ORM**: Drizzle ORM configured for PostgreSQL with type-safe schema definitions
- **Schema**: Two main entities - Terms and Courses with foreign key relationships
- **Migration Strategy**: Drizzle Kit for database migrations and schema management
- **Data Modeling**: Strongly typed schema with proper relationships and constraints

## Build and Development
- **Bundler**: Vite for fast development and optimized production builds
- **Development Server**: Hot module replacement and error overlay for enhanced developer experience
- **Production Build**: Separate client and server builds with esbuild for server bundling
- **Asset Management**: Vite handles static assets with proper optimization and caching

## Key Features
- **GPA Calculation**: Automated GPA calculations using standard 4.0 scale with grade point mappings
- **Data Visualization**: Interactive charts showing GPA progression over time
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Real-time Updates**: Optimistic updates and automatic cache invalidation
- **Form Validation**: Client and server-side validation with user-friendly error messages

# External Dependencies

## UI and Styling
- **Radix UI**: Comprehensive set of accessible, unstyled UI primitives for components like dialogs, dropdowns, and form controls
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Lucide React**: Modern icon library with consistent design
- **Class Variance Authority**: Type-safe component variants and styling
- **Date-fns**: Date manipulation and formatting utilities

## Data Management
- **TanStack React Query**: Powerful data synchronization for server state management
- **Drizzle ORM**: Type-safe SQL ORM with excellent TypeScript integration
- **Neon Database**: PostgreSQL-compatible serverless database platform
- **Zod**: TypeScript-first schema declaration and validation library

## Development Tools
- **Vite**: Next-generation frontend build tool with fast HMR
- **TypeScript**: Static type checking throughout the application
- **React Hook Form**: Performant forms with easy validation
- **Wouter**: Minimalist routing library for React applications

## Runtime Dependencies
- **Express.js**: Web application framework for Node.js
- **React**: UI library for building user interfaces
- **React DOM**: DOM-specific methods for React applications