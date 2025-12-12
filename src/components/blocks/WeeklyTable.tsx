import { WeeklyBlock } from "@/types";
import { getWeekDates, getWeekDays } from "@/lib/utils";
import { format } from "date-fns";
import { useState } from "react";
import { Edit } from "lucide-react";

interface WeeklyTableProps {
  block: WeeklyBlock;
  onUpdate: (updates: Partial<WeeklyBlock>) => void;
  onDelete: () => void;
}

export function WeeklyTable({ block, onUpdate, onDelete }: WeeklyTableProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(block.content);
  const weekDays = getWeekDays();
  const weekDates = getWeekDates();

  const toggleDay = (day: string) => {
    const currentDays = block.days || {};
    onUpdate({
      days: {
        ...currentDays,
        [day]: !currentDays[day],
      },
    });
  };

  const handleSave = () => {
    onUpdate({ content });
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setContent(block.content);
      setIsEditing(false);
    }
  };

  return (
    <div className="group relative mb-8 bg-primary rounded-xl shadow-sm border border-primary hover:shadow-md transition-all duration-200">
      {/* Header Section */}
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
                  setContent(block.content);
                  setIsEditing(false);
                }}
                className="px-4 py-2 text-sm bg-secondary text-white rounded-lg hover:bg-secondary active:scale-95 transition-all font-medium shadow-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 group">
            <button
              className="text-lg font-semibold text-primary hover:text-brand cursor-pointer transition-colors duration-200 px-3 py-1 rounded-lg hover:bg-brand/10"
              onClick={() => setIsEditing(true)}
            >
              <Edit />
            </button>
            <button
              onClick={onDelete}
              className="opacity-0 group-hover:opacity-100 transition-all duration-200 px-3 py-1 text-sm bg-error text-white rounded-lg hover:bg-red-600 active:scale-95 font-medium shadow-sm"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Table Section */}
      <table className="w-full overflow-hidden rounded-b-xl">
        {/* Table Header */}
        <thead className="border-b border-secondary bg-secondary">
          <tr>
            {/* <th className="p-4 font-semibold text-primary border-r border-secondary text-left">
              <span className="truncate">Edit</span>
            </th> */}
            <th className="p-4 font-semibold text-primary border-r border-secondary text-left">
              <span className="truncate">Task Name</span>
            </th>
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
        <tbody className="bg-primary">
          <tr className="transition-all duration-200 hover:bg-tertiary/50">
            {/* <td className="p-4 border-r border-secondary font-medium text-primary align-middle">
              <Edit />
            </td> */}
            <td className="p-4 border-r border-secondary font-medium text-primary align-middle">
              <span className="truncate">{content || "Untitled Task"}</span>
            </td>
            {weekDays.map((day) => (
              <td
                key={day}
                className={[
                  "p-4 border-r border-secondary last:border-r-0 align-middle transition-colors",
                  block.days?.[day]
                    ? "bg-success/10 border-l-4 border-l-success dark:bg-success/20"
                    : "bg-primary",
                ].join(" ")}
              >
                <button
                  className={[
                    "w-full h-full cursor-pointer transition-all duration-200 flex items-center justify-center group",
                    "hover:bg-tertiary active:scale-95 min-h-[48px] rounded",
                    block.days?.[day]
                      ? "hover:bg-success/20"
                      : "hover:bg-secondary",
                  ].join(" ")}
                  onClick={() => toggleDay(day)}
                >
                  <div
                    className={[
                      "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200",
                      "group-hover:scale-110 group-active:scale-95",
                      block.days?.[day]
                        ? "bg-success border-success text-white shadow-sm"
                        : "border-muted text-transparent hover:border-success",
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

      {/* Status Bar */}
      <div className="px-4 py-2 bg-secondary border-t border-secondary rounded-b-xl">
        <div className="flex justify-between items-center text-xs text-muted">
          <span>
            Completed {Object.values(block.days || {}).filter(Boolean).length}{" "}
            of {weekDays.length} days
          </span>
          <span className="text-muted">Click days to mark as complete</span>
        </div>
      </div>
    </div>
  );
}
