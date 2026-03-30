"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CATEGORIES } from "@/lib/types";

const TEMPLATES = [
  {
    category: "服装",
    title: "亚马逊白底主图套组",
    desc: "纯白背景 + 自然光影，符合亚马逊上架规范，含7图完整套组",
    prompt: "summer dress, pure white background, studio lighting, product photography, sharp focus, professional, 2000x2000",
    tags: ["亚马逊", "白底", "1:1"],
    badge: "hot",
    badgeText: "🔥 爆款",
    bg: "linear-gradient(135deg,#fef3c7,#fde68a)",
    emoji: "👗",
    views: "2.3k",
    rating: "4.9",
  },
  {
    category: "美妆护肤",
    title: "小红书种草风美妆",
    desc: "ins风平铺摆拍，柔光散射+马卡龙色调，适合小红书/抖音种草",
    prompt: "skincare product flat lay, instagram style, soft pastel background, macro photography, beauty aesthetic",
    tags: ["小红书", "种草", "4:5"],
    badge: "hot",
    badgeText: "🔥 爆款",
    bg: "linear-gradient(135deg,#fce7f3,#fbcfe8)",
    emoji: "💄",
    views: "3.1k",
    rating: "4.8",
  },
  {
    category: "数码电子",
    title: "TikTok 开箱短视频",
    desc: "15秒竖屏模板，悬念开头→特写→功能演示→购买引导，高完播率",
    prompt: "tech product unboxing, dramatic lighting, clean background, TikTok style, vertical format",
    tags: ["TikTok", "视频", "9:16"],
    badge: "new",
    badgeText: "✨ 新模板",
    bg: "linear-gradient(135deg,#e0e7ff,#c7d2fe)",
    emoji: "📱",
    views: "1.8k",
    rating: "4.7",
  },
  {
    category: "家居厨房",
    title: "北欧风家居场景图",
    desc: "温馨北欧风场景，暖色灯光+木质桌面+绿植点缀，适合家居/厨房品类",
    prompt: "kitchen product in scandinavian home, warm wood surfaces, green plants, cozy atmosphere, editorial photography",
    tags: ["Shopify", "场景", "16:9"],
    badge: "top",
    badgeText: "👑 TOP",
    bg: "linear-gradient(135deg,#d1fae5,#a7f3d0)",
    emoji: "🏠",
    views: "1.5k",
    rating: "4.9",
  },
  {
    category: "食品饮料",
    title: "美食诱惑短视频",
    desc: "特写+慢动作，暖色调让人食欲大开，适合食品/饮料品类推广",
    prompt: "food photography, warm tones, close-up macro shot, steaming hot, appetizing, cinematic quality",
    tags: ["抖音", "视频", "9:16"],
    badge: "hot",
    badgeText: "🔥 爆款",
    bg: "linear-gradient(135deg,#fed7aa,#fdba74)",
    emoji: "🍵",
    views: "2.0k",
    rating: "4.8",
  },
  {
    category: "珠宝首饰",
    title: "奢华珠宝展示",
    desc: "黑色丝绒底+聚光灯，钻石反光效果，极致高级感，适合珠宝/手表",
    prompt: "luxury jewelry on black velvet, dramatic spotlight, diamond reflections, ultra premium, high-end product photography",
    tags: ["奢华", "珠宝", "1:1"],
    badge: "top",
    badgeText: "👑 TOP",
    bg: "linear-gradient(135deg,#1a1a2e,#16213e)",
    emoji: "💎",
    views: "1.2k",
    rating: "5.0",
  },
];

