'use client';

import { useEffect, useState } from 'react';

export default function InstallPWA() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isIOS, setIsIOS] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // 1. التحقق لو التطبيق مفتوح كـ PWA فعلاً (مثبت)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            || (window.navigator as any).standalone
            || document.referrer.includes('android-app://');

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsInstalled(isStandalone);

        // 2. التحقق لو الجهاز iPhone/iPad
        const userAgent = window.navigator.userAgent.toLowerCase();
        setIsIOS(/iphone|ipad|ipod/.test(userAgent));

        // 3. حفظ حدث التنزيل التلقائي
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (isIOS) {
            alert('لتثبيت التطبيق على iPhone: اضغط على زر "مشاركة" (Share) ثم اختر "إضافة إلى الشاشة الرئيسية" (Add to Home Screen) 📲');
        } else if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setDeferredPrompt(null);
                setIsInstalled(true);
            }
        }
    };

    // لو التطبيق مثبت بالفعل، لا تعرض أي شيء (Return null)
    if (isInstalled) return null;

    return (
        <div className="p-2 bg-tertiary border border-secondary shadow-sm transition-colors duration-300">
            <div className="flex flex-col items-center gap-3 text-center">
                <p className="text-sm text-muted font-medium">
                    يمكنك تنزيل التطبيق بكل سهولة للوصول السريع لمهامك
                </p>
                <button
                    onClick={handleInstallClick}
                    className="px-6 py-2 bg-brand text-white font-bold rounded-xl hover:opacity-90 transition-all active:scale-95 flex items-center gap-2"
                >
                    <span>تنزيل التطبيق الآن</span>
                    <span className="text-lg">📲</span>
                </button>
            </div>
        </div>
    );
}