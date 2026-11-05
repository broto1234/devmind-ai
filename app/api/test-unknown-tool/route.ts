import { executeTool } from "@/app/lib/tools/executeTool";

export async function GET() {
  try {
    const result = await executeTool("deleteAllDocuments");

    return Response.json({ result });
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