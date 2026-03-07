import Link from "next/link";
import { MailPreview } from "@/components/mail/mail-preview";

export default function DigestPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-6 py-10">
      <header className="rounded-[2rem] border border-black/5 bg-white/80 p-8 shadow-card backdrop-blur">
        <p className="text-sm uppercase tracking-[0.3em] text-accent">Digest</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">メール下書き作成</h1>
        <p className="mt-3 text-sm text-black/65">
          選択した記事から件名と本文を自動生成します。必要ならそのままコピーして使えます。
        </p>
        <Link className="mt-4 inline-flex text-sm font-medium text-accent hover:underline" href="/">
          一覧へ戻る
        </Link>
      </header>
      <MailPreview />
    </main>
  );
}
