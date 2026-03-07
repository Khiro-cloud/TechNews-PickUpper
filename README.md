# Tech News Digest

Vercel 公開を前提に、PostgreSQL で動かす技術ニュース収集アプリです。

## 必要環境

- Node.js 18.18 以上
- npm
- PostgreSQL

## セットアップ

```powershell
Copy-Item .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run db:seed
npm run dev
```

## Vercel 公開時の前提

- `DATABASE_URL` に外部 PostgreSQL を設定する
- `build` 前に Prisma Client 生成が必要
- 初回は `prisma migrate deploy` を実行してテーブル作成する

## 主要な環境変数

- `DATABASE_URL`
  - PostgreSQL 接続文字列
- `GEMINI_API_KEY`
  - 任意。英語タイトル翻訳で使います
- `ARTICLE_RETENTION_DAYS`
  - 任意。古い記事を何日残すか。既定値は `30`

## 運用

```powershell
npm run crawl
```

- クロール後に古い記事は自動整理されます
- 手動で整理だけ実行したい場合:

```powershell
npm run cleanup
```

## 現在の状態

- Next.js 15 ベースの画面
- PostgreSQL + Prisma
- サムネ URL 取得
- Gemini API による英語タイトル翻訳の土台
- 記事検索、ソース絞り込み、並び替え
- クロールログ表示
- メール下書き作成
