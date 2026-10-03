"use server";

import { createAdminClient } from "@/lib/supabase/admin";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function attachSignupReferral(
  userId: string,
  referredBy: string,
  fullName?: string
) {
  if (!UUID_RE.test(userId) || !UUID_RE.test(referredBy) || userId === referredBy) {
    return { success: false as const, error: "invalid referral" };
  }

  try {
    const supabase = createAdminClient();
    const { data: referrer, error: referrerError } = await supabase.auth.admin.getUserById(referredBy);

    if (referrerError || !referrer.user) {
      return { success: false as const, error: "referrer not found" };
    }

    const { data: updated, error: updateError } = await supabase
      .from("profiles")
      .update({ referred_by: referredBy })
      .eq("id", userId)
      .select("id");

    if (updateError) {
      console.error("attachSignupReferral update:", updateError);
      return { success: false as const, error: "failed to save referral" };
    }

    if (!updated || updated.length === 0) {
      const { error: insertError } = await supabase.from("profiles").insert({
        id: userId,
        full_name: fullName?.trim() || null,
        referred_by: referredBy,
      });

      if (insertError) {
        console.error("attachSignupReferral insert:", insertError);
        return { success: false as const, error: "failed to save referral" };
      }
    }

    return { success: true as const };
  } catch (error) {
    console.error("attachSignupReferral:", error);
    return { success: false as const, error: "failed to save referral" };
  }
}
