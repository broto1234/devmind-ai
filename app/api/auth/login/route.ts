import { prisma } from "@/app/lib/prisma";
import { loginSchema } from "@/app/lib/auth/loginSchema";
import { verifyPassword } from "@/app/lib/auth/password";
import { createSession } from "@/app/lib/auth/session";
import { NextResponse } from "next/server";
import { connectRedis } from "@/app/lib/redis";
import { rateLimit } from "@/app/lib/rate-limit";
import { headers } from "next/headers";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const result = loginSchema.safeParse(body);

  if (!result.success) {
    return Response.json(
      {
        error: "Invalid login data",
        details: result.error.issues,
      },
      { status: 400 },
    );
  }

  await connectRedis();

  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for");
  const ipAddress = forwardedFor?.split(",")[0]?.trim() ?? "unknown";

  const emailLimit = await rateLimit(
    `login:email:${result.data.email}:ip:${ipAddress}`,
    5,
    900,
  );

  if (!emailLimit.allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      { status: 429 },
    );
  }

  const ipLimit = await rateLimit(
    `login:ip:${ipAddress}`,
    20,
    900,
  );

  if (!ipLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  const { email, password } = result.data;

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    return Response.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );
  }

  const isPasswordValid = await verifyPassword(
    user.passwordHash,
    password,
  );

  if (!isPasswordValid) {
    return Response.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );
  }

  const session = await createSession(user.id);

  const response = NextResponse.json(
    {
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
      },
    },
    { status: 200 },
  );

  response.cookies.set("devmind_session", session.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: session.expiresAt,
  });

  return response;
}