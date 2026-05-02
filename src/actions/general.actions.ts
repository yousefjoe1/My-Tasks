'use server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function userOpenedApp(userId: string) {
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