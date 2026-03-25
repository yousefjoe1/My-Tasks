// import { createClient } from '@supabase/supabase-js';
// import webpush from 'web-push';

// export async function GET() {
//     const supabase = await createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
//     const { data: subs } = await supabase.from('push_subscriptions').select('*');

//     if (subs) {
//         subs.forEach(sub => {
//             webpush.sendNotification(
//                 {
//                     endpoint: sub.endpoint,
//                     keys: { auth: sub.auth, p256dh: sub.p256dh }
//                 },
//                 JSON.stringify({
//                     title: "Don't forget your tasks! 📝",
//                     body: `You have tasks waiting for you in your Weekly Tracker.`,
//                     icon: '/icon.png'
//                 })
//             ).catch(err => console.error("Push failed for one user:", err));
//         });
//     }

//     return Response.json({ success: true, notifiedCount: subs?.length });
// }

import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

// 1. CRITICAL: Add this block at the top
webpush.setVapidDetails(
    'mailto:yousefmahmoud150@gmail.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
);

export async function GET() {
    const supabase = await createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: subs } = await supabase.from('push_subscriptions').select('*');

    if (subs && subs.length > 0) {
        // 2. Use map + Promise.all so the server waits for all sends
        const pushPromises = subs.map(sub =>
            webpush.sendNotification(
                {
                    endpoint: sub.endpoint,
                    keys: { auth: sub.auth, p256dh: sub.p256dh }
                },
                JSON.stringify({
                    title: "Don't forget your tasks! 📝",
                    body: `You have tasks waiting for you in your Weekly Tracker.`,
                    icon: '/icon.png',
                    // Adding the action buttons we discussed
                    data: { url: '/' },
                    actions: [
                        { action: 'open_tasks', title: 'View Tasks' }
                    ]
                })
            ).catch(err => console.error("Push failed for one user:", err))
        );

        await Promise.all(pushPromises);
    }

    return Response.json({
        success: true,
        notifiedCount: subs?.length || 0,
        timeSent: new Date().toISOString()
    });
}