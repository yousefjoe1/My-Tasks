import { useToast } from '@/components/Toasts/useToast';
import { useAuth } from '@/contexts/AuthContext';
import { api, ApiError } from '@/lib/api/api';
import React, { useState } from 'react';

type MessageType = 'success' | 'error'
interface Message { type: MessageType; text: string; }

function authErrorText(code: string) {
    if (code === 'invalid_credentials') return 'البريد أو كلمة المرور غير صحيحة';
    if (code === 'email_already_registered') return 'هذا البريد مسجل بالفعل';
    if (code === 'validation_error') return 'تحقق من البيانات. كلمة المرور 8 أحرف على الأقل';
    return 'حدث خطأ ما';
}

export default function LoginModal({ closeModal }: { closeModal: () => void, referredByQuery?: string | null }) {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState(''); // حقل الاسم
    const [isSignUp, setIsSignUp] = useState(false);
    const [message, setMessage] = useState<Message | null>(null);
    const { error: toastError, success: toastSuccess } = useToast();
    const { login } = useAuth();


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            if (isSignUp) {
                await api.post('/auth/register', { email, password, fullName });
                setMessage({ type: 'success', text: 'تم التسجيل بنجاح. سجل الدخول الآن.' });
                toastSuccess('تم التسجيل بنجاح!');
                setIsSignUp(false);
            } else {
                await login(email, password);
                setMessage({ type: 'success', text: 'أهلاً بك مجدداً!' });
                toastSuccess('أهلاً بك مجدداً!');
                closeModal();
            }
        } catch (error: unknown) {
            const text = error instanceof ApiError ? authErrorText(error.code) : 'حدث خطأ ما';
            toastError(text);
            setMessage({ type: 'error', text });
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
                            className="field"
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
                        className="field"
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
                        className="field"
                            placeholder="••••••••"
                            minLength={isSignUp ? 8 : undefined}
                            required
                        />
                </div>

                <button disabled={loading} type="submit" className="btn btn-primary w-full">
                    {loading ? 'جاري المعالجة...' : (isSignUp ? 'تسجيل' : 'دخول')}
                </button>
            </form>

            {/* هنا كود عرض الرسائل */}
            {message && (
                <div className={`mt-6 p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-brand-success/15 text-brand-success' : 'bg-brand-error/15 text-brand-error'}`}>
                    {message.text}
                </div>
            )}

            <button onClick={() => setIsSignUp(!isSignUp)} className="btn btn-ghost mt-6 w-full text-sm">
                {isSignUp ? 'لديك حساب بالفعل؟ سجل دخول' : "ليس لديك حساب؟ سجل الآن"}
            </button>
        </div>
    );
}