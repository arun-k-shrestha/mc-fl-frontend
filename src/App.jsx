import { useState } from "react";
import "./App.css";

export default function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(
    ""
  );
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!question.trim()) return;

    setAnswer("");
    setLoading(true);

    try {
      const res = await fetch("https://mc-fl-r70x.onrender.com/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "text/event-stream",
        },
        body: JSON.stringify({ question }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      if (!res.body) {
        throw new Error("ReadableStream not supported or empty response body");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          const lines = part.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const text = line.slice(6);
              if (text !== "[DONE]") {
                setAnswer((prev) => prev + text);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      setAnswer("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleAsk();
    }
  };

  return (
    <div className="page">
      <div className="background-glow glow-1"></div>
      <div className="background-glow glow-2"></div>

      <main className="container">
        <section className="hero">
          <div className="nebula-wrapper">
            <div className="nebula-core"></div>
            <div className="nebula-ring ring-1"></div>
            <div className="nebula-ring ring-2"></div>
            <div className="nebula-ring ring-3"></div>
          </div>
        </section>
        <section className="qa-card">
          <div className="input-group">
            <input
              type="text"
              placeholder="Type your question..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button onClick={handleAsk} disabled={loading}>
              {loading ? "Thinking..." : "Ask"}
            </button>
          </div>

          <div className="answer-box">
            <span className="answer-label">Answer</span>
            <p>
              {answer}
              {loading && <span className="cursor">▌</span>}
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}