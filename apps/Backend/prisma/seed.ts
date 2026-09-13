import { prisma } from "../src/lib/prisma.js";
import { hashPassword } from "../src/utils/password.js";

async function main() {
  console.log("Starting database seed...");

  // Clear existing data
  await prisma.notification.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  console.log("Existing data cleared");

  // Create password hash
  const passwordHash = await hashPassword("Password@123");

  // Create admin
  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@velozity.com",
      passwordHash,
      role: "ADMIN",
    },
  });

  // Create project managers
  const pm1 = await prisma.user.create({
    data: {
      name: "Rahul Sharma",
      email: "rahul.pm@velozity.com",
      passwordHash,
      role: "PROJECT_MANAGER",
    },
  });

  const pm2 = await prisma.user.create({
    data: {
      name: "Priya Singh",
      email: "priya.pm@velozity.com",
      passwordHash,
      role: "PROJECT_MANAGER",
    },
  });

  // Create developers
  const dev1 = await prisma.user.create({
    data: {
      name: "Aman Kumar",
      email: "aman.dev@velozity.com",
      passwordHash,
      role: "DEVELOPER",
    },
  });

  const dev2 = await prisma.user.create({
    data: {
      name: "Neha Verma",
      email: "neha.dev@velozity.com",
      passwordHash,
      role: "DEVELOPER",
    },
  });

  const dev3 = await prisma.user.create({
    data: {
      name: "Arjun Patel",
      email: "arjun.dev@velozity.com",
      passwordHash,
      role: "DEVELOPER",
    },
  });

  const dev4 = await prisma.user.create({
    data: {
      name: "Sneha Joshi",
      email: "sneha.dev@velozity.com",
      passwordHash,
      role: "DEVELOPER",
    },
  });

  console.log("Users created");

  const daysAgo = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  };

  const daysFromNow = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  };

  // Create projects
  const project1 = await prisma.project.create({
    data: {
      name: "Velozity Employee Portal",
      description: "Employee management and internal operations platform",
      createdById: pm1.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: "E-Commerce Platform",
      description: "Full-stack e-commerce application",
      createdById: pm1.id,
    },
  });

  const project3 = await prisma.project.create({
    data: {
      name: "Project Management Dashboard",
      description: "Internal project and task management system",
      createdById: pm2.id,
    },
  });

  console.log("Projects created");

  // Add project members
  await prisma.projectMember.createMany({
    data: [
      { projectId: project1.id, userId: pm1.id },
      { projectId: project1.id, userId: dev1.id },
      { projectId: project1.id, userId: dev2.id },

      { projectId: project2.id, userId: pm1.id },
      { projectId: project2.id, userId: dev2.id },
      { projectId: project2.id, userId: dev3.id },

      { projectId: project3.id, userId: pm2.id },
      { projectId: project3.id, userId: dev1.id },
      { projectId: project3.id, userId: dev4.id },
    ],
  });

  console.log("Project members created");

  // Project 1 tasks
  const p1Task1 = await prisma.task.create({
    data: {
      projectId: project1.id,
      title: "Design employee dashboard",
      description: "Create dashboard UI for employee management",
      assignedToId: dev1.id,
      status: "DONE",
      priority: "HIGH",
      dueDate: daysAgo(5),
    },
  });

  const p1Task2 = await prisma.task.create({
    data: {
      projectId: project1.id,
      title: "Implement employee authentication",
      description: "Implement JWT based authentication",
      assignedToId: dev2.id,
      status: "IN_PROGRESS",
      priority: "CRITICAL",
      dueDate: daysFromNow(3),
    },
  });

  const p1Task3 = await prisma.task.create({
    data: {
      projectId: project1.id,
      title: "Create employee profile API",
      description: "Build REST APIs for employee profiles",
      assignedToId: dev1.id,
      status: "IN_REVIEW",
      priority: "HIGH",
      dueDate: daysFromNow(2),
    },
  });

  const p1Task4 = await prisma.task.create({
    data: {
      projectId: project1.id,
      title: "Add attendance module",
      description: "Implement employee attendance functionality",
      assignedToId: dev2.id,
      status: "TO_DO",
      priority: "MEDIUM",
      dueDate: daysFromNow(7),
    },
  });

  const p1Task5 = await prisma.task.create({
    data: {
      projectId: project1.id,
      title: "Fix employee search",
      description: "Improve employee search and filtering",
      assignedToId: dev1.id,
      status: "IN_PROGRESS",
      priority: "HIGH",
      dueDate: daysAgo(2),
      isOverdue: true,
    },
  });

  const p1Task6 = await prisma.task.create({
    data: {
      projectId: project1.id,
      title: "Write employee module tests",
      description: "Add unit and integration tests",
      assignedToId: dev2.id,
      status: "TO_DO",
      priority: "LOW",
      dueDate: daysFromNow(10),
    },
  });

  // Project 2 tasks
  const p2Task1 = await prisma.task.create({
    data: {
      projectId: project2.id,
      title: "Build product listing",
      description: "Create product listing page",
      assignedToId: dev2.id,
      status: "DONE",
      priority: "HIGH",
      dueDate: daysAgo(4),
    },
  });

  const p2Task2 = await prisma.task.create({
    data: {
      projectId: project2.id,
      title: "Implement shopping cart",
      description: "Build cart management functionality",
      assignedToId: dev3.id,
      status: "IN_PROGRESS",
      priority: "HIGH",
      dueDate: daysFromNow(4),
    },
  });

  const p2Task3 = await prisma.task.create({
    data: {
      projectId: project2.id,
      title: "Integrate payment gateway",
      description: "Integrate payment processing",
      assignedToId: dev3.id,
      status: "IN_REVIEW",
      priority: "CRITICAL",
      dueDate: daysFromNow(1),
    },
  });

  const p2Task4 = await prisma.task.create({
    data: {
      projectId: project2.id,
      title: "Create order API",
      description: "Implement order creation and management APIs",
      assignedToId: dev2.id,
      status: "TO_DO",
      priority: "MEDIUM",
      dueDate: daysFromNow(6),
    },
  });

  const p2Task5 = await prisma.task.create({
    data: {
      projectId: project2.id,
      title: "Fix checkout issue",
      description: "Resolve checkout validation issues",
      assignedToId: dev3.id,
      status: "IN_PROGRESS",
      priority: "CRITICAL",
      dueDate: daysAgo(3),
      isOverdue: true,
    },
  });

  const p2Task6 = await prisma.task.create({
    data: {
      projectId: project2.id,
      title: "Add order tracking",
      description: "Implement order tracking functionality",
      assignedToId: dev2.id,
      status: "TO_DO",
      priority: "LOW",
      dueDate: daysFromNow(12),
    },
  });

  // Project 3 tasks
  const p3Task1 = await prisma.task.create({
    data: {
      projectId: project3.id,
      title: "Create project dashboard",
      description: "Build project overview dashboard",
      assignedToId: dev1.id,
      status: "DONE",
      priority: "HIGH",
      dueDate: daysAgo(2),
    },
  });

  const p3Task2 = await prisma.task.create({
    data: {
      projectId: project3.id,
      title: "Implement task management",
      description: "Build task creation and management APIs",
      assignedToId: dev4.id,
      status: "IN_PROGRESS",
      priority: "HIGH",
      dueDate: daysFromNow(4),
    },
  });

  const p3Task3 = await prisma.task.create({
    data: {
      projectId: project3.id,
      title: "Build activity feed",
      description: "Create real-time activity feed",
      assignedToId: dev1.id,
      status: "IN_REVIEW",
      priority: "MEDIUM",
      dueDate: daysFromNow(2),
    },
  });

  const p3Task4 = await prisma.task.create({
    data: {
      projectId: project3.id,
      title: "Add notifications",
      description: "Implement task notifications",
      assignedToId: dev4.id,
      status: "TO_DO",
      priority: "MEDIUM",
      dueDate: daysFromNow(8),
    },
  });

  const p3Task5 = await prisma.task.create({
    data: {
      projectId: project3.id,
      title: "Implement user management",
      description: "Build admin user management functionality",
      assignedToId: dev4.id,
      status: "IN_PROGRESS",
      priority: "CRITICAL",
      dueDate: daysFromNow(5),
    },
  });

  const p3Task6 = await prisma.task.create({
    data: {
      projectId: project3.id,
      title: "Add dashboard analytics",
      description: "Create project analytics and statistics",
      assignedToId: dev1.id,
      status: "TO_DO",
      priority: "LOW",
      dueDate: daysFromNow(14),
    },
  });

  console.log("Tasks created");

  // Create pre-existing activity logs
  await prisma.activityLog.createMany({
    data: [
      {
        taskId: p1Task1.id,
        projectId: project1.id,
        userId: dev1.id,
        oldStatus: "IN_PROGRESS",
        newStatus: "DONE",
        createdAt: daysAgo(3),
      },
      {
        taskId: p1Task3.id,
        projectId: project1.id,
        userId: dev1.id,
        oldStatus: "IN_PROGRESS",
        newStatus: "IN_REVIEW",
        createdAt: daysAgo(1),
      },
      {
        taskId: p1Task5.id,
        projectId: project1.id,
        userId: dev1.id,
        oldStatus: "TO_DO",
        newStatus: "IN_PROGRESS",
        createdAt: daysAgo(4),
      },
      {
        taskId: p2Task1.id,
        projectId: project2.id,
        userId: dev2.id,
        oldStatus: "IN_PROGRESS",
        newStatus: "DONE",
        createdAt: daysAgo(2),
      },
      {
        taskId: p2Task3.id,
        projectId: project2.id,
        userId: dev3.id,
        oldStatus: "IN_PROGRESS",
        newStatus: "IN_REVIEW",
        createdAt: daysAgo(1),
      },
      {
        taskId: p2Task5.id,
        projectId: project2.id,
        userId: dev3.id,
        oldStatus: "TO_DO",
        newStatus: "IN_PROGRESS",
        createdAt: daysAgo(5),
      },
      {
        taskId: p3Task1.id,
        projectId: project3.id,
        userId: dev1.id,
        oldStatus: "IN_REVIEW",
        newStatus: "DONE",
        createdAt: daysAgo(2),
      },
      {
        taskId: p3Task2.id,
        projectId: project3.id,
        userId: dev4.id,
        oldStatus: "TO_DO",
        newStatus: "IN_PROGRESS",
        createdAt: daysAgo(1),
      },
      {
        taskId: p3Task3.id,
        projectId: project3.id,
        userId: dev1.id,
        oldStatus: "IN_PROGRESS",
        newStatus: "IN_REVIEW",
        createdAt: daysAgo(1),
      },
    ],
  });

  console.log("Activity logs created");

  // Create notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: dev1.id,
        type: "TASK_ASSIGNED",
        message: "You have been assigned a task in Velozity Employee Portal",
      },
      {
        userId: dev2.id,
        type: "TASK_ASSIGNED",
        message: "You have been assigned a task in E-Commerce Platform",
      },
      {
        userId: dev3.id,
        type: "TASK_MOVED_TO_REVIEW",
        message: "A task assigned to you has been moved to review",
      },
      {
        userId: dev4.id,
        type: "TASK_ASSIGNED",
        message: "You have been assigned a task in Project Management Dashboard",
      },
    ],
  });

  console.log("Notifications created");

  console.log("Database seed completed successfully");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });