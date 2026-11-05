import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await ai.models.embedContent({
      model: "gemini-embedding-2",
      contents: body.text,
    });

    return Response.json({
      embedding: response.embeddings,
    });
  } catch (error) {
    console.error("Embedding error:", error);

    return Response.json(
      {
        error: "Embedding generation failed",
      },
      {
        status: 500,
      },
    );
  }
}