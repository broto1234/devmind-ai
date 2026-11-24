import { ingestDocument } from "@/app/lib/ingestion/ingestDocument";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/auth/session";
import { ingestSchema } from "@/app/lib/ingestion/ingestSchema";

export async function POST(request: Request) {
  try {
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

    const validationResult = ingestSchema.safeParse(body);

    if (!validationResult.success) {
      return Response.json(
        { error: "Invalid ingestion data" },
        { status: 400 },
      );
    }

    const { documentId, text } = validationResult.data;

    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        userId: user.id,
      },
    });

    if (!document) {
      return Response.json(
        { error: "Document not found" },
        { status: 404 },
      );
    }

    const result = await ingestDocument(documentId, text);

    return Response.json(result);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Document not found"
    ) {
      return Response.json(
        { error: "Document not found" },
        { status: 404 },
      );
    }

    console.error("Document ingestion error:", error);

    return Response.json(
      { error: "Document ingestion failed" },
      { status: 500 },
    );
  }
}