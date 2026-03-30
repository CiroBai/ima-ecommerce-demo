"use client";

import { useState } from "react";

const PLATFORMS = [
  { key: "ig-post", icon: "📸", label: "Instagram Post", ratio: "4:5", res: "1080×1350", w: 4, h: 5 },
  { key: "ig-story", icon: "📱", label: "Instagram Story", ratio: "9:16", res: "1080×1920", w: 9, h: 16 },
  { key: "xhs", icon: "🌸", label: "小红书", ratio: "3:4", res: "1080×1440", w: 3, h: 4 },
  { key: "tiktok", icon: "🎵", label: "TikTok Cover", ratio: "9:16", res: "1080×1920", w: 9, h: 16 },
  { key: "twitter", icon: "🐦", label: "Twitter / X", ratio: "16:9", res: "1200×675", w: 16, h: 9 },
  { key: "linkedin", icon: "💼", label: "LinkedIn", ratio: "4:5", res: "1080×1350", w: 4, h: 5 },
];

const GOALS = [
  { key: "share", icon: "🔥", label: "SHARE 病毒传播", desc: "高对比，Meme 风，引发共鸣" },
  { key: "save", icon: "💾", label: "SAVE 实用收藏", desc: "信息图，步骤指南，清单" },
  { key: "comment", icon: "💬", label: "COMMENT 互动评论", desc: "A vs B 对比，争议话题" },
];

const PRESET_COLORS = ["#f97316", "#ec4899", "#a855f7", "#06b6d4", "#22c55e", "#eab308"];

const STYLES = ["极简", "高级", "活力", "赛博", "温暖", "复古"];

type GenerateStatus = "idle" | "generating" | "done";

export default function PosterPage() {
  const [platform, setPlatform] = useState("ig-post");
  const [goal, setGoal] = useState("share");
  const [title, setTitle] = useState("让你的产品销量翻倍的5个技巧");
  const [subtitle, setSubtitle] = useState("实测有效 · 亚马逊卖家必看");
  const [brandColor, setBrandColor] = useState("#f97316");
  const [customColor, setCustomColor] = useState("");
  const [styleChoice, setStyleChoice] = useState("极简");
  const [status, setStatus] = useState<GenerateStatus>("idle");
  const [progress, setProgress] = useState(0);

  const currentPlatform = PLATFORMS.find((p) => p.key === platform)!;

  // 计算预览框的宽高比（限制最大尺寸）
  const previewMaxH = 340;
  const previewMaxW = 220;
  const ratioW = currentPlatform.w;
  const ratioH = currentPlatform.h;
  let pvW: number, pvH: number;
  if (ratioW / ratioH > previewMaxW / previewMaxH) {
    pvW = previewMaxW;
    pvH = Math.round((previewMaxW * ratioH) / ratioW);
  } else {
    pvH = previewMaxH;
    pvW = Math.round((previewMaxH * ratioW) / ratioH);
  }

  const activeColor = customColor || brandColor;

  const handleGenerate = async () => {
    setStatus("generating");
    setProgress(0);
    for (let i = 1; i <= 10; i++) {
      await new Promise((r) => setTimeout(r, 150));
      setProgress(i * 10);
    }
    setStatus("done");
  };

  return (
    <>
      <div className="topbar">
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 13, color: "var(--t2)", fontWeight: 600 }}>📸 社媒海报设计</span>
        </div>
        <div className="credits-badge">✦ 365 积分</div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 40px" }} className="poster-page-outer">
        <div className="fi">
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>📸 社媒海报设计</h1>
          <p style={{ fontSize: 13, color: "var(--t3)", marginBottom: 28 }}>
            选择平台 → 设定目标 → 填写内容 → 一键生成高转化率海报
          </p>
        </div>

        <div className="poster-layout">
          {/* Left: Config */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* A. 平台选择 */}
            <Section title="🖼️ 选择平台">
              <div className="poster-platform-grid">
                {PLATFORMS.map((p) => {
                  const active = platform === p.key;
                  return (
                    <button
                      key={p.key}
                      onClick={() => setPlatform(p.key)}
                      style={{
                        padding: "14px 12px", borderRadius: 12, textAlign: "left",
                        cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                        background: active ? "rgba(249,115,22,0.1)" : "var(--bg3)",
                        border: `1px solid ${active ? "rgba(249,115,22,0.5)" : "var(--bd)"}`,
                      }}
                    >
                      <div style={{ fontSize: 22, marginBottom: 6 }}>{p.icon}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: active ? "#f97316" : "var(--fg)", marginBottom: 2 }}>
                        {p.label}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--t3)" }}>{p.ratio} · {p.res}</div>
                    </button>
                  );
                })}
              </div>
            </Section>

            {/* B. 设计目标 */}
            <Section title="🎯 设计目标">
              <div className="poster-goal-grid">
                {GOALS.map((g) => {
                  const active = goal === g.key;
                  return (
                    <button
                      key={g.key}
                      onClick={() => setGoal(g.key)}
                      style={{
                        padding: "16px 14px", borderRadius: 12, textAlign: "left",
                        cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                        background: active ? "rgba(249,115,22,0.1)" : "var(--bg3)",
                        border: `1px solid ${active ? "rgba(249,115,22,0.5)" : "var(--bd)"}`,
                      }}
                    >
                      <div style={{ fontSize: 24, marginBottom: 8 }}>{g.icon}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: active ? "#f97316" : "var(--fg)", marginBottom: 4 }}>
                        {g.label}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--t3)", lineHeight: 1.4 }}>{g.desc}</div>
                    </button>
                  );
                })}
              </div>
            </Section>

            {/* C. 内容输入 */}
            <Section title="✏️ 内容输入">
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <div style={labelStyle}>标题文案 <span style={{ color: "#ef4444" }}>*</span></div>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="输入大标题，建议 8-20 字"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <div style={labelStyle}>副标题 / 描述</div>
                  <input
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="副标题或描述文案（可选）"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <div style={labelStyle}>品牌色</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => { setBrandColor(c); setCustomColor(""); }}
                        style={{
                          width: 28, height: 28, borderRadius: "50%", background: c,
                          border: (brandColor === c && !customColor) ? "2px solid #fff" : "2px solid transparent",
                          cursor: "pointer",
                        }}
                      />
                    ))}
                    <input
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      placeholder="#自定义色"
                      style={{ ...inputStyle, width: 110, marginBottom: 0 }}
                    />
                  </div>
                </div>
                <div>
                  <div style={labelStyle}>风格</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {STYLES.map((s) => (
                      <button
                        key={s}
                        onClick={() => setStyleChoice(s)}
                        style={{
                          padding: "5px 14px", borderRadius: 20, fontSize: 12,
                          cursor: "pointer", fontFamily: "inherit",
                          background: styleChoice === s ? "rgba(249,115,22,0.15)" : "var(--bg4)",
                          border: `1px solid ${styleChoice === s ? "rgba(249,115,22,0.5)" : "var(--bd)"}`,
                          color: styleChoice === s ? "#f97316" : "var(--t2)",
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={labelStyle}>图片上传（可选）</div>
                  <div style={{
                    border: "1.5px dashed var(--bd)", borderRadius: 12,
                    padding: "20px", textAlign: "center", cursor: "pointer",
                    background: "var(--bg3)", transition: "border-color 0.15s",
                  }}>
                    <div style={{ fontSize: 28, marginBottom: 6 }}>🖼️</div>
                    <div style={{ fontSize: 12, color: "var(--t2)", marginBottom: 2 }}>拖拽或点击上传</div>
                    <div style={{ fontSize: 11, color: "var(--t3)" }}>产品图 / 人物图 / 背景图</div>
                  </div>
                </div>
              </div>
            </Section>
          </div>

          {/* Right: Preview */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{
              background: "var(--bg3)", border: "1px solid var(--bd)", borderRadius: 16, padding: 20,
              display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--t2)", width: "100%" }}>
                预览 · {currentPlatform.label}
              </div>

              {/* Preview Canvas */}
              <div style={{
                width: pvW, height: pvH, borderRadius: 12, overflow: "hidden",
                background: "var(--bg4)", border: "1px solid var(--bd)", position: "relative",
                flexShrink: 0,
              }}>
                {status === "done" ? (
                  /* Rendered mock poster */
                  <div style={{
                    width: "100%", height: "100%",
                    background: `linear-gradient(160deg, ${activeColor}22, ${activeColor}08)`,
                    display: "flex", flexDirection: "column",
                    padding: "12px",
                  }}>
                    {/* Safe zone indicator */}
                    <div style={{
                      flex: 1, border: `1px dashed ${activeColor}44`, borderRadius: 8,
                      padding: "10px", display: "flex", flexDirection: "column",
                      justifyContent: "space-between",
                    }}>
                      <div>
                        <div style={{
                          fontSize: Math.round(pvW * 0.085), fontWeight: 800,
                          color: "var(--t1)", lineHeight: 1.2, marginBottom: 6,
                        }}>
                          {title.slice(0, 18)}
                        </div>
                        <div style={{ fontSize: Math.round(pvW * 0.055), color: "var(--t2)" }}>
                          {subtitle.slice(0, 20)}
                        </div>
                      </div>
                      <div style={{
                        height: "40%", borderRadius: 8,
                        background: `linear-gradient(135deg, ${activeColor}33, ${activeColor}11)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 28,
                      }}>🖼️</div>
                      <div style={{
                        height: 4, borderRadius: 2,
                        background: `linear-gradient(90deg, ${activeColor}, #ec4899)`,
                      }} />
                    </div>
                  </div>
                ) : (
                  /* Layout guide */
                  <div style={{
                    width: "100%", height: "100%", padding: "10px",
                    display: "flex", flexDirection: "column", gap: 6,
                  }}>
                    <div style={{ height: "15%", background: `${activeColor}22`, borderRadius: 6, display: "flex", alignItems: "center", padding: "0 8px" }}>
                      <div style={{ fontSize: 9, color: `${activeColor}bb` }}>LOGO 区域</div>
                    </div>
                    <div style={{ height: "20%", background: `${activeColor}15`, borderRadius: 6, display: "flex", alignItems: "center", padding: "0 8px" }}>
                      <div style={{ fontSize: 9, color: "var(--t3)" }}>标题文案</div>
                    </div>
                    <div style={{ flex: 1, background: "var(--bg)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ fontSize: 9, color: "var(--t3)" }}>图片区域</div>
                    </div>
                    <div style={{ height: "10%", background: `${activeColor}22`, borderRadius: 6, display: "flex", alignItems: "center", padding: "0 8px" }}>
                      <div style={{ fontSize: 9, color: "var(--t3)" }}>CTA / 水印</div>
                    </div>
                    {/* Safe zone border */}
                    <div style={{
                      position: "absolute", inset: 16, border: `1px dashed ${activeColor}44`, borderRadius: 8,
                      pointerEvents: "none",
                    }} />
                    <div style={{
                      position: "absolute", top: 8, right: 8,
                      fontSize: 8, color: "var(--t3)", background: "var(--bg4)",
                      padding: "2px 4px", borderRadius: 4,
                    }}>
                      安全区域
                    </div>
                  </div>
                )}
              </div>

              <div style={{ fontSize: 11, color: "var(--t3)", textAlign: "center" }}>
                {currentPlatform.ratio} · {currentPlatform.res}
              </div>

              {/* Generate Button */}
              <div style={{ width: "100%" }}>
                {status === "generating" && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: "var(--t2)" }}>生成中...</span>
                      <span style={{ fontSize: 11, color: "var(--acc)" }}>{progress}%</span>
                    </div>
                    <div style={{ height: 4, background: "var(--bd)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, var(--acc), var(--pk))", transition: "width 0.2s" }} />
                    </div>
                  </div>
                )}
                <button
                  onClick={handleGenerate}
                  disabled={status === "generating" || !title.trim()}
                  style={{
                    width: "100%", padding: "12px", borderRadius: 10, fontSize: 13,
                    fontWeight: 700, cursor: status === "generating" ? "wait" : "pointer",
                    fontFamily: "inherit", border: "none",
                    background: status === "generating" ? "var(--bd)" : "linear-gradient(135deg, var(--acc), var(--pk))",
                    color: "#fff", opacity: !title.trim() ? 0.4 : 1,
                  }}
                >
                  {status === "generating" ? `生成中 ${progress}%...` : status === "done" ? "🎉 重新生成 · 15积分" : "✨ 生成海报 · 15积分"}
                </button>
              </div>

              {status === "done" && (
                <div style={{ width: "100%", display: "flex", gap: 8 }}>
                  <button style={secondaryBtnStyle}>⬇️ 下载</button>
                  <button style={secondaryBtnStyle}>📤 分享</button>
                </div>
              )}
            </div>

            {/* Config summary */}
            <div style={{ background: "var(--bg3)", border: "1px solid var(--bd)", borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--t3)", marginBottom: 10 }}>当前配置</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 11 }}>
                <ConfigRow label="平台" value={currentPlatform.label} />
                <ConfigRow label="目标" value={GOALS.find((g) => g.key === goal)?.label ?? ""} />
                <ConfigRow label="风格" value={styleChoice} />
                <ConfigRow label="品牌色">
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: activeColor }} />
                    <span style={{ color: "var(--t2)" }}>{activeColor}</span>
                  </div>
                </ConfigRow>
              </div>
            </div>
          </div>
        </div>

        {/* Result Gallery */}
        {status === "done" && (
          <div className="fi" style={{ marginTop: 24 }}>
            <Section title="🎨 生成结果">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {[1, 2, 3].map((n) => (
                  <div key={n} style={{
                    background: "var(--bg3)", border: "1px solid var(--bd)", borderRadius: 12,
                    overflow: "hidden", cursor: "pointer",
                  }}>
                    <div style={{
                      height: 140,
                      background: `linear-gradient(${n * 45}deg, ${activeColor}33, #ec489922)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <div style={{ fontSize: 11, color: "var(--t2)" }}>方案 {n}</div>
                    </div>
                    <div style={{ padding: "10px 12px" }}>
                      <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 2 }}>方案 {n}</div>
                      <div style={{ fontSize: 10, color: "var(--t3)" }}>
                        {styleChoice}风格 · {currentPlatform.ratio}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Shared Styles ────────────────────────────────
const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, color: "var(--t3)",
  marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em",
};

const inputStyle: React.CSSProperties = {
  width: "100%", background: "var(--bg4)", border: "1px solid var(--bd)",
  borderRadius: 8, padding: "9px 12px", fontSize: 13, color: "var(--fg)",
  fontFamily: "inherit", outline: "none", marginBottom: 0,
};

const secondaryBtnStyle: React.CSSProperties = {
  flex: 1, padding: "8px", borderRadius: 8, fontSize: 11, fontWeight: 600,
  cursor: "pointer", fontFamily: "inherit",
  background: "rgba(255,255,255,0.05)", border: "1px solid var(--bd)", color: "var(--t2)",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--bg3)", border: "1px solid var(--bd)", borderRadius: 16, padding: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>{title}</div>
      {children}
    </div>
  );
}

function ConfigRow({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ color: "var(--t3)" }}>{label}</span>
      {children || <span style={{ color: "var(--t2)" }}>{value}</span>}
    </div>
  );
}
