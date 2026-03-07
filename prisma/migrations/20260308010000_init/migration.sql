CREATE TABLE "Source" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "baseUrl" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "sourceArticleId" TEXT,
    "title" TEXT NOT NULL,
    "translatedTitle" TEXT,
    "canonicalUrl" TEXT,
    "titleFingerprint" TEXT,
    "url" TEXT NOT NULL,
    "author" TEXT,
    "summary" TEXT,
    "score" INTEGER,
    "tags" TEXT,
    "thumbnailUrl" TEXT,
    "thumbnailFetchedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CrawlLog" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "fetched" INTEGER NOT NULL,
    "created" INTEGER NOT NULL,
    "skipped" INTEGER NOT NULL,
    "error" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CrawlLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Source_key_key" ON "Source"("key");
CREATE UNIQUE INDEX "Article_url_key" ON "Article"("url");
CREATE UNIQUE INDEX "Article_sourceId_sourceArticleId_key" ON "Article"("sourceId", "sourceArticleId");

CREATE INDEX "Article_sourceId_idx" ON "Article"("sourceId");
CREATE INDEX "Article_publishedAt_idx" ON "Article"("publishedAt");
CREATE INDEX "Article_createdAt_idx" ON "Article"("createdAt");
CREATE INDEX "Article_canonicalUrl_idx" ON "Article"("canonicalUrl");
CREATE INDEX "Article_titleFingerprint_idx" ON "Article"("titleFingerprint");
CREATE INDEX "CrawlLog_startedAt_idx" ON "CrawlLog"("startedAt");
CREATE INDEX "CrawlLog_sourceId_startedAt_idx" ON "CrawlLog"("sourceId", "startedAt");

ALTER TABLE "Article"
ADD CONSTRAINT "Article_sourceId_fkey"
FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CrawlLog"
ADD CONSTRAINT "CrawlLog_sourceId_fkey"
FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE CASCADE ON UPDATE CASCADE;
