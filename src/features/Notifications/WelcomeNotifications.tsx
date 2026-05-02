'use client';
import { useEffect } from 'react';
// تأكد من استيراد الـ toast اللي بتستخدمه في مشروعك
import { useToast } from '@/components/Toasts/useToast';
import ToastContainer from '@/components/Toasts/ToastContainer';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { userOpenedApp } from '@/actions/general.actions';

const WelcomeNotifications = () => {
    const { toast, toasts, removeToast } = useToast()

    const searchParams = useSearchParams();

    const { user } = useAuth();


    const userEnteredTheApp = async () => {
        if (user) {
            const res = await userOpenedApp(user.id);
            if (res === 'admin') {

            }
        }
    }

    useEffect(() => {
        const refId = searchParams.get('ref');
        if (refId) {
            // حفظ الـ ID في localStorage ليظل موجوداً حتى عملية التسجيل
            localStorage.setItem('referred_by', refId);
        }
    }, [searchParams]);

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