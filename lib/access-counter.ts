import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

type AccessCounterSnapshot = {
  total: number;
  updatedAt: string | null;
};

const counterFilePath = path.join(process.cwd(), "data", "access-counter.json");

let writeQueue = Promise.resolve();

async function ensureCounterFile() {
  await mkdir(path.dirname(counterFilePath), { recursive: true });

  try {
    await readFile(counterFilePath, "utf8");
  } catch (error) {
    const fileMissing =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ENOENT";

    if (!fileMissing) {
      throw error;
    }

    await writeFile(
      counterFilePath,
      JSON.stringify(
        {
          total: 0,
          updatedAt: null,
        },
        null,
        2,
      ),
      "utf8",
    );
  }
}

async function readSnapshot(): Promise<AccessCounterSnapshot> {
  await ensureCounterFile();

  try {
    const content = await readFile(counterFilePath, "utf8");
    const parsed = JSON.parse(content) as Partial<AccessCounterSnapshot>;

    return {
      total: typeof parsed.total === "number" && Number.isFinite(parsed.total) ? parsed.total : 0,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : null,
    };
  } catch {
    return {
      total: 0,
      updatedAt: null,
    };
  }
}

async function writeSnapshot(snapshot: AccessCounterSnapshot) {
  await writeFile(counterFilePath, JSON.stringify(snapshot, null, 2), "utf8");
}

export async function getAccessCounter() {
  return readSnapshot();
}

export async function incrementAccessCounter() {
  let nextSnapshot: AccessCounterSnapshot = {
    total: 0,
    updatedAt: null,
  };

  writeQueue = writeQueue
    .catch(() => undefined)
    .then(async () => {
      const current = await readSnapshot();

      nextSnapshot = {
        total: current.total + 1,
        updatedAt: new Date().toISOString(),
      };

      await writeSnapshot(nextSnapshot);
    });

  await writeQueue;

  return nextSnapshot;
}
