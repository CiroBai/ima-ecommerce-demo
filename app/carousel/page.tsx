"use client";

import { useState } from "react";

const PLATFORMS = [
  { key: "instagram", label: "Instagram", ratio: "4:5", icon: "📸" },
  { key: "xhs", label: "小红书", ratio: "3:4", icon: "🌸" },
  { key: "tiktok", label: "TikTok", ratio: "9:16", icon: "🎵" },
  { key: "linkedin", label: "LinkedIn", ratio: "1:1", icon: "💼" },
];

const SLIDE_COUNTS = [3, 5, 7, 10];

const NARRATIVE_TYPES = [
  { key: "tutorial", label: "教程型", icon: "📖", desc: "Step-by-step 教程，降低决策门槛" },
  { key: "story", label: "故事型", icon: "📖", desc: "情感叙事，建立品牌连接" },
  { key: "compare", label: "对比型", icon: "⚖️", desc: "Before/After，直观展示价值" },
  { key: "list", label: "清单型", icon: "📋", desc: "Top N 技巧，实用易收藏" },
];

const FONTS = ["现代", "经典", "手写", "粗体"];

interface Slide {
  id: string;
  role: "cover" | "content" | "cta";
  title: string;
  subtitle: string;
  hint: string;
  status: "idle" | "generating" | "done";
}

const ROLE_LABELS: Record<Slide["role"], string> = { cover: "封面", content: "内容", cta: "CTA" };

const ROLE_COLORS: Record<Slide["role"], string> = {
  cover: "#f97316",
  content: "#a855f7",
  cta: "#ec4899",
};

const MOCK_DATA: Record<string, Slide[]> = {
  tutorial: [
    { id: "s1", role: "cover", title: "5个让你的亚马逊Listing点击率翻倍的秘密", subtitle: "实测有效 · 3分钟读完", hint: "封面：高对比钩子，3秒抓住注意力", status: "idle" },
    { id: "s2", role: "content", title: "秘密1：主图必须纯白底，产品占85%以上", subtitle: "亚马逊算法会优先展示符合规范的主图", hint: "内容：一页一核心观点，配数据/图示", status: "idle" },
    { id: "s3", role: "content", title: "秘密2：场景图要真实，不要假的3D渲染", subtitle: "买家信任真实使用场景，转化率提升40%", hint: "内容：对比示例效果最佳", status: "idle" },
    { id: "s4", role: "content", title: "秘密3：信息图用数字说话，不用形容词", subtitle: "「快5倍」比「非常快」说服力强10倍", hint: "内容：加入数据对比图", status: "idle" },
    { id: "s5", role: "cta", title: "关注我获取更多电商干货 → @IMAStudio", subtitle: "每周更新实战技巧，帮你少走弯路", hint: "CTA：清晰的行动指令+品牌标识", status: "idle" },
  ],
  story: [
    { id: "s1", role: "cover", title: "我是怎么从月销0到10万的？", subtitle: "一个普通卖家的真实故事", hint: "封面：情感钩子，引发共鸣", status: "idle" },
    { id: "s2", role: "content", title: "第一年：选品失败3次，亏了5万块", subtitle: "跟风大类，没有差异化，被大卖碾压", hint: "内容：真实痛点，制造代入感", status: "idle" },
    { id: "s3", role: "content", title: "转折点：发现了一个蓝海细分市场", subtitle: "月搜索量8000，竞争对手却只有3个", hint: "内容：展示数据支撑的发现过程", status: "idle" },
    { id: "s4", role: "content", title: "6个月后：BSR #1，月收入10万+", subtitle: "用IMA Studio批量制作的套图功不可没", hint: "内容：成果展示，数据说话", status: "idle" },
    { id: "s5", role: "cta", title: "你也想复刻这条路吗？", subtitle: "关注我 · 免费分享选品方法论", hint: "CTA：引导关注+价值主张", status: "idle" },
  ],
  compare: [
    { id: "s1", role: "cover", title: "普通商品图 vs AI套图：效果差多少？", subtitle: "真实案例对比，数据不会说谎", hint: "封面：悬念对比，激发好奇", status: "idle" },
    { id: "s2", role: "content", title: "主图对比：点击率差了3倍", subtitle: "左：手机随手拍  右：IMA Studio生成", hint: "内容：视觉对比图，冲击力强", status: "idle" },
    { id: "s3", role: "content", title: "场景图对比：转化率差了2.5倍", subtitle: "真实使用场景 vs 白底产品图", hint: "内容：转化数据作为支撑", status: "idle" },
    { id: "s4", role: "content", title: "制作效率对比：省了90%时间", subtitle: "传统拍摄3天 → AI生成15分钟", hint: "内容：效率对比+ROI计算", status: "idle" },
    { id: "s5", role: "cta", title: "现在就试试 IMA Studio", subtitle: "首月免费 · 5分钟出图 · 7天不满意退款", hint: "CTA：降低试用门槛", status: "idle" },
  ],
  list: [
    { id: "s1", role: "cover", title: "电商卖家必备的10个免费工具", subtitle: "全用上，效率提升200%", hint: "封面：数字+利益点，实用感强", status: "idle" },
    { id: "s2", role: "content", title: "工具1-3：选品分析三件套", subtitle: "Helium10 · Jungle Scout · Keepa", hint: "内容：分组列举，便于记忆", status: "idle" },
    { id: "s3", role: "content", title: "工具4-6：素材制作神器", subtitle: "IMA Studio · Canva · Remove.bg", hint: "内容：重点推荐核心工具", status: "idle" },
    { id: "s4", role: "content", title: "工具7-10：运营数据看板", subtitle: "Seller Board · SellerApp · ChatGPT", hint: "内容：补充工具清单", status: "idle" },
    { id: "s5", role: "cta", title: "保存这篇！下次找不到会后悔", subtitle: "关注获取完整工具使用教程", hint: "CTA：引导收藏+关注", status: "idle" },
  ],
};

