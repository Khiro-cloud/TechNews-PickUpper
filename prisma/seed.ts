import { prisma } from "@/lib/prisma";
import { SOURCE_DEFINITIONS } from "@/lib/crawlers/shared";

async function main() {
  const sources = Object.entries(SOURCE_DEFINITIONS).map(([key, value]) => ({
    key,
    ...value,
  }));

  for (const source of sources) {
    await prisma.source.upsert({
      where: { key: source.key },
      update: source,
      create: source,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
