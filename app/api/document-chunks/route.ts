import { prisma } from "@/app/lib/prisma";
import { generateEmbedding } from "@/app/lib/embeddings/generateEmbedding";
import { randomUUID } from "crypto";
import { getCurrentUser } from "@/app/lib/auth/session";
import { documentChunkSchema } from "@/app/lib/embeddings/documentChunkSchema";

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

  const validationResult = documentChunkSchema.safeParse(body);

  if (!validationResult.success) {
    return Response.json(
      { error: "Invalid document chunk data" },
      { status: 400 },
    );
  }

  const { documentId, content } = validationResult.data;

  const document = await prisma.document.findFirst({
    where: {
      id: documentId,
      userId: user.id,
    },
  });

  if (!document) {
    return Response.json(
      { error: "Document not found" },
      { status: 404 },
    );
  }

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