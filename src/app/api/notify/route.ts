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

    // 1. حساب الوقت الحالي بتوقيت مصر (UTC+2)
    const now = new Date();
    const cairoHour = (now.getUTCHours() + 2) % 24;

    // 2. تحديد محتوى الرسالة بناءً على وقت اليوم
    let notificationContent = {
        title: "تذكير المهام 📝",
        body: "لا تنسَ مراجعة قائمة مهامك لهذا اليوم!",
    };

    if (cairoHour >= 4 && cairoHour < 12) {
        notificationContent = {
            title: "أذكار الصباح ☀️",
            body: "بسم الله الذي لا يضر مع اسمه شيء في الارض ولا في السماء وهو السميع العليم 3 مرات",
        };
    } else if (cairoHour >= 15 && cairoHour < 20) {
        notificationContent = {
            title: "أذكار المساء ✨",
            body: "باسم الله الذي لا يضر مع اسمه شيء.. حان وقت أذكار المساء ومتابعة إنجازاتك.",
        };
    }

    // 3. جلب المشتركين
    const { data: subs } = await supabase.from('push_subscriptions').select('*');

    if (subs && subs.length > 0) {
        const pushPromises = subs.map(sub =>
            webpush.sendNotification(
                {
                    endpoint: sub.endpoint,
                    keys: { auth: sub.auth, p256dh: sub.p256dh }
                },
                JSON.stringify({
                    ...notificationContent,
                    icon: '/icon.png',
                    badge: '/badge.png', // أيقونة صغيرة تظهر في شريط الإشعارات
                    data: {
                        url: '/' // الرابط الذي سيفتح عند الضغط على الإشعار
                    },
                    actions: [
                        { action: 'open_tasks', title: 'فتح المهام 🚀' }
                    ]
                })
            ).catch(err => console.error("Push failed for one user:", err))
        );

        await Promise.all(pushPromises);
    }

    return Response.json({
        success: true,
        notifiedCount: subs?.length || 0,
        timeSent: new Date().toISOString(),
        cairoHour // مفيد للتأكد من التوقيت في الـ Logs
    });
}