const CORE_ENTRIES = [
  {
    icon: "🛒",
    title: "亚马逊套图",
    desc: "一键生成 7+2 专业 listing 图集，主图/场景图/信息图全覆盖",
    href: "/product",
    tags: ["7+2图位", "白底主图", "信息图", "场景图"],
    credits: "10-18 积分/张",
    gradient: "linear-gradient(135deg, rgba(249,115,22,0.15), rgba(236,72,153,0.15))",
    border: "rgba(249,115,22,0.3)",
    accent: "#f97316",
    badge: "🔥 最受欢迎",
    disabled: false,
  },
  {
    icon: "🎬",
    title: "TikTok 带货视频",
    desc: "AI 分镜规划，批量生成短视频素材，开箱/教程/对比多模板",
    href: "/tiktok-video",
    tags: ["AI分镜", "多模板", "9:16竖屏", "批量生成"],
    credits: "12-18 积分/帧",
    gradient: "linear-gradient(135deg, rgba(168,85,247,0.15), rgba(59,130,246,0.15))",
    border: "rgba(168,85,247,0.3)",
    accent: "#a855f7",
    badge: "✨ 新功能",
    disabled: false,
  },
  {
    icon: "🎨",
    title: "品牌全套设计",
    desc: "Logo + 海报 + 轮播图 + 宣传册，品牌全套视觉资产，一站搞定",
    href: "/branding",
    tags: ["Logo", "海报", "轮播图", "宣传册"],
    credits: "8-18 积分/张",
    gradient: "linear-gradient(135deg, rgba(168,85,247,0.15), rgba(99,102,241,0.15))",
    border: "rgba(168,85,247,0.3)",
    accent: "#a855f7",
    badge: "🎨 品牌设计",
    disabled: false,
  },
];

const MORE_TOOLS = [
  { icon: "✍️", label: "AI 文案", desc: "一站式生成所有平台文案", href: "/ai-copywriting", color: "#06b6d4" },
  { icon: "📋", label: "批量任务", desc: "统一管理所有生成任务", href: "/batch", color: "#22c55e" },
  { icon: "🏪", label: "模板市场", desc: "精选模板一键套用", href: "/templates", color: "#a855f7" },
  { icon: "⚙️", label: "设置中心", desc: "API 配置与偏好设置", href: "/settings", color: "#f97316" },
];

