import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import TonConnectProvider from "@/components/TonConnectProvider";

export const metadata: Metadata = {
  title: "Hehe Miner - Telegram Mining Game",
  description: "Mine Hehe tokens in this fun Telegram-based mining game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js"></script>
      </head>
      <body className="antialiased bg-gray-900 text-white min-h-screen font-sans">
        <TonConnectProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </TonConnectProvider>
      </body>
    </html>
  );
}
