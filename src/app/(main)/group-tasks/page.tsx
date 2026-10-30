'use client';

import ToastContainer from '@/components/Toasts/ToastContainer';
import { useToast } from '@/components/Toasts/useToast';
import { useAuth } from '@/contexts/AuthContext';
import { getUsersWithProgress } from '@/features/group-tasks/actions/group-tasks.actions';
import MyTasksControls from '@/features/group-tasks/components/MyTasksControls';
import UsersOverview from '@/features/group-tasks/components/UsersOverview';
import { useGermanLessonSpeech } from '@/features/group-tasks/hooks/useGermanLessonSpeech';
import { User } from '@/types';
import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';

function GroupTasksPageContent() {
    const [users, setUsers] = useState<User[]>([]);
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const speakText = searchParams.get('speak');
    const { toast, toasts, removeToast } = useToast();

    const handleSpeaking = useCallback(
        (message: string) => {
            toast(message, speakText ?? undefined, 5000);
        },
        [toast, speakText]
    );

    useGermanLessonSpeech(speakText, handleSpeaking);

    useEffect(() => {
        const fetchTasks = async () => {
            const data = await getUsersWithProgress();
            setUsers(data as unknown as User[]);
        };
        fetchTasks();
    }, [user?.id]);

    return (
        <div className="p-6">
            <ToastContainer toasts={toasts} removeToast={removeToast} />
            <MyTasksControls users={users} />
            <UsersOverview users={users} />
        </div>
    );
}

export default function GroupTasksPage() {
    return (
        <Suspense
            fallback={
                <div className="flex justify-center p-12">
                    <Loader2 className="size-8 animate-spin text-brand" aria-hidden />
                </div>
            }
        >
            <GroupTasksPageContent />
        </Suspense>
    );
}
