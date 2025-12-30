import { Loader2 } from "lucide-react";
import { useState } from "react";
import useToast from "./Toasts/useToast";

interface AddTask {
  addNewTask: (taskName: string) => void;
  loading: boolean;
}

export function AddBlock({ addNewTask, loading }: AddTask) {
  const [taskName, setTaskName] = useState('')

  const { error, ToastContainer } = useToast()

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