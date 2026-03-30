"use client";

import { useState } from "react";

const COPY_TYPES = [
  { key: "title", icon: "📝", label: "商品标题", desc: "SEO优化的商品标题，多平台适配" },
  { key: "selling", icon: "💎", label: "卖点提炼", desc: "从商品描述中提炼3-6个核心卖点" },
  { key: "ad", icon: "📢", label: "广告文案", desc: "Facebook/Google/TikTok 广告文案" },
  { key: "desc", icon: "📄", label: "产品描述", desc: "详细的产品详情页描述" },
  { key: "seo", icon: "🔍", label: "SEO关键词", desc: "搜索关键词挖掘和优化建议" },
  { key: "review", icon: "💬", label: "评价回复", desc: "差评回复/好评感谢模板" },
  { key: "social", icon: "📱", label: "社媒文案", desc: "Instagram/小红书/TikTok 帖子文案" },
  { key: "aplus", icon: "✨", label: "A+文案", desc: "亚马逊A+页面文案规划" },
];

const PLATFORMS = ["Amazon", "TikTok", "Shopee", "Instagram", "小红书"];
const LANGUAGES = ["中文", "English", "日本語", "한국어", "Español"];
const TONES = ["专业", "亲切", "幽默", "奢华", "年轻"];
const LENGTHS = ["短", "中", "长"];

const MOCK_RESULTS = [
  {
    label: "方案 A",
    text: "Professional Wireless Bluetooth Earbuds - 30H Battery, ANC, IPX5 Waterproof for Running & Gym | 2024 Upgraded",
    wordCount: 20,
    seo: 92,
    color: "#f97316",
  },
  {
    label: "方案 B",
    text: "True Wireless Earbuds with Active Noise Cancelling, 30 Hours Playtime, IPX5 Sweatproof - Premium Sound Quality",
    wordCount: 18,
    seo: 88,
    color: "#a855f7",
  },
  {
    label: "方案 C",
    text: "Noise Cancelling Wireless Earbuds Bluetooth 5.3, 30hr Battery Life, Waterproof Sport Earphones with Deep Bass",
    wordCount: 17,
    seo: 95,
    color: "#06b6d4",
  },
];

