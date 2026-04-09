import React from 'react';

const TodayBadge = () => {
    return (
        <div className="relative inline-block overflow-hidden p-[1px] rounded-full translate-z-0">
            {/* تعريف الأنميشن محلياً لضمان التشغيل */}
            <style>
                {`
          @keyframes eclipse-move {
            0% { transform: translateX(110%); }
            100% { transform: translateX(-110%); }
          }
          .animate-eclipse-custom {
            animation: eclipse-move 3s linear infinite;
          }
        `}
            </style>

            {/* طبقة التوهج الخارجية */}
            <div className="absolute inset-0 rounded-full overflow-hidden blur-[2px]">
                <div className="animate-eclipse-custom absolute inset-0 rounded-full -z-[1] bg-white opacity-60"></div>
            </div>

            {/* جسم الـ Badge الرئيسي */}
            <div className="relative rounded-full text-[10px] text-white font-medium bg-black/20 overflow-hidden">
                {/* الشعاع الداخلي المتحرك */}
                <div className="animate-eclipse-custom absolute inset-0 rounded-full bg-white/30 blur-[1px] -z-[1]"></div>

                {/* المحتوى النصي */}
                <div className="m-[1px] px-2 py-0.5 rounded-full bg-black/95 backdrop-blur-md flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-white shadow-[0_0_3px_white] animate-pulse" />
                    Today
                </div>
            </div>
        </div>
    );
};

export default TodayBadge;