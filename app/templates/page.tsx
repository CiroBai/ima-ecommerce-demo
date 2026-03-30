"use client";

import { useState } from "react";

interface Template {
  id: number;
  name: string;
  desc: string;
  platform: string;
  platformIcon: string;
  category: string;
  categoryIcon: string;
  type: string;
  typeIcon: string;
  uses: string;
  rating: string;
  gradient: string;
  emoji: string;
  contents: string;
  href: string;
}

const TEMPLATES: Template[] = [
  { id: 1, name: "亚马逊白底主图7件套", desc: "纯白背景符合亚马逊规范，含主图+场景图+信息图完整套组", platform: "Amazon", platformIcon: "🛒", category: "服装", categoryIcon: "👗", type: "图片", typeIcon: "📸", uses: "2.3k", rating: "4.9", gradient: "linear-gradient(135deg,#fef9c3,#fde68a)", emoji: "👗", contents: "7张图：主图×1 + 场景图×2 + 信息图×2 + 细节图×1 + 包装图×1", href: "/product" },
  { id: 2, name: "小红书种草风美妆图", desc: "马卡龙色调平铺摆拍，ins风柔光，适合小红书/抖音种草", platform: "小红书", platformIcon: "📱", category: "美妆", categoryIcon: "💄", type: "图片", typeIcon: "📸", uses: "3.1k", rating: "4.8", gradient: "linear-gradient(135deg,#fce7f3,#fbcfe8)", emoji: "💄", contents: "5张图：封面×1 + 细节×2 + 对比×1 + 成分×1", href: "/poster" },
  { id: 3, name: "TikTok开箱15秒模板", desc: "悬念开头→特写→功能演示→购买引导，高完播率", platform: "TikTok", platformIcon: "🎬", category: "数码", categoryIcon: "📱", type: "视频", typeIcon: "🎬", uses: "1.8k", rating: "4.7", gradient: "linear-gradient(135deg,#e0e7ff,#c7d2fe)", emoji: "📦", contents: "4段视频：开箱片段×1 + 特写×1 + 演示×1 + 结尾引流×1", href: "/tiktok-video" },
  { id: 4, name: "北欧风家居场景图", desc: "暖色灯光+木质桌面+绿植点缀，温馨北欧风场景", platform: "Shopee", platformIcon: "🟠", category: "家居", categoryIcon: "🏠", type: "图片", typeIcon: "📸", uses: "1.5k", rating: "4.9", gradient: "linear-gradient(135deg,#d1fae5,#a7f3d0)", emoji: "🏠", contents: "6张图：主场景×2 + 细节×2 + 使用场景×1 + 尺寸图×1", href: "/product" },
  { id: 5, name: "Instagram轮播教程5p", desc: "5页教程卡片，封面吸睛+内容干货，提升收藏率", platform: "Instagram", platformIcon: "📸", category: "教程", categoryIcon: "📊", type: "轮播", typeIcon: "🎠", uses: "2.0k", rating: "4.6", gradient: "linear-gradient(135deg,#f0abfc,#e879f9)", emoji: "📚", contents: "5张图：封面×1 + 内容页×3 + 行动引导×1", href: "/carousel" },
  { id: 6, name: "品牌Logo极简4方案", desc: "4套截然不同风格的Logo方案，含字体配色指南", platform: "品牌", platformIcon: "🎯", category: "设计", categoryIcon: "🎨", type: "Logo", typeIcon: "🎨", uses: "1.2k", rating: "4.8", gradient: "linear-gradient(135deg,#fbbf24,#f59e0b)", emoji: "✨", contents: "4套Logo：极简风×1 + 高端风×1 + 渐变风×1 + 温暖风×1", href: "/branding" },
  { id: 7, name: "食品诱惑短视频30s", desc: "特写+慢动作，暖色调大光圈，让人食欲大开", platform: "抖音", platformIcon: "🍵", category: "食品", categoryIcon: "🍵", type: "视频", typeIcon: "🎬", uses: "2.0k", rating: "4.8", gradient: "linear-gradient(135deg,#fed7aa,#fdba74)", emoji: "🍜", contents: "3段视频：展示片段×1 + 制作过程×1 + 享用特写×1", href: "/tiktok-video" },
  { id: 8, name: "奢华珠宝展示套图", desc: "黑色丝绒底+聚光灯，钻石反光效果，极致高级感", platform: "独立站", platformIcon: "💎", category: "珠宝", categoryIcon: "💎", type: "图片", typeIcon: "📸", uses: "1.2k", rating: "5.0", gradient: "linear-gradient(135deg,#312e81,#1e1b4b)", emoji: "💎", contents: "8张图：主图×2 + 侧面×2 + 细节特写×2 + 佩戴效果×2", href: "/product" },
  { id: 9, name: "Shopee美妆卖点5图", desc: "橙色系设计，突出5大核心卖点，符合Shopee视觉规范", platform: "Shopee", platformIcon: "🟠", category: "美妆", categoryIcon: "💄", type: "图片", typeIcon: "📸", uses: "980", rating: "4.7", gradient: "linear-gradient(135deg,#fed7aa,#fb923c)", emoji: "🧴", contents: "5张图：封面主图×1 + 卖点图×3 + 成分图×1", href: "/product" },
  { id: 10, name: "三折页宣传册模板", desc: "商务风三折页设计，适合企业品牌宣传和展会使用", platform: "宣传册", platformIcon: "📄", category: "企业", categoryIcon: "🏢", type: "PDF", typeIcon: "📄", uses: "650", rating: "4.5", gradient: "linear-gradient(135deg,#e2e8f0,#cbd5e1)", emoji: "📋", contents: "1份PDF：封面×1 + 内容页×4 + 封底×1（6面折叠）", href: "/brochure" },
  { id: 11, name: "LinkedIn专业海报", desc: "商务蓝+白色字体，专业感十足，适合品牌宣传和招聘", platform: "LinkedIn", platformIcon: "💼", category: "商务", categoryIcon: "📊", type: "海报", typeIcon: "🖼", uses: "820", rating: "4.6", gradient: "linear-gradient(135deg,#bfdbfe,#93c5fd)", emoji: "💼", contents: "3张图：方形版×1 + 横版×1 + 竖版×1（多尺寸适配）", href: "/poster" },
  { id: 12, name: "多巴胺色系首饰图", desc: "高饱和撞色，年轻化视觉，适合TikTok快手等短视频平台", platform: "TikTok", platformIcon: "📱", category: "珠宝", categoryIcon: "💎", type: "图片", typeIcon: "📸", uses: "1.6k", rating: "4.9", gradient: "linear-gradient(135deg,#f0abfc,#a78bfa,#6ee7b7)", emoji: "🌈", contents: "6张图：撞色平铺×2 + 悬挂展示×2 + 佩戴场景×2", href: "/product" },
];

