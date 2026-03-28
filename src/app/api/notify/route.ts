import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

// إعداد مفاتيح VAPID
webpush.setVapidDetails(
    'mailto:yousefmahmoud150@gmail.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.NEXT_PUBLIC_VAPID_PRIVATE_KEY!
);

// export async function GET() {
//     const supabase = await createClient(
//         process.env.NEXT_PUBLIC_SUPABASE_URL!,
//         process.env.SUPABASE_SERVICE_ROLE_KEY!
//     );



//     // 3. جلب المشتركين
//     const { data: subs, error } = await supabase.from('push_subscriptions').select('*');
//     console.log("🚀 ~ GET ~ error:", error)

//     if (subs && subs.length > 0) {
//         const pushPromises = subs.map(sub =>
//             webpush.sendNotification(
//                 {
//                     endpoint: sub.endpoint,
//                     keys: { auth: sub.auth, p256dh: sub.p256dh }
//                 },
//                 JSON.stringify({ title: "Weekly Tasks", body: "لا تنسَ مراجعة قائمة مهامك لهذا اليوم!" })
//             ).catch(err => {
//                 console.error("Push failed:", err.statusCode, err.body, sub.endpoint);
//                 // Auto-delete expired subscriptions
//                 if (err.statusCode === 410) {
//                     return supabase.from('push_subscriptions')
//                         .delete()
//                         .eq('endpoint', sub.endpoint);
//                 }
//             })
//         );

//         await Promise.all(pushPromises);
//     }

//     return Response.json({
//         success: true,
//         notifiedCount: subs?.length || 0,
//         timeSent: new Date().toISOString(),
//     });
// }



export async function GET() {
    const supabase = await createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. حساب الوقت الحالي بتوقيت مصر (UTC+2)
    const now = new Date();
    const cairoHour = (now.getUTCHours() + 2) % 24;

    // 2. تحديد محتوى الرسالة بناءً على الـ Conditions المطلوبة
    let notificationContent = {
        title: "تذكير المهام 📝",
        body: "لا تنسَ مراجعة قائمة مهامك لهذا اليوم!",
    };

    if (cairoHour === 23) { // 11 مساءً
        notificationContent = {
            title: "نهاية اليوم 💪",
            body: "افتكر مهماتك ي بطل.. راجع اللي خلص واللي لسه بكره.",
        };
    } else if (cairoHour === 16) { // 4 مساءً
        notificationContent = {
            title: "أذكار المساء ✨",
            body: "بسم الله الذي لا يضر مع اسمه شيئ في الارض ولا في السماء وهو السميع العليم (3 مرات)",
        };
    } else if (cairoHour === 5) { // 5 فجراً
        notificationContent = {
            title: "أذكار الصباح ☀️",
            body: "بسم الله الذي لا يضر مع اسمه شيئ في الارض ولا في السماء وهو السميع العليم (3 مرات)",
        };
    } else if (cairoHour === 10) { // 10 صباحاً
        notificationContent = {
            title: "بداية اليوم 🚀",
            body: "الحمد لله، إن شاء الله خير. حافظ على صلواتك وزد في حسناتك بذكر الله.",
        };
    }

    // 3. جلب المشتركين
    const { data: subs, error } = await supabase.from('push_subscriptions').select('*');
    if (error) console.error("Supabase Error:", error);

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
                    badge: '/badge.png',
                    vibrate: [200, 100, 200],
                    tag: 'task-reminder',
                    renotify: true,
                    data: { url: '/' }
                })
            ).catch(async (err) => {
                console.error("Push failed:", err.statusCode, sub.endpoint);
                // حذف الاشتراكات المنتهية (410) أو غير الموجودة (404)
                if (err.statusCode === 410 || err.statusCode === 404) {
                    await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
                }
            })
        );

        await Promise.all(pushPromises);
    }

    return Response.json({
        success: true,
        notifiedCount: subs?.length || 0,
        cairoHour,
        timeSent: now.toISOString(),
    });
}