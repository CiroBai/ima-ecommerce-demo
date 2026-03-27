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
  {
    category: "美妆护肤",
    title: "亚马逊 A+ 品牌页",
    desc: "完整A+内容模板：品牌横幅+卖点矩阵+竞品对比+场景图集+FAQ",
    prompt: "beauty brand A+ content, professional lifestyle photography, clean white background, premium aesthetic",
    tags: ["亚马逊", "A+", "品牌"],
    badge: "top",
    badgeText: "👑 TOP",
    bg: "linear-gradient(135deg,#dbeafe,#bfdbfe)",
    emoji: "⭐",
    views: "2.5k",
    rating: "4.9",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");

  const handleCategoryClick = (catId: string) => {
    setSelectedCat(catId);
    // Navigate to workspace with category
    router.push(`/workspace?category=${encodeURIComponent(catId)}`);
  };

  const handleUrlAnalyze = () => {
    if (!urlInput.trim()) return;
    router.push(`/workspace?url=${encodeURIComponent(urlInput)}`);
  };

  const handleTemplateUse = (tpl: (typeof TEMPLATES)[0]) => {
    router.push(
      `/workspace?category=${encodeURIComponent(tpl.category)}&prompt=${encodeURIComponent(tpl.prompt)}`
    );
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sb-logo">
          <div className="sb-logo-icon">IM</div>
          <div className="sb-logo-text">
            <span>IMA</span> Studio
          </div>
        </div>
        <div className="sb-item active">
          <span>🛍️</span> 电商创意 <span className="sb-badge">NEW</span>
        </div>
        <div className="sb-item">
          <span>🖼️</span> 我的作品
        </div>
        <div className="sb-item">
          <span>📋</span> 模板库
        </div>
        <div className="sb-divider" />
        <div className="sb-item">
          <span>⚙️</span> 设置
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

      {/* Main */}
      <main className="main-area">
        <div className="topbar">
          <div className="credits-badge">✦ 365 积分</div>
        </div>

        {/* Hero */}
        <div className="hero fi">
          <h1>AI 电商创意套件</h1>
          <p>从商品链接到完整上架素材 — 图片、视频、A+ 内容一键生成</p>
          <div className="url-hero">
            <div className="url-input-wrap">
              <input
                type="text"
                placeholder="粘贴商品链接（淘宝、京东、亚马逊、Shopify 等）..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUrlAnalyze()}
              />
              <button onClick={handleUrlAnalyze}>智能分析并生成 →</button>
            </div>
            <div className="url-hint">
              支持 <span>亚马逊</span>、<span>Shopify</span>、<span>Etsy</span>、
              <span>TikTok 小店</span> 或任意商品页面
            </div>
          </div>
          <p style={{ color: "var(--t3)", fontSize: 12, marginBottom: 20 }}>
            — 或者选择商品品类 —
          </p>

          {/* Category Grid */}
          <div className="cat-grid">
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
          <h2>🎯 爆款模板 · 一键制作同款</h2>
          <p className="tpl-sub">精选各品类高转化模板，点击即可直接套用生成</p>
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
                    <button className="tpl-make" onClick={(e) => { e.stopPropagation(); handleTemplateUse(tpl); }}>
                      一键制作
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
