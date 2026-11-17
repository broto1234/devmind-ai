import { prisma } from "@/app/lib/prisma";
import { Prisma } from "@/app/generated/prisma/client";
import { hashPassword } from "@/app/lib/auth/password";
import { registerSchema } from "@/app/lib/auth/registerSchema";

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

  const result = registerSchema.safeParse(body);

  if (!result.success) {
    return Response.json(
      {
        error: "Invalid registration data",
        details: result.error.issues,
      },
      { status: 400 },
    );
  }

  const { email, password } = result.data;

  const passwordHash = await hashPassword(password);

  let user;

  try {
    user = await prisma.user.create({
      data: {
        email,
        passwordHash,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return Response.json(
        { error: "Email is already registered" },
        { status: 409 },
      );
    }

    throw error;
  }

  return Response.json(
    {
      message: "User registered successfully",
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
    },
    { status: 201 },
  );
}