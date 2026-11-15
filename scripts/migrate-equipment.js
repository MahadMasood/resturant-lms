const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env.local") });
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log("Applying EquipmentItem schema migration to PostgreSQL...");

  await pool.query(`
    DO $$ BEGIN
      CREATE TYPE "EquipmentType" AS ENUM ('COOKING_PLATE', 'METAL_RING', 'SERVING_PLATE');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      CREATE TYPE "EquipmentStatus" AS ENUM ('ACTIVE', 'MAINTENANCE', 'RETIRED');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    CREATE TABLE IF NOT EXISTS "EquipmentItem" (
      "id" TEXT NOT NULL,
      "tenantId" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "type" "EquipmentType" NOT NULL,
      "cooksCount" INTEGER NOT NULL DEFAULT 0,
      "maxCooks" INTEGER NOT NULL DEFAULT 40,
      "quantity" INTEGER NOT NULL DEFAULT 1,
      "status" "EquipmentStatus" NOT NULL DEFAULT 'ACTIVE',
      "notes" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

      CONSTRAINT "EquipmentItem_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "EquipmentItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE INDEX IF NOT EXISTS "EquipmentItem_tenantId_idx" ON "EquipmentItem"("tenantId");
  `);

  console.log("Migration completed successfully: EquipmentItem table and enums created.");
  await pool.end();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
