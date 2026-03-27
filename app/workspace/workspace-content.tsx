"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { PLATFORMS, STYLES, MODELS, GenerationState } from "@/lib/types";
import { FileUpload } from "@/components/file-upload";
import { GenerateButton } from "@/components/generate-button";
import { ResultDisplay } from "@/components/result-display";
import { AmazonPlanPanel } from "@/components/amazon-plan-panel";
import { AmazonImageSlot } from "@/lib/amazon-planner";
import { Toaster } from "@/components/ui/sonner";

const SCENES = [
  { id: "白底", label: "⬜ 白底" },
  { id: "室内", label: "🏡 室内" },
  { id: "户外", label: "🌳 户外" },
  { id: "办公室", label: "🏢 办公室" },
  { id: "抽象", label: "✨ 抽象" },
];

const RATIOS = ["1:1", "9:16", "16:9", "4:5"];

const OUTPUT_TYPES = [
  { id: "商品图片", label: "🖼️ 商品图片" },
  { id: "广告视频", label: "🎬 广告视频" },
  { id: "UGC视频", label: "🎤 UGC 视频" },
  { id: "AI数字人", label: "🤖 AI 数字人" },
  { id: "完整套件", label: "📦 完整套件" },
];

const QUICK_ACTIONS: Record<string, string> = {
  main: "亚马逊主图：\n- 纯白背景 (#FFFFFF)\n- 商品占画面 85% 以上\n- 无文字/标签/水印\n- 2000x2000px sRGB",
  life: "场景图：\n- 温馨、有吸引力的环境\n- 商品清晰可见，自然使用\n- 面向目标买家的真实场景",
  info: "卖点图：\n- 每张图展示一个核心卖点\n- 简洁布局配图标 + 标注\n- 品牌色彩，文字精简",
  video: "15秒商品视频：\n- 吸引 (0-3秒)：抓住注意力\n- 展示 (3-10秒)：商品使用演示\n- 行动 (10-15秒)：引导购买\n- 9:16 竖屏适配 TikTok/Reels",
  aplus: "亚马逊 A+ 内容方案：\n1. 品牌横幅 — 品牌故事\n2. 卖点矩阵 — 3-4个核心卖点\n3. 对比图表 — 与竞品对比\n4. 场景图集 — 3个使用场景\n5. FAQ / 规格模块",
  batch: "完整上架套件 (7+1)：\n1. 主图（白底，1:1）\n2. 卖点信息图\n3. 场景图 ×2\n4. 细节 / 特写\n5. 多角度（3个视角）\n6. 尺寸参考\n7. 包装内容物\n+ 15秒商品视频\n\n自动适配：亚马逊 1:1 + TikTok 9:16 + IG 4:5",
};

