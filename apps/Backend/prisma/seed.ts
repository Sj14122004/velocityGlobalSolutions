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

  // Password
  const passwordHash = await hashPassword("Password@123");

  // Admin
  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@velozity.com",
      passwordHash,
      role: "ADMIN",
    },
  });

  // Project Manager
  const projectManager = await prisma.user.create({
    data: {
      name: "Ravi Sharma",
      email: "pm@velozity.com",
      passwordHash,
      role: "PROJECT_MANAGER",
    },
  });

  // Developer
  const developer = await prisma.user.create({
    data: {
      name: "Aman Kumar",
      email: "dev@velozity.com",
      passwordHash,
      role: "DEVELOPER",
    },
  });

  console.log("Users created");

  // Project
  const project = await prisma.project.create({
    data: {
      name: "E-Commerce Dashboard",
      description: "Build an internal e-commerce management dashboard.",
      createdById: projectManager.id,
    },
  });

  console.log("Project created");

  // Project Member
  await prisma.projectMember.create({
    data: {
      projectId: project.id,
      userId: developer.id,
    },
  });

  console.log("Project member created");

  // Task Due Date
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7);

  // Task
  const task = await prisma.task.create({
    data: {
      projectId: project.id,
      title: "Implement Authentication",
      description: "Implement JWT authentication for the dashboard.",
      assignedToId: developer.id,
      status: "IN_PROGRESS",
      priority: "HIGH",
      dueDate,
      isOverdue: false,
    },
  });

  console.log("Task created");

  // Activity Log
  await prisma.activityLog.create({
    data: {
      taskId: task.id,
      projectId: project.id,
      userId: developer.id,
      oldStatus: "TO_DO",
      newStatus: "IN_PROGRESS",
    },
  });

  console.log("Activity log created");

  // Notification
  await prisma.notification.create({
    data: {
      userId: developer.id,
      type: "TASK_ASSIGNED",
      message: "You have been assigned to Implement Authentication.",
    },
  });

  console.log("Notification created");

  console.log("");
  console.log("Database seed completed successfully!");
  console.log("");

  console.log("Login Credentials");
  console.log("------------------");

  console.log("Admin:");
  console.log("Email: admin@velozity.com");
  console.log("Password: Password@123");
  console.log("");

  console.log("Project Manager:");
  console.log("Email: pm@velozity.com");
  console.log("Password: Password@123");
  console.log("");

  console.log("Developer:");
  console.log("Email: dev@velozity.com");
  console.log("Password: Password@123");
  console.log("");

  console.log("Project:");
  console.log(`ID: ${project.id}`);
  console.log(`Name: ${project.name}`);
  console.log("");

  console.log("Task:");
  console.log(`ID: ${task.id}`);
  console.log(`Title: ${task.title}`);
}

main()
  .catch((error) => {
    console.error("Seed failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });