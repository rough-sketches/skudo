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
        <header className="p-4 border-b flex justify-between items-center bg-white shadow-sm">
          <h1 className="text-xl font-bold tracking-tight">Skudo</h1>
          <UserAuth />
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
