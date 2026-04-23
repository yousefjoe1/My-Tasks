'use server'
import { createClient } from '@supabase/supabase-js'

export async function promoteUserToAdmin(userId: string) {
    // هنا نستخدم الـ Service Role Key
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { app_metadata: { role: 'admin' } }
    )

    return { data, error }
}

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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