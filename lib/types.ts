export interface GenerationState {
  status: "idle" | "creating" | "polling" | "done" | "error";
  taskId?: string;
  resultUrl?: string;
  error?: string;
  elapsedMs?: number;
}

export interface WorkspaceConfig {
  category: string;
  platform: string;
  outputType: string;
  scene: string;
  ratio: string;
  style: string;
  prompt: string;
  uploadedImageUrl?: string;
  modelId: string;
}

export const MODELS = [
  { id: "doubao-seedream-4.5", name: "SeeDream 4.5", credits: 5, recommended: true },
  { id: "midjourney", name: "Midjourney", credits: 8 },
  { id: "gemini-3-pro-image", name: "Nano Banana Pro", credits: 15 },
] as const;

export const CATEGORIES = [
  { id: "服装", name: "服装", emoji: "👗", desc: "衣服、鞋子、配饰", hot: true },
  { id: "美妆护肤", name: "美妆护肤", emoji: "💄", desc: "护肤品、化妆品、美发", hot: true },
  { id: "数码电子", name: "数码电子", emoji: "📱", desc: "数码产品、音频、智能家居" },
  { id: "家居厨房", name: "家居厨房", emoji: "🏠", desc: "家具、装饰、厨具" },
  { id: "健康保健", name: "健康保健", emoji: "💪", desc: "保健品、健身器材" },
  { id: "食品饮料", name: "食品饮料", emoji: "🍵", desc: "零食、饮品、有机食品" },
  { id: "玩具母婴", name: "玩具母婴", emoji: "🧸", desc: "玩具、婴儿用品、益智" },
  { id: "宠物用品", name: "宠物用品", emoji: "🐾", desc: "宠物食品、用品" },
  { id: "珠宝首饰", name: "珠宝首饰", emoji: "💎", desc: "戒指、项链、手表" },
  { id: "运动户外", name: "运动户外", emoji: "⛷️", desc: "户外运动、露营装备" },
] as const;

export const PLATFORMS = [
  { id: "亚马逊", label: "🛒 亚马逊" },
  { id: "Shopify", label: "🟢 Shopify" },
  { id: "TikTok", label: "📱 TikTok 小店" },
  { id: "Instagram", label: "📸 Instagram" },
  { id: "自建站", label: "🌐 自建站" },
];

export const STYLES = [
  { id: "极简清爽", emoji: "✨" },
  { id: "大胆鲜明", emoji: "🔥" },
  { id: "奢华高端", emoji: "👑" },
  { id: "自然质朴", emoji: "🌿" },
  { id: "柔和粉彩", emoji: "🎀" },
  { id: "霓虹赛博", emoji: "🌃" },
];
