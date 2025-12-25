import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginModal() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const { user, loading: authLoading } = useAuth();
    console.log("🚀 ~ LoginModal ~ user:", user)


    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                // Change this to your production URL later
                emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : '',
            },
        });

        if (error) {
            setMessage({ type: 'error', text: error.message });
        } else {
            setMessage({ type: 'success', text: 'Check your email for the login link!' });
        }
        setLoading(false);
    };

    const handleLogout = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signOut();
        if (error) console.error('Error logging out:', error);
        setLoading(false);
    };

    if (user?.id) {
        return <div>
            <h2 className="text-2xl font-bold text-primary mb-6 text-center">Welcome Back</h2>
            <button disabled={loading} className={`${loading ? 'bg-auto' : 'bg-secondary'}`} onClick={handleLogout}>Logout</button>
        </div>
    }

    return (
        <div className="max-w-md mx-auto p-6 bg-primary rounded-xl border border-secondary shadow-lg">
            <h2 className="text-2xl font-bold text-primary mb-6 text-center">Welcome Back</h2>

            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-muted mb-1">Email Address</label>
                    <input
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 rounded-lg bg-secondary border border-secondary text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <button
                    disabled={loading}
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
                >
                    {loading ? 'Sending link...' : 'Send Magic Link'}
                </button>
            </form>

            <div className="relative my-8">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-secondary"></span></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-primary px-2 text-muted">Or continue with</span></div>
            </div>

            {message && (
                <div className={`mt-4 p-3 rounded text-sm text-center ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message.text}
                </div>
            )}
        </div>
    );
}