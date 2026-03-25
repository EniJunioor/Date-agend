import { z } from "zod";

export const createEventSchema = z.object({
  title: z
    .string()
    .min(1, "Título é obrigatório")
    .max(200, "Título muito longo"),
  description: z.string().max(2000).optional(),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  eventTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Hora inválida")
    .optional(),
  category: z.enum([
    "aniversario",
    "viagem",
    "encontro",
    "conquista",
    "especial",
    "rotina",
    "outro",
  ]),
  moodEmoji: z.string().max(32).optional(),
  isFavorite: z.boolean().default(false),
  tags: z.array(z.string().max(30)).max(10).default([]),
  location: z.string().max(200).optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida")
    .optional(),
  isRecurring: z.boolean().default(false),
  recurrenceType: z.enum(["anual", "mensal", "semanal"]).optional(),
});

export const updateEventSchema = createEventSchema.partial().extend({
  id: z.string().uuid(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
