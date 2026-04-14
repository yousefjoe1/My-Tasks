'use client';
import { Loader2, Plus, X, Trash2 } from "lucide-react";
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
  const [isOpen, setIsOpen] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');

  // State للمهام الفرعية
  const [subTasks, setSubTasks] = useState<string[]>([]);
  const [currentSubTask, setCurrentSubTask] = useState('');

  const { tasks, loading } = useSelector((state: RootState) => state.weeklyTasks);
  const dispatch = useDispatch();

  const addSubTaskToList = () => {
    if (currentSubTask.trim()) {
      setSubTasks([...subTasks, currentSubTask.trim()]);
      setCurrentSubTask('');
    }
  };

  const removeSubTaskFromList = (index: number) => {
    setSubTasks(subTasks.filter((_, i) => i !== index));
  };

  const addNewTask = async (content: string) => {
    if (!user) {
      error('Please login to add a task');
      return;
    }

    const newTask = { // استخدمنا any مؤقتاً لتسهيل إرسال الـ sub_tasks للـ service
      id: crypto.randomUUID(),
      content,
      description,
      days: {},
      updated_at: new Date().toISOString(),
      is_essential: isEssentialPage,
      sub_tasks: subTasks.map(stContent => ({
        content: stContent,
        days_completed: { "Mon": false, "Tue": false, "Wed": false, "Thu": false, "Fri": false, "Sat": false, "Sun": false }
      }))
    };

    dispatch(setLoading(true));
    try {
      const newTaskData = await WeeklyTasksService.addTask(newTask, user?.id);
      dispatch(setTasks([...tasks, newTaskData]));
      success('تم إضافة المهمة بنجاح');

      const item = await AsmahAllah.getCurrentName();
      AsmahAllah.updateIndex();
      toast(item.name, item.details);

      // Reset Form
      setTaskName('');
      setDescription('');
      setSubTasks([]);
      setIsOpen(false);
    } catch (err) {
      dispatch(setError({ id: newTask.id, message: err instanceof Error ? err.message : 'Failed to add task' }));
      error('حدث خطأ أثناء الإضافة');
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="w-full space-y-3 overflow-hidden">
      {!isOpen ? (
        <button onClick={() => setIsOpen(true)} className="pushable group mt-6">
          <span className="shadow-btn"></span>
          <span className="edge-btn"></span>
          <span className="front-btn">
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300 text-white" />
            <span>إضافة إنجاز جديد</span>
          </span>
        </button>
      ) : (
        <section className="p-4 border border-primary rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-300 bg-secondary/30 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold text-brand">
              {isEssentialPage ? "✨ مهمة أساسية جديدة" : "📝 مهمة أسبوعية"}
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-brand-error/10 hover:text-brand-error rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            {/* اسم المهمة */}
            <div className="space-y-1">
              <label htmlFor="task" className="text-xs font-bold text-secondary px-1">اسم المهمة</label>
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

            {/* الوصف (اللي سيبناه زي ما هو) */}
            <div className="space-y-1">
              <label htmlFor="description" className="text-xs font-bold text-secondary px-1">الوصف (اختياري)</label>
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

            {/* قسم المهام الفرعية الجديد */}
            <div className="space-y-2 pt-2 border-t border-primary/20">
              <label className="text-xs font-bold text-secondary px-1">المهام الفرعية (Daily Checklist)</label>
              <div className="flex gap-2">
                <input
                  disabled={loading}
                  value={currentSubTask}
                  onChange={(e) => setCurrentSubTask(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubTaskToList())}
                  placeholder="أضف مهمة فرعية..."
                  className="p-2 bg-tertiary/50 border border-primary/10 text-primary flex-1 rounded-lg outline-none text-sm focus:border-brand"
                />
                <button
                  type="button"
                  onClick={addSubTaskToList}
                  className="p-2 bg-primary-2/20 text-primary-2 rounded-lg hover:bg-primary-2/40 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* قائمة المهام الفرعية المضافة */}
              <div className="flex flex-wrap gap-2 mt-2">
                {subTasks.map((st, index) => (
                  <div key={index} className="flex items-center gap-2 bg-tertiary px-3 py-1 rounded-full text-xs text-secondary border border-primary/10">
                    <span>{st}</span>
                    <button
                      type="button"
                      onClick={() => removeSubTaskFromList(index)}
                      className="text-brand-error hover:scale-110 transition-transform"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* زر الحفظ النهائي */}
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
                <span>إضافة  </span>
              </span>
            </button>
          </div>
        </section>
      )}
    </div>
  );
}