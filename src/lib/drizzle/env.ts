import "server-only";

export function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("[drizzle] Missing required environment variable: DATABASE_URL");
  }
  return url;
}
