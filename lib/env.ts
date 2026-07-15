import { z } from "zod";

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  APP_ENV: z.enum(["development", "staging", "production"]).default("development"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  RESEND_API_KEY: z.string().default(""),
  EMAIL_FROM_ADDRESS: z.string().email().default("no-reply@example.com"),
  UPSTASH_REDIS_REST_URL: z.string().url().optional().or(z.literal("")),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional().or(z.literal("")),
  ALLOWED_ORIGINS: z.string().default("http://localhost:3000"),
});

const isServer = typeof window === "undefined";

const clientEnv = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
};

const serverEnv = isServer
  ? {
      NODE_ENV: process.env.NODE_ENV,
      APP_ENV: process.env.APP_ENV,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      RESEND_API_KEY: process.env.RESEND_API_KEY,
      EMAIL_FROM_ADDRESS: process.env.EMAIL_FROM_ADDRESS,
      UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
      UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
      ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
    }
  : {};

const parsedClient = clientSchema.safeParse(clientEnv);
if (!parsedClient.success) {
  const errors = parsedClient.error.flatten().fieldErrors;
  console.error("❌ Invalid client-side environment variables:", errors);
  throw new Error(`Invalid environment variables: ${JSON.stringify(errors)}`);
}

let parsedServer = {};
if (isServer) {
  const parseResult = serverSchema.safeParse(serverEnv);
  if (!parseResult.success) {
    const errors = parseResult.error.flatten().fieldErrors;
    console.error("❌ Invalid server-side environment variables:", errors);
    throw new Error(`Invalid environment variables: ${JSON.stringify(errors)}`);
  }
  parsedServer = parseResult.data;
}

export const env = {
  ...parsedClient.data,
  ...parsedServer,
} as z.infer<typeof clientSchema> & z.infer<typeof serverSchema>;
