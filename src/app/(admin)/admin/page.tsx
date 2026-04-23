"use client";

import { useEffect, useState } from "react";
import { getUsersWithTasks } from "@/features/admin-dashboard/actions/admin_actions";

interface SubTask {
    id: string;
    task_id: string;
    content: string;
    days_completed: Record<string, boolean>;
}

interface Task {
    id: string;
    userId: string;
    content: string;
    is_essential: boolean;
    description: string;
    days: Record<string, boolean>;
}

interface User {
    id: string;
    full_name: string | null;
    email: string;
    role: string;
    created_at: string;
}

const DAY_MAP: Record<string, string> = {
    Mon: "الإث", Tue: "الثل", Wed: "الأر",
    Thu: "الخم", Fri: "الجم", Sat: "السب", Sun: "الأح",
};

function getInitials(user: User) {
    const name = user.full_name || user.email || "U";
    return name.charAt(0).toUpperCase();
}

function DayPills({ days }: { days: Record<string, boolean> }) {
    if (!days || Object.keys(days).length === 0) return null;
    return (
        <div className="flex gap-1 flex-wrap mt-1">
            {Object.entries(days).map(([d, v]) => (
                <span
                    key={d}
                    style={{
                        fontSize: "9px",
                        fontFamily: "monospace",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        border: `1px solid ${v ? "rgba(52,211,153,0.4)" : "var(--color-brand-border)"}`,
                        background: v ? "rgba(52,211,153,0.1)" : "transparent",
                        color: v ? "var(--color-brand-success)" : "var(--color-brand-text-muted)",
                    }}
                >
                    {DAY_MAP[d] || d}
                </span>
            ))}
        </div>
    );
}

function SubTaskList({ subtasks }: { subtasks: SubTask[] }) {
    if (!subtasks.length) return null;
    return (
        <div
            style={{
                borderTop: "1px solid var(--color-brand-border)",
                padding: "10px 14px 10px 20px",
                background: "var(--color-brand-bg)",
            }}
        >
            {subtasks.map((s) => (
                <div
                    key={s.id}
                    style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "8px",
                        padding: "7px 0",
                        borderBottom: "1px solid var(--color-brand-border)",
                        fontSize: "13px",
                        color: "var(--color-brand-text-muted)",
                    }}
                >
                    <span style={{ color: "var(--color-brand-success)", marginTop: "2px" }}>↳</span>
                    <div>
                        <div>{s.content}</div>
                        <DayPills days={s.days_completed} />
                    </div>
                </div>
            ))}
        </div>
    );
}

function TaskItem({ task, subtasks }: { task: Task; subtasks: SubTask[] }) {
    const [open, setOpen] = useState(false);
    const hasSubs = subtasks.length > 0;

    return (
        <div
            style={{
                background: "var(--color-brand-secondary)",
                border: "1px solid var(--color-brand-border)",
                borderRadius: "8px",
                marginBottom: "8px",
                overflow: "hidden",
            }}
        >
            <div
                onClick={() => hasSubs && setOpen((o) => !o)}
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 14px",
                    cursor: hasSubs ? "pointer" : "default",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span
                        style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            flexShrink: 0,
                            background: task.is_essential
                                ? "var(--color-brand-warning)"
                                : "var(--color-brand-border-secondary)",
                        }}
                    />
                    <div>
                        <div
                            style={{
                                fontSize: "14px",
                                fontWeight: 600,
                                color: "var(--color-brand-text-secondary)",
                            }}
                        >
                            {task.content}
                        </div>
                        {task.description && (
                            <div
                                style={{ fontSize: "11px", color: "var(--color-brand-text-muted)", marginTop: "2px" }}
                            >
                                {task.description}
                            </div>
                        )}
                    </div>
                </div>
                {hasSubs && (
                    <span
                        style={{
                            fontSize: "11px",
                            color: "var(--color-primary-2)",
                            fontFamily: "monospace",
                            background: "rgba(96,165,250,0.1)",
                            border: "1px solid rgba(96,165,250,0.2)",
                            borderRadius: "5px",
                            padding: "2px 8px",
                        }}
                    >
                        {subtasks.length} فرعية {open ? "▴" : "▾"}
                    </span>
                )}
            </div>
            {open && <SubTaskList subtasks={subtasks} />}
        </div>
    );
}

