import { prisma } from "@/lib/prisma";

type AccessCounterSnapshot = {
  total: number;
  updatedAt: string | null;
};

const COUNTER_KEY = "home-access";
const INITIAL_TOTAL = 150;

async function ensureCounterReady() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "SiteCounter" (
      "key" TEXT PRIMARY KEY,
      "total" INTEGER NOT NULL DEFAULT 0,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await prisma.$executeRaw`
    INSERT INTO "SiteCounter" ("key", "total", "updatedAt")
    VALUES (${COUNTER_KEY}, ${INITIAL_TOTAL}, NOW())
    ON CONFLICT ("key") DO NOTHING
  `;
}

function normalizeSnapshot(
  row:
    | {
        total: number;
        updatedAt: Date;
      }
    | undefined,
): AccessCounterSnapshot {
  if (!row) {
    return {
      total: INITIAL_TOTAL,
      updatedAt: null,
    };
  }

  return {
    total: row.total,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getAccessCounter() {
  await ensureCounterReady();

  const rows = await prisma.$queryRaw<Array<{ total: number; updatedAt: Date }>>`
    SELECT "total", "updatedAt"
    FROM "SiteCounter"
    WHERE "key" = ${COUNTER_KEY}
    LIMIT 1
  `;

  return normalizeSnapshot(rows[0]);
}

export async function incrementAccessCounter() {
  await ensureCounterReady();

  const rows = await prisma.$queryRaw<Array<{ total: number; updatedAt: Date }>>`
    UPDATE "SiteCounter"
    SET "total" = "total" + 1,
        "updatedAt" = NOW()
    WHERE "key" = ${COUNTER_KEY}
    RETURNING "total", "updatedAt"
  `;

  return normalizeSnapshot(rows[0]);
}
