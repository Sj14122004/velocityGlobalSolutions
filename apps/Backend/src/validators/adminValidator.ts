import { z } from "zod";

export const createAdminSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(1, "Admin name is required")
      .max(100, "Admin name must be at most 100 characters"),

    email: z
      .string()
      .trim()
      .email("Invalid email address")
      .max(255, "Email must be at most 255 characters"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password must be at most 100 characters"),
  }),
});

export const getAdminByIdSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^\d+$/, "Admin ID must be a number"),
  }),
});

export const updateAdminSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^\d+$/, "Admin ID must be a number"),
  }),

  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(1, "Admin name is required")
        .max(100, "Admin name must be at most 100 characters")
        .optional(),

      email: z
        .string()
        .trim()
        .email("Invalid email address")
        .max(255, "Email must be at most 255 characters")
        .optional(),
    })
    .refine(
      (data) =>
        data.name !== undefined ||
        data.email !== undefined,
      {
        message:
          "At least one field is required to update the admin",
      }
    ),
});

export const deleteAdminSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^\d+$/, "Admin ID must be a number"),
  }),
});