export default function AICopywritingPage() {
  const [selectedType, setSelectedType] = useState("title");
  const [platform, setPlatform] = useState("Amazon");
  const [language, setLanguage] = useState("English");
  const [tone, setTone] = useState("专业");
  const [length, setLength] = useState("中");
  const [productInfo, setProductInfo] = useState("");
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editTexts, setEditTexts] = useState<string[]>(MOCK_RESULTS.map(r => r.text));
  const [copied, setCopied] = useState<number | null>(null);

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setGenerated(true);
      setEditTexts(MOCK_RESULTS.map(r => r.text));
    }, 1500);
  };

  const handleCopy = (idx: number) => {
    navigator.clipboard.writeText(editTexts[idx]).catch(() => {});
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  };

  const seoColor = (score: number) => {
    if (score >= 90) return "#22c55e";
    if (score >= 75) return "#f97316";
    return "#ef4444";
  };

  return (
    <>
      <div className="topbar">
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, color: "var(--t3)" }}>工具</span>
          <span style={{ color: "var(--t3)" }}>/</span>
          <span style={{ fontSize: 13, fontWeight: 600 }}>AI 文案生成</span>
        </div>
        <div className="credits-badge">✦ 365 积分</div>
      </div>

      <div className="batch-page-wrap fi" style={{ maxWidth: 960, width: "100%" }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>✍️ AI 文案生成</h1>
          <p style={{ fontSize: 13, color: "var(--t2)" }}>一站式生成所有平台所需文案，8种类型，5种语言，秒出高质量内容</p>
        </div>

        {/* Type Selection */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--t3)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            文案类型
          </div>
          <div className="copy-type-grid">
            {COPY_TYPES.map(t => (
              <div
                key={t.key}
                onClick={() => setSelectedType(t.key)}
                style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  background: selectedType === t.key ? "rgba(249,115,22,0.12)" : "var(--bg3)",
                  border: `1px solid ${selectedType === t.key ? "rgba(249,115,22,0.4)" : "var(--bd)"}`,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                <div style={{ fontSize: 20, marginBottom: 6 }}>{t.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 3, color: selectedType === t.key ? "#f97316" : "var(--fg)" }}>
                  {t.label}
                </div>
                <div style={{ fontSize: 10, color: "var(--t3)", lineHeight: 1.4 }}>{t.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-row-col">
          {/* Input Area */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--t3)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              商品信息
            </div>
            <div style={{ background: "var(--bg3)", border: "1px solid var(--bd)", borderRadius: 12, padding: 16, marginBottom: 14 }}>
              <textarea
                placeholder="粘贴商品链接或描述...&#10;例：无线蓝牙耳机，30小时续航，ANC降噪，IPX5防水，适合运动健身"
                value={productInfo}
                onChange={e => setProductInfo(e.target.value)}
                style={{
                  width: "100%", minHeight: 100,
                  background: "transparent", border: "none",
                  color: "var(--fg)", fontSize: 13, resize: "vertical",
                  outline: "none", fontFamily: "inherit", lineHeight: 1.6,
                }}
              />
            </div>

            {/* Options */}
            <div className="copy-config-grid" style={{ marginBottom: 14 }}>
              {[
                { label: "目标平台", options: PLATFORMS, value: platform, setValue: setPlatform },
                { label: "语言", options: LANGUAGES, value: language, setValue: setLanguage },
                { label: "语气风格", options: TONES, value: tone, setValue: setTone },
                { label: "字数限制", options: LENGTHS, value: length, setValue: setLength },
              ].map(field => (
                <div key={field.label}>
                  <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 5, fontWeight: 600 }}>{field.label}</div>
                  <select
                    value={field.value}
                    onChange={e => field.setValue(e.target.value)}
                    style={{
                      width: "100%", padding: "7px 10px",
                      background: "var(--bg3)", border: "1px solid var(--bd)",
                      borderRadius: 8, color: "var(--fg)", fontSize: 12,
                      outline: "none", cursor: "pointer", fontFamily: "inherit",
                    }}
                  >
                    {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              style={{
                marginTop: 16, width: "100%",
                padding: "11px", borderRadius: 10,
                background: loading ? "rgba(249,115,22,0.3)" : "linear-gradient(135deg, #f97316, #ec4899)",
                color: "#fff", fontSize: 13, fontWeight: 700,
                border: "none", cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "inherit", transition: "all 0.2s",
              }}
            >
              {loading ? "✨ 生成中..." : "🚀 立即生成文案"}
            </button>
          </div>

          {/* Results */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--t3)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              生成结果
            </div>
            {!generated ? (
              <div style={{
                background: "var(--bg3)", border: "1px dashed var(--bd)",
                borderRadius: 12, padding: "48px 24px", textAlign: "center",
              }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>✍️</div>
                <div style={{ color: "var(--t3)", fontSize: 13 }}>填写商品信息后，点击生成文案</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {MOCK_RESULTS.map((result, idx) => (
                  <div key={idx} style={{
                    background: "var(--bg3)", border: `1px solid var(--bd)`,
                    borderRadius: 12, padding: 14,
                    borderLeft: `3px solid ${result.color}`,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: result.color }}>{result.label}</span>
                      <span style={{ fontSize: 10, color: "var(--t3)" }}>{result.wordCount} 词</span>
                    </div>

                    {editingIdx === idx ? (
                      <textarea
                        value={editTexts[idx]}
                        onChange={e => {
                          const next = [...editTexts];
                          next[idx] = e.target.value;
                          setEditTexts(next);
                        }}
                        style={{
                          width: "100%", minHeight: 60,
                          background: "var(--bg4)", border: "1px solid var(--bd)",
                          borderRadius: 6, color: "var(--fg)", fontSize: 12,
                          padding: "6px 8px", resize: "vertical",
                          outline: "none", fontFamily: "inherit",
                        }}
                      />
                    ) : (
                      <p style={{ fontSize: 12, lineHeight: 1.6, color: "var(--fg)", marginBottom: 8 }}>
                        {editTexts[idx]}
                      </p>
                    )}

                    {/* SEO Score */}
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 10, color: "var(--t3)" }}>SEO 评分</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: seoColor(result.seo) }}>{result.seo}/100</span>
                      </div>
                      <div style={{ height: 4, background: "var(--bd)", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", width: `${result.seo}%`,
                          background: seoColor(result.seo), borderRadius: 2,
                          transition: "width 0.6s ease",
                        }} />
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => handleCopy(idx)}
                        style={{
                          flex: 1, padding: "5px 10px", borderRadius: 6,
                          background: copied === idx ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.06)",
                          border: `1px solid ${copied === idx ? "rgba(34,197,94,0.4)" : "var(--bd)"}`,
                          color: copied === idx ? "#22c55e" : "var(--t2)",
                          fontSize: 11, cursor: "pointer", fontFamily: "inherit",
                        }}
                      >
                        {copied === idx ? "✓ 已复制" : "📋 复制"}
                      </button>
                      <button
                        onClick={() => setEditingIdx(editingIdx === idx ? null : idx)}
                        style={{
                          flex: 1, padding: "5px 10px", borderRadius: 6,
                          background: editingIdx === idx ? "rgba(249,115,22,0.15)" : "rgba(255,255,255,0.06)",
                          border: `1px solid ${editingIdx === idx ? "rgba(249,115,22,0.4)" : "var(--bd)"}`,
                          color: editingIdx === idx ? "#f97316" : "var(--t2)",
                          fontSize: 11, cursor: "pointer", fontFamily: "inherit",
                        }}
                      >
                        ✏️ 微调
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  onClick={handleGenerate}
                  style={{
                    padding: "9px", borderRadius: 8,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid var(--bd)",
                    color: "var(--t2)", fontSize: 12,
                    cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  🔄 重新生成
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
