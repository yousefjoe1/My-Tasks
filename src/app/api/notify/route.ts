import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

// إعداد مفاتيح VAPID
webpush.setVapidDetails(
    'mailto:yousefmahmoud150@gmail.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.NEXT_PUBLIC_VAPID_PRIVATE_KEY!
);

export async function GET() {
    const supabase = await createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );



    // 3. جلب المشتركين
    const { data: subs, error } = await supabase.from('push_subscriptions').select('*');
    console.log("🚀 ~ GET ~ error:", error)

    if (subs && subs.length > 0) {
        const pushPromises = subs.map(sub =>
            webpush.sendNotification(
                {
                    endpoint: sub.endpoint,
                    keys: { auth: sub.auth, p256dh: sub.p256dh }
                },
                JSON.stringify({ title: "Weekly Tasks", body: "لا تنسَ مراجعة قائمة مهامك لهذا اليوم!" })
            ).catch(err => {
                console.error("Push failed:", err.statusCode, err.body, sub.endpoint);
                // Auto-delete expired subscriptions
                if (err.statusCode === 410) {
                    return supabase.from('push_subscriptions')
                        .delete()
                        .eq('endpoint', sub.endpoint);
                }
            })
        );

        await Promise.all(pushPromises);
    }

    return Response.json({
        success: true,
        notifiedCount: subs?.length || 0,
        timeSent: new Date().toISOString(),
    });
}