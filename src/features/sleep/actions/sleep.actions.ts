"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  buildSleepTimestamps,
  getCairoDateKey,
  isDateKey,
  monthRange,
} from "@/features/sleep/lib/sleepTime";
import type { SleepLog } from "@/features/sleep/types";

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

function requireUserId(userId?: string): string | null {
  if (!userId) return null;
  return userId;
}

export async function getSleepLog(
  userId: string | undefined,
  sleepDate: string
): Promise<ActionResult<SleepLog | null>> {
  const id = requireUserId(userId);
  if (!id) {
    return { success: false, error: "يجب تسجيل الدخول أولاً" };
  }

  if (!isDateKey(sleepDate)) {
    return { success: false, error: "التاريخ غير صالح" };
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("sleep_logs")
      .select("*")
      .eq("user_id", id)
      .eq("sleep_date", sleepDate)
      .maybeSingle();

    if (error) {
      console.error("getSleepLog:", error);
      return { success: false, error: "تعذر تحميل نوم هذا اليوم" };
    }

    return { success: true, data: (data as SleepLog | null) ?? null };
  } catch (e) {
    console.error("getSleepLog:", e);
    return { success: false, error: "تعذر تحميل نوم هذا اليوم" };
  }
}

export async function getSleepMonth(
  userId: string | undefined,
  monthKey: string
): Promise<ActionResult<SleepLog[]>> {
  const id = requireUserId(userId);
  if (!id) {
    return { success: false, error: "يجب تسجيل الدخول أولاً" };
  }

  const range = monthRange(monthKey);
  if (!range) {
    return { success: false, error: "الشهر غير صالح" };
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("sleep_logs")
      .select("*")
      .eq("user_id", id)
      .gte("sleep_date", range.start)
      .lt("sleep_date", range.endExclusive)
      .order("sleep_date", { ascending: false });

    if (error) {
      console.error("getSleepMonth:", error);
      return { success: false, error: "تعذر تحميل سجل الشهر" };
    }

    return { success: true, data: (data ?? []) as SleepLog[] };
  } catch (e) {
    console.error("getSleepMonth:", e);
    return { success: false, error: "تعذر تحميل سجل الشهر" };
  }
}

export async function saveSleepLog(
  userId: string | undefined,
  sleepDate: string,
  bedTime: string,
  wakeClock: string
): Promise<ActionResult<SleepLog>> {
  const id = requireUserId(userId);
  if (!id) {
    return { success: false, error: "يجب تسجيل الدخول أولاً" };
  }

  if (sleepDate > getCairoDateKey()) {
    return { success: false, error: "لا يمكن تسجيل نوم ليوم لم يأتِ بعد" };
  }

  const built = buildSleepTimestamps(sleepDate, bedTime, wakeClock);
  if (!built.ok) {
    return { success: false, error: built.error };
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("sleep_logs")
      .upsert(
        {
          user_id: id,
          sleep_date: sleepDate,
          bedtime: built.bedtime,
          wake_time: built.wakeTime,
        },
        { onConflict: "user_id,sleep_date" }
      )
      .select("*")
      .single();

    if (error || !data) {
      console.error("saveSleepLog:", error);
      return { success: false, error: "تعذر حفظ النوم" };
    }

    return { success: true, data: data as SleepLog };
  } catch (e) {
    console.error("saveSleepLog:", e);
    return { success: false, error: "تعذر حفظ النوم" };
  }
}

export async function deleteSleepLog(
  userId: string | undefined,
  sleepDate: string
): Promise<ActionResult<null>> {
  const id = requireUserId(userId);
  if (!id) {
    return { success: false, error: "يجب تسجيل الدخول أولاً" };
  }

  if (!isDateKey(sleepDate)) {
    return { success: false, error: "التاريخ غير صالح" };
  }

  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("sleep_logs")
      .delete()
      .eq("user_id", id)
      .eq("sleep_date", sleepDate);

    if (error) {
      console.error("deleteSleepLog:", error);
      return { success: false, error: "تعذر حذف النوم" };
    }

    return { success: true, data: null };
  } catch (e) {
    console.error("deleteSleepLog:", e);
    return { success: false, error: "تعذر حذف النوم" };
  }
}
