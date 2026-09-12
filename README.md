# Velozity Client Project Dashboard

A real-time client project management dashboard with role-based access control, task management, live activity updates, notifications, and automated overdue-task detection.

## Overview

The Velozity Client Project Dashboard is a full-stack web application designed to manage clients, projects, developers, tasks, and real-time project activity.

The application provides different capabilities based on the authenticated user's role:

- Admin
- Project Manager
- Developer

The system uses JWT authentication, PostgreSQL, Prisma ORM, REST APIs, and WebSocket-based real-time communication.

## Features

- JWT-based authentication
- Access and refresh token authentication
- HttpOnly refresh-token cookie
- Role-based access control
- Admin dashboard
- Project Manager dashboard
- Developer dashboard
- Project management
- Task management
- Task status tracking
- Task priority management
- Task assignment
- Activity history
- Real-time activity updates
- Real-time notifications
- Online user presence
- Automated overdue-task detection
- Server-side request validation
- PostgreSQL relational database
- Prisma ORM

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- CSS

### Backend

- Node.js
- Express
- TypeScript
- Socket.IO
- Zod
- JWT
- bcrypt
- node-cron

### Database

- PostgreSQL
- Prisma ORM

### Development & Deployment

- Git
- GitHub/GitLab
- Docker
- Vercel

## Project Architecture

```text
Frontend
   |
   | REST API
   | WebSocket
   v
Express Backend
   |
   +---- Authentication
   +---- RBAC
   +---- Project Management
   +---- Task Management
   +---- Notifications
   +---- Activity Feed
   +---- Dashboard
   +---- Overdue Task Scheduler
   |
   v
PostgreSQL