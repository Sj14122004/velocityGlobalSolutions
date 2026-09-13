import { z } from "zod";

export const createProjectManagerSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(1, "Project Manager name is required")
      .max(100, "Project Manager name must be at most 100 characters"),
    email: z
      .string()
      .trim()
      .email("Invalid email address")
      .max(255, "Project Manager email must be at most 255 characters"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password must be at most 100 characters"),
  }),
});

export const getProjectManagerByIdSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^\d+$/, "Project Manager ID must be a number"),
  }),
});

export const updateProjectManagerSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^\d+$/, "Project Manager ID must be a number"),
  }),
  body: z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Project Manager name is required")
      .max(100, "Project Manager name must be at most 100 characters")
      .optional(),
    email: z
      .string()
      .trim()
      .email("Invalid email address")
      .max(255, "Project Manager email must be at most 255 characters")
      .optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.email !== undefined ||
      data.isActive !== undefined,
    {
      message: "At least one field is required",
    }
  ),
});

export const deleteProjectManagerSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^\d+$/, "Project Manager ID must be a number"),
  }),
});