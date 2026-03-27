"use client";

import { Suspense } from "react";
import { WorkspaceContent } from "./workspace-content";

export default function WorkspacePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen bg-[#09090b] text-zinc-400">加载中...</div>}>
      <WorkspaceContent />
    </Suspense>
  );
}
