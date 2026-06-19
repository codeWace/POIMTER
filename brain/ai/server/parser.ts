// brain/ai/server/parser.ts

export function extractJSON(text: string) {
  try {
    // find first { ... } block
    const match = text.match(/\{[\s\S]*\}/);

    if (!match) return null;

    return JSON.parse(match[0]);
  } catch (err) {
    console.error("Failed to parse JSON:", err);
    return null;
  }
}