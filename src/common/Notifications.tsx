'use client'

import { subscribeUser, unsubscribeUser } from '@/app/actions'
import { useAuth } from '@/contexts/AuthContext'
import { registerAppServiceWorker } from '@/lib/serviceWorker/registerAppServiceWorker'
import { useState, useEffect } from 'react'

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
}

export default function PushNotificationManager() {
    const [isSupported, setIsSupported] = useState(false)
    const [loading, setLoading] = useState(false)
    const [subscription, setSubscription] = useState<PushSubscription | null>(
        null
    )

    const { user } = useAuth()

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true)
            registerServiceWorker()
        }
    }, [])

    async function registerServiceWorker() {
        try {
            const registration = await registerAppServiceWorker()
            const sub = await registration.pushManager.getSubscription()
            setSubscription(sub)
        } catch (error) {
            console.warn("Push SW setup failed:", error)
        }
    }

    async function subscribeToPush() {
        if (!user?.id) {
            alert('سجّل الدخول أولاً لتفعيل التذكيرات');
            return;
        }

        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidPublicKey) {
            alert('مفاتيح الإشعارات غير متوفرة حالياً');
            return;
        }

        const permission = await Notification.requestPermission();

        if (permission !== 'granted') {
            alert('لازم توافق على الإشعارات الأول');
            return;
        }

        try {
            setLoading(true)
            const registration = await navigator.serviceWorker.ready
            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
            })
            const serializedSub = JSON.parse(JSON.stringify(sub))
            const result = await subscribeUser(serializedSub, user.id)

            if (!result.success) {
                await sub.unsubscribe()
                setSubscription(null)
                alert(result.error || 'تعذر تفعيل التذكيرات')
                return
            }

            setSubscription(sub)
        } catch (error) {
            console.warn("subscribeToPush failed:", error)
            alert('تعذر تفعيل التذكيرات')
        } finally {
            setLoading(false)
        }
    }

    async function unsubscribeFromPush() {
        try {
            setLoading(true)
            const endpoint = subscription?.endpoint
            await subscription?.unsubscribe()
            setSubscription(null)
            await unsubscribeUser(endpoint, user?.id)
        } catch (error) {
            console.warn("unsubscribeFromPush failed:", error)
            alert('تعذر تعطيل التذكيرات')
        } finally {
            setLoading(false)
        }
    }

    if (!isSupported) {
        return (
            <p className="text-center text-xs text-muted">
                الإشعارات غير مدعومة في هذا المتصفح
            </p>
        )
    }

    const reminderHint = user
        ? 'ابق على اطلاع دائم بمهامك. احصل على تذكيرات لمهامك والأذكار طوال اليوم.'
        : 'سجّل الدخول أولاً لتفعيل تذكيرات المهام والأذكار.'

    return (
        <div className="flex flex-wrap items-center justify-center gap-2">
            <div className="flex items-center gap-2">
                <span className="text-base" aria-hidden>🔔</span>
                <h3 className="text-sm font-semibold text-primary">التذكير</h3>
            </div>

            {subscription ? (
                <>
                    <span className="inline-flex items-center gap-2 rounded-lg border border-secondary bg-tertiary px-2.5 py-1 text-xs font-medium text-secondary">
                        <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                        هفكرك إن شاء الله
                    </span>
                    <button
                        disabled={loading}
                        onClick={unsubscribeFromPush}
                        className="btn btn-danger text-xs"
                    >
                        {loading ? 'جاري التعطيل...' : 'تعطيل'}
                    </button>
                </>
            ) : (
                <button
                    disabled={loading || !user}
                    onClick={subscribeToPush}
                    title={reminderHint}
                    className="btn btn-primary whitespace-nowrap text-xs"
                >
                    {loading ? 'جاري التفعيل...' : 'تحب افكرك ؟'}
                </button>
            )}
        </div>
    )
}
