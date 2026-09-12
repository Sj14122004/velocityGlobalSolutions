import { z } from "zod";

export const createTaskSchema = z.object({
  body: z.object({
    projectId: z.number().int().positive(),

    title: z
      .string()
      .trim()
      .min(1)
      .max(200),

    description: z
      .string()
      .trim()
      .max(2000)
      .optional(),

    assignedToId: z
      .number()
      .int()
      .positive(),

    priority: z
      .enum([
        "LOW",
        "MEDIUM",
        "HIGH",
        "CRITICAL",
      ])
      .optional(),

    dueDate: z.string().datetime(),
  }),
});

export const getTasksSchema = z.object({
  query: z.object({
    status: z
      .enum([
        "TO_DO",
        "IN_PROGRESS",
        "IN_REVIEW",
        "DONE",
      ])
      .optional(),

    priority: z
      .enum([
        "LOW",
        "MEDIUM",
        "HIGH",
        "CRITICAL",
      ])
      .optional(),

    dueFrom: z
      .string()
      .datetime()
      .optional(),

    dueTo: z
      .string()
      .datetime()
      .optional(),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(
        /^\d+$/,
        "Task ID must be a number"
      ),
  }),

  body: z
    .object({
      title: z
        .string()
        .trim()
        .min(1)
        .max(200)
        .optional(),

      description: z
        .string()
        .trim()
        .max(2000)
        .optional(),

      assignedToId: z
        .number()
        .int()
        .positive()
        .optional(),

      priority: z
        .enum([
          "LOW",
          "MEDIUM",
          "HIGH",
          "CRITICAL",
        ])
        .optional(),

      dueDate: z
        .string()
        .datetime()
        .optional(),
    })
    .refine(
      (data) =>
        data.title !== undefined ||
        data.description !== undefined ||
        data.assignedToId !== undefined ||
        data.priority !== undefined ||
        data.dueDate !== undefined,
      {
        message:
          "At least one field is required to update the task",
      }
    ),
});

export const updateTaskStatusSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(
        /^\d+$/,
        "Task ID must be a number"
      ),
  }),

  body: z.object({
    status: z.enum([
      "TO_DO",
      "IN_PROGRESS",
      "IN_REVIEW",
      "DONE",
    ]),
  }),
});

export const getTaskByIdSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(
        /^\d+$/,
        "Task ID must be a number"
      ),
  }),
});

export const deleteTaskSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(
        /^\d+$/,
        "Task ID must be a number"
      ),
  }),
});