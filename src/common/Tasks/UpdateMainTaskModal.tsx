import { Edit, X } from 'lucide-react'
import React, { useRef, useState } from 'react'
import { SubTask, WeeklyTask } from '@/types'
import SubTaskCard from './SubTask';
import { useDispatch } from 'react-redux';
import { WeeklyTasksService } from '@/services/weeklyTasksService';
import { removeSubTaskAction, updateSubTaskAction } from '@/store/weeklyTasksSlice';
import AddSubTask from './AddSubTask';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

const UpdateMainTaskModal = ({ task, onUpdate }: { task: WeeklyTask, onUpdate: (taskId: string, updates: Partial<WeeklyTask>) => void }) => {
    const { loading } = useSelector((state: RootState) => state.weeklyTasks);

    const detailsModalRef = useRef<HTMLDialogElement | null>(null);
    const today = new Date();
    const todayDayName = today.toLocaleDateString('en-US', { weekday: 'short' }); // "Wed" not "Wednesday"
    const [updateSubTaskLoading, setUpdateSubTaskLoading] = useState(false);

    const [content, setContent] = useState(task.content);
    const [description, setDescription] = useState(task.description);
    const handleSave = () => {
        onUpdate(task.id, { content: content, description: description });
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSave();
        } else if (e.key === "Escape") {
            setContent(task.content);
        }
    };

    const dispatch = useDispatch();

    const handleSubTaskToggle = async (subTask: SubTask, newState: boolean) => {
        setUpdateSubTaskLoading(true);
        const todayKey = new Date().toLocaleDateString('en-US', { weekday: 'short' });

        const updatedDays = {
            ...(subTask.days_completed || {}),
            [todayKey]: newState
        };

        try {
            await WeeklyTasksService.updateSubTask(subTask.id!, { days_completed: updatedDays });

            dispatch(updateSubTaskAction({
                taskId: task.id,
                subTaskId: subTask.id!,
                updates: { days_completed: updatedDays }
            }));

        } catch (err) {
            console.error("Failed to update subtask:", err);
        }
        setUpdateSubTaskLoading(false);
    };

    const handleUpdateSubTaskContent = async (subTaskId: string, newContent: string) => {
        setUpdateSubTaskLoading(true);

        try {
            await WeeklyTasksService.updateSubTask(subTaskId, { content: newContent });

            dispatch(updateSubTaskAction({
                taskId: task.id,
                subTaskId: subTaskId,
                updates: { content: newContent }
            }));
        } catch (err) {
            console.error("Failed to update subtask content:", err);
            throw err; // Re-throw to handle in SubTaskCard
        } finally {
            setUpdateSubTaskLoading(false);
        }
    };
    const handleDeleteSubTask = async (subTaskId: string) => {
        setUpdateSubTaskLoading(true);

        try {
            await WeeklyTasksService.deleteSubTask(subTaskId); // You'll need to implement this in your service

            dispatch(removeSubTaskAction({
                taskId: task.id,
                subTaskId: subTaskId
            }));
        } catch (err) {
            console.error("Failed to delete subtask:", err);
            throw err;
        } finally {
            setUpdateSubTaskLoading(false);
        }
    };

    return (
        <div>
            <button
                onClick={() => detailsModalRef.current?.showModal()}
                className="text-lg font-semibold text-primary hover:text-brand cursor-pointer transition-colors duration-200 py-1 rounded-lg hover:bg-brand/10"
            >
                <Edit />
            </button>

            {/* dialog */}
            {/* Modal لإدارة المهام الفرعية */}
            <dialog
                ref={detailsModalRef}
                className="fixed inset-0 z-50 mx-auto bg-transparent p-0 backdrop:bg-black/60 backdrop:backdrop-blur-sm"
            >
                <div className="bg-primary border border-secondary max-w-lg mx-auto mt-[10vh] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                    {/* Header */}
                    <div className="p-6 bg-secondary/50 border-b border-secondary flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-bold text-brand">{task.content}</h3>
                            <p className="text-xs text-muted mt-1">{task.description || "لا يوجد وصف"}</p>
                        </div>
                        <button onClick={() => detailsModalRef.current?.close()} className="p-2 bg-tertiary rounded-full">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                        <div className="flex items-center flex-wrap gap-3 flex-1">
                            <div className="flex flex-col w-full gap-3">
                                <input
                                    type="text"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    className="flex-1 px-4 py-2 text-lg font-semibold border border-brand rounded-xl outline-none focus:ring-2 focus:ring-blue-200 focus:border-brand bg-primary text-primary transition-all placeholder:text-muted"
                                    autoFocus
                                    placeholder="Enter task name..."
                                />
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    className="flex-1 px-4 py-2 text-lg font-semibold border border-brand rounded-xl outline-none focus:ring-2 focus:ring-blue-200 focus:border-brand bg-primary text-primary transition-all placeholder:text-muted"
                                    autoFocus
                                    placeholder="Enter task description..."
                                />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    disabled={loading}
                                    onClick={handleSave}
                                    className={`px-4 py-2 text-sm flex items-center justify-center gap-2 ${loading ? 'bg-secondary' : 'bg-success'} text-white rounded-lg hover:bg-success/80 active:scale-95 transition-all font-medium shadow-sm ${loading ? 'opacity-50' : ''}`}
                                >
                                    Save {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                </button>
                                <button
                                    onClick={() => {
                                        detailsModalRef.current?.close();
                                    }}
                                    className="px-4 py-2 text-sm bg-secondary text-primary rounded-lg hover:bg-secondary active:scale-95 transition-all font-medium shadow-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                            {/* <TodayBadge /> */}
                            <span className="text-sm font-bold text-primary">مهام اليوم الفرعية</span>
                        </div>

                        <AddSubTask
                            taskId={task.id}
                            onSubTaskAdded={() => {
                                // Optional: Scroll to new subtask or refresh
                                console.log('New subtask added!');
                            }}
                        />

                        <div className="grid gap-3">
                            {task.sub_tasks?.map(st => (
                                <SubTaskCard
                                    key={st.id}
                                    subTask={st}
                                    dayKey={todayDayName}
                                    onToggle={(id, state) => handleSubTaskToggle(st, state)}
                                    onUpdateContent={handleUpdateSubTaskContent}
                                    onDelete={handleDeleteSubTask} // Add this line
                                    loading={updateSubTaskLoading}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </dialog>
        </div>
    )
}

export default UpdateMainTaskModal