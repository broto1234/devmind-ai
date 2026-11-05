import { chunkText } from "@/app/lib/chunking/chunkText";

export async function GET() {
  const text = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  const chunks = chunkText(text, 10, 3);

  return Response.json({
    chunks,
  });
}
