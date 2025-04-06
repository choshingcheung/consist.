const API_KEY = import.meta.env.VITE_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

export async function classifyContentWithGemini({ url, title }) {
  const prompt = `
You are a digital productivity assistant helping users stay focused.

Given the current website URL and the page title, classify whether the content is:
- "distracting": likely entertainment, gaming, streaming, or celebrity content (e.g., YouTube videos about gaming, Netflix series)
- "productive": related to studying, work, education, coding, learning (e.g., Khan Academy, GitHub repositories, educational blogs)
- "neutral": general content not clearly distracting or productive (e.g., Wikipedia articles, news websites)

For YouTube:
- If the page is the homepage or search page, it is generally neutral and should not be blocked.
- If the page is a video page, classify as "distracting" if it involves gaming, entertainment, or celebrity content (e.g., "Gaming Live Streams", "Reacting to Videos").
- If the video is educational or related to learning (e.g., coding tutorials, educational content), classify as "productive".

Respond ONLY with one word: distracting, productive, or neutral.

Context:
URL: ${url}
Title: ${title}
`;

  const requestBody = {
    contents: [{ parts: [{ text: prompt }] }]
  };

  try {
    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    const data = await res.json();
    const textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text?.toLowerCase().trim();

    if (textResponse.includes("distracting")) return "distracting";
    if (textResponse.includes("productive")) return "productive";
    return "neutral";
  } catch (err) {
    console.error("Gemini API error:", err);
    return "neutral";
  }
}