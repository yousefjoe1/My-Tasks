// app/group-tasks/page.tsx

'use client'

import { getUsersWithProgress } from "@/features/group-tasks/actions/group-tasks.actions";
// import MyTasksControls from "@/features/group-tasks/components/MyTasksControls";
import UsersOverview from "@/features/group-tasks/components/UsersOverview";
import { supabase } from "@/lib/supabase/client";
import { User, WeeklyTask } from "@/types";
import { useEffect, useState } from "react";

export default function GroupTasksPage() {
    // // 1. جلب البيانات كاملة (المستخدمين + المهام + إنجازات اليوم)
    // const { users, allTasks, userProgress } = await getDashboardData();
    const [users, setUsers] = useState<User[]>([])
    const [allTasks, setAllTasks] = useState<WeeklyTask[]>([])

    // useeffect to fetch all tasks
    useEffect(() => {
        const fetchTasks = async () => {
            const data = await getUsersWithProgress()
            console.log("🚀 ~ fetchTasks ~ data:", data)
            setUsers(data as User[])
        }
        fetchTasks()
    }, [])

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">متابعة إنجاز المهام اليومي</h1>
            <UsersOverview users={users} allTasks={allTasks} />
            {/* <MyTasksControls allTasks={allTasks} /> */}
        </div>
    );
}