# Real-Time Client Project Dashboard

A role-based project and task management dashboard with real-time activity feeds, notifications, JWT authentication, and scheduled overdue-task processing.

---

## TEST CREDENTIALS (Quick Start)

### ADMIN ACCOUNT (Full Access)

```
Email:    admin@velozity.com
Password: Password@123
```

**Admin can:**
- View entire system
- Create Project Managers
- Create Developers
- Manage all users
- View all projects, tasks, and global activity

**To Create New Credentials:**
1. Login as Admin
2. Go to Users section
3. Click "Add User"
4. Select role (Project Manager or Developer)
5. Set email and password
6. New credentials will be active immediately

---

### PROJECT MANAGER ACCOUNTS (Project Management)

**PM #1:**
```
Email:    rahul.pm@velozity.com
Password: Password@123
```

**PM #2:**
```
Email:    priya.pm@velozity.com
Password: Password@123
```

**Project Managers can:**
- Create and manage their own projects
- Create and assign tasks to developers
- Update task status
- View project-specific activity and notifications

---

### DEVELOPER ACCOUNTS (Task Execution)

**Developer #1:**
```
Email:    aman.dev@velozity.com
Password: Password@123
```

**Developer #2:**
```
Email:    neha.dev@velozity.com
Password: Password@123
```

**Developer #3:**
```
Email:    arjun.dev@velozity.com
Password: Password@123
```

**Developer #4:**
```
Email:    sneha.dev@velozity.com
Password: Password@123
```

**Developers can:**
- View assigned tasks only
- Update task status
- Receive task assignment notifications
- View activity on their tasks only

---

## Overview

The Real-Time Client Project Dashboard is a full-stack project management application designed around three roles:

- **Admin** - System administration and user management
- **Project Manager** - Project and task creation/management
- **Developer** - Task execution and status updates

The system allows project managers to manage their projects and assign tasks to developers. Developers can work on their assigned tasks and update task statuses.

The main focus of the application is the real-time activity and notification system. Task assignments and status changes are persisted in PostgreSQL and relevant users receive updates through Socket.IO without having to refresh the page.

---

## Main Features

### Authentication
- JWT-based authentication
- Short-lived access tokens
- Refresh token flow
- Refresh token stored in an HttpOnly cookie
- Refresh tokens stored as hashes in the database
- Separate refresh-token secret
- Logout and token revocation
- Active/inactive user handling

### Role-Based Access Control

**Admin**
- Global access to the system
- Create Project Managers and Developers
- View all projects, tasks, and activity
- Manage all users and system settings

**Project Manager**
- Work only with projects they created
- Create and manage tasks
- Assign tasks to developers
- View project-specific activity
- Cannot access other PMs' projects

**Developer**
- View only assigned tasks
- Update status of assigned tasks
- Receive task notifications
- View activity on assigned tasks only
- Cannot access other developers' tasks

Backend validates access — not just frontend hiding

---

## Task Management

Each task contains:
- Task title and description
- Project assignment
- Assigned developer
- Status (TO_DO / IN_PROGRESS / IN_REVIEW / DONE)
- Priority (LOW / MEDIUM / HIGH / CRITICAL)
- Due date
- Overdue state
- Creation and update timestamps

### Status Change Logging
Every status change is stored in the activity log with:
- User who made the change
- Previous status
- New status
- Timestamp
- Task and project reference

---

## Notifications

Notifications are persisted in PostgreSQL and delivered through Socket.IO.

**Supported notification types:**
- TASK_ASSIGNED — When developer is assigned a task
- TASK_MOVED_TO_REVIEW — When task moves to In Review status

**Features:**
- Persistent storage in database
- Real-time delivery via Socket.IO
- Unread notification count
- Mark individual notifications as read
- Mark all notifications as read

---

## Real-Time System

Socket.IO is used for real-time communication.

**Socket.IO Rooms:**
- `user-{userId}` — User-specific notifications
- `project-{projectId}` — Project-specific events
- `admin-feed` — Global admin activity

**Authorization:**
- Users can only join rooms they're authorized for
- PMs join their project rooms
- Admins access all project rooms
- Developers join task-specific updates

---

## Real-Time Task Assignment Flow

