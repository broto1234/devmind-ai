import { executeTool } from "@/app/lib/tools/executeTool";

export async function GET() {
  const result = await executeTool("getDocumentCount");

  return Response.json({
    result,
  });
}