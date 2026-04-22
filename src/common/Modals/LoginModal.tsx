import { useToast } from '@/components/Toasts/useToast';
import { supabase } from '@/lib/supabase/client';
import React, { useState } from 'react';

// تعريف أنواع الأخطاء والرسائل
interface Error { message: string; }
type MessageType = 'success' | 'error'
interface Message { type: MessageType; text: string; }

export default function LoginModal({ closeModal }: { closeModal: () => void }) {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState(''); // حقل الاسم
    const [isSignUp, setIsSignUp] = useState(false);
    const [message, setMessage] = useState<Message | null>(null);
    const { error: toastError, success: toastSuccess } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null); // مسح أي رسالة قديمة

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: { full_name: fullName } } // إرسال الاسم
                });
                if (error) throw error;
                setMessage({ type: 'success', text: 'تم التسجيل بنجاح!.' });
                toastSuccess('تم التسجيل بنجاح!');
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                setMessage({ type: 'success', text: 'أهلاً بك مجدداً!' });
                toastSuccess('أهلاً بك مجدداً!');
                closeModal();
            }
        } catch (error: unknown) {
            const err = error as Error;
            toastError(err.message || 'حدث خطأ ما');
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="lg:max-w-md bg-brand-bg w-[95%] mx-auto p-8 rounded-2xl border border-brand-border">
            <h2 className="text-3xl font-bold text-brand-text mb-8 text-center">
                {isSignUp ? 'إنشاء حساب' : 'تسجيل الدخول'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {isSignUp && (
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-brand-text">الاسم الكامل</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full p-3.5 rounded-xl bg-brand-secondary border border-brand-border text-brand-text"
                            placeholder="أحمد محمود"
                            required
                        />
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-brand-text">البريد الإلكتروني</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3.5 rounded-xl bg-brand-secondary border border-brand-border text-brand-text"
                        placeholder="name@example.com"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-brand-text">كلمة المرور</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3.5 rounded-xl bg-brand-secondary border border-brand-border text-brand-text"
                        placeholder="••••••••"
                        required
                    />
                </div>

                <button disabled={loading} type="submit" className="w-full bg-brand-primary text-white font-bold py-3.5 rounded-xl">
                    {loading ? 'جاري المعالجة...' : (isSignUp ? 'تسجيل' : 'دخول')}
                </button>
            </form>

            {/* هنا كود عرض الرسائل */}
            {message && (
                <div className={`mt-6 p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message.text}
                </div>
            )}

            <button onClick={() => setIsSignUp(!isSignUp)} className="mt-6 text-sm text-brand-primary w-full text-center">
                {isSignUp ? 'لديك حساب بالفعل؟ سجل دخول' : "ليس لديك حساب؟ سجل الآن"}
            </button>
        </div>
    );
}