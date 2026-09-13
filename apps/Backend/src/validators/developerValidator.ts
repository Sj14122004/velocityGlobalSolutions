import { z } from "zod";

export const createDeveloperSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(1, "Developer name is required")
      .max(100, "Developer name must be at most 100 characters"),
    email: z
      .string()
      .trim()
      .email("Invalid email address")
      .max(255, "Developer email must be at most 255 characters"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password must be at most 100 characters"),
  }),
});

export const getDeveloperByIdSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^\d+$/, "Developer ID must be a number"),
  }),
});

export const updateDeveloperSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^\d+$/, "Developer ID must be a number"),
  }),
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(1, "Developer name is required")
        .max(100, "Developer name must be at most 100 characters")
        .optional(),
      email: z
        .string()
        .trim()
        .email("Invalid email address")
        .max(255, "Developer email must be at most 255 characters")
        .optional(),
    })
    .refine(
      (data) => data.name !== undefined || data.email !== undefined,
      {
        message: "At least one field is required",
      }
    ),
});

export const deleteDeveloperSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^\d+$/, "Developer ID must be a number"),
  }),
});