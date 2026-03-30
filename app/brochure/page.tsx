"use client";

import { useState } from "react";

const FOLD_TYPES = [
  { key: "trifold", icon: "📄", label: "三折页", desc: "最常见", faces: 6, facesLabel: "6面" },
  { key: "bifold", icon: "📃", label: "双折页", desc: "简洁版", faces: 4, facesLabel: "4面" },
  { key: "zfold", icon: "〽️", label: "Z折页", desc: "展开式", faces: 6, facesLabel: "6面" },
  { key: "accordion", icon: "🪗", label: "风琴折", desc: "多层展示", faces: 8, facesLabel: "6-8面" },
  { key: "gatefold", icon: "🚪", label: "对开折", desc: "高端质感", faces: 4, facesLabel: "4+面" },
  { key: "booklet", icon: "📖", label: "手册", desc: "内容丰富", faces: 8, facesLabel: "8+页" },
];

const PURPOSES = ["产品推广", "公司介绍", "活动宣传", "招商手册"];

const DESIGN_STYLES = ["商务简约", "活力时尚", "高端奢华"];

const FOLD_FACES: Record<string, Array<{ id: string; name: string; role: string; placeholder: string }>> = {
  trifold: [
    { id: "f1", name: "封面", role: "COVER", placeholder: "品牌名称、核心卖点、视觉冲击图" },
    { id: "f2", name: "内折页", role: "INNER FOLD", placeholder: "产品/服务核心亮点，第一眼看到的内容" },
    { id: "f3", name: "内左", role: "INNER LEFT", placeholder: "详细产品介绍或服务列表" },
    { id: "f4", name: "内中", role: "INNER CENTER", placeholder: "案例展示、数据图表、核心内容" },
    { id: "f5", name: "内右", role: "INNER RIGHT", placeholder: "联系方式、地址、二维码" },
    { id: "f6", name: "封底", role: "BACK COVER", placeholder: "品牌Slogan、网址、社媒账号" },
  ],
  bifold: [
    { id: "f1", name: "封面", role: "COVER", placeholder: "品牌名称 + 核心卖点" },
    { id: "f2", name: "内左", role: "INNER LEFT", placeholder: "产品/服务介绍" },
    { id: "f3", name: "内右", role: "INNER RIGHT", placeholder: "联系方式 + CTA" },
    { id: "f4", name: "封底", role: "BACK COVER", placeholder: "品牌信息 + 二维码" },
  ],
  zfold: [
    { id: "f1", name: "封面", role: "COVER", placeholder: "品牌名称 + 吸睛图像" },
    { id: "f2", name: "面2", role: "PANEL 2", placeholder: "问题陈述 / 用户痛点" },
    { id: "f3", name: "面3", role: "PANEL 3", placeholder: "解决方案介绍" },
    { id: "f4", name: "面4", role: "PANEL 4", placeholder: "产品特点展示" },
    { id: "f5", name: "面5", role: "PANEL 5", placeholder: "案例 / 数据证明" },
    { id: "f6", name: "封底", role: "BACK COVER", placeholder: "联系方式 + CTA" },
  ],
  accordion: [
    { id: "f1", name: "封面", role: "COVER", placeholder: "品牌视觉 + 核心诉求" },
    { id: "f2", name: "面2", role: "PANEL 2", placeholder: "品牌故事/公司简介" },
    { id: "f3", name: "面3", role: "PANEL 3", placeholder: "产品/服务线一" },
    { id: "f4", name: "面4", role: "PANEL 4", placeholder: "产品/服务线二" },
    { id: "f5", name: "面5", role: "PANEL 5", placeholder: "案例展示" },
    { id: "f6", name: "面6", role: "PANEL 6", placeholder: "荣誉/资质/合作品牌" },
    { id: "f7", name: "面7", role: "PANEL 7", placeholder: "合作流程" },
    { id: "f8", name: "封底", role: "BACK COVER", placeholder: "联系方式 + 二维码" },
  ],
  gatefold: [
    { id: "f1", name: "左封面", role: "LEFT COVER", placeholder: "左侧封面" },
    { id: "f2", name: "右封面", role: "RIGHT COVER", placeholder: "右侧封面（合拢成一幅图）" },
    { id: "f3", name: "内容展开", role: "INNER SPREAD", placeholder: "打开后的完整内容（跨页大图）" },
    { id: "f4", name: "封底", role: "BACK COVER", placeholder: "品牌信息" },
  ],
  booklet: [
    { id: "f1", name: "封面", role: "COVER P1", placeholder: "封面设计" },
    { id: "f2", name: "目录页", role: "PAGE 2", placeholder: "内容目录" },
    { id: "f3", name: "第3页", role: "PAGE 3", placeholder: "品牌介绍" },
    { id: "f4", name: "第4页", role: "PAGE 4", placeholder: "产品/服务" },
    { id: "f5", name: "第5页", role: "PAGE 5", placeholder: "案例展示" },
    { id: "f6", name: "第6页", role: "PAGE 6", placeholder: "团队/荣誉" },
    { id: "f7", name: "第7页", role: "PAGE 7", placeholder: "联系方式" },
    { id: "f8", name: "封底", role: "BACK COVER", placeholder: "封底" },
  ],
};

