import { supabase } from '@/lib/supabase/client';
import React, { useState } from 'react';

interface Error {
    message: string;
}

export default function LoginModal() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // const handleSubmit = async (e: React.FormEvent) => {
    //     e.preventDefault();
    //     setLoading(true);
    //     setMessage(null);

    //     try {
    //         const { error } = await supabase.auth.signInWithOtp({
    //             email,
    //             options: {
    //                 // Ensures the user is redirected back to your site after clicking the link
    //                 emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : '',
    //             },
    //         });

    //         if (error) throw error;

    //         setMessage({
    //             type: 'success',
    //             text: 'Check your email! We sent you a secure login link.'
    //         });
    //     } catch (error: unknown) {
    //         const err = error as Error;
    //         setMessage({
    //             type: 'error',
    //             text: err.message || 'Failed to send magic link. Please try again.'
    //         });
    //     } finally {
    //         setLoading(false);
    //     }
    // };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            if (isSignUp) {
                // SIGN UP LOGIC
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                setMessage({ type: 'success', text: 'Registration successful! Check your email for verification.' });
            } else {
                // LOGIN LOGIC
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                setMessage({ type: 'success', text: 'Welcome back!' });
            }
        } catch (error: unknown) {
            const err = error as Error;
            console.log("🚀 ~ handleSubmit ~ error:", error)
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="w-full max-w-md mx-auto p-8 rounded-2xl border border-brand-border shadow-2xl ring-1 ring-brand-border/50">
            <div className="flex flex-col items-center mb-8">
                {/* Icon */}
                <div className="w-12 h-12 bg-brand-primary rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-brand-primary/20">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>

                <h2 className="text-3xl font-bold text-brand-text tracking-tight text-center">
                    Magic Link Login
                </h2>
                <p className="text-brand-text-muted mt-2 text-center text-sm">
                    Enter your email and we&apos;ll send a secure link to your inbox. No password required.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label htmlFor='email' className="text-sm font-semibold text-brand-text ml-1">
                        Email Address
                    </label>
                    <input
                        id='email'
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3.5 rounded-xl bg-brand-secondary border border-brand-border text-brand-text focus:ring-2 focus:ring-brand-primary/40 outline-none transition-all placeholder:text-brand-text-muted/30"
                        placeholder="name@example.com"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-brand-text ml-1">
                        Password
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3.5 rounded-xl bg-brand-secondary border border-brand-border text-brand-text focus:ring-2 focus:ring-brand-primary/40 outline-none transition-all placeholder:text-brand-text-muted/30"
                        placeholder="Enter your password"
                        required
                    />
                </div>

                <button
                    disabled={loading}
                    type="submit"
                    className="w-full bg-brand-primary hover:opacity-90 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-brand-primary/20 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Sending...
                        </span>
                    ) : 'Send Magic Link'}
                </button>
            </form>
            <div className="mt-6 text-center">
                <button
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-sm text-brand-text-muted hover:text-brand-primary transition-colors"
                >
                    {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                </button>
            </div>

            {message && (
                <div className={`mt-6 p-4 rounded-xl text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${message.type === 'success'
                    ? 'bg-brand-success/10 text-brand-success border border-brand-success/20'
                    : 'bg-brand-error/10 text-brand-error border border-brand-error/20'
                    }`}>
                    {message.type === 'success' ? (
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    ) : (
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    )}
                    <span>{message.text}</span>
                </div>
            )}
        </div>
    );
}