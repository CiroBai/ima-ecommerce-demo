import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import AppShell from "@/components/app-shell";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "IMA Studio — AI 电商素材工厂",
  description: "输入商品链接，一键生成全套带货素材",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={`${jakarta.variable} ${dmSans.variable}`}>
        <AppShell>{children}</AppShell>
        <Toaster
          position="top-right"
          theme="dark"
          toastOptions={{
            style: {
              background: "#12121a",
              border: "1px solid #1e1e2e",
              color: "#f0f0f5",
            },
          }}
        />
      </body>
    </html>
  );
}
