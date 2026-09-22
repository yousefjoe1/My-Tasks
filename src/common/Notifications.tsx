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
        return <div className='mt-10'>
            <p>Push notifications are not supported in this browser.</p>
            <p>قم بتفعيل الاشعارات لتصلك تذكيرات مفيده جدا في حياتك اليوميه</p>
        </div>
    }

    return (
        <div className="mt-10 flex flex-wrap items-center gap-4 justify-center p-4 bg-secondary border-b border-primary shadow-sm transition-colors duration-300">
            <div className="flex items-center gap-3">
                <div className="lg:p-2 p-1 bg-tertiary rounded-lg">
                    <span className="lg:text-xl text-sm">🔔</span>
                </div>
                <h3 className="lg:text-lg text-sm font-semibold text-primary">التذكير</h3>
            </div>

            {subscription ? (
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-2 bg-tertiary text-secondary rounded-lg text-sm border border-secondary">
                        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                        <span className="text-secondary font-medium">هفكرك إن شاء الله</span>
                    </div>

                    <div className="flex gap-3">
                        <button
                            disabled={loading}
                            onClick={unsubscribeFromPush}
                            className="px-4 py-2 bg-primary border border-secondary text-secondary hover:bg-error hover:text-white hover:border-transparent font-medium rounded-xl transition-all active:scale-95"
                        >
                            {loading ? 'جاري التعطيل...' : 'تعطيل التذكيرات'}

                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-2xl">
                    <p className="text-sm text-muted leading-relaxed text-center sm:text-left flex-1">
                        {user
                            ? 'ابق على اطلاع دائم بمهامك. احصل على تذكيرات لمهامك والأذكار طوال اليوم.'
                            : 'سجّل الدخول أولاً لتفعيل تذكيرات المهام والأذكار.'}
                    </p>
                    <button
                        disabled={loading || !user}
                        onClick={subscribeToPush}
                        className="whitespace-nowrap text-xs px-6 py-2 hover:opacity-90 text-primary font-semibold rounded-xl transition-all active:scale-[0.98] bg-primary border border-primary disabled:opacity-50"
                    >
                        {loading ? 'جاري التفعيل...' : 'تحب افكرك ؟'}
                    </button>
                </div>
            )}
        </div>
    )
}
