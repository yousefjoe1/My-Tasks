// import { supabase } from "@/lib/supabase/client";
// import MyTasksControls from "./MyTasksControls";
// import { getUsersWithProgress } from "../actions/group-tasks.actions";
// import UsersOverview from "./UsersOverview";

// // src/app/(main)/group-tasks/page.tsx
// export default async function GroupTasksPage() {
//     const { data: { user } } = await supabase.auth.getUser();
//     const users = await getUsersWithProgress();
//     const { data: allTasks } = await supabase.from('tasks').select('*');

//     // استخراج بياناتي فقط
//     const myData = users.find(u => u.id === user?.id);
//     const myTasks = myData?.user_tasks || [];

//     return (
//         <div className="p-6">
//             {/* الجزء الخاص بيك (يظهر فقط إذا كنت مسجل دخول) */}
//             {user && <MyTasksControls myTasks={myTasks} allTasks={allTasks} />}

//             <hr className="my-8" />

//             {/* الجزء الخاص بالجميع (قائمة العرض) */}
//             <UsersOverview users={users} allTasks={allTasks} />
//         </div>
//     );
// }