export default function CarouselPage() {
  const [platform, setPlatform] = useState("instagram");
  const [slideCount, setSlideCount] = useState(5);
  const [narrative, setNarrative] = useState("tutorial");
  const [slides, setSlides] = useState<Slide[]>(MOCK_DATA.tutorial);
  const [primaryColor, setPrimaryColor] = useState("#f97316");
  const [accentColor, setAccentColor] = useState("#ec4899");
  const [font, setFont] = useState("现代");
  const [coverGenerated, setCoverGenerated] = useState(false);
  const [allGenerating, setAllGenerating] = useState(false);
  const [allProgress, setAllProgress] = useState(0);

  const handleNarrativeChange = (key: string) => {
    setNarrative(key);
    setCoverGenerated(false);
    const base = MOCK_DATA[key] || MOCK_DATA.tutorial;
    const adjusted = adjustSlideCount(base, slideCount, key);
    setSlides(adjusted.map((s) => ({ ...s, status: "idle" })));
  };

  const handleSlideCount = (count: number) => {
    setSlideCount(count);
    const base = MOCK_DATA[narrative] || MOCK_DATA.tutorial;
    setSlides(adjustSlideCount(base, count, narrative).map((s) => ({ ...s, status: "idle" })));
    setCoverGenerated(false);
  };

  function adjustSlideCount(base: Slide[], count: number, nar: string): Slide[] {
    if (count <= base.length) return base.slice(0, count);
    const extra: Slide[] = Array.from({ length: count - base.length }, (_, i) => ({
      id: `extra-${i}`,
      role: "content",
      title: `内容 ${base.length + i}: 在这里输入核心观点`,
      subtitle: "补充说明文案...",
      hint: `内容：第 ${base.length + i + 1} 张幻灯片`,
      status: "idle" as const,
    }));
    const last = base[base.length - 1];
    return [...base.slice(0, -1), ...extra, last];
  }

  const updateSlide = (id: string, field: keyof Slide, value: string) => {
    setSlides((prev) => prev.map((s) => s.id === id ? { ...s, [field]: value } : s));
  };

  const moveSlide = (id: string, dir: -1 | 1) => {
    setSlides((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx + dir < 0 || idx + dir >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[idx + dir]] = [next[idx + dir], next[idx]];
      return next;
    });
  };

  const removeSlide = (id: string) => {
    setSlides((prev) => prev.filter((s) => s.id !== id));
  };

  const addSlide = () => {
    const newSlide: Slide = {
      id: `new-${Date.now()}`, role: "content",
      title: "新幻灯片：输入标题...",
      subtitle: "副标题...",
      hint: "内容：自定义幻灯片",
      status: "idle",
    };
    const lastIdx = slides.findLastIndex((s) => s.role !== "cta");
    const insertAt = lastIdx === -1 ? slides.length : lastIdx + 1;
    const next = [...slides];
    next.splice(insertAt, 0, newSlide);
    setSlides(next);
  };

  const handleGenerateCover = async () => {
    setSlides((prev) => prev.map((s, i) => i === 0 ? { ...s, status: "generating" } : s));
    await new Promise((r) => setTimeout(r, 1200));
    setSlides((prev) => prev.map((s, i) => i === 0 ? { ...s, status: "done" } : s));
    setCoverGenerated(true);
  };

  const handleGenerateAll = async () => {
    setAllGenerating(true);
    setAllProgress(0);
    const pending = slides.filter((s) => s.status !== "done");
    for (let i = 0; i < pending.length; i++) {
      setSlides((prev) => prev.map((s) => s.id === pending[i].id ? { ...s, status: "generating" } : s));
      await new Promise((r) => setTimeout(r, 600));
      setSlides((prev) => prev.map((s) => s.id === pending[i].id ? { ...s, status: "done" } : s));
      setAllProgress(Math.round(((i + 1) / pending.length) * 100));
    }
    setAllGenerating(false);
  };

  const totalCredits = slides.filter((s) => s.status !== "done").length * 12;
  const doneCount = slides.filter((s) => s.status === "done").length;

  return (
    <>
      <div className="topbar">
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 13, color: "var(--t2)", fontWeight: 600 }}>🎠 轮播图设计</span>
        </div>
        <div className="credits-badge">✦ 365 积分</div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 40px" }}>
        <div className="fi">
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>🎠 轮播图设计</h1>
          <p style={{ fontSize: 13, color: "var(--t3)", marginBottom: 28 }}>
            规划幻灯片叙事结构 → 单张生成 → 一键批量出图
          </p>
        </div>

        {/* A. 基础配置 */}
        <div className="fi" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
          {/* Platform */}
          <div style={cardStyle}>
            <div style={sectionTitle}>📱 平台</div>
            {PLATFORMS.map((p) => (
              <button key={p.key} onClick={() => setPlatform(p.key)} style={optionBtn(platform === p.key)}>
                {p.icon} <strong>{p.label}</strong>
                <span style={{ fontSize: 10, color: "var(--t3)", marginLeft: "auto" }}>{p.ratio}</span>
              </button>
            ))}
          </div>

          {/* Slide Count */}
          <div style={cardStyle}>
            <div style={sectionTitle}>🃏 张数</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {SLIDE_COUNTS.map((n) => (
                <button key={n} onClick={() => handleSlideCount(n)} style={{
                  ...optionBtn(slideCount === n),
                  justifyContent: "center", fontSize: 16, fontWeight: 800,
                }}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Narrative */}
          <div style={cardStyle}>
            <div style={sectionTitle}>📐 叙事类型</div>
            {NARRATIVE_TYPES.map((n) => (
              <button key={n.key} onClick={() => handleNarrativeChange(n.key)} style={optionBtn(narrative === n.key)}>
                {n.icon} <span style={{ flex: 1 }}>{n.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* B. Slides Panel */}
        <div className="fi" style={{ marginBottom: 20 }}>
          <div style={{
            background: "var(--bg3)", border: "1px solid var(--bd)", borderRadius: 16, padding: 20,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>📋 幻灯片规划</div>
                <div style={{ fontSize: 11, color: "var(--t3)" }}>
                  {NARRATIVE_TYPES.find((n) => n.key === narrative)?.desc}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "var(--acc)" }}>
                  {totalCredits} <span style={{ fontSize: 11, fontWeight: 400 }}>积分</span>
                </div>
                <div style={{ fontSize: 10, color: "var(--t3)" }}>{doneCount}/{slides.length} 已生成</div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {slides.map((slide, idx) => (
                <SlideCard
                  key={slide.id}
                  slide={slide}
                  index={idx}
                  total={slides.length}
                  primaryColor={primaryColor}
                  onUpdate={updateSlide}
                  onMove={moveSlide}
                  onRemove={removeSlide}
                />
              ))}
              <button onClick={addSlide} style={{
                padding: 12, borderRadius: 10, border: "1px dashed var(--bd)",
                background: "transparent", color: "var(--t2)", fontSize: 12,
                cursor: "pointer", fontFamily: "inherit",
              }}>
                + 添加幻灯片
              </button>
            </div>
          </div>
        </div>

        {/* C. Style Config */}
        <div className="fi" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          <div style={cardStyle}>
            <div style={sectionTitle}>🎨 色板</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <ColorRow label="主色" value={primaryColor} onChange={setPrimaryColor} />
              <ColorRow label="强调色" value={accentColor} onChange={setAccentColor} />
            </div>
          </div>
          <div style={cardStyle}>
            <div style={sectionTitle}>🔤 字体风格</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {FONTS.map((f) => (
                <button key={f} onClick={() => setFont(f)} style={{
                  padding: "6px 16px", borderRadius: 20, fontSize: 12,
                  cursor: "pointer", fontFamily: "inherit",
                  background: font === f ? "rgba(249,115,22,0.15)" : "var(--bg4)",
                  border: `1px solid ${font === f ? "rgba(249,115,22,0.5)" : "var(--bd)"}`,
                  color: font === f ? "#f97316" : "var(--t2)",
                }}>
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generate Actions */}
        <div className="fi">
          <div style={cardStyle}>
            {allGenerating && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>批量生成中...</span>
                  <span style={{ fontSize: 12, color: "var(--acc)" }}>{allProgress}%</span>
                </div>
                <div style={{ height: 6, background: "var(--bd)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${allProgress}%`, background: "linear-gradient(90deg, var(--acc), var(--pk))", transition: "width 0.3s" }} />
                </div>
              </div>
            )}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {!coverGenerated ? (
                <button onClick={handleGenerateCover} style={primaryBtnStyle}>
                  1️⃣ 先生成封面 · 12积分
                </button>
              ) : (
                <button onClick={handleGenerateAll} disabled={allGenerating} style={{
                  ...primaryBtnStyle,
                  background: allGenerating ? "var(--bd)" : "linear-gradient(135deg, var(--acc), var(--pk))",
                  cursor: allGenerating ? "wait" : "pointer",
                }}>
                  {allGenerating ? `批量生成中 ${allProgress}%...` : `2️⃣ 批量生成全部 · ${totalCredits}积分`}
                </button>
              )}
              {doneCount === slides.length && (
                <button style={secondaryBtnStyle}>📦 打包下载</button>
              )}
              <button style={secondaryBtnStyle}>📋 导出脚本</button>
            </div>
            {coverGenerated && !allGenerating && doneCount < slides.length && (
              <div style={{ marginTop: 10, fontSize: 11, color: "var(--t3)" }}>
                ✅ 封面已生成，确认满意后点击批量生成剩余 {slides.length - 1} 张
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function SlideCard({
  slide, index, total, primaryColor, onUpdate, onMove, onRemove,
}: {
  slide: Slide; index: number; total: number; primaryColor: string;
  onUpdate: (id: string, field: keyof Slide, value: string) => void;
  onMove: (id: string, dir: -1 | 1) => void;
  onRemove: (id: string) => void;
}) {
  const roleColor = ROLE_COLORS[slide.role];
  const isDone = slide.status === "done";
  const isGenerating = slide.status === "generating";

  return (
    <div style={{
      background: isDone ? "rgba(34,197,94,0.04)" : isGenerating ? "rgba(249,115,22,0.04)" : "var(--bg4)",
      border: `1px solid ${isDone ? "rgba(34,197,94,0.3)" : isGenerating ? "rgba(249,115,22,0.3)" : "var(--bd)"}`,
      borderRadius: 14, padding: "14px 16px", transition: "all 0.15s",
    }}>
      <div style={{ display: "flex", gap: 14 }}>
        {/* Left meta */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flexShrink: 0, width: 40 }}>
          <div style={{
            fontSize: 14, fontWeight: 800, color: "var(--t3)",
          }}>
            {index + 1}
          </div>
          <div style={{
            padding: "2px 6px", borderRadius: 8, fontSize: 9, fontWeight: 700,
            background: `${roleColor}22`, color: roleColor, border: `1px solid ${roleColor}44`,
          }}>
            {ROLE_LABELS[slide.role]}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 4 }}>
            <button onClick={() => onMove(slide.id, -1)} disabled={index === 0} style={arrowBtn}>▲</button>
            <button onClick={() => onMove(slide.id, 1)} disabled={index === total - 1} style={arrowBtn}>▼</button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          <input
            value={slide.title}
            onChange={(e) => onUpdate(slide.id, "title", e.target.value)}
            style={slideInputStyle}
            placeholder="标题文案..."
          />
          <input
            value={slide.subtitle}
            onChange={(e) => onUpdate(slide.id, "subtitle", e.target.value)}
            style={{ ...slideInputStyle, fontSize: 12, color: "var(--t2)" }}
            placeholder="副标题..."
          />
          <div style={{
            fontSize: 10, color: "var(--t3)", background: "var(--bg3)",
            borderRadius: 6, padding: "5px 8px", borderLeft: `2px solid ${roleColor}`,
          }}>
            💡 {slide.hint}
          </div>

          {isDone && (
            <div style={{
              height: 48, borderRadius: 8,
              background: `linear-gradient(135deg, ${primaryColor}15, #ec489910)`,
              border: "1px dashed rgba(34,197,94,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, color: "#22c55e",
            }}>
              ✅ 已生成 — 点击预览
            </div>
          )}
        </div>

        {/* Remove */}
        <button onClick={() => onRemove(slide.id)} style={{
          width: 24, height: 24, flexShrink: 0, borderRadius: 6,
          border: "none", background: "rgba(239,68,68,0.1)", color: "#ef4444",
          fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "inherit", marginTop: 2,
        }}>×</button>
      </div>
    </div>
  );
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const PRESETS = ["#f97316", "#ec4899", "#a855f7", "#06b6d4", "#22c55e", "#eab308"];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 11, color: "var(--t3)", width: 36 }}>{label}</span>
      <div style={{ display: "flex", gap: 5, flex: 1 }}>
        {PRESETS.map((c) => (
          <button key={c} onClick={() => onChange(c)} style={{
            width: 20, height: 20, borderRadius: "50%", background: c,
            border: value === c ? "2px solid #fff" : "2px solid transparent", cursor: "pointer",
          }} />
        ))}
      </div>
      <input value={value} onChange={(e) => onChange(e.target.value)} style={{
        width: 70, background: "var(--bg)", border: "1px solid var(--bd)",
        borderRadius: 6, padding: "3px 6px", fontSize: 10, color: "var(--fg)", fontFamily: "inherit", outline: "none",
      }} />
    </div>
  );
}

// ─── Styles ────────────────────────────────
const cardStyle: React.CSSProperties = {
  background: "var(--bg3)", border: "1px solid var(--bd)", borderRadius: 16, padding: 18,
};
const sectionTitle: React.CSSProperties = {
  fontSize: 12, fontWeight: 700, marginBottom: 10, color: "var(--t2)",
};
const optionBtn = (active: boolean): React.CSSProperties => ({
  display: "flex", alignItems: "center", gap: 8,
  width: "100%", padding: "7px 10px", marginBottom: 4, borderRadius: 8,
  fontSize: 12, cursor: "pointer", fontFamily: "inherit", textAlign: "left",
  background: active ? "rgba(249,115,22,0.15)" : "transparent",
  border: `1px solid ${active ? "rgba(249,115,22,0.4)" : "transparent"}`,
  color: active ? "#f97316" : "var(--t2)",
});
const slideInputStyle: React.CSSProperties = {
  width: "100%", background: "var(--bg3)", border: "1px solid var(--bd)",
  borderRadius: 8, padding: "8px 10px", fontSize: 13, color: "var(--fg)",
  fontFamily: "inherit", outline: "none",
};
const arrowBtn: React.CSSProperties = {
  width: 20, height: 20, borderRadius: 4, border: "1px solid var(--bd)",
  background: "transparent", color: "var(--t3)", fontSize: 9, cursor: "pointer", fontFamily: "inherit",
  display: "flex", alignItems: "center", justifyContent: "center",
};
const primaryBtnStyle: React.CSSProperties = {
  padding: "12px 28px", borderRadius: 10, fontSize: 14, fontWeight: 700,
  cursor: "pointer", fontFamily: "inherit", border: "none",
  background: "linear-gradient(135deg, var(--acc), var(--pk))", color: "#fff",
};
const secondaryBtnStyle: React.CSSProperties = {
  padding: "12px 20px", borderRadius: 10, fontSize: 12, fontWeight: 600,
  cursor: "pointer", fontFamily: "inherit",
  background: "rgba(255,255,255,0.05)", border: "1px solid var(--bd)", color: "var(--t2)",
};
