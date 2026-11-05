import { prisma } from "@/app/lib/prisma";
import { generateEmbedding } from "@/app/lib/embeddings/generateEmbedding";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  const body = await request.json();

  const { documentId, content } = body;

  // 1. Generate the embedding from the chunk text
  const embedding = await generateEmbedding(content);

  // 2. Convert the number[] into pgvector's input format
  const embeddingLiteral = `[${embedding.join(",")}]`;

  // 3. Create an ID for the chunk
  const id = randomUUID();

  // 4. Insert the chunk using parameterized SQL
  await prisma.$executeRaw`
    INSERT INTO "DocumentChunk"
      ("id", "documentId", "content", "chunkIndex", "embedding")
    VALUES
      (
        ${id},
        ${documentId},
        ${content},
        0,
        ${embeddingLiteral}::halfvec(3072)
      )
  `;

  return Response.json({
    message: "Document chunk created",
    id,
  });
}