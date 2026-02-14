import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { UserAuth } from "@/components/UserAuth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Skudo Learning",
  description: "Track your YouTube learning progress",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="px-4 lg:px-8 py-4 border-b flex justify-between items-center bg-white shadow-sm">
          <a href="/" className="text-xl font-bold tracking-tight hover:opacity-80 transition-opacity">
            Skudo
          </a>
          <UserAuth />
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
