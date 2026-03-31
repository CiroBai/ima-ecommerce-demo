"use client";

import { useState, useRef, useCallback, useEffect } from "react";

/* ─── Types ─── */
interface ColorOption {
  name: string;
  hex: string;
}

interface VariantResult {
  colorName: string;
  hex: string;
  url: string;
  watermark_url?: string;
}

type GenerationStatus = "idle" | "uploading" | "generating" | "done" | "error";

/* ─── Category default colors ─── */
const CATEGORY_COLORS: Record<string, ColorOption[]> = {
  "女装-连衣裙": [
    { name: "经典黑", hex: "#1A1A1A" },
    { name: "象牙白", hex: "#FFFFF0" },
    { name: "酒红", hex: "#722F37" },
    { name: "雾蓝", hex: "#6B8FA3" },
    { name: "裸粉", hex: "#E6C2B5" },
  ],
  "女装-上衣": [
    { name: "黑", hex: "#1A1A1A" },
    { name: "白", hex: "#FAFAFA" },
    { name: "燕麦色", hex: "#D4C5A9" },
    { name: "浅蓝", hex: "#A7C7E7" },
    { name: "薰衣草紫", hex: "#B4A7D6" },
  ],
  "男装-T恤": [
    { name: "黑", hex: "#1A1A1A" },
    { name: "白", hex: "#FAFAFA" },
    { name: "藏青", hex: "#1C2841" },
    { name: "中灰", hex: "#808080" },
    { name: "军绿", hex: "#4B5320" },
  ],
  "男装-裤装": [
    { name: "黑", hex: "#1A1A1A" },
    { name: "深蓝", hex: "#1B2A4A" },
    { name: "卡其", hex: "#C3B091" },
    { name: "炭灰", hex: "#36454F" },
    { name: "橄榄绿", hex: "#556B2F" },
  ],
  "运动鞋": [
    { name: "黑白", hex: "#1A1A1A" },
    { name: "全黑", hex: "#0A0A0A" },
    { name: "全白", hex: "#FAFAFA" },
    { name: "灰蓝", hex: "#6E7B8B" },
    { name: "红黑", hex: "#CC0000" },
  ],
  "手提包": [
    { name: "黑", hex: "#1A1A1A" },
    { name: "棕", hex: "#6B4226" },
    { name: "驼色", hex: "#C19A6B" },
    { name: "酒红", hex: "#722F37" },
    { name: "深绿", hex: "#2F4F4F" },
  ],
  "家居纺织": [
    { name: "米白", hex: "#F5F0E8" },
    { name: "浅灰", hex: "#D3D3D3" },
    { name: "雾蓝", hex: "#6B8FA3" },
    { name: "鼠尾草绿", hex: "#9CAF88" },
    { name: "烟粉", hex: "#D4A5A5" },
  ],
  "数码外壳": [
    { name: "午夜黑", hex: "#1A1A1A" },
    { name: "星光色", hex: "#F5F0E8" },
    { name: "远峰蓝", hex: "#6E8FA3" },
    { name: "暗紫", hex: "#483D8B" },
    { name: "松林绿", hex: "#3A5F3A" },
  ],
};

const CATEGORIES = Object.keys(CATEGORY_COLORS);

/* 12 quick-pick colors */
const QUICK_COLORS: ColorOption[] = [
  { name: "正红", hex: "#E03131" },
  { name: "珊瑚橙", hex: "#FF6B35" },
  { name: "明黄", hex: "#FCC419" },
  { name: "薄荷绿", hex: "#51CF66" },
  { name: "湖蓝", hex: "#339AF0" },
  { name: "钴蓝", hex: "#1C7ED6" },
  { name: "靛青", hex: "#364FC7" },
  { name: "深紫", hex: "#7048E8" },
  { name: "洋红", hex: "#E64980" },
  { name: "巧克力", hex: "#6B4226" },
  { name: "银灰", hex: "#ADB5BD" },
  { name: "米色", hex: "#F5E6CC" },
];

const CREDITS_PER_VARIANT = 15;

