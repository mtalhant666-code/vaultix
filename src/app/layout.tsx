import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vaultix - Secure Cloud Storage",
  description: "Fast, secure file storage powered by Cloudflare",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}