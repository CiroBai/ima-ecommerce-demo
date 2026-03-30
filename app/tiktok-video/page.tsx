"use client";

import { useState } from "react";

type VideoType = "unboxing" | "problem" | "howto" | "comparison" | "rhythm" | "showcase";
type ShotSize = "特写" | "中景" | "全景" | "俯拍" | "仰拍";
type CameraMove = "推进" | "拉远" | "平移" | "固定" | "手持跟随" | "环绕";
type GenerationStatus = "idle" | "generating" | "done";

interface StoryboardFrame {
  id: string;
  timeStart: string;
  timeEnd: string;
  description: string;
  shotSize: ShotSize;
  cameraMove: CameraMove;
  audio: string;
  subtitle: string;
  credits: number;
  status: GenerationStatus;
}

const VIDEO_TYPES: { key: VideoType; icon: string; label: string; desc: string }[] = [
  { key: "unboxing", icon: "🎁", label: "开箱展示", desc: "第一视角拆箱，制造期待感" },
  { key: "problem", icon: "🔧", label: "问题解决", desc: "痛点引入→产品解决→效果展示" },
  { key: "howto", icon: "📖", label: "使用教程", desc: "步骤化演示，降低决策门槛" },
  { key: "comparison", icon: "⚖️", label: "产品对比", desc: "A/B对比，突出核心差异" },
  { key: "rhythm", icon: "⚡", label: "节奏快剪", desc: "卡点BGM+快切画面，适合信息流" },
  { key: "showcase", icon: "🎬", label: "产品展示", desc: "产品为主角，全方位展示卖相" },
];

const DURATIONS = [
  { value: 15, label: "15秒", desc: "信息流广告" },
  { value: 30, label: "30秒", desc: "标准带货" },
  { value: 60, label: "60秒", desc: "深度种草" },
];

const RATIOS = [
  { value: "9:16", label: "9:16", desc: "竖屏（推荐）" },
  { value: "1:1", label: "1:1", desc: "方形" },
  { value: "16:9", label: "16:9", desc: "横屏" },
];

const LANGUAGES = ["中文", "English", "日本語", "한국어", "Español"];
const STYLES = ["真实感", "卡通", "混合", "赛博朋克", "日系清新"];
const SHOT_SIZES: ShotSize[] = ["特写", "中景", "全景", "俯拍", "仰拍"];
const CAMERA_MOVES: CameraMove[] = ["推进", "拉远", "平移", "固定", "手持跟随", "环绕"];

