import { prisma } from "@/app/lib/prisma";

export async function getDocumentCount() {
  const count = await prisma.document.count();

  return count;
}