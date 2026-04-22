'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Loader2, Users } from 'lucide-react';

interface ReferralUser {
    full_name: string;
    total_zikr_count: number;
}

const MyImpact = ({ currentUserId }: { currentUserId: string }) => {
    const [referrals, setReferrals] = useState<ReferralUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalImpact, setTotalImpact] = useState(0);

    useEffect(() => {
        const fetchReferrals = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('full_name, total_zikr_count')
                .eq('referred_by', currentUserId);

            if (error) {
                console.error('Error fetching referrals:', error);
            } else if (data) {
                setReferrals(data);
                const total = data.reduce((sum, user) => sum + (user.total_zikr_count || 0), 0);
                setTotalImpact(total);
            }
            setLoading(false);
        };

        fetchReferrals();
    }, [currentUserId]);

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="animate-spin h-8 w-8 text-brand" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* بطاقة إجمالي الأثر - تعتمد على bg-brand و text-white */}
            <div className="bg-primary border-brand border p-6 rounded-2xl shadow-lg">
                <p className="text-sm opacity-90 font-medium">كل ذكر يقوله المستخدم الاخر يصبح في ميزان حسناتك إن شاء الله وتستطيع ان تراه هنا</p>
                <h3 className="text-lg mt-2 opacity-90 font-medium">إجمالي الأثر الذي حققته</h3>
                <p className="text-4xl font-bold mt-2">{totalImpact} ذكر</p>
                <p className="text-sm mt-2 text-primary">
                    أصدقائك الذين يستخدمون التطبيق عن طريقك : <span className="text-brand font-bold">{referrals.length}</span>
                </p>
            </div>

            {/* قائمة المدعوين */}
            {
                referrals.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="text-lg font-bold flex items-center gap-2 text-primary">
                            <Users className="w-5 h-5 text-brand" />
                            أصدقاؤك المشاركون
                        </h3>

                        {referrals.length === 0 ? (
                            <p className="text-muted text-sm">
                                لم يقم أحد بالتسجيل عبر رابطك بعد. شارك الرابط وابدأ الأثر!
                            </p>
                        ) : (
                            referrals.map((user, index) => (
                                <div
                                    key={index}
                                    className="flex justify-between items-center p-4 bg-secondary border border-primary rounded-xl transition-all"
                                >
                                    <span className="font-medium text-primary">{user.full_name || 'مستخدم جديد'}</span>
                                    <span className="font-bold text-brand bg-brand/10 px-3 py-1 rounded-full text-sm">
                                        {user.total_zikr_count || 0} ذكر
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                )}
        </div>
    );
};

export default MyImpact;