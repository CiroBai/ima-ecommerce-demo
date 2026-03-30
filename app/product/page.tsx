"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Mock product data for different link patterns
const MOCK_PRODUCTS: Record<string, MockProduct> = {
  amazon: {
    platform: "Amazon",
    title: "Wireless Bluetooth Earbuds, Active Noise Cancelling Headphones",
    price: "$29.99",
    originalPrice: "$49.99",
    rating: 4.6,
    reviews: 2847,
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=80",
    description: "真无线蓝牙耳机，主动降噪，30小时续航，IPX5防水，适合运动/通勤/居家办公",
    sellingPoints: [
      "主动降噪 — 消除90%环境噪音",
      "30小时续航 — 单次6h+充电盒24h",
      "IPX5防水 — 运动出汗不担心",
      "单耳/双耳模式 — 随时接听电话",
    ],
    category: "数码电子",
    asin: "B0XXXXXX",
  },
  tiktok: {
    platform: "TikTok Shop",
    title: "韩系小众设计感戒指 女ins风轻奢多巴胺彩色钻石叠戴",
    price: "¥29.9",
    originalPrice: "¥89.9",
    rating: 4.8,
    reviews: 15623,
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80",
    description: "韩国小众设计，ins风多巴胺色系，适合叠戴搭配，黄铜镀金工艺，佩戴不掉色",
    sellingPoints: [
      "韩系小众设计 — 差异化爆款款式",
      "多巴胺色系 — 拍照出片率超高",
      "叠戴玩法 — 一件商品多种搭配",
      "黄铜镀金 — 不掉色不过敏",
    ],
    category: "珠宝首饰",
    asin: null,
  },
  shopee: {
    platform: "Shopee",
    title: "Moisturizing Face Cream Anti-aging Hyaluronic Acid Skincare",
    price: "₱299",
    originalPrice: "₱599",
    rating: 4.7,
    reviews: 8921,
    image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&q=80",
    description: "玻尿酸保湿面霜，抗老补水，适合干性/混合性肌肤，无香精无酒精温和配方",
    sellingPoints: [
      "玻尿酸深层补水 — 锁住肌肤水分",
      "抗老修护配方 — 减淡细纹",
      "无香精无酒精 — 敏感肌可用",
      "轻盈不粘腻 — 四季通用",
    ],
    category: "美妆护肤",
    asin: null,
  },
};

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
  asin: string | null;
}

const MATERIAL_PLANS = [
  {
    id: "main",
    type: "主图",
    icon: "📸",
    desc: "白底主图，符合平台规范",
    platforms: ["亚马逊", "Shopee"],
    count: 1,
    credits: 5,
    ratio: "1:1",
  },
  {
    id: "scene1",
    type: "场景图",
    icon: "🏖️",
    desc: "使用场景，增加代入感",
    platforms: ["TikTok", "Instagram"],
    count: 1,
    credits: 5,
    ratio: "4:5",
  },
  {
    id: "scene2",
    type: "场景图",
    icon: "🏖️",
    desc: "另一使用场景，多角度展示",
    platforms: ["亚马逊", "Shopify"],
    count: 1,
    credits: 5,
    ratio: "16:9",
  },
  {
    id: "point1",
    type: "卖点图",
    icon: "📊",
    desc: "卖点#1 视觉化展示",
    platforms: ["亚马逊", "TikTok"],
    count: 1,
    credits: 5,
    ratio: "1:1",
  },
  {
    id: "point2",
    type: "卖点图",
    icon: "📊",
    desc: "卖点#2 对比展示",
    platforms: ["亚马逊", "Instagram"],
    count: 1,
    credits: 5,
    ratio: "1:1",
  },
  {
    id: "video",
    type: "短视频",
    icon: "🎬",
    desc: "15秒带货短视频脚本",
    platforms: ["TikTok", "Reels"],
    count: 1,
    credits: 15,
    ratio: "9:16",
  },
];

function detectPlatform(url: string): string {
  if (url.includes("amazon")) return "amazon";
  if (url.includes("tiktok") || url.includes("tiktokshop")) return "tiktok";
  if (url.includes("shopee")) return "shopee";
  // Default random for demo
  const keys = Object.keys(MOCK_PRODUCTS);
  return keys[Math.floor(Math.random() * keys.length)];
}

