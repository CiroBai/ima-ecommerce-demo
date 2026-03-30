"use client";

import { useState } from "react";

interface MockProduct {
  platform: string;
  title: string;
  price: string;
  originalPrice: string;
  rating: number;
  reviews: number;
  image: string;
  description: string;
  sellingPoints: string[];
  category: string;
  targetMarket: string;
  persona: string;
}

type GenerationStatus = "idle" | "generating" | "done";
type PlatformKey = "amazon" | "tiktok" | "shopee";

interface ImageSlot {
  id: number;
  type: string;
  icon: string;
  purpose: string;
  strategy: "text_to_image" | "image_to_image";
  credits: number;
  optional?: boolean;
}

const MOCK_PRODUCTS: Record<string, MockProduct> = {
  amazon: {
    platform: "Amazon",
    title: "Wireless Bluetooth Earbuds, Active Noise Cancelling Headphones",
    price: "$29.99",
    originalPrice: "$49.99",
    rating: 4.6,
    reviews: 2847,
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=80",
    description: "真无线蓝牙耳机，主动降噪，30小时续航，IPX5防水",
    sellingPoints: [
      "主动降噪 — 消除90%环境噪音",
      "30小时续航 — 单次6h+充电盒24h",
      "IPX5防水 — 运动出汗不担心",
      "单耳/双耳模式 — 随时接听电话",
      "蓝牙5.3 — 连接稳定无延迟",
    ],
    category: "数码电子",
    targetMarket: "北美市场",
    persona: "25-40岁都市白领，通勤/健身人群，追求音质与续航的平衡",
  },
  tiktok: {
    platform: "TikTok Shop",
    title: "韩系小众设计感戒指 女ins风轻奢多巴胺彩色钻石叠戴",
    price: "¥29.9",
    originalPrice: "¥89.9",
    rating: 4.8,
    reviews: 15623,
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80",
    description: "韩国小众设计，ins风多巴胺色系，适合叠戴搭配，黄铜镀金工艺",
    sellingPoints: [
      "韩系小众设计 — 差异化爆款款式",
      "多巴胺色系 — 拍照出片率超高",
      "叠戴玩法 — 一件商品多种搭配",
      "黄铜镀金 — 不掉色不过敏",
    ],
    category: "珠宝首饰",
    targetMarket: "东南亚市场",
    persona: "18-28岁女性，追求个性时尚，喜欢小红书/ins风格",
  },
  shopee: {
    platform: "Shopee",
    title: "Moisturizing Face Cream Anti-aging Hyaluronic Acid Skincare",
    price: "₱299",
    originalPrice: "₱599",
    rating: 4.7,
    reviews: 8921,
    image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&q=80",
    description: "玻尿酸保湿面霜，抗老补水，适合干性/混合性肌肤，无香精无酒精",
    sellingPoints: [
      "玻尿酸深层补水 — 锁住肌肤水分",
      "抗老修护配方 — 减淡细纹",
      "无香精无酒精 — 敏感肌可用",
      "轻盈不粘腻 — 四季通用",
      "临床测试认证 — 科学背书",
    ],
    category: "美妆护肤",
    targetMarket: "东南亚市场",
    persona: "20-35岁女性，注重护肤，追求性价比，关注成分党",
  },
};

