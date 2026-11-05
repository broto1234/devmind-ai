import { GoogleGenAI } from "@google/genai";
import { cosineSimilarity } from "@/app/lib/embeddings/cosine";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST() {
  const textA =
    "task: sentence similarity | query: I love programming with TypeScript.";

  const textB =
    "task: sentence similarity | query: TypeScript is my favorite programming language.";

  const responseA = await ai.models.embedContent({
    model: "gemini-embedding-2",
    contents: textA,
  });

  const responseB = await ai.models.embedContent({
    model: "gemini-embedding-2",
    contents: textB,
  });

  const vectorA = responseA.embeddings[0].values;
  const vectorB = responseB.embeddings[0].values;

  const similarity = cosineSimilarity(
    vectorA,
    vectorB,
  );

  return Response.json({
    similarity,
  });
}