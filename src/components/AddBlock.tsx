'use client';
import { Loader2, Plus, X } from "lucide-react";
import { useState } from "react";
import { WeeklyTasksService } from "@/services/weeklyTasksService";
import { useDispatch, useSelector } from "react-redux";
import { WeeklyTask } from "@/types";
import { setError, setLoading, setTasks } from "@/store/weeklyTasksSlice";
import { RootState } from "@/store/store";
import { useAuth } from "@/contexts/AuthContext";
import AsmahAllah from "@/features/Allah-names/services/allah-names";

interface Toast {
  success: (m: string) => void;
  toast: (m: string, d: string) => void;
  error: (m: string) => void;
  isEssentialPage?: boolean
}

export function AddBlock({ success, toast, error, isEssentialPage = false }: Toast) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false); // التحكم في ظهور الفورم
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const { tasks, loading } = useSelector((state: RootState) => state.weeklyTasks);

  const dispatch = useDispatch();

  const addNewTask = async (content: string) => {
    if (!user) {
      error('Please login to add a task');
      return;
    }

    const newTask: WeeklyTask = {
      id: crypto.randomUUID(),
      content,
      description,
      days: {},
      updated_at: new Date().toISOString(),
      is_essential: isEssentialPage
    };

    dispatch(setLoading(true));
    try {
      const newTaskData = await WeeklyTasksService.addTask(newTask, user?.id);
      dispatch(setTasks([...tasks, newTaskData]));
      success('Task added successfully');

      const item = await AsmahAllah.getCurrentName();
      AsmahAllah.updateIndex();
      toast(item.name, item.details);

      setTaskName('');
      setDescription('');
      setIsOpen(false); // إغلاق الفورم بعد النجاح
    } catch (err) {
      dispatch(setError({ id: newTask.id, message: err instanceof Error ? err.message : 'Failed to add task' }));
    }
  };

  return (
    <div className="w-full space-y-3 overflow-hidden">
      {/* زر الفتح الأساسي - يظهر فقط عندما تكون الفورم مغلقة */}
      {!isOpen ? (
        <button onClick={() => setIsOpen(true)} className="pushable group mt-6">
          <span className="shadow-btn"></span>
          <span className="edge-btn"></span>
          <span className="front-btn">
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300 text-white" />
            <span>إضافة مهمة جديدة</span>
          </span>
        </button>
      ) : (
        /* القسم الخاص بالفورم مع Animation الـ Accordion */
        <section
          className={`
            p-2 border border-primary rounded-2xl space-y-4
            animate-in fade-in slide-in-from-top-4 duration-300
          `}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold text-brand ">
              {isEssentialPage ? "✨ مهمة اساسية جديدة" : "📝 مهمة أسبوعية"}
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-brand-error/10 hover:text-brand-error rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="task" className="text-xs font-bold text-secondary px-1 ">اسم المهمة</label>
              <input
                disabled={loading}
                type="text"
                id="task"
                onChange={(e) => setTaskName(e.target.value)}
                value={taskName}
                placeholder="مثلاً: قراءة سورة البقرة"
                className="p-3 bg-tertiary border-none text-primary w-full rounded-xl focus:ring-2 focus:ring-brand outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="description" className="text-xs font-bold text-secondary px-1 ">الوصف (اختياري)</label>
              <textarea
                disabled={loading}
                id="description"
                onChange={(e) => setDescription(e.target.value)}
                value={description}
                rows={2}
                placeholder="تفاصيل إضافية تساعدك على الإنجاز..."
                className="p-3 bg-tertiary border-none text-primary w-full rounded-xl focus:ring-2 focus:ring-brand outline-none text-sm transition-all resize-none"
              />
            </div>

            <button
              disabled={loading}
              onClick={() => {
                if (taskName.length < 5) {
                  error('اسم المهمة يجب أن يكون 5 أحرف على الأقل');
                  return;
                }
                addNewTask(taskName);
              }}
              className="pushable"
            >
              <span className="shadow-btn"></span>
              <span className="edge-btn" style={{ background: 'linear-gradient(to left, #064e3b 0%, #059669 8%, #059669 92%, #064e3b 100%)' }}></span>
              <span className="front-btn" style={{ background: '#10b981' }}>
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                <span>إضافة</span>
              </span>
            </button>
          </div>
        </section>
      )}
    </div>
  );
}