const STEP_LABELS = [
  { key: "flat", label: "生成设计稿", sub: "展开平面图", icon: "📐", credits: 40 },
  { key: "folded", label: "生成效果图", sub: "折叠立体图", icon: "🎁", credits: 20 },
  { key: "scene", label: "生成场景图", sub: "手持/桌面/展架", icon: "🖼️", credits: 20 },
];

type StepStatus = "idle" | "generating" | "done";

export default function BrochurePage() {
  const [foldType, setFoldType] = useState("trifold");
  const [purpose, setPurpose] = useState("产品推广");
  const [designStyle, setDesignStyle] = useState("商务简约");
  const [brandColor, setBrandColor] = useState("#f97316");
  const [faceContents, setFaceContents] = useState<Record<string, string>>({});
  const [stepStatus, setStepStatus] = useState<Record<string, StepStatus>>({
    flat: "idle", folded: "idle", scene: "idle",
  });
  const [stepProgress, setStepProgress] = useState<Record<string, number>>({
    flat: 0, folded: 0, scene: 0,
  });

  const currentFold = FOLD_TYPES.find((f) => f.key === foldType)!;
  const faces = FOLD_FACES[foldType] || FOLD_FACES.trifold;

  const handleFaceContent = (id: string, value: string) => {
    setFaceContents((prev) => ({ ...prev, [id]: value }));
  };

  const handleStep = async (stepKey: string) => {
    setStepStatus((prev) => ({ ...prev, [stepKey]: "generating" }));
    setStepProgress((prev) => ({ ...prev, [stepKey]: 0 }));
    for (let i = 1; i <= 10; i++) {
      await new Promise((r) => setTimeout(r, 180));
      setStepProgress((prev) => ({ ...prev, [stepKey]: i * 10 }));
    }
    setStepStatus((prev) => ({ ...prev, [stepKey]: "done" }));
  };

  const canDoFolded = stepStatus.flat === "done";
  const canDoScene = stepStatus.folded === "done";

  const PRESET_COLORS = ["#f97316", "#ec4899", "#a855f7", "#3b82f6", "#22c55e", "#eab308"];

  return (
    <>
      <div className="topbar">
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 13, color: "var(--t2)", fontWeight: 600 }}>📄 宣传册设计</span>
        </div>
        <div className="credits-badge">✦ 365 积分</div>
      </div>

      <div className="product-page-wrap">
        <div className="fi">
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>📄 宣传册设计</h1>
          <p style={{ fontSize: 13, color: "var(--t3)", marginBottom: 28 }}>
            选择折页类型 → 填写每面内容 → 分步生成设计稿 → 效果图 → 场景图
          </p>
        </div>

        {/* A. Fold Type */}
        <div className="fi" style={{ marginBottom: 20 }}>
          <Card title="📐 折页类型">
            <div className="brochure-type-grid">
              {FOLD_TYPES.map((f) => {
                const active = foldType === f.key;
                return (
                  <button key={f.key} onClick={() => setFoldType(f.key)} style={{
                    padding: "14px 8px", borderRadius: 12, textAlign: "center",
                    cursor: "pointer", fontFamily: "inherit",
                    background: active ? "rgba(249,115,22,0.1)" : "var(--bg4)",
                    border: `1px solid ${active ? "rgba(249,115,22,0.5)" : "var(--bd)"}`,
                    transition: "all 0.15s",
                  }}>
                    <div style={{ fontSize: 22, marginBottom: 5 }}>{f.icon}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: active ? "#f97316" : "var(--fg)", marginBottom: 2 }}>{f.label}</div>
                    <div style={{ fontSize: 9, color: "var(--t3)" }}>{f.desc}</div>
                    <div style={{ fontSize: 9, color: active ? "#f97316" : "var(--t3)", marginTop: 2, fontWeight: 600 }}>{f.facesLabel}</div>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
          {/* B. Content Input */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <Card title="✏️ 内容框架">
              <div style={{ marginBottom: 14, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "var(--t3)", fontWeight: 600 }}>用途：</span>
                {PURPOSES.map((p) => (
                  <button key={p} onClick={() => setPurpose(p)} style={{
                    padding: "4px 12px", borderRadius: 20, fontSize: 11, cursor: "pointer", fontFamily: "inherit",
                    background: purpose === p ? "rgba(249,115,22,0.15)" : "var(--bg4)",
                    border: `1px solid ${purpose === p ? "rgba(249,115,22,0.5)" : "var(--bd)"}`,
                    color: purpose === p ? "#f97316" : "var(--t2)",
                  }}>{p}</button>
                ))}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {faces.map((face, idx) => (
                  <div key={face.id} style={{
                    background: "var(--bg4)", border: "1px solid var(--bd)",
                    borderRadius: 12, padding: "12px 14px",
                  }}>
                    <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: 6,
                        background: "rgba(249,115,22,0.2)", color: "#f97316",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 10, fontWeight: 800, flexShrink: 0,
                      }}>{idx + 1}</div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700 }}>{face.name}</div>
                        <div style={{ fontSize: 9, color: "var(--t3)", letterSpacing: "0.06em" }}>{face.role}</div>
                      </div>
                    </div>
                    <textarea
                      value={faceContents[face.id] || ""}
                      onChange={(e) => handleFaceContent(face.id, e.target.value)}
                      placeholder={face.placeholder}
                      rows={2}
                      style={{
                        width: "100%", background: "var(--bg3)", border: "1px solid var(--bd)",
                        borderRadius: 8, padding: "8px 10px", fontSize: 12, color: "var(--fg)",
                        fontFamily: "inherit", outline: "none", resize: "vertical", lineHeight: 1.5,
                      }}
                    />
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* C. Style Config + Generate */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Card title="🎨 风格配置">
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <div style={labelStyle}>整体风格</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {DESIGN_STYLES.map((s) => (
                      <button key={s} onClick={() => setDesignStyle(s)} style={{
                        padding: "7px 12px", borderRadius: 8, fontSize: 12,
                        cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                        background: designStyle === s ? "rgba(249,115,22,0.15)" : "transparent",
                        border: `1px solid ${designStyle === s ? "rgba(249,115,22,0.4)" : "transparent"}`,
                        color: designStyle === s ? "#f97316" : "var(--t2)",
                      }}>{s}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={labelStyle}>品牌色</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {PRESET_COLORS.map((c) => (
                      <button key={c} onClick={() => setBrandColor(c)} style={{
                        width: 24, height: 24, borderRadius: "50%", background: c,
                        border: brandColor === c ? "2px solid #fff" : "2px solid transparent",
                        cursor: "pointer",
                      }} />
                    ))}
                  </div>
                </div>
                <div>
                  <div style={labelStyle}>上传图片（可选）</div>
                  <div style={{
                    border: "1.5px dashed var(--bd)", borderRadius: 10,
                    padding: "12px", textAlign: "center", cursor: "pointer", background: "var(--bg4)",
                  }}>
                    <div style={{ fontSize: 18, marginBottom: 3 }}>🖼️</div>
                    <div style={{ fontSize: 11, color: "var(--t3)" }}>Logo / 产品图</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Preview Summary */}
            <div style={{
              background: "var(--bg3)", border: "1px solid var(--bd)", borderRadius: 16, padding: 16,
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10, color: "var(--t2)" }}>当前配置</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 11 }}>
                <InfoRow label="折页类型" value={`${currentFold.label} · ${currentFold.facesLabel}`} />
                <InfoRow label="用途" value={purpose} />
                <InfoRow label="风格" value={designStyle} />
                <InfoRow label="品牌色">
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: brandColor }} />
                    <span style={{ color: "var(--t2)" }}>{brandColor}</span>
                  </div>
                </InfoRow>
              </div>
            </div>

            {/* D. Step Buttons */}
            <div style={{
              background: "var(--bg3)", border: "1px solid var(--bd)", borderRadius: 16, padding: 16,
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 12, color: "var(--t2)" }}>🚀 分步生成</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {STEP_LABELS.map((step, idx) => {
                  const status = stepStatus[step.key];
                  const isDone = status === "done";
                  const isGenerating = status === "generating";
                  const progress = stepProgress[step.key];
                  const disabled = (idx === 1 && !canDoFolded) || (idx === 2 && !canDoScene) || isGenerating;

                  return (
                    <div key={step.key}>
                      <button
                        onClick={() => handleStep(step.key)}
                        disabled={disabled}
                        style={{
                          width: "100%", padding: "11px 14px", borderRadius: 10,
                          fontSize: 12, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
                          fontFamily: "inherit", textAlign: "left",
                          background: isDone
                            ? "rgba(34,197,94,0.1)"
                            : isGenerating
                            ? "rgba(249,115,22,0.08)"
                            : disabled
                            ? "var(--bg4)"
                            : "linear-gradient(135deg, rgba(249,115,22,0.2), rgba(236,72,153,0.15))",
                          color: isDone ? "#22c55e" : disabled && !isGenerating ? "var(--t3)" : "var(--fg)",
                          border: `1px solid ${isDone ? "rgba(34,197,94,0.3)" : disabled && !isGenerating ? "var(--bd)" : "rgba(249,115,22,0.3)"}`,
                          opacity: disabled && !isGenerating ? 0.5 : 1,
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <span style={{ marginRight: 6 }}>{step.icon}</span>
                            {isDone ? "✅ " : ""}{step.label}
                            <div style={{ fontSize: 9, color: isDone ? "#22c55e" : "var(--t3)", marginTop: 1 }}>{step.sub}</div>
                          </div>
                          <span style={{ fontSize: 10, color: isDone ? "#22c55e" : "var(--acc)" }}>
                            {isDone ? "完成" : `${step.credits}积分`}
                          </span>
                        </div>
                      </button>
                      {isGenerating && (
                        <div style={{ marginTop: 4, height: 3, background: "var(--bd)", borderRadius: 2, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, var(--acc), var(--pk))", transition: "width 0.2s" }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {canDoScene && stepStatus.scene === "idle" && (
                <div style={{ marginTop: 10, fontSize: 10, color: "var(--t3)" }}>
                  所有步骤完成后可下载完整设计包
                </div>
              )}
              {stepStatus.scene === "done" && (
                <button style={{
                  marginTop: 12, width: "100%", padding: "10px", borderRadius: 10,
                  fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                  background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)",
                  color: "#22c55e",
                }}>
                  📦 下载完整设计包
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Result Preview */}
        {(stepStatus.flat === "done" || stepStatus.folded === "done" || stepStatus.scene === "done") && (
          <div className="fi" style={{ marginTop: 24 }}>
            <Card title="🎨 生成预览">
              <div className="brochure-type-grid" style={{ gap: 12 }}>
                {STEP_LABELS.filter((s) => stepStatus[s.key] === "done").map((step) => (
                  <div key={step.key} style={{
                    background: "var(--bg4)", border: "1px solid rgba(34,197,94,0.3)",
                    borderRadius: 12, overflow: "hidden",
                  }}>
                    <div style={{
                      height: 120,
                      background: `linear-gradient(135deg, ${brandColor}22, #ec489915)`,
                      display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 6,
                    }}>
                      <div style={{ fontSize: 28 }}>{step.icon}</div>
                      <div style={{ fontSize: 10, color: "#22c55e" }}>✅ 已生成</div>
                    </div>
                    <div style={{ padding: "10px 12px" }}>
                      <div style={{ fontSize: 11, fontWeight: 600 }}>{step.label}</div>
                      <div style={{ fontSize: 10, color: "var(--t3)" }}>{step.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Shared ────────────────────────────────
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--bg3)", border: "1px solid var(--bd)", borderRadius: 16, padding: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16 }}>{title}</div>
      {children}
    </div>
  );
}

function InfoRow({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ color: "var(--t3)" }}>{label}</span>
      {children ?? <span style={{ color: "var(--t2)" }}>{value}</span>}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: 10, fontWeight: 600, color: "var(--t3)",
  marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em",
};
