import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

// إعداد مفاتيح VAPID
webpush.setVapidDetails(
    'mailto:yousefmahmoud150@gmail.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // تأكد من استخدام المفتاح الخاص الصحيح هنا
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
            body: "بسم الله الذي لا يضر مع اسمه شيء في الأرض ولا في السماء وهو السميع العليم (3 مرات)",
        };
    } else if (cairoHour >= 15 && cairoHour < 19) {
        notificationContent = {
            title: "أذكار المساء 🌙",
            body: "بسم الله الذي لا يضر مع اسمه شيء في الأرض ولا في السماء وهو السميع العليم (3 مرات)",
        };
    } else if (cairoHour >= 19 && cairoHour < 23) {
        notificationContent = {
            title: "مراجعة المساء 📝",
            body: "قربنا نخلص اليوم.. شيك على تاسكاتك اللي لسه مخلصتش!",
        };
    }

    // 3. جلب المشتركين
    const { data: subs } = await supabase.from('push_subscriptions').select('*');

    if (subs && subs.length > 0) {
        const pushPromises = subs.map(async (sub) => {
            try {
                await webpush.sendNotification(
                    {
                        endpoint: sub.endpoint,
                        keys: { auth: sub.auth, p256dh: sub.p256dh }
                    },
                    JSON.stringify({
                        ...notificationContent,
                        icon: '/icon.png',
                        badge: '/badge.png',
                        vibrate: [200, 100, 200], // يخلي الموبايل يهز للتنبيه
                        tag: 'task-reminder',
                        renotify: true,
                        data: { url: '/' },
                        actions: [
                            {
                                action: 'open_tasks',
                                title: 'عرض المهام 🚀',
                            }
                        ]
                    })
                );
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (err: any) {
                console.error(`Push failed for ${sub.endpoint}:`, err.statusCode);

                // الحل التلقائي لمشكلة 410 و 404 الظاهرة في اللوجز
                if (err.statusCode === 410 || err.statusCode === 404) {
                    console.log("Cleaning up expired subscription...");
                    await supabase
                        .from('push_subscriptions')
                        .delete()
                        .eq('endpoint', sub.endpoint);
                }
            }
        });

        await Promise.all(pushPromises);
    }

    return Response.json({
        success: true,
        notifiedCount: subs?.length || 0,
        timeSent: now.toISOString(),
        cairoHour
    });
}