```
Project Manager
      ↓
POST /api/tasks (with assignment)
      ↓
Task saved in PostgreSQL
      ↓
Notification created
      ↓
Socket.IO emits to user-{developerId}
      ↓
Developer's browser updates
      ↓
No page refresh needed
```

---

## Real-Time Status Update Flow

```
Developer updates task status
      ↓
PATCH /api/tasks/:id/status
      ↓
Validate permissions (Backend)
      ↓
Task updated in database
      ↓
ActivityLog entry created
      ↓
Notification created (if needed)
      ↓
Socket.IO emits to project room
      ↓
All authorized users see update
```

---

## Architectural Decisions

### 1. Why Socket.IO?

Socket.IO was selected over native WebSocket for:

- **Event-based communication** — Easy message types and handlers
- **Automatic reconnection** — Dashboard users may lose connection temporarily
- **Room-based filtering** — Deliver updates only to authorized users
- **Simple integration** — Cleaner API than raw WebSocket
- **Fallback support** — Works if WebSocket unavailable

**Trade-off:** Socket.IO adds overhead compared to raw WebSocket, but simplicity wins for this project scale.

### 2. Why node-cron Instead of Bull/BullMQ?

The project uses **node-cron** for the overdue-task background job.

**Requirements:**
- Periodically check tasks
- Find tasks past due date
- Mark them as overdue

**Why node-cron:**
- Simple scheduler, easy to understand
- No additional infrastructure needed
- Sufficient for current project scale

**Trade-off:** Not a distributed system. In multi-instance deployment, each instance would run the job. Use Bull/BullMQ + Redis for larger scale.

### 3. Refresh Token Storage

- **Access tokens** — Short-lived, in memory
- **Refresh tokens** — Long-lived, stored in HttpOnly cookie
- **Database storage** — Token hash only (never raw token)

**Why HttpOnly cookie:**
- JavaScript cannot access it (XSS protection)
- Automatic with every request (CSRF-safe with SameSite)
- Separate secret and expiration

**Validation flow:**
1. Client sends refresh token in cookie
2. Backend verifies token signature
3. Backend checks hash against database
4. Backend checks expiration and revocation status
5. New access token issued

### 4. Frontend State Management

Uses **React Context** instead of Redux/Zustand:

- **AuthContext** — User, access token, notifications, unread count
- **Component state** — Page-specific data
- **Socket.IO events** — Real-time updates (not state management)

**Why:**
- Simpler, fewer dependencies
- Sufficient for authentication + notification sharing
- Socket.IO handles real-time without state complexity

---

## API-Level RBAC

**Role restrictions enforced at backend API level**, not just frontend.

Frontend restrictions are UX, not security.

**Access checks:**

| Role | Can Access | Cannot Access |
|------|-----------|----------------|
| Admin | All projects, all tasks, all activity | Nothing |
| PM | Own projects + tasks | Other PMs' projects |
| Developer | Assigned tasks only | Other devs' tasks, projects, activity |

**Example:** Logged-in Developer tries to hit `GET /api/projects/999/tasks`
- If Developer is assigned to that project's tasks → allowed
- Otherwise → 403 Forbidden (backend rejects)

---

## Real-Time Role-Filtered Activity Feed

Activities are delivered only to users authorized to see them.

**Admin Feed:**
```
All activities across all projects
Receives: global-admin events
```

**Project Manager Feed:**
```
Activities from projects createdById = currentUser.id
Receives: project-{projectId} events (own projects only)
```

**Developer Feed:**
```
Activities from tasks assignedToId = currentUser.id
Receives: task-specific updates (assigned tasks only)
```

**Enforcement:**
- Backend filters activities by user role
- Socket.IO room membership enforced
- REST API also applies same filters

---

## Missed Event Catch-Up

If user goes offline or connection drops:

```
Connection lost
      ↓
Activities continue stored in database
      ↓
User reconnects
      ↓
Frontend requests /api/activities/missed
      ↓
Backend identifies user
      ↓
Backend applies role-based filters
      ↓
Latest 20 authorized activities returned
      ↓
Frontend displays missed events
```

**Database is source of truth** — Socket.IO is live delivery mechanism.

---

## Overdue Task Background Job

Overdue tasks are **not** marked only when dashboard opens.

