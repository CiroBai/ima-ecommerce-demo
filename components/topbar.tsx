"use client";

interface TopbarProps {
  credits?: number;
}

export function Topbar({ credits = 365 }: TopbarProps) {
  return (
    <div className="topbar">
      <div className="credits-badge">
        <span>✦</span>
        <span className="credits-text">{credits} 积分</span>
      </div>
    </div>
  );
}
