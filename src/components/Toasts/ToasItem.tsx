import { X } from 'lucide-react';
import React from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';


interface Toast {
    id: number;
    message: string;
    type: ToastType;
    description?: string;
}

const ToasItem = (
    {
        toast,
        removeToast,
        className,
        bg,
    }: {
        toast: Toast;
        removeToast: (id: number) => void;
        className: string;
        bg: string;
    }
) => {
    return (
        <div dir='rtl' key={toast.id} className={`${toast.type == 'info' ? className : bg} animate-toast-in space-y-2 px-4 py-3 rounded-lg shadow-lg gap-3 min-w-[300px]`}>
            <div className="flex justify-between items-center">
                {/* <Icon size={20} /> */}
                <button onClick={() => removeToast(toast.id)} className="hover:opacity-70 border rounded-full p-1">
                    <X size={18} />
                </button>
            </div>
            <div className="flex flex-col">
                <span className="flex-1 text-md font-medium">{toast.message}</span>
                {toast.description && <span className="text-md">{toast.description}</span>}
            </div>
        </div>
    )
}

export default React.memo(ToasItem)