export default function ProductPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [product, setProduct] = useState<MockProduct | null>(null);
  const [selectedMaterials, setSelectedMaterials] = useState<Set<string>>(
    new Set(["main", "scene1", "scene2", "point1", "point2"])
  );
  const [generating, setGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedCount, setGeneratedCount] = useState(0);

  const handleAnalyze = async () => {
    if (!url.trim()) return;
    setIsAnalyzing(true);
    setProduct(null);

    // Simulate analysis delay
    await new Promise((r) => setTimeout(r, 1800));

    const key = detectPlatform(url.toLowerCase());
    setProduct(MOCK_PRODUCTS[key] || MOCK_PRODUCTS.amazon);
    setIsAnalyzing(false);
  };

  const toggleMaterial = (id: string) => {
    const next = new Set(selectedMaterials);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedMaterials(next);
  };

  const totalCredits = MATERIAL_PLANS.filter((m) =>
    selectedMaterials.has(m.id)
  ).reduce((sum, m) => sum + m.credits, 0);

  const handleGenerateAll = async () => {
    if (!product || selectedMaterials.size === 0) return;
    setGenerating(true);
    setGenerationProgress(0);
    setGeneratedCount(0);

    const selected = MATERIAL_PLANS.filter((m) => selectedMaterials.has(m.id));
    for (let i = 0; i < selected.length; i++) {
      await new Promise((r) => setTimeout(r, 800));
      setGeneratedCount(i + 1);
      setGenerationProgress(Math.round(((i + 1) / selected.length) * 100));
    }

    // Navigate to workspace for actual generation
    const prompt = `${product.title}, ${product.sellingPoints[0]}, product photography, professional`;
    setTimeout(() => {
      router.push(`/workspace?category=${encodeURIComponent(product.category)}&prompt=${encodeURIComponent(prompt)}`);
    }, 800);
  };

  const DEMO_URLS = [
    "https://www.amazon.com/dp/B0XXXXXX",
    "https://www.tiktokshop.com/product/XXXXXX",
    "https://shopee.ph/product/XXXXXX",
  ];

  return (
    <>
      {/* Topbar */}
      <div className="topbar">
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 13, color: "var(--t2)", fontWeight: 600 }}>🔗 商品链接生成</span>
        </div>
        <div className="credits-badge">✦ 365 积分</div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 40px" }}>
        {/* URL Input Section */}
        <div className="fi" style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
            🔗 商品链接生成
          </h1>
          <p style={{ fontSize: 13, color: "var(--t3)", marginBottom: 20 }}>
            粘贴商品链接，AI 自动分析商品信息，推荐最优素材方案
          </p>

          <div style={{
            background: "var(--bg3)",
            border: "1px solid var(--bd)",
            borderRadius: 16,
            padding: 24,
          }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 8, fontWeight: 600 }}>
                📎 商品链接
              </div>
              <div className="url-input-wrap" style={{ borderRadius: 10 }}>
                <input
                  type="text"
                  placeholder="粘贴 Amazon / TikTok Shop / Shopee 商品链接..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                  style={{ fontSize: 13 }}
                />
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !url.trim()}
                  style={{ opacity: isAnalyzing || !url.trim() ? 0.6 : 1 }}
                >
                  {isAnalyzing ? "分析中..." : "分析商品 →"}
                </button>
              </div>
            </div>

            {/* Demo URLs */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, color: "var(--t3)" }}>示例链接：</span>
              {DEMO_URLS.map((demoUrl) => (
                <button
                  key={demoUrl}
                  onClick={() => setUrl(demoUrl)}
                  style={{
                    fontSize: 10, padding: "3px 10px", borderRadius: 6,
                    background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.25)",
                    color: "#f97316", cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  {demoUrl.includes("amazon") ? "🛒 Amazon" :
                    demoUrl.includes("tiktok") ? "📱 TikTok" : "🟠 Shopee"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Analyzing State */}
        {isAnalyzing && (
          <div style={{
            background: "var(--bg3)", border: "1px solid var(--bd)", borderRadius: 16,
            padding: 40, textAlign: "center", marginBottom: 24
          }} className="fi">
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>正在分析商品信息...</div>
            <div style={{ fontSize: 12, color: "var(--t3)", marginBottom: 20 }}>
              抓取商品标题、图片、描述、价格
            </div>
            <div style={{
              width: "100%", maxWidth: 300, height: 4,
              background: "var(--bd)", borderRadius: 2, margin: "0 auto", overflow: "hidden"
            }}>
              <div style={{
                height: "100%", width: "60%",
                background: "linear-gradient(90deg, var(--acc), var(--pk))",
                borderRadius: 2, animation: "progress-slide 1.5s ease-in-out infinite"
              }} />
            </div>
          </div>
        )}

        {/* Product Analysis Result */}
        {product && !isAnalyzing && (
          <div className="fi">
            {/* Product Card */}
            <div style={{
              background: "var(--bg3)", border: "1px solid var(--bd)", borderRadius: 16,
              padding: 24, marginBottom: 24, display: "flex", gap: 24
            }}>
              {/* Product Image */}
              <div style={{
                width: 160, height: 160, borderRadius: 12, overflow: "hidden",
                flexShrink: 0, background: "var(--bg4)"
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.image}
                  alt={product.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>

              {/* Product Info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{
                    fontSize: 10, padding: "2px 8px", borderRadius: 4,
                    background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.3)",
                    color: "#f97316", fontWeight: 600
                  }}>
                    {product.platform}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--t3)" }}>
                    ⭐ {product.rating} · {product.reviews.toLocaleString()} 评价
                  </span>
                </div>
                <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, lineHeight: 1.4 }}>
                  {product.title}
                </h2>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 22, fontWeight: 800, color: "#f97316" }}>
                    {product.price}
                  </span>
                  <span style={{ fontSize: 13, color: "var(--t3)", textDecoration: "line-through" }}>
                    {product.originalPrice}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.6, marginBottom: 12 }}>
                  {product.description}
                </p>

                {/* Selling Points */}
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {product.sellingPoints.map((sp, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 11 }}>
                      <span style={{ color: "#22c55e", flexShrink: 0, marginTop: 1 }}>✓</span>
                      <span style={{ color: "var(--t2)" }}>{sp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Material Plan */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>
                    🎯 推荐素材方案
                  </h3>
                  <p style={{ fontSize: 12, color: "var(--t3)" }}>
                    AI 根据商品类型自动推荐最优素材组合
                  </p>
                </div>
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "6px 14px", borderRadius: 10,
                  background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.25)",
                }}>
                  <span style={{ fontSize: 11, color: "var(--pp)" }}>已选</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: "var(--pp)" }}>
                    {selectedMaterials.size}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--t3)" }}>项 · {totalCredits} 积分</span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                {MATERIAL_PLANS.map((plan) => {
                  const selected = selectedMaterials.has(plan.id);
                  return (
                    <div
                      key={plan.id}
                      onClick={() => toggleMaterial(plan.id)}
                      style={{
                        background: selected ? "rgba(249,115,22,0.08)" : "var(--bg3)",
                        border: `1px solid ${selected ? "rgba(249,115,22,0.4)" : "var(--bd)"}`,
                        borderRadius: 12, padding: "14px 16px", cursor: "pointer",
                        transition: "all 0.15s", position: "relative",
                      }}
                    >
                      {selected && (
                        <div style={{
                          position: "absolute", top: 8, right: 8,
                          width: 18, height: 18, borderRadius: "50%",
                          background: "#f97316", display: "flex", alignItems: "center",
                          justifyContent: "center", fontSize: 10, color: "#fff", fontWeight: 700
                        }}>✓</div>
                      )}
                      <div style={{ fontSize: 20, marginBottom: 6 }}>{plan.icon}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>
                        {plan.type}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 8, lineHeight: 1.4 }}>
                        {plan.desc}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                          {plan.platforms.slice(0, 2).map((p) => (
                            <span key={p} style={{
                              fontSize: 9, padding: "1px 5px", borderRadius: 4,
                              background: "rgba(255,255,255,0.06)", color: "var(--t3)"
                            }}>{p}</span>
                          ))}
                        </div>
                        <span style={{ fontSize: 10, color: "var(--acc)", fontWeight: 600 }}>
                          {plan.credits}积分
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Generate Button */}
            {generating ? (
              <div style={{
                background: "var(--bg3)", border: "1px solid var(--bd)", borderRadius: 16,
                padding: 24, textAlign: "center"
              }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                  正在生成素材... {generatedCount}/{selectedMaterials.size}
                </div>
                <div style={{
                  width: "100%", height: 6, background: "var(--bd)", borderRadius: 3,
                  overflow: "hidden", marginBottom: 12
                }}>
                  <div style={{
                    height: "100%", width: `${generationProgress}%`,
                    background: "linear-gradient(90deg, var(--acc), var(--pk))",
                    borderRadius: 3, transition: "width 0.5s ease"
                  }} />
                </div>
                <div style={{ fontSize: 12, color: "var(--t3)" }}>
                  {generationProgress < 100 ? "AI 正在生成，请稍候..." : "即将跳转到工作台..."}
                </div>
              </div>
            ) : (
              <button
                onClick={handleGenerateAll}
                disabled={selectedMaterials.size === 0}
                style={{
                  width: "100%", padding: "14px 24px",
                  background: selectedMaterials.size === 0
                    ? "var(--bg4)"
                    : "linear-gradient(135deg, var(--acc), var(--pk))",
                  border: "none", borderRadius: 12, color: "#fff",
                  fontSize: 15, fontWeight: 700, cursor: selectedMaterials.size === 0 ? "not-allowed" : "pointer",
                  fontFamily: "inherit", transition: "opacity 0.2s",
                  opacity: selectedMaterials.size === 0 ? 0.5 : 1,
                }}
              >
                ⚡ 一键全部生成 — 消耗 {totalCredits} 积分
              </button>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes progress-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(500%); }
        }
      `}</style>
    </>
  );
}
