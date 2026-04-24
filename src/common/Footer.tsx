'use client';
import { Mail, Phone, Linkedin, Globe, Heart, Link } from "lucide-react";

export default function Footer() {
    return (
        <footer className="pb-10 px-4">
            <div className="max-w-6xl mx-auto">
                {/* الخط الفاصل الجمالي */}
                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-brand-border to-transparent mb-12 opacity-50" />

                <div className="glass-card p-8 md:p-12 border-primary relative overflow-hidden group">
                    {/* لمسة خلفية فنية (Glow effect) */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-primary/10 blur-[100px] rounded-full group-hover:bg-brand-primary/20 transition-colors duration-700" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        {/* الجزء الشمال: الهوية */}
                        <div className="space-y-4 text-center md:text-left">
                            <h4 className="text-2xl font-black text-primary tracking-tight">
                                Developed By <span className="text-brand">Youssef Mahmoud</span>
                            </h4>
                            <p className="text-secondary text-sm max-w-sm leading-relaxed font-medium italic">
                                Front-End Developer passionate about building high-performance web applications and automated workflows.
                            </p>

                            {/* روابط السوشيال ميديا السريعة */}
                            <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
                                <a href="https://www.linkedin.com/in/youssefmahmoud1/" target="_blank" className="p-2 bg-tertiary rounded-full text-secondary hover:text-brand hover:scale-110 transition-all">
                                    <Linkedin size={20} />
                                </a>
                                <a href="https://portfolio-nextjs-iota-eight.vercel.app/" target="_blank" className="p-2 flex justify-center items-center bg-tertiary rounded-full text-secondary hover:text-brand hover:scale-110 transition-all">
                                    <Globe size={20} />
                                    <span> اعمالي الاخري</span>
                                </a>
                                <a href="mailto:yousefmahmoud150@gmail.com" className="p-2 bg-tertiary rounded-full text-secondary hover:text-brand hover:scale-110 transition-all">
                                    <Mail size={20} />
                                </a>
                            </div>
                        </div>

                        {/* الجزء اليمين: معلومات التواصل المباشر */}
                        <div className="flex flex-col gap-4 items-center md:items-end">
                            <a
                                href="mailto:yousefmahmoud150@gmail.com"
                                className="group flex items-center gap-3 px-6 py-3 bg-tertiary rounded-2xl border border-transparent hover:border-brand/30 transition-all w-fit"
                            >
                                <div className="text-right">
                                    <p className="text-[10px] text-muted font-bold uppercase tracking-widest">Get in touch</p>
                                    <p className="text-primary font-medium">yousefmahmoud150@gmail.com</p>
                                </div>
                                <div className="p-2 bg-primary rounded-lg text-brand group-hover:bg-brand group-hover:text-white transition-colors">
                                    <Mail size={18} />
                                </div>
                            </a>

                            <a
                                href="https://wa.me/201554464169"
                                className="group flex items-center gap-3 px-6 py-3 bg-tertiary rounded-2xl border border-transparent hover:border-brand-success/30 transition-all w-fit"
                            >
                                <div className="text-right">
                                    <p className="text-[10px] text-muted font-bold uppercase tracking-widest">WhatsApp Me</p>
                                    <p className="text-primary font-medium">01554464169</p>
                                </div>
                                <div className="p-2 bg-primary rounded-lg text-brand-success group-hover:bg-brand-success group-hover:text-white transition-colors">
                                    <Phone size={18} />
                                </div>
                            </a>
                        </div>
                    </div>

                    {/* الحقوق والـ Credits */}
                    <div className="mt-12 pt-6 border-t border-secondary flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-muted text-xs font-medium">
                            © {new Date().getFullYear()} All Rights Reserved
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}