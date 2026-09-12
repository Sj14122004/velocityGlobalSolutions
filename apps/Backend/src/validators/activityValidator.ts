import { z } from "zod";

export const getActivitiesSchema = z.object({
  query: z.object({
    projectId: z
      .string()
      .regex(
        /^\d+$/,
        "Project ID must be a number"
      )
      .optional(),
  }),
});