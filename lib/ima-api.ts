/**
 * IMA Studio API Client
 * Implements the full API flow from ima_image_create.py
 */

import crypto from "crypto";

const BASE_URL = "https://api.imastudio.com";
const IM_BASE_URL = "https://imapi.liveme.com";

// App Key configuration for OSS upload authentication
const APP_ID = "webAgent";
const APP_KEY = "32jdskjdk320eew";

function makeHeaders(apiKey: string): Record<string, string> {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "x-app-source": "ima_skills",
    x_app_language: "en",
  };
}

function genSign(): { sign: string; timestamp: string; nonce: string } {
  const nonce = crypto.randomBytes(10).toString("hex").slice(0, 21);
  const ts = Math.floor(Date.now() / 1000).toString();
  const raw = `${APP_ID}|${APP_KEY}|${ts}|${nonce}`;
  const sign = crypto.createHash("sha1").update(raw).digest("hex").toUpperCase();
  return { sign, timestamp: ts, nonce };
}

export interface UploadTokenResult {
  ful: string;
  fdl: string;
}

/**
 * Step 1: Get presigned upload URL from IM platform
 */
export async function getUploadToken(
  apiKey: string,
  suffix: string,
  contentType: string
): Promise<UploadTokenResult> {
  const { sign, timestamp, nonce } = genSign();

  const params = new URLSearchParams({
    appUid: apiKey,
    appId: APP_ID,
    appKey: APP_KEY,
    cmimToken: apiKey,
    sign,
    timestamp,
    nonce,
    fService: "privite",
    fType: "picture",
    fSuffix: suffix,
    fContentType: contentType,
  });

  const url = `${IM_BASE_URL}/api/rest/oss/getuploadtoken?${params}`;
  const resp = await fetch(url, { method: "GET" });
  if (!resp.ok) {
    throw new Error(`Upload token request failed: ${resp.status}`);
  }
  const data = await resp.json();
  if (data.code !== 0 && data.code !== 200) {
    throw new Error(`Upload token failed: ${data.message}`);
  }
  return data.data as UploadTokenResult;
}

/**
 * Step 2: Upload image bytes to presigned OSS URL
 */
export async function uploadToOss(
  imageBytes: Uint8Array,
  contentType: string,
  ful: string
): Promise<void> {
  const resp = await fetch(ful, {
    method: "PUT",
    body: imageBytes as unknown as BodyInit,
    headers: { "Content-Type": contentType },
  });
  if (!resp.ok) {
    throw new Error(`OSS upload failed: ${resp.status}`);
  }
}

/**
 * Full upload flow: file bytes → CDN URL
 */
export async function uploadImageToCdn(
  imageBytes: Uint8Array,
  contentType: string,
  apiKey: string
): Promise<string> {
  // Determine suffix
  const suffixMap: Record<string, string> = {
    "image/jpeg": "jpeg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
  };
  const suffix = suffixMap[contentType] || "jpeg";

  const tokenData = await getUploadToken(apiKey, suffix, contentType);
  await uploadToOss(imageBytes, contentType, tokenData.ful);
  return tokenData.fdl;
}

export interface ProductNode {
  id: string;
  type: string;
  name: string;
  model_id: string;
  form_config?: FormField[];
  credit_rules?: CreditRule[];
  children?: ProductNode[];
}

export interface FormField {
  field: string;
  value?: unknown;
  is_ui_virtual?: boolean;
  ui_params?: unknown[];
  value_mapping?: { mapping_rules?: MappingRule[] };
}

export interface MappingRule {
  source_values: Record<string, unknown>;
  target_value: unknown;
}

export interface CreditRule {
  attribute_id: number;
  points: number;
  attributes?: Record<string, string>;
}

export interface ModelParams {
  attribute_id: number;
  credit: number;
  model_id: string;
  model_name: string;
  model_version: string;
  form_params: Record<string, unknown>;
  all_credit_rules: CreditRule[];
}