**node-cron job runs every minute:**

```
Check all tasks where:
  - dueDate < NOW()
  - isOverdue = false
      ↓
Update to:
  - isOverdue = true
      ↓
Broadcast update via Socket.IO
```

Task state is independent of user page loads.

---

## Database

**Technologies:**
- PostgreSQL (relational)
- Prisma ORM (type-safe queries)

**Core Models:**
- User
- Project
- ProjectMember
- Task
- ActivityLog
- Notification
- RefreshToken

---

## Database Schema

### User
```
id (Primary Key)
name
email (UNIQUE)
passwordHash
role (ADMIN | PROJECT_MANAGER | DEVELOPER)
isActive
createdAt
updatedAt
```

**Relationships:**
- One user → many projects (createdProjects)
- One user → many tasks (assignedTasks)
- One user → many activity logs
- One user → many notifications
- One user → many refresh tokens

### Project
```
id (Primary Key)
name
description
createdById (Foreign Key → User)
createdAt
updatedAt
```

**Relationships:**
- One project → many tasks
- One project → many project members
- One project → many activity logs

### ProjectMember
```
id (Primary Key)
projectId (Foreign Key → Project)
userId (Foreign Key → User)
joinedAt
```

**Constraint:** `(projectId, userId)` UNIQUE — no duplicates

### Task
```
id (Primary Key)
projectId (Foreign Key → Project)
title
description
assignedToId (Foreign Key → User)
status (TO_DO | IN_PROGRESS | IN_REVIEW | DONE)
priority (LOW | MEDIUM | HIGH | CRITICAL)
dueDate
isOverdue (default: false)
createdAt
updatedAt
```

**Relationships:**
- One task → many activity logs

### ActivityLog
```
id (Primary Key)
taskId (Foreign Key → Task)
projectId (Foreign Key → Project)
userId (Foreign Key → User)
oldStatus
newStatus
createdAt
```

### Notification
```
id (Primary Key)
userId (Foreign Key → User)
type (TASK_ASSIGNED | TASK_MOVED_TO_REVIEW)
message
taskId (Foreign Key → Task, nullable)
isRead
createdAt
readAt (nullable)
```

### RefreshToken
```
id (Primary Key)
userId (Foreign Key → User)
tokenHash (UNIQUE)
expiresAt
revokedAt (nullable)
createdAt
```

---

## Database Relationships

```
User
 ├── createdProjects ────────→ Project
 ├── projectMembers ─────────→ ProjectMember → Project
 ├── assignedTasks ──────────→ Task → Project
 ├── activities ─────────────→ ActivityLog
 ├── notifications ──────────→ Notification
 └── refreshTokens ─────────→ RefreshToken

Project
 ├── createdBy ──────────────→ User
 ├── members ────────────────→ ProjectMember → User
 ├── tasks ──────────────────→ Task
 └── activityLogs ───────────→ ActivityLog

Task
 ├── project ────────────────→ Project
 ├── assignedTo ─────────────→ User
 └── activityLogs ───────────→ ActivityLog
```

---

## Database Constraints & Indexes

**Unique Constraints:**
- `User.email` — No duplicate emails
- `ProjectMember(projectId, userId)` — User added once per project
- `RefreshToken.tokenHash` — Token hash unique

**Indexes (for frequently queried columns):**
- `Project.createdById` — Filter projects by creator
- `Task.projectId` — Filter tasks by project
- `Task.assignedToId` — Filter tasks by developer
- `Task.status` — Filter by status (dashboard)
- `Task.priority` — Filter by priority
- `Task.dueDate` — Filter by date range
- `Task.isOverdue` — Filter overdue tasks
- `Notification.userId` — Filter notifications
- `Notification.isRead` — Unread count

---

## Tech Stack

**Frontend**
- React 18+
- TypeScript
- React Router
- Axios
- Socket.IO Client
- CSS Modules / Tailwind

**Backend**
- Node.js 18+
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- Socket.IO
- Zod (validation)
- JWT (jsonwebtoken)
- bcrypt (password hashing)
- node-cron (scheduler)
- cookie-parser

**DevOps**
- Docker
- Docker Compose
- Git
- GitHub

---

## Project Structure

