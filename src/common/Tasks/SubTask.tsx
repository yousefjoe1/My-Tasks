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
                className={` flex-1
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
                        className={`field mx-2 w-48 max-w-64 text-sm font-medium ${isCompleted ? "line-through opacity-70" : ""}`}
                        autoComplete="off"
                    />
                ) : (
                    <li className={`
                        text-xs mx-2 font-medium transition-all duration-300 
                        ${isCompleted ? 'text-primary line-through opacity-70' : 'text-primary'}
                    `}>
                        {subTask.content}
                    </li>
                )}

                {/* Custom Checkbox */}
                {(!isEditing || loading) && (
                    <div className='h-6 w-6'>
                        {loading ? (
                            <Loader2 className="w-4 h-4 text-brand animate-spin" />
                        ) : (
                            <div className={`check ${isCompleted ? "check-on" : ""}`}>
                                {isCompleted && (
                                    <Check className="w-3.5 h-3.5" />
                                )}
                            </div>
                        )}
                    </div>
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
                        className="btn btn-icon mx-2"
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
                        className="btn btn-icon btn-danger"
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
                            className="btn btn-icon check-on"
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
                            className="btn btn-icon btn-danger"
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