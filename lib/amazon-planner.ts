/**
 * Amazon Image Planning Logic
 * Based on amazon-ecommerce-image-suite skill
 */

export interface AmazonImageSlot {
  slot: number;
  type: string;
  name: string;
  description: string;
  purpose: string;
  aspectRatio: string;
  minSize: string;
  promptTemplate: string;
  priority: "required" | "recommended" | "optional";
}

export interface AmazonImagePlan {
  category: string;
  platform: string;
  totalSlots: number;
  slots: AmazonImageSlot[];
  notes: string[];
}

/**
 * MVP 5-image Amazon suite for a given product category
 */
const MVP_PLANS: Record<string, AmazonImageSlot[]> = {
  default: [
    {
      slot: 1,
      type: "main_image",
      name: "主图 (Main Image)",
      description: "纯白背景，商品占图片面积 85% 以上，无文字/logo",
      purpose: "搜索结果首图，决定点击率",
      aspectRatio: "1:1",
      minSize: "2000×2000px",
      promptTemplate:
        "{product}, pure white background, studio lighting, product photography, sharp focus, professional, clean, no text, no watermark, high resolution 2000x2000",
      priority: "required",
    },
    {
      slot: 2,
      type: "selling_point",
      name: "卖点图 (Selling Point)",
      description: "产品正面+核心卖点文字标注（3-5个）",
      purpose: "展示核心差异化功能，提升加购率",
      aspectRatio: "1:1",
      minSize: "2000×2000px",
      promptTemplate:
        "{product}, clean white background, product showcase, highlighting key features, infographic style, professional ecommerce photography",
      priority: "required",
    },
    {
      slot: 3,
      type: "lifestyle",
      name: "场景图 (Lifestyle)",
      description: "真实使用场景，展示产品与用户生活的关联",
      purpose: "建立情感连接，降低退货率",
      aspectRatio: "1:1",
      minSize: "2000×2000px",
      promptTemplate:
        "{product} in use, lifestyle photography, natural setting, warm lighting, authentic feel, real-life scenario, cinematic quality",
      priority: "required",
    },
    {
      slot: 4,
      type: "detail",
      name: "细节图 (Detail Shot)",
      description: "产品局部特写，材质/工艺/纹理细节",
      purpose: "消除顾虑，减少退货",
      aspectRatio: "1:1",
      minSize: "2000×2000px",
      promptTemplate:
        "{product} close-up detail shot, macro photography, texture and material visible, ultra sharp, studio lighting, white background",
      priority: "recommended",
    },
    {
      slot: 5,
      type: "comparison",
      name: "对比图 (Comparison)",
      description: "尺寸参照/竞品对比/使用前后",
      purpose: "直观传达尺寸感/价值感",
      aspectRatio: "1:1",
      minSize: "2000×2000px",
      promptTemplate:
        "{product} size comparison, scale reference, white background, product photography, clear dimensions, professional studio shot",
      priority: "recommended",
    },
  ],

  服装: [
    {
      slot: 1,
      type: "main_image",
      name: "主图 — 正面平铺/模特",
      description: "纯白背景，商品完整展示，模特或平铺均可",
      purpose: "符合亚马逊规范，最大化搜索点击",
      aspectRatio: "1:1",
      minSize: "2000×2000px",
      promptTemplate:
        "{product} clothing, pure white background, flat lay or model wearing, full garment visible, sharp focus, professional fashion photography, no wrinkles",
      priority: "required",
    },
    {
      slot: 2,
      type: "lifestyle",
      name: "穿搭场景图",
      description: "模特户外/室内真实场景穿搭",
      purpose: "展示上身效果，建立购买欲",
      aspectRatio: "1:1",
      minSize: "2000×2000px",
      promptTemplate:
        "model wearing {product}, lifestyle fashion photography, natural outdoor/indoor setting, editorial style, warm lighting, authentic lifestyle",
      priority: "required",
    },
    {
      slot: 3,
      type: "detail",
      name: "面料/工艺细节",
      description: "面料纹理、缝线、纽扣等细节特写",
      purpose: "展示质量，消除品质顾虑",
      aspectRatio: "1:1",
      minSize: "2000×2000px",
      promptTemplate:
        "{product} fabric detail close-up, macro photography, texture and stitching visible, white or neutral background, sharp focus",
      priority: "required",
    },
    {
      slot: 4,
      type: "multi_angle",
      name: "多角度展示",
      description: "正面/侧面/背面三视角",
      purpose: "全方位展示款式设计",
      aspectRatio: "1:1",
      minSize: "2000×2000px",
      promptTemplate:
        "{product} multiple angles - front, side, and back view, white background, flat lay fashion photography, showing complete garment design",
      priority: "recommended",
    },
    {
      slot: 5,
      type: "size_chart",
      name: "尺码对照",
      description: "尺码表+模特身材参数",
      purpose: "减少尺码退货",
      aspectRatio: "1:1",
      minSize: "2000×2000px",
      promptTemplate:
        "{product} size chart infographic, clean white background, measurement guide, professional layout, easy to read",
      priority: "recommended",
    },
  ],

  美妆护肤: [
    {
      slot: 1,
      type: "main_image",
      name: "产品主图",
      description: "纯白背景，产品正面，标签清晰",
      purpose: "亚马逊主图规范，高清展示",
      aspectRatio: "1:1",
      minSize: "2000×2000px",
      promptTemplate:
        "{product} beauty product, pure white background, studio photography, product facing forward, label clearly visible, professional beauty photography",
      priority: "required",
    },
    {
      slot: 2,
      type: "lifestyle",
      name: "使用场景图",
      description: "浴室/化妆台场景，真实使用环境",
      purpose: "建立生活方式关联",
      aspectRatio: "1:1",
      minSize: "2000×2000px",
      promptTemplate:
        "{product} beauty product in bathroom/vanity setting, lifestyle photography, clean aesthetic, soft natural lighting, skincare/beauty routine atmosphere",
      priority: "required",
    },
    {
      slot: 3,
      type: "ingredient",
      name: "成分/配方卖点",
      description: "核心成分视觉化展示",
      purpose: "建立功效信任感",
      aspectRatio: "1:1",
      minSize: "2000×2000px",
      promptTemplate:
        "{product} with key ingredients visualization, clean minimalist layout, white background, scientific beauty aesthetic, ingredient showcase",
      priority: "required",
    },
    {
      slot: 4,
      type: "texture",
      name: "质地/效果展示",
      description: "产品质地特写，涂抹效果",
      purpose: "直观感受产品体验",
      aspectRatio: "1:1",
      minSize: "2000×2000px",
      promptTemplate:
        "{product} texture swatch, beauty product consistency, close-up macro, cream/serum texture on clean surface, soft lighting, pastel background",
      priority: "recommended",
    },
    {
      slot: 5,
      type: "before_after",
      name: "效果对比",
      description: "使用前后皮肤对比（如适用）",
      purpose: "强化功效信任，提升转化",
      aspectRatio: "1:1",
      minSize: "2000×2000px",
      promptTemplate:
        "{product} skincare results, before and after comparison infographic, clean clinical aesthetic, professional layout, white background",
      priority: "recommended",
    },
  ],
};