```
velozityGlobalSolutions/
│
├── apps/
│   ├── Backend/
│   │   ├── prisma/
│   │   │   ├── migrations/
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts
│   │   │
│   │   └── src/
│   │       ├── config/          (DB, env config)
│   │       ├── controller/       (Route handlers)
│   │       ├── jobs/             (node-cron jobs)
│   │       ├── lib/              (Utilities)
│   │       ├── middleware/       (Auth, RBAC)
│   │       ├── routes/           (API routes)
│   │       ├── services/         (Business logic)
│   │       ├── socket/           (Socket.IO handlers)
│   │       ├── utils/            (Helpers)
│   │       └── validators/       (Zod schemas)
│   │
│   └── Frontend/
│       └── src/
│           ├── context/          (Auth, Socket context)
│           ├── pages/            (Route pages)
│           │   ├── admin/
│           │   ├── developer/
│           │   ├── projectManager/
│           │   └── components/   (Shared components)
│           ├── socket/           (Socket.IO client)
│           ├── App.tsx
│           └── main.tsx
│
└── README.md
```

---

## Local Setup

### Prerequisites

```
Node.js 18+
npm or yarn
PostgreSQL 14+
Git
Docker & Docker Compose (optional)
```

### 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/velozityGlobalSolutions.git
cd velozityGlobalSolutions
```

### 2. Backend Setup

```bash
cd apps/Backend
npm install
```

### 3. Environment Variables

Create `apps/Backend/.env`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/velozity"

# JWT Secrets (use strong random strings)
JWT_SECRET="your-super-secret-jwt-key-change-this"
REFRESH_TOKEN_SECRET="your-super-secret-refresh-key-change-this"

# Server
PORT=5000

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:5173"
```

Never commit .env file

### 4. Prisma Setup

Generate Prisma Client:
```bash
npx prisma generate
```

Apply migrations:
```bash
npx prisma migrate deploy
```

For development (creates new migrations):
```bash
npx prisma migrate dev
```

### 5. Seed Database

```bash
npx prisma db seed
```

Creates:
- 1 Admin
- 2 Project Managers
- 4 Developers
- 3 Projects with 15+ tasks
- 2 Overdue tasks
- Activity log entries
- Notifications

### 6. Start Backend

```bash
npm run dev
```

Backend runs on: http://localhost:5000

### 7. Frontend Setup

Open new terminal:

```bash
cd apps/Frontend
npm install
```

Create `apps/Frontend/.env`:

```env
VITE_API_URL="http://localhost:5000"
```

Start frontend:

```bash
npm run dev
```

Frontend runs on: http://localhost:5173

---

## Docker Setup

Start all services:

```bash
docker compose up --build
```

Run in background:

```bash
docker compose up --build -d
```

Stop containers:

```bash
docker compose down
```

### With Docker:

1. PostgreSQL runs automatically
2. Backend runs on port 5000
3. Frontend runs on port 5173
4. All services connected

Apply migrations inside container:
```bash
docker exec velozity-backend npx prisma migrate deploy
docker exec velozity-backend npx prisma db seed
```

---

## Deployment

### Current Deployment

- Frontend: https://velocityglobalsolutions-f.onrender.com
- Backend: https://velocityglobalsolutions.onrender.com

### Deploy to Render

#### Backend
1. Push code to GitHub
2. Create new Web Service on Render
3. Connect GitHub repo
4. Set environment variables (DATABASE_URL, JWT_SECRET, etc.)
5. Deploy

#### Frontend
1. Set `VITE_API_URL` to production backend URL
2. Create new Static Site on Render
3. Connect GitHub repo
4. Set Build Command: `npm run build`
5. Deploy

---

## API Endpoints

### Authentication
```
POST   /api/auth/login          (email, password)
POST   /api/auth/refresh        (auto from cookie)
POST   /api/auth/logout         (revoke token)
```

### Projects
```
GET    /api/projects            (all, filtered by role)
GET    /api/projects/:id        (single project)
POST   /api/projects            (create, PM/Admin only)
PATCH  /api/projects/:id        (update, owner only)
DELETE /api/projects/:id        (delete, owner only)
```

