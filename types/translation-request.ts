import { z } from 'zod'

const numberedElementSchema = z.object({
  number: z.number(),
  text: z.string().min(1),
})

export const translationRequestSchema = z.object({
  numberedElements: z.array(numberedElementSchema),
  title: z.string().min(1),
  target_language: z.string().min(1),
  url: z.string().url().optional(),
  translationMode: z.enum(['read', 'write']),
})


export type TranslationRequest = z.infer<typeof translationRequestSchema>
