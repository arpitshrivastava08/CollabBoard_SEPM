import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CollabBoard | CodeRangers",
  description: "A minimal real-time collaborative whiteboard MVP."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
