'use client'

import { useToast } from '@/components/Toasts/useToast';
import { Copy, Check } from 'lucide-react';
import React, { useState } from 'react'

interface ShareAppProps {
    userId?: string | null;
}

const ShareApp = ({ userId }: ShareAppProps) => {
    const { error: toastError, success: toastSuccess } = useToast();
    const [isCopied, setIsCopied] = useState(false);

    const shareUrl = userId
        ? `https://my-tasks-inky.vercel.app/?ref=${userId}`
        : "https://my-tasks-inky.vercel.app/";

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setIsCopied(true);
            toastSuccess("لازم تسجل الاول عشان تتابع مين سجل تبعك");
            // إرجاع الزر لحالته الأصلية بعد ثانيتين
            setTimeout(() => {
                setIsCopied(false);
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
            alert("حدث خطأ أثناء نسخ الرابط.");
        }
    };

    return (
        <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all shadow-lg ${isCopied
                ? 'bg-green-600 text-white'
                : 'bg-brand text-white hover:opacity-90 shadow-brand/20'
                }`}
        >
            {isCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            <span>{isCopied ? "تم النسخ!" : "شارك التطبيق تكسب حسنات"}</span>
        </button>
    );
}

export default ShareApp