function generateMockFrames(type: VideoType, dur: number): StoryboardFrame[] {
  const tpl: Record<VideoType, { desc: string; shot: ShotSize; cam: CameraMove; audio: string; sub: string }[]> = {
    unboxing: [
      { desc: "快递箱特写，手伸入画面准备拆箱", shot: "特写", cam: "固定", audio: "ASMR拆箱音效", sub: "今天开箱一个超火的新品！" },
      { desc: "撕开包装，产品若隐若现", shot: "特写", cam: "推进", audio: "BGM节奏渐起", sub: "包装质感就很高级..." },
      { desc: "产品完整亮相，手持展示正面", shot: "中景", cam: "固定", audio: "BGM高潮", sub: "颜值也太能打了吧！" },
      { desc: "产品旋转展示各个角度", shot: "中景", cam: "环绕", audio: "旁白介绍", sub: "做工精细，手感一流" },
      { desc: "对镜头展示核心功能", shot: "特写", cam: "推进", audio: "音效强调", sub: "最惊喜的功能是..." },
      { desc: "实际使用演示", shot: "全景", cam: "固定", audio: "BGM轻快", sub: "用起来真的很方便" },
      { desc: "表情特写+推荐语", shot: "特写", cam: "固定", audio: "BGM收尾", sub: "强烈推荐！链接在购物车🛒" },
    ],
    problem: [
      { desc: "痛点场景重现：用户遇到问题很烦躁", shot: "中景", cam: "手持跟随", audio: "烦躁音效", sub: "是不是每次都遇到这个问题？" },
      { desc: "放大痛点：问题细节特写", shot: "特写", cam: "推进", audio: "紧张BGM", sub: "试了好多方法都不行..." },
      { desc: "转折：产品登场", shot: "中景", cam: "固定", audio: "转折音效", sub: "直到我发现了这个！" },
      { desc: "产品解决问题的过程", shot: "特写", cam: "平移", audio: "轻快BGM", sub: "一步搞定，效果立竿见影" },
      { desc: "效果对比（Before/After）", shot: "全景", cam: "固定", audio: "惊叹音效", sub: "对比太明显了！" },
      { desc: "总结+购买引导", shot: "中景", cam: "固定", audio: "BGM收尾", sub: "链接放购物车了，别错过🛒" },
    ],
    howto: [
      { desc: "产品全貌+今天教什么", shot: "中景", cam: "固定", audio: "轻快BGM", sub: "3步教你用好这个神器" },
      { desc: "Step 1：准备/安装", shot: "特写", cam: "固定", audio: "旁白讲解", sub: "第一步：打开包装取出产品" },
      { desc: "Step 2：核心操作演示", shot: "特写", cam: "推进", audio: "旁白讲解", sub: "第二步：按住这个按钮..." },
      { desc: "Step 3：完成/效果展示", shot: "中景", cam: "拉远", audio: "旁白讲解", sub: "第三步：等待30秒就好了" },
      { desc: "成果展示+满意表情", shot: "全景", cam: "固定", audio: "成就音效", sub: "完成！效果超出预期" },
      { desc: "购买引导", shot: "中景", cam: "固定", audio: "BGM收尾", sub: "购物车链接🛒 新手也能轻松上手" },
    ],
    comparison: [
      { desc: "两个产品并排摆放", shot: "全景", cam: "固定", audio: "对比BGM", sub: "今天做个硬核对比测评" },
      { desc: "对比点1：外观/设计", shot: "特写", cam: "平移", audio: "旁白讲解", sub: "先看外观：左边 vs 右边" },
      { desc: "对比点2：核心功能", shot: "特写", cam: "推进", audio: "旁白讲解", sub: "功能上差距就大了..." },
      { desc: "对比点3：实际使用效果", shot: "中景", cam: "固定", audio: "音效强调", sub: "实测效果对比" },
      { desc: "总结：推荐哪个", shot: "中景", cam: "固定", audio: "结论BGM", sub: "综合来看，我推荐这个👉" },
    ],
    rhythm: [
      { desc: "产品暗光登场", shot: "特写", cam: "固定", audio: "BGM节拍1 DROP", sub: "" },
      { desc: "快切：产品正面", shot: "特写", cam: "推进", audio: "卡点1", sub: "" },
      { desc: "快切：使用场景1", shot: "中景", cam: "平移", audio: "卡点2", sub: "" },
      { desc: "快切：细节特写", shot: "特写", cam: "固定", audio: "卡点3", sub: "" },
      { desc: "快切：使用场景2", shot: "全景", cam: "手持跟随", audio: "卡点4", sub: "" },
      { desc: "快切：效果/成果", shot: "中景", cam: "推进", audio: "卡点5", sub: "" },
      { desc: "Logo+价格+CTA", shot: "中景", cam: "固定", audio: "BGM收尾", sub: "限时优惠🛒" },
    ],
    showcase: [
      { desc: "产品神秘登场，暗光逐渐亮起", shot: "特写", cam: "固定", audio: "BGM紧张氛围", sub: "" },
      { desc: "产品全貌展示，360°旋转", shot: "中景", cam: "环绕", audio: "BGM节奏加快", sub: "全新设计，重新定义品质" },
      { desc: "材质/工艺特写", shot: "特写", cam: "推进", audio: "旁白介绍材质", sub: "航空级铝合金，CNC精密加工" },
      { desc: "核心功能演示", shot: "中景", cam: "平移", audio: "旁白讲功能", sub: "一键操作，3秒启动" },
      { desc: "使用场景展示", shot: "全景", cam: "固定", audio: "BGM高潮", sub: "无论何时何地，随心使用" },
      { desc: "Logo+购买引导", shot: "中景", cam: "固定", audio: "BGM收尾", sub: "立即拥有 🛒 链接在购物车" },
    ],
  };
  const templates = tpl[type];
  const maxFrames = dur === 15 ? 5 : dur === 30 ? Math.min(6, templates.length) : templates.length;
  const frames = templates.slice(0, maxFrames);
  const secPerFrame = dur / frames.length;
  return frames.map((t, i) => ({
    id: `frame-${i}`,
    timeStart: fmtTime(Math.floor(i * secPerFrame)),
    timeEnd: fmtTime(Math.floor((i + 1) * secPerFrame)),
    description: t.desc,
    shotSize: t.shot,
    cameraMove: t.cam,
    audio: t.audio,
    subtitle: t.sub,
    credits: 15,
    status: "idle" as GenerationStatus,
  }));
}

