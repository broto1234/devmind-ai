import { ingestDocument } from "@/app/lib/ingestion/ingestDocument";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { documentId, text } = body;

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