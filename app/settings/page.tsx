"use client";

import { useState } from "react";

const SPEND_DATA = [42, 18, 25, 0, 31, 7, 128]; // 7天积分消耗
const DAYS = ["周一", "周二", "周三", "周四", "周五", "周六", "今日"];
const MAX_SPEND = Math.max(...SPEND_DATA);

export default function SettingsPage() {
  const [showKey, setShowKey] = useState(false);
  const [apiKey, setApiKey] = useState("ima_229a64800b384ae985e3e7688988b3ca");
  const [platform, setPlatform] = useState("Amazon");
  const [language, setLanguage] = useState("中文");
  const [resolution, setResolution] = useState("2K");
  const [model, setModel] = useState("SeeDream 4.5");
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"ok" | "fail" | null>(null);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTest = () => {
    setTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setTesting(false);
      setTestResult("ok");
    }, 1500);
  };

  return (
    <>
      <div className="topbar">
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>设置中心</span>
        </div>
        <div className="credits-badge">✦ 365 积分</div>
      </div>

      <div style={{ padding: "24px 32px", maxWidth: 760, margin: "0 auto", width: "100%" }} className="fi">
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, fontFamily: "var(--font-display, 'Plus Jakarta Sans', system-ui, sans-serif)", letterSpacing: "-0.02em" }}>⚙️ 设置中心</h1>
          <p style={{ fontSize: 13, color: "var(--t2)" }}>管理账户、API 密钥和使用偏好</p>
        </div>

        {/* Account Card */}
        <div className="glow-card" style={{ padding: "20px 24px", marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--t3)", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            账户信息
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 60, height: 60, borderRadius: "50%",
              background: "linear-gradient(135deg, #f97316, #ec4899)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24, fontWeight: 800, color: "#fff", flexShrink: 0,
            }}>C</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Ciro</div>
              <div style={{ fontSize: 12, color: "var(--t2)", marginBottom: 8 }}>ciro@imastudio.com</div>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{
                  fontSize: 10, padding: "3px 10px", borderRadius: 20,
                  background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.3)",
                  color: "#f97316", fontWeight: 700,
                }}>👑 Pro 会员</span>
                <span style={{ fontSize: 10, color: "var(--t3)", display: "flex", alignItems: "center" }}>
                  注册于 2024-01-15
                </span>
              </div>
            </div>
            <button style={{
              padding: "8px 18px", borderRadius: 8, fontSize: 12,
              background: "rgba(255,255,255,0.06)", border: "1px solid var(--bd)",
              color: "var(--t2)", cursor: "pointer", fontFamily: "inherit",
            }}>编辑资料</button>
          </div>
        </div>

        {/* Credits */}
        <div className="glow-card" style={{ padding: "20px 24px", marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--t3)", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            积分管理
          </div>
          <div style={{ display: "flex", gap: 24, marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 32, fontWeight: 800, color: "#f97316" }}>365</div>
              <div style={{ fontSize: 11, color: "var(--t3)" }}>当前余额</div>
            </div>
            <div style={{ width: 1, background: "var(--bd)" }} />
            <div>
              <div style={{ fontSize: 32, fontWeight: 800, color: "var(--fg)" }}>128</div>
              <div style={{ fontSize: 11, color: "var(--t3)" }}>本月消耗</div>
            </div>
            <div style={{ width: 1, background: "var(--bd)" }} />
            <div>
              <div style={{ fontSize: 32, fontWeight: 800, color: "#22c55e" }}>Pro</div>
              <div style={{ fontSize: 11, color: "var(--t3)" }}>会员等级</div>
            </div>
          </div>

          {/* 7-day bar chart — pure CSS */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 10, fontWeight: 600 }}>近 7 天消耗趋势</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 64 }}>
              {SPEND_DATA.map((val, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ fontSize: 9, color: "var(--t3)" }}>{val > 0 ? val : ""}</div>
                  <div style={{
                    width: "100%",
                    height: MAX_SPEND > 0 ? `${Math.max(4, (val / MAX_SPEND) * 44)}px` : "4px",
                    borderRadius: "4px 4px 0 0",
                    background: i === 6
                      ? "linear-gradient(to top, #f97316, #fbbf24)"
                      : val > 0 ? "rgba(249,115,22,0.4)" : "var(--bd)",
                    transition: "height 0.3s ease",
                  }} />
                  <div style={{ fontSize: 9, color: "var(--t3)", whiteSpace: "nowrap" }}>{DAYS[i]}</div>
                </div>
              ))}
            </div>
          </div>

          <button style={{
            padding: "9px 24px", borderRadius: 9,
            background: "linear-gradient(135deg, #f97316, #ec4899)",
            color: "#fff", fontSize: 13, fontWeight: 700,
            border: "none", cursor: "pointer", fontFamily: "inherit",
          }}>
            💳 充值积分
          </button>
        </div>

        {/* API Config */}
        <div className="glow-card" style={{ padding: "20px 24px", marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--t3)", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            API 配置
          </div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: "var(--t2)", marginBottom: 6, fontWeight: 600 }}>IMA API Key</div>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{
                flex: 1, display: "flex", alignItems: "center",
                background: "var(--bg4)", border: "1px solid var(--bd)",
                borderRadius: 8, padding: "8px 12px", gap: 8,
              }}>
                <input
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  style={{
                    flex: 1, background: "transparent", border: "none",
                    color: "var(--fg)", fontSize: 12, outline: "none",
                    fontFamily: "monospace",
                  }}
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "var(--t3)", fontSize: 14, padding: 0,
                  }}
                >
                  {showKey ? "🙈" : "👁"}
                </button>
              </div>
              <button
                onClick={handleTest}
                disabled={testing}
                style={{
                  padding: "8px 16px", borderRadius: 8, fontSize: 12,
                  background: "rgba(255,255,255,0.06)", border: "1px solid var(--bd)",
                  color: "var(--t2)", cursor: testing ? "wait" : "pointer",
                  fontFamily: "inherit",
                }}
              >
                {testing ? "测试中..." : "测试连接"}
              </button>
            </div>
            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
              <div
                className={testResult === "fail" ? "status-dot-red" : "status-dot-green"}
                style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: testResult === "fail" ? "#ef4444" : "#22c55e",
                }}
              />
              <span style={{ fontSize: 11, color: testResult === "fail" ? "#ef4444" : "#22c55e" }}>
                {testResult === "fail" ? "连接失败，请检查 API Key" : "已连接 · api.imastudio.com"}
              </span>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="glow-card" style={{ padding: "20px 24px", marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--t3)", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            偏好设置
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[
              { label: "默认平台", options: ["Amazon", "TikTok", "Shopee", "Instagram", "小红书"], value: platform, set: setPlatform },
              { label: "默认语言", options: ["中文", "English", "日本語", "한국어"], value: language, set: setLanguage },
              { label: "默认图片分辨率", options: ["1K", "2K", "4K"], value: resolution, set: setResolution },
              { label: "默认模型", options: ["SeeDream 4.5", "Midjourney", "Nano Banana Pro", "Nano Banana 2"], value: model, set: setModel },
            ].map(f => (
              <div key={f.label}>
                <div style={{ fontSize: 11, color: "var(--t2)", marginBottom: 6, fontWeight: 600 }}>{f.label}</div>
                <select
                  value={f.value}
                  onChange={e => f.set(e.target.value)}
                  style={{
                    width: "100%", padding: "8px 10px",
                    background: "var(--bg4)", border: "1px solid var(--bd)",
                    borderRadius: 8, color: "var(--fg)", fontSize: 12,
                    outline: "none", cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Appearance */}
        <div className="glow-card" style={{ padding: "20px 24px", marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--t3)", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            外观
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: "var(--t2)", marginBottom: 8, fontWeight: 600 }}>主题</div>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{
                  padding: "10px 20px", borderRadius: 9, fontSize: 12, fontWeight: 700,
                  background: "rgba(249,115,22,0.15)", border: "2px solid rgba(249,115,22,0.5)",
                  color: "#f97316", cursor: "default",
                }}>🌙 暗色（当前）</div>
                <div style={{
                  padding: "10px 20px", borderRadius: 9, fontSize: 12,
                  background: "rgba(255,255,255,0.04)", border: "1px solid var(--bd)",
                  color: "var(--t3)", cursor: "not-allowed", display: "flex", alignItems: "center", gap: 8,
                }}>
                  ☀️ 亮色
                  <span style={{
                    fontSize: 9, padding: "2px 6px", borderRadius: 4,
                    background: "rgba(255,255,255,0.06)", color: "var(--t3)", fontWeight: 700,
                  }}>开发中</span>
                </div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--t2)", marginBottom: 8, fontWeight: 600 }}>侧边栏</div>
              <div style={{ display: "flex", gap: 8 }}>
                {["展开", "收起"].map(opt => (
                  <div
                    key={opt}
                    style={{
                      padding: "8px 18px", borderRadius: 8, fontSize: 12,
                      background: opt === "展开" ? "rgba(249,115,22,0.12)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${opt === "展开" ? "rgba(249,115,22,0.3)" : "var(--bd)"}`,
                      color: opt === "展开" ? "#f97316" : "var(--t3)",
                      cursor: "pointer",
                    }}
                  >{opt}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className={saved ? "" : "btn-glow"}
          style={{
            width: "100%", padding: "12px",
            ...(saved ? {
              background: "rgba(34,197,94,0.2)",
              border: "1px solid rgba(34,197,94,0.4)",
              color: "#22c55e",
              fontSize: 14, fontWeight: 700, borderRadius: 10,
              cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
            } : {
              fontSize: 14, cursor: "pointer", fontFamily: "inherit",
            }),
          }}
        >
          {saved ? "✓ 已保存" : "保存设置"}
        </button>
      </div>
    </>
  );
}
