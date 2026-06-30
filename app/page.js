"use client";
import { useState, useRef, useEffect } from "react";

const TOPICS = [
  { label: "About me", msg: "Tell me about yourself" },
  { label: "Travel ✈️", msg: "Let's talk about travel" },
  { label: "Food 🍕", msg: "Let's talk about food" },
  { label: "Job interview 💼", msg: "Can we do a job interview practice?" },
  { label: "Movies 🎬", msg: "Let's talk about movies or series" },
  { label: "Challenge 🏆", msg: "Give me a fun English challenge!" },
];

function parseBot(raw) {
  let text = raw, corrections = [], points = 0;
  const cm = text.match(/\[CORRECTIONS\]([\s\S]*?)\[\/CORRECTIONS\]/i);
  if (cm) {
    text = text.replace(cm[0], "").trim();
    cm[1].trim().split("\n").forEach((line) => {
      const w = line.match(/WRONG:\s*"([^"]+)"/i);
      const r = line.match(/RIGHT:\s*"([^"]+)"/i);
      const y = line.match(/WHY:\s*(.+)/i);
      if (w && r) corrections.push({ wrong: w[1], right: r[1], why: y ? y[1].trim() : "" });
    });
  }
  const pm = text.match(/\[POINTS:(\d+)\]/i);
  if (pm) { points = parseInt(pm[1]); text = text.replace(pm[0], "").trim(); }
  return { text, corrections, points };
}

function BotBubble({ text, corrections, points }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <div style={styles.avatarBot}>A</div>
      <div>
        <div style={styles.bubbleBot} dangerouslySetInnerHTML={{ __html: text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\*(.*?)\*/g, "<em>$1</em>").replace(/\n/g, "<br>") }} />
        {corrections.map((c, i) => (
          <div key={i} style={styles.correctionBox}>
            <div style={styles.corrLabel}>✏️ Correction</div>
            <div>❌ <span style={{ textDecoration: "line-through", color: "#c0392b" }}>{c.wrong}</span> → ✅ <span style={{ color: "#1a7a4a", fontWeight: 600 }}>{c.right}</span></div>
            {c.why && <div style={{ fontSize: 12, marginTop: 4, color: "#777" }}>💡 {c.why}</div>}
          </div>
        ))}
        {points > 0 && (
          <div style={styles.praiseBox}>⭐ +{points} point{points > 1 ? "s" : ""}! Great job!</div>
        )}
      </div>
    </div>
  );
}

function UserBubble({ text }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", flexDirection: "row-reverse" }}>
      <div style={styles.avatarUser}>Me</div>
      <div style={styles.bubbleUser} dangerouslySetInnerHTML={{ __html: text.replace(/\n/g, "<br>") }} />
    </div>
  );
}

