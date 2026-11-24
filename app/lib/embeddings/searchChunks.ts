import { prisma } from "@/app/lib/prisma";
import { generateEmbedding } from "@/app/lib/embeddings/generateEmbedding";

export type SearchResult = {
  id: string;
  documentId: string;
  content: string;
  chunkIndex: number;
  distance: number;
};

export async function searchChunks(query: string, userId: string) {

  // 1. Create an embedding for the user's question
  const queryEmbedding = await generateEmbedding(query);

  // 2. Convert the vector to pgvector format
  const embeddingLiteral = `[${queryEmbedding.join(",")}]`;

  // 3. Find the closest chunks
  const results = await prisma.$queryRaw<SearchResult[]>`
    SELECT
      chunk."id",
      chunk."documentId",
      chunk."content",
      chunk."chunkIndex",
      chunk."embedding" <=> ${embeddingLiteral}::halfvec(3072) AS distance
    FROM "DocumentChunk" AS chunk
    INNER JOIN "Document" AS document
      ON chunk."documentId" = document."id"
    WHERE document."userId" = ${userId}
      AND chunk."embedding" <=> ${embeddingLiteral}::halfvec(3072) < 0.2
    ORDER BY chunk."embedding" <=> ${embeddingLiteral}::halfvec(3072) ASC
    LIMIT 5
  `;

  return results;
}