import { executeTool } from "@/app/lib/tools/executeTool";

export async function GET() {
  try {
    const document = await executeTool("getDocumentById", {
      documentId: "nonexistent-id",
    });

    return Response.json({ document });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 400 },
    );
  }
}