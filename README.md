# Real-Time Client Project Dashboard

A full-stack project management dashboard with real-time activity feeds, role-based access control, JWT authentication, and background job scheduling.

---

## TEST CREDENTIALS

### Admin
```
Email:    admin@velozity.com
Password: Password@123
```

### Project Managers
```
rahul.pm@velozity.com / Password@123
priya.pm@velozity.com / Password@123
```

### Developers
```
aman.dev@velozity.com / Password@123
neha.dev@velozity.com / Password@123
arjun.dev@velozity.com / Password@123
sneha.dev@velozity.com / Password@123
```

**To create new users:** Login as Admin → Users → Add User

---

## Quick Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Docker & Docker Compose (optional)

### Local Setup

```bash
# Clone repo
git clone <YOUR_REPO_URL>
cd velozityGlobalSolutions

# Backend
cd apps/Backend
npm install

# Create .env
DATABASE_URL="postgresql://user:password@localhost:5432/velozity"
JWT_SECRET="your-secret-key"
REFRESH_TOKEN_SECRET="your-refresh-secret"
PORT=5000
FRONTEND_URL="http://localhost:5173"

# Setup database
npx prisma generate
npx prisma migrate deploy
npx prisma db seed

# Run backend
npm run dev  # runs on http://localhost:5000

# Frontend (new terminal)
cd apps/Frontend
npm install

# Create .env
VITE_API_URL="http://localhost:5000"

# Run frontend
npm run dev  # runs on http://localhost:5173
```

### Docker Setup

```bash
docker compose up --build
docker exec velozity-backend npx prisma db seed
```

---

## Tech Stack

- **Frontend:** React 18 + TypeScript + Socket.IO Client
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Real-time:** Socket.IO (WebSocket)
- **Jobs:** node-cron (overdue task scheduler)
- **Auth:** JWT + HttpOnly Cookies + bcrypt

---

## Architecture Decisions

### 1. Why Socket.IO?
- Event-based communication
- Auto-reconnect + fallback support
- Room-based filtering (only send to authorized users)
- Cleaner than raw WebSocket

### 2. Why node-cron?
- Simple, no extra infrastructure needed
- Good enough for current scale
- Trade-off: Not distributed (use Bull + Redis for multi-instance)

### 3. Refresh Token in HttpOnly Cookie
- XSS-proof (JavaScript can't access)
- CSRF-safe with SameSite flag
- Raw token never stored (hash only in DB)

### 4. Role-Based Access Control at API Level
- Backend validates all access (not just frontend)
- Example: Developer can't access other dev's tasks even with modified token

---

## Database Schema

### Core Models
- **User** (id, email, passwordHash, role, isActive)
- **Project** (id, name, createdById)
- **Task** (id, projectId, assignedToId, status, priority, dueDate, isOverdue)
- **ActivityLog** (id, taskId, projectId, userId, oldStatus, newStatus, createdAt)
- **Notification** (id, userId, type, isRead)
- **RefreshToken** (id, userId, tokenHash, expiresAt, revokedAt)

### Key Constraints
- `User.email` - UNIQUE
- `ProjectMember(projectId, userId)` - UNIQUE
- Indexes on: projectId, assignedToId, status, priority, dueDate, userId

---

## API Endpoints

```
Authentication
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout

Projects
GET    /api/projects
POST   /api/projects
PATCH  /api/projects/:id
DELETE /api/projects/:id

Tasks
GET    /api/tasks
POST   /api/tasks
PATCH  /api/tasks/:id
PATCH  /api/tasks/:id/status

Activities
GET    /api/activities  (last 20, role-filtered)

Notifications
GET    /api/notifications
PATCH  /api/notifications/:id/read
PATCH  /api/notifications/read-all

Dashboard
GET    /api/dashboard  (role-specific stats)
```

---

## Real-Time Features

### Socket.IO Rooms
- `user-{userId}` - User notifications
- `project-{projectId}` - Project activity
- `admin-feed` - Global activity (admin only)

### Flows
**Task Assignment:**
```
PM creates task + assigns dev
  ↓
Notification saved to DB
  ↓
Socket.IO emits to user-{devId}
  ↓
Developer sees notification instantly
```

**Status Update:**
```
Developer updates task status
  ↓
Backend validates permission
  ↓
Task + ActivityLog updated
  ↓
Socket.IO emits to project room
  ↓
PM sees update in real-time
```

**Offline Recovery:**
```
Frontend calls GET /api/activities/missed
  ↓
Backend returns last 20 authorized activities
  ↓
User sees what happened while offline
```

---

## Testing RBAC

### Admin Test
1. Login as `admin@velozity.com`
2. Verify: Can create PM/Dev, see all projects/tasks, view global activity

### PM Test
1. Login as `rahul.pm@velozity.com`
2. Create project → only they can access it
3. Try accessing another PM's project → 403 Forbidden

### Developer Test
1. Login as `aman.dev@velozity.com`
2. See only assigned tasks
3. Try accessing another dev's task → 403 Forbidden

### Real-Time Test
1. Open two browser windows (PM + Dev)
2. PM assigns task to Dev
3. Dev's window shows notification instantly (no refresh)
4. Dev updates task status
5. PM's window updates activity instantly

---

## Background Jobs

**Overdue Task Scheduler (node-cron)**
- Runs every minute
- Finds tasks where dueDate < NOW() and isOverdue = false
- Updates isOverdue = true
- Independent of UI (not on-demand)

---

## Deployment

### Current
- Frontend: https://velocityglobalsolutions-f.onrender.com
- Backend: https://velocityglobalsolutions.onrender.com

### Deploy to Render

**Backend:**
1. Push to GitHub
2. Create Web Service on Render
3. Connect repo + set env vars
4. Deploy

**Frontend:**
1. Update `VITE_API_URL` to production backend
2. Create Static Site on Render
3. Build command: `npm run build`
4. Deploy

---

## Known Limitations

- **Single-server Socket.IO** — Doesn't scale horizontally (needs Redis adapter)
- **node-cron limitation** — Runs in each backend instance (use Bull for multi-instance)
- **No email notifications** — In-app only
- **Single task assignment** — One dev per task
- **No audit trail** — Admin actions not logged

---

## Security

**Implemented:**
- Passwords hashed with bcrypt
- JWT short-lived (15min access token)
- Refresh tokens: separate secret + HttpOnly + hash storage
- API-level role validation
- No secrets hardcoded (use .env)
- CORS configured

---

## Build & Verify

```bash
# Frontend
cd apps/Frontend
npm run build

# Backend
cd apps/Backend
npm run build
```

---

## Project Structure

```
velozityGlobalSolutions/
├── apps/
│   ├── Backend/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts
│   │   └── src/
│   │       ├── controller/
│   │       ├── middleware/
│   │       ├── routes/
│   │       ├── services/
│   │       ├── socket/
│   │       └── validators/
│   └── Frontend/
│       └── src/
│           ├── context/
│           ├── pages/
│           └── socket/
└── docker-compose.yml
```

---

## Seed Data

The seed script creates:
- 1 Admin
- 2 Project Managers
- 4 Developers
- 3 Projects with 15+ tasks
- 2 Overdue tasks
- Activity log entries
- Sample notifications

Run: `npx prisma db seed`

---

## Author

**Shivam Joshi**  
GitHub: https://github.com/Sj14122004  
LinkedIn: https://www.linkedin.com/in/shivam-joshi-35a657401

---

## License

Portfolio project for learning purposes.