const AMAZON_SLOTS: ImageSlot[] = [
  { id: 1, type: "主图", icon: "📸", purpose: "纯白底，产品占比≥85%，无文字。亚马逊强制要求，直接影响点击率。", strategy: "image_to_image", credits: 12 },
  { id: 2, type: "场景图", icon: "🏠", purpose: "真实使用场景，产品占30-50%。激发购买欲，让用户代入使用画面。", strategy: "text_to_image", credits: 15 },
  { id: 3, type: "信息图-卖点", icon: "📊", purpose: "核心功能一览，每点配图标。扫一眼即懂的卖点矩阵，降低决策成本。", strategy: "text_to_image", credits: 18 },
  { id: 4, type: "细节图", icon: "🔍", purpose: "材质/工艺特写，放大产品细节。消除实物图不符的顾虑。", strategy: "image_to_image", credits: 10 },
  { id: 5, type: "多角度图", icon: "🔄", purpose: "补充视角展示，正面/侧面/背面。全方位展示产品，减少退货率。", strategy: "image_to_image", credits: 12 },
  { id: 6, type: "信息图-对比", icon: "⚖️", purpose: "数据化优势，与竞品对比。用数字说话，建立产品信心。", strategy: "text_to_image", credits: 18 },
  { id: 7, type: "包装内容图", icon: "📦", purpose: "清晰展示包装内全部内容。消除顾虑，减少差评。", strategy: "image_to_image", credits: 10 },
  { id: 8, type: "尺寸对比图", icon: "📏", purpose: "与常见物品（手机/硬币）对比尺寸。帮助买家准确感知产品大小。", strategy: "text_to_image", credits: 12, optional: true },
  { id: 9, type: "品牌故事", icon: "✨", purpose: "品牌背书，讲述品牌理念与专业度。建立信任，提升溢价空间。", strategy: "text_to_image", credits: 15, optional: true },
];

const SHOPEE_SLOTS: ImageSlot[] = [
  { id: 1, type: "主图", icon: "📸", purpose: "白底或简洁背景，产品清晰居中，视觉第一印象。", strategy: "image_to_image", credits: 12 },
  { id: 2, type: "场景图", icon: "🏠", purpose: "生活化使用场景，增加代入感，激发购买欲。", strategy: "text_to_image", credits: 15 },
  { id: 3, type: "卖点图", icon: "📊", purpose: "核心卖点可视化，突出差异化优势，快速建立认知。", strategy: "text_to_image", credits: 18 },
  { id: 4, type: "细节图", icon: "🔍", purpose: "产品细节特写，展示品质工艺，增强信任感。", strategy: "image_to_image", credits: 10 },
  { id: 5, type: "包装图", icon: "📦", purpose: "展示完整包装内容，消除顾虑，降低退货率。", strategy: "image_to_image", credits: 10 },
];

const TIKTOK_SLOTS: ImageSlot[] = [
  { id: 1, type: "封面帧", icon: "🎬", purpose: "视频封面，黄金3秒钩子。高点击率的视觉起点，决定完播率。", strategy: "text_to_image", credits: 15 },
  { id: 2, type: "产品亮相帧", icon: "✨", purpose: "产品全貌展示，360°旋转展示卖相，建立第一印象。", strategy: "image_to_image", credits: 15 },
  { id: 3, type: "使用场景帧", icon: "🎭", purpose: "真实使用场景，触发用户共鸣，引发情感连接。", strategy: "text_to_image", credits: 15 },
  { id: 4, type: "卖点特写帧", icon: "🔍", purpose: "核心卖点放大，配字幕强调。信息密度最高的帧。", strategy: "image_to_image", credits: 12 },
  { id: 5, type: "购买引导帧", icon: "🛒", purpose: "CTA + 价格展示，引导点击购物车，直接转化。", strategy: "text_to_image", credits: 15 },
];

const PLATFORM_CONFIG: Record<PlatformKey, { label: string; icon: string; slots: ImageSlot[]; desc: string }> = {
  amazon: { label: "亚马逊", icon: "🛒", slots: AMAZON_SLOTS, desc: "7+2 专业 listing 图集" },
  tiktok: { label: "TikTok Shop", icon: "📱", slots: TIKTOK_SLOTS, desc: "视频分镜帧图" },
  shopee: { label: "Shopee", icon: "🟠", slots: SHOPEE_SLOTS, desc: "标准 5 图套组" },
};

const DEMO_URLS = [
  { url: "https://www.amazon.com/dp/B0XXXXXX", label: "🛒 Amazon" },
  { url: "https://www.tiktokshop.com/product/XXXXXX", label: "📱 TikTok" },
  { url: "https://shopee.ph/product/XXXXXX", label: "🟠 Shopee" },
];

