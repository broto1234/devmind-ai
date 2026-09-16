"use client";

import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    setLoading(true);
    setAnswer("");

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
      }),
    });

    if (!response.ok) {
      setLoading(false);
      return;
    }

    const reader = response.body?.getReader();

    if (!reader) {
      setLoading(false);
      return;
    }

    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      const chunk = decoder.decode(value, {
        stream: true,
      });

      setAnswer((previous) => previous + chunk);
    }

    setLoading(false);
  }

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="mb-6 text-3xl font-bold">
        DevMind AI
      </h1>

      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        className="mb-4 w-full rounded border p-3"
        placeholder="Ask DevMind something..."
        rows={5}
      />

      <button
        onClick={sendMessage}
        disabled={loading || !message.trim()}
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? "Thinking..." : "Send"}
      </button>

      <div className="mt-8 whitespace-pre-wrap">
        {answer}
      </div>
    </main>
  );
}