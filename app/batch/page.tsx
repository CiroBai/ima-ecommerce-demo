"use client";

import { useState } from "react";

type TaskStatus = "完成" | "进行中" | "失败" | "排队中";
type TaskType = "图片" | "视频" | "文案" | "Logo" | "海报";

interface Task {
  id: string;
  typeIcon: string;
  typeName: string;
  typeCategory: TaskType;
  product: string;
  status: TaskStatus;
  progress?: number;
  credits: number;
  createdAt: string;
}

const MOCK_TASKS: Task[] = [
  { id: "047", typeIcon: "🛒", typeName: "亚马逊主图", typeCategory: "图片", product: "Wireless Earbuds", status: "进行中", progress: 65, credits: 18, createdAt: "10分钟前" },
  { id: "046", typeIcon: "🎬", typeName: "TikTok 开箱视频", typeCategory: "视频", product: "Smart Watch", status: "进行中", progress: 30, credits: 24, createdAt: "15分钟前" },
  { id: "045", typeIcon: "🎯", typeName: "品牌 Logo", typeCategory: "Logo", product: "EcoLife Brand", status: "进行中", progress: 80, credits: 12, createdAt: "20分钟前" },
  { id: "044", typeIcon: "📸", typeName: "社媒海报", typeCategory: "海报", product: "Skincare Set", status: "完成", credits: 8, createdAt: "1小时前" },
  { id: "043", typeIcon: "✍️", typeName: "商品标题", typeCategory: "文案", product: "Running Shoes", status: "完成", credits: 4, createdAt: "1小时前" },
  { id: "042", typeIcon: "🛒", typeName: "亚马逊主图", typeCategory: "图片", product: "Coffee Maker", status: "完成", credits: 18, createdAt: "2小时前" },
  { id: "041", typeIcon: "🎠", typeName: "轮播图", typeCategory: "图片", product: "Yoga Mat", status: "完成", credits: 10, createdAt: "3小时前" },
  { id: "040", typeIcon: "📄", typeName: "宣传册", typeCategory: "文案", product: "Tech Startup", status: "完成", credits: 16, createdAt: "4小时前" },
  { id: "039", typeIcon: "🎬", typeName: "TikTok 带货视频", typeCategory: "视频", product: "Lip Gloss", status: "失败", credits: 0, createdAt: "5小时前" },
  { id: "038", typeIcon: "🛒", typeName: "亚马逊主图", typeCategory: "图片", product: "Phone Case", status: "完成", credits: 18, createdAt: "6小时前" },
  { id: "037", typeIcon: "📸", typeName: "Instagram 海报", typeCategory: "海报", product: "Candle Set", status: "完成", credits: 8, createdAt: "7小时前" },
  { id: "036", typeIcon: "✍️", typeName: "SEO 关键词", typeCategory: "文案", product: "Leather Wallet", status: "完成", credits: 4, createdAt: "8小时前" },
  { id: "035", typeIcon: "🎯", typeName: "品牌 Logo", typeCategory: "Logo", product: "FreshBake", status: "完成", credits: 12, createdAt: "昨天" },
  { id: "034", typeIcon: "🎬", typeName: "产品演示视频", typeCategory: "视频", product: "Air Purifier", status: "失败", credits: 0, createdAt: "昨天" },
  { id: "033", typeIcon: "🎠", typeName: "小红书轮播图", typeCategory: "图片", product: "Face Serum", status: "完成", credits: 10, createdAt: "昨天" },
  { id: "032", typeIcon: "✍️", typeName: "A+ 文案", typeCategory: "文案", product: "Gaming Chair", status: "完成", credits: 6, createdAt: "2天前" },
  { id: "031", typeIcon: "🛒", typeName: "亚马逊主图", typeCategory: "图片", product: "Bluetooth Speaker", status: "失败", credits: 0, createdAt: "2天前" },
  { id: "030", typeIcon: "📸", typeName: "TikTok 封面图", typeCategory: "海报", product: "Protein Powder", status: "完成", credits: 8, createdAt: "3天前" },
];

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string; icon: string }> = {
  "完成": { label: "完成", color: "#22c55e", bg: "rgba(34,197,94,0.12)", icon: "✅" },
  "进行中": { label: "进行中", color: "#f97316", bg: "rgba(249,115,22,0.12)", icon: "🔄" },
  "失败": { label: "失败", color: "#ef4444", bg: "rgba(239,68,68,0.12)", icon: "❌" },
  "排队中": { label: "排队中", color: "#a1a1aa", bg: "rgba(161,161,170,0.12)", icon: "⏳" },
};

