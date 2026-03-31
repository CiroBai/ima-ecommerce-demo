"use client";

import { useState, useRef, useCallback } from "react";

type GenStatus = "idle" | "generating" | "done" | "error";

interface CloneResult {
  id: number;
  url: string;
  style: string;
}

const CLONE_STYLES = [
  { key: "viral_fashion", icon: "👗", label: "穿搭带货", desc: "高饱和暖色调，快节奏剪辑感，竖屏构图", prompt: "viral fashion e-commerce photography, high saturation warm tones, product front and center, dynamic composition, instagram style, trending aesthetic" },
  { key: "clean_minimal", icon: "✨", label: "极简种草", desc: "莫兰迪色系，留白构图，高级质感", prompt: "minimalist product photography, muted color palette, clean white space, premium feel, editorial style, soft natural lighting" },
  { key: "lifestyle_scene", icon: "🏡", label: "生活场景", desc: "真实使用场景，自然光线，生活化氛围", prompt: "lifestyle product photography, natural home environment, warm natural lighting, authentic daily life scene, cozy atmosphere" },
  { key: "bold_pop", icon: "🔥", label: "大胆鲜明", desc: "高对比撞色，视觉冲击力强，吸睛度满分", prompt: "bold pop color product photography, high contrast, vibrant neon accents, eye-catching composition, modern trendy aesthetic" },
  { key: "luxury_dark", icon: "👑", label: "暗调奢华", desc: "深色背景，聚光灯效果，高端大气", prompt: "luxury dark moody product photography, black background, dramatic spotlight, premium high-end feel, cinematic lighting, elegant" },
  { key: "flat_lay", icon: "📸", label: "平铺摆拍", desc: "俯拍构图，搭配道具，小红书爆款构图", prompt: "flat lay product photography, overhead shot, styled arrangement with complementary props, aesthetic composition, social media ready" },
];

const PLATFORMS = [
  { key: "tiktok", icon: "📱", label: "TikTok", ratio: "9:16", desc: "竖屏，快节奏" },
  { key: "instagram", icon: "📸", label: "Instagram", ratio: "4:5", desc: "竖图，高质感" },
  { key: "xiaohongshu", icon: "📕", label: "小红书", ratio: "3:4", desc: "种草风" },
  { key: "amazon", icon: "🛒", label: "亚马逊", ratio: "1:1", desc: "白底规范" },
];

const OUTPUT_COUNTS = [1, 2, 3, 4];

