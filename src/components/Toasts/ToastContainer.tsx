'use client';
import { CheckCircle, AlertCircle, Info, AlertTriangle, LucideIcon } from 'lucide-react';

import ToasItem from './ToasItem';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastConfig {
    icon: LucideIcon;
    bg: string;
}

const className = "glass-card"

interface Toast {
    id: number;
    message: string;
    type: ToastType;
    description?: string;
}

const ToastContainer = ({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: number) => void }) => {

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
            {toasts.map(toast => {
                const config: Record<ToastType, ToastConfig> = {
                    success: { icon: CheckCircle, bg: 'bg-green-400' },
                    error: { icon: AlertCircle, bg: 'bg-red-500' },
                    warning: { icon: AlertTriangle, bg: 'bg-yellow-500' },
                    info: { icon: Info, bg: 'bg-blue-500' }
                };

                const { bg } = config[toast.type];

                return (
                    <ToasItem
                        key={toast.id}
                        toast={toast}
                        removeToast={removeToast}
                        className={className}
                        bg={bg}
                    />
                );
            })}
        </div>
    )
}

export default ToastContainer