"use client";

import { useState } from "react";

interface CreationRecord {
  id: string;
  createdAt: string;
  type: "text_to_image" | "image_to_image" | "batch";
  model: string;
  prompt: string;
  status: "done" | "failed";
  imageUrl?: string;
  credits: number;
  category: string;
  count?: number;
}

const MOCK_RECORDS: CreationRecord[] = [
  {
    id: "task_01abc",
    createdAt: "2026-03-30 22:15",
    type: "text_to_image",
    model: "SeeDream 4.5",
    prompt: "summer dress, pure white background, studio lighting, product photography",
    status: "done",
    imageUrl: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&q=80",
    credits: 5,
    category: "服装",
  },
  {
    id: "task_02bcd",
    createdAt: "2026-03-30 21:42",
    type: "image_to_image",
    model: "Midjourney",
    prompt: "skincare product flat lay, instagram style, soft pastel background",
    status: "done",
    imageUrl: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=300&q=80",
    credits: 8,
    category: "美妆护肤",
  },
  {
    id: "task_03cde",
    createdAt: "2026-03-30 20:08",
    type: "batch",
    model: "SeeDream 4.5",
    prompt: "wireless earbuds, clean product shot, dark background",
    status: "done",
    imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&q=80",
    credits: 25,
    category: "数码电子",
    count: 5,
  },
  {
    id: "task_04def",
    createdAt: "2026-03-30 19:33",
    type: "text_to_image",
    model: "Nano Banana Pro",
    prompt: "luxury jewelry on black velvet, dramatic spotlight",
    status: "failed",
    credits: 0,
    category: "珠宝首饰",
  },
  {
    id: "task_05efg",
    createdAt: "2026-03-29 16:20",
    type: "text_to_image",
    model: "SeeDream 4.5",
    prompt: "kitchen product in scandinavian home, warm wood surfaces",
    status: "done",
    imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&q=80",
    credits: 5,
    category: "家居厨房",
  },
  {
    id: "task_06fgh",
    createdAt: "2026-03-29 14:55",
    type: "batch",
    model: "Midjourney",
    prompt: "food photography, warm tones, close-up macro shot",
    status: "done",
    imageUrl: "https://images.unsplash.com/photo-1484980859640-5a077d23a1b9?w=300&q=80",
    credits: 40,
    category: "食品饮料",
    count: 5,
  },
];

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  text_to_image: { label: "文生图", color: "#3b82f6" },
  image_to_image: { label: "图生图", color: "#a855f7" },
  batch: { label: "批量", color: "#f97316" },
};

export default function RecordsPage() {
  const [filter, setFilter] = useState<"all" | "done" | "failed">("all");
  const [search, setSearch] = useState("");

  const filtered = MOCK_RECORDS.filter((r) => {
    if (filter === "done" && r.status !== "done") return false;
    if (filter === "failed" && r.status !== "failed") return false;
    if (search && !r.prompt.toLowerCase().includes(search.toLowerCase()) &&
      !r.category.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalCredits = MOCK_RECORDS.filter(r => r.status === "done")
    .reduce((sum, r) => sum + r.credits, 0);
  const doneCount = MOCK_RECORDS.filter(r => r.status === "done").length;

  return (
    <>
      {/* Topbar */}
      <div className="topbar">
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 13, color: "var(--t2)", fontWeight: 600 }}>📋 创作记录</span>
        </div>
        <div className="credits-badge">✦ 365 积分</div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 40px" }}>
        {/* Stats */}
        <div className="fi" style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28
        }}>
          {[
            { label: "总创作数", value: MOCK_RECORDS.length, icon: "🎨", color: "#f97316" },
            { label: "成功完成", value: doneCount, icon: "✅", color: "#22c55e" },
            { label: "消耗积分", value: totalCredits, icon: "✦", color: "#a855f7" },
            { label: "今日创作", value: 4, icon: "📅", color: "#3b82f6" },
          ].map((stat) => (
            <div key={stat.label} style={{
              background: "var(--bg3)", border: "1px solid var(--bd)", borderRadius: 12,
              padding: "16px 18px"
            }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{stat.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: stat.color, marginBottom: 2 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 11, color: "var(--t3)" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div style={{ flex: 1 }}>
            <input
              type="text"
              placeholder="搜索提示词、品类..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "8px 14px", borderRadius: 8,
                background: "var(--bg3)", border: "1px solid var(--bd)",
                color: "var(--t1)", fontSize: 13, outline: "none", fontFamily: "inherit"
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {(["all", "done", "failed"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "7px 14px", borderRadius: 8, fontSize: 12,
                  border: `1px solid ${filter === f ? "var(--acc)" : "var(--bd)"}`,
                  background: filter === f ? "var(--accg)" : "transparent",
                  color: filter === f ? "var(--acc)" : "var(--t3)",
                  cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s"
                }}
              >
                {f === "all" ? "全部" : f === "done" ? "✅ 成功" : "❌ 失败"}
              </button>
            ))}
          </div>
        </div>

        {/* Records List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.length === 0 ? (
            <div style={{
              textAlign: "center", padding: 60, color: "var(--t3)", fontSize: 14
            }}>
              暂无记录
            </div>
          ) : (
            filtered.map((record) => (
              <div
                key={record.id}
                style={{
                  background: "var(--bg3)", border: "1px solid var(--bd)", borderRadius: 12,
                  padding: "14px 16px", display: "flex", alignItems: "center", gap: 14,
                  transition: "border-color 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--bd2)")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--bd)")}
              >
                {/* Thumbnail */}
                <div style={{
                  width: 56, height: 56, borderRadius: 8, overflow: "hidden",
                  flexShrink: 0, background: "var(--bg4)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20
                }}>
                  {record.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={record.imageUrl}
                      alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <span>❌</span>
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span style={{
                      fontSize: 9, padding: "2px 6px", borderRadius: 4, fontWeight: 700,
                      background: `${TYPE_LABELS[record.type].color}22`,
                      color: TYPE_LABELS[record.type].color,
                      border: `1px solid ${TYPE_LABELS[record.type].color}44`,
                    }}>
                      {TYPE_LABELS[record.type].label}
                      {record.count ? ` ×${record.count}` : ""}
                    </span>
                    <span style={{ fontSize: 10, color: "var(--t3)", padding: "1px 5px", borderRadius: 4, background: "rgba(255,255,255,0.05)" }}>
                      {record.category}
                    </span>
                    <span style={{ fontSize: 10, color: "var(--t3)" }}>
                      {record.model}
                    </span>
                  </div>
                  <div style={{
                    fontSize: 12, color: "var(--t2)", overflow: "hidden",
                    textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 2
                  }}>
                    {record.prompt}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--t3)" }}>
                    {record.createdAt}
                  </div>
                </div>

                {/* Right */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
                    background: record.status === "done" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                    color: record.status === "done" ? "#22c55e" : "#ef4444",
                    border: `1px solid ${record.status === "done" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                  }}>
                    {record.status === "done" ? "✓ 成功" : "✗ 失败"}
                  </span>
                  {record.credits > 0 && (
                    <span style={{ fontSize: 10, color: "var(--t3)" }}>
                      -{record.credits} 积分
                    </span>
                  )}
                  {record.imageUrl && (
                    <a
                      href={record.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: 10, padding: "3px 10px", borderRadius: 6,
                        background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.25)",
                        color: "#f97316", textDecoration: "none"
                      }}
                    >
                      查看
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
