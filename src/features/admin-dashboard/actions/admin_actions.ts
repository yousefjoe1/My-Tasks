'use server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)
export async function promoteUserToAdmin(userId: string) {
    // هنا نستخدم الـ Service Role Key

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { app_metadata: { role: 'admin' } }
    )

    return { data, error }
}

// const supabaseAdmin = createClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.SUPABASE_SERVICE_ROLE_KEY!
// );

/**
 * جلب رتبة المستخدم من الـ Auth Metadata مباشرة
 * مفيد للتحقق من الصلاحيات في السيرفر (Server-side protection)
 */
export async function getUserRoleById(userId: string) {
    try {
        const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);

        if (error) throw error;

        // إرجاع الـ role من app_metadata أو 'user' كقيمة افتراضية
        return data.user?.app_metadata?.role || 'user';
    } catch (error) {
        console.error("Error fetching user role:", error);
        return 'user'; // في حالة الخطأ بنعتبره يوزر عادي زيادة في الأمان
    }
}

export async function getUsers() {
    const { data: users, error } = await supabaseAdmin
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return users;
}

export async function getUsersWithTasks() {
    const [{ data: users }, { data: tasks }, { data: subtasks }] = await Promise.all([
        supabaseAdmin.from("users").select("*").order("created_at", { ascending: false }),
        supabaseAdmin.from("weekly_tasks").select("*"),
        supabaseAdmin.from("sub_tasks").select("*"),
    ]);

    return {
        users: users ?? [],
        tasks: tasks ?? [],
        subtasks: subtasks ?? [],
    };
}