function UserCard({
    user,
    tasks,
    subtasks,
}: {
    user: User;
    tasks: Task[];
    subtasks: SubTask[];
}) {
    const [open, setOpen] = useState(false);
    const userTasks = tasks.filter((t) => t.userId === user.id);

    return (
        <div
            style={{
                background: "var(--color-brand-secondary)",
                border: "1px solid var(--color-brand-border)",
                borderRadius: "12px",
                marginBottom: "14px",
                overflow: "hidden",
                transition: "border-color 0.2s",
            }}
        >
            {/* User Header */}
            <div
                onClick={() => setOpen((o) => !o)}
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px 20px",
                    cursor: "pointer",
                    userSelect: "none",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    {/* Avatar */}
                    <div
                        style={{
                            width: "42px",
                            height: "42px",
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, var(--color-primary-2-dark), var(--color-brand-success))",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: "monospace",
                            fontSize: "16px",
                            fontWeight: 700,
                            color: "#fff",
                            flexShrink: 0,
                        }}
                    >
                        {getInitials(user)}
                    </div>
                    <div>
                        <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--color-brand-text)" }}>
                            {user.full_name || "—"}
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--color-brand-text-muted)", fontFamily: "monospace" }}>
                            {user.email}
                        </div>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {/* Role badge */}
                    <span
                        style={{
                            fontSize: "11px",
                            fontFamily: "monospace",
                            padding: "3px 10px",
                            borderRadius: "20px",
                            fontWeight: 600,
                            background: user.role === "admin" ? "rgba(96,165,250,0.15)" : "rgba(156,163,175,0.1)",
                            color: user.role === "admin" ? "var(--color-primary-2)" : "var(--color-brand-text-muted)",
                            border: `1px solid ${user.role === "admin" ? "rgba(96,165,250,0.3)" : "var(--color-brand-border)"}`,
                        }}
                    >
                        {user.role}
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--color-brand-text-muted)", fontFamily: "monospace" }}>
                        {userTasks.length} مهمة
                    </span>
                    <span
                        style={{
                            color: "var(--color-brand-text-muted)",
                            fontSize: "18px",
                            transform: open ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.25s",
                        }}
                    >
                        ⌄
                    </span>
                </div>
            </div>

            {/* Tasks Section */}
            {open && (
                <div
                    style={{
                        borderTop: "1px solid var(--color-brand-border)",
                        padding: "16px 20px",
                        background: "var(--color-brand-bg)",
                    }}
                >
                    <div
                        style={{
                            fontSize: "10px",
                            color: "var(--color-brand-text-muted)",
                            letterSpacing: "2px",
                            textTransform: "uppercase",
                            fontFamily: "monospace",
                            marginBottom: "12px",
                        }}
                    >
                        المهام الأسبوعية
                    </div>

                    {userTasks.length === 0 ? (
                        <p style={{ color: "var(--color-brand-text-muted)", fontSize: "13px", textAlign: "center", padding: "20px 0" }}>
                            لا توجد مهام لهذا المستخدم
                        </p>
                    ) : (
                        userTasks.map((task) => (
                            <TaskItem
                                key={task.id}
                                task={task}
                                subtasks={subtasks.filter((s) => s.task_id === task.id)}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

export default function AdminPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [subtasks, setSubtasks] = useState<SubTask[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        getUsersWithTasks()
            .then(({ users, tasks, subtasks }) => {
                setUsers(users);
                setTasks(tasks);
                setSubtasks(subtasks);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const filtered = users.filter(
        (u) =>
            (u.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
            (u.email || "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ minHeight: "100vh", background: "var(--color-brand-bg)", direction: "rtl" }}>
            {/* Header */}
            <div
                style={{
                    background: "var(--color-brand-secondary)",
                    borderBottom: "1px solid var(--color-brand-border)",
                    padding: "16px 24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                }}
            >
                <h1
                    style={{
                        fontFamily: "monospace",
                        fontSize: "13px",
                        color: "var(--color-primary-2)",
                        letterSpacing: "2px",
                        textTransform: "uppercase",
                    }}
                >
                    ADMIN // لوحة التحكم
                </h1>
                <div style={{ display: "flex", gap: "24px" }}>
                    {[
                        { value: users.length, label: "مستخدم" },
                        { value: tasks.length, label: "مهمة" },
                        { value: subtasks.length, label: "مهمة فرعية" },
                    ].map((s) => (
                        <div key={s.label} style={{ textAlign: "center" }}>
                            <div
                                style={{
                                    fontFamily: "monospace",
                                    fontSize: "20px",
                                    fontWeight: 600,
                                    color: "var(--color-primary-2)",
                                }}
                            >
                                {loading ? "—" : s.value}
                            </div>
                            <div style={{ fontSize: "10px", color: "var(--color-brand-text-muted)", letterSpacing: "1px" }}>
                                {s.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
                <input
                    type="text"
                    placeholder="ابحث باسم المستخدم أو البريد..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                        width: "100%",
                        background: "var(--color-brand-secondary)",
                        border: "1px solid var(--color-brand-border)",
                        borderRadius: "8px",
                        padding: "10px 16px",
                        color: "var(--color-brand-text)",
                        fontSize: "14px",
                        marginBottom: "20px",
                        outline: "none",
                        fontFamily: "inherit",
                    }}
                />

                {loading && (
                    <p style={{ textAlign: "center", color: "var(--color-brand-text-muted)", padding: "60px 0" }}>
                        جاري التحميل...
                    </p>
                )}

                {error && (
                    <p style={{ color: "var(--color-brand-error)", marginBottom: "16px" }}>
                        حدث خطأ: {error}
                    </p>
                )}

                {!loading &&
                    filtered.map((user) => (
                        <UserCard
                            key={user.id}
                            user={user}
                            tasks={tasks}
                            subtasks={subtasks}
                        />
                    ))}

                {!loading && filtered.length === 0 && !error && (
                    <p style={{ textAlign: "center", color: "var(--color-brand-text-muted)" }}>
                        لا يوجد مستخدمون.
                    </p>
                )}
            </div>
        </div>
    );
}