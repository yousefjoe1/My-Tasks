'use client';
import { WeeklySnapshot } from '@/types'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext';
import { WeeklyTasksSync } from '@/services/weeklyTasksSyncService';
import { getWeekDates, getWeekDays } from '@/lib/utils';
import { format } from 'date-fns';

interface Task {
    content: string;
    days: Record<string, boolean>;
    id: string;
}


const DashBoard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false)

    const [snapData, setSnapData] = useState<WeeklySnapshot[] | null>(null)

    const getSnapShot = async () => {
        setLoading(true)
        const snapShot = await WeeklyTasksSync.fetchSnapshot(user?.id)
        setSnapData(snapShot)
        setLoading(false)
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        getSnapShot()
    }, [user?.id]);

    return (
        <div className='flex flex-col gap-4 py-20 px-4'>
            {
                loading && <div className='loader' />
            }

            {
                snapData && snapData.length === 0 && (
                    <div>
                        <h2 className='text-2xl'>No History</h2>
                    </div>
                )
            }

            {
                snapData && snapData.length > 0 && (
                    <div>
                        <h2 className='text-2xl'>History</h2>
                        <>
                            {
                                snapData.map((snap) => {
                                    const weekDays = getWeekDays();
                                    const snapWeekStart = snap.week_start ? new Date(snap.week_start) : new Date();
                                    const snapWeekDates = getWeekDates(snapWeekStart);

                                    return (
                                        <div key={snap.id} className="mb-8 p-4 border rounded-lg">
                                            <h3 className="text-lg font-semibold mb-4">
                                                Archived At: {new Date(snap.archived_at).toLocaleString()}
                                            </h3>
                                            <div className="text-sm text-gray-600 mb-4">
                                                Week: {snap.week_start ? format(new Date(snap.week_start), 'MMM dd, yyyy') : 'N/A'}
                                                {' - '}
                                                {snap.week_end ? format(new Date(snap.week_end), 'MMM dd, yyyy') : 'N/A'}
                                            </div>

                                            <div className="space-y-3">
                                                {snap.week_data.map(task => {
                                                    // Convert days object to array matching weekDays order
                                                    if (!task.days) return null;
                                                    const daysArray = weekDays.map(day => {
                                                        const dayKey = day as keyof typeof task.days;
                                                        return task?.days?.[dayKey] ?? false;
                                                    });

                                                    return (
                                                        <div key={task.id} className="border rounded p-3">
                                                            <h4 className="font-medium mb-2">{task.content}</h4>

                                                            {/* Day completion icons */}
                                                            <div className="flex gap-2">
                                                                {daysArray.map((completed, index) => (
                                                                    <div
                                                                        key={weekDays[index]}
                                                                        className={`flex items-center justify-center w-10 h-10 rounded ${completed ? 'bg-green-500' : 'bg-gray-300'
                                                                            }`}
                                                                        title={`${weekDays[index]} (${format(snapWeekDates[index], 'MMM dd')}): ${completed ? 'Completed' : 'Not completed'}`}
                                                                    >
                                                                        <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            className="h-5 w-5 text-white"
                                                                            viewBox="0 0 20 20"
                                                                            fill="currentColor"
                                                                        >
                                                                            <path
                                                                                fillRule="evenodd"
                                                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                                clipRule="evenodd"
                                                                            />
                                                                        </svg>
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            {/* Day labels with dates */}
                                                            <div className="flex gap-2 mt-1">
                                                                {weekDays.map((day, index) => (
                                                                    <div key={day} className="w-10 text-center">
                                                                        <div className="text-xs font-medium text-gray-700">{day}</div>
                                                                        <div className="text-xs text-gray-500">
                                                                            {format(snapWeekDates[index], 'dd')}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })
                            }
                        </>
                    </div>
                )
            }

        </div>
    )
}

export default DashBoard