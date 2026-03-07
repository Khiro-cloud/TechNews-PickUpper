import { crawlAllSources } from "@/lib/crawlers";

async function main() {
  const results = await crawlAllSources();
  console.log(JSON.stringify(results, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
