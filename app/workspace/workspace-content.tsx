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

const BATCH_COUNTS = [1, 3, 5, 10];

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

interface BatchItem {
  index: number;
  status: "pending" | "generating" | "done" | "error";
  resultUrl?: string;
  error?: string;
}

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

  // Batch state
  const [batchCount, setBatchCount] = useState(1);
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [isBatching, setIsBatching] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);

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

  const handleBatchGenerate = useCallback(async () => {
    if (!prompt.trim() || batchCount <= 1) return;
    setIsBatching(true);
    setBatchProgress(0);

    const items: BatchItem[] = Array.from({ length: batchCount }, (_, i) => ({
      index: i,
      status: "pending",
    }));
    setBatchItems(items);

    for (let i = 0; i < batchCount; i++) {
      setBatchItems(prev => prev.map((item, idx) =>
        idx === i ? { ...item, status: "generating" } : item
      ));

      try {
        const resp = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, modelId, taskType, inputImages }),
        });
        const data = await resp.json();

        if (!resp.ok) throw new Error(data.error || "Failed");

        // Simulate polling wait
        await new Promise((r) => setTimeout(r, 3000));

        // Poll once
        const pollResp = await fetch("/api/poll", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taskId: data.taskId }),
        });
        const pollData = await pollResp.json();

        if (pollData.done && !pollData.error) {
          setBatchItems(prev => prev.map((item, idx) =>
            idx === i ? { ...item, status: "done", resultUrl: pollData.result?.url } : item
          ));
        } else {
          setBatchItems(prev => prev.map((item, idx) =>
            idx === i ? { ...item, status: "done", resultUrl: undefined } : item
          ));
        }
      } catch {
        setBatchItems(prev => prev.map((item, idx) =>
          idx === i ? { ...item, status: "error", error: "生成失败" } : item
        ));
      }

      setBatchProgress(Math.round(((i + 1) / batchCount) * 100));
    }

    setIsBatching(false);
  }, [prompt, modelId, taskType, inputImages, batchCount]);

  const handleDownloadAll = useCallback(() => {
    batchItems.forEach((item, i) => {
      if (item.resultUrl) {
        const a = document.createElement("a");
        a.href = item.resultUrl;
        a.download = `ima-batch-${i + 1}.jpg`;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    });
  }, [batchItems]);

  const doneItems = batchItems.filter(item => item.status === "done" && item.resultUrl);

  return (
    <div className="text-[#fafafa]">
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

        {/* Config Row 2: Scene + Ratio + Batch Count */}
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
          <div>
            <div className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mb-2">
              📊 批量数量
            </div>
            <div className="flex gap-1.5">
              {BATCH_COUNTS.map((c) => (
                <button
                  key={c}
                  className={`cfg-opt ${batchCount === c ? "active" : ""}`}
                  onClick={() => {
                    setBatchCount(c);
                    setBatchItems([]);
                    setBatchProgress(0);
                  }}
                >
                  {c}张
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
          <div>
            <FileUpload onUpload={handleUpload} uploadedUrl={uploadedUrl} />
            {uploadedUrl && (
              <div className="mt-2 text-[10px] text-green-400 text-center">
                ✅ 已上传 · 将使用图生图模式
              </div>
            )}
          </div>

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
                  {batchCount > 1 && (
                    <span className="ml-2 text-orange-400 font-semibold">· 批量 {batchCount} 张</span>
                  )}
                </span>
                <div className="ml-auto flex gap-2">
                  {batchCount > 1 ? (
                    <button
                      className="gen-btn"
                      onClick={handleBatchGenerate}
                      disabled={!prompt.trim() || isBatching}
                      style={{ background: "linear-gradient(135deg, #f97316, #a855f7)" }}
                    >
                      {isBatching ? (
                        <>
                          <span className="inline-block w-3 h-3 border border-white border-t-transparent rounded-full animate-spin mr-1" />
                          批量生成中 {batchProgress}%...
                        </>
                      ) : (
                        `⚡ 批量生成 ${batchCount} 张`
                      )}
                    </button>
                  ) : (
                    <GenerateButton
                      prompt={prompt}
                      modelId={modelId}
                      taskType={taskType}
                      inputImages={inputImages}
                      onStateChange={setGenState}
                      disabled={!prompt.trim()}
                    />
                  )}
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

        {/* Single Generation Result */}
        {batchCount === 1 && <ResultDisplay state={genState} />}

        {/* Batch Progress */}
        {batchCount > 1 && (isBatching || batchItems.length > 0) && (
          <div className="mt-4">
            {/* Progress Bar */}
            {isBatching && (
              <div className="mb-4 p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">
                    批量生成中... {batchItems.filter(i => i.status === "done" || i.status === "error").length}/{batchCount}
                  </span>
                  <span className="text-xs text-zinc-500">{batchProgress}%</span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${batchProgress}%`,
                      background: "linear-gradient(90deg, #f97316, #a855f7)"
                    }}
                  />
                </div>
              </div>
            )}

            {/* Result Grid */}
            {batchItems.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">
                    🖼️ 批量结果
                    {!isBatching && <span className="ml-2 text-zinc-500 text-xs">({doneItems.length}/{batchCount} 张成功)</span>}
                  </h3>
                  {doneItems.length > 0 && !isBatching && (
                    <button
                      onClick={handleDownloadAll}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-orange-500/30 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 transition"
                    >
                      ⬇ 全部下载 ({doneItems.length} 张)
                    </button>
                  )}
                </div>
                <div
                  className="grid gap-3"
                  style={{
                    gridTemplateColumns: `repeat(${Math.min(batchCount, 5)}, 1fr)`
                  }}
                >
                  {batchItems.map((item) => (
                    <div
                      key={item.index}
                      className="relative rounded-xl overflow-hidden border border-zinc-800"
                      style={{ aspectRatio: "1/1", background: "#161618" }}
                    >
                      {item.status === "pending" && (
                        <div className="absolute inset-0 flex items-center justify-center text-zinc-600 text-sm">
                          {item.index + 1}
                        </div>
                      )}
                      {item.status === "generating" && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                          <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                          <span className="text-[10px] text-zinc-500">生成中...</span>
                        </div>
                      )}
                      {item.status === "done" && item.resultUrl && (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.resultUrl}
                            alt={`结果 ${item.index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-0 left-0 right-0 p-2 flex justify-end"
                            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)" }}>
                            <a
                              href={item.resultUrl}
                              download={`ima-batch-${item.index + 1}.jpg`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-1 text-[9px] font-semibold rounded bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 transition"
                            >
                              ⬇
                            </a>
                          </div>
                        </>
                      )}
                      {item.status === "done" && !item.resultUrl && (
                        <div className="absolute inset-0 flex items-center justify-center text-zinc-600 text-sm">
                          <span className="text-[10px]">等待结果...</span>
                        </div>
                      )}
                      {item.status === "error" && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[10px] text-red-400">失败</span>
                        </div>
                      )}
                      <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-zinc-900/80 flex items-center justify-center text-[8px] text-zinc-400">
                        {item.index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

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
