'use client';

import { useEffect, useState } from 'react';

export default function InstallPWA() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // التحقق لو الجهاز iPhone/iPad
        const userAgent = window.navigator.userAgent.toLowerCase();
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsIOS(/iphone|ipad|ipod/.test(userAgent));

        // حفظ حدث التنزيل التلقائي (لأندرويد وكروم)
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        });
    }, []);

    const handleInstallClick = async () => {
        if (isIOS) {
            alert('لتثبيت التطبيق على iPhone: اضغط على زر "مشاركة" (Share) ثم اختر "إضافة إلى الشاشة الرئيسية" (Add to Home Screen) 📲');
        } else if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') setDeferredPrompt(null);
        } else {
            alert('التطبيق مثبت بالفعل أو متصفحك لا يدعم التنزيل المباشر.');
        }
    };

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