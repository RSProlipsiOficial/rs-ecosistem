import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2),
  price: z.number().nonnegative(),
  sku: z.string().optional()
});
