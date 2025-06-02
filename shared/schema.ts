import { z } from "zod";

export const eventSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  timeToEvent: z.number().max(0, "Time offset must be negative (events are in the past relative to main event)"),
  createdAt: z.number(),
  status: z.enum(["upcoming", "completed"]),
  completedAt: z.number().optional(),
  mainEventTimestamp: z.number().optional(),
});

export const insertEventSchema = eventSchema.omit({
  id: true,
  createdAt: true,
  status: true,
  completedAt: true,
});

export type Event = z.infer<typeof eventSchema>;
export type InsertEvent = z.infer<typeof insertEventSchema>;
