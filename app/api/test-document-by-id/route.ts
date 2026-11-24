import { executeTool } from "@/app/lib/tools/executeTool";
import { getCurrentUser } from "@/app/lib/auth/session";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json(
        { error: "Not authenticated" },
        { status: 401 },
      );
    }

    const document = await executeTool("getDocumentById", user.id, {
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