import React, { JSX, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, LucideIcon } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastConfig {
    icon: LucideIcon;
    bg: string;
}

interface UseToastReturn {
    ToastContainer: () => JSX.Element;
    toast: (message: string, duration?: number) => void;
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
}

const useToast = (): UseToastReturn => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = (message: string, type: ToastType = 'info', duration: number = 3000): void => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);

        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(toast => toast.id !== id));
            }, duration);
        }
    };

    const removeToast = (id: number): void => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const ToastContainer = (): JSX.Element => (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
            {toasts.map(toast => {
                const config: Record<ToastType, ToastConfig> = {
                    success: { icon: CheckCircle, bg: 'bg-green-500' },
                    error: { icon: AlertCircle, bg: 'bg-red-500' },
                    warning: { icon: AlertTriangle, bg: 'bg-yellow-500' },
                    info: { icon: Info, bg: 'bg-blue-500' }
                };

                const { icon: Icon, bg } = config[toast.type];

                return (
                    <div key={toast.id} className={`${bg} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]`}>
                        <Icon size={20} />
                        <span className="flex-1 text-sm font-medium">{toast.message}</span>
                        <button onClick={() => removeToast(toast.id)} className="hover:opacity-70">
                            <X size={18} />
                        </button>
                    </div>
                );
            })}
        </div>
    );

    return {
        ToastContainer,
        toast: (message: string, duration?: number) => addToast(message, 'info', duration),
        success: (message: string, duration?: number) => addToast(message, 'success', duration),
        error: (message: string, duration?: number) => addToast(message, 'error', duration),
        warning: (message: string, duration?: number) => addToast(message, 'warning', duration)
    };
};

export default useToast;