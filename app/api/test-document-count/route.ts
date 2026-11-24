import { executeTool } from "@/app/lib/tools/executeTool";
import { getCurrentUser } from "@/app/lib/auth/session";

export async function GET() {

  const user = await getCurrentUser();

  if (!user) {
    return Response.json(
      { error: "Not authenticated" },
      { status: 401 },
    );
  }

  const result = await executeTool("getDocumentCount", user.id);

  return Response.json({
    result,
  });
}