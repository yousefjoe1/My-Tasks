'use client';
import { SubTask } from '@/types';
import { Check, Loader2 } from "lucide-react";

interface SubTaskCardProps {
    subTask: SubTask;
    dayKey: string; // "Mon", "Tue", etc.
    onToggle: (subTaskId: string, newState: boolean) => void;
    loading?: boolean;
}

const SubTaskCard = ({ subTask, dayKey, onToggle, loading = false }: SubTaskCardProps) => {
    // حالة محلية للـ UI السريع (Optimistic UI)
    const isCompleted = subTask.days_completed?.[dayKey] || false;

    return (
        <div className='bg-primary-2/10 w-fit rounded-2xl m-2 p-1 px-3 flex'>


            <button
                onClick={() => onToggle(subTask.id!, !isCompleted)}
                className={`
                flex items-center gap-3 justify-between  rounded-xl cursor-pointer
                transition-all duration-300 group ${isCompleted
                        ? ' border border-primary-2/20'
                        : 'bg-tertiary/40 border border-transparent'}
            `}
                disabled={loading}
            >
                <li className={`
                text-sm mx-2 font-medium transition-all duration-300 
                ${isCompleted ? 'text-primary-2 line-through opacity-70' : 'text-primary'}
            `}>
                    {subTask.content}
                </li>

                {/* Custom Checkbox */}
                {
                    loading ?
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                        :
                        <div className={`
                w-6 h-6 rounded-lg border-2 flex items-center justify-center
                transition-all duration-300
                ${isCompleted
                                ? 'bg-primary-2 border-primary-2 shadow-[0_0_10px_rgba(96,165,250,0.5)]'
                                : 'border-secondary bg-transparent group-hover:border-primary-2/50'}
            `}>
                            {isCompleted && (
                                <Check className="w-4 h-4 text-white animate-in zoom-in duration-300" />
                            )}
                        </div>
                }
            </button>
        </div>
    );
};

export default SubTaskCard;