### Tasks
```
GET    /api/tasks               (filtered by role)
GET    /api/tasks/:id           (single task)
POST   /api/tasks               (create, PM only)
PATCH  /api/tasks/:id           (update, owner only)
PATCH  /api/tasks/:id/status    (change status)
DELETE /api/tasks/:id           (delete, owner only)
```

### Activities
```
GET    /api/activities          (filtered by role, last 20)
```

### Notifications
```
GET    /api/notifications                (all, unread first)
GET    /api/notifications/unread-count   (count badge)
PATCH  /api/notifications/:id/read       (mark read)
PATCH  /api/notifications/read-all       (mark all read)
```

### Dashboard
```
GET    /api/dashboard           (stats, filtered by role)
```

---

## How to Test RBAC

### Test Admin

1. Open browser incognito window
2. Login: admin@velozity.com / Password@123
3. Verify Admin can:
   - View global dashboard with all stats
   - Go to Users → Create new PM or Developer
   - View all projects and tasks
   - View global activity feed
   - See all online users

### Test Project Manager

1. Open new incognito window
2. Login: rahul.pm@velozity.com / Password@123
3. Verify PM can:
   - Create a new project
   - View own projects only
   - Create task and assign developer
   - Update task status
   - View own project activity
4. Try accessing another PM's project:
   - Backend rejects with 403

### Test Developer

1. Open third incognito window
2. Login: aman.dev@velozity.com / Password@123
3. Verify Developer can:
   - View only assigned tasks
   - Change task status
   - Receive task assignment notification
   - View activity on assigned tasks
4. Try accessing another dev's task:
   - Backend rejects with 403

### Test Real-Time Updates

1. Open two browser windows (side by side)
2. Login to one as PM, one as Developer
3. PM assigns task to Developer
4. Developer's window shows notification immediately (no refresh)
5. Developer updates task status
6. PM's window updates activity feed immediately

---

## Example End-to-End Workflow

### Step 1: Create Project
```
Admin/PM logs in
   ↓
Creates project "Client X Website"
   ↓
Project saved to PostgreSQL
   ↓
Listed in PM dashboard
```

### Step 2: Assign Task
```
PM creates task "Homepage Design"
   ↓
Selects developer "Aman"
   ↓
Task saved
   ↓
Notification created
   ↓
Socket.IO emits to user-aman
   ↓
Aman's browser shows notification
   ↓
(No page refresh!)
```

### Step 3: Update Status
```
Aman opens task
   ↓
Changes status: TO_DO → IN_PROGRESS
   ↓
PATCH /api/tasks/:id/status
   ↓
Backend validates permission
   ↓
Task updated
   ↓
ActivityLog entry created
   ↓
Socket.IO emits to project room
   ↓
PM sees update in real-time
   ↓
Activity shows: "Aman moved Homepage Design: TO_DO → IN_PROGRESS"
```

### Step 4: Connection Lost
```
Developer's WiFi drops
   ↓
Activities continue in database
   ↓
Developer reconnects
   ↓
Frontend calls /api/activities/missed
   ↓
Backend returns last 20 authorized activities
   ↓
Developer sees what happened while offline
```

---

## Known Limitations

### Single-Server Socket.IO
Current architecture assumes single backend instance. For horizontal scaling, add Redis adapter.

### node-cron Scalability
Job runs in each backend instance. Use Bull + Redis for multi-instance deployments.

### No Email Notifications
Notifications only in-app. Email delivery not implemented.

### Single Task Assignment
Tasks assigned to one developer. Project can have multiple members.

### No Distributed Message Broker
Uses Socket.IO only. No Redis for scaling WebSocket across servers.

### No Audit Trail
Admin actions (user creation, deletion) not logged. Consider adding for production.

---

## Performance Considerations

**Database Indexing:**
- Project ownership lookups
- Task filtering by status, priority, due date
- Notification unread counts
- Activity queries limited to 20 records

**Query Optimization:**
- Select only needed fields
- Avoid N+1 queries via Prisma relations
- Batch notifications where possible

**Frontend:**
- Lazy load pages
- Cache static assets
- Debounce real-time updates

---

## Security Considerations

