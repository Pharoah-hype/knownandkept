import { getAdminClient } from "../supabase/admin";
import { retrieveSimilar, SimilarEntry } from "./retrieveSimilar";

export interface UserContext {
  profile: Record<string, unknown> | null;
  similarHistory: SimilarEntry[];
}

export async function buildUserContext(
  userId: string,
  lastMessage: string
): Promise<UserContext> {
  const supabaseAdmin = getAdminClient()
  const [profileResult, similarHistory] = await Promise.all([
    supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single(),
    retrieveSimilar(userId, lastMessage),
  ]);

  return {
    profile: profileResult.data,
    similarHistory,
  };
}
