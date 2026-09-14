import { z } from "zod";

export const createProjectSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(1, "Project name is required")
      .max(200, "Project name must be at most 200 characters"),
    description: z
      .string()
      .trim()
      .max(
        2000,
        "Project description must be at most 2000 characters"
      )
      .optional(),
    developerIds: z
      .array(z.number().int().positive())
      .min(1, "Select at least one developer"),
  }),
});

export const getProjectByIdSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(
        /^\d+$/,
        "Project ID must be a number"
      ),
  }),
});

export const updateProjectSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(
        /^\d+$/,
        "Project ID must be a number"
      ),
  }),

  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(1, "Project name is required")
        .max(
          200,
          "Project name must be at most 200 characters"
        )
        .optional(),

      description: z
        .string()
        .trim()
        .max(
          2000,
          "Project description must be at most 2000 characters"
        )
        .optional(),
    })
    .refine(
      (data) =>
        data.name !== undefined ||
        data.description !== undefined,
      {
        message:
          "At least one field is required to update the project",
      }
    ),
});

export const deleteProjectSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(
        /^\d+$/,
        "Project ID must be a number"
      ),
  }),
});