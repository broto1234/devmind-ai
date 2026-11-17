import { createHash,randomBytes } from "node:crypto";
import { prisma } from "@/app/lib/prisma";
import { cookies } from "next/headers";

export function generateSessionToken() {
  return randomBytes(32).toString("hex");
}


export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string) {
  const token = generateSessionToken();
  const tokenHash = hashSessionToken(token);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.session.create({
    data: {
      tokenHash,
      userId,
      expiresAt,
    },
  });

  return {
    token,
    expiresAt,
  };
}


export async function getCurrentUser() {
  const cookieStore = await cookies();

  const token = cookieStore.get("devmind_session")?.value;

  if (!token) {
    return null;
  }

  const tokenHash = hashSessionToken(token);

  const session = await prisma.session.findUnique({
    where: {
      tokenHash,
    },
    include: {
      user: true,
    },
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt <= new Date()) {
    return null;
  }

  return session.user;
}