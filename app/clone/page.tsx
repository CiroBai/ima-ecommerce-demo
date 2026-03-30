"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface AnalysisResult {
  platform: string;
  type: "video" | "image";
  thumbnail: string;
  title: string;
  views: string;
  likes: string;
  structure: StructureItem[];
  composition: string[];
  colorPalette: ColorItem[];
  sellingPoints: string[];
  hooks: string[];
  category: string;
}

interface StructureItem {
  time: string;
  desc: string;
  type: "hook" | "demo" | "cta" | "scene";
}

interface ColorItem {
  name: string;
  hex: string;
}

const MOCK_ANALYSES: AnalysisResult[] = [
  {
    platform: "TikTok",
    type: "video",
    thumbnail: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80",
    title: "@fashionqueen 服装带货视频 · 108万播放",
    views: "108万",
    likes: "6.2万",
    structure: [
      { time: "0-3s", desc: "穿搭前后对比开场，制造视觉冲击", type: "hook" },
      { time: "3-8s", desc: "展示服装细节：面料质感、版型、颜色", type: "demo" },
      { time: "8-12s", desc: "上身效果展示，多角度转身", type: "scene" },
      { time: "12-15s", desc: "价格展示 + 优惠信息 + 购买引导", type: "cta" },
    ],
    composition: [
      "竖屏9:16，人物居中构图",
      "高饱和暖色调，视觉跳跃感强",
      "字幕覆盖率60%，配合快节奏剪辑",
      "BGM选用当前热门音频",
    ],
    colorPalette: [
      { name: "主色调", hex: "#F4A261" },
      { name: "辅助色", hex: "#E76F51" },
      { name: "背景色", hex: "#FAFAFA" },
    ],
    sellingPoints: [
      "显瘦显高 — 版型核心卖点",
      "多色可选 — 提升决策欲望",
      "限时价格 — 制造紧迫感",
    ],
    hooks: [
      "这条裙子让我暴瘦10斤！",
      "姐妹们这个不买会后悔的！",
      "老板清仓价，不买真的亏了",
    ],
    category: "服装",
  },
  {
    platform: "Instagram",
    type: "image",
    thumbnail: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&q=80",
    title: "@skincare_daily 护肤品测评 · 45万互动",
    views: "45万",
    likes: "8.1万",
    structure: [
      { time: "图1", desc: "产品平铺摆拍主图，视觉冲击力强", type: "hook" },
      { time: "图2", desc: "成分高亮展示，文字卡片设计", type: "demo" },
      { time: "图3", desc: "使用前后对比效果图", type: "scene" },
      { time: "图4", desc: "用户好评截图合集", type: "cta" },
    ],
    composition: [
      "4:5竖图，信息密度高",
      "莫兰迪色系，高级感强",
      "文字排版清晰，卖点突出",
      "真实感强，避免过度修图",
    ],
    colorPalette: [
      { name: "主色调", hex: "#A8B5A0" },
      { name: "辅助色", hex: "#C9BBA8" },
      { name: "背景色", hex: "#F5F0EB" },
    ],
    sellingPoints: [
      "成分党最爱 — 透明配方",
      "实测效果 — 真实评价背书",
      "性价比高 — 平价替代大牌",
    ],
    hooks: [
      "用了3个月，毛孔真的变小了",
      "护肤师都在用的成分",
      "大牌平替，效果不输贵妇",
    ],
    category: "美妆护肤",
  },
];

function getRandomAnalysis(): AnalysisResult {
  return MOCK_ANALYSES[Math.floor(Math.random() * MOCK_ANALYSES.length)];
}

const OUTPUT_COUNTS = [1, 3, 5];

const STYLE_OPTIONS = [
  { id: "original", label: "保持原风格" },
  { id: "brighter", label: "更鲜亮饱和" },
  { id: "minimal", label: "极简清爽" },
  { id: "luxury", label: "奢华高端" },
];

