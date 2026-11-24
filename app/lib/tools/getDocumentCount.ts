import { prisma } from "@/app/lib/prisma";

export async function getDocumentCount(userId: string) {
  
  const count = await prisma.document.count({
    where: {
      userId: userId,
    },
  });

  return count;
}