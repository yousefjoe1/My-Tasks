import { Loader2 } from "lucide-react";
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
}


export function AddBlock({ success, toast, error }: Toast) {
  const { user } = useAuth();

  const [taskName, setTaskName] = useState('')
  const { tasks, loading } = useSelector((state: RootState) => state.weeklyTasks);

  const dispatch = useDispatch()

  const addNewTask = async (content: string) => {
    const newTask: WeeklyTask = {
      id: crypto.randomUUID(),
      content,
      days: {},
      updated_at: new Date().toISOString()
    };
    dispatch(setLoading(true))
    try {
      const newTaskData = await WeeklyTasksService.addTask(newTask, user?.id)
      dispatch(setTasks([...tasks, newTaskData]))
      success('Task added successfully')
      const item = await AsmahAllah.getCurrentName();
      AsmahAllah.updateIndex();
      toast(item.name, item.details)
    } catch (error) {
      dispatch(setError({ id: newTask.id, message: error instanceof Error ? error.message : 'Failed to add task' }))
    }
  }

  return (
    <section title="Add Task Section" className="p-4 border border-brand-primary rounded-lg shadow-sm space-y-3">

      <div>
        <label htmlFor="task">Task Name</label>
        <input disabled={loading} type="text" id="task" onChange={(e) => setTaskName(e.target.value)} value={taskName} className="p-3 border border-primary w-full rounded-lg hover:bg-secondary transition-colors text-center" />
      </div>
      <div className="grid grid-cols-1 gap-2">
        <button
          disabled={loading}
          onClick={() => {
            if (taskName.length < 5) {
              error('Task name must be at least 5 characters long');
              return
            }
            addNewTask(taskName);
          }}
          className="p-3 border flex justify-center border-primary w-full rounded-lg hover:bg-secondary transition-colors text-center"
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : ''}
          <h6 className="text-primary">📅 Add Task</h6>
        </button>

      </div>

    </section>
  );
}