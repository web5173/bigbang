/**
 * 支付宝小程序云函数实现 (JavaScript版)
 * 支持白名单优先匹配，例：红992袋
 * 支持中文数字转换（一/半/两），例：一: 1, 半: 0.5, 两: 2
 * 多分隔符处理
 */
const SPECIAL_ITEMS = ["红99"];
const SEPARATOR_REGEX = /[，、。；：,;]/;
const SPECIAL_REGEX = /^(半|\d+\.?\d*|两|一)(.*)$/;
const GENERAL_REGEX = /^(.*?)(半|\d+\.?\d*|两|一)([\u4e00-\u9fa5]*)$/;

const parseQuantity = (q = "") => {
  const map = { '半': 0.5, '两': 2, '一': 1 };
  return map[q] ?? (q ? +q || 1 : 1);
};

const parseItems = (text) => {
  return text.split(SEPARATOR_REGEX).flatMap((segment) => {
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
};

// 支付宝小程序云函数入口
exports.main = async (event, context) => {
  try {
    const { text } = event;
    if (!text || !text?.trim()) {
      return { error: "请求体不能为空" }
    }
    return JSON.stringify(parseItems(text.trim()))
  } catch (error) {
    return { error: "服务器内部错误" }
  }
};