**Implemented:**
- Passwords hashed with bcrypt
- JWT access tokens short-lived (15min)
- Refresh tokens separate secret + HttpOnly
- Raw refresh tokens never stored (hash only)
- All API endpoints require authentication
- Role authorization at backend API level
- Project ownership validated
- Developer task ownership validated
- Secrets in .env (never hardcoded)
- CORS explicitly configured
- Refresh token revocation on logout

**To Add for Production:**
- HTTPS only
- Rate limiting
- Input sanitization
- SQL injection prevention (Prisma prevents this)
- CSRF tokens if needed
- Admin audit logging
- Email verification for new accounts

---

## Validation & Error Handling

**Request Validation:**
- Request bodies (Zod schemas)
- Query parameters
- Route parameters
- Task status enum validation
- Priority enum validation
- Email format validation

**Error Responses:**
```json
{
  "success": false,
  "message": "Unauthorized access to project",
  "error": "FORBIDDEN"
}
```

No stack traces exposed to clients.

---

## Build Verification

Before deployment, verify both builds succeed:

**Frontend:**
```bash
cd apps/Frontend
npm run build
```

**Backend:**
```bash
cd apps/Backend
npm run build
```

---

## Architectural Summary

**Layered Full-Stack Architecture:**

1. **React Frontend**
   - User interface and local component state
   - Authentication + notifications via React Context
   - REST APIs for CRUD operations
   - Socket.IO for real-time events

2. **Express Backend**
   - Routing, controllers, service layer
   - Validation (Zod schemas)
   - Authentication middleware (JWT)
   - Role-based authorization (enforced)
   - Socket.IO event handlers

3. **PostgreSQL Database**
   - Persistent source of truth
   - Activity logs and notifications
   - Refresh token hashes
   - Proper indexing and constraints

4. **Real-Time Communication**
   - Socket.IO with room-based filtering
   - Authorized access only
   - Missed event catch-up via REST

5. **Background Jobs**
   - node-cron scheduler
   - Overdue task processing
   - Independent of UI events

---

## Final Testing Checklist

### Authentication
- [ ] Admin login works
- [ ] PM login works
- [ ] Developer login works
- [ ] Access token works and expires
- [ ] Refresh token works (from cookie)
- [ ] Logout revokes token
- [ ] Inactive users rejected

### Admin Features
- [ ] Admin dashboard shows global stats
- [ ] Admin can create PM
- [ ] Admin can create Developer
- [ ] Admin can manage user status
- [ ] Admin can view all projects/tasks
- [ ] Admin sees global activity

### Project Manager Features
- [ ] PM dashboard shows personal stats
- [ ] PM can create project
- [ ] PM can view own projects only
- [ ] PM can delete own project
- [ ] PM can create task
- [ ] PM can assign developer
- [ ] PM can update task
- [ ] PM cannot access another PM's project (403)
- [ ] PM receives relevant notifications

### Developer Features
- [ ] Developer dashboard shows assigned tasks
- [ ] Developer sees only assigned tasks
- [ ] Developer can change task status
- [ ] Developer cannot modify another dev's task (403)
- [ ] Developer receives assignment notification
- [ ] Developer activity filtered correctly

### Real-Time Features
- [ ] Socket.IO connects after login
- [ ] Task assignment notification appears instantly
- [ ] Notification count updates live
- [ ] Task status update appears instantly
- [ ] Activity feed updates without refresh
- [ ] Offline → online: missed events loaded
- [ ] Admin sees online user count

### Background Jobs
- [ ] Overdue job runs every minute
- [ ] Past-due tasks marked overdue
- [ ] Overdue state independent of page refresh

### Deployment
- [ ] Frontend prod build succeeds
- [ ] Backend prod build succeeds
- [ ] Database migrations work
- [ ] Seed script works
- [ ] CORS configured correctly
- [ ] Socket.IO works in prod
- [ ] Environment variables set

---

## Author

**Shivam Joshi**  
Full Stack Developer  
GitHub: https://github.com/Sj14122004  
LinkedIn: https://www.linkedin.com/in/shivam-joshi-35a657401

---

## License

This project is intended for demonstration, learning, and portfolio purposes.

Built with love using:
- React + TypeScript
- Node.js + Express
- PostgreSQL + Prisma
- Socket.IO
- JWT Authentication

---

**Last Updated:** September 2026  
**Current Version:** 1.0.0
