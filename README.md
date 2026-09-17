# bigbang

把中文购物清单文本解析成结构化条目的服务。

例如输入 `红992袋，白菜半斤`，输出：

```json
[
  { "name": "红99", "quantity": 2, "unit": "袋" },
  { "name": "白菜", "quantity": 0.5, "unit": "斤" }
]
```

## 特性

- 白名单优先匹配（如 `红992袋` 识别为「红99」而非「红992」）
- 中文数字转换：`一` → 1、`半` → 0.5、`两` → 2
- 支持多种分隔符：`，、。；：,;`
- 省略数量时默认为 1

## 实现

同一套解析逻辑的两个部署版本：

| 目录 | 运行环境 | 入口 |
| --- | --- | --- |
| `denoDeploy/bigbang` | Deno Deploy | `main.ts`（HTTP 接口，POST `{ text }`） |
| `支付宝小程序云` | 支付宝小程序云函数 | `main.js`（`exports.main`，入参 `{ text }`） |

本地调试：

```sh
cd denoDeploy/bigbang
deno task dev
```

