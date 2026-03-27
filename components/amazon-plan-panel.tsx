"use client";

import { AmazonImageSlot, buildAmazonPlan } from "@/lib/amazon-planner";
import { useState } from "react";

interface AmazonPlanPanelProps {
  category: string;
  onSelectSlot?: (slot: AmazonImageSlot) => void;
  selectedSlot?: number;
}

export function AmazonPlanPanel({ category, onSelectSlot, selectedSlot }: AmazonPlanPanelProps) {
  const plan = buildAmazonPlan(category, "商品");

  return (
    <div className="amazon-plan-panel">
      <div className="plan-header">
        <div className="plan-icon">🛒</div>
        <div>
          <div className="plan-title">Amazon MVP 套图规划</div>
          <div className="plan-sub">推荐 {plan.totalSlots} 图套组 · 高转化上架方案</div>
        </div>
      </div>

      <div className="plan-slots">
        {plan.slots.map((slot) => (
          <div
            key={slot.slot}
            className={`plan-slot ${selectedSlot === slot.slot ? "selected" : ""}`}
            onClick={() => onSelectSlot?.(slot)}
          >
            <div className="slot-num">{slot.slot}</div>
            <div className="slot-info">
              <div className="slot-name">{slot.name}</div>
              <div className="slot-desc">{slot.description}</div>
            </div>
            <div className="slot-meta">
              <span className={`slot-badge ${slot.priority}`}>{
                slot.priority === "required" ? "必须" : "推荐"
              }</span>
              <span className="slot-size">{slot.aspectRatio}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="plan-notes">
        <div className="notes-title">📋 Amazon 规范提示</div>
        {plan.notes.slice(0, 3).map((note, i) => (
          <div key={i} className="note-item">• {note}</div>
        ))}
      </div>
    </div>
  );
}
