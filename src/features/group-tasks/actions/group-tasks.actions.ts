'use server'

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// // جلب المستخدمين مع مهامهم (Left Join)
export async function getUsersWithProgress() {
    const { data, error } = await supabase
        .from('users')
        .select(`
            id,
            full_name,
            user_tasks (
                id,
                count,
                is_completed,
                task_id,
                tasks (
                    id,
                    name,
                    has_count
                )
            )
        `);

    if (error) {
        console.error('Supabase Error:', error);
        throw error;
    }
    return data;
}

// // حفظ التحديثات (Bulk Upsert)
// export async function saveUserProgress(tasksToSave: any[]) {
//     // نستخدم upsert لتحديث الموجود أو إضافة الجديد
//     const { error } = await supabase
//         .from('user_tasks')
//         .upsert(tasksToSave, { onConflict: 'user_id,task_id,created_at' });

//     if (error) {
//         console.error('Save Error:', error);
//         return { success: false, error };
//     }
//     return { success: true };
// }



// // 1. جلب بيانات الداشبورد (كل المستخدمين + المهام + إنجازات اليوم فقط)
// export async function getDashboardData() {
//     const today = new Date().toISOString().split('T')[0];

//     const [users, tasks, progress] = await Promise.all([
//         supabase.from('users').select('*'),
//         supabase.from('tasks').select('*'),
//         supabase.from('user_tasks').select('*').eq('created_at', today)
//     ]);

//     return {
//         users: users.data || [],
//         allTasks: tasks.data || [],
//         userProgress: progress.data || []
//     };
// }

// // 2. تحديث المهمة (Upsert)
// export async function toggleTaskCompletion(userId: string, taskId: string, isCompleted: boolean) {
//     const today = new Date().toISOString().split('T')[0];

//     const { error } = await supabase
//         .from('user_tasks')
//         .upsert({
//             user_id: userId,
//             task_id: taskId,
//             is_completed: isCompleted,
//             created_at: today
//         }, { onConflict: 'user_id, task_id, created_at' });

//     if (error) throw error;
//     return { success: true };
// }


// old update
// export async function updateTaskCount(userId: string, taskId: string, count: number) {

//     // بنستخدم upsert عشان لو السجل موجود يحدثه، ولو مش موجود ينشئه
//     const { error } = await supabase
//         .from('user_tasks')
//         .upsert(
//             {
//                 user_id: userId,
//                 task_id: taskId,
//                 count: count,
//             },
//             {
//                 // لازم تتأكد إن الـ Constraint ده موجود في الداتابيز (user_id, task_id)
//                 onConflict: 'user_id, task_id'
//             }
//         );

//     if (error) {
//         console.error("Error updating task count:", error);
//         throw error;
//     }

//     return { success: true };
// }

export async function updateTaskCount(userId: string, taskId: string, count: number) {
    const { error } = await supabase
        .from('user_tasks')
        .upsert(
            {
                user_id: userId,
                task_id: taskId,
                count: count,
                is_completed: count >= 10, // مثال: لو العداد وصل 10 تبقى اكتملت
                created_at: new Date().toISOString().split('T')[0] // عشان يحافظ على تاريخ اليوم
            },
            {
                onConflict: 'user_id, task_id'
            }
        );

    if (error) {
        console.error("Error updating task count:", error);
        throw error;
    }

    return { success: true };
}