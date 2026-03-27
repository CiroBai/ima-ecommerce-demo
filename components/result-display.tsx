"use client";

import { GenerationState } from "@/lib/types";
import { useState } from "react";

interface ResultDisplayProps {
  state: GenerationState;
  compact?: boolean;
}

export function ResultDisplay({ state, compact = false }: ResultDisplayProps) {
  const [copied, setCopied] = useState(false);

  if (state.status === "idle") return null;

  if (state.status === "creating") {
    return (
      <div className="result-box loading">
        <div className="loading-anim">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <div className="loading-text">提交任务中...</div>
      </div>
    );
  }

  if (state.status === "polling") {
    const elapsed = state.elapsedMs ? Math.floor(state.elapsedMs / 1000) : 0;
    const pct = Math.min(90, Math.floor(elapsed / 0.6));
    return (
      <div className="result-box loading">
        <div className="loading-anim">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <div className="loading-text">
          AI 生成中... {elapsed}s
        </div>
        <div className="progress-bar-wrap">
          <div className="progress-bar" style={{ width: `${pct}%` }} />
        </div>
        {state.taskId && (
          <div className="task-id">任务 ID: {state.taskId.slice(0, 16)}...</div>
        )}
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="result-box error">
        <div className="error-icon">❌</div>
        <div className="error-msg">{state.error}</div>
      </div>
    );
  }

  if (state.status === "done" && state.resultUrl) {
    const elapsed = state.elapsedMs ? (state.elapsedMs / 1000).toFixed(1) : "?";

    const copyUrl = async () => {
      await navigator.clipboard.writeText(state.resultUrl!);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div className={`result-box done ${compact ? "compact" : ""}`}>
        <div className="result-img-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={state.resultUrl} alt="Generated" className="result-img" />
          <div className="result-actions">
            <a
              href={state.resultUrl}
              download="ima-generated.jpg"
              target="_blank"
              rel="noopener noreferrer"
              className="result-btn download"
            >
              ⬇ 下载
            </a>
            <button className="result-btn copy" onClick={copyUrl}>
              {copied ? "✓ 已复制" : "📋 复制链接"}
            </button>
          </div>
        </div>
        <div className="result-meta">
          ✅ 生成完成 · {elapsed}s
        </div>
      </div>
    );
  }

  return null;
}
