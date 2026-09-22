'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { configureWebPush } from '@/lib/push/vapid'
import webpush from 'web-push'

interface PushSubscriptionPayload {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
}

export async function subscribeUser(sub: PushSubscriptionPayload, userId?: string) {
    if (!userId) {
        return { success: false, error: 'Must be signed in to enable reminders' }
    }

    if (!sub?.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
        return { success: false, error: 'Invalid push subscription' }
    }

    try {
        const supabase = createAdminClient()

        const { error } = await supabase
            .from('push_subscriptions')
            .upsert({
                endpoint: sub.endpoint,
                p256dh: sub.keys.p256dh,
                auth: sub.keys.auth,
                user_id: userId,
            }, { onConflict: 'endpoint' })

        if (error) {
            console.error('Supabase Error:', error)
            return { success: false, error: 'Failed to save subscription' }
        }

        return { success: true }
    } catch (error) {
        console.error('Error:', error)
        return { success: false, error: 'Failed to save subscription' }
    }
}

export async function unsubscribeUser(endpoint?: string, userId?: string) {
    if (!endpoint) {
        return { success: false, error: 'Missing subscription endpoint' }
    }

    try {
        const supabase = createAdminClient()
        let query = supabase.from('push_subscriptions').delete().eq('endpoint', endpoint)

        if (userId) {
            query = query.eq('user_id', userId)
        }

        const { error } = await query

        if (error) {
            console.error('Error deleting subscription:', error)
            return { success: false, error: 'Failed to remove subscription' }
        }

        return { success: true }
    } catch (error) {
        console.error('Error:', error)
        return { success: false, error: 'Failed to remove subscription' }
    }
}

export async function sendNotification(message: string, sub: webpush.PushSubscription) {
    try {
        const push = configureWebPush()
        await push.sendNotification(
            sub,
            JSON.stringify({
                title: 'Test Notification',
                body: message,
                data: { url: '/' },
            })
        )

        return { success: true }
    } catch (error) {
        console.error('Error:', error)
        return { success: false }
    }
}
