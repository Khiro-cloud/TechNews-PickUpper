const JAPANESE_PATTERN = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/;
const GEMINI_TRANSLATE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent";

function needsTranslation(text: string) {
  return !JAPANESE_PATTERN.test(text);
}

function buildPrompt(title: string) {
  return [
    "Translate the following English tech news headline into natural Japanese.",
    "Return only the translated headline.",
    "Do not add quotes.",
    `Headline: ${title}`,
  ].join("\n");
}

export async function translateTitle(title: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const normalized = title.trim();
  if (!normalized || !needsTranslation(normalized)) {
    return null;
  }

  const response = await fetch(GEMINI_TRANSLATE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: buildPrompt(normalized),
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        topP: 0.8,
        maxOutputTokens: 128,
      },
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{
          text?: string;
        }>;
      };
    }>;
  };

  const translated = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!translated || translated === normalized) {
    return null;
  }

  return translated.replace(/^["「]|["」]$/g, "").trim();
}
