// // src/features/group-tasks/components/UsersOverview.tsx
// export default function UsersOverview({ users, allTasks }) {
//     return (
//         <div className="space-y-4">
//             <h2 className="text-xl font-bold">حالة الإنجاز اليوم</h2>
//             {users?.map((user) => (
//                 <div key={user.id} className="flex justify-between p-3 bg-gray-800 rounded-lg">
//                     <span>{user.full_name || "مستخدم"}</span>
//                     <div className="flex gap-4">
//                         {allTasks?.map((task) => {
//                             // نبحث عن المهمة الخاصة بهذا المستخدم
//                             const userTask = (user.user_tasks || []).find(ut => ut.task_id === task.id);
//                             return (
//                                 <span key={task.id} className="text-sm">
//                                     {task.name}: {userTask?.count || 0}
//                                 </span>
//                             );
//                         })}
//                     </div>
//                 </div>
//             ))}
//         </div>
//     );
// }