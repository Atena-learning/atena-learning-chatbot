import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function buildSystem(level) {
  const lvMap = {
    beginner:
      "A1–A2: use very simple words and short sentences. Focus only on the most critical error.",
    intermediate:
      "B1–B2: conversational English, grammar errors expected. Correct up to 2 errors.",
    advanced:
      "C1–C2: near-native. Focus on nuance, idioms, style. Correct subtle mistakes.",
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

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: buildSystem(level || "intermediate"),
    });

    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
    const lastMessage = messages[messages.length - 1];

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastMessage.content);
    const text = result.response.text();

    return Response.json({ text });
  } catch (err) {
    console.error(err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
