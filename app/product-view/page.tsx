"use client";

import { useState, useRef, useCallback } from "react";
import { CATEGORIES } from "@/lib/types";

type ViewKey = "front" | "left_45" | "right_45" | "left_side" | "right_side" | "back" | "top" | "elevated_45";
type BgKey = "white" | "gray" | "transparent";
type ViewSetKey = "three" | "five" | "eight";
type GenStatus = "idle" | "generating" | "done" | "error";

const VIEW_PROMPTS: Record<ViewKey, string> = {
  front: "front view, product facing camera directly, centered",
  left_45: "three-quarter view from the left side, 45-degree angle",
  right_45: "three-quarter view from the right side, 45-degree angle",
  left_side: "left side profile view, 90-degree angle",
  right_side: "right side profile view, 90-degree angle",
  back: "rear view, back of product facing camera",
  top: "top-down overhead view, looking straight down",
  elevated_45: "elevated three-quarter view, looking down from 45-degree angle",
};

const VIEW_LABELS: Record<ViewKey, string> = {
  front: "正面", left_45: "左45°", right_45: "右45°", left_side: "左侧面",
  right_side: "右侧面", back: "背面", top: "俯视", elevated_45: "俯45°",
};

const VIEW_ICONS: Record<ViewKey, string> = {
  front: "🎯", left_45: "↗️", right_45: "↖️", left_side: "➡️",
  right_side: "⬅️", back: "🔙", top: "⬇️", elevated_45: "📐",
};

const BG_PROMPTS: Record<BgKey, string> = {
  white: "pure white background, clean studio",
  gray: "soft light gray gradient background, studio",
  transparent: "isolated product, no background, clean edges",
};

const BG_OPTIONS: { key: BgKey; label: string; icon: string }[] = [
  { key: "white", label: "纯白", icon: "⬜" },
  { key: "gray", label: "浅灰渐变", icon: "🌫️" },
  { key: "transparent", label: "透明底", icon: "🔲" },
];

const VIEW_SETS: { key: ViewSetKey; label: string; desc: string; views: ViewKey[] }[] = [
  { key: "three", label: "三视图", desc: "正面 + 45° + 侧面", views: ["front", "left_45", "left_side"] },
  { key: "five", label: "五视图", desc: "正面 + 左右45° + 侧面 + 背面", views: ["front", "left_45", "right_45", "left_side", "back"] },
  { key: "eight", label: "全角度", desc: "8张含俯视，全方位展示", views: ["front", "left_45", "right_45", "left_side", "right_side", "back", "top", "elevated_45"] },
];

const CREDITS_PER_IMAGE = 12;