const CATEGORIES = ["全部", "服装", "美妆", "数码", "家居", "食品", "珠宝"];
const SORTS = ["最热", "最新", "评分最高"];

export default function TemplatesPage() {
  const [category, setCategory] = useState("全部");
  const [sort, setSort] = useState("最热");
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selected, setSelected] = useState<Template | null>(null);

  const filtered = TEMPLATES.filter(t => {
    if (category !== "全部" && t.category !== category) return false;
    if (search && !t.name.includes(search) && !t.category.includes(search)) return false;
    return true;
  }).sort((a, b) => {
    if (sort === "评分最高") return parseFloat(b.rating) - parseFloat(a.rating);
    if (sort === "最新") return b.id - a.id;
    return parseFloat(b.uses.replace("k", "000")) - parseFloat(a.uses.replace("k", "000"));
  });

  const toggleFav = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(f => f.includes(id) ? f.filter(x => x !== id) : [...f, id]);
  };

  return (
    <>
      <div className="topbar">
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, color: "var(--t3)" }}>工具</span>
          <span style={{ color: "var(--t3)" }}>/</span>
          <span style={{ fontSize: 13, fontWeight: 600 }}>模板市场</span>
        </div>
        <div className="credits-badge">✦ 365 积分</div>
      </div>

      <div className="batch-page-wrap fi">
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--font-display, \'Plus Jakarta Sans\', system-ui, sans-serif)", letterSpacing: "-0.02em", marginBottom: 6 }}>🏪 模板市场</h1>
          <p style={{ fontSize: 13, color: "var(--t2)" }}>精选高转化模板，一键套用到工作台，快速启动内容生产</p>
        </div>

        {/* Search + Filters */}
        <div style={{ marginBottom: 20, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
          <input
            placeholder="🔍 搜索模板..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              padding: "8px 14px", borderRadius: 8, fontSize: 13,
              background: "var(--bg3)", border: "1px solid var(--bd)",
              color: "var(--fg)", outline: "none", fontFamily: "inherit", width: 220,
            }}
          />
          <div className="templates-filter-wrap" style={{ flex: 1 }}>
            <div className="templates-filter-bar">
              {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                style={{
                  padding: "6px 14px", borderRadius: 8, fontSize: 12,
                  background: category === c ? "rgba(249,115,22,0.15)" : "var(--bg3)",
                  border: `1px solid ${category === c ? "rgba(249,115,22,0.4)" : "var(--bd)"}`,
                  color: category === c ? "#f97316" : "var(--t2)",
                  cursor: "pointer", fontFamily: "inherit", fontWeight: category === c ? 700 : 400,
                }}
              >{c}</button>
            ))}
            </div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "var(--t3)" }}>排序</span>
            {SORTS.map(s => (
              <button
                key={s}
                onClick={() => setSort(s)}
                style={{
                  padding: "5px 12px", borderRadius: 6, fontSize: 11,
                  background: sort === s ? "rgba(168,85,247,0.15)" : "transparent",
                  border: `1px solid ${sort === s ? "rgba(168,85,247,0.4)" : "var(--bd)"}`,
                  color: sort === s ? "#a855f7" : "var(--t3)",
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >{s}</button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="templates-grid">
          {filtered.map(tpl => (
            <div
              key={tpl.id}
              onClick={() => setSelected(tpl)}
              style={{
                background: "var(--bg3)", border: "1px solid var(--bd)",
                borderRadius: 14, overflow: "hidden", cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                (e.currentTarget as HTMLElement).style.borderColor = "var(--acc)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.borderColor = "var(--bd)";
              }}
            >
              {/* Preview */}
              <div style={{
                height: 120, background: tpl.gradient,
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative",
              }}>
                <span style={{ fontSize: 48, opacity: 0.7 }}>{tpl.emoji}</span>
                <button
                  onClick={e => toggleFav(tpl.id, e)}
                  style={{
                    position: "absolute", top: 8, right: 8,
                    background: "rgba(0,0,0,0.3)", border: "none",
                    borderRadius: 6, width: 28, height: 28,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", fontSize: 14,
                  }}
                >
                  {favorites.includes(tpl.id) ? "❤️" : "🤍"}
                </button>
                <div style={{
                  position: "absolute", bottom: 8, right: 8,
                  display: "flex", gap: 4,
                }}>
                  <span style={{ background: "rgba(0,0,0,0.4)", borderRadius: 4, padding: "2px 6px", fontSize: 10, color: "#fff" }}>
                    ⭐ {tpl.rating}
                  </span>
                  <span style={{ background: "rgba(0,0,0,0.4)", borderRadius: 4, padding: "2px 6px", fontSize: 10, color: "#fff" }}>
                    {tpl.uses}次
                  </span>
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: "12px 14px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{tpl.name}</div>
                <div style={{ fontSize: 11, color: "var(--t2)", marginBottom: 10, lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
                  {tpl.desc}
                </div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
                  {[`${tpl.platformIcon} ${tpl.platform}`, `${tpl.categoryIcon} ${tpl.category}`, `${tpl.typeIcon} ${tpl.type}`].map(tag => (
                    <span key={tag} style={{
                      fontSize: 9, padding: "2px 6px", borderRadius: 4,
                      background: "rgba(255,255,255,0.06)", color: "var(--t3)",
                    }}>{tag}</span>
                  ))}
                </div>
                <button
                  onClick={e => { e.stopPropagation(); setSelected(tpl); }}
                  style={{
                    width: "100%", padding: "6px", borderRadius: 8,
                    background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.3)",
                    color: "#f97316", fontSize: 12, fontWeight: 600,
                    cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  使用模板
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ padding: "64px", textAlign: "center", color: "var(--t3)" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 14 }}>未找到相关模板</div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 50, padding: 24,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "var(--bg3)", border: "1px solid var(--bd)",
              borderRadius: 18, width: "100%", maxWidth: 540,
              overflow: "hidden",
            }}
          >
            {/* Preview */}
            <div style={{
              height: 200, background: selected.gradient,
              display: "flex", alignItems: "center", justifyContent: "center",
              position: "relative",
            }}>
              <span style={{ fontSize: 72, opacity: 0.6 }}>{selected.emoji}</span>
              <button
                onClick={() => setSelected(null)}
                style={{
                  position: "absolute", top: 12, right: 12,
                  background: "rgba(0,0,0,0.4)", border: "none",
                  borderRadius: 8, width: 32, height: 32,
                  color: "#fff", fontSize: 16, cursor: "pointer",
                }}
              >✕</button>
            </div>
            <div style={{ padding: "24px" }}>
              <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
                {[`${selected.platformIcon} ${selected.platform}`, `${selected.categoryIcon} ${selected.category}`, `${selected.typeIcon} ${selected.type}`].map(tag => (
                  <span key={tag} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 6, background: "rgba(255,255,255,0.08)", color: "var(--t2)" }}>{tag}</span>
                ))}
                <span style={{ marginLeft: "auto", fontSize: 12, color: "#f97316", fontWeight: 700 }}>⭐ {selected.rating} · {selected.uses}次使用</span>
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>{selected.name}</h2>
              <p style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.6, marginBottom: 16 }}>{selected.desc}</p>
              <div style={{
                background: "var(--bg4)", border: "1px solid var(--bd)",
                borderRadius: 10, padding: "12px 14px", marginBottom: 20,
              }}>
                <div style={{ fontSize: 11, color: "var(--t3)", fontWeight: 700, marginBottom: 6, textTransform: "uppercase" }}>包含内容</div>
                <div style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.6 }}>{selected.contents}</div>
              </div>
              <a
                href={selected.href}
                style={{
                  display: "block", width: "100%", padding: "12px",
                  background: "linear-gradient(135deg, #f97316, #ec4899)",
                  color: "#fff", fontSize: 14, fontWeight: 700,
                  border: "none", borderRadius: 10, cursor: "pointer",
                  textAlign: "center", textDecoration: "none",
                }}
              >
                立即使用 →
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
