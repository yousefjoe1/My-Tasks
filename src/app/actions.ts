'use server'

import webpush from 'web-push'

webpush.setVapidDetails(
    'mailto:yousefmahmoud150@gmail.com',  // ← remove the <> brackets
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.NEXT_PUBLIC_VAPID_PRIVATE_KEY!
)

let subscription: webpush.PushSubscription | null = null  // ← use webpush type

export async function subscribeUser(sub: PushSubscription) {
    // Cast browser type to webpush type
    subscription = JSON.parse(JSON.stringify(sub)) as webpush.PushSubscription
    return { success: true }
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

