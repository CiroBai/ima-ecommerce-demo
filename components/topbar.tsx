"use client";

interface TopbarProps {
  credits?: number;
}

export function Topbar({ credits = 365 }: TopbarProps) {
  return (
    <div className="topbar">
      <div className="credits-badge">✦ {credits} 积分</div>
    </div>
  );
}