function fmtTime(sec: number): string {
  return `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, "0")}`;
}

export default function TikTokVideoPage() {
  const [videoType, setVideoType] = useState<VideoType>("showcase");
  const [duration, setDuration] = useState(15);
  const [ratio, setRatio] = useState("9:16");
  const [language, setLanguage] = useState("中文");
  const [style, setStyle] = useState("真实感");
  const [frames, setFrames] = useState<StoryboardFrame[]>(() => generateMockFrames("showcase", 15));
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFrames, setSelectedFrames] = useState<Set<string>>(() => new Set(generateMockFrames("showcase", 15).map((f) => f.id)));

  const handleTypeChange = (t: VideoType) => {
    setVideoType(t);
    const nf = generateMockFrames(t, duration);
    setFrames(nf);
    setSelectedFrames(new Set(nf.map((f) => f.id)));
  };

  const handleDurationChange = (d: number) => {
    setDuration(d);
    const nf = generateMockFrames(videoType, d);
    setFrames(nf);
    setSelectedFrames(new Set(nf.map((f) => f.id)));
  };

  const updateFrame = (id: string, field: keyof StoryboardFrame, value: string) => {
    setFrames((prev) => prev.map((f) => (f.id === id ? { ...f, [field]: value } : f)));
  };

  const removeFrame = (id: string) => {
    setFrames((prev) => prev.filter((f) => f.id !== id));
    setSelectedFrames((prev) => { const n = new Set(prev); n.delete(id); return n; });
  };

  const addFrame = () => {
    const last = frames[frames.length - 1];
    const nf: StoryboardFrame = {
      id: `frame-${Date.now()}`, timeStart: last?.timeEnd || "0:00", timeEnd: fmtTime(duration),
      description: "新分镜：描述画面内容...", shotSize: "中景", cameraMove: "固定",
      audio: "BGM", subtitle: "", credits: 15, status: "idle",
    };
    setFrames([...frames, nf]);
    setSelectedFrames((prev) => new Set([...prev, nf.id]));
  };

  const toggleFrame = (id: string) => {
    setSelectedFrames((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  };

  const totalCredits = frames.filter((f) => selectedFrames.has(f.id)).reduce((s, f) => s + f.credits, 0);

  const handleGenerate = async () => {
    setGenerating(true); setProgress(0);
    const sel = frames.filter((f) => selectedFrames.has(f.id));
    for (let i = 0; i < sel.length; i++) {
      setFrames((p) => p.map((f) => (f.id === sel[i].id ? { ...f, status: "generating" } : f)));
      await new Promise((r) => setTimeout(r, 800));
      setFrames((p) => p.map((f) => (f.id === sel[i].id ? { ...f, status: "done" } : f)));
      setProgress(Math.round(((i + 1) / sel.length) * 100));
    }
    setGenerating(false);
  };

  const Sel = ({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) => (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      style={{ background: "var(--bg4)", border: "1px solid var(--bd)", borderRadius: 6, padding: "3px 6px", fontSize: 11, color: "var(--fg)", fontFamily: "inherit" }}>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );

  return (
    <>
      <div className="topbar">
        <div style={{ flex: 1 }}><span style={{ fontSize: 13, color: "var(--t2)", fontWeight: 600 }}>🎬 TikTok 带货视频</span></div>
        <div className="credits-badge">✦ 365 积分</div>
      </div>

      <div className="product-page-wrap">
        <div className="fi">
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>🎬 TikTok 带货视频</h1>
          <p style={{ fontSize: 13, color: "var(--t3)", marginBottom: 24 }}>AI 分镜规划 → 逐帧生成 → 拼接成片。选择视频类型，自动生成专业分镜脚本。</p>
        </div>

        {/* Video Type */}
        <div className="fi" style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>📽️ 视频类型</div>
          <div className="tiktok-video-types">
            {VIDEO_TYPES.map((vt) => {
              const a = videoType === vt.key;
              return (
                <button key={vt.key} onClick={() => handleTypeChange(vt.key)}
                  style={{ padding: "14px 16px", borderRadius: 12, textAlign: "left", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s", background: a ? "rgba(249,115,22,0.12)" : "var(--bg3)", border: `1px solid ${a ? "rgba(249,115,22,0.5)" : "var(--bd)"}` }}>
                  <div style={{ fontSize: 20, marginBottom: 6 }}>{vt.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: a ? "#f97316" : "var(--fg)", marginBottom: 2 }}>{vt.label}</div>
                  <div style={{ fontSize: 11, color: "var(--t3)", lineHeight: 1.4 }}>{vt.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Config */}
        <div className="fi tiktok-config-row" style={{ marginBottom: 20 }}>
          <div style={{ background: "var(--bg3)", border: "1px solid var(--bd)", borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 8, fontWeight: 600 }}>⏱️ 时长</div>
            {DURATIONS.map((d) => (
              <button key={d.value} onClick={() => handleDurationChange(d.value)}
                style={{ display: "block", width: "100%", padding: "6px 10px", marginBottom: 4, borderRadius: 8, fontSize: 12, cursor: "pointer", fontFamily: "inherit", textAlign: "left", background: duration === d.value ? "rgba(249,115,22,0.15)" : "transparent", border: `1px solid ${duration === d.value ? "rgba(249,115,22,0.4)" : "transparent"}`, color: duration === d.value ? "#f97316" : "var(--t2)" }}>
                <strong>{d.label}</strong> <span style={{ fontSize: 10, color: "var(--t3)" }}>{d.desc}</span>
              </button>
            ))}
          </div>
          <div style={{ background: "var(--bg3)", border: "1px solid var(--bd)", borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 8, fontWeight: 600 }}>📐 画面比例</div>
            {RATIOS.map((r) => (
              <button key={r.value} onClick={() => setRatio(r.value)}
                style={{ display: "block", width: "100%", padding: "6px 10px", marginBottom: 4, borderRadius: 8, fontSize: 12, cursor: "pointer", fontFamily: "inherit", textAlign: "left", background: ratio === r.value ? "rgba(249,115,22,0.15)" : "transparent", border: `1px solid ${ratio === r.value ? "rgba(249,115,22,0.4)" : "transparent"}`, color: ratio === r.value ? "#f97316" : "var(--t2)" }}>
                <strong>{r.label}</strong> <span style={{ fontSize: 10, color: "var(--t3)" }}>{r.desc}</span>
              </button>
            ))}
          </div>
          <div style={{ background: "var(--bg3)", border: "1px solid var(--bd)", borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 8, fontWeight: 600 }}>🌐 语言</div>
            {LANGUAGES.map((l) => (
              <button key={l} onClick={() => setLanguage(l)}
                style={{ display: "block", width: "100%", padding: "5px 10px", marginBottom: 3, borderRadius: 8, fontSize: 12, cursor: "pointer", fontFamily: "inherit", textAlign: "left", background: language === l ? "rgba(249,115,22,0.15)" : "transparent", border: `1px solid ${language === l ? "rgba(249,115,22,0.4)" : "transparent"}`, color: language === l ? "#f97316" : "var(--t2)" }}>
                {l}
              </button>
            ))}
          </div>
          <div style={{ background: "var(--bg3)", border: "1px solid var(--bd)", borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 8, fontWeight: 600 }}>🎨 风格</div>
            {STYLES.map((s) => (
              <button key={s} onClick={() => setStyle(s)}
                style={{ display: "block", width: "100%", padding: "5px 10px", marginBottom: 3, borderRadius: 8, fontSize: 12, cursor: "pointer", fontFamily: "inherit", textAlign: "left", background: style === s ? "rgba(249,115,22,0.15)" : "transparent", border: `1px solid ${style === s ? "rgba(249,115,22,0.4)" : "transparent"}`, color: style === s ? "#f97316" : "var(--t2)" }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="fi" style={{ marginBottom: 20 }}>
          <div style={{ background: "var(--bg3)", border: "1px solid var(--bd)", borderRadius: 12, padding: "10px 16px", display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12 }}>
            <span>📽️ <strong>{VIDEO_TYPES.find((v) => v.key === videoType)?.label}</strong></span>
            <span>⏱️ <strong>{duration}秒</strong></span>
            <span>📐 <strong>{ratio}</strong></span>
            <span>🌐 <strong>{language}</strong></span>
            <span>🎨 <strong>{style}</strong></span>
            <span>🎞️ <strong>{frames.length} 帧</strong></span>
          </div>
        </div>

        {/* Storyboard */}
        <div className="fi" style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>🎞️ 分镜面板</h3>
              <p style={{ fontSize: 12, color: "var(--t3)" }}>每帧可编辑画面描述、镜头参数和字幕</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#f97316" }}>{totalCredits} <span style={{ fontSize: 11, fontWeight: 400 }}>积分</span></div>
              <div style={{ fontSize: 10, color: "var(--t3)" }}>{selectedFrames.size} / {frames.length} 帧</div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {frames.map((frame, idx) => (
              <div key={frame.id}
                style={{
                  background: frame.status === "done" ? "rgba(34,197,94,0.04)" : frame.status === "generating" ? "rgba(249,115,22,0.04)" : "var(--bg3)",
                  border: `1px solid ${frame.status === "done" ? "rgba(34,197,94,0.3)" : frame.status === "generating" ? "rgba(249,115,22,0.3)" : "var(--bd)"}`,
                  borderRadius: 14, padding: 16, transition: "all 0.15s",
                }}>
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0 }}>
                    <div onClick={() => toggleFrame(frame.id)}
                      style={{
                        width: 22, height: 22, borderRadius: "50%", cursor: "pointer",
                        background: frame.status === "done" ? "#22c55e" : selectedFrames.has(frame.id) ? "#f97316" : "transparent",
                        border: `1.5px solid ${frame.status === "done" ? "#22c55e" : selectedFrames.has(frame.id) ? "#f97316" : "var(--bd)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff",
                      }}>
                      {frame.status === "done" ? "✓" : frame.status === "generating" ? "⟳" : selectedFrames.has(frame.id) ? "✓" : ""}
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "var(--t3)" }}>F{idx + 1}</div>
                    <div style={{ fontSize: 10, color: "var(--acc)", fontWeight: 600 }}>{frame.timeStart}-{frame.timeEnd}</div>
                    <div style={{ fontSize: 10, color: "var(--t3)" }}>{frame.credits}积分</div>
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                    <textarea value={frame.description} onChange={(e) => updateFrame(frame.id, "description", e.target.value)} rows={2}
                      style={{ width: "100%", background: "var(--bg4)", border: "1px solid var(--bd)", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "var(--fg)", fontFamily: "inherit", resize: "vertical", outline: "none", lineHeight: 1.5 }} />
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                      <span style={{ fontSize: 10, color: "var(--t3)" }}>📷</span>
                      <Sel value={frame.shotSize} options={SHOT_SIZES} onChange={(v) => updateFrame(frame.id, "shotSize", v)} />
                      <span style={{ fontSize: 10, color: "var(--t3)" }}>🎥</span>
                      <Sel value={frame.cameraMove} options={CAMERA_MOVES} onChange={(v) => updateFrame(frame.id, "cameraMove", v)} />
                      <span style={{ fontSize: 10, color: "var(--t3)" }}>🔊</span>
                      <input value={frame.audio} onChange={(e) => updateFrame(frame.id, "audio", e.target.value)}
                        style={{ flex: 1, background: "var(--bg4)", border: "1px solid var(--bd)", borderRadius: 6, padding: "3px 8px", fontSize: 11, color: "var(--fg)", fontFamily: "inherit", outline: "none", minWidth: 80 }} />
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontSize: 10, color: "var(--t3)", flexShrink: 0 }}>💬</span>
                      <input value={frame.subtitle} onChange={(e) => updateFrame(frame.id, "subtitle", e.target.value)} placeholder="字幕文本（可选）"
                        style={{ flex: 1, background: "var(--bg4)", border: "1px solid var(--bd)", borderRadius: 6, padding: "3px 8px", fontSize: 11, color: "var(--fg)", fontFamily: "inherit", outline: "none" }} />
                      <button onClick={() => removeFrame(frame.id)}
                        style={{ width: 24, height: 24, borderRadius: 6, border: "none", background: "rgba(239,68,68,0.1)", color: "#ef4444", fontSize: 14, cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}>×</button>
                    </div>
                    {frame.status === "done" && (
                      <div style={{ height: 60, borderRadius: 8, background: "linear-gradient(135deg, rgba(34,197,94,0.1), rgba(34,197,94,0.05))", border: "1px dashed rgba(34,197,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#22c55e" }}>
                        ✅ 帧图生成完成 — 点击查看
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <button onClick={addFrame}
              style={{ padding: "12px", borderRadius: 10, border: "1px dashed var(--bd)", background: "transparent", color: "var(--t2)", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
              + 添加分镜帧
            </button>
          </div>
        </div>

        {/* Generate Actions */}
        <div className="fi">
          <div style={{ background: "var(--bg3)", border: "1px solid var(--bd)", borderRadius: 16, padding: 20 }}>
            {generating && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>生成中...</span>
                  <span style={{ fontSize: 12, color: "var(--acc)" }}>{progress}%</span>
                </div>
                <div style={{ width: "100%", height: 6, background: "var(--bd)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, var(--acc), var(--pk))", borderRadius: 3, transition: "width 0.3s" }} />
                </div>
              </div>
            )}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button onClick={handleGenerate} disabled={generating || selectedFrames.size === 0}
                style={{ padding: "12px 28px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: generating ? "wait" : "pointer", fontFamily: "inherit", border: "none", background: generating ? "var(--bd)" : "linear-gradient(135deg, var(--acc), var(--pk))", color: "#fff", opacity: selectedFrames.size === 0 ? 0.4 : 1 }}>
                {generating ? `生成中 ${progress}%...` : `生成选中帧 · ${totalCredits} 积分`}
              </button>
              <button onClick={() => setSelectedFrames(selectedFrames.size === frames.length ? new Set() : new Set(frames.map((f) => f.id)))}
                style={{ padding: "12px 20px", borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", background: "rgba(255,255,255,0.05)", border: "1px solid var(--bd)", color: "var(--t2)" }}>
                {selectedFrames.size === frames.length ? "取消全选" : "全选"}
              </button>
              <button style={{ padding: "12px 20px", borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", background: "rgba(255,255,255,0.05)", border: "1px solid var(--bd)", color: "var(--t2)" }}>
                📋 导出分镜表
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}