'use client';
import { useState } from 'react';
import { ChevronRight, Bell, Target, Zap, HelpCircle, X, LayoutDashboard, ShieldCheck, Smartphone } from 'lucide-react';

export default function OnboardingWrapper() {
    const [showModal, setShowModal] = useState(false);
    const [step, setStep] = useState(0);

    const slides = [
        {
            title: "أهلاً بيك في قوتك اليومية",
            desc: "مكان بسيط يساعدك تلتزم بعاداتك من غير تعقيد، وبدون أي تشتيت.",
            icon: <Zap className="text-brand w-14 h-14" />
        },
        {
            title: "تنبيهات ذكية",
            desc: "عشان يومك يفضل ماشي صح، هنفكرك في أوقات محددة بأهم العادات زي الأذكار والرياضة.",
            icon: <Bell className="text-brand-success w-14 h-14" />
        },
        {
            title: "بساطة في التتبع",
            desc: "كل اللي عليك إنك تفتح التطبيق وتعلم على اليوم.. وبس! التكرار هو سر القوة.",
            icon: <Target className="text-brand w-14 h-14" />
        },
        // السلايدز الجديدة
        {
            title: "لوحة تحكم (Dashboard) متكاملة",
            desc: "تقدر تتابع تقدمك وتشوف كل إنجازاتك والأسابيع اللي فاتت في مكان واحد عشان تتحمس تكمل.",
            icon: <LayoutDashboard className="text-brand w-14 h-14" />
        },
        {
            title: "عاداتك الأساسية دايماً قدامك",
            desc: "خصصنا الصفحة الرئيسية للمهام الأساسية عشان تضمن إنك محافظ على أصل يومك مهما حصل.",
            icon: <ShieldCheck className="text-brand-success w-14 h-14" />
        },
        {
            title: "تطبيقك معاك في كل مكان",
            desc: "تقدر تثبت التطبيق على شاشة موبايلك أو الكمبيوتر بكل سهولة ، عشان توصله أسرع .",
            icon: <Smartphone className="text-brand w-14 h-14" />
        },
    ];

    const handleNext = () => {
        if (step < slides.length - 1) setStep(step + 1);
        else {
            setShowModal(false);
            setStep(0);
        }
    };

    return (
        <>
            {/* الزرار اللي بيفتح الـ Onboarding - متناسق مع الـ glass-card بتاعتك */}
            <button
                onClick={() => setShowModal(true)}
                className="flex  items-center gap-2 px-5 py-2.5 glass-card text-secondary hover:text-brand transition-all text-sm font-bold group"
            >
                <HelpCircle size={18} className="group-hover:rotate-12 transition-transform" />
                <span className='text-lg'>فهمّني أكتر</span>
            </button>

            {/* الـ Modal نفسه */}
            {showModal && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    {/* استخدمت glass-card هنا عشان تستفيد من الـ blur والـ border اللي أنت معرفهم */}
                    <div className="glass-card max-w-sm w-full p-8 text-center space-y-6 relative border-brand/30 shadow-2xl shadow-brand/20">

                        {/* زرار إغلاق سريع */}
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 p-1 text-muted hover:bg-tertiary rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>

                        {/* الأيقونة */}
                        <div className="flex justify-center">
                            <div className="p-4 rounded-full bg-secondary">
                                {slides[step].icon}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h2 className="text-2xl font-black text-primary tracking-tight">
                                {slides[step].title}
                            </h2>
                            <p className="text-primary text-lg leading-relaxed px-2 font-medium">
                                {slides[step].desc}
                            </p>
                        </div>

                        {/* مؤشر النقط (Dots Indicator) - يستخدم الـ Brand colors بتاعتك */}
                        <div className="flex justify-center gap-2 pt-2">
                            {slides.map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${i === step
                                        ? 'w-8 bg-brand shadow-[0_0_8px_var(--color-brand-primary)]'
                                        : 'w-2 bg-tertiary'
                                        }`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={handleNext}
                            className="w-full py-4 bg-brand text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-brand/20"
                            style={{ color: 'white' }} // لضمان الوضوح فوق لون الـ brand
                        >
                            <span className="text-lg">
                                {step === slides.length - 1 ? 'فهمت، يلا بينا!' : 'التالي'}
                            </span>
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}