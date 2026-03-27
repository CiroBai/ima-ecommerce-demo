import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IMA Studio — AI 电商创意套件",
  description: "从商品链接到完整上架素材，图片一键生成",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        {children}
        <Toaster
          position="top-right"
          theme="dark"
          toastOptions={{
            style: {
              background: "#1c1c1f",
              border: "1px solid #27272a",
              color: "#fafafa",
            },
          }}
        />
      </body>
    </html>
  );
}
