import { prisma } from "@/app/lib/prisma";
import { generateEmbedding } from "@/app/lib/embeddings/generateEmbedding";

export type SearchResult = {
  id: string;
  documentId: string;
  content: string;
  chunkIndex: number;
  distance: number;
};

export async function searchChunks(query: string) {
  // 1. Create an embedding for the user's question
  const queryEmbedding = await generateEmbedding(query);

  // 2. Convert the vector to pgvector format
  const embeddingLiteral = `[${queryEmbedding.join(",")}]`;

  // 3. Find the closest chunks
  const results = await prisma.$queryRaw<SearchResult[]>`
    SELECT
      "id",
      "documentId",
      "content",
      "chunkIndex",
      "embedding" <=> ${embeddingLiteral}::halfvec(3072) AS distance
    FROM "DocumentChunk"
    WHERE "embedding" <=> ${embeddingLiteral}::halfvec(3072) < 0.2
    ORDER BY "embedding" <=> ${embeddingLiteral}::halfvec(3072) ASC
    LIMIT 5
  `;

  return results;
}