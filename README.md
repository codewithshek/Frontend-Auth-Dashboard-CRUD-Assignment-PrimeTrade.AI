# Frontend Developer Intern Assignment

## Tech Stack

- **Frontend**: Next.js 14, TailwindCSS, TypeScript
- **Backend**: Node.js, Express.js, MongoDB
- **Authentication**: JWT, bcryptjs

## Setup Instructions

### Prerequisites

- Node.js (v18+)
- MongoDB (Local or Cloud)

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server` directory (already created):
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/primetrade-assignment
   JWT_SECRET=your_jwt_secret
   ```
4. Start the server:
   ```bash
   npm run dev
   # or
   node src/app.js
   ```

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## API Documentation

The API is versioned at `/api/v1`.

### Auth

- `POST /api/v1/auth/signup`: Register a new user.
- `POST /api/v1/auth/login`: Login user and get token.
- `GET /api/v1/auth/user`: Get current user info.

### User

- `GET /api/v1/me`: Get current user profile.
- `PUT /api/v1/me`: Update current user profile.

### Tasks

- `GET /api/v1/tasks`: Get all tasks (supports `?status=` and `?search=`).
- `POST /api/v1/tasks`: Create a new task.
- `GET /api/v1/tasks/:id`: Get a specific task.
- `PUT /api/v1/tasks/:id`: Update a task.
- `DELETE /api/v1/tasks/:id`: Delete a task.

## Scalability Note

To scale this for production:

1. **Database**: Indexing frequently queried fields (e.g., `userId`, `status`). Use a managed DB (Atlas/AWS RDS).
2. **Caching**: Implement Redis for caching user sessions or frequent task lookups.
3. **Load Balancing**: Use Nginx or cloud load balancers to distribute traffic across multiple server instances.
4. **Environment**: Strict separation of Dev/Staging/Prod env vars.
5. **Deployment**: Containerize with Docker, orchestrate with Kubernetes or use PaaS like Vercel (Front) + Render/Heroku (Back).
# Frontend-Auth-Dashboard-CRUD-Assignment-PrimeTrade.AI
