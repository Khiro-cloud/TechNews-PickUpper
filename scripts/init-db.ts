import { execSync } from "node:child_process";

function main() {
  execSync("npx prisma migrate deploy", {
    stdio: "inherit",
  });
}

main();
