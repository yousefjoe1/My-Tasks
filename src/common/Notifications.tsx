'use client'

import { subscribeUser, unsubscribeUser } from '@/app/actions'
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

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true)
            // eslint-disable-next-line react-hooks/immutability
            registerServiceWorker()
        }
    }, [])

    async function registerServiceWorker() {
        try {

            const registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/',
                updateViaCache: 'none',
            })
            const sub = await registration.pushManager.getSubscription()
            setSubscription(sub)

        } catch (error) {
            console.log("🚀 ~ registerServiceWorker ~ error:", error)

        }
    }

    async function subscribeToPush() {
        console.log('VAPID key:', process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY)
        const permission = await Notification.requestPermission();

        if (permission !== 'granted') {
            alert('لازم توافق على الإشعارات الأول');
            return;
        }
        try {
            setLoading(true)
            if (Notification.permission === 'denied') {
                alert('Notifications are blocked. Please click the lock icon in the address bar to allow them!');
                return;
            }
            const registration = await navigator.serviceWorker.ready
            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(
                    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
                ),
            })
            setSubscription(sub)
            const serializedSub = JSON.parse(JSON.stringify(sub))
            await subscribeUser(serializedSub)
            setLoading(false)

        } catch (error) {
            setLoading(false)
            console.log("🚀 ~ subscribeToPush ~ error:", error)
        }
    }

    async function unsubscribeFromPush() {
        try {
            setLoading(true)
            await subscription?.unsubscribe()
            setSubscription(null)
            await unsubscribeUser()
            setLoading(false)
        } catch (error) {
            setLoading(false)
            console.log("🚀 ~ unsubscribeFromPush ~ error:", error)
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
                        ابق على اطلاع دائم بمهامك. احصل على تذكيرات لمهامك والأذكار طوال اليوم.
                    </p>
                    <button
                        disabled={loading}
                        onClick={subscribeToPush}
                        className="whitespace-nowrap px-6 py-2 hover:opacity-90 text-primary font-semibold rounded-xl transition-all active:scale-[0.98]bg-primary border border-primary"
                    >
                        {loading ? 'جاري التفعيل...' : 'تحب افكرك ؟'}
                    </button>
                </div>
            )}
        </div>
    )
}