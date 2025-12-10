import { config as load } from "dotenv";
import { z } from "zod";

load();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(5020),
  API_PREFIX: z.string().default("/v1"),
  JWT_SECRET: z.string().min(8).default("change-me")
});

export const env = envSchema.parse(process.env);
