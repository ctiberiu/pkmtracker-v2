import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pokédex Tracker",
  description: "Track your Pokédex progress",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-light-bg dark:bg-pokemon-dark text-light-text dark:text-white transition-colors">
        {children}
      </body>
    </html>
  );
}
