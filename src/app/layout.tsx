import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/layout/providers";

export const metadata: Metadata = {
  title: "Kaiwu",
  description:
    "Kaiwu is the creator studio and marketplace bridging physical art and on-chain collectibles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-canvas text-text-primary">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
