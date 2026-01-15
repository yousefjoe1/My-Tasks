import { Loader2 } from "lucide-react";
import { useState } from "react";
import useToast from "./Toasts/useToast";
import { WeeklyTasksService } from "@/services/weeklyTasksService";
import { useDispatch, useSelector } from "react-redux";
import { WeeklyTask } from "@/types";
import { setError, setLoading, setTasks } from "@/store/weeklyTasksSlice";
import { RootState } from "@/store/store";
import { useAuth } from "@/contexts/AuthContext";


export function AddBlock() {
  const { user } = useAuth();

  const [taskName, setTaskName] = useState('')
  const { tasks, loading } = useSelector((state: RootState) => state.weeklyTasks);

  const dispatch = useDispatch()


  const { error, ToastContainer, success } = useToast()

  const addNewTask = async (content: string) => {
    const newTask: WeeklyTask = {
      id: crypto.randomUUID(),
      content,
      days: {},
    };
    dispatch(setLoading(true))
    try {
      const newTaskData = await WeeklyTasksService.addTask(newTask, user?.id)
      dispatch(setTasks([...tasks, newTaskData]))
      success('Task added successfully')
      // await WeeklyTasksService.saveSnapShotNow(user?.id)
    } catch (error) {
      dispatch(setError({ id: newTask.id, message: error instanceof Error ? error.message : 'Failed to add task' }))
    }
  }

  return (
    <div className="p-4 border rounded-lg shadow-sm space-y-3">

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
          <div className="text-primary">📅 Add Task</div>
        </button>

      </div>
      <ToastContainer />

    </div>
  );
}