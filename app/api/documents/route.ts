import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/auth/session";
import { documentSchema } from "@/app/lib/documents/documentSchema";

export async function GET() {
  
  const user = await getCurrentUser();

  if (!user) {
    return Response.json(
      { error: "Not authenticated" },
      { status: 401 },
    );
  }

  const documents = await prisma.document.findMany({
    where: {
      userId: user.id,
    },
  });

  return Response.json({
    documents,
  });
}

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

  const result = documentSchema.safeParse(body);

  if (!result.success) {
    return Response.json(
      { error: "Invalid document data" },
      { status: 400 },
    );
  }

  const document = await prisma.document.create({
    data: {
      name: result.data.name,
      userId: user.id,
    },
  });

  return Response.json({
    document,
  }, { status: 201 });
}