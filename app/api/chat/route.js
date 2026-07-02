function buildSystem(level) {
  const lvMap = {
    beginner: "A1–A2: use very simple words and short sentences. Focus only on the most critical error.",
    intermediate: "B1–B2: conversational English, grammar errors expected. Correct up to 2 errors.",
    advanced: "C1–C2: near-native. Focus on nuance, idioms, style. Correct subtle mistakes.",
  };
  return `You are an enthusiastic, warm English tutor for Atena Learning English School. Student level: ${lvMap[level] || lvMap["intermediate"]}

YOUR TASKS:
1. CHAT naturally — ask follow-up questions, share opinions, keep the conversation going.
2. CORRECT errors — if there are mistakes, add this block AFTER your reply:
[CORRECTIONS]
WRONG: "original text" | RIGHT: "corrected version" | WHY: brief reason
[/CORRECTIONS]
Only the most important errors. Never more than 2 corrections per message.
3. SUGGEST better expressions naturally inside your reply ("You could also say…").
4. ENCOURAGE genuinely — celebrate good vocabulary, good grammar, interesting ideas.
5. AWARD POINTS — if the student used great English, add [POINTS:X] (1–5) at the very end.

TONE: Warm, fun, patient — like a native-speaking friend who teaches. Always end with an engaging question.`;
}

export async function POST(req) {
  try {
    const { messages, level } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: "Invalid messages" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`;

    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const body = {
      system_instruction: { parts: [{ text: buildSystem(level || "intermediate") }] },
      contents,
      generationConfig: { maxOutputTokens: 1000, temperature: 0.9 },
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Gemini API error");

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return Response.json({ text });

  } catch (err) {
    console.error(err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