function detectPlatform(url: string): PlatformKey {
  if (url.includes("amazon")) return "amazon";
  if (url.includes("tiktok") || url.includes("tiktokshop")) return "tiktok";
  if (url.includes("shopee")) return "shopee";
  const keys = Object.keys(MOCK_PRODUCTS) as PlatformKey[];
  return keys[Math.floor(Math.random() * keys.length)];
}

function SlotCard({ slot, selected, status, onClick }: {
  slot: ImageSlot;
  selected: boolean;
  status: GenerationStatus;
  onClick: () => void;
}) {
  const borderColor = status === "done" ? "rgba(34,197,94,0.5)"
    : status === "generating" ? "rgba(249,115,22,0.5)"
    : selected ? "rgba(249,115,22,0.4)" : "var(--bd)";
  const bgColor = status === "done" ? "rgba(34,197,94,0.05)"
    : status === "generating" ? "rgba(249,115,22,0.05)"
    : selected ? "rgba(249,115,22,0.06)" : "var(--bg3)";

  return (
    <div
      onClick={onClick}
      style={{
        background: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: 14, padding: 16,
        cursor: status === "generating" ? "wait" : "pointer",
        transition: "all 0.3s", position: "relative",
        boxShadow: selected ? "0 0 0 2px var(--acc), 0 0 20px var(--acc-glow)" : status === "done" ? "0 0 0 1px rgba(34,197,94,0.4)" : "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
          background: selected ? "rgba(249,115,22,0.2)" : "rgba(255,255,255,0.06)", flexShrink: 0,
        }}>
          {slot.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, color: "var(--t3)", lineHeight: 1 }}>
            图位 {slot.id}{slot.optional ? " · 可选" : ""}
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: selected ? "#f97316" : "var(--fg)" }}>{slot.type}</div>
        </div>
        <div style={{
          width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
          background: status === "done" ? "#22c55e" : status === "generating" ? "#f97316" : selected ? "#f97316" : "transparent",
          border: `1.5px solid ${status === "done" ? "#22c55e" : status === "generating" ? "#f97316" : selected ? "#f97316" : "var(--bd)"}`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff",
        }}>
          {status === "done" ? "✓" : status === "generating" ? "⟳" : selected ? "✓" : ""}
        </div>
      </div>

      <p style={{ fontSize: 11, color: "var(--t3)", lineHeight: 1.5, marginBottom: 10 }}>{slot.purpose}</p>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{
          fontSize: 10, padding: "2px 7px", borderRadius: 4,
          background: slot.strategy === "text_to_image" ? "rgba(59,130,246,0.1)" : "rgba(168,85,247,0.1)",
          border: `1px solid ${slot.strategy === "text_to_image" ? "rgba(59,130,246,0.25)" : "rgba(168,85,247,0.25)"}`,
          color: slot.strategy === "text_to_image" ? "#60a5fa" : "#c084fc",
        }}>
          {slot.strategy === "text_to_image" ? "文生图" : "图生图"}
        </span>
        <span style={{ fontSize: 11, color: "var(--acc)", fontWeight: 700 }}>{slot.credits} 积分</span>
      </div>

      {status === "done" && (
        <div style={{
          marginTop: 10, height: 80, borderRadius: 8,
          background: "linear-gradient(135deg, rgba(34,197,94,0.1), rgba(34,197,94,0.05))",
          border: "1px dashed rgba(34,197,94,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, color: "#22c55e",
        }}>
          ✅ 生成完成 — 点击查看
        </div>
      )}
    </div>
  );
}

