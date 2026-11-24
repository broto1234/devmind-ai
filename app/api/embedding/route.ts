import { GoogleGenAI } from "@google/genai";
import { getCurrentUser } from "@/app/lib/auth/session";
import { embeddingSchema } from "@/app/lib/embeddings/embeddingSchema";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(request: Request) {
  try {

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

    const validationResult = embeddingSchema.safeParse(body);

    if (!validationResult.success) {
      return Response.json(
        { error: "Invalid embedding data" },
        { status: 400 },
      );
    }

    const response = await ai.models.embedContent({
      model: "gemini-embedding-2",
      contents: validationResult.data.text,
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