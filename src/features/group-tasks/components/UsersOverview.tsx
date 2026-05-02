import { User } from "@/types";
import { User as UserIcon, CheckCircle2, ListChecks } from "lucide-react";

interface UsersOverviewProps {
    users: User[];
}

export default function UsersOverview({ users }: UsersOverviewProps) {
    return (
        <div className="space-y-6 p-4 md:p-6 bg-brand-bg text-brand-text transition-colors duration-300">
            {/* العنوان */}
            <header className="flex items-center gap-3 border-b border-brand-border pb-5">
                <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary">
                    <ListChecks size={28} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">إحصائيات المستخدمين</h2>
                    <p className="text-brand-text-muted text-sm">عرض تفصيلي لمهام كل مستخدم المنجزة</p>
                </div>
            </header>

            {/* شبكة المستخدمين */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users?.map((user) => (
                    <div
                        key={user.id}
                        className="group flex flex-col p-5 bg-brand-secondary border border-brand-border rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
                    >
                        {/* رأس الكارت: معلومات المستخدم */}
                        <div className="flex items-center gap-4 mb-5">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-full bg-brand-tertiary flex items-center justify-center text-brand-primary border-2 border-brand-primary/20">
                                    <UserIcon size={24} />
                                </div>
                            </div>
                            <div className="overflow-hidden">
                                <h3 className="font-bold text-lg truncate" title={user.full_name}>
                                    {user.full_name || "مستخدم مجهول"}
                                </h3>
                            </div>
                        </div>

                        {/* قائمة المهام الخاصة بهذا المستخدم فقط */}
                        <div className="space-y-2">
                            {user.user_tasks && user.user_tasks.length > 0 ? (
                                user.user_tasks.map((userTask) => (
                                    <div
                                        key={userTask.id}
                                        className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${userTask.is_completed
                                            ? 'bg-brand-success/5 border-brand-success/20'
                                            : 'bg-brand-bg border-brand-border/60'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <CheckCircle2
                                                size={18}
                                                className={userTask.is_completed ? "text-brand-success" : "text-brand-text-muted/40"}
                                            />
                                            <span className={`text-sm font-medium truncate ${userTask.is_completed ? 'text-brand-text' : 'text-brand-text-secondary'}`}>
                                                {userTask.tasks?.name}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] text-brand-text-muted font-bold">العدد:</span>
                                            <span className="font-mono font-bold text-brand-primary bg-brand-tertiary px-2 py-0.5 rounded-md text-xs">
                                                {userTask.count}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-4 border-2 border-dashed border-brand-border rounded-xl">
                                    <p className="text-xs text-brand-text-muted italic">لا توجد مهام مسندة</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}