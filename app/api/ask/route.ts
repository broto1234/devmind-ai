import { GoogleGenAI } from "@google/genai";
import { searchChunks } from "@/app/lib/embeddings/searchChunks";
import { getCurrentUser } from "@/app/lib/auth/session";
import { askSchema } from "@/app/lib/embeddings/askSchema";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(request: Request) {

  const user = await getCurrentUser();

  if (!user) {
    return Response.json(
      { error: "Not authenticated" },
      { status: 401 },
    );
  }
  
  let body;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const result = askSchema.safeParse(body);

  if (!result.success) {
    return Response.json(
      { error: "Invalid request data" },
      { status: 400 },
    );
  }

  const { query } = result.data;

  const results = await searchChunks(query, user.id);

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