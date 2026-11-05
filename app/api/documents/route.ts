import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const documents = await prisma.document.findMany();

  return Response.json({
    documents,
  });
}

export async function POST(request: Request) {
  const body = await request.json();

  const document = await prisma.document.create({
    data: {
      name: body.name,
    },
  });

  return Response.json({
    document,
  });
}