import { generateEmbedding } from "@/app/lib/embeddings/generateEmbedding";

export async function POST(request: Request) {
  const body = await request.json();

  const embedding = await generateEmbedding(body.text);

  return Response.json({
    length: embedding.length,
    embedding,
  });
}