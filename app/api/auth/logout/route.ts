import { cookies } from "next/headers";
import { prisma } from "@/app/lib/prisma";
import { hashSessionToken } from "@/app/lib/auth/session";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();

  const token = cookieStore.get("devmind_session")?.value;

  if (token) {
    const tokenHash = hashSessionToken(token);

    await prisma.session.deleteMany({
      where: {
        tokenHash,
      },
    });
  }

  const response = NextResponse.json({
    message: "Logged out successfully",
  });

  response.cookies.delete("devmind_session");

  return response;
}