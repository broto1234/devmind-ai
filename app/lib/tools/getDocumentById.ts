import { prisma } from "@/app/lib/prisma";

export async function getDocumentById(
  documentId: string,
  userId: string,
) {
  if (!documentId || typeof documentId !== "string") {
    throw new Error("Invalid document ID");
  }

  const document = await prisma.document.findFirst({
    where: {
      id: documentId,
      userId: userId,
    },
  });

  if (!document) {
    throw new Error("Document not found");
  }

  return document;
}