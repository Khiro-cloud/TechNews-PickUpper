import { pruneOldArticles } from "@/lib/news/cleanup";

async function main() {
  const result = await pruneOldArticles();
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
