import { z } from "zod";

export const simulateSchema = z.object({
  price: z.number().nonnegative(),
  points: z.number().int().nonnegative()
});
