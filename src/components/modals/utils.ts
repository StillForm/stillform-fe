import { z } from "zod";
export type CreateCollectionForm = z.infer<typeof createCollectionSchema>;

export const createCollectionSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  symbol: z.string().min(1, "Symbol is required").max(10, "Symbol too long"),
  supply: z
    .number()
    .min(1, "Supply must be at least 1")
    .max(10000, "Supply too large"),
  price: z.string().min(1, "Price is required"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(1000, "Description too long"),
  baseUri: z.string().url("Must be a valid URL"),
});
