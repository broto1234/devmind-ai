import { prisma } from "@/app/lib/prisma";

export async function createConversation(
  userId: string,
  geminiInteractionId: string,
) {
  const conversation = await prisma.conversation.create({
    data: {
      userId,
      geminiInteractionId,
    },
  });

  return conversation;
}

export async function getConversation(
  geminiInteractionId: string,
  userId: string,
) {
  const conversation = await prisma.conversation.findFirst({
    where: {
      geminiInteractionId,
      userId,
    },
  });

  return conversation;
}

export async function updateConversation(
  conversationId: string,
  newGeminiInteractionId: string,
  userId: string,
) {
  const conversation = await prisma.conversation.updateMany({
    where: {
      geminiInteractionId: conversationId,
      userId,
    },
    data: {
      geminiInteractionId: newGeminiInteractionId,
    },
  });

  return conversation;
}