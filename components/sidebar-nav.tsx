"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem =
  | { type: "divider"; label?: string }
  | { type?: undefined; icon: string; label: string; href: string; badge?: string; disabled?: boolean };

const NAV_ITEMS: NavItem[] = [
  { icon: "🏠", label: "首页", href: "/" },
  { type: "divider", label: "电商套图" },
  { icon: "🔗", label: "商品链接生成", href: "/product", badge: "NEW" },
  { icon: "🎬", label: "TikTok 带货视频", href: "/tiktok-video", badge: "NEW" },
  { icon: "🔥", label: "爆款复刻", href: "/clone" },
  { type: "divider", label: "品牌设计" },
  { icon: "🎯", label: "品牌 Logo", href: "/branding", badge: "NEW" },
  { icon: "📸", label: "社媒海报", href: "/poster", badge: "NEW" },
  { icon: "🎠", label: "轮播图", href: "/carousel", badge: "NEW" },
  { icon: "📄", label: "宣传册", href: "/brochure", badge: "NEW" },
  { type: "divider", label: "工具" },
  { icon: "✂️", label: "智能换图", href: "/smart-replace" },
  { icon: "📦", label: "批量素材", href: "/workspace" },
  { icon: "✍️", label: "AI 文案", href: "/ai-copywriting", badge: "NEW" },
  { icon: "📋", label: "批量任务", href: "/batch", badge: "NEW" },
  { icon: "🏪", label: "模板市场", href: "/templates", badge: "NEW" },
  { type: "divider" },
  { icon: "📋", label: "创作记录", href: "/records" },
  { icon: "⚙️", label: "设置", href: "/settings" },
];

interface SidebarNavProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function SidebarNav({ isOpen = false, onClose }: SidebarNavProps) {
  const pathname = usePathname();

  const handleNavClick = () => {
    onClose?.();
  };

  return (
    <aside className={`sidebar${isOpen ? " open" : ""}`}>
      {/* Logo */}
      <div className="sb-logo">
        <div className="sb-logo-icon">IM</div>
        <div className="sb-logo-text">
          <span>IMA</span> Studio
        </div>
      </div>

      <nav style={{ flex: 1, overflowY: "auto" }}>
        {NAV_ITEMS.map((item, idx) => {
          if (item.type === "divider") {
            return (
              <div key={`divider-${idx}`}>
                {item.label ? (
                  <div className="sb-section-label">
                    {item.label}
                  </div>
                ) : (
                  <div className="sb-divider" />
                )}
              </div>
            );
          }

          const isActive = item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

          if (item.disabled) {
            return (
              <div
                key={item.href}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "8px 22px", opacity: 0.4, cursor: "not-allowed",
                  fontSize: 13,
                }}
              >
                <span>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && (
                  <span style={{
                    fontSize: 9, padding: "2px 6px", borderRadius: 4,
                    background: "rgba(255,255,255,0.08)",
                    color: "var(--t3)", fontWeight: 600,
                  }}>
                    {item.badge}
                  </span>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{ textDecoration: "none" }}
              onClick={handleNavClick}
            >
              <div className={`sb-item${isActive ? " active" : ""}`}>
                <span>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && (
                  <span className="sb-badge">{item.badge}</span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="sb-divider" />

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