export default function ClonePage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [outputCount, setOutputCount] = useState(3);
  const [styleOption, setStyleOption] = useState("original");
  const [isCloning, setIsCloning] = useState(false);
  const [cloneProgress, setCloneProgress] = useState(0);
  const [clonedCount, setClonedCount] = useState(0);
  const [uploadedProduct, setUploadedProduct] = useState(false);

  const handleAnalyze = async () => {
    if (!url.trim()) return;
    setIsAnalyzing(true);
    setAnalysis(null);
    await new Promise((r) => setTimeout(r, 2000));
    setAnalysis(getRandomAnalysis());
    setIsAnalyzing(false);
  };

  const handleClone = async () => {
    if (!analysis) return;
    setIsCloning(true);
    setCloneProgress(0);
    setClonedCount(0);

    for (let i = 0; i < outputCount; i++) {
      await new Promise((r) => setTimeout(r, 700));
      setClonedCount(i + 1);
      setCloneProgress(Math.round(((i + 1) / outputCount) * 100));
    }

    const prompt = `${analysis.sellingPoints[0]}, ${analysis.composition[0]}, product photography`;
    setTimeout(() => {
      router.push(`/workspace?category=${encodeURIComponent(analysis.category)}&prompt=${encodeURIComponent(prompt)}&count=${outputCount}`);
    }, 600);
  };

  const structureTypeColors: Record<string, string> = {
    hook: "#ef4444",
    demo: "#f97316",
    scene: "#22c55e",
    cta: "#a855f7",
  };
  const structureTypeLabels: Record<string, string> = {
    hook: "钩子",
    demo: "展示",
    scene: "场景",
    cta: "转化",
  };

  const DEMO_URLS = [
    "https://www.tiktok.com/@user/video/XXXXXX",
    "https://www.instagram.com/p/XXXXXX",
    "https://www.youtube.com/shorts/XXXXXX",
  ];

  return (
    <>
      {/* Topbar */}
      <div className="topbar">
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 13, color: "var(--t2)", fontWeight: 600 }}>🔥 爆款复刻</span>
        </div>
        <div className="credits-badge">✦ 365 积分</div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 40px" }}>
        {/* Header */}
        <div className="fi" style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
            🔥 爆款复刻
          </h1>
          <p style={{ fontSize: 13, color: "var(--t3)", marginBottom: 20 }}>
            输入竞品爆款链接，AI 深度分析爆款结构，一键复刻带货基因
          </p>

          <div style={{
            background: "var(--bg3)", border: "1px solid var(--bd)", borderRadius: 16, padding: 24
          }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 8, fontWeight: 600 }}>
                🔗 爆款内容链接
              </div>
              <div className="url-input-wrap" style={{ borderRadius: 10 }}>
                <input
                  type="text"
                  placeholder="粘贴 TikTok / Instagram / YouTube Shorts 爆款视频或图片链接..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                />
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !url.trim()}
                  style={{ opacity: isAnalyzing || !url.trim() ? 0.6 : 1 }}
                >
                  {isAnalyzing ? "分析中..." : "分析爆款 →"}
                </button>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, color: "var(--t3)" }}>示例：</span>
              {DEMO_URLS.map((demoUrl) => (
                <button
                  key={demoUrl}
                  onClick={() => setUrl(demoUrl)}
                  style={{
                    fontSize: 10, padding: "3px 10px", borderRadius: 6,
                    background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.25)",
                    color: "#a855f7", cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  {demoUrl.includes("tiktok") ? "📱 TikTok" :
                    demoUrl.includes("instagram") ? "📸 Instagram" : "▶️ YouTube"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Analyzing */}
        {isAnalyzing && (
          <div style={{
            background: "var(--bg3)", border: "1px solid var(--bd)", borderRadius: 16,
            padding: 48, textAlign: "center", marginBottom: 24
          }} className="fi">
            <div style={{ fontSize: 40, marginBottom: 16 }}>🔬</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>AI 深度分析爆款结构...</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: 300, margin: "0 auto 20px" }}>
              {["提取视频帧...", "分析画面构成...", "识别卖点结构...", "生成复刻方案..."].map((step, i) => (
                <div key={step} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  fontSize: 12, color: i < 2 ? "var(--t2)" : "var(--t3)"
                }}>
                  <span style={{ color: i < 2 ? "#22c55e" : "var(--t3)" }}>
                    {i < 2 ? "✓" : "○"}
                  </span>
                  {step}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analysis Result */}
        {analysis && !isAnalyzing && (
          <div className="fi">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              {/* Left: Original Content Preview */}
              <div style={{
                background: "var(--bg3)", border: "1px solid var(--bd)", borderRadius: 16, overflow: "hidden"
              }}>
                <div style={{ position: "relative" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={analysis.thumbnail}
                    alt="爆款内容"
                    style={{ width: "100%", height: 200, objectFit: "cover", display: "block" }}
                  />
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)"
                  }} />
                  <div style={{ position: "absolute", bottom: 12, left: 12, right: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#fff", marginBottom: 4 }}>
                      {analysis.title}
                    </div>
                    <div style={{ display: "flex", gap: 12, fontSize: 11, color: "rgba(255,255,255,0.8)" }}>
                      <span>👁 {analysis.views}</span>
                      <span>❤️ {analysis.likes}</span>
                      <span style={{
                        padding: "1px 6px", borderRadius: 4,
                        background: "rgba(255,255,255,0.2)", fontSize: 10
                      }}>{analysis.platform}</span>
                    </div>
                  </div>
                </div>

                {/* Color Palette */}
                <div style={{ padding: 16 }}>
                  <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 8, fontWeight: 600 }}>
                    🎨 色彩基因
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {analysis.colorPalette.map((c) => (
                      <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{
                          width: 24, height: 24, borderRadius: 6,
                          background: c.hex, border: "1px solid rgba(255,255,255,0.1)"
                        }} />
                        <div>
                          <div style={{ fontSize: 9, color: "var(--t3)" }}>{c.name}</div>
                          <div style={{ fontSize: 9, color: "var(--t2)", fontFamily: "monospace" }}>{c.hex}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: AI Analysis */}
              <div style={{
                background: "var(--bg3)", border: "1px solid rgba(168,85,247,0.25)", borderRadius: 16, padding: 16
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#a855f7", marginBottom: 12 }}>
                  🤖 AI 分析结果
                </div>

                {/* Video Structure */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 10, color: "var(--t3)", fontWeight: 600, marginBottom: 8, textTransform: "uppercase" }}>
                    内容结构
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {analysis.structure.map((item, i) => (
                      <div key={i} style={{
                        display: "flex", alignItems: "flex-start", gap: 8,
                        padding: "6px 8px", borderRadius: 6, background: "var(--bg4)"
                      }}>
                        <span style={{
                          fontSize: 9, padding: "2px 6px", borderRadius: 4, fontWeight: 700,
                          background: `${structureTypeColors[item.type]}22`,
                          color: structureTypeColors[item.type],
                          border: `1px solid ${structureTypeColors[item.type]}44`,
                          flexShrink: 0, marginTop: 1
                        }}>
                          {structureTypeLabels[item.type]}
                        </span>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: 9, color: "var(--t3)", marginRight: 4 }}>{item.time}</span>
                          <span style={{ fontSize: 11, color: "var(--t2)" }}>{item.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hooks */}
                <div>
                  <div style={{ fontSize: 10, color: "var(--t3)", fontWeight: 600, marginBottom: 6, textTransform: "uppercase" }}>
                    爆款文案钩子
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {analysis.hooks.slice(0, 2).map((hook, i) => (
                      <div key={i} style={{
                        fontSize: 11, color: "var(--t1)", padding: "5px 10px",
                        borderRadius: 6, background: "rgba(249,115,22,0.08)",
                        border: "1px solid rgba(249,115,22,0.2)",
                      }}>
                        「{hook}」
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Clone Settings */}
            <div style={{
              background: "var(--bg3)", border: "1px solid var(--bd)", borderRadius: 16,
              padding: 20, marginBottom: 20
            }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>
                🎛️ 复刻参数配置
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
                {/* Upload Product Image */}
                <div>
                  <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 8, fontWeight: 600 }}>
                    📷 上传商品图（可选）
                  </div>
                  <div
                    onClick={() => setUploadedProduct(!uploadedProduct)}
                    style={{
                      height: 80, border: `2px dashed ${uploadedProduct ? "#22c55e" : "var(--bd)"}`,
                      borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", background: uploadedProduct ? "rgba(34,197,94,0.05)" : "transparent",
                      fontSize: 12, color: uploadedProduct ? "#22c55e" : "var(--t3)",
                      transition: "all 0.15s"
                    }}
                  >
                    {uploadedProduct ? "✅ 已上传商品图" : "+ 上传商品图"}
                  </div>
                </div>

                {/* Style Option */}
                <div>
                  <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 8, fontWeight: 600 }}>
                    🎨 风格调整
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {STYLE_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setStyleOption(opt.id)}
                        style={{
                          padding: "5px 10px", borderRadius: 6, fontSize: 11, textAlign: "left",
                          border: `1px solid ${styleOption === opt.id ? "var(--acc)" : "var(--bd)"}`,
                          background: styleOption === opt.id ? "var(--accg)" : "transparent",
                          color: styleOption === opt.id ? "var(--acc)" : "var(--t2)",
                          cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s"
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Output Count */}
                <div>
                  <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 8, fontWeight: 600 }}>
                    📊 输出数量
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {OUTPUT_COUNTS.map((count) => (
                      <button
                        key={count}
                        onClick={() => setOutputCount(count)}
                        style={{
                          flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 14, fontWeight: 700,
                          border: `1px solid ${outputCount === count ? "var(--acc)" : "var(--bd)"}`,
                          background: outputCount === count ? "var(--accg)" : "transparent",
                          color: outputCount === count ? "var(--acc)" : "var(--t2)",
                          cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s"
                        }}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--t3)", marginTop: 8 }}>
                    预计消耗：{outputCount * 10} 积分
                  </div>
                </div>
              </div>
            </div>

            {/* Clone Button */}
            {isCloning ? (
              <div style={{
                background: "var(--bg3)", border: "1px solid var(--bd)", borderRadius: 16,
                padding: 24, textAlign: "center"
              }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                  复刻中... {clonedCount}/{outputCount}
                </div>
                <div style={{
                  width: "100%", height: 6, background: "var(--bd)", borderRadius: 3,
                  overflow: "hidden", marginBottom: 8
                }}>
                  <div style={{
                    height: "100%", width: `${cloneProgress}%`,
                    background: "linear-gradient(90deg, #a855f7, #3b82f6)",
                    borderRadius: 3, transition: "width 0.5s ease"
                  }} />
                </div>
                <div style={{ fontSize: 12, color: "var(--t3)" }}>
                  {cloneProgress < 100 ? "AI 正在按爆款结构重新生成..." : "跳转到工作台查看结果..."}
                </div>
              </div>
            ) : (
              <button
                onClick={handleClone}
                style={{
                  width: "100%", padding: "14px 24px",
                  background: "linear-gradient(135deg, #a855f7, #3b82f6)",
                  border: "none", borderRadius: 12, color: "#fff",
                  fontSize: 15, fontWeight: 700, cursor: "pointer",
                  fontFamily: "inherit", transition: "opacity 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.9")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >
                🔥 立即复刻 — 生成 {outputCount} 套素材 · 消耗 {outputCount * 10} 积分
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