export function getCategoryPlan(category: string): AmazonImageSlot[] {
  return MVP_PLANS[category] || MVP_PLANS.default;
}

export function buildAmazonPlan(
  category: string,
  productName: string
): AmazonImagePlan {
  const slots = getCategoryPlan(category);

  return {
    category,
    platform: "Amazon",
    totalSlots: slots.length,
    slots: slots.map((s) => ({
      ...s,
      promptTemplate: s.promptTemplate.replace(/\{product\}/g, productName || "product"),
    })),
    notes: [
      "主图必须纯白背景（RGB 255,255,255），商品占比 ≥ 85%",
      "所有图片最小 1000px，推荐 2000×2000px",
      "图片格式：JPG 或 TIFF，色彩模式 sRGB",
      "禁止包含：图片外框、颜色背景（主图）、水印、推广文字",
      "推荐先生成主图，确认满意后再扩展套图",
    ],
  };
}

export function generatePromptForSlot(
  slot: AmazonImageSlot,
  category: string,
  style: string,
  platform: string
): string {
  let basePrompt = slot.promptTemplate;

  // Add style modifiers
  const styleModifiers: Record<string, string> = {
    极简清爽: "minimalist, clean, airy, soft shadows",
    大胆鲜明: "bold colors, high contrast, dynamic, vibrant",
    奢华高端: "luxury, premium, sophisticated, high-end, elegant",
    自然质朴: "natural, organic, earthy tones, authentic",
    柔和粉彩: "pastel colors, soft, gentle, feminine aesthetic",
  };

  if (style && styleModifiers[style]) {
    basePrompt += `, ${styleModifiers[style]}`;
  }

  // Add platform-specific requirements
  if (platform === "亚马逊" && slot.type === "main_image") {
    basePrompt += ", pure white background RGB(255,255,255), product takes up 85% of frame";
  }

  return basePrompt;
}
