import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
import { guardOrExit } from "./src/scripts/lib/guard";

config({ path: ".env.local" });

// "generate" only writes a file on this computer. The commands below change the database, so they need the safety catch.
if (["migrate", "push", "drop", "up"].some((command) => process.argv.includes(command))) {
  guardOrExit("db:migrate");
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED ?? "",
  },
});