export default function ProductPage() {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [product, setProduct] = useState<MockProduct | null>(null);
  const [editingPoints, setEditingPoints] = useState<string[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<Set<number>>(new Set([1, 2, 3, 4, 5, 6, 7]));
  const [slotStatus, setSlotStatus] = useState<Record<number, GenerationStatus>>({});
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activePlatform, setActivePlatform] = useState<PlatformKey>("amazon");
  const [detectedPlatform, setDetectedPlatform] = useState<PlatformKey>("amazon");

  const handleAnalyze = async () => {
    if (!url.trim()) return;
    setIsAnalyzing(true);
    setProduct(null);
    setSlotStatus({});
    await new Promise((r) => setTimeout(r, 1800));
    const key = detectPlatform(url.toLowerCase());
    const p = MOCK_PRODUCTS[key] || MOCK_PRODUCTS.amazon;
    setProduct(p);
    setEditingPoints([...p.sellingPoints]);
    setDetectedPlatform(key);
    setActivePlatform(key);
    const defaults = new Set(PLATFORM_CONFIG[key].slots.filter((s) => !s.optional).map((s) => s.id));
    setSelectedSlots(defaults);
    setIsAnalyzing(false);
  };

  const handlePlatformSwitch = (key: PlatformKey) => {
    setActivePlatform(key);
    setSlotStatus({});
    const defaults = new Set(PLATFORM_CONFIG[key].slots.filter((s) => !s.optional).map((s) => s.id));
    setSelectedSlots(defaults);
    setProgress(0);
    setGenerating(false);
  };

  const toggleSlot = (id: number) => {
    if (slotStatus[id] === "generating") return;
    const next = new Set(selectedSlots);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedSlots(next);
  };

  const currentSlots = PLATFORM_CONFIG[activePlatform].slots;
  const totalCredits = currentSlots.filter((s) => selectedSlots.has(s.id)).reduce((sum, s) => sum + s.credits, 0);
  const doneCount = Object.values(slotStatus).filter((s) => s === "done").length;

  const handleGenerate = async () => {
    if (!product || selectedSlots.size === 0) return;
    setGenerating(true);
    setProgress(0);
    const selected = currentSlots.filter((s) => selectedSlots.has(s.id));
    const statusMap: Record<number, GenerationStatus> = {};
    selected.forEach((s) => { statusMap[s.id] = "generating"; });
    setSlotStatus({ ...statusMap });
    for (let i = 0; i < selected.length; i++) {
      await new Promise((r) => setTimeout(r, 900));
      statusMap[selected[i].id] = "done";
      setSlotStatus({ ...statusMap });
      setProgress(Math.round(((i + 1) / selected.length) * 100));
    }
    setGenerating(false);
  };

  return (
    <>
      <div className="topbar">
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 13, color: "var(--t2)", fontWeight: 600 }}>🔗 商品链接生成</span>
        </div>
        <div className="credits-badge">✦ 365 积分</div>
      </div>

      <div className="product-page-wrap">
        {/* URL Input */}
        <div className="fi" style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, fontFamily: "var(--font-display, \'Plus Jakarta Sans\', system-ui, sans-serif)", letterSpacing: "-0.02em", marginBottom: 6 }}>🔗 商品链接生成</h1>
          <p style={{ fontSize: 13, color: "var(--t3)", marginBottom: 20 }}>粘贴商品链接，AI 分析信息，按亚马逊 7+2 规范生成专业套图</p>
          <div style={{ background: "var(--bg3)", border: "1px solid var(--bd)", borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 8, fontWeight: 600 }}>📎 商品链接</div>
            <div className="url-input-wrap" style={{ borderRadius: 10, marginBottom: 12 }}>
              <input type="text" placeholder="粘贴 Amazon / TikTok Shop / Shopee 商品链接..." value={url}
                onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                style={{ fontSize: 13 }} />
              <button onClick={handleAnalyze} disabled={isAnalyzing || !url.trim()} style={{ opacity: isAnalyzing || !url.trim() ? 0.6 : 1 }}>
                {isAnalyzing ? "分析中..." : "分析商品 →"}
              </button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, color: "var(--t3)" }}>示例：</span>
              {DEMO_URLS.map((d) => (
                <button key={d.url} onClick={() => setUrl(d.url)}
                  style={{ fontSize: 10, padding: "3px 10px", borderRadius: 6, background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.25)", color: "#f97316", cursor: "pointer", fontFamily: "inherit" }}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Analyzing */}
        {isAnalyzing && (
          <div style={{ background: "var(--bg3)", border: "1px solid var(--bd)", borderRadius: 16, padding: 40, textAlign: "center", marginBottom: 24 }} className="fi">
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>正在分析商品信息...</div>
            <div style={{ fontSize: 12, color: "var(--t3)", marginBottom: 20 }}>抓取标题、图片、描述、价格、卖点</div>
            <div style={{ width: "100%", maxWidth: 300, height: 4, background: "var(--bd)", borderRadius: 2, margin: "0 auto", overflow: "hidden" }}>
              <div style={{ height: "100%", width: "60%", background: "linear-gradient(90deg, var(--acc), var(--pk))", borderRadius: 2, animation: "progress-slide 1.5s ease-in-out infinite" }} />
            </div>
          </div>
        )}

        {product && !isAnalyzing && (
          <div className="fi">
            {/* Platform Switcher */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 8, fontWeight: 600 }}>🌐 目标平台</div>
              <div className="platform-btn-group">
                {(Object.keys(PLATFORM_CONFIG) as PlatformKey[]).map((key) => {
                  const cfg = PLATFORM_CONFIG[key];
                  const active = activePlatform === key;
                  return (
                    <button key={key} onClick={() => handlePlatformSwitch(key)}
                      style={{ padding: "8px 16px", borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s", background: active ? "rgba(249,115,22,0.15)" : "var(--bg3)", border: `1px solid ${active ? "rgba(249,115,22,0.5)" : "var(--bd)"}`, color: active ? "#f97316" : "var(--t2)" }}>
                      {cfg.icon} {cfg.label}
                      <span style={{ fontSize: 10, marginLeft: 6, color: "var(--t3)" }}>{cfg.desc}</span>
                    </button>
                  );
                })}
              </div>
              {detectedPlatform !== activePlatform && (
                <div style={{ fontSize: 11, color: "#f59e0b", marginTop: 6 }}>
                  ⚠️ 检测到商品来自 {PLATFORM_CONFIG[detectedPlatform].label}，当前展示 {PLATFORM_CONFIG[activePlatform].label} 规范
                </div>
              )}
            </div>

            {/* Product Card */}
            <div className="product-card-flex">
              <div style={{ width: 140, height: 140, borderRadius: 12, overflow: "hidden", flexShrink: 0, background: "var(--bg4)" }} className="product-img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={product.image} alt={product.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.3)", color: "#f97316", fontWeight: 600 }}>{product.platform}</span>
                  <span style={{ fontSize: 11, color: "var(--t3)" }}>⭐ {product.rating} · {product.reviews.toLocaleString()} 评价</span>
                  <span style={{ fontSize: 11, color: "var(--t3)" }}>📂 {product.category}</span>
                  <span style={{ fontSize: 11, color: "var(--t3)" }}>🌍 {product.targetMarket}</span>
                </div>
<h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, lineHeight: 1.4, fontFamily: "var(--font-display, 'Plus Jakarta Sans', system-ui, sans-serif)", letterSpacing: "-0.01em" }}>{product.title}</h2>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 20, fontWeight: 800, fontFamily: "var(--font-display, \'Plus Jakarta Sans\', system-ui, sans-serif)", letterSpacing: "-0.02em", color: "#f97316" }}>{product.price}</span>
                  <span style={{ fontSize: 12, color: "var(--t3)", textDecoration: "line-through" }}>{product.originalPrice}</span>
                </div>
                <div style={{ fontSize: 11, color: "var(--t2)", padding: "8px 12px", background: "rgba(168,85,247,0.08)", borderRadius: 8, border: "1px solid rgba(168,85,247,0.2)", lineHeight: 1.5 }}>
                  👤 <strong>目标用户：</strong>{product.persona}
                </div>
              </div>
            </div>

            {/* Selling Points */}
            <div className="glow-card" style={{ padding: 20, marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>✏️ 核心卖点（可编辑）</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {editingPoints.map((sp, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 12, color: "var(--acc)", fontWeight: 700, flexShrink: 0, width: 20 }}>#{i + 1}</span>
                    <input value={sp}
                      onChange={(e) => { const n = [...editingPoints]; n[i] = e.target.value; setEditingPoints(n); }}
                      className="input-glow"
                    style={{ flex: 1, borderRadius: 8, padding: "6px 12px", fontSize: 12 }} />
                    <button onClick={() => setEditingPoints(editingPoints.filter((_, idx) => idx !== i))}
                      style={{ width: 24, height: 24, borderRadius: 6, border: "none", background: "rgba(239,68,68,0.1)", color: "#ef4444", fontSize: 14, cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}>×</button>
                  </div>
                ))}
                <button onClick={() => setEditingPoints([...editingPoints, ""])}
                  style={{ alignSelf: "flex-start", padding: "5px 14px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid var(--bd)", color: "var(--t2)", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
                  + 添加卖点
                </button>
              </div>
            </div>

            {/* Slots Panel Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>🎯 {PLATFORM_CONFIG[activePlatform].label} · {PLATFORM_CONFIG[activePlatform].desc}</h3>
                <p style={{ fontSize: 12, color: "var(--t3)" }}>点击选择要生成的图位，建议先生成主图确认外观</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#f97316" }}>{totalCredits} <span style={{ fontSize: 11, fontWeight: 400 }}>积分</span></div>
                <div style={{ fontSize: 10, color: "var(--t3)" }}>{selectedSlots.size} / {currentSlots.length} 图位</div>
              </div>
            </div>

            {/* Slot Cards Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12, marginBottom: 20 }}>
              {currentSlots.map((slot) => (
                <SlotCard
                  key={`${activePlatform}-${slot.id}`}
                  slot={slot}
                  selected={selectedSlots.has(slot.id)}
                  status={slotStatus[slot.id] || "idle"}
                  onClick={() => toggleSlot(slot.id)}
                />
              ))}
            </div>

            {/* Generate Actions */}
            <div style={{ background: "var(--bg3)", border: "1px solid var(--bd)", borderRadius: 16, padding: 20 }}>
              {activePlatform === "amazon" && !generating && doneCount === 0 && (
                <div style={{ fontSize: 11, color: "#f59e0b", marginBottom: 12, padding: "8px 12px", background: "rgba(245,158,11,0.08)", borderRadius: 8, border: "1px solid rgba(245,158,11,0.2)" }}>
                  💡 <strong>建议流程：</strong>先生成 Slot 1 主图 → 确认产品外观 → 再批量生成副图。确保所有图位中产品一致。
                </div>
              )}

              {generating && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>生成中...</span>
                    <span style={{ fontSize: 12, color: "var(--acc)" }}>{progress}%</span>
                  </div>
                  <div style={{ width: "100%", height: 6, background: "var(--bd)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, var(--acc), var(--pk))", borderRadius: 3, transition: "width 0.3s" }} />
                  </div>
                  <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 6 }}>
                    已完成 {doneCount} / {selectedSlots.size} 图位
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  onClick={handleGenerate}
                  disabled={generating || selectedSlots.size === 0}
                  className={generating ? "" : "btn-glow"}
                  style={{
                    padding: "12px 28px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: generating ? "wait" : "pointer",
                    fontFamily: "inherit",
                    ...(generating ? { background: "var(--bd)", border: "none", color: "var(--t3)" } : { color: "#000" }),
                    opacity: selectedSlots.size === 0 ? 0.4 : 1,
                  }}
                >
                  {generating ? `生成中 ${progress}%...` : `生成选中图位 · ${totalCredits} 积分`}
                </button>
                <button
                  onClick={() => {
                    const all = new Set(currentSlots.map((s) => s.id));
                    setSelectedSlots(selectedSlots.size === currentSlots.length ? new Set() : all);
                  }}
                  style={{
                    padding: "12px 20px", borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer",
                    fontFamily: "inherit", background: "rgba(255,255,255,0.05)", border: "1px solid var(--bd)", color: "var(--t2)",
                  }}
                >
                  {selectedSlots.size === currentSlots.length ? "取消全选" : "全选"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes progress-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </>
  );
}
