import { prisma } from "@/app/lib/prisma";

export async function getDocumentById(documentId: string) {
  if (!documentId || typeof documentId !== "string") {
    throw new Error("Invalid document ID");
  }

  const document = await prisma.document.findUnique({
    where: {
      id: documentId,
    },
  });

  if (!document) {
    throw new Error("Document not found");
  }

  return document;
}