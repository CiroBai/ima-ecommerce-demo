"use client";

import { SidebarNav } from "@/components/sidebar-nav";
import { useState } from "react";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      {/* 移动端遮罩 */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <SidebarNav isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="main-area">
        {/* 移动端汉堡菜单按钮 */}
        <button
          className="mobile-menu-btn"
          onClick={() => setSidebarOpen(true)}
          aria-label="打开菜单"
        >
          ☰
        </button>
        {children}
      </main>
    </div>
  );
}
