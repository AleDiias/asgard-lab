import argon2 from "argon2";
import { masterDb, masterPool } from "@/infra/database/master/connection.js";
import { asgardUsers } from "@/infra/database/master/schema.js";
import { validateAndGetEnv } from "@/infra/env.js";

async function run(): Promise<void> {
  const env = validateAndGetEnv();
  const passwordHash = await argon2.hash(env.ASGARD_SEED_PASSWORD);

  await masterDb
    .insert(asgardUsers)
    .values({
      name: env.ASGARD_SEED_NAME,
      email: env.ASGARD_SEED_EMAIL.toLowerCase(),
      passwordHash,
      isActive: true,
    })
    .onConflictDoNothing({ target: asgardUsers.email });

  // eslint-disable-next-line no-console
  console.log("Seed executado com sucesso.");
}

run()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error("Falha no seed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await masterPool.end();
  });
