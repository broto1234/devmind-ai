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

    const result = await executeTool(
      "deleteAllDocuments",
      user.id,
    );

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