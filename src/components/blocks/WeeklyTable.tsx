import { SubTask, WeeklyTask } from "@/types";
import React, { useRef, useState } from "react";
import { CalendarDays, Check, ChevronDown, Loader, Loader2, Trash, X } from "lucide-react";
import { getWeekDays } from "@/lib/utils";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { WeeklyTasksService } from "@/services/weeklyTasksService";
import { updateSubTaskAction } from "@/store/weeklyTasksSlice";
import SubTaskCard from "@/common/Tasks/SubTask";
import UpdateMainTaskModal from "@/common/Tasks/UpdateMainTaskModal";
import { fireCompletionCelebration } from "@/features/health/components/fireCompletionCelebration";


interface WeeklyTableProps {
  task: WeeklyTask;
  onUpdate: (taskid: string, updates: Partial<WeeklyTask>) => void;
  onDelete: (taskId: string) => void;
  loading: boolean;
}

const WeeklyTable = ({ task, onUpdate, onDelete, loading }: WeeklyTableProps) => {

  const { error } = useSelector((state: RootState) => state.weeklyTasks)

  const [updateSubTaskLoading, setUpdateSubTaskLoading] = useState(false);
  const [weekDaysOpen, setWeekDaysOpen] = useState(false);
  const weekDays = getWeekDays();

  const deleteDialogRef = useRef<HTMLDialogElement | null>(null)

  const dispatch = useDispatch();


  const handleSubTaskToggle = async (subTask: SubTask, newState: boolean, day: string) => {
    setUpdateSubTaskLoading(true);
    const todayKey = new Date().toLocaleDateString('en-US', { weekday: 'short' });

    const allSubTasksDone = task.sub_tasks?.every((st) => {
      if (st.id === subTask.id) return newState;
      return st.days_completed?.[todayKey];
    });

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

      // Only mark the main day done. Never flip it off if it is already complete.
      if (allSubTasksDone && newState && !task.days?.[day]) {
        markDayDone(day);
      }

    } catch (err) {
      console.error("Failed to update subtask:", err);
    }
    setUpdateSubTaskLoading(false);
  };

  const markDayDone = (day: string) => {
    if (task.days?.[day]) return;
    onUpdate(task.id, {
      days: {
        ...(task.days || {}),
        [day]: true,
      },
    });
  };

  const toggleDay = (day: string) => {
    const currentDays = task.days || {};
    onUpdate(task.id, {
      days: {
        ...currentDays,
        [day]: !currentDays[day],
      },
    });
  };

  const markAllSubTasksDone = async (day: string) => {
    const pending = (task.sub_tasks ?? []).filter((st) => st.id && !st.days_completed?.[day]);
    if (pending.length === 0) return;

    setUpdateSubTaskLoading(true);
    try {
      await Promise.all(
        pending.map(async (st) => {
          const updatedDays = {
            ...(st.days_completed || {}),
            [day]: true,
          };
          await WeeklyTasksService.updateSubTask(st.id!, { days_completed: updatedDays });
          dispatch(updateSubTaskAction({
            taskId: task.id,
            subTaskId: st.id!,
            updates: { days_completed: updatedDays },
          }));
        })
      );
    } catch (err) {
      console.error("Failed to update subtask:", err);
    }
    setUpdateSubTaskLoading(false);
  };

  const today = new Date();
  const todayDayName = today.toLocaleDateString('en-US', { weekday: 'short' }); // "Wed" not "Wednesday"
  const isTodayDone = Boolean(task.days?.[todayDayName]);

  const handleMainDayClick = () => {
    const turningOn = !isTodayDone;
    toggleDay(todayDayName);
    if (turningOn) {
      void markAllSubTasksDone(todayDayName);
      void fireCompletionCelebration();
    }
  };

  const subTasksLoading = loading || task.sub_tasks === undefined;
  const subTasks = task.sub_tasks ?? [];

  return (
    <>
      <div className="group relative bg-primary rounded-xl shadow-sm px-2 pb-1 overflow-visible hover:shadow-md transition-all duration-200">
        {/* Header Section */}
        {error[task.id] && (
          <p className="text-red-500 text-sm mt-1">{error[task.id]}</p>
        )}

        <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 p-2 mb-2 flex-wrap">
            <h3 className="lg:text-xl">- {task.content || "Untitled Task"}</h3>
            <button
              type="button"
              onClick={handleMainDayClick}
              className={`relative day-btn-3d day-btn-3d-md shrink-0 ${
                isTodayDone ? "day-btn-3d-on" : "day-btn-3d-off"
              }`}
              aria-label={isTodayDone ? "Mark today incomplete" : "Mark today complete"}
            >
              {!isTodayDone && (
                <span className="absolute -top-0.5 -right-0.5 z-10 flex size-2 pointer-events-none">
                  <span
                    className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75"
                    aria-hidden
                  />
                  <span
                    className="relative inline-flex size-2 rounded-full bg-success"
                    aria-hidden
                  />
                </span>
              )}
              <span className="day-btn-3d-shadow" />
              <span className="day-btn-3d-edge" />
              <span className="day-btn-3d-front">
                {isTodayDone ? (
                  <span className="text-xs font-bold leading-none">✓</span>
                ) : (
                  <span className="text-base leading-none">🎯</span>
                )}
              </span>
            </button>
          </div>


          <div className="flex items-center p-2 bg-linear-to-r from-secondary to-primary">
            <div className="flex items-center gap-2">
              <UpdateMainTaskModal task={task} onUpdate={onUpdate} />
              <button
                type="button"
                onClick={() => deleteDialogRef.current?.showModal()}
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-brand-error)_20%,transparent)] text-[var(--color-brand-error)] transition-all duration-200 hover:bg-[color-mix(in_srgb,var(--color-brand-error)_35%,transparent)] active:scale-95 shadow-sm"
                aria-label="Delete task"
              >
                <Trash size={16} strokeWidth={2.25} />
              </button>
            </div>
          </div>


        </div>


        {task.description && (
          <p className="text-muted text-sm m-1 italic">
            {task.description}
          </p>
        )}

        {subTasksLoading ? (
          <div className="flex items-center gap-2 p-2 text-muted">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            <span className="text-xs">جاري تحميل المهام الفرعية...</span>
          </div>
        ) : subTasks.length > 0 ? (
          subTasks.map((st) => (
            <SubTaskCard
              key={st.id}
              subTask={st}
              dayKey={todayDayName}
              onToggle={(id, state) => handleSubTaskToggle(st, state, todayDayName)}
              loading={updateSubTaskLoading}
            />
          ))
        ) : (
          <p className="text-xs text-muted italic p-1">لا توجد مهام فرعية.</p>
        )}

        <div className="mt-1 pt-2">
          <button
            type="button"
            onClick={() => setWeekDaysOpen((open) => !open)}
            aria-expanded={weekDaysOpen}
            aria-label={weekDaysOpen ? "إخفاء أيام الأسبوع" : "عرض أيام الأسبوع"}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-muted transition-colors hover:bg-tertiary/60 hover:text-primary"
          >
            <CalendarDays size={16} strokeWidth={2} />
            <span className="text-xs font-medium">عملت اي ؟</span>
            <ChevronDown
              size={16}
              strokeWidth={2.25}
              className={`shrink-0 transition-transform duration-200 ${weekDaysOpen ? "rotate-180" : ""}`}
              aria-hidden
            />
          </button>

          {weekDaysOpen && (
            <div className="mt-2 flex flex-wrap items-end justify-center gap-1.5 px-1 pb-2">
              {weekDays.map((day) => {
                const done = Boolean(task.days?.[day]);
                const isToday = day === todayDayName;

                return (
                  <div key={day} className="flex flex-col items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => toggleDay(day)}
                      disabled={loading}
                      aria-label={`${day}: ${done ? "مكتمل" : "غير مكتمل"}`}
                      className={`flex size-6 shrink-0 items-center justify-center rounded-full border transition-all active:scale-95 disabled:opacity-50 ${
                        done
                          ? "border-success bg-success text-white shadow-sm shadow-success/30"
                          : "border-secondary bg-tertiary/50 text-muted"
                      } ${isToday ? "ring-1 ring-brand" : ""}`}
                    >
                      {done ? (
                        <Check size={11} strokeWidth={3} aria-hidden />
                      ) : (
                        <X size={10} strokeWidth={2.5} aria-hidden />
                      )}
                    </button>
                    <span
                      className={`text-[8px] font-bold uppercase ${isToday ? "text-brand" : "text-muted"}`}
                    >
                      {day}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {loading && (
          <div className="absolute z-10 rounded-2xl flex justify-center items-center inset-0 w-full h-full bg-brand-text-muted/50">
            <div className="loader-2" />
          </div>
        )}
      </div>

      <dialog ref={deleteDialogRef}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-brand-bg rounded-2xl"
      >
        <div
          className="w-full flex flex-col gap-4 max-w-md mx-auto p-8 rounded-2xl border border-brand-border shadow-2xl ring-1 ring-brand-border/50">

          <p className="text-lg font-semibold mb-4 text-brand-error">Are you sure you want to delete this task?</p>
          <button
            disabled={loading}
            className={`p-3 bg-brand-error ${loading && 'bg-brand-success/50'} gap-3 rounded-full w-full text-brand-text transition-colors shadow-lg border border-primary flex justify-center items-center`}

            onClick={() => onDelete(task.id)}>Yes {loading && <Loader />} </button>
          <button
            className="p-3 bg-brand-success/20 rounded-full w-full text-brand-text transition-colors shadow-lg border border-primary"
            onClick={() => deleteDialogRef.current?.close()}>No</button>
        </div>
      </dialog>
    </>
  );
}

export default React.memo(WeeklyTable)