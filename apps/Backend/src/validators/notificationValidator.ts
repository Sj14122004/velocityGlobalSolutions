import { z } from "zod";

export const markNotificationAsReadSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(
        /^\d+$/,
        "Notification ID must be a number"
      ),
  }),
});