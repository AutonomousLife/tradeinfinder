import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  CRON_SECRET: z.string().optional(),
  AFFILIATE_EBAY_CAMPAIGN_ID: z.string().optional(),
  AFFILIATE_AMAZON_TAG: z.string().optional(),
  ADMIN_EMAIL: z.string().email().optional(),
  ENABLE_LIVE_QUOTES: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
  QUOTE_WORKER_URL: z.string().url().optional(),
  QUOTE_WORKER_TOKEN: z.string().optional(),
  QUOTE_USER_AGENT: z.string().optional(),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  CRON_SECRET: process.env.CRON_SECRET,
  AFFILIATE_EBAY_CAMPAIGN_ID: process.env.AFFILIATE_EBAY_CAMPAIGN_ID,
  AFFILIATE_AMAZON_TAG: process.env.AFFILIATE_AMAZON_TAG,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ENABLE_LIVE_QUOTES: process.env.ENABLE_LIVE_QUOTES,
  QUOTE_WORKER_URL: process.env.QUOTE_WORKER_URL,
  QUOTE_WORKER_TOKEN: process.env.QUOTE_WORKER_TOKEN,
  QUOTE_USER_AGENT: process.env.QUOTE_USER_AGENT,
});