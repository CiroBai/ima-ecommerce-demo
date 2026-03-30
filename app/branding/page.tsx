"use client";

import { useState } from "react";

const INDUSTRIES = ["科技", "美妆", "食品", "家居", "服装", "金融", "教育", "其他"];

const LOGO_STYLES = [
  { key: "wordmark", icon: "📝", label: "文字标", en: "Wordmark", desc: "纯文字，字体即品牌", example: "Google · FedEx · Coca-Cola" },
  { key: "lettermark", icon: "🔤", label: "字母标", en: "Lettermark", desc: "品牌缩写，简洁有力", example: "IBM · HP · CNN" },
  { key: "brandmark", icon: "🎯", label: "图形标", en: "Brandmark", desc: "纯图形，识别度极高", example: "Apple · Nike · Twitter" },
  { key: "combination", icon: "🔗", label: "组合标", en: "Combination", desc: "图形+文字，信息最完整", example: "Adidas · Burger King" },
  { key: "emblem", icon: "🛡️", label: "徽章标", en: "Emblem", desc: "封闭构图，权威感强", example: "Starbucks · Harley-Davidson" },
  { key: "mascot", icon: "🐻", label: "吉祥物", en: "Mascot", desc: "角色形象，亲和力极强", example: "KFC · Michelin · Duolingo" },
];

const PRESET_COLORS = [
  "#f97316", "#ec4899", "#a855f7", "#3b82f6", "#06b6d4",
  "#22c55e", "#eab308", "#ef4444", "#14b8a6", "#6366f1",
  "#f59e0b", "#000000",
];

const MOCK_LOGO_RESULTS = [
  {
    id: "logo1", name: "方案一", style: "极简现代",
    palette: ["#f97316", "#09090b", "#fafafa"],
    desc: "采用几何构型，以橙色作为主视觉色彩，传达活力与创新。字体选用现代无衬线体，强调科技感与专业性。",
    preview: "linear-gradient(135deg, #f97316, #fbbf24)",
  },
  {
    id: "logo2", name: "方案二", style: "高端简约",
    palette: ["#1e293b", "#94a3b8", "#f1f5f9"],
    desc: "深色底+银灰配色，传递高端与成熟。线条构型干净利落，适合科技/金融类品牌。",
    preview: "linear-gradient(135deg, #1e293b, #475569)",
  },
  {
    id: "logo3", name: "方案三", style: "活力渐变",
    palette: ["#ec4899", "#a855f7", "#6366f1"],
    desc: "三色渐变方案，充满年轻感与活力。适合美妆、时尚、新消费品牌，视觉冲击力强。",
    preview: "linear-gradient(135deg, #ec4899, #a855f7)",
  },
  {
    id: "logo4", name: "方案四", style: "自然温暖",
    palette: ["#d97706", "#92400e", "#fef3c7"],
    desc: "暖色系配色，传达自然、有机、温暖的品牌调性。适合食品、家居、有机生活类品牌。",
    preview: "linear-gradient(135deg, #d97706, #92400e)",
  },
];

const DERIVATIONS = [
  { key: "card", icon: "💼", label: "名片效果图" },
  { key: "package", icon: "📦", label: "包装效果图" },
  { key: "avatar", icon: "👤", label: "社媒头像" },
];

type GenerateStatus = "idle" | "generating" | "done";

