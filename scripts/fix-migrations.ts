/**
 * Registra a migration 0000 como já aplicada na tabela de controle do Drizzle.
 *
 * Use quando o schema já existe no banco (via db:push ou apply manual)
 * mas o drizzle.__drizzle_migrations não tem o registro — causando o erro
 * "type already exists" ao rodar db:migrate.
 *
 * Como usar:
 *   npx tsx scripts/fix-migrations.ts
 */

import "dotenv/config";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  // 1. Garantir que o schema drizzle existe
  await sql`CREATE SCHEMA IF NOT EXISTS drizzle`;

  // 2. Criar a tabela de controle caso não exista (formato do drizzle-kit v7)
  await sql`
    CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
      id        SERIAL PRIMARY KEY,
      hash      TEXT    NOT NULL,
      created_at BIGINT
    )
  `;

  // 3. Calcular o hash SHA-256 da migration (mesmo algoritmo do drizzle-kit)
  const migrationPath = resolve(
    process.cwd(),
    "drizzle/0000_loving_aaron_stack.sql"
  );
  const migrationContent = readFileSync(migrationPath, "utf-8");
  const hash = createHash("sha256").update(migrationContent).digest("hex");

  // 4. Inserir somente se ainda não existe
  const existing = await sql`
    SELECT id FROM drizzle.__drizzle_migrations WHERE hash = ${hash}
  `;

  if (existing.length > 0) {
    console.log("✓ Migration já estava registrada. Nenhuma ação necessária.");
    return;
  }

  await sql`
    INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
    VALUES (${hash}, ${Date.now()})
  `;

  console.log("✓ Migration 0000_loving_aaron_stack registrada com sucesso!");
  console.log("  Agora você pode rodar 'npm run db:migrate' normalmente.");
}

main().catch((err) => {
  console.error("Erro:", err.message);
  process.exit(1);
});