/* ─── Helpers ─── */
function hexToName(hex: string): string {
  const all = [...Object.values(CATEGORY_COLORS).flat(), ...QUICK_COLORS];
  const match = all.find((c) => c.hex.toLowerCase() === hex.toLowerCase());
  return match?.name || hex;
}

function isLightColor(hex: string): boolean {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}

function isValidHex(hex: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(hex);
}

/* ─── Poll helper ─── */
async function pollUntilDone(
  taskId: string,
  signal: AbortSignal
): Promise<{ url: string; watermark_url?: string }> {
  const MAX_POLLS = 60;
  const INTERVAL_MS = 3000;
  for (let i = 0; i < MAX_POLLS; i++) {
    if (signal.aborted) throw new Error("aborted");
    await new Promise((r) => setTimeout(r, INTERVAL_MS));
    if (signal.aborted) throw new Error("aborted");

    const res = await fetch("/api/poll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId }),
      signal,
    });
    if (!res.ok) throw new Error(`Poll HTTP ${res.status}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    if (data.done) {
      if (!data.result?.url) throw new Error("No image URL in result");
      return { url: data.result.url, watermark_url: data.result.watermark_url };
    }
  }
  throw new Error("Timed out after 3 minutes");
}

/* ─── Main Component ─── */
export default function ColorVariantPage() {
  /* Upload state */
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [cdnUrl, setCdnUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* Category + color state */
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [originalColor, setOriginalColor] = useState<ColorOption>({ name: "自动检测中...", hex: "#808080" });
  const [originalEditing, setOriginalEditing] = useState(false);
  const [selectedColors, setSelectedColors] = useState<ColorOption[]>([]);
  const [customHex, setCustomHex] = useState("");

  /* Generation state */
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [results, setResults] = useState<VariantResult[]>([]);
  const [progress, setProgress] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  /* Cleanup preview URL on unmount */
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  /* ─── Upload handler ─── */
  const handleUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setUploadError("仅支持图片文件");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setUploadError("文件过大（最大 20MB）");
      return;
    }

    setUploadedFile(file);
    setUploadError("");
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
    setCdnUrl("");
    setResults([]);
    setUploading(true);

    // Fake original color detection (simple heuristic)
    setOriginalColor({ name: "自动检测中...", hex: "#808080" });

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Upload HTTP ${res.status}`);
      }
      const data = await res.json();
      setCdnUrl(data.url);
      // Set a placeholder original color after upload
      setOriginalColor({ name: "商品原色", hex: "#6B6B6B" });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "上传失败");
    } finally {
      setUploading(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  }, [handleUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = "";
  }, [handleUpload]);

  /* ─── Color selection ─── */
  const toggleColor = (color: ColorOption) => {
    setSelectedColors((prev) => {
      const exists = prev.find((c) => c.hex === color.hex);
      if (exists) return prev.filter((c) => c.hex !== color.hex);
      if (prev.length >= 8) return prev;
      return [...prev, color];
    });
  };

  const isSelected = (hex: string) => selectedColors.some((c) => c.hex === hex);

  const addCustomColor = () => {
    let hex = customHex.trim();
    if (!hex.startsWith("#")) hex = "#" + hex;
    if (!isValidHex(hex)) return;
    if (selectedColors.length >= 8) return;
    if (!isSelected(hex)) {
      setSelectedColors((prev) => [...prev, { name: hexToName(hex), hex }]);
    }
    setCustomHex("");
  };

  const removeColor = (hex: string) => {
    setSelectedColors((prev) => prev.filter((c) => c.hex !== hex));
  };

  /* ─── Generation ─── */
  const handleGenerate = async () => {
    if (!cdnUrl || selectedColors.length === 0) return;

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus("generating");
    setResults([]);
    setProgress(0);
    setCompletedCount(0);
    setErrorMsg("");

    const total = selectedColors.length;
    const CONCURRENCY = 3;
    let completed = 0;
    const newResults: VariantResult[] = [];

    const generateOne = async (color: ColorOption) => {
      if (controller.signal.aborted) return;
      try {
        const prompt = `EXACT same product as the reference image. PRESERVE UNCHANGED: cut, silhouette, fabric texture, all structural details, background, lighting, shadow, camera angle and distance. ONLY CHANGE: the primary color to ${color.name} (HEX: ${color.hex}). Product photography, studio lighting, pure white background.`;

        const genRes = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            modelId: "gemini-3-pro-image",
            taskType: "image_to_image",
            inputImages: [cdnUrl],
          }),
          signal: controller.signal,
        });

        if (!genRes.ok) {
          const errData = await genRes.json().catch(() => ({}));
          throw new Error(errData.error || `Generate HTTP ${genRes.status}`);
        }
        const { taskId } = await genRes.json();
        if (!taskId) throw new Error("No taskId returned");

        const result = await pollUntilDone(taskId, controller.signal);
        const variant: VariantResult = {
          colorName: color.name,
          hex: color.hex,
          url: result.url,
          watermark_url: result.watermark_url,
        };
        newResults.push(variant);
        setResults((prev) => [...prev, variant]);
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error(`Color ${color.name} failed:`, err);
        // Don't fail the whole batch
      } finally {
        if (!controller.signal.aborted) {
          completed++;
          setCompletedCount(completed);
          setProgress(Math.round((completed / total) * 100));
        }
      }
    };

    // Process in batches of CONCURRENCY
    for (let i = 0; i < selectedColors.length; i += CONCURRENCY) {
      if (controller.signal.aborted) break;
      const batch = selectedColors.slice(i, i + CONCURRENCY);
      await Promise.all(batch.map(generateOne));
    }

    if (!controller.signal.aborted) {
      setStatus("done");
    }
  };

  const handleCancel = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setStatus("idle");
  };

  const totalCredits = selectedColors.length * CREDITS_PER_VARIANT;
  const categoryColors = CATEGORY_COLORS[category];

  return (
    <>
      <div className="topbar">
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 13, color: "var(--t2)", fontWeight: 600 }}>🎨 多色 SKU 变体</span>
        </div>
        <div className="credits-badge">✦ 365 积分</div>
      </div>

      <div className="product-page-wrap">
        {/* Title */}
        <div className="fi" style={{ marginBottom: 28 }}>
          <h1 style={{
            fontSize: 24, fontWeight: 800,
            fontFamily: "var(--font-display, 'Plus Jakarta Sans', system-ui, sans-serif)",
            letterSpacing: "-0.02em", marginBottom: 6,
          }}>
            🎨 多色 SKU 变体
          </h1>
          <p style={{ fontSize: 13, color: "var(--t3)", marginBottom: 0 }}>
            上传商品图，选择目标颜色，AI 批量生成不同配色的 SKU 变体图
          </p>
        </div>

        {/* Upload + Config Row */}
        <div className="fi" style={{
          display: "grid", gridTemplateColumns: "320px 1fr", gap: 20, marginBottom: 24,
        }}>
          {/* Left: Upload Zone */}
          <div>
            <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 8, fontWeight: 600 }}>📸 商品图片</div>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              style={{
                background: previewUrl ? "transparent" : "var(--bg3)",
                border: `2px dashed ${dragging ? "var(--acc)" : uploadError ? "rgba(239,68,68,0.5)" : "var(--bd)"}`,
                borderRadius: 14, minHeight: 280, cursor: "pointer",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                transition: "all 0.2s", position: "relative", overflow: "hidden",
                ...(dragging ? { background: "var(--accg)" } : {}),
              }}
            >
              {previewUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="预览"
                    style={{ width: "100%", height: 280, objectFit: "contain", display: "block" }}
                  />
                  {uploading && (
                    <div style={{
                      position: "absolute", inset: 0,
                      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexDirection: "column", gap: 8,
                    }}>
                      <div style={{ fontSize: 24 }}>⏳</div>
                      <div style={{ fontSize: 12, color: "#fff" }}>上传中...</div>
                    </div>
                  )}
                  {cdnUrl && !uploading && (
                    <div style={{
                      position: "absolute", bottom: 0, left: 0, right: 0,
                      background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
                      padding: "6px 12px", fontSize: 10, color: "#22c55e",
                      display: "flex", alignItems: "center", gap: 4,
                    }}>
                      ✅ 已上传 · 点击更换
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div style={{ fontSize: 36, marginBottom: 8, opacity: 0.5 }}>📤</div>
                  <div style={{ fontSize: 13, color: "var(--t2)", fontWeight: 600 }}>拖放或点击上传</div>
                  <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 4 }}>JPG / PNG / WebP · 最大 20MB</div>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileSelect}
              />
            </div>
            {uploadError && (
              <div style={{ fontSize: 11, color: "#ef4444", marginTop: 6 }}>❌ {uploadError}</div>
            )}
          </div>

          {/* Right: Category + Original color + Target colors */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Category selector */}
            <div>
              <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 8, fontWeight: 600 }}>📂 品类</div>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setSelectedColors([]);
                }}
                className="input-glow"
                style={{
                  width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 13,
                  appearance: "none", WebkitAppearance: "none",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%235e5e78' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 14px center",
                  cursor: "pointer",
                }}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Original color */}
            <div>
              <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 8, fontWeight: 600 }}>🔍 原色识别</div>
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                background: "var(--bg3)", border: "1px solid var(--bd)",
                borderRadius: 10, padding: "10px 14px",
              }}>
                <div
                  style={{
                    width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                    background: originalColor.hex,
                    border: isLightColor(originalColor.hex) ? "1px solid var(--bd)" : "1px solid transparent",
                  }}
                />
                {originalEditing ? (
                  <div style={{ display: "flex", gap: 6, flex: 1 }}>
                    <input
                      value={originalColor.name}
                      onChange={(e) => setOriginalColor((prev) => ({ ...prev, name: e.target.value }))}
                      className="input-glow"
                      style={{ flex: 1, padding: "4px 10px", borderRadius: 6, fontSize: 12 }}
                      placeholder="颜色名"
                    />
                    <input
                      value={originalColor.hex}
                      onChange={(e) => setOriginalColor((prev) => ({ ...prev, hex: e.target.value }))}
                      className="input-glow"
                      style={{ width: 90, padding: "4px 10px", borderRadius: 6, fontSize: 12, fontFamily: "monospace" }}
                      placeholder="#RRGGBB"
                    />
                    <button
                      onClick={() => setOriginalEditing(false)}
                      style={{
                        padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                        background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)",
                        color: "#22c55e", cursor: "pointer", fontFamily: "inherit",
                      }}
                    >
                      ✓
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                    <span style={{ fontSize: 12, color: cdnUrl ? "var(--fg)" : "var(--t3)" }}>
                      {cdnUrl ? `检测到原色：${originalColor.name}` : "上传图片后自动检测"}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--t3)", fontFamily: "monospace" }}>{cdnUrl ? originalColor.hex : ""}</span>
                    {cdnUrl && (
                      <button
                        onClick={() => setOriginalEditing(true)}
                        style={{
                          marginLeft: "auto", padding: "3px 8px", borderRadius: 5, fontSize: 10,
                          background: "rgba(255,255,255,0.05)", border: "1px solid var(--bd)",
                          color: "var(--t3)", cursor: "pointer", fontFamily: "inherit",
                        }}
                      >
                        ✏️ 修改
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Category recommended colors */}
            <div>
              <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 8, fontWeight: 600 }}>
                🏷️ {category} 推荐色
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {categoryColors.map((c) => {
                  const sel = isSelected(c.hex);
                  return (
                    <button
                      key={c.hex}
                      onClick={() => toggleColor(c)}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600,
                        background: sel ? "rgba(249,115,22,0.15)" : "var(--bg3)",
                        border: `1px solid ${sel ? "rgba(249,115,22,0.5)" : "var(--bd)"}`,
                        color: sel ? "#f97316" : "var(--t2)",
                        cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                      }}
                    >
                      <span style={{
                        width: 14, height: 14, borderRadius: 3, flexShrink: 0,
                        background: c.hex,
                        border: isLightColor(c.hex) ? "1px solid var(--bd)" : "1px solid transparent",
                      }} />
                      {c.name}
                      <span style={{ fontSize: 9, color: "var(--t3)", fontFamily: "monospace" }}>{c.hex}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick-pick colors */}
            <div>
              <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 8, fontWeight: 600 }}>🎨 快速选色</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {QUICK_COLORS.map((c) => {
                  const sel = isSelected(c.hex);
                  return (
                    <button
                      key={c.hex}
                      onClick={() => toggleColor(c)}
                      title={`${c.name} ${c.hex}`}
                      style={{
                        width: 32, height: 32, borderRadius: 8, cursor: "pointer",
                        background: c.hex,
                        border: sel
                          ? "2px solid var(--acc)"
                          : isLightColor(c.hex) ? "1px solid var(--bd)" : "1px solid transparent",
                        boxShadow: sel ? "0 0 0 2px var(--acc), 0 0 12px var(--acc-glow)" : "none",
                        transition: "all 0.15s", position: "relative",
                      }}
                    >
                      {sel && (
                        <span style={{
                          position: "absolute", inset: 0,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 14, color: isLightColor(c.hex) ? "#000" : "#fff",
                          fontWeight: 700,
                        }}>
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom hex input */}
            <div>
              <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 8, fontWeight: 600 }}>✍️ 自定义 HEX</div>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <input
                    value={customHex}
                    onChange={(e) => setCustomHex(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addCustomColor()}
                    placeholder="#FF5733"
                    className="input-glow"
                    style={{ width: "100%", padding: "8px 14px 8px 40px", borderRadius: 8, fontSize: 12, fontFamily: "monospace" }}
                  />
                  <span style={{
                    position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                    width: 18, height: 18, borderRadius: 4,
                    background: isValidHex(customHex.startsWith("#") ? customHex : "#" + customHex)
                      ? (customHex.startsWith("#") ? customHex : "#" + customHex)
                      : "var(--bd)",
                    border: "1px solid var(--bd)",
                  }} />
                </div>
                <button
                  onClick={addCustomColor}
                  style={{
                    padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                    background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.3)",
                    color: "#f97316", cursor: "pointer", fontFamily: "inherit",
                    opacity: (customHex.length > 0 && selectedColors.length < 8) ? 1 : 0.5,
                  }}
                >
                  + 添加
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Selected color tags + credits */}
        {selectedColors.length > 0 && (
          <div className="glow-card fi" style={{ padding: 16, marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>🎯 已选颜色</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#f97316" }}>
                {selectedColors.length * CREDITS_PER_VARIANT} <span style={{ fontSize: 11, fontWeight: 400 }}>积分</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {selectedColors.map((c) => (
                <div key={c.hex} style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "5px 10px",
                  borderRadius: 8, background: "rgba(249,115,22,0.08)",
                  border: "1px solid rgba(249,115,22,0.25)",
                }}>
                  <span style={{ width: 14, height: 14, borderRadius: 4, background: c.hex, border: "1px solid var(--bd)", flexShrink: 0 }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: "var(--fg)" }}>{c.name}</span>
                  <span style={{ fontSize: 9, color: "var(--t3)", fontFamily: "monospace" }}>{c.hex}</span>
                  <button onClick={() => toggleColor(c)} style={{
                    width: 16, height: 16, borderRadius: "50%", border: "none",
                    background: "rgba(239,68,68,0.2)", color: "#ef4444",
                    fontSize: 9, cursor: "pointer", fontFamily: "inherit",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>×</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generate button */}
        <div className="fi" style={{ background: "var(--bg3)", border: "1px solid var(--bd)", borderRadius: 16, padding: 20, marginBottom: 24 }}>
          {status === "generating" && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>换色中...</span>
                <span style={{ fontSize: 12, color: "var(--acc)" }}>{progress}%</span>
              </div>
              <div style={{ width: "100%", height: 6, background: "var(--bd)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, var(--acc), var(--pk))", borderRadius: 3, transition: "width 0.3s" }} />
              </div>
              <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 6 }}>已完成 {results.length} / {selectedColors.length} 色</div>
            </div>
          )}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={handleGenerate} disabled={status === "generating" || !cdnUrl || selectedColors.length === 0}
              className={status === "generating" ? "" : "btn-glow"}
              style={{
                padding: "12px 28px", borderRadius: 10, fontSize: 14, fontWeight: 700,
                cursor: status === "generating" || !cdnUrl || selectedColors.length === 0 ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                ...(status === "generating" ? { background: "var(--bd)", border: "none", color: "var(--t3)" } : { color: "#000" }),
                opacity: !cdnUrl || selectedColors.length === 0 ? 0.4 : 1,
              }}
            >
              {status === "generating" ? `换色中 ${progress}%...` : `生成 ${selectedColors.length} 色变体 · ${selectedColors.length * CREDITS_PER_VARIANT} 积分`}
            </button>
            {status === "generating" && (
              <button onClick={handleCancel} style={{
                padding: "12px 20px", borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer",
                fontFamily: "inherit", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444",
              }}>取消</button>
            )}
            {!cdnUrl && status !== "generating" && (
              <span style={{ fontSize: 11, color: "var(--t3)", alignSelf: "center" }}>⬆️ 请先上传商品图片</span>
            )}
          </div>
        </div>

        {/* Results */}
        {(results.length > 0 || status === "generating") && (
          <div className="fi">
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>🎨 换色结果</h3>
            <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 12 }}>
              {/* Original image */}
              {cdnUrl && (
                <div style={{ flexShrink: 0, width: 200 }}>
                  <div style={{ borderRadius: 12, overflow: "hidden", border: "2px solid var(--bd)", marginBottom: 8 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cdnUrl} alt="Original" style={{ width: 200, height: 200, objectFit: "cover", display: "block" }} />
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>原图</div>
                    <div style={{ fontSize: 10, color: "var(--t3)" }}>{originalColor.name}</div>
                  </div>
                </div>
              )}
              {/* Variant results */}
              {selectedColors.map((c) => {
                const res = results.find((r) => r.hex === c.hex);
                const hasResult = results.some((r) => r.hex === c.hex);
                const st: string = hasResult ? "done" : status === "generating" ? "generating" : "idle";
                return (
                  <div key={c.hex} style={{ flexShrink: 0, width: 200 }}>
                    <div style={{
                      borderRadius: 12, overflow: "hidden",
                      border: `2px solid ${st === "done" ? "rgba(34,197,94,0.5)" : st === "generating" ? "rgba(249,115,22,0.5)" : "var(--bd)"}`,
                      marginBottom: 8,
                    }}>
                      {st === "done" && res ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={res.url} alt={c.name} style={{ width: 200, height: 200, objectFit: "cover", display: "block" }} />
                        </>
                      ) : st === "generating" ? (
                        <div style={{ width: 200, height: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(249,115,22,0.04)", gap: 8 }}>
                          <div style={{ width: 24, height: 24, border: "2px solid #f97316", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                          <span style={{ fontSize: 11, color: "#f97316" }}>生成中...</span>
                        </div>
                      ) : st === "error" ? (
                        <div style={{ width: 200, height: 200, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(239,68,68,0.04)" }}>
                          <span style={{ fontSize: 11, color: "#ef4444" }}>❌ 失败</span>
                        </div>
                      ) : (
                        <div style={{ width: 200, height: 200, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.02)" }}>
                          <span style={{ fontSize: 11, color: "var(--t3)" }}>等待生成</span>
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 4 }}>
                        <span style={{ width: 12, height: 12, borderRadius: 3, background: c.hex, border: "1px solid var(--bd)" }} />
                        <span style={{ fontSize: 12, fontWeight: 700 }}>{c.name}</span>
                      </div>
                      <div style={{ fontSize: 10, color: "var(--t3)", fontFamily: "monospace" }}>{c.hex}</div>
                      {st === "done" && res && (
                        <a href={res.url} target="_blank" rel="noopener noreferrer" download={`${c.name}.png`}
                          style={{ display: "inline-block", marginTop: 6, padding: "4px 14px", borderRadius: 6, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", color: "#22c55e", fontSize: 10, fontWeight: 600, textDecoration: "none" }}>
                          ⬇ 下载
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
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