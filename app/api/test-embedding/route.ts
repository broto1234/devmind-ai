import { generateEmbedding } from "@/app/lib/embeddings/generateEmbedding";
import { getCurrentUser } from "@/app/lib/auth/session";
import { testEmbeddingSchema } from "@/app/lib/embeddings/testEmbeddingSchema";

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


  const validationResult = testEmbeddingSchema.safeParse(body);

  if (!validationResult.success) {
    return Response.json(
      { error: "Invalid embedding data" },
      { status: 400 },
    );
  }

  try {
    const embedding = await generateEmbedding(
      validationResult.data.text,
    );

    return Response.json({
      length: embedding.length,
      embedding,
    });
  } catch (error) {
    console.error("Test embedding error:", error);

    return Response.json(
      { error: "Embedding generation failed" },
      { status: 500 },
    );
  }
}