export function WorkspaceContent() {
  const params = useSearchParams();
  const router = useRouter();

  const category = params.get("category") || "服装";
  const initialPrompt = params.get("prompt") || "";

  const [platform, setPlatform] = useState("亚马逊");
  const [outputType, setOutputType] = useState("商品图片");
  const [scene, setScene] = useState("白底");
  const [ratio, setRatio] = useState("1:1");
  const [style, setStyle] = useState("极简清爽");
  const [prompt, setPrompt] = useState(initialPrompt);
  const [modelId, setModelId] = useState("doubao-seedream-4.5");
  const [uploadedUrl, setUploadedUrl] = useState<string | undefined>();
  const [genState, setGenState] = useState<GenerationState>({ status: "idle" });
  const [selectedSlot, setSelectedSlot] = useState<number | undefined>();

  const taskType = uploadedUrl ? "image_to_image" as const : "text_to_image" as const;
  const inputImages = uploadedUrl ? [uploadedUrl] : [];

  const handleUpload = useCallback((url: string) => {
    setUploadedUrl(url);
  }, []);

  const handleSlotSelect = useCallback((slot: AmazonImageSlot) => {
    setSelectedSlot(slot.slot);
    setPrompt(slot.promptTemplate);
    if (slot.aspectRatio) setRatio(slot.aspectRatio);
  }, []);

  const isAmazon = platform === "亚马逊";

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa]">
      <Toaster position="top-right" richColors />

      {/* Top Bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 border-b border-zinc-800 bg-[#09090b]/80 backdrop-blur">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="px-3 py-1.5 text-sm text-zinc-400 border border-zinc-700 rounded-lg hover:bg-zinc-800 hover:text-zinc-200 transition"
          >
            ← 返回首页
          </button>
          <h1 className="text-lg font-bold">{category}</h1>
          <span className="text-xs text-zinc-500">由 IMA AI 驱动 · <span className="text-orange-500">SeeDream + Nano Banana</span></span>
        </div>
        <div className="flex items-center gap-2">
          {/* Model Selector */}
          <select
            value={modelId}
            onChange={(e) => setModelId(e.target.value)}
            className="px-3 py-1.5 text-xs bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-300 outline-none"
          >
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.credits} pts){"recommended" in m && m.recommended ? " ⭐" : ""}
              </option>
            ))}
          </select>
          <div className="px-3 py-1.5 text-xs font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/25 rounded-full">
            ✦ 365 积分
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Config Row 1: Platform + Output Type */}
        <div className="flex flex-wrap gap-6 mb-4">
          <div className="flex-1 min-w-[200px]">
            <div className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mb-2">📦 平台</div>
            <div className="flex flex-wrap gap-1.5">
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  className={`cfg-opt ${platform === p.id ? "active" : ""}`}
                  onClick={() => setPlatform(p.id)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 min-w-[200px]">
            <div className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mb-2">🎯 输出类型</div>
            <div className="flex flex-wrap gap-1.5">
              {OUTPUT_TYPES.map((o) => (
                <button
                  key={o.id}
                  className={`cfg-opt ${outputType === o.id ? "active" : ""}`}
                  onClick={() => setOutputType(o.id)}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Config Row 2: Scene + Ratio */}
        <div className="flex flex-wrap gap-6 mb-4">
          <div className="flex-1 min-w-[200px]">
            <div className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mb-2">📍 场景</div>
            <div className="flex flex-wrap gap-1.5">
              {SCENES.map((s) => (
                <button
                  key={s.id}
                  className={`cfg-opt ${scene === s.id ? "active" : ""}`}
                  onClick={() => setScene(s.id)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div className="max-w-[220px]">
            <div className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mb-2">📐 比例</div>
            <div className="flex flex-wrap gap-1.5">
              {RATIOS.map((r) => (
                <button
                  key={r}
                  className={`cfg-opt ${ratio === r ? "active" : ""}`}
                  onClick={() => setRatio(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Style Tags */}
        <div className="mb-4">
          <div className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mb-2">🔥 热门风格</div>
          <div className="flex flex-wrap gap-1.5">
            {STYLES.map((s) => (
              <button
                key={s.id}
                className={`stag ${style === s.id ? "active" : ""}`}
                onClick={() => setStyle(s.id)}
              >
                {s.emoji} {s.id}
              </button>
            ))}
          </div>
        </div>

        {/* Amazon Plan Panel */}
        {isAmazon && (
          <AmazonPlanPanel
            category={category}
            onSelectSlot={handleSlotSelect}
            selectedSlot={selectedSlot}
          />
        )}

        {/* Creation Area */}
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4 mb-4">
          {/* Upload */}
          <div>
            <FileUpload onUpload={handleUpload} uploadedUrl={uploadedUrl} />
            {uploadedUrl && (
              <div className="mt-2 text-[10px] text-green-400 text-center">
                ✅ 已上传 · 将使用图生图模式
              </div>
            )}
          </div>

          {/* Prompt + Generate */}
          <div className="flex flex-col gap-2">
            <div className="pbox">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="描述你想要的图片效果，或使用快捷按钮填充..."
                className="w-full min-h-[120px] bg-transparent border-none outline-none text-sm text-zinc-200 resize-none leading-relaxed placeholder:text-zinc-600"
              />
              <div className="flex items-center gap-2 pt-2 border-t border-zinc-800 flex-wrap">
                <span className="text-[10px] text-zinc-500">
                  {uploadedUrl ? "🖼️ 图生图" : "✏️ 文生图"} · {MODELS.find(m => m.id === modelId)?.name}
                </span>
                <div className="ml-auto">
                  <GenerateButton
                    prompt={prompt}
                    modelId={modelId}
                    taskType={taskType}
                    inputImages={inputImages}
                    onStateChange={setGenState}
                    disabled={!prompt.trim()}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {Object.entries(QUICK_ACTIONS).map(([key, val]) => {
            const labels: Record<string, string> = {
              main: "📸 主图", life: "🏖️ 场景图", info: "📊 卖点图",
              video: "🎬 15秒视频", aplus: "⭐ A+ 方案", batch: "📦 完整套件",
            };
            return (
              <button
                key={key}
                className="qa-btn"
                onClick={() => setPrompt(val)}
              >
                {labels[key] || key}
              </button>
            );
          })}
        </div>

        {/* Result Display */}
        <ResultDisplay state={genState} />

        {/* Multi-Platform Preview */}
        <div className="mt-6 p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
          <div className="text-sm font-semibold mb-3 flex items-center gap-2">📱 多平台预览</div>
          <div className="flex flex-wrap gap-4 justify-center">
            {[
              { label: "Amazon", w: 100, h: 100, size: "1:1 · 2000px" },
              { label: "TikTok", w: 56, h: 100, size: "9:16 · 1080px" },
              { label: "Instagram", w: 80, h: 100, size: "4:5 · 1080px" },
              { label: "YouTube", w: 100, h: 56, size: "16:9 · 1920px" },
              { label: "Shopify", w: 100, h: 100, size: "1:1 · 2048px" },
            ].map((p) => (
              <div key={p.label} className="text-center">
                <div
                  className="border border-zinc-700 rounded-lg flex items-center justify-center mb-1"
                  style={{
                    width: p.w,
                    height: p.h,
                    background: genState.resultUrl
                      ? `url(${genState.resultUrl}) center/cover`
                      : "linear-gradient(135deg,#fef3c7,#fde68a)",
                    fontSize: genState.resultUrl ? 0 : 24,
                  }}
                >
                  {!genState.resultUrl && "📦"}
                </div>
                <div className="text-[9px] text-zinc-500">{p.label}</div>
                <div className="text-[8px] text-zinc-600">{p.size}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
