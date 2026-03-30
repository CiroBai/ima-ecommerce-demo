"use client";

import { useRouter } from "next/navigation";

export default function SmartReplacePage() {
  const router = useRouter();

  return (
    <>
      <div className="topbar">
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 13, color: "var(--t2)", fontWeight: 600 }}>✂️ 智能换图</span>
        </div>
        <div className="credits-badge">✦ 365 积分</div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "60px 40px", textAlign: "center" }} className="fi">
        <div style={{ fontSize: 64, marginBottom: 20 }}>✂️</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>智能换图</h1>
        <p style={{ fontSize: 14, color: "var(--t2)", lineHeight: 1.7, marginBottom: 8 }}>
          上传商品图，智能替换背景/场景，保留商品主体
        </p>
        <p style={{ fontSize: 12, color: "var(--t3)", marginBottom: 32 }}>
          支持图生图模式：上传原图 → 描述目标效果 → AI 智能生成
        </p>

        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, maxWidth: 500, margin: "0 auto 32px"
        }}>
          {[
            { icon: "⬜", title: "白底换彩底", desc: "给白底商品图换任意背景颜色" },
            { icon: "🏖️", title: "场景合成", desc: "把商品放到指定场景中" },
            { icon: "🌟", title: "氛围升级", desc: "提升图片光效和质感" },
            { icon: "📐", title: "比例裁切", desc: "智能适配各平台规格" },
          ].map((item) => (
            <div
              key={item.title}
              onClick={() => router.push("/workspace")}
              style={{
                background: "var(--bg3)", border: "1px solid var(--bd)", borderRadius: 12,
                padding: "16px 14px", cursor: "pointer", textAlign: "left",
                transition: "all 0.15s"
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--acc)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--bd)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 6 }}>{item.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{item.title}</div>
              <div style={{ fontSize: 11, color: "var(--t3)" }}>{item.desc}</div>
            </div>
          ))}
        </div>

        <button
          onClick={() => router.push("/workspace")}
          style={{
            padding: "12px 32px", borderRadius: 12,
            background: "linear-gradient(135deg, var(--acc), var(--pk))",
            border: "none", color: "#fff", fontSize: 14, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit"
          }}
        >
          进入工作台 →
        </button>
      </div>
    </>
  );
}
