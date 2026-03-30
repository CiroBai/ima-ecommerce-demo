"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", icon: "🏠", label: "首页" },
  { href: "/product", icon: "🔗", label: "商品链接生成" },
  { href: "/clone", icon: "🔥", label: "爆款复刻" },
  { href: "/workspace", icon: "📦", label: "批量素材" },
  { href: "/smart-replace", icon: "✂️", label: "智能换图" },
  { href: "/records", icon: "📋", label: "创作记录" },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sb-logo">
        <div className="sb-logo-icon">IM</div>
        <div className="sb-logo-text">
          <span>IMA</span> Studio
        </div>
      </div>

      <nav style={{ flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{ textDecoration: "none" }}
            >
              <div className={`sb-item ${isActive ? "active" : ""}`}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
                {item.href === "/product" && (
                  <span className="sb-badge">NEW</span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="sb-divider" />

      <div style={{ padding: "4px 20px 8px" }}>
        <Link href="/settings" style={{ textDecoration: "none" }}>
          <div className="sb-item">
            <span>⚙️</span> 设置
          </div>
        </Link>
      </div>

      <div className="sb-bottom">
        <div className="sb-user">
          <div className="sb-avatar">C</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500 }}>用户</div>
            <div style={{ fontSize: 10, color: "var(--t3)" }}>Pro · 365 积分</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
