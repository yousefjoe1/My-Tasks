import { WeeklyTask } from "@/types";
import { getWeekDates, getWeekDays } from "@/lib/utils";
import { format } from "date-fns";
import React, { useRef, useState } from "react";
import { Edit, Loader, Trash } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";


interface WeeklyTableProps {
  task: WeeklyTask;
  onUpdate: (taskid: string, updates: Partial<WeeklyTask>) => void;
  onDelete: (taskId: string) => void;
  loading: boolean;
}

const WeeklyTable = ({ task, onUpdate, onDelete, loading }: WeeklyTableProps) => {

  const { error } = useSelector((state: RootState) => state.weeklyTasks)

  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(task.content);
  const weekDays = getWeekDays();
  const weekDates = getWeekDates();

  const deleteDialogRef = useRef<HTMLDialogElement | null>(null)


  const toggleDay = (day: string) => {
    const currentDays = task.days || {};
    onUpdate(task.id, {
      days: {
        ...currentDays,
        [day]: !currentDays[day],
      },
    });
  };

  const handleSave = () => {
    onUpdate(task.id, { content: content });
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setContent(task.content);
      setIsEditing(false);
    }
  };

  return (
    <>
      <div className="group relative mb-8 bg-primary rounded-xl shadow-sm border border-primary hover:shadow-md transition-all duration-200">
        {/* Header Section */}
        {error[task.id] && (
          <p className="text-red-500 text-sm mt-1">{error[task.id]}</p>
        )}
        <div className="flex items-center justify-between p-4 border-b border-secondary bg-linear-to-r from-secondary to-primary">
          {isEditing ? (
            <div className="flex items-center gap-3 flex-1">
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyPress}
                className="flex-1 px-4 py-2 text-lg font-semibold border border-brand rounded-xl outline-none focus:ring-2 focus:ring-blue-200 focus:border-brand bg-primary text-primary transition-all placeholder:text-muted"
                autoFocus
                placeholder="Enter task name..."
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm bg-success text-white rounded-lg hover:bg-success/80 active:scale-95 transition-all font-medium shadow-sm"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setContent(task.content);
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 text-sm bg-secondary text-white rounded-lg hover:bg-secondary active:scale-95 transition-all font-medium shadow-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full gap-3">
              <button
                className="text-lg font-semibold text-primary hover:text-brand cursor-pointer transition-colors duration-200 py-1 rounded-lg hover:bg-brand/10"
                onClick={() => setIsEditing(true)}
              >
                <Edit />
              </button>
              <button
                onClick={() => deleteDialogRef.current?.showModal()}
                className="transition-all duration-200 px-1 py-1 text-sm bg-error text-white rounded-lg hover:bg-red-600 active:scale-95 font-medium shadow-sm"
              >
                <Trash size={18} />
              </button>
            </div>
          )}
        </div>

        <h3 className="truncate p-2 text-xl my-5">Task Name: {content || "Untitled Task"}</h3>


        {/* Table Section */}
        <div className="overflow-x-auto ">
          <table className="w-full overflow-hidden rounded-b-xl min-w-[800px]">
            {/* Table Header */}
            <thead className="border-b border-secondary bg-secondary">
              <tr>
                {weekDays.map((day, index) => (
                  <th
                    key={day}
                    className="p-4 border-r border-secondary last:border-r-0 text-center"
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
              {
                loading &&
                <tr className="absolute z-10 rounded-2xl flex justify-center items-center inset-0 w-full h-full border ">
                  <td className="loader-2" />
                </tr>
              }
              <tr className="relative transition-all duration-200 hover:bg-tertiary/50">
                {weekDays.map((day) => (
                  <td
                    key={day}
                    className={[
                      "p-4 border-r border-secondary last:border-r-0 align-middle transition-colors",
                      task.days?.[day]
                        ? "bg-success/10 dark:bg-success/20"
                        : "bg-primary",
                    ].join(" ")}
                  >
                    <button
                      className={[
                        "w-full h-full cursor-pointer transition-all duration-200 flex items-center justify-center group",
                        "hover:bg-tertiary active:scale-95 min-h-[48px] rounded",
                        task.days?.[day]
                          ? "hover:bg-success/20"
                          : "hover:bg-secondary",
                      ].join(" ")}
                      onClick={() => toggleDay(day)}
                    >
                      <div
                        className={[
                          "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200",
                          "group-hover:scale-110 group-active:scale-95",
                          task.days?.[day]
                            ? "bg-success border-success text-white shadow-sm"
                            : "border-muted text-transparent hover:border-success bg-brand-success/10",
                        ].join(" ")}
                      >
                        <span className="font-bold text-sm">✓</span>
                      </div>
                    </button>
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

          <p className="text-lg font-semibold mb-4 text-brand-primary">Are you sure you want to delete this task?</p>
          <button
            disabled={loading}
            className={`p-3 hover:bg-brand-success ${loading && 'bg-brand-success/50'} gap-3 rounded-full w-full text-brand-text transition-colors shadow-lg border border-primary flex justify-center items-center`}

            onClick={() => onDelete(task.id)}>Yes {loading && <Loader />} </button>
          <button
            className="p-3 hover:bg-brand-error rounded-full w-full text-brand-text transition-colors shadow-lg border border-primary"
            onClick={() => deleteDialogRef.current?.close()}>No</button>
        </div>
      </dialog>
    </>
  );
}

export default React.memo(WeeklyTable)