export default function ProductViewPage() {
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewSet, setViewSet] = useState<ViewSetKey>("three");
  const [bgType, setBgType] = useState<BgKey>("white");
  const [category, setCategory] = useState<string>(CATEGORIES[0].id);
  const [productDesc, setProductDesc] = useState("");
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [viewStatus, setViewStatus] = useState<Partial<Record<ViewKey, GenStatus>>>({});
  const [viewResults, setViewResults] = useState<Partial<Record<ViewKey, string>>>({});
  const abortRef = useRef<AbortController | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const currentViews = VIEW_SETS.find((v) => v.key === viewSet)!.views;
  const totalCredits = currentViews.length * CREDITS_PER_IMAGE;
  const doneCount = currentViews.filter((v) => viewStatus[v] === "done").length;

  const uploadFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/") || file.size > 20 * 1024 * 1024) return;
    setIsUploading(true);
    try {
      const fd = new FormData(); fd.append("file", file);
      const r = await fetch("/api/upload", { method: "POST", body: fd });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Upload failed");
      setUploadedUrl(d.url);
    } catch (e) { console.error("Upload:", e); } finally { setIsUploading(false); }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files[0]; if (f) uploadFile(f);
  }, [uploadFile]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (f) uploadFile(f);
  }, [uploadFile]);

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
      if (data.done) { if (!data.result?.url) throw new Error("No URL"); return data.result.url; }
    }
    throw new Error("Timed out");
  }

  async function generateView(view: ViewKey, cdnUrl: string, signal: AbortSignal) {
    setViewStatus((p) => ({ ...p, [view]: "generating" as GenStatus }));
    try {
      const cat = CATEGORIES.find((c) => c.id === category);
      const desc = productDesc.trim() || `${cat?.name || ""} product`;
      const prompt = `${desc}, ${VIEW_PROMPTS[view]}, ${BG_PROMPTS[bgType]}, product photography, studio lighting, sharp focus, consistent lighting direction`;
      const gr = await fetch("/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, modelId: "gemini-3-pro-image", taskType: "image_to_image", inputImages: [cdnUrl] }),
        signal,
      });
      if (!gr.ok) { const e = await gr.json().catch(() => ({})); throw new Error(e.error || `HTTP ${gr.status}`); }
      const { taskId } = await gr.json();
      if (!taskId) throw new Error("No taskId");
      const url = await pollUntilDone(taskId, signal);
      setViewResults((p) => ({ ...p, [view]: url }));
      setViewStatus((p) => ({ ...p, [view]: "done" as GenStatus }));
    } catch (err) {
      if (signal.aborted) return;
      console.error(`View ${view}:`, err);
      setViewStatus((p) => ({ ...p, [view]: "error" as GenStatus }));
    }
  }

  const handleGenerate = async () => {
    if (!uploadedUrl || generating) return;
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController(); abortRef.current = ctrl;
    setGenerating(true); setProgress(0); setViewResults({});
    const views = [...currentViews];
    const init: Partial<Record<ViewKey, GenStatus>> = {};
    views.forEach((v) => { init[v] = "generating"; });
    setViewStatus(init);
    let done = 0; const total = views.length;
    const fi = views.indexOf("front");
    if (fi >= 0) {
      await generateView("front", uploadedUrl, ctrl.signal);
      done++; setProgress(Math.round((done / total) * 100)); views.splice(fi, 1);
    }
    if (!ctrl.signal.aborted) {
      for (let i = 0; i < views.length; i += 3) {
        if (ctrl.signal.aborted) break;
        const batch = views.slice(i, i + 3);
        await Promise.all(batch.map((v) => generateView(v, uploadedUrl, ctrl.signal)));
        done += batch.length; setProgress(Math.round((done / total) * 100));
      }
    }
    setGenerating(false);
  };

  const handleCancel = () => {
    abortRef.current?.abort(); abortRef.current = null;
    setViewStatus((p) => {
      const n = { ...p }; (Object.keys(n) as ViewKey[]).forEach((k) => { if (n[k] === "generating") n[k] = "idle"; }); return n;
    });
    setGenerating(false);
  };

  return (
    <>
      <div className="topbar">
        <div style={{ flex: 1 }}><span style={{ fontSize: 13, color: "var(--t2)", fontWeight: 600 }}>🔄 多角度展示</span></div>
        <div className="credits-badge">✦ {totalCredits} 积分</div>
      </div>

      <div className="product-page-wrap">
        <div className="fi" style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, fontFamily: "var(--font-display, 'Plus Jakarta Sans', system-ui, sans-serif)", letterSpacing: "-0.02em", marginBottom: 6 }}>🔄 多角度展示图</h1>
          <p style={{ fontSize: 13, color: "var(--t3)" }}>上传商品图片，AI 自动生成多角度产品展示图，统一光影与风格</p>
        </div>

        <div className="fi" style={{ display: "flex", gap: 24, marginBottom: 24, flexWrap: "wrap" }}>
          {/* Left column */}
          <div style={{ flex: "1 1 340px", minWidth: 280 }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 8, fontWeight: 600 }}>📷 商品图片</div>
              <div onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}
                style={{ background: isDragging ? "var(--acc-glow)" : "var(--bg3)", border: `2px dashed ${isDragging ? "var(--acc)" : "var(--bd)"}`, borderRadius: 12, minHeight: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 16, cursor: "pointer", transition: "all 0.2s" }}>
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
              <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 8, fontWeight: 600 }}>📂 商品品类</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {CATEGORIES.map((cat) => { const a = category === cat.id; return (
                  <button key={cat.id} onClick={() => setCategory(cat.id)} style={{ padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s", background: a ? "rgba(249,115,22,0.15)" : "var(--bg3)", border: `1px solid ${a ? "rgba(249,115,22,0.5)" : "var(--bd)"}`, color: a ? "#f97316" : "var(--t2)" }}>{cat.emoji} {cat.name}</button>
                ); })}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 8, fontWeight: 600 }}>✏️ 商品描述（可选）</div>
              <input type="text" placeholder="例：白色陶瓷咖啡杯，极简风格，哑光质感" value={productDesc} onChange={(e) => setProductDesc(e.target.value)} className="input-glow" style={{ fontSize: 12, padding: "10px 14px", borderRadius: 10 }} />
            </div>
          </div>

          {/* Right column */}
          <div style={{ flex: "1 1 340px", minWidth: 280 }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 8, fontWeight: 600 }}>🔄 视图集</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {VIEW_SETS.map((vs) => { const a = viewSet === vs.key; return (
                  <div key={vs.key} onClick={() => { if (!generating) setViewSet(vs.key); }} style={{ background: a ? "rgba(249,115,22,0.08)" : "var(--bg3)", border: `1px solid ${a ? "rgba(249,115,22,0.5)" : "var(--bd)"}`, borderRadius: 12, padding: "14px 16px", cursor: generating ? "not-allowed" : "pointer", transition: "all 0.2s", boxShadow: a ? "0 0 0 2px var(--acc), 0 0 20px var(--acc-glow)" : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: a ? "#f97316" : "var(--fg)", marginBottom: 2 }}>{vs.label}</div>
                        <div style={{ fontSize: 11, color: "var(--t3)" }}>{vs.desc}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: "#f97316" }}>{vs.views.length * CREDITS_PER_IMAGE}</div>
                        <div style={{ fontSize: 9, color: "var(--t3)" }}>积分</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 8 }}>
                      {vs.views.map((v) => (<span key={v} style={{ fontSize: 9, padding: "2px 7px", borderRadius: 4, background: a ? "rgba(249,115,22,0.12)" : "rgba(255,255,255,0.05)", border: `1px solid ${a ? "rgba(249,115,22,0.25)" : "rgba(255,255,255,0.08)"}`, color: a ? "#f97316" : "var(--t3)" }}>{VIEW_ICONS[v]} {VIEW_LABELS[v]}</span>))}
                    </div>
                  </div>
                ); })}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 8, fontWeight: 600 }}>🎨 背景类型</div>
              <div style={{ display: "flex", gap: 8 }}>
                {BG_OPTIONS.map((bg) => { const a = bgType === bg.key; return (
                  <button key={bg.key} onClick={() => { if (!generating) setBgType(bg.key); }} disabled={generating} style={{ flex: 1, padding: "10px 12px", borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: generating ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "all 0.15s", textAlign: "center", background: a ? "rgba(249,115,22,0.15)" : "var(--bg3)", border: `1px solid ${a ? "rgba(249,115,22,0.5)" : "var(--bd)"}`, color: a ? "#f97316" : "var(--t2)" }}>
                    <div style={{ fontSize: 18, marginBottom: 4 }}>{bg.icon}</div>{bg.label}
                  </button>
                ); })}
              </div>
            </div>
          </div>
        </div>

        {/* Generate bar */}
        <div className="fi" style={{ background: "var(--bg3)", border: "1px solid var(--bd)", borderRadius: 16, padding: 20, marginBottom: 24 }}>
          {!generating && doneCount === 0 && uploadedUrl && (
            <div style={{ fontSize: 11, color: "#f59e0b", marginBottom: 12, padding: "8px 12px", background: "rgba(245,158,11,0.08)", borderRadius: 8, border: "1px solid rgba(245,158,11,0.2)" }}>
              💡 <strong>生成流程：</strong>先生成正面基准图 → 确认效果 → 再批量生成其余角度，确保光影一致。
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
              <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 6 }}>已完成 {doneCount} / {currentViews.length} 角度</div>
            </div>
          )}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={handleGenerate} disabled={generating || !uploadedUrl} className={generating ? "" : "btn-glow"} style={{ padding: "12px 28px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: generating || !uploadedUrl ? "not-allowed" : "pointer", fontFamily: "inherit", ...(generating ? { background: "var(--bd)", border: "none", color: "var(--t3)" } : { color: "#000" }), opacity: !uploadedUrl ? 0.4 : 1 }}>
              {generating ? `生成中 ${progress}%...` : `生成 ${currentViews.length} 张展示图 · ${totalCredits} 积分`}
            </button>
            {generating && (<button onClick={handleCancel} style={{ padding: "12px 20px", borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444" }}>取消生成</button>)}
            {!uploadedUrl && !generating && (<span style={{ fontSize: 11, color: "var(--t3)", alignSelf: "center" }}>⬆️ 请先上传商品图片</span>)}
          </div>
        </div>

        {/* Results */}
        {Object.keys(viewStatus).length > 0 && (
          <div className="fi">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>📸 生成结果</h3>
              <div style={{ fontSize: 12, color: "var(--t3)" }}>{doneCount} / {currentViews.length} 张完成</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
              {currentViews.map((view) => <ViewCard key={view} view={view} status={viewStatus[view] || "idle"} url={viewResults[view]} onLightbox={setLightboxUrl} />)}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxUrl && (
        <div onClick={() => setLightboxUrl(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, cursor: "zoom-out", padding: 24 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightboxUrl} alt="Preview" style={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: 12, boxShadow: "0 0 60px rgba(0,0,0,0.6)" }} />
          <a href={lightboxUrl} target="_blank" rel="noopener noreferrer" download onClick={(e) => e.stopPropagation()} style={{ position: "absolute", bottom: 32, padding: "10px 24px", borderRadius: 10, background: "var(--gradient-accent)", color: "#000", fontWeight: 700, fontSize: 13, textDecoration: "none", fontFamily: "var(--font-display, system-ui)" }}>⬇ 下载原图</a>
        </div>
      )}

      <style jsx>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}

/* ---- View Card Sub-component ---- */
function ViewCard({ view, status, url, onLightbox }: { view: ViewKey; status: GenStatus; url?: string; onLightbox: (u: string) => void }) {
  const borderColor = status === "done" ? "rgba(34,197,94,0.5)" : status === "error" ? "rgba(239,68,68,0.5)" : status === "generating" ? "rgba(249,115,22,0.5)" : "var(--bd)";
  const bgColor = status === "done" ? "rgba(34,197,94,0.05)" : status === "error" ? "rgba(239,68,68,0.05)" : status === "generating" ? "rgba(249,115,22,0.05)" : "var(--bg3)";
  const dotBg = status === "done" ? "#22c55e" : status === "error" ? "#ef4444" : status === "generating" ? "#f97316" : "transparent";
  const dotBorder = status === "done" ? "#22c55e" : status === "error" ? "#ef4444" : status === "generating" ? "#f97316" : "var(--bd)";
  const dotText = status === "done" ? "✓" : status === "error" ? "✕" : status === "generating" ? "⟳" : "";

  return (
    <div style={{ background: bgColor, border: `1px solid ${borderColor}`, borderRadius: 14, overflow: "hidden", transition: "all 0.3s" }}>
      <div style={{ padding: "12px 14px 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 16 }}>{VIEW_ICONS[view]}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: status === "done" ? "#22c55e" : "var(--fg)" }}>{VIEW_LABELS[view]}</span>
        </div>
        <div style={{ width: 20, height: 20, borderRadius: "50%", background: dotBg, border: `1.5px solid ${dotBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff" }}>{dotText}</div>
      </div>
      <div style={{ padding: "0 14px 14px" }}>
        {status === "done" && url ? (
          <>
            <div onClick={() => onLightbox(url)} style={{ cursor: "pointer", borderRadius: 8, overflow: "hidden", border: "1px solid rgba(34,197,94,0.2)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={VIEW_LABELS[view]} style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }} />
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              <a href={url} target="_blank" rel="noopener noreferrer" download={`${VIEW_LABELS[view]}.png`} style={{ flex: 1, padding: "6px 0", borderRadius: 6, textAlign: "center", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", color: "#22c55e", fontSize: 10, fontWeight: 600, textDecoration: "none", display: "block" }}>⬇ 下载</a>
              <button onClick={() => onLightbox(url)} style={{ flex: 1, padding: "6px 0", borderRadius: 6, background: "rgba(255,255,255,0.05)", border: "1px solid var(--bd)", color: "var(--t2)", fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>🔍 大图</button>
            </div>
          </>
        ) : status === "generating" ? (
          <div style={{ height: 160, borderRadius: 8, background: "rgba(249,115,22,0.04)", border: "1px dashed rgba(249,115,22,0.2)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <div style={{ width: 24, height: 24, border: "2px solid #f97316", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <span style={{ fontSize: 11, color: "#f97316" }}>生成中...</span>
          </div>
        ) : status === "error" ? (
          <div style={{ height: 160, borderRadius: 8, background: "rgba(239,68,68,0.04)", border: "1px dashed rgba(239,68,68,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 11, color: "#ef4444" }}>❌ 生成失败</span>
          </div>
        ) : (
          <div style={{ height: 160, borderRadius: 8, background: "rgba(255,255,255,0.02)", border: "1px dashed var(--bd)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 11, color: "var(--t3)" }}>等待生成</span>
          </div>
        )}
      </div>
    </div>
  );
}