/**
 * GET /open/v1/product/list
 */
export async function getProductList(
  apiKey: string,
  category: string
): Promise<ProductNode[]> {
  const params = new URLSearchParams({
    app: "ima",
    platform: "web",
    category,
  });
  const url = `${BASE_URL}/open/v1/product/list?${params}`;
  const resp = await fetch(url, {
    headers: makeHeaders(apiKey),
    next: { revalidate: 300 }, // cache 5 min
  });
  if (!resp.ok) {
    throw new Error(`Product list failed: ${resp.status}`);
  }
  const data = await resp.json();
  if (data.code !== 0 && data.code !== 200) {
    throw new Error(`Product list error: ${data.message}`);
  }
  return data.data || [];
}

function resolveVirtualParam(field: FormField): Record<string, unknown> {
  const { field: fieldName, ui_params, value_mapping, value } = field;
  if (!fieldName) return {};

  const uiParams = ui_params || [];
  const mappingRules = value_mapping?.mapping_rules || [];

  if (uiParams.length > 0 && mappingRules.length > 0) {
    const patch: Record<string, unknown> = {};
    for (const ui of uiParams as Array<{ field?: string; id?: string; value?: unknown }>) {
      const uiField = ui.field || ui.id || "";
      patch[uiField] = ui.value;
    }
    for (const rule of mappingRules) {
      const source = rule.source_values || {};
      if (Object.entries(source).every(([k, v]) => patch[k] === v)) {
        return { [fieldName]: rule.target_value };
      }
    }
  }

  if (value !== undefined) return { [fieldName]: value };
  return {};
}

/**
 * Find model in product tree by model_id
 */
export function findModelVersion(
  tree: ProductNode[],
  targetModelId: string
): ProductNode | null {
  let found: ProductNode | null = null;

  function walk(nodes: ProductNode[]) {
    for (const node of nodes) {
      if (node.type === "3" && node.model_id === targetModelId) {
        found = node; // keep last (newest)
      }
      if (node.children) walk(node.children);
    }
  }

  walk(tree);
  return found;
}

/**
 * Extract model params from product node
 */
export function extractModelParams(node: ProductNode): ModelParams {
  const creditRules = node.credit_rules || [];
  if (creditRules.length === 0) {
    throw new Error(`No credit_rules for model ${node.model_id}`);
  }

  const formParams: Record<string, unknown> = {};
  for (const field of node.form_config || []) {
    if (!field.field) continue;
    if (field.is_ui_virtual) {
      Object.assign(formParams, resolveVirtualParam(field));
    } else if (field.value !== undefined) {
      formParams[field.field] = field.value;
    }
  }

  const selectedRule = creditRules[0];
  return {
    attribute_id: selectedRule.attribute_id,
    credit: selectedRule.points,
    model_id: node.model_id,
    model_name: node.name,
    model_version: node.id,
    form_params: formParams,
    all_credit_rules: creditRules,
  };
}

export interface CreateTaskOptions {
  apiKey: string;
  taskType: "text_to_image" | "image_to_image";
  modelParams: ModelParams;
  prompt: string;
  inputImages?: string[];
  extraParams?: Record<string, unknown>;
}

/**
 * POST /open/v1/tasks/create
 */
export async function createTask(options: CreateTaskOptions): Promise<string> {
  const { apiKey, taskType, modelParams, prompt, inputImages = [], extraParams = {} } = options;

  const inner: Record<string, unknown> = {
    ...modelParams.form_params,
    ...extraParams,
    prompt,
    n: Number(modelParams.form_params.n || 1),
    input_images: inputImages,
    cast: {
      points: modelParams.credit,
      attribute_id: modelParams.attribute_id,
    },
  };

  const payload = {
    task_type: taskType,
    enable_multi_model: false,
    src_img_url: inputImages,
    parameters: [
      {
        attribute_id: modelParams.attribute_id,
        model_id: modelParams.model_id,
        model_name: modelParams.model_name,
        model_version: modelParams.model_version,
        app: "ima",
        platform: "web",
        category: taskType,
        credit: modelParams.credit,
        parameters: inner,
      },
    ],
  };

  const resp = await fetch(`${BASE_URL}/open/v1/tasks/create`, {
    method: "POST",
    headers: makeHeaders(apiKey),
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    const errorText = await resp.text();
    throw new Error(`Task create failed: ${resp.status} ${errorText}`);
  }

  const data = await resp.json();
  if (data.code !== 0 && data.code !== 200) {
    throw new Error(`Task create error: code=${data.code} message=${data.message}`);
  }

  const taskId = data.data?.id;
  if (!taskId) throw new Error("No task_id in response");
  return taskId;
}

export interface PollResult {
  url: string;
  watermark_url?: string;
  cover_url?: string;
  taskId: string;
}

/**
 * POST /open/v1/tasks/detail — single poll, returns current state
 */
export async function pollTaskOnce(
  apiKey: string,
  taskId: string
): Promise<{ done: boolean; result?: PollResult; error?: string }> {
  const resp = await fetch(`${BASE_URL}/open/v1/tasks/detail`, {
    method: "POST",
    headers: makeHeaders(apiKey),
    body: JSON.stringify({ task_id: taskId }),
  });

  if (!resp.ok) {
    throw new Error(`Poll failed: ${resp.status}`);
  }

  const data = await resp.json();
  if (data.code !== 0 && data.code !== 200) {
    throw new Error(`Poll error: ${data.message}`);
  }

  const task = data.data || {};
  const medias: Array<{
    resource_status?: number | null;
    status?: string;
    url?: string;
    watermark_url?: string;
    cover_url?: string;
    error_msg?: string;
    remark?: string;
  }> = task.medias || [];

  const getStatus = (m: typeof medias[0]) => {
    const v = m.resource_status;
    return v === null || v === undefined ? 0 : Number(v);
  };

  // Check for failures
  for (const media of medias) {
    const rs = getStatus(media);
    if (rs === 2) {
      const err = media.error_msg || media.remark || "Generation failed";
      return { done: true, error: err };
    }
    if (rs === 3) {
      return { done: true, error: "Task was deleted" };
    }
  }

  // Check if all done
  if (medias.length > 0 && medias.every((m) => getStatus(m) === 1)) {
    for (const media of medias) {
      if (media.status?.toLowerCase() === "failed") {
        return { done: true, error: media.error_msg || "Generation failed" };
      }
    }
    const first = medias[0];
    const url = first.url || first.watermark_url || "";
    if (url) {
      return {
        done: true,
        result: {
          url,
          watermark_url: first.watermark_url,
          cover_url: first.cover_url,
          taskId,
        },
      };
    }
  }

  return { done: false };
}

/**
 * Full end-to-end generate flow with polling (server-side, for streaming)
 */
export async function generateImage(options: CreateTaskOptions): Promise<PollResult> {
  const apiKey = options.apiKey;

  // Resolve model params if not already loaded
  let modelParams = options.modelParams;

  // If model params aren't loaded, fetch them
  if (!modelParams.model_version) {
    const tree = await getProductList(apiKey, options.taskType);
    const node = findModelVersion(tree, modelParams.model_id);
    if (!node) throw new Error(`Model ${modelParams.model_id} not found`);
    modelParams = extractModelParams(node);
  }

  const taskId = await createTask({ ...options, modelParams });

  // Poll with timeout
  const maxWait = 600_000; // 10 min
  const interval = 5_000; // 5s
  const start = Date.now();

  while (Date.now() - start < maxWait) {
    await new Promise((r) => setTimeout(r, interval));
    const result = await pollTaskOnce(apiKey, taskId);
    if (result.done) {
      if (result.error) throw new Error(result.error);
      return result.result!;
    }
  }

  throw new Error("Task timed out after 10 minutes");
}
