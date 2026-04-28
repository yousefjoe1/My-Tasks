'use server'

import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

webpush.setVapidDetails(
    'mailto:yousefmahmoud150@gmail.com',  // ← remove the <> brackets
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.NEXT_PUBLIC_VAPID_PRIVATE_KEY!
)

let subscription: webpush.PushSubscription | null = null  // ← use webpush type

interface PushSubscription {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
}

export async function subscribeUser(sub: PushSubscription) {
    try {
        const supabase = await createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

        // We use .upsert() so if the user subscribes twice, 
        // it just updates the existing record instead of creating a duplicate.
        const { error } = await supabase
            .from('push_subscriptions')
            .upsert({
                endpoint: sub.endpoint,
                p256dh: sub.keys.p256dh,
                auth: sub.keys.auth,
                user_id: `39505af4-4286-423b-8f4a-953a493b62c8`
            }, { onConflict: 'endpoint' });

        if (error) {
            console.error('Supabase Error:', error);
            return { success: false };
        }

        return { success: true };
    } catch (error) {
        console.error('Error:', error);
        return { success: false };
    }
}


export async function unsubscribeUser() {
    subscription = null
    return { success: true }
}
// app/actions.ts
export async function sendNotification(message: string, sub: webpush.PushSubscription) {
    // Instead of relying on the 'let subscription' variable, use the one passed in
    try {
        await webpush.sendNotification(
            sub, // Use the passed-in sub
            JSON.stringify({
                title: 'Test Notification',
                body: message,
                icon: '/icon.png',
            })
        )
        return { success: true }
    } catch (error) {
        console.error('Error:', error)
        return { success: false }
    }
}