export default function BatchPage() {
  const [statusFilter, setStatusFilter] = useState<string>("全部");
  const [typeFilter, setTypeFilter] = useState<string>("全部");
  const [timeFilter, setTimeFilter] = useState<string>("全部");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const filtered = MOCK_TASKS.filter(t => {
    if (statusFilter !== "全部" && t.status !== statusFilter) return false;
    if (typeFilter !== "全部" && t.typeCategory !== typeFilter) return false;
    if (search && !t.typeName.includes(search) && !t.product.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const stats = [
    { label: "总任务", value: MOCK_TASKS.length, color: "var(--acc)", icon: "📋" },
    { label: "进行中", value: MOCK_TASKS.filter(t => t.status === "进行中").length, color: "#f97316", icon: "🔄" },
    { label: "已完成", value: MOCK_TASKS.filter(t => t.status === "完成").length, color: "#22c55e", icon: "✅" },
    { label: "失败", value: MOCK_TASKS.filter(t => t.status === "失败").length, color: "#ef4444", icon: "❌" },
  ];

  return (
    <>
      <div className="topbar">
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, color: "var(--t3)" }}>工具</span>
          <span style={{ color: "var(--t3)" }}>/</span>
          <span style={{ fontSize: 13, fontWeight: 600 }}>批量任务中心</span>
        </div>
        <div className="credits-badge">✦ 365 积分</div>
      </div>

      <div className="batch-page-wrap fi">
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, fontFamily: "var(--font-display, 'Plus Jakarta Sans', system-ui, sans-serif)", letterSpacing: "-0.02em" }}>📋 批量任务中心</h1>
          <p style={{ fontSize: 13, color: "var(--t2)" }}>统一管理所有生成任务的进度与结果</p>
        </div>

        {/* Stats */}
        <div className="batch-stats-grid">
          {stats.map(s => (
            <div key={s.label} className="glow-card">
              {/* 顶部渐变色条 */}
              <div style={{ height: 3, background: `linear-gradient(90deg, ${s.color}, ${s.color}66)`, borderRadius: "16px 16px 0 0" }} />
              <div style={{ padding: "14px 18px" }}>
                <div style={{ fontSize: 20, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: s.color, marginBottom: 2 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: "var(--t3)" }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="glow-card" style={{ padding: "14px 16px", marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
          {[
            { label: "状态", options: ["全部", "进行中", "完成", "失败", "排队中"], value: statusFilter, set: setStatusFilter },
            { label: "类型", options: ["全部", "图片", "视频", "文案", "Logo", "海报"], value: typeFilter, set: setTypeFilter },
            { label: "时间", options: ["全部", "今天", "本周", "本月"], value: timeFilter, set: setTimeFilter },
          ].map(f => (
            <div key={f.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 11, color: "var(--t3)", whiteSpace: "nowrap", fontWeight: 600 }}>{f.label}</span>
              <div style={{ display: "flex", gap: 4 }}>
                {f.options.map(o => (
                  <button
                    key={o}
                    onClick={() => f.set(o)}
                    style={{
                      padding: "3px 10px", borderRadius: 6, fontSize: 11,
                      background: f.value === o ? "rgba(249,115,22,0.15)" : "transparent",
                      border: `1px solid ${f.value === o ? "rgba(249,115,22,0.4)" : "var(--bd)"}`,
                      color: f.value === o ? "#f97316" : "var(--t2)",
                      cursor: "pointer", fontFamily: "inherit",
                    }}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div style={{ marginLeft: "auto" }}>
            <input
              placeholder="搜索任务..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{
                padding: "6px 12px", borderRadius: 8, fontSize: 12,
                background: "var(--bg4)", border: "1px solid var(--bd)",
                color: "var(--fg)", outline: "none", fontFamily: "inherit", width: 160,
              }}
            />
          </div>
        </div>

        {/* Table (Desktop) */}
        <div className="batch-table-desktop glow-card" style={{ overflow: "hidden", marginBottom: 14, borderRadius: 12 }}>
          {/* Header */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "64px 1fr 140px 100px 80px 60px 90px 120px",
            padding: "10px 16px",
            background: "var(--bg4)",
            borderBottom: "1px solid var(--bd)",
          }}>
            {["ID", "任务类型", "关联商品", "状态", "进度", "积分", "创建时间", "操作"].map(h => (
              <div key={h} style={{ fontSize: 11, color: "var(--t3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</div>
            ))}
          </div>

          {paginated.length === 0 ? (
            <div style={{ padding: "48px", textAlign: "center", color: "var(--t3)", fontSize: 13 }}>
              暂无符合条件的任务
            </div>
          ) : (
            paginated.map((task, idx) => {
              const sc = STATUS_CONFIG[task.status];
              return (
                <div
                  key={task.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "64px 1fr 140px 100px 80px 60px 90px 120px",
                    padding: "11px 16px",
                    borderBottom: idx < paginated.length - 1 ? "1px solid var(--bd)" : "none",
                    borderLeft: "2px solid transparent",
                    alignItems: "center",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(249,115,22,0.03)"; (e.currentTarget as HTMLElement).style.borderLeft = "2px solid rgba(249,115,22,0.2)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.borderLeft = "2px solid transparent"; }}
                >
                  <div style={{ fontSize: 11, color: "var(--t3)", fontFamily: "monospace" }}>#{task.id}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                    <span>{task.typeIcon}</span>
                    <span>{task.typeName}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--t2)" }}>{task.product}</div>
                  <div>
                    <span style={{
                      fontSize: 10, padding: "2px 8px", borderRadius: 6,
                      background: sc.bg, color: sc.color, fontWeight: 700,
                    }}>
                      {sc.icon} {sc.label}
                    </span>
                  </div>
                  <div>
                    {task.status === "进行中" && task.progress != null ? (
                      <div>
                        <div style={{ height: 4, background: "var(--bd)", borderRadius: 2, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${task.progress}%`, background: "#f97316", borderRadius: 2 }} />
                        </div>
                        <div style={{ fontSize: 9, color: "var(--t3)", marginTop: 2 }}>{task.progress}%</div>
                      </div>
                    ) : (
                      <span style={{ fontSize: 10, color: "var(--t3)" }}>—</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: task.credits > 0 ? "var(--acc)" : "var(--t3)" }}>
                    {task.credits > 0 ? `-${task.credits}` : "—"}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--t3)" }}>{task.createdAt}</div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button style={{ padding: "3px 8px", borderRadius: 5, fontSize: 10, background: "rgba(255,255,255,0.06)", border: "1px solid var(--bd)", color: "var(--t2)", cursor: "pointer", fontFamily: "inherit" }}>查看</button>
                    {task.status === "完成" && (
                      <button style={{ padding: "3px 8px", borderRadius: 5, fontSize: 10, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", color: "#22c55e", cursor: "pointer", fontFamily: "inherit" }}>下载</button>
                    )}
                    {task.status === "失败" && (
                      <button style={{ padding: "3px 8px", borderRadius: 5, fontSize: 10, background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.3)", color: "#f97316", cursor: "pointer", fontFamily: "inherit" }}>重试</button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Cards (Mobile) */}
        <div className="batch-cards-mobile" style={{ marginBottom: 14 }}>
          {paginated.length === 0 ? (
            <div style={{ padding: "48px", textAlign: "center", color: "var(--t3)", fontSize: 13 }}>
              暂无符合条件的任务
            </div>
          ) : (
            paginated.map((task) => {
              const sc = STATUS_CONFIG[task.status];
              return (
                <div key={task.id} className="glow-card" style={{ padding: "12px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 16 }}>{task.typeIcon}</span>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{task.typeName}</span>
                    </div>
                    <span style={{
                      fontSize: 10, padding: "2px 8px", borderRadius: 6,
                      background: sc.bg, color: sc.color, fontWeight: 700,
                    }}>
                      {sc.icon} {sc.label}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--t2)", marginBottom: 6 }}>
                    📦 {task.product}
                  </div>
                  {task.status === "进行中" && task.progress != null && (
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ height: 4, background: "var(--bd)", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${task.progress}%`, background: "#f97316", borderRadius: 2 }} />
                      </div>
                      <div style={{ fontSize: 9, color: "var(--t3)", marginTop: 2 }}>{task.progress}%</div>
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ fontSize: 10, color: "var(--t3)" }}>
                      #{task.id} · {task.createdAt}
                      {task.credits > 0 && <span style={{ color: "var(--acc)", marginLeft: 6 }}>-{task.credits} 积分</span>}
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button style={{ padding: "4px 10px", borderRadius: 5, fontSize: 10, background: "rgba(255,255,255,0.06)", border: "1px solid var(--bd)", color: "var(--t2)", cursor: "pointer", fontFamily: "inherit" }}>查看</button>
                      {task.status === "完成" && (
                        <button style={{ padding: "4px 10px", borderRadius: 5, fontSize: 10, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", color: "#22c55e", cursor: "pointer", fontFamily: "inherit" }}>下载</button>
                      )}
                      {task.status === "失败" && (
                        <button style={{ padding: "4px 10px", borderRadius: 5, fontSize: 10, background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.3)", color: "#f97316", cursor: "pointer", fontFamily: "inherit" }}>重试</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Pagination */}
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                padding: "5px 12px", borderRadius: 6, fontSize: 12,
                background: "var(--bg3)", border: "1px solid var(--bd)",
                color: page === 1 ? "var(--t3)" : "var(--fg)",
                cursor: page === 1 ? "not-allowed" : "pointer", fontFamily: "inherit",
              }}
            >← 上一页</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  width: 32, height: 32, borderRadius: 6, fontSize: 12,
                  background: page === p ? "rgba(249,115,22,0.15)" : "var(--bg3)",
                  border: `1px solid ${page === p ? "rgba(249,115,22,0.4)" : "var(--bd)"}`,
                  color: page === p ? "#f97316" : "var(--fg)",
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >{p}</button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                padding: "5px 12px", borderRadius: 6, fontSize: 12,
                background: "var(--bg3)", border: "1px solid var(--bd)",
                color: page === totalPages ? "var(--t3)" : "var(--fg)",
                cursor: page === totalPages ? "not-allowed" : "pointer", fontFamily: "inherit",
              }}
            >下一页 →</button>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button style={{
              padding: "7px 16px", borderRadius: 8, fontSize: 12,
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
              color: "#ef4444", cursor: "pointer", fontFamily: "inherit",
            }}>🗑 清空已完成</button>
            <button style={{
              padding: "7px 16px", borderRadius: 8, fontSize: 12,
              background: "linear-gradient(135deg, #f97316, #ec4899)",
              color: "#fff", border: "none", cursor: "pointer", fontFamily: "inherit",
              fontWeight: 600,
            }}>⬇ 批量下载</button>
          </div>
        </div>
      </div>
    </>
  );
}
