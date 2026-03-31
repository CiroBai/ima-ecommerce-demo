"use client";

import { useState, useRef, useCallback } from "react";

/* ─── Types ─── */
type ProjectType = "tvc" | "narrative" | "product_demo";
type AspectRatio = "16:9" | "9:16" | "1:1" | "2.35:1";
type StyleKey = "photorealistic" | "illustration_2d" | "comic" | "cyberpunk" | "anime";
type ShotType = "closeup" | "medium" | "wide" | "overhead" | "low_angle";
type MovementType = "push" | "pull" | "pan" | "static" | "handheld";
type FrameStatus = "idle" | "generating" | "done" | "error";

interface StoryFrame {
  id: number;
  selected: boolean;
  description: string;
  shot: ShotType;
  movement: MovementType;
  narration: string;
  status: FrameStatus;
  resultUrl?: string;
}

/* ─── Constants ─── */
const PROJECT_TYPES: { key: ProjectType; icon: string; label: string; desc: string }[] = [
  { key: "tvc", icon: "🎬", label: "广告分镜", desc: "TVC / 短视频广告" },
  { key: "narrative", icon: "📖", label: "叙事故事板", desc: "教育 / 漫画 / 动画" },
  { key: "product_demo", icon: "🎮", label: "产品演示", desc: "产品功能展示" },
];

const ASPECT_RATIOS: { value: AspectRatio; label: string; desc: string }[] = [
  { value: "16:9", label: "16:9", desc: "电影（默认）" },
  { value: "9:16", label: "9:16", desc: "竖屏" },
  { value: "1:1", label: "1:1", desc: "方形" },
  { value: "2.35:1", label: "2.35:1", desc: "宽银幕" },
];

const STYLES: { key: StyleKey; label: string }[] = [
  { key: "photorealistic", label: "真实摄影" },
  { key: "illustration_2d", label: "2D插画" },
  { key: "comic", label: "漫画分镜" },
  { key: "cyberpunk", label: "赛博朋克" },
  { key: "anime", label: "日系动画" },
];

const SHOT_OPTIONS: { value: ShotType; label: string }[] = [
  { value: "closeup", label: "特写" },
  { value: "medium", label: "中景" },
  { value: "wide", label: "全景" },
  { value: "overhead", label: "俯拍" },
  { value: "low_angle", label: "仰拍" },
];

const MOVEMENT_OPTIONS: { value: MovementType; label: string }[] = [
  { value: "push", label: "推进" },
  { value: "pull", label: "拉远" },
  { value: "pan", label: "平移" },
  { value: "static", label: "固定" },
  { value: "handheld", label: "手持" },
];

const stylePrompts: Record<StyleKey, string> = {
  photorealistic: "photorealistic, cinematic quality, high resolution",
  illustration_2d: "2D illustration, flat design, clean vector style",
  comic: "comic book style, bold outlines, dynamic panel",
  cyberpunk: "cyberpunk aesthetic, neon lights, dark futuristic",
  anime: "anime style, Japanese animation aesthetic, vibrant colors",
};

const shotPrompts: Record<ShotType, string> = {
  closeup: "close-up shot",
  medium: "medium shot",
  wide: "wide establishing shot",
  overhead: "overhead bird's eye view",
  low_angle: "low angle dramatic shot",
};

const movementPrompts: Record<MovementType, string> = {
  push: "camera pushing in",
  pull: "camera pulling back",
  pan: "horizontal camera pan",
  static: "static locked camera",
  handheld: "handheld camera movement",
};

const DEFAULT_FRAMES: StoryFrame[] = [
  { id: 1, selected: true, description: "产品亮相，深色背景中产品缓缓出现", shot: "closeup", movement: "push", narration: "", status: "idle" },
  { id: 2, selected: true, description: "使用场景，角色在日常环境中使用产品", shot: "medium", movement: "pan", narration: "", status: "idle" },
  { id: 3, selected: true, description: "核心功能特写，展示产品独特卖点", shot: "closeup", movement: "static", narration: "", status: "idle" },
  { id: 4, selected: true, description: "结尾画面，产品+品牌Logo居中展示", shot: "wide", movement: "static", narration: "", status: "idle" },
];

const CREDITS_PER_FRAME = 15;
let nextFrameId = 100;

