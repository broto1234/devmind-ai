import { prisma } from "@/app/lib/prisma";
import { chunkText } from "@/app/lib/chunking/chunkText";
import { generateEmbedding } from "@/app/lib/embeddings/generateEmbedding";
import { randomUUID } from "crypto";

type PreparedChunk = {
  content: string;
  chunkIndex: number;
  embedding: string;
};

export async function ingestDocument(
  documentId: string,
  text: string,
) {

  const document = await prisma.document.findUnique({
    where: {
      id: documentId,
    },
  });

  if (!document) {
    throw new Error("Document not found");
  }

  const chunks = chunkText(text, 500, 100);

  const preparedChunks: PreparedChunk[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const content = chunks[i];

    const embedding = await generateEmbedding(content);

    preparedChunks.push({
      content,
      chunkIndex: i,
      embedding: `[${embedding.join(",")}]`,
    });
  }

  // Database transaction comes next.
  await prisma.$transaction(async (tx) => {
    await tx.documentChunk.deleteMany({
      where: {
        documentId,
      },
    });

    for (const chunk of preparedChunks) {
      await tx.$executeRaw`
        INSERT INTO "DocumentChunk"
          ("id", "documentId", "content", "chunkIndex", "embedding")
        VALUES
          (
            ${randomUUID()},
            ${documentId},
            ${chunk.content},
            ${chunk.chunkIndex},
            ${chunk.embedding}::halfvec(3072)
          )
      `;
    }
  });

  return {
    chunkCount: preparedChunks.length,
  };
}