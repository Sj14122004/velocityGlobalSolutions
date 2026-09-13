# Velozity Client Project Dashboard

A real-time client project management dashboard with role-based access control, task management, live activity updates, notifications, and automated overdue-task detection.

## Admin Login Credentials

Use the following credentials to access the Admin Dashboard:

- Email: `admin@velozity.com`
- Password: `Password@123`


> These credentials are provided for local development/demo purposes only. Do not use these credentials in a production environment.

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
- API-level authorization
- Admin dashboard
- Project Manager dashboard
- Developer dashboard
- Project management
- Task management
- Task status tracking
- Task priority management
- Task assignment
- Persistent activity history
- Real-time activity updates
- Real-time notifications
- Online user presence
- Missed activity event catch-up
- Automated overdue-task detection
- Server-side request validation
- Structured API error responses
- PostgreSQL relational database
- Prisma ORM
- Database indexes for frequently queried fields

## User Roles

### Admin

Admin users have full access to the organization.

- View and manage users
- View all projects
- Manage projects
- View all tasks
- View global activity
- View notifications
- Monitor online users

### Project Manager

Project Managers can manage the projects they create.

- Create projects
- Manage their own projects
- Create and manage tasks
- Assign developers to tasks
- View activity for their projects
- Receive notifications when assigned tasks move to review

### Developer

Developers have access only to their assigned work.

- View assigned tasks
- View task details
- Update the status of assigned tasks
- Receive task assignment notifications
- Receive real-time task and notification updates

Developers cannot access another developer's tasks or Project Manager data through protected API endpoints.

## Task Status

Tasks support the following statuses:

- To Do
- In Progress
- In Review
- Done

Every task status change is persisted in the database with:

- Previous status
- New status
- User who made the change
- Timestamp
- Task
- Project

## Task Priority

Tasks support four priority levels:

- Low
- Medium
- High
- Critical

## Real-Time Activity Feed

The application uses Socket.IO for real-time communication.

When a task status changes:

1. The change is persisted in PostgreSQL.
2. An activity log is created.
3. Authorized connected users receive the update through WebSocket.
4. Notifications are generated when required.
5. Users returning after being offline can retrieve recent activity from the database.

Example activity:

```text
Ravi moved Implement Authentication from In Progress → In Review · 2 mins ago