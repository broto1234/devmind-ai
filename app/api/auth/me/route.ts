import { getCurrentUser } from "@/app/lib/auth/session";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json(
      { error: "Not authenticated" },
      { status: 401 },
    );
  }

  return Response.json({
    message: "Authenticated successfully",
    user: {
      id: user.id,
      email: user.email,
    },
  });
}