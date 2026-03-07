import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tech News Digest",
  description: "IT and tech news digest builder",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
