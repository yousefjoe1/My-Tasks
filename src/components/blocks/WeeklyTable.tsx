import { SubTask, WeeklyTask } from "@/types";
import { getWeekDates, getWeekDays } from "@/lib/utils";
import { format } from "date-fns";
import React, { useRef, useState } from "react";
import { Loader, Trash, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import TodayBadge from "@/common/TodayBadge";
import { WeeklyTasksService } from "@/services/weeklyTasksService";
import { updateSubTaskAction } from "@/store/weeklyTasksSlice";
import SubTaskCard from "@/common/Tasks/SubTask";
import UpdateMainTaskModal from "@/common/Tasks/UpdateMainTaskModal";


interface WeeklyTableProps {
  task: WeeklyTask;
  onUpdate: (taskid: string, updates: Partial<WeeklyTask>) => void;
  onDelete: (taskId: string) => void;
  loading: boolean;
}

const WeeklyTable = ({ task, onUpdate, onDelete, loading }: WeeklyTableProps) => {

  const { error } = useSelector((state: RootState) => state.weeklyTasks)

  const weekDays = getWeekDays();
  const weekDates = getWeekDates();

  const [updateSubTaskLoading, setUpdateSubTaskLoading] = useState(false);

  const deleteDialogRef = useRef<HTMLDialogElement | null>(null)

  const dispatch = useDispatch();


  // const handleSubTaskToggle = async (subTask: SubTask, newState: boolean, day: string) => {
  //   setUpdateSubTaskLoading(true);
  //   const todayKey = new Date().toLocaleDateString('en-US', { weekday: 'short' });

  //   const updatedDays = {
  //     ...(subTask.days_completed || {}),
  //     [todayKey]: newState
  //   };

  //   try {
  //     await WeeklyTasksService.updateSubTask(subTask.id!, { days_completed: updatedDays });

  //     dispatch(updateSubTaskAction({
  //       taskId: task.id,
  //       subTaskId: subTask.id!,
  //       updates: { days_completed: updatedDays }
  //     }));

  //     // check if all sub tasks today done , then update the main task
  //     const allSubTasksDone = task.sub_tasks?.every((st) => st.days_completed?.[todayKey]);
  //     console.log("🚀 ~ handleSubTaskToggle ~ allSubTasksDone:", allSubTasksDone)
  //     if (allSubTasksDone) {
  //       toggleDay(day)
  //     }

  //   } catch (err) {
  //     console.error("Failed to update subtask:", err);
  //   }
  //   setUpdateSubTaskLoading(false);
  // };

  const handleSubTaskToggle = async (subTask: SubTask, newState: boolean, day: string) => {
    setUpdateSubTaskLoading(true);
    const todayKey = new Date().toLocaleDateString('en-US', { weekday: 'short' });

    // --- الحل هنا ---
    // بدلاً من الاعتماد على الـ Props، احسب النتيجة بناءً على الـ newState اللي المستخدم لسه ضاغط عليها
    const allSubTasksDone = task.sub_tasks?.every((st) => {
      // لو دي المهمة اللي المستخدم لسه ضاغط عليها، استخدم الـ newState الجديدة
      if (st.id === subTask.id) return newState;
      // غير كده، استخدم الحالة الحالية الموجودة في الـ Props
      return st.days_completed?.[todayKey];
    });

    console.log("Will all subtasks be done?", allSubTasksDone);

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

      // دلوقتي هيشتغل من أول مرة لأن allSubTasksDone محسوبة بناءً على الـ Input الجديد
      if (allSubTasksDone) {
        toggleDay(day);
      }

    } catch (err) {
      console.error("Failed to update subtask:", err);
    }
    setUpdateSubTaskLoading(false);
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


  const today = new Date();
  const todayDayName = today.toLocaleDateString('en-US', { weekday: 'short' }); // "Wed" not "Wednesday"



  const isToday = (day: string) => {
    return day === todayDayName;
  }

  return (
    <>
      <div className="group relative bg-primary rounded-xl shadow-sm border border-primary hover:shadow-md transition-all duration-200">
        {/* Header Section */}
        {error[task.id] && (
          <p className="text-red-500 text-sm mt-1">{error[task.id]}</p>
        )}
        <div className="flex items-center justify-between p-2 bg-linear-to-r from-secondary to-primary">
          <div className="flex items-center justify-between w-full gap-3 flex-wrap">
            <UpdateMainTaskModal task={task} onUpdate={onUpdate} />
            <button
              onClick={() => deleteDialogRef.current?.showModal()}
              className="transition-all duration-200 px-1 py-1 text-sm bg-error text-white rounded-lg hover:bg-red-600 active:scale-95 font-medium shadow-sm"
            >
              <Trash size={18} />
            </button>
          </div>

        </div>

        <h3 className="p-2 lg:text-xl mb-2">- {task.content || "Untitled Task"}</h3>
        {task.description && (
          <p className="text-muted text-sm m-1 italic">
            {task.description}
          </p>
        )}

        {task.sub_tasks && task.sub_tasks.length > 0 ? (
          task.sub_tasks.map((st) => (
            <SubTaskCard
              key={st.id}
              subTask={st}
              dayKey={todayDayName} // اليوم الحالي اللي انت عرفته فوق بـ "Wed" مثلاً
              onToggle={(id, state) => handleSubTaskToggle(st, state, todayDayName)}
              loading={updateSubTaskLoading}
            />
          ))
        ) : (
          <p className="text-xs text-muted italic p-1">لا توجد مهام فرعية.</p>
        )}

        {/* Table Section */}
        {
          loading &&
          <div className="absolute z-10 rounded-2xl flex justify-center items-center inset-0 w-full h-full bg-brand-text-muted/50">
            <div className="loader-2" />
          </div>
        }
        <div className="overflow-x-auto relative ">
          <table className="w-full overflow-hidden rounded-b-xl min-w-[800px]">
            {/* Table Header */}
            <thead className="border-b border-secondary bg-secondary">
              <tr>
                {weekDays.map((day, index) => (
                  <th
                    key={day}
                    className="p-2 border-r border-secondary last:border-r-0 text-center"
                  >

                    <div className="flex flex-col">
                      <span className="font-semibold text-primary">{day}</span>
                      <span className="text-xs text-muted mt-1 normal-case">
                        {format(weekDates[index], "MMM dd")}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="bg-primary relative">
              <tr className="relative transition-all duration-200 hover:bg-tertiary/50">
                {weekDays.map((day) => (
                  <td
                    key={day}
                    className={[
                      "p-2 border-r relative border-secondary last:border-r-0 align-middle transition-colors",
                      task.days?.[day]
                        ? "bg-success/10 dark:bg-success/20"
                        : "bg-primary",
                    ].join(" ")}
                  >


                    <div className="flex justify-center mb-3">
                      {day === todayDayName && <TodayBadge />}

                    </div>
                    <div className="flex justify-center items-center">

                      <button
                        className={`day-btn-3d ${task.days?.[day] ? 'day-btn-3d-on' : 'day-btn-3d-off'}
                        ${!isToday(day) ? 'opacity-50' : ''}
                        `}
                        onClick={() => toggleDay(day)}
                        disabled={!isToday(day)}
                      >
                        <span className="day-btn-3d-shadow"></span>
                        <span className="day-btn-3d-edge"></span>
                        <div className="day-btn-3d-front">
                          {task.days?.[day] ? (
                            <span className="text-sm font-bold">✓</span>
                          ) : (
                            <span className="text-[10px]">

                              {!isToday(day) ?
                                <X color="red" /> :
                                <span className="text-2xl">
                                  🎯
                                </span>
                              }
                            </span>
                          )}
                        </div>
                      </button>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>

        </div>

        {/* Status Bar */}
        <div className="px-4 py-2 bg-secondary border-t border-secondary rounded-b-xl">
          <div className="flex justify-between items-center text-xs text-muted">
            <span>
              Completed {Object.values(task.days || {}).filter(Boolean).length}{" "}
              of {weekDays.length} days
            </span>
            <span className="text-muted">Click days to mark as complete</span>
          </div>
        </div>
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