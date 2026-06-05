import { createServer } from "node:http";

const PORT = Number(process.env.PORT || 8787);
const POLZA_API_KEY = process.env.POLZA_API_KEY || "";
const POLZA_MODEL = process.env.POLZA_MODEL || "openai/gpt-4o";
const POLZA_URL = "https://polza.ai/api/v1/chat/completions";

const overlayLabels = {
  phi: "золотое сечение",
  thirds: "правило третей",
  contrast: "контраст",
  blindness: "баннерная слепота",
};

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 12_000_000) {
        request.destroy();
        reject(new Error("Слишком большой запрос"));
      }
    });

    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Некорректный JSON"));
      }
    });

    request.on("error", reject);
  });
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(payload));
}

function parseResult(text) {
  const normalizedText = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  const jsonMatch = normalizedText.match(/\{[\s\S]*\}/);

  try {
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : normalizedText);
    return {
      summary: String(parsed.summary || "Короткий вывод не получен"),
      score: Math.max(0, Math.min(100, Number(parsed.score || 0))),
      strengths: normalizeList(parsed.strengths),
      issues: normalizeList(parsed.issues),
      actions: normalizeList(parsed.actions),
    };
  } catch {
    return {
      summary: text.slice(0, 220),
      score: 60,
      strengths: [],
      issues: [],
      actions: [text],
    };
  }
}

function parsePaletteResult(text) {
  const normalizedText = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  const jsonMatch = normalizedText.match(/\{[\s\S]*\}/);
  const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : normalizedText);
  const palettes = Array.isArray(parsed.palettes) ? parsed.palettes : [];

  return {
    palettes: palettes.slice(0, 3).map((palette, index) => ({
      id: `ai-${Date.now()}-${index}`,
      name: String(palette.name || `Вариант ${index + 1}`).slice(0, 32),
      role: String(palette.role || "сбалансированная палитра для сайта").slice(0, 90),
      colors: normalizeColors(palette.colors || {}),
    })),
  };
}

function normalizeList(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => String(item).trim()).filter(Boolean).slice(0, 5);
}

function normalizeColors(colors) {
  return {
    bg: normalizeHex(colors.bg, "#f6f7f3"),
    surface: normalizeHex(colors.surface, "#ffffff"),
    text: normalizeHex(colors.text, "#18231d"),
    muted: normalizeHex(colors.muted, "#657266"),
    primary: normalizeHex(colors.primary, "#276f50"),
    secondary: normalizeHex(colors.secondary, "#dceee5"),
    accent: normalizeHex(colors.accent, "#bd6b3b"),
  };
}

function normalizeHex(value, fallback) {
  const next = String(value || "").trim();
  return /^#[0-9a-f]{6}$/i.test(next) ? next : fallback;
}

async function analyze(body) {
  if (!POLZA_API_KEY) {
    throw new Error("POLZA_API_KEY не настроен на сервере");
  }

  const overlay = overlayLabels[body.overlay] || "композиционную сетку";
  const imageUrl = body.imageDataUrl || body.screenshotUrl || null;
  const targetUrl = body.targetUrl || "скриншот без ссылки";
  const userContent = [
    {
      type: "text",
      text: [
        `Проанализируй сайт: ${targetUrl}.`,
        `Активная проверка: ${overlay}.`,
        "Дай конкретные рекомендации по визуальному дизайну: композиция, иерархия, CTA, контраст, плотность, читаемость, адаптивность.",
        "Если видишь только URL без изображения, так и скажи и дай осторожные рекомендации.",
        "Ответь строго JSON без markdown по схеме: {\"summary\":\"...\",\"score\":0-100,\"strengths\":[\"...\"],\"issues\":[\"...\"],\"actions\":[\"...\"]}.",
      ].join(" "),
    },
  ];

  if (imageUrl) {
    userContent.push({
      type: "image_url",
      image_url: { url: imageUrl },
    });
  }

  const polzaResponse = await fetch(POLZA_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${POLZA_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: POLZA_MODEL,
      messages: [
        {
          role: "system",
          content:
            "Ты строгий UX/UI-дизайнер. Пиши по-русски, коротко, предметно, без общих советов.",
        },
        {
          role: "user",
          content: userContent,
        },
      ],
      max_tokens: 900,
      temperature: 0.35,
    }),
  });

  const data = await polzaResponse.json().catch(() => null);
  if (!polzaResponse.ok) {
    throw new Error(data?.error?.message || `Polza вернул ${polzaResponse.status}`);
  }

  return parseResult(data?.choices?.[0]?.message?.content || "");
}

async function createPalettes(body) {
  if (!POLZA_API_KEY) {
    throw new Error("POLZA_API_KEY не настроен на сервере");
  }

  const prompt = String(body.prompt || "").trim().slice(0, 500);
  const mood = String(body.mood || "").trim().slice(0, 80);
  if (prompt.length < 3) {
    throw new Error("Опишите проект чуть подробнее");
  }

  const polzaResponse = await fetch(POLZA_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${POLZA_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: POLZA_MODEL,
      messages: [
        {
          role: "system",
          content:
            "Ты senior UI-дизайнер. Подбирай практичные веб-палитры. Все названия и описания пиши на русском языке.",
        },
        {
          role: "user",
          content: [
            `Проект: ${prompt}.`,
            `Настроение: ${mood || "не задано"}.`,
            "Сгенерируй 3 разные палитры для сайта.",
            "Поля name и role обязательно должны быть на русском языке.",
            "Каждая палитра должна иметь понятное применение и 7 HEX-цветов: bg, surface, text, muted, primary, secondary, accent.",
            "Проверь, чтобы text читался на bg/surface, primary подходил для CTA, accent не спорил с primary.",
            "Ответь строго JSON без markdown: {\"palettes\":[{\"name\":\"...\",\"role\":\"...\",\"colors\":{\"bg\":\"#...\",\"surface\":\"#...\",\"text\":\"#...\",\"muted\":\"#...\",\"primary\":\"#...\",\"secondary\":\"#...\",\"accent\":\"#...\"}}]}",
          ].join(" "),
        },
      ],
      max_tokens: 900,
      temperature: 0.62,
    }),
  });

  const data = await polzaResponse.json().catch(() => null);
  if (!polzaResponse.ok) {
    throw new Error(data?.error?.message || `Polza вернул ${polzaResponse.status}`);
  }

  const result = parsePaletteResult(data?.choices?.[0]?.message?.content || "");
  if (!result.palettes.length) {
    throw new Error("AI не вернул палитры");
  }
  return result;
}

createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    sendJson(response, 204, {});
    return;
  }

  if (!request.url?.startsWith("/api/ai/") || request.method !== "POST") {
    sendJson(response, 404, { error: "Not found" });
    return;
  }

  try {
    const body = await readJson(request);
    const result =
      request.url === "/api/ai/palettes" ? await createPalettes(body) : await analyze(body);
    sendJson(response, 200, result);
  } catch (error) {
    sendJson(response, 500, {
      error: error instanceof Error ? error.message : "AI proxy error",
    });
  }
}).listen(PORT, "127.0.0.1", () => {
  console.log(`Polza proxy listening on http://127.0.0.1:${PORT}`);
});