export default function HomePage() {
  const router = useRouter();
  const [selectedCat, setSelectedCat] = useState<string | null>(null);

  const handleCategoryClick = (catId: string) => {
    setSelectedCat(catId);
    router.push(`/workspace?category=${encodeURIComponent(catId)}`);
  };

  const handleTemplateUse = (tpl: (typeof TEMPLATES)[0]) => {
    router.push(
      `/workspace?category=${encodeURIComponent(tpl.category)}&prompt=${encodeURIComponent(tpl.prompt)}`
    );
  };

  return (
    <>
      {/* Topbar */}
      <div className="topbar">
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, color: "var(--t3)" }}>AI 电商素材工厂</span>
        </div>
        <div className="credits-badge">✦ 365 积分</div>
      </div>

      {/* Hero Banner */}
      <div style={{
        background: "linear-gradient(135deg, rgba(249,115,22,0.08) 0%, rgba(168,85,247,0.08) 50%, rgba(59,130,246,0.08) 100%)",
        borderBottom: "1px solid var(--bd)",
        padding: "48px 40px 40px",
        textAlign: "center",
      }} className="fi">
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "4px 14px", borderRadius: 20,
          background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.3)",
          color: "#f97316", fontSize: 11, fontWeight: 600, marginBottom: 20
        }}>
          🚀 由 SeeDream 4.5 + Midjourney + Nano Banana Pro 驱动
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12, letterSpacing: -1 }}>
          AI 电商素材工厂
        </h1>
        <p style={{ fontSize: 16, color: "var(--t2)", marginBottom: 8 }}>
          输入商品链接，一键生成全套带货素材
        </p>
        <p style={{ fontSize: 13, color: "var(--t3)", marginBottom: 40 }}>
          主图 · 场景图 · 卖点图 · 短视频 · A+ 内容 — 全平台适配，分钟级交付
        </p>

        {/* Three Core Entry Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          maxWidth: 960,
          margin: "0 auto",
        }}>
          {CORE_ENTRIES.map((entry) => (
            <div
              key={entry.title}
              onClick={() => !entry.disabled && router.push(entry.href)}
              style={{
                background: entry.gradient,
                border: `1px solid ${entry.border}`,
                borderRadius: 16,
                padding: "24px 20px",
                cursor: entry.disabled ? "not-allowed" : "pointer",
                textAlign: "left",
                transition: "all 0.2s",
                position: "relative",
                overflow: "hidden",
                opacity: entry.disabled ? 0.7 : 1,
              }}
              onMouseEnter={e => {
                if (!entry.disabled) {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 40px ${entry.border}`;
                }
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              <div style={{
                position: "absolute", top: 12, right: 12,
                fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 8,
                background: `${entry.accent}22`, border: `1px solid ${entry.accent}44`,
                color: entry.accent,
              }}>
                {entry.badge}
              </div>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{entry.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{entry.title}</h3>
              <p style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.6, marginBottom: 14 }}>{entry.desc}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 14 }}>
                {entry.tags.map(tag => (
                  <span key={tag} style={{
                    fontSize: 10, padding: "2px 8px", borderRadius: 6,
                    background: "rgba(255,255,255,0.06)", color: "var(--t2)",
                  }}>{tag}</span>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 10, color: "var(--t3)" }}>{entry.credits}</span>
                {entry.disabled ? (
                  <span style={{
                    padding: "6px 16px", borderRadius: 8,
                    background: "rgba(255,255,255,0.06)",
                    color: "var(--t3)", fontSize: 12, fontWeight: 600,
                  }}>
                    即将开放
                  </span>
                ) : (
                  <button style={{
                    padding: "6px 16px", borderRadius: 8,
                    background: `linear-gradient(135deg, ${entry.accent}, ${entry.accent}cc)`,
                    color: "#fff", fontSize: 12, fontWeight: 600, border: "none",
                    cursor: "pointer", fontFamily: "inherit",
                  }}>
                    立即使用 →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* More Tools Section */}
      <div style={{ padding: "32px 40px 20px", borderBottom: "1px solid var(--bd)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>🛠 更多工具</h2>
          <span style={{ fontSize: 11, color: "var(--t3)" }}>AI 文案 · 批量任务 · 模板市场</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {MORE_TOOLS.map((item) => (
            <div
              key={item.label}
              onClick={() => router.push(item.href)}
              style={{
                background: "var(--bg3)",
                border: "1px solid var(--bd)",
                borderRadius: 12,
                padding: "16px 18px",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = item.color + "66";
                (e.currentTarget as HTMLElement).style.background = "var(--bg4)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--bd)";
                (e.currentTarget as HTMLElement).style.background = "var(--bg3)";
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: "var(--fg)" }}>{item.label}</div>
              <div style={{ fontSize: 11, color: "var(--t3)", lineHeight: 1.4 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Quick Access */}
      <div style={{ padding: "32px 40px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>📂 按品类生成</h2>
          <span style={{ fontSize: 11, color: "var(--t3)" }}>选择品类，直接进入工作台</span>
        </div>
        <div className="cat-grid" style={{ maxWidth: "none", padding: 0 }}>
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className={`cat-card ${selectedCat === cat.id ? "selected" : ""}`}
              onClick={() => handleCategoryClick(cat.id)}
            >
              {"hot" in cat && cat.hot && <span className="hot-badge">🔥 热门</span>}
              <span className="cat-emoji">{cat.emoji}</span>
              <div className="cat-name">{cat.name}</div>
              <div className="cat-desc">{cat.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Template Showcase */}
      <div className="tpl-sec">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>📋 模板库</h2>
          <span style={{ fontSize: 11, color: "var(--t3)", background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: 6 }}>
            精选高转化模板
          </span>
        </div>
        <p className="tpl-sub">点击模板，一键套用到工作台</p>
        <div className="tpl-tabs">
          {["🔥 全部热门", "👗 服装", "💄 美妆", "📱 数码", "🏠 家居", "🍵 食品", "💎 珠宝"].map(
            (tab, i) => (
              <button key={tab} className={`tpl-tab ${i === 0 ? "active" : ""}`}>
                {tab}
              </button>
            )
          )}
        </div>
        <div className="tpl-grid">
          {TEMPLATES.map((tpl) => (
            <div key={tpl.title} className="tpl-card" onClick={() => handleTemplateUse(tpl)}>
              <div className="tpl-img" style={{ background: tpl.bg }}>
                <span style={{ fontSize: 48, opacity: 0.5 }}>{tpl.emoji}</span>
                <span className={`tpl-badge ${tpl.badge}`}>{tpl.badgeText}</span>
                <div className="tpl-stats">
                  <span>👁 {tpl.views}</span>
                  <span>⭐ {tpl.rating}</span>
                </div>
              </div>
              <div className="tpl-body">
                <div className="tpl-name">{tpl.title}</div>
                <div className="tpl-desc">{tpl.desc}</div>
                <div className="tpl-foot">
                  <div className="tpl-tags">
                    {tpl.tags.map((tag) => (
                      <span key={tag} className="tpl-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button
                    className="tpl-make"
                    onClick={(e) => { e.stopPropagation(); handleTemplateUse(tpl); }}
                  >
                    一键制作
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