export default function Page() {
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState("intermediate");
  const [voiceStatus, setVoiceStatus] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);
  const recogRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  async function callAPI(userMsg, hist) {
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: hist, level }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "API error");
      const { text, corrections, points } = parseBot(data.text);
      setMessages((prev) => [...prev, { role: "bot", text, corrections, points }]);
      setHistory((prev) => [...prev, { role: "assistant", content: data.text }]);
      if (points > 0) setScore((s) => s + points);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "bot", text: `❌ Error: ${err.message}`, corrections: [], points: 0 }]);
    } finally {
      setLoading(false);
    }
  }

  function sendMessage(text) {
    const msg = (text || input).trim();
    if (!msg) return;
    setMessages((prev) => [...prev, { role: "user", text: msg }]);
    const newHist = [...history, { role: "user", content: msg }];
    setHistory(newHist);
    setInput("");
    callAPI(msg, newHist);
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  function toggleMic() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setVoiceStatus("⚠️ Use Chrome or Edge for speech recognition."); setTimeout(() => setVoiceStatus(""), 4000); return; }
    if (isRecording) { recogRef.current?.stop(); return; }
    const r = new SR();
    recogRef.current = r;
    r.lang = "en-US"; r.interimResults = true; r.continuous = false;
    r.onstart = () => { setIsRecording(true); setVoiceStatus("🎙️ Listening… speak in English!"); setInput(""); };
    r.onresult = (e) => { let t = ""; for (let i = e.resultIndex; i < e.results.length; i++) t += e.results[i][0].transcript; setInput(t); };
    r.onend = () => {
      setIsRecording(false); setVoiceStatus("");
      setInput((val) => { if (val.trim()) { setTimeout(() => sendMessage(val.trim()), 100); } return val; });
    };
    r.onerror = (e) => {
      setIsRecording(false);
      const msgs = { "not-allowed": "⚠️ Allow microphone access in your browser.", "no-speech": "🔇 No speech detected. Try again!" };
      setVoiceStatus(msgs[e.error] || "⚠️ Speech error: " + e.error);
      setTimeout(() => setVoiceStatus(""), 4000);
    };
    try { r.start(); } catch(e) { setVoiceStatus("⚠️ " + e.message); setTimeout(() => setVoiceStatus(""), 4000); }
  }

  const showChips = messages.length === 0;

  return (
    <div style={styles.page}>
      <div style={styles.app}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logo}>A</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>Atena Learning</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Your personal English tutor</div>
          </div>
          <div style={styles.statusDot} />
        </div>

        {/* Level bar */}
        <div style={styles.levelBar}>
          <label style={{ fontSize: 12, color: "#666" }}>My level:</label>
          <select value={level} onChange={(e) => setLevel(e.target.value)} style={styles.select}>
            <option value="beginner">Beginner (A1–A2)</option>
            <option value="intermediate">Intermediate (B1–B2)</option>
            <option value="advanced">Advanced (C1–C2)</option>
          </select>
          <div style={{ marginLeft: "auto", fontSize: 12, color: "#666" }}>⭐ Points: <span style={{ color: "#d4a853", fontWeight: 700 }}>{score}</span></div>
        </div>

        {/* Messages */}
        <div style={styles.messages}>
          {/* Welcome */}
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={styles.avatarBot}>A</div>
            <div>
              <div style={styles.bubbleBot}>
                Hey! 👋 Welcome to <strong>Atena Learning</strong>! I'm your personal English tutor.<br /><br />
                I'm here to <strong>chat</strong>, <strong>correct your mistakes</strong>, suggest better expressions, and cheer you on! 🎉<br /><br />
                Pick a topic below, type anything, or press 🎤 to practice your <strong>speaking</strong>!
              </div>
              {showChips && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                  {TOPICS.map((t) => (
                    <button key={t.label} style={styles.chip} onClick={() => sendMessage(t.msg)}>{t.label}</button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chat messages */}
          {messages.map((m, i) =>
            m.role === "user"
              ? <UserBubble key={i} text={m.text} />
              : <BotBubble key={i} text={m.text} corrections={m.corrections} points={m.points} />
          )}

          {/* Typing indicator */}
          {loading && (
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={styles.avatarBot}>A</div>
              <div style={{ ...styles.bubbleBot, padding: "12px 16px" }}>
                <span style={styles.dot} /><span style={{ ...styles.dot, animationDelay: "0.2s" }} /><span style={{ ...styles.dot, animationDelay: "0.4s" }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Voice status */}
        {voiceStatus && <div style={{ fontSize: 11, color: "#c0392b", textAlign: "center", padding: "2px 20px 6px", fontWeight: 500 }}>{voiceStatus}</div>}

        {/* Input */}
        <div style={styles.inputArea}>
          <button onClick={toggleMic} style={{ ...styles.iconBtn, ...(isRecording ? styles.micActive : {}) }} title="Speak in English">
            {isRecording ? "⏹" : "🎤"}
          </button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type in English… or press 🎤 to speak!"
            rows={1}
            style={styles.textarea}
          />
          <button onClick={() => sendMessage()} style={{ ...styles.iconBtn, background: "#1a3a5c", borderColor: "#1a3a5c", color: "#d4a853" }}>➤</button>
        </div>
      </div>

      <style>{`
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }
        @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(192,57,43,0)} 50%{box-shadow:0 0 0 6px rgba(192,57,43,0.2)} }
        button:hover { opacity: 0.88; }
        textarea:focus { outline: none; border-color: #1a3a5c !important; background: #fff !important; }
        select:focus { outline: none; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #ddd; border-radius: 4px; }
      `}</style>
    </div>
  );
}

const styles = {
  page: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 16 },
  app: { width: "100%", maxWidth: 720, display: "flex", flexDirection: "column", height: "92vh", maxHeight: 820, background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.12)" },
  header: { background: "#1a3a5c", padding: "14px 20px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 },
  logo: { width: 40, height: 40, borderRadius: "50%", background: "#d4a853", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, color: "#fff", flexShrink: 0 },
  statusDot: { width: 8, height: 8, borderRadius: "50%", background: "#4ade80", marginLeft: "auto", flexShrink: 0 },
  levelBar: { background: "#f8f9fa", padding: "8px 20px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #e9ecef", flexShrink: 0 },
  select: { fontSize: 12, padding: "4px 8px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: "pointer" },
  messages: { flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 },
  avatarBot: { width: 32, height: 32, borderRadius: "50%", background: "#1a3a5c", color: "#d4a853", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 },
  avatarUser: { width: 32, height: 32, borderRadius: "50%", background: "#d4a853", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 },
  bubbleBot: { padding: "10px 14px", borderRadius: "4px 16px 16px 16px", background: "#f1f3f5", fontSize: 14, lineHeight: 1.65, color: "#222", maxWidth: "78%" },
  bubbleUser: { padding: "10px 14px", borderRadius: "16px 4px 16px 16px", background: "#1a3a5c", color: "#fff", fontSize: 14, lineHeight: 1.65, maxWidth: "78%" },
  correctionBox: { background: "#fffbf0", borderLeft: "3px solid #d4a853", borderRadius: "0 8px 8px 0", padding: "8px 12px", fontSize: 13, marginTop: 6, color: "#333" },
  corrLabel: { fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", color: "#a07328", marginBottom: 4, textTransform: "uppercase" },
  praiseBox: { background: "#f0fdf4", borderLeft: "3px solid #2ecc71", borderRadius: "0 8px 8px 0", padding: "6px 10px", fontSize: 13, marginTop: 6, color: "#1a7a4a" },
  chip: { padding: "5px 13px", borderRadius: 20, border: "1px solid #1a3a5c", color: "#1a3a5c", fontSize: 12, cursor: "pointer", background: "transparent", fontFamily: "inherit" },
  inputArea: { padding: "12px 20px", borderTop: "1px solid #e9ecef", display: "flex", gap: 8, alignItems: "flex-end", flexShrink: 0, background: "#fff" },
  iconBtn: { width: 40, height: 40, borderRadius: "50%", border: "1px solid #ddd", background: "#f8f9fa", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, color: "#555" },
  micActive: { background: "#c0392b", borderColor: "#c0392b", color: "#fff", animation: "pulse 1s infinite" },
  textarea: { flex: 1, padding: "10px 14px", border: "1px solid #ddd", borderRadius: 20, fontSize: 14, fontFamily: "inherit", resize: "none", minHeight: 42, maxHeight: 100, lineHeight: 1.5, background: "#f8f9fa", color: "#333" },
  dot: { display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#aaa", margin: "0 2px", animation: "bounce 1.2s infinite" },
};
