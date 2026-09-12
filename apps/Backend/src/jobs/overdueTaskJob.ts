import cron from "node-cron";
import { prisma } from "../lib/prisma.js";

export const startOverdueTaskJob = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const result = await prisma.task.updateMany({
        where: {
          dueDate: {
            lt: new Date(),
          },
          isOverdue: false,
        },
        data: {
          isOverdue: true,
        },
      });

      console.log(
        `Overdue task job completed. Updated ${result.count} tasks.`
      );
    } catch (error) {
      console.error("Overdue task job failed:", error);
    }
  });

  console.log("Overdue task scheduler started");
};