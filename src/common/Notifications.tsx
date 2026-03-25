'use client'

import { sendNotification, subscribeUser, unsubscribeUser } from '@/app/actions'
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
    const [subscription, setSubscription] = useState<PushSubscription | null>(
        null
    )
    const [message, setMessage] = useState('')

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true)
            // eslint-disable-next-line react-hooks/immutability
            registerServiceWorker()
        }
    }, [])

    async function registerServiceWorker() {
        const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
            updateViaCache: 'none',
        })
        const sub = await registration.pushManager.getSubscription()
        setSubscription(sub)
    }

    async function subscribeToPush() {
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
    }

    async function unsubscribeFromPush() {
        await subscription?.unsubscribe()
        setSubscription(null)
        await unsubscribeUser()
    }

    if (!isSupported) {
        return <p>Push notifications are not supported in this browser.</p>
    }

    return (
        <div className="mt-10 flex flex-wrap items-center gap-4 justify-center p-1 bg-white border-b border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                    <span className="text-xl">🔔</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-800">Push Notifications</h3>
            </div>

            {subscription ? (
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm border border-green-100">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Active Subscription
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={unsubscribeFromPush}
                            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100 font-medium rounded-xl transition-all"
                        >
                            Disable
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <p className="text-sm text-slate-500 leading-relaxed">
                        Stay on top of your tasks. Get a daily reminder at 5:30 PM if you still have pending items.
                    </p>
                    <button
                        onClick={subscribeToPush}
                        className="w-full px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all active:scale-[0.98]"
                    >
                        Enable Notifications
                    </button>
                </div>
            )}
        </div>
    )
}