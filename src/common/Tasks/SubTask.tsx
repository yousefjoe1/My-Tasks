'use client';
import { SubTask } from '@/types';
import { Check, Loader2, Edit, X, Trash2 } from "lucide-react";
import React, { useState } from 'react';

interface SubTaskCardProps {
    subTask: SubTask;
    dayKey: string;
    onToggle: (subTaskId: string, newState: boolean) => void;
    onUpdateContent?: (subTaskId: string, newContent: string) => void;
    onDelete?: (subTaskId: string) => void; // New delete prop
    loading?: boolean;
}

const SubTaskCard = ({
    subTask,
    dayKey,
    onToggle,
    onUpdateContent,
    onDelete,
    loading = false
}: SubTaskCardProps) => {
    const isCompleted = subTask.days_completed?.[dayKey] || false;
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(subTask.content);
    const [saveLoading, setSaveLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleEdit = () => {
        setIsEditing(true);
        setEditContent(subTask.content);
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const handleSave = async () => {
        if (editContent.trim() === subTask.content || !onUpdateContent) return;

        setSaveLoading(true);
        try {
            await onUpdateContent(subTask.id!, editContent.trim());
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update subtask content:", error);
            setEditContent(subTask.content);
        } finally {
            setSaveLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!onDelete || !window.confirm(`هل أنت متأكد من حذف المهمة "${subTask.content}"؟`)) {
            return;
        }

        setDeleteLoading(true);
        try {
            await onDelete(subTask.id!);
        } catch (error) {
            console.error("Failed to delete subtask:", error);
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSave();
        } else if (e.key === "Escape") {
            setIsEditing(false);
            setEditContent(subTask.content);
        }
    };

    return (
        <div className='bg-primary-2/10 w-fit rounded-2xl m-2 p-1 px-3 flex'>
            <button
                onClick={() => onToggle(subTask.id!, !isCompleted)}
                className={`
                    flex items-center gap-3 justify-between rounded-xl cursor-pointer
                    transition-all duration-300 group ${isCompleted
                        ? 'border border-primary-2/20'
                        : 'bg-tertiary/40 border border-transparent'}
                `}
                disabled={loading || isEditing || saveLoading || deleteLoading}
            >
                {/* Content - either text or input */}
                {isEditing ? (
                    <input
                        ref={inputRef}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        onKeyDown={handleKeyPress}
                        onBlur={handleSave}
                        className={`
                            text-sm mx-2 font-medium bg-transparent border-0 text-primary outline-none
                            focus:ring-2 focus:ring-primary-2/50 rounded px-1 py-0.5
                            ${isCompleted ? 'line-through opacity-70' : ''}
                            w-48 max-w-64
                        `}
                        autoComplete="off"
                    />
                ) : (
                    <li className={`
                        text-sm mx-2 font-medium transition-all duration-300 
                        ${isCompleted ? 'text-primary-2 line-through opacity-70' : 'text-primary'}
                    `}>
                        {subTask.content}
                    </li>
                )}

                {/* Custom Checkbox */}
                {(!isEditing || loading) && (
                    <>
                        {loading ? (
                            <Loader2 className="w-4 h-4 text-white animate-spin" />
                        ) : (
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
                        )}
                    </>
                )}
            </button>

            {/* Action Buttons */}
            <div className='relative flex items-center gap-2 h-full'>
                {/* Edit Button - same as before */}
                {onUpdateContent && !isEditing && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleEdit();
                        }}
                        disabled={saveLoading || deleteLoading}
                        className="p-1.5 mx-2 rounded-lg
                           text-muted-foreground text-primary-2 bg-primary-2/10 
                           transition-all duration-200 active:scale-90"
                        title="تعديل المهمة"
                    >
                        <Edit className="w-3.5 h-3.5" />
                    </button>
                )}

                {/* Delete Button - EXACT SAME STYLE as Edit */}
                {onDelete &&
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete();
                        }}
                        disabled={saveLoading}
                        className="p-1.5 rounded-lg
                           text-muted-foreground text-primary-2 bg-primary-2/10 
                           transition-all duration-200 active:scale-90"
                        title="حذف المهمة"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                }

                {/* Save/Cancel buttons during editing */}
                {isEditing && (
                    <div className="absolute -right-1 top-1/2 -translate-y-1/2 flex items-center gap-1.5 
                        bg-background/80 backdrop-blur-md border border-primary 
                        p-1 rounded-xl shadow-xl animate-in fade-in zoom-in duration-200">

                        <button
                            onClick={handleSave}
                            disabled={!editContent.trim() || saveLoading}
                            className={`
                                flex items-center justify-center w-7 h-7 border rounded-lg transition-all
                                ${saveLoading
                                    ? 'opacity-50'
                                    : 'bg-success/15 text-success hover:bg-success text-white shadow-sm shadow-success/20'}
                            `}
                        >
                            {saveLoading ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                                <Check className="w-3.5 h-3.5 stroke-3" />
                            )}
                        </button>

                        <button
                            onClick={() => {
                                setIsEditing(false);
                                setEditContent(subTask.content);
                            }}
                            disabled={saveLoading}
                            className="flex items-center justify-center w-7 h-7 rounded-lg
                               text-red-500 bg-red-500/15 transition-all
                               active:scale-90"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubTaskCard;