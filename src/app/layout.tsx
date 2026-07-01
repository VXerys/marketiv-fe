import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ChatbotFab } from "@/components/features/chatbot/ChatbotFab";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
});

export const metadata: Metadata = {
  title: "Marketiv",
  description: "Marketplace for UMKM and Creators",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${plusJakartaSans.className} antialiased`}>
        {children}
        <ChatbotFab />
      </body>
    </html>
  );
}