export default function BrandingPage() {
  const [brandName, setBrandName] = useState("IMA Studio");
  const [industry, setIndustry] = useState("科技");
  const [slogan, setSlogan] = useState("AI驱动，创作无界");
  const [selectedColor, setSelectedColor] = useState("#f97316");
  const [customColor, setCustomColor] = useState("");
  const [logoStyle, setLogoStyle] = useState("combination");
  const [generateCount] = useState(4);
  const [logoStatus, setLogoStatus] = useState<GenerateStatus>("idle");
  const [logoProgress, setLogoProgress] = useState(0);
  const [selectedLogo, setSelectedLogo] = useState<string | null>(null);
  const [derivStatus, setDerivStatus] = useState<GenerateStatus>("idle");
  const [derivProgress, setDerivProgress] = useState(0);
  const [derivResults, setDerivResults] = useState<Set<string>>(new Set());

  const activeColor = customColor || selectedColor;

  const handleGenerateLogo = async () => {
    setLogoStatus("generating");
    setLogoProgress(0);
    for (let i = 1; i <= 10; i++) {
      await new Promise((r) => setTimeout(r, 200));
      setLogoProgress(i * 10);
    }
    setLogoStatus("done");
  };

  const handleGenerateDeriv = async () => {
    setDerivStatus("generating");
    setDerivProgress(0);
    const items = DERIVATIONS.map((d) => d.key);
    for (let i = 0; i < items.length; i++) {
      await new Promise((r) => setTimeout(r, 700));
      setDerivResults((prev) => new Set([...prev, items[i]]));
      setDerivProgress(Math.round(((i + 1) / items.length) * 100));
    }
    setDerivStatus("done");
  };

  return (
    <>
      <div className="topbar">
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 13, color: "var(--t2)", fontWeight: 600 }}>🎯 品牌 Logo 设计</span>
        </div>
        <div className="credits-badge">✦ 365 积分</div>
      </div>

      <div className="product-page-wrap">
        <div className="fi">
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>🎯 品牌 Logo 设计</h1>
          <p style={{ fontSize: 13, color: "var(--t3)", marginBottom: 28 }}>
            输入品牌信息 → 选择风格 → AI 生成 4 套专业 Logo 方案
          </p>
        </div>

        <div className="flex-row-col">
          {/* Left Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* A. Brand Info */}
            <Card title="📋 品牌信息">
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <FieldGroup label="品牌名称" required>
                  <input
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="输入品牌名称，如 IMA Studio"
                    style={inputStyle}
                  />
                </FieldGroup>
                <FieldGroup label="行业 / 品类" required>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    style={inputStyle}
                  >
                    {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                  </select>
                </FieldGroup>
                <FieldGroup label="品牌理念 / Slogan（可选）">
                  <input
                    value={slogan}
                    onChange={(e) => setSlogan(e.target.value)}
                    placeholder="如：AI驱动，创作无界"
                    style={inputStyle}
                  />
                </FieldGroup>
                <FieldGroup label="品牌色偏好（可选）">
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                    {PRESET_COLORS.map((c) => (
                      <button key={c} onClick={() => { setSelectedColor(c); setCustomColor(""); }} style={{
                        width: 26, height: 26, borderRadius: "50%", background: c,
                        border: (selectedColor === c && !customColor) ? "2px solid #fff" : "2px solid transparent",
                        cursor: "pointer",
                      }} />
                    ))}
                  </div>
                  <input
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    placeholder="#自定义色值"
                    style={{ ...inputStyle, width: 140 }}
                  />
                </FieldGroup>
              </div>
            </Card>

            {/* Generate Config */}
            <Card title="⚙️ 生成配置">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0" }}>
                <span style={{ fontSize: 13, color: "var(--t2)" }}>生成方案数量</span>
                <div style={{ display: "flex", gap: 6 }}>
                  {[2, 4, 6].map((n) => (
                    <button key={n} style={{
                      width: 32, height: 32, borderRadius: 8, fontSize: 13, fontWeight: 700,
                      cursor: "pointer", fontFamily: "inherit", border: "none",
                      background: generateCount === n ? "rgba(249,115,22,0.2)" : "var(--bg4)",
                      color: generateCount === n ? "#f97316" : "var(--t3)",
                    }}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                marginTop: 6, padding: "8px 0", borderTop: "1px solid var(--bd)",
              }}>
                <span style={{ fontSize: 12, color: "var(--t3)" }}>消耗积分</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: "var(--acc)" }}>
                  {generateCount * 10} <span style={{ fontSize: 11, fontWeight: 400 }}>积分</span>
                </span>
              </div>
            </Card>
          </div>

          {/* Right Column - Logo Styles */}
          <Card title="🎨 Logo 风格">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {LOGO_STYLES.map((s) => {
                const active = logoStyle === s.key;
                return (
                  <button key={s.key} onClick={() => setLogoStyle(s.key)} style={{
                    padding: "14px 12px", borderRadius: 12, textAlign: "left",
                    cursor: "pointer", fontFamily: "inherit",
                    background: active ? "rgba(249,115,22,0.1)" : "var(--bg4)",
                    border: `1px solid ${active ? "rgba(249,115,22,0.5)" : "var(--bd)"}`,
                    transition: "all 0.15s",
                  }}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: active ? "#f97316" : "var(--fg)", marginBottom: 2 }}>
                      {s.label}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--t3)", lineHeight: 1.3, marginBottom: 4 }}>{s.desc}</div>
                    <div style={{ fontSize: 9, color: "var(--t3)", opacity: 0.7 }}>例：{s.example}</div>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Generate Button */}
        <div className="fi" style={{ marginTop: 20 }}>
          <div style={{
            background: "var(--bg3)", border: "1px solid var(--bd)", borderRadius: 16, padding: 20,
          }}>
            {logoStatus === "generating" && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>AI 正在创作 {generateCount} 套方案...</span>
                  <span style={{ fontSize: 12, color: "var(--acc)" }}>{logoProgress}%</span>
                </div>
                <div style={{ height: 6, background: "var(--bd)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${logoProgress}%`, background: "linear-gradient(90deg, var(--acc), var(--pk))", transition: "width 0.2s" }} />
                </div>
              </div>
            )}
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button
                onClick={handleGenerateLogo}
                disabled={!brandName.trim() || logoStatus === "generating"}
                style={{
                  padding: "13px 32px", borderRadius: 10, fontSize: 14, fontWeight: 700,
                  cursor: logoStatus === "generating" ? "wait" : "pointer",
                  fontFamily: "inherit", border: "none",
                  background: logoStatus === "generating" ? "var(--bd)" : "linear-gradient(135deg, var(--acc), var(--pk))",
                  color: "#fff", opacity: !brandName.trim() ? 0.4 : 1,
                }}
              >
                {logoStatus === "generating" ? `生成中 ${logoProgress}%...` : logoStatus === "done" ? "🔄 重新生成方案" : `✨ 生成 Logo 方案 · ${generateCount * 10}积分`}
              </button>
              {!brandName.trim() && (
                <span style={{ fontSize: 11, color: "#ef4444" }}>请先填写品牌名称</span>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        {logoStatus === "done" && (
          <div className="fi" style={{ marginTop: 24 }}>
            <Card title="🎉 Logo 方案">
              <div className="branding-result-grid">
                {MOCK_LOGO_RESULTS.slice(0, generateCount).map((logo) => {
                  const isSelected = selectedLogo === logo.id;
                  return (
                    <div
                      key={logo.id}
                      onClick={() => setSelectedLogo(isSelected ? null : logo.id)}
                      style={{
                        borderRadius: 14, overflow: "hidden", cursor: "pointer",
                        border: `2px solid ${isSelected ? "rgba(249,115,22,0.6)" : "var(--bd)"}`,
                        background: "var(--bg4)", transition: "all 0.15s",
                      }}
                    >
                      {/* Logo Preview */}
                      <div style={{
                        height: 110, background: logo.preview,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        position: "relative",
                      }}>
                        <div style={{
                          background: "rgba(0,0,0,0.5)", borderRadius: 10,
                          padding: "8px 14px", backdropFilter: "blur(4px)",
                        }}>
                          <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", letterSpacing: 1 }}>
                            {brandName.slice(0, 10)}
                          </div>
                        </div>
                        {isSelected && (
                          <div style={{
                            position: "absolute", top: 6, right: 6,
                            width: 20, height: 20, borderRadius: "50%",
                            background: "#f97316", display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 10, color: "#fff",
                          }}>✓</div>
                        )}
                      </div>
                      {/* Color Palette */}
                      <div style={{ padding: "10px 12px" }}>
                        <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                          {logo.palette.map((c) => (
                            <div key={c} style={{ width: 16, height: 16, borderRadius: "50%", background: c, border: "1px solid var(--bd)" }} />
                          ))}
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 2 }}>{logo.name}</div>
                        <div style={{ fontSize: 10, color: "var(--t3)", marginBottom: 4 }}>{logo.style}</div>
                        <div style={{ fontSize: 9, color: "var(--t3)", lineHeight: 1.4 }}>{logo.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}

        {/* Derivation */}
        {selectedLogo && (
          <div className="fi" style={{ marginTop: 20 }}>
            <Card title="🎁 衍生应用">
              <p style={{ fontSize: 12, color: "var(--t3)", marginBottom: 16 }}>
                基于选中方案，生成品牌衍生物料
              </p>
              <div className="branding-apps-grid" style={{ marginBottom: 16 }}>
                {DERIVATIONS.map((d) => {
                  const done = derivResults.has(d.key);
                  return (
                    <div key={d.key} style={{
                      background: done ? "rgba(34,197,94,0.05)" : "var(--bg4)",
                      border: `1px solid ${done ? "rgba(34,197,94,0.3)" : "var(--bd)"}`,
                      borderRadius: 12, padding: 16, textAlign: "center",
                    }}>
                      <div style={{ fontSize: 28, marginBottom: 6 }}>{d.icon}</div>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{d.label}</div>
                      {done && (
                        <div style={{ fontSize: 10, color: "#22c55e", marginTop: 4 }}>✅ 已生成</div>
                      )}
                    </div>
                  );
                })}
              </div>
              {derivStatus === "generating" && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ height: 4, background: "var(--bd)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${derivProgress}%`, background: "linear-gradient(90deg, var(--acc), var(--pk))", transition: "width 0.3s" }} />
                  </div>
                </div>
              )}
              <button
                onClick={handleGenerateDeriv}
                disabled={derivStatus === "generating"}
                style={{
                  padding: "11px 28px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit", border: "none",
                  background: derivStatus === "done" ? "rgba(34,197,94,0.2)" : "linear-gradient(135deg, #a855f7, #ec4899)",
                  color: derivStatus === "done" ? "#22c55e" : "#fff",
                }}
              >
                {derivStatus === "done" ? "✅ 全部生成完成" : derivStatus === "generating" ? `生成中 ${derivProgress}%...` : "✨ 生成衍生应用 · 30积分"}
              </button>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Shared Components & Styles ────────────────────────────────
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--bg3)", border: "1px solid var(--bd)", borderRadius: 16, padding: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16 }}>{title}</div>
      {children}
    </div>
  );
}

function FieldGroup({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--t3)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
      </div>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", background: "var(--bg4)", border: "1px solid var(--bd)",
  borderRadius: 8, padding: "9px 12px", fontSize: 13, color: "var(--fg)",
  fontFamily: "inherit", outline: "none",
};
