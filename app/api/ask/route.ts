import { GoogleGenAI } from "@google/genai";
import { searchChunks } from "@/app/lib/embeddings/searchChunks";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(request: Request) {
  const body = await request.json();

  const { query } = body;

  const results = await searchChunks(query);

  if (results.length === 0) {
    return Response.json({
      answer: "I don't have enough information to answer that.",
    });
  }

  const context = results
    .map((result) => result.content)
    .join("\n\n");

  const prompt = `
  You are a helpful assistant answering questions using a provided context.

  Rules:
  - Answer only using information from the context.
  - Do not use outside knowledge.
  - Do not make up or guess information.
  - If the context does not contain enough information to answer the question, say:
    "I don't have enough information to answer that."

  Context:
  ${context}

  Question:
  ${query}
  `;

  const response = await ai.interactions.create({
    model: "gemini-3.6-flash",
    input: prompt,
  });

  return Response.json({
    answer: response.output_text,
  });
}