/* ─── Component ─── */
export default function StoryboardPage() {
  const [projectType, setProjectType] = useState<ProjectType>("tvc");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [style, setStyle] = useState<StyleKey>("photorealistic");

  const [charName, setCharName] = useState("");
  const [charDesc, setCharDesc] = useState("");
  const [charRefImage, setCharRefImage] = useState<string | null>(null);
  const [charUploading, setCharUploading] = useState(false);

  const [frames, setFrames] = useState<StoryFrame[]>(DEFAULT_FRAMES);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [doneCount, setDoneCount] = useState(0);

  const abortRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedCount = frames.filter((f) => f.selected).length;
  const totalCredits = selectedCount * CREDITS_PER_FRAME;

  /* ─── Frame Handlers ─── */
  const updateFrame = (id: number, patch: Partial<StoryFrame>) => {
    setFrames((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  };

  const toggleFrame = (id: number) => {
    setFrames((prev) => prev.map((f) => (f.id === id ? { ...f, selected: !f.selected } : f)));
  };

  const removeFrame = (id: number) => {
    setFrames((prev) => prev.filter((f) => f.id !== id));
  };

  const addFrame = () => {
    const newId = ++nextFrameId;
    setFrames((prev) => [...prev, {
      id: newId, selected: true, description: "新分镜：描述画面内容...",
      shot: "medium" as ShotType, movement: "static" as MovementType,
      narration: "", status: "idle" as FrameStatus,
    }]);
  };

  /* ─── Upload ─── */
  const handleCharUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/") || file.size > 20 * 1024 * 1024) return;
    setCharUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const resp = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "上传失败");
      setCharRefImage(data.url);
    } catch { /* silent */ } finally { setCharUploading(false); }
  }, []);

  /* ─── Prompt builder ─── */
  const buildPrompt = (frame: StoryFrame): string => {
    const charPart = charDesc.trim() ? `Character: ${charName.trim() || "unnamed"}, ${charDesc.trim()}.` : "";
    return `Storyboard frame: ${frame.description}. ${charPart} ${shotPrompts[frame.shot]}, ${movementPrompts[frame.movement]}, ${stylePrompts[style]}, aspect ratio ${aspectRatio}, cinematic framing, professional storyboard quality`;
  };

  /* ─── Poll ─── */
  async function pollUntilDone(taskId: string, signal: AbortSignal): Promise<string> {
    for (let i = 0; i < 60; i++) {
      if (signal.aborted) throw new Error("aborted");
      await new Promise((r) => setTimeout(r, 3000));
      if (signal.aborted) throw new Error("aborted");
      const res = await fetch("/api/poll", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId }), signal,
      });
      if (!res.ok) throw new Error(`Poll HTTP ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (data.done && data.result?.url) return data.result.url;
      if (data.status === "error") throw new Error(data.error || "生成失败");
    }
    throw new Error("生成超时");
  }

  /* ─── Generate single frame ─── */
  async function genSingleFrame(frame: StoryFrame, signal: AbortSignal): Promise<void> {
    setFrames((p) => p.map((f) => (f.id === frame.id ? { ...f, status: "generating" as FrameStatus, resultUrl: undefined } : f)));
    try {
      const prompt = buildPrompt(frame);
      const hasRef = !!charRefImage;
      const body: Record<string, unknown> = {
        prompt, modelId: "doubao-seedream-4.5",
        taskType: hasRef ? "image_to_image" : "text_to_image",
        inputImages: hasRef ? [charRefImage] : [],
      };
      const genRes = await fetch("/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body), signal,
      });
      const genData = await genRes.json();
      if (!genRes.ok || !genData.taskId) throw new Error(genData.error || "生成任务创建失败");
      const resultUrl = await pollUntilDone(genData.taskId, signal);
      setFrames((p) => p.map((f) => (f.id === frame.id ? { ...f, status: "done" as FrameStatus, resultUrl } : f)));
    } catch (err) {
      if (signal.aborted) return;
      setFrames((p) => p.map((f) => (f.id === frame.id ? { ...f, status: "error" as FrameStatus } : f)));
    }
  }

  /* ─── Batch generate (concurrency 2) ─── */
  const handleGenerate = async () => {
    if (selectedCount === 0) return;
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setGenerating(true);
    setProgress(0);
    setDoneCount(0);
    setFrames((p) => p.map((f) => (f.selected ? { ...f, status: "idle" as FrameStatus, resultUrl: undefined } : f)));

    const sel = frames.filter((f) => f.selected);
    const total = sel.length;
    let completed = 0;
    const queue = [...sel];

    const runNext = async (): Promise<void> => {
      if (queue.length === 0 || controller.signal.aborted) return;
      const frame = queue.shift()!;
      await genSingleFrame(frame, controller.signal);
      completed++;
      setDoneCount(completed);
      setProgress(Math.round((completed / total) * 100));
      return runNext();
    };

    const concurrency = Math.min(2, total);
    await Promise.all(Array.from({ length: concurrency }, () => runNext()));
    setGenerating(false);
  };

  const handleCancel = () => {
    if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; }
    setFrames((p) => p.map((f) => (f.status === "generating" ? { ...f, status: "idle" as FrameStatus } : f)));
    setGenerating(false);
  };

  /* ─── Select helper ─── */
  const Sel = ({ value, options, onChange }: { value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) => (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      style={{ background: "var(--bg4)", border: "1px solid var(--bd)", borderRadius: 6, padding: "3px 8px", fontSize: 11, color: "var(--fg)", fontFamily: "inherit", outline: "none" }}>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );

  const completedFrames = frames.filter((f) => f.status === "done" && f.resultUrl);

  /* ─── Render ─── */
  return (
    <>
      <div className="topbar">
        <div style={{ flex: 1 }}><span style={{ fontSize: 13, color: "var(--t2)", fontWeight: 600 }}>🎬 故事板 / 分镜</span></div>
        <div className="credits-badge">✦ 365 积分</div>
      </div>

      <div className="product-page-wrap">
        {/* Title */}
        <div className="fi">
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6, fontFamily: "var(--font-display, 'Plus Jakarta Sans', system-ui, sans-serif)", letterSpacing: "-0.02em" }}>
            🎬 故事板 / 分镜设计
          </h1>
          <p style={{ fontSize: 13, color: "var(--t3)", marginBottom: 24 }}>
            选择项目类型、配置风格与角色 → 编辑分镜脚本 → AI 批量生成分镜图
          </p>
        </div>

        {/* ─── Config Area (2 cols) ─── */}
        <div className="fi" style={{ marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Left: Project + Ratio + Style */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Project Type */}
              <div className="glow-card" style={{ padding: 16 }}>
                <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 10, fontWeight: 600 }}>📽️ 项目类型</div>
                {PROJECT_TYPES.map((pt) => {
                  const a = projectType === pt.key;
                  return (
                    <button key={pt.key} onClick={() => setProjectType(pt.key)}
                      style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", marginBottom: 4, borderRadius: 10, fontSize: 12, cursor: "pointer", fontFamily: "inherit", textAlign: "left", background: a ? "rgba(249,115,22,0.15)" : "transparent", border: `1px solid ${a ? "rgba(249,115,22,0.4)" : "transparent"}`, color: a ? "#f97316" : "var(--t2)", transition: "all 0.2s" }}>
                      <span style={{ fontSize: 16 }}>{pt.icon}</span>
                      <div><div style={{ fontWeight: 700 }}>{pt.label}</div><div style={{ fontSize: 10, color: "var(--t3)" }}>{pt.desc}</div></div>
                    </button>
                  );
                })}
              </div>

              {/* Aspect Ratio */}
              <div className="glow-card" style={{ padding: 16 }}>
                <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 10, fontWeight: 600 }}>📐 画面比例</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {ASPECT_RATIOS.map((ar) => {
                    const a = aspectRatio === ar.value;
                    return (
                      <button key={ar.value} onClick={() => setAspectRatio(ar.value)}
                        style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, cursor: "pointer", fontFamily: "inherit", background: a ? "rgba(249,115,22,0.15)" : "transparent", border: `1px solid ${a ? "rgba(249,115,22,0.4)" : "var(--bd)"}`, color: a ? "#f97316" : "var(--t2)", transition: "all 0.2s" }}>
                        <strong>{ar.label}</strong><span style={{ fontSize: 10, color: "var(--t3)", marginLeft: 4 }}>{ar.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Style */}
              <div className="glow-card" style={{ padding: 16 }}>
                <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 10, fontWeight: 600 }}>🎨 画面风格</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {STYLES.map((s) => {
                    const a = style === s.key;
                    return (
                      <button key={s.key} onClick={() => setStyle(s.key)}
                        style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, cursor: "pointer", fontFamily: "inherit", background: a ? "rgba(249,115,22,0.15)" : "transparent", border: `1px solid ${a ? "rgba(249,115,22,0.4)" : "var(--bd)"}`, color: a ? "#f97316" : "var(--t2)", transition: "all 0.2s" }}>
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Character */}
            <div className="glow-card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>👤 角色设定</div>
                <div style={{ fontSize: 11, color: "var(--t3)" }}>定义角色外貌，保持分镜一致性（可选）</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--t2)", marginBottom: 4 }}>角色名称</div>
                <input value={charName} onChange={(e) => setCharName(e.target.value)} placeholder="例：小明"
                  style={{ width: "100%", background: "var(--bg4)", border: "1px solid var(--bd)", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "var(--fg)", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--t2)", marginBottom: 4 }}>角色描述（外貌 / 服装 / 特征）</div>
                <textarea value={charDesc} onChange={(e) => setCharDesc(e.target.value)} rows={3}
                  placeholder="例：25岁亚洲女性，短发，穿白色T恤和牛仔裤，戴圆框眼镜"
                  style={{ width: "100%", background: "var(--bg4)", border: "1px solid var(--bd)", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "var(--fg)", fontFamily: "inherit", outline: "none", resize: "vertical", lineHeight: 1.5, boxSizing: "border-box" }} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--t2)", marginBottom: 6 }}>
                  参考图（可选）<span style={{ fontSize: 10, color: "var(--t3)", marginLeft: 6, fontWeight: 400 }}>上传后使用 image-to-image</span>
                </div>
                {charRefImage ? (
                  <div style={{ position: "relative", width: 100, height: 100, borderRadius: 10, overflow: "hidden", border: "1px solid var(--bd)" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={charRefImage} alt="角色参考" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button onClick={() => setCharRefImage(null)}
                      style={{ position: "absolute", top: 4, right: 4, width: 20, height: 20, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>×</button>
                  </div>
                ) : (
                  <div onClick={() => fileInputRef.current?.click()}
                    style={{ width: 100, height: 100, borderRadius: 10, border: "1px dashed var(--bd)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: charUploading ? "wait" : "pointer", background: "var(--bg4)", transition: "all 0.2s", gap: 4 }}>
                    {charUploading
                      ? <span style={{ fontSize: 11, color: "var(--t3)" }}>上传中...</span>
                      : <><span style={{ fontSize: 20, color: "var(--t3)" }}>+</span><span style={{ fontSize: 10, color: "var(--t3)" }}>上传参考图</span></>}
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCharUpload(f); e.target.value = ""; }} />
              </div>
            </div>
          </div>
        </div>

        {/* Summary bar */}
        <div className="fi" style={{ marginBottom: 20 }}>
          <div className="glow-card" style={{ padding: "10px 16px", display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12, borderRadius: 12 }}>
            <span>{PROJECT_TYPES.find((p) => p.key === projectType)?.icon} <strong>{PROJECT_TYPES.find((p) => p.key === projectType)?.label}</strong></span>
            <span>📐 <strong>{aspectRatio}</strong></span>
            <span>🎨 <strong>{STYLES.find((s) => s.key === style)?.label}</strong></span>
            {charName.trim() && <span>👤 <strong>{charName}</strong></span>}
            {charRefImage && <span>🖼️ <strong>有参考图</strong></span>}
            <span>🎞️ <strong>{frames.length} 帧</strong></span>
          </div>
        </div>

        {/* ─── Storyboard Script Panel ─── */}
        <div className="fi" style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>🎞️ 分镜脚本</h3>
              <p style={{ fontSize: 12, color: "var(--t3)" }}>每帧可编辑画面描述、镜头参数和旁白</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#f97316" }}>{totalCredits} <span style={{ fontSize: 11, fontWeight: 400 }}>积分</span></div>
              <div style={{ fontSize: 10, color: "var(--t3)" }}>{selectedCount} / {frames.length} 帧</div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {frames.map((frame, idx) => (
              <div key={frame.id} style={{
                background: frame.status === "done" ? "rgba(34,197,94,0.04)" : frame.status === "generating" ? "rgba(249,115,22,0.04)" : frame.status === "error" ? "rgba(239,68,68,0.04)" : "var(--bg3)",
                border: `1px solid ${frame.status === "done" ? "rgba(34,197,94,0.3)" : frame.status === "generating" ? "rgba(249,115,22,0.3)" : frame.status === "error" ? "rgba(239,68,68,0.3)" : "var(--bd)"}`,
                borderRadius: 14, padding: 16, transition: "all 0.3s",
              }}>
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0 }}>
                    <div onClick={() => toggleFrame(frame.id)} style={{
                      width: 22, height: 22, borderRadius: "50%", cursor: "pointer",
                      background: frame.status === "done" ? "#22c55e" : frame.selected ? "#f97316" : "transparent",
                      border: `1.5px solid ${frame.status === "done" ? "#22c55e" : frame.selected ? "#f97316" : "var(--bd)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff",
                    }}>
                      {frame.status === "done" ? "✓" : frame.status === "generating" ? "⟳" : frame.selected ? "✓" : ""}
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "var(--t3)" }}>F{idx + 1}</div>
                    <div style={{ fontSize: 10, color: "var(--acc)", fontWeight: 600 }}>{CREDITS_PER_FRAME}积分</div>
                  </div>

                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                    <textarea value={frame.description} onChange={(e) => updateFrame(frame.id, { description: e.target.value })} rows={2}
                      placeholder="描述这一帧的画面内容..."
                      style={{ width: "100%", background: "var(--bg4)", border: "1px solid var(--bd)", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "var(--fg)", fontFamily: "inherit", resize: "vertical", outline: "none", lineHeight: 1.5 }} />

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                      <span style={{ fontSize: 10, color: "var(--t3)" }}>📷 镜头</span>
                      <Sel value={frame.shot} options={SHOT_OPTIONS} onChange={(v) => updateFrame(frame.id, { shot: v as ShotType })} />
                      <span style={{ fontSize: 10, color: "var(--t3)" }}>🎥 运镜</span>
                      <Sel value={frame.movement} options={MOVEMENT_OPTIONS} onChange={(v) => updateFrame(frame.id, { movement: v as MovementType })} />
                    </div>

                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontSize: 10, color: "var(--t3)", flexShrink: 0 }}>💬</span>
                      <input value={frame.narration} onChange={(e) => updateFrame(frame.id, { narration: e.target.value })} placeholder="旁白/字幕（可选）"
                        style={{ flex: 1, background: "var(--bg4)", border: "1px solid var(--bd)", borderRadius: 6, padding: "3px 8px", fontSize: 11, color: "var(--fg)", fontFamily: "inherit", outline: "none" }} />
                      <button onClick={() => removeFrame(frame.id)}
                        style={{ width: 24, height: 24, borderRadius: 6, border: "none", background: "rgba(239,68,68,0.1)", color: "#ef4444", fontSize: 14, cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}>×</button>
                    </div>

                    {frame.status === "generating" && (
                      <div style={{ height: 60, borderRadius: 8, background: "rgba(249,115,22,0.06)", border: "1px dashed rgba(249,115,22,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#f97316", gap: 6 }}>
                        <span style={{ display: "inline-block", animation: "spin 1s linear infinite", width: 16, height: 16, border: "2px solid #f97316", borderTopColor: "transparent", borderRadius: "50%" }} />
                        生成中...
                      </div>
                    )}
                    {frame.status === "done" && frame.resultUrl && (
                      <div style={{ borderRadius: 8, overflow: "hidden", border: "1px solid rgba(34,197,94,0.3)" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={frame.resultUrl} alt={`Frame ${frame.id}`} style={{ width: "100%", height: 120, objectFit: "cover", display: "block" }} />
                        <div style={{ display: "flex", gap: 6, padding: 6 }}>
                          <a href={frame.resultUrl} target="_blank" rel="noopener noreferrer" download={`frame-${frame.id}.png`}
                            style={{ flex: 1, padding: "4px 0", borderRadius: 4, textAlign: "center", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", color: "#22c55e", fontSize: 10, fontWeight: 600, textDecoration: "none" }}>⬇ 下载</a>
                        </div>
                      </div>
                    )}
                    {frame.status === "error" && (
                      <div style={{ height: 60, borderRadius: 8, background: "rgba(239,68,68,0.04)", border: "1px dashed rgba(239,68,68,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#ef4444" }}>
                        ❌ 生成失败
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <button onClick={addFrame} style={{
                  padding: "10px 20px", borderRadius: 10, fontSize: 12, fontWeight: 600,
                  background: "rgba(255,255,255,0.05)", border: "1px dashed var(--bd)",
                  color: "var(--t2)", cursor: "pointer", fontFamily: "inherit",
                }}>
                  + 添加分镜帧
                </button>
              </div>
            </div>

            {/* Generate button */}
            <div style={{ background: "var(--bg3)", border: "1px solid var(--bd)", borderRadius: 16, padding: 20, marginBottom: 24 }}>
              {generating && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>生成分镜中...</span>
                    <span style={{ fontSize: 12, color: "var(--acc)" }}>{progress}%</span>
                  </div>
                  <div style={{ width: "100%", height: 6, background: "var(--bd)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, var(--acc), var(--pk))", borderRadius: 3, transition: "width 0.3s" }} />
                  </div>
                  <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 6 }}>已完成 {doneCount} / {selectedCount} 帧</div>
                </div>
              )}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button onClick={handleGenerate} disabled={generating || selectedCount === 0}
                  className={generating ? "" : "btn-glow"}
                  style={{
                    padding: "12px 28px", borderRadius: 10, fontSize: 14, fontWeight: 700,
                    cursor: generating || selectedCount === 0 ? "not-allowed" : "pointer",
                    fontFamily: "inherit",
                    ...(generating ? { background: "var(--bd)", border: "none", color: "var(--t3)" } : { color: "#000" }),
                    opacity: selectedCount === 0 ? 0.4 : 1,
                  }}
                >
                  {generating ? `生成中 ${progress}%...` : `生成 ${selectedCount} 帧分镜 · ${totalCredits} 积分`}
                </button>
                {generating && (
                  <button onClick={handleCancel} style={{
                    padding: "12px 20px", borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer",
                    fontFamily: "inherit", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444",
                  }}>取消</button>
                )}
              </div>
            </div>

            {/* Storyboard results */}
            {doneCount > 0 && (
              <div className="fi">
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>🎬 分镜板</h3>
                <div style={{ background: "#0a0a0f", borderRadius: 16, padding: 20, border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
                    {frames.filter((f) => f.status === "done" && f.resultUrl).map((frame) => (
                      <div key={frame.id} style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", background: "#12121a" }}>
                        <div style={{ position: "relative" }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={frame.resultUrl!} alt={`Frame ${frame.id}`} style={{ width: "100%", height: 180, objectFit: "cover", display: "block" }} />
                          <div style={{
                            position: "absolute", top: 8, left: 8,
                            padding: "3px 10px", borderRadius: 6,
                            background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
                            fontSize: 11, fontWeight: 700, color: "#f97316",
                          }}>
                            F{frame.id}
                          </div>
                          <div style={{
                            position: "absolute", bottom: 0, left: 0, right: 0,
                            background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
                            padding: "20px 12px 10px",
                          }}>
                            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>
                              {frame.description.slice(0, 60)}{frame.description.length > 60 ? "..." : ""}
                            </div>
                          </div>
                        </div>
                        <div style={{ padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ fontSize: 9, color: "var(--t3)" }}>
                            📷 {SHOT_OPTIONS.find((s) => s.value === frame.shot)?.label} · 🎥 {MOVEMENT_OPTIONS.find((m) => m.value === frame.movement)?.label}
                          </div>
                          <a href={frame.resultUrl!} target="_blank" rel="noopener noreferrer" download={`storyboard-F${frame.id}.png`}
                            style={{ fontSize: 10, color: "#22c55e", textDecoration: "none", fontWeight: 600 }}>⬇</a>
                        </div>
                        {frame.narration && (
                          <div style={{ padding: "0 12px 10px", fontSize: 10, color: "var(--t3)", fontStyle: "italic" }}>
                            💬 {frame.narration}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
      </div>

      <style jsx>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}

/* ── Reusable select ── */
function Sel({ value, options, onChange }: { value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      style={{ background: "var(--bg4)", border: "1px solid var(--bd)", borderRadius: 6, padding: "3px 6px", fontSize: 10, color: "var(--fg)", fontFamily: "inherit", outline: "none" }}>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}