export default function ClonePage() {
  /* Upload state */
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* Config state */
  const [selectedStyles, setSelectedStyles] = useState<Set<string>>(new Set(["viral_fashion"]));
  const [platform, setPlatform] = useState("tiktok");
  const [outputCount, setOutputCount] = useState(2);
  const [productDesc, setProductDesc] = useState("");

  /* Generation state */
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<CloneResult[]>([]);
  const [slotStatus, setSlotStatus] = useState<Record<number, GenStatus>>({});
  const abortRef = useRef<AbortController | null>(null);

  const totalTasks = selectedStyles.size * outputCount;
  const totalCredits = totalTasks * 12;
  const doneCount = results.length;

  /* Upload */
  const uploadFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/") || file.size > 20 * 1024 * 1024) return;
    setIsUploading(true);
    try {
      const fd = new FormData(); fd.append("file", file);
      const r = await fetch("/api/upload", { method: "POST", body: fd });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Upload failed");
      setUploadedUrl(d.url);
      setResults([]);
      setSlotStatus({});
    } catch (e) { console.error("Upload:", e); } finally { setIsUploading(false); }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files[0]; if (f) uploadFile(f);
  }, [uploadFile]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (f) uploadFile(f);
  }, [uploadFile]);

  /* Style toggle */
  const toggleStyle = (key: string) => {
    setSelectedStyles(prev => {
      const next = new Set(prev);
      if (next.has(key)) { if (next.size > 1) next.delete(key); }
      else next.add(key);
      return next;
    });
  };

  /* Poll helper */
  async function pollUntilDone(taskId: string, signal: AbortSignal): Promise<string> {
    for (let i = 0; i < 60; i++) {
      if (signal.aborted) throw new Error("aborted");
      await new Promise(r => setTimeout(r, 3000));
      if (signal.aborted) throw new Error("aborted");
      const res = await fetch("/api/poll", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId }), signal,
      });
      if (!res.ok) throw new Error(`Poll HTTP ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (data.done) { if (!data.result?.url) throw new Error("No URL"); return data.result.url; }
    }
    throw new Error("Timed out");
  }

  /* Generate */
  const handleGenerate = async () => {
    if (!uploadedUrl || selectedStyles.size === 0 || generating) return;
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController(); abortRef.current = ctrl;

    setGenerating(true); setProgress(0); setResults([]); setSlotStatus({});

    const platConfig = PLATFORMS.find(p => p.key === platform)!;
    const styles = CLONE_STYLES.filter(s => selectedStyles.has(s.key));
    const tasks: { id: number; style: typeof CLONE_STYLES[0]; idx: number }[] = [];
    let taskId = 0;
    for (const style of styles) {
      for (let i = 0; i < outputCount; i++) {
        tasks.push({ id: taskId++, style, idx: i });
      }
    }

    // Mark all as generating
    const initStatus: Record<number, GenStatus> = {};
    tasks.forEach(t => { initStatus[t.id] = "generating"; });
    setSlotStatus(initStatus);

    let completed = 0;
    const total = tasks.length;

    const generateOne = async (task: typeof tasks[0]) => {
      if (ctrl.signal.aborted) return;
      try {
        const desc = productDesc.trim() || "this product";
        const prompt = `Recreate ${desc} using this viral e-commerce style: ${task.style.prompt}. Target platform: ${platConfig.label}, aspect ratio ${platConfig.ratio}. Professional product photography, sharp focus, high quality.`;

        const useImageToImage = true; // always use the uploaded product image
        const genRes = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            modelId: "gemini-3-pro-image",
            taskType: useImageToImage ? "image_to_image" : "text_to_image",
            inputImages: useImageToImage ? [uploadedUrl] : [],
          }),
          signal: ctrl.signal,
        });
        if (!genRes.ok) { const e = await genRes.json().catch(() => ({})); throw new Error(e.error || `HTTP ${genRes.status}`); }
        const { taskId: tid } = await genRes.json();
        if (!tid) throw new Error("No taskId");

        const url = await pollUntilDone(tid, ctrl.signal);
        setResults(prev => [...prev, { id: task.id, url, style: task.style.label }]);
        setSlotStatus(prev => ({ ...prev, [task.id]: "done" }));
      } catch (err) {
        if (ctrl.signal.aborted) return;
        console.error(`Clone task ${task.id}:`, err);
        setSlotStatus(prev => ({ ...prev, [task.id]: "error" }));
      } finally {
        if (!ctrl.signal.aborted) {
          completed++;
          setProgress(Math.round((completed / total) * 100));
        }
      }
    };

    // Batch concurrency = 3
    for (let i = 0; i < tasks.length; i += 3) {
      if (ctrl.signal.aborted) break;
      const batch = tasks.slice(i, i + 3);
      await Promise.all(batch.map(generateOne));
    }
    setGenerating(false);
  };

  const handleCancel = () => {
    abortRef.current?.abort(); abortRef.current = null;
    setSlotStatus(prev => {
      const n = { ...prev };
      Object.keys(n).forEach(k => { if (n[Number(k)] === "generating") n[Number(k)] = "idle"; });
      return n;
    });
    setGenerating(false);
  };

  return (
    <>
      <div className="topbar">
        <div style={{ flex: 1 }}><span style={{ fontSize: 13, color: "var(--t2)", fontWeight: 600 }}>🔥 爆款复刻</span></div>
        <div className="credits-badge">✦ 365 积分</div>
      </div>

      <div className="product-page-wrap">
        <div className="fi" style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, fontFamily: "var(--font-display, 'Plus Jakarta Sans', system-ui, sans-serif)", letterSpacing: "-0.02em", marginBottom: 6 }}>🔥 爆款复刻</h1>
          <p style={{ fontSize: 13, color: "var(--t3)" }}>上传商品图 → 选择爆款风格 → AI 按热门构图风格生成多套素材</p>
        </div>

        <div className="fi" style={{ display: "flex", gap: 24, marginBottom: 24, flexWrap: "wrap" }}>
          {/* Left: Upload + Description */}
          <div style={{ flex: "1 1 320px", minWidth: 280 }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 8, fontWeight: 600 }}>📷 商品图片</div>
              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  background: isDragging ? "var(--acc-glow)" : "var(--bg3)",
                  border: `2px dashed ${isDragging ? "var(--acc)" : "var(--bd)"}`,
                  borderRadius: 12, minHeight: 200, display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", padding: 16, cursor: "pointer", transition: "all 0.2s",
                }}
              >
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
                {isUploading ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 32, height: 32, border: "2px solid var(--acc)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                    <span style={{ fontSize: 12, color: "var(--t3)" }}>上传中...</span>
                  </div>
                ) : uploadedUrl ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: "100%" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={uploadedUrl} alt="Uploaded" style={{ width: "100%", height: 160, objectFit: "contain", borderRadius: 8 }} />
                    <span style={{ fontSize: 11, color: "var(--t3)" }}>点击重新上传</span>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: 0.6 }}>
                    <div style={{ fontSize: 36 }}>📷</div>
                    <div style={{ fontSize: 13, color: "var(--fg)", fontWeight: 500 }}>{isDragging ? "松开以上传" : "拖放或点击上传"}</div>
                    <div style={{ fontSize: 11, color: "var(--t3)" }}>PNG、JPG 最大 20MB</div>
                  </div>
                )}
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 8, fontWeight: 600 }}>✏️ 商品描述（可选，帮助 AI 理解产品）</div>
              <input type="text" placeholder="例：白色连衣裙，雪纺材质，适合夏季穿搭" value={productDesc} onChange={e => setProductDesc(e.target.value)}
                className="input-glow" style={{ fontSize: 12, padding: "10px 14px", borderRadius: 10 }} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 8, fontWeight: 600 }}>📱 目标平台</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {PLATFORMS.map(p => {
                  const a = platform === p.key;
                  return (
                    <button key={p.key} onClick={() => setPlatform(p.key)} style={{
                      flex: 1, minWidth: 80, padding: "10px 8px", borderRadius: 10, fontSize: 11, fontWeight: 600,
                      cursor: "pointer", fontFamily: "inherit", textAlign: "center", transition: "all 0.15s",
                      background: a ? "rgba(249,115,22,0.15)" : "var(--bg3)",
                      border: `1px solid ${a ? "rgba(249,115,22,0.5)" : "var(--bd)"}`,
                      color: a ? "#f97316" : "var(--t2)",
                    }}>
                      <div style={{ fontSize: 18, marginBottom: 4 }}>{p.icon}</div>
                      {p.label}
                      <div style={{ fontSize: 9, color: "var(--t3)", marginTop: 2 }}>{p.ratio} · {p.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Style selection */}
          <div style={{ flex: "1 1 420px", minWidth: 300 }}>
            <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 8, fontWeight: 600 }}>🎨 爆款风格（可多选）</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {CLONE_STYLES.map(s => {
                const a = selectedStyles.has(s.key);
                return (
                  <button key={s.key} onClick={() => toggleStyle(s.key)} style={{
                    padding: "14px 12px", borderRadius: 12, textAlign: "left", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                    background: a ? "rgba(168,85,247,0.1)" : "var(--bg3)",
                    border: `1px solid ${a ? "rgba(168,85,247,0.5)" : "var(--bd)"}`,
                    boxShadow: a ? "0 0 0 2px rgba(168,85,247,0.3)" : "none",
                  }}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: a ? "#a855f7" : "var(--fg)", marginBottom: 2 }}>{s.label}</div>
                    <div style={{ fontSize: 10, color: "var(--t3)", lineHeight: 1.4 }}>{s.desc}</div>
                    {a && <div style={{ fontSize: 9, color: "#a855f7", marginTop: 4, fontWeight: 600 }}>✓ 已选</div>}
                  </button>
                );
              })}
            </div>

            {/* Output count */}
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 8, fontWeight: 600 }}>📊 每种风格生成数量</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {OUTPUT_COUNTS.map(n => (
                  <button key={n} onClick={() => setOutputCount(n)} style={{
                    width: 40, height: 40, borderRadius: 10, fontSize: 14, fontWeight: 700,
                    cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                    background: outputCount === n ? "rgba(249,115,22,0.2)" : "var(--bg3)",
                    border: `1px solid ${outputCount === n ? "rgba(249,115,22,0.5)" : "var(--bd)"}`,
                    color: outputCount === n ? "#f97316" : "var(--t3)",
                  }}>
                    {n}
                  </button>
                ))}
                <span style={{ fontSize: 11, color: "var(--t3)", marginLeft: 8 }}>
                  = {selectedStyles.size} 风格 × {outputCount} 张 = <strong style={{ color: "#f97316" }}>{totalTasks} 张</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Generate bar */}
        <div className="fi" style={{ background: "var(--bg3)", border: "1px solid var(--bd)", borderRadius: 16, padding: 20, marginBottom: 24 }}>
          {generating && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>爆款复刻中...</span>
                <span style={{ fontSize: 12, color: "var(--acc)" }}>{progress}%</span>
              </div>
              <div style={{ width: "100%", height: 6, background: "var(--bd)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #a855f7, #3b82f6)", borderRadius: 3, transition: "width 0.3s" }} />
              </div>
              <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 6 }}>已完成 {doneCount} / {totalTasks} 张</div>
            </div>
          )}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <button onClick={handleGenerate} disabled={generating || !uploadedUrl}
              className={generating ? "" : "btn-glow"}
              style={{
                padding: "12px 28px", borderRadius: 10, fontSize: 14, fontWeight: 700,
                cursor: generating || !uploadedUrl ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                ...(generating ? { background: "var(--bd)", border: "none", color: "var(--t3)" } : { color: "#000" }),
                opacity: !uploadedUrl ? 0.4 : 1,
              }}
            >
              {generating ? `复刻中 ${progress}%...` : `🔥 开始复刻 · ${totalTasks} 张 · ${totalCredits} 积分`}
            </button>
            {generating && (
              <button onClick={handleCancel} style={{
                padding: "12px 20px", borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer",
                fontFamily: "inherit", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444",
              }}>取消</button>
            )}
            {!uploadedUrl && !generating && (
              <span style={{ fontSize: 11, color: "var(--t3)" }}>⬆️ 请先上传商品图片</span>
            )}
          </div>
        </div>

        {/* Results */}
        {(results.length > 0 || Object.keys(slotStatus).length > 0) && (
          <div className="fi">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>🎉 复刻结果</h3>
              <div style={{ fontSize: 12, color: "var(--t3)" }}>{doneCount} / {totalTasks} 张完成</div>
            </div>

            {/* Group by style */}
            {[...selectedStyles].map(styleKey => {
              const style = CLONE_STYLES.find(s => s.key === styleKey)!;
              const styleResults = results.filter(r => r.style === style.label);
              const styleTaskIds = Object.entries(slotStatus)
                .filter(([, v]) => v !== "idle")
                .map(([k]) => Number(k));

              return (
                <div key={styleKey} style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                    <span>{style.icon}</span> {style.label}
                    <span style={{ fontSize: 10, color: "var(--t3)", fontWeight: 400 }}>— {style.desc}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                    {/* Original for reference */}
                    {uploadedUrl && (
                      <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid var(--bd)" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={uploadedUrl} alt="Original" style={{ width: "100%", height: 180, objectFit: "cover", display: "block" }} />
                        <div style={{ padding: "6px 10px", textAlign: "center", fontSize: 10, color: "var(--t3)", background: "var(--bg4)" }}>原图</div>
                      </div>
                    )}
                    {/* Generated results */}
                    {styleResults.map(r => (
                      <div key={r.id} style={{ borderRadius: 12, overflow: "hidden", border: "2px solid rgba(34,197,94,0.4)" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={r.url} alt={r.style} style={{ width: "100%", height: 180, objectFit: "cover", display: "block" }} />
                        <div style={{ padding: "6px 10px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg4)" }}>
                          <span style={{ fontSize: 10, color: "#22c55e", fontWeight: 600 }}>✅ 完成</span>
                          <a href={r.url} target="_blank" rel="noopener noreferrer" download={`clone-${r.style}-${r.id}.png`}
                            style={{ fontSize: 10, color: "#22c55e", textDecoration: "none", fontWeight: 600 }}>⬇ 下载</a>
                        </div>
                      </div>
                    ))}
                    {/* Generating placeholders */}
                    {Array.from({ length: Math.max(0, outputCount - styleResults.length) }).map((_, i) => {
                      const tIdx = styleTaskIds[styleResults.length + i];
                      const st = tIdx !== undefined ? slotStatus[tIdx] : "idle";
                      return (
                        <div key={`ph-${i}`} style={{
                          borderRadius: 12, overflow: "hidden", height: 210,
                          border: `1px ${st === "generating" ? "solid rgba(249,115,22,0.4)" : "dashed var(--bd)"}`,
                          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                          background: st === "generating" ? "rgba(249,115,22,0.04)" : "var(--bg4)",
                        }}>
                          {st === "generating" ? (
                            <>
                              <div style={{ width: 24, height: 24, border: "2px solid #f97316", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", marginBottom: 8 }} />
                              <span style={{ fontSize: 11, color: "#f97316" }}>生成中...</span>
                            </>
                          ) : st === "error" ? (
                            <span style={{ fontSize: 11, color: "#ef4444" }}>❌ 失败</span>
                          ) : (
                            <span style={{ fontSize: 11, color: "var(--t3)" }}>等待生成</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
