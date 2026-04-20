'use client';
import { useEffect } from 'react';
// تأكد من استيراد الـ toast اللي بتستخدمه في مشروعك
import { useToast } from '@/components/Toasts/useToast';
import ToastContainer from '@/components/Toasts/ToastContainer';

const WelcomeNotifications = () => {
    const { toast, toasts, removeToast } = useToast()


    useEffect(() => {
        // تأخير بسيط عشان التوست ما يظهرش فوق الـ Loader أو محتوى الـ Layout
        const timer = setTimeout(() => {
            toast("بسم الله ",
                "اللهم صلِّ وسلم وبارك على نبينا محمد",
            );
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    return (

        <ToastContainer toasts={toasts} removeToast={removeToast} />
    )
};

export default WelcomeNotifications;