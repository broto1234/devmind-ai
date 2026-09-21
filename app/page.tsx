"use client";

import { useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Home() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!message.trim()) return;

    setLoading(true);

    const userMessage: Message = {
      role: "user",
      content: message,
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    setMessage("");

    setMessages((previous) => [
      ...previous,
      {
        role: "assistant",
        content: "",
      },
    ]);

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: userMessage.content,
        conversationId,
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
    let content = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      const chunk = decoder.decode(value, {
        stream: true,
      });

      if (chunk.startsWith("event: interaction")) {
        const dataLine = chunk
          .split("\n")
          .find((line) => line.startsWith("data:"));

        if (dataLine) {
          const data = JSON.parse(dataLine.replace("data:", "").trim());

          setConversationId(data.id);
        }
      }

      if (chunk.startsWith("event: text")) {
        const dataLine = chunk
          .split("\n")
          .find((line) => line.startsWith("data:"));

        if (dataLine) {
          const text = JSON.parse(
            dataLine.replace("data:", "").trim(),
          );

          content += text;

          setMessages((previous) =>
            previous.map((msg, index) => {
              if (index === previous.length - 1) {
                return {
                  ...msg,
                  content,
                };
              }

              return msg;
            }),
          );
        }
      }
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

      <div className="mt-8 space-y-4">
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>
              {msg.role === "user" ? "You" : "DevMind AI"}
            </strong>

            <p className="whitespace-pre-wrap">
              {msg.content}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}