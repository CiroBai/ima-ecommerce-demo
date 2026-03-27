"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { GenerationState } from "@/lib/types";

interface GenerateButtonProps {
  prompt: string;
  modelId: string;
  taskType: "text_to_image" | "image_to_image";
  inputImages?: string[];
  onStateChange?: (state: GenerationState) => void;
  disabled?: boolean;
}

export function GenerateButton({
  prompt,
  modelId,
  taskType,
  inputImages = [],
  onStateChange,
  disabled,
}: GenerateButtonProps) {
  const [state, setState] = useState<GenerationState>({ status: "idle" });
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const updateState = useCallback(
    (newState: GenerationState) => {
      setState(newState);
      onStateChange?.(newState);
    },
    [onStateChange]
  );

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearTimeout(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const poll = useCallback(
    async (taskId: string) => {
      try {
        const resp = await fetch("/api/poll", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taskId }),
        });
        const data = await resp.json();

        if (!resp.ok) {
          throw new Error(data.error || "Poll failed");
        }

        if (data.done) {
          stopPolling();
          if (data.error) {
            updateState({ status: "error", error: data.error });
            toast.error(`生成失败: ${data.error}`);
          } else {
            updateState({
              status: "done",
              taskId,
              resultUrl: data.result?.url,
              elapsedMs: Date.now() - startTimeRef.current,
            });
            toast.success("🎉 图片生成完成！");
          }
        } else {
          // Keep polling
          pollRef.current = setTimeout(() => poll(taskId), 5000);
          updateState({
            status: "polling",
            taskId,
            elapsedMs: Date.now() - startTimeRef.current,
          });
        }
      } catch (e) {
        stopPolling();
        const msg = e instanceof Error ? e.message : "Polling failed";
        updateState({ status: "error", error: msg });
        toast.error(`轮询失败: ${msg}`);
      }
    },
    [stopPolling, updateState]
  );

  const generate = useCallback(async () => {
    if (!prompt.trim()) {
      toast.error("请先输入提示词");
      return;
    }

    stopPolling();
    startTimeRef.current = Date.now();
    updateState({ status: "creating" });

    try {
      const resp = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, modelId, taskType, inputImages }),
      });
      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data.error || "Create task failed");
      }

      updateState({ status: "polling", taskId: data.taskId });
      toast.success(`任务已创建，正在生成... (${data.modelName})`);

      // Start polling after 5s
      pollRef.current = setTimeout(() => poll(data.taskId), 5000);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed";
      updateState({ status: "error", error: msg });
      toast.error(`创建失败: ${msg}`);
    }
  }, [prompt, modelId, taskType, inputImages, stopPolling, updateState, poll]);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  const isLoading = state.status === "creating" || state.status === "polling";
  const elapsed = state.elapsedMs ? Math.floor(state.elapsedMs / 1000) : 0;

  return (
    <button
      className="gen-btn"
      onClick={generate}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <>
          <span className="inline-block w-3 h-3 border border-white border-t-transparent rounded-full animate-spin mr-1" />
          {state.status === "creating" ? "创建中..." : `生成中 ${elapsed}s...`}
        </>
      ) : (
        "生成 ↑"
      )}
    </button>
  );
}
