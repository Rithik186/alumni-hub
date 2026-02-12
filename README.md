# Smart Alumni Association & Management Platform

## Project Structure

This project follows a MERN stack (PostgreSQL instead of Mongo) architecture with MVC pattern for the backend.

### Backend (`/backend`)
- **Node.js** + **Express** + **PostgreSQL**
- **MVC Approach**:
  - `src/config/`: Database configuration (PostgreSQL connection).
  - `src/controllers/`: Business logic for Auth, Alumni, Student, and Admin features.
  - `src/middleware/`: Authentication (JWT) and Role-Based Access Control (RBAC).
  - `src/models/`: SQL Schema definitions (see `schema.sql`).
  - `src/routes/`: API routes definitions.
  - `src/utils/`: Helper functions.
  - `server.js`: Entry point.

### Frontend (`/frontend`)
- **React** + **Vite** + **Tailwind CSS**
- **Structure**:
  - `src/components/`: Reusable UI components.
  - `src/pages/`: Page views (Home, Profile, Dashboard).
  - `src/context/`: React Context (Auth, Theme).
  - `src/hooks/`: Custom hooks.
  - `src/services/`: API calls (axios/fetch).

## Getting Started

1. **Backend**:
   ```bash
   cd backend
   npm install
   # Set up .env with your PostgreSQL credentials
   npm run dev
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Features Implemented (Backend Structure)
- **Auth**: Register/Login with JWT.
- **Roles**: Student, Alumni, Admin.
- **Alumni**: Profile management, mentorship toggle.
- **Student**: Search alumni, send requests.
- **Admin**: Approve users, post announcements.
