/**
 * Run with: npx tsx scripts/seed.ts
 * Seeds achievements catalog into the database.
 */

import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/lib/db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const ACHIEVEMENTS = [
  { slug: "first-event", name: "Primeira Memória", description: "Criou o primeiro evento do casal", icon: "📖", criteria: "events >= 1" },
  { slug: "photo-lover", name: "Álbum de Memórias", description: "Adicionou 10 fotos à galeria", icon: "📷", criteria: "photos >= 10" },
  { slug: "one-month", name: "Um Mês Juntos", description: "Completaram 30 dias de relacionamento", icon: "🌙", criteria: "days >= 30" },
  { slug: "six-months", name: "Seis Meses", description: "Completaram 6 meses de relacionamento", icon: "💫", criteria: "days >= 180" },
  { slug: "one-year", name: "Um Ano de Amor", description: "Completaram 1 ano juntos", icon: "🎂", criteria: "days >= 365" },
  { slug: "two-years", name: "Dois Anos", description: "Completaram 2 anos de relacionamento", icon: "💑", criteria: "days >= 730" },
  { slug: "five-events", name: "Colecionadores", description: "Criaram 5 eventos especiais", icon: "🌟", criteria: "events >= 5" },
  { slug: "twenty-events", name: "Historiadores", description: "Criaram 20 memórias", icon: "📚", criteria: "events >= 20" },
  { slug: "first-trip", name: "Viajantes", description: "Registraram a primeira viagem juntos", icon: "✈️", criteria: "category:viagem >= 1" },
  { slug: "daily-message", name: "Recadinho do Dia", description: "Enviaram 7 recadinhos diários", icon: "💌", criteria: "messages >= 7" },
  { slug: "favorites-lover", name: "Momentos Especiais", description: "Marcaram 5 eventos como favoritos", icon: "⭐", criteria: "favorites >= 5" },
  { slug: "time-capsule", name: "Cápsula do Tempo", description: "Criaram sua primeira cápsula", icon: "⏳", criteria: "capsules >= 1" },
];

async function main() {
  console.log("🌱 Seeding achievements...");

  for (const ach of ACHIEVEMENTS) {
    await db
      .insert(schema.achievements)
      .values(ach)
      .onConflictDoNothing();
    console.log(`  ✅ ${ach.icon} ${ach.name}`);
  }

  console.log(`\n✨ Done! ${ACHIEVEMENTS.length} achievements seeded.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
