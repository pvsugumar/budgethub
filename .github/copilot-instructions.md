# Budget Planning Application - Copilot Instructions

## Project Overview
A full-stack budget planning web application built with Next.js, TypeScript, and PostgreSQL. Inspired by Rocket Money and Mint, designed for scalability and large customer bases.

## Tech Stack
- **Frontend**: Next.js 14+ with TypeScript, React, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Email/Password + Google OAuth
- **Deployment**: Production-ready for AWS/Vercel

## Core Features
1. **Transaction Tracking**: Log income and expenses with automatic categorization
2. **Budget Categories**: Create budgets with spending limits per category
3. **Dashboard**: Real-time overview of finances, spending trends, and analytics
4. **Bill Reminders**: Set up recurring bills and get reminders
5. **Savings Goals**: Track progress toward financial goals

## Project Structure
```
src/
  app/
    api/          - API routes (transactions, budgets, auth)
    auth/         - Authentication pages
    dashboard/    - Main dashboard
    settings/     - User settings
    layout.tsx    - Root layout
  components/     - Reusable React components
  lib/
    db/          - Database utilities and schemas
    auth/        - Authentication logic
    api-utils/   - API helpers
  types/          - TypeScript types and interfaces
public/          - Static assets
prisma/
  schema.prisma  - Database schema
```

## Development Guidelines
- Use TypeScript for all code
- Follow component-based architecture
- Implement proper error handling and validation
- Use Tailwind CSS for styling
- Keep API routes in /app/api directory
- Ensure all async operations handle errors properly

## Setup Instructions
1. Install Node.js 18+ (if not already installed)
2. Install dependencies: `npm install`
3. Set up database: `npm run db:setup`
4. Create `.env.local` with required environment variables
5. Run development server: `npm run dev`
6. Open http://localhost:3000

## Database Setup
- Uses PostgreSQL with Prisma ORM
- Run migrations: `npx prisma migrate dev`
- Generate Prisma client: `npx prisma generate`

## Environment Variables
```
DATABASE_URL=postgresql://user:password@localhost:5432/budget_db
NEXTAUTH_SECRET=your_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_URL=http://localhost:3000
```

## Key Development Tasks
- Setup authentication flow
- Create database schemas for users, transactions, budgets
- Build dashboard UI and data visualization
- Implement API routes for CRUD operations
- Add form validation and error handling
- Setup bill reminder notifications
- Create analytics and reporting features
