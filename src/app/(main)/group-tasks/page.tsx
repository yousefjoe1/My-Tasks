// app/group-tasks/page.tsx

'use client'

import { getUsersWithProgress } from "@/features/group-tasks/actions/group-tasks.actions";
import MyTasksControls from "@/features/group-tasks/components/MyTasksControls";
// import MyTasksControls from "@/features/group-tasks/components/MyTasksControls";
import UsersOverview from "@/features/group-tasks/components/UsersOverview";
import { User } from "@/types";
import { useEffect, useState } from "react";

export default function GroupTasksPage() {
    // // 1. جلب البيانات كاملة (المستخدمين + المهام + إنجازات اليوم)
    // const { users, allTasks, userProgress } = await getDashboardData();
    const [users, setUsers] = useState<User[]>([])

    // useeffect to fetch all tasks
    useEffect(() => {
        const fetchTasks = async () => {
            const data = await getUsersWithProgress()
            console.log("🚀 ~ fetchTasks ~ data:", data)
            setUsers(data as unknown as User[])
        }
        fetchTasks()
    }, [])

    return (
        <div className="p-6">
            <MyTasksControls users={users} />
            <UsersOverview users={users} />
        </div>
    );
}