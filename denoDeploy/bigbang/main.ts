/**
 * 支持白名单优先匹配，例：红992袋
 * 支持中文数字转换（一/半/两），例：一: 1, 半: 0.5, 两: 2
 * 多分隔符处理
 */
const headers = {
  "content-type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": "*",
};

type Item = { name: string; quantity: number; unit: string };
const SPECIAL_ITEMS = ["红99"] as const;
const SEPARATOR_REGEX = /[，、。；：,;]/;
const SPECIAL_REGEX = /^(半|\d+\.?\d*|两|一)(.*)$/;
const GENERAL_REGEX = /^(.*?)(半|\d+\.?\d*|两|一)([\u4e00-\u9fa5]*)$/;
const parseQuantity = (
  q = "",
): number => ({ 半: 0.5, 两: 2, 一: 1 }[q] ?? (q ? +q || 1 : 1));

const parseItems = (text: string): Item[] =>
  text.split(SEPARATOR_REGEX).flatMap((segment) => {
    const trimmed = segment.trim();
    if (!trimmed) return [];

    const specialItem = SPECIAL_ITEMS.find((item) => trimmed.startsWith(item));
    if (specialItem) {
      const rest = trimmed.slice(specialItem.length).trim();
      const match = rest.match(SPECIAL_REGEX);
      return match
        ? [{
          name: specialItem,
          quantity: parseQuantity(match[1]),
          unit: match[2].trim(),
        }]
        : [];
    }

    const match = trimmed.match(GENERAL_REGEX);
    return match
      ? [{
        name: match[1].trim(),
        quantity: parseQuantity(match[2]),
        unit: match[3].trim(),
      }]
      : [];
  });

const OPTIONS_HEADERS = {
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};
const handleError = (message: string, status = 400) =>
  Response.json({ error: message }, { status, headers });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: { ...headers, ...OPTIONS_HEADERS },
    });
  }
  if (req.method !== "POST") return handleError("只支持POST请求", 405);

  const contentType = req.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    return handleError("请求体必须为JSON格式");
  }

  try {
    const { text } = await req.json();
    if (!text?.trim()) return handleError("文本不能为空");
    return Response.json(parseItems(text.trim()), { headers });
  } catch {
    return handleError("请求参数解析失败");
  }
});