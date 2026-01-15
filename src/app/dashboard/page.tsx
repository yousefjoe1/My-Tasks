'use client';
import { WeeklySnapshot } from '@/types'
import { useEffect, useState } from 'react'
import { LocalStorageStrategy } from '@/lib/storage/weeklyTasks/LocalStorageStrategy';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { getWeekDates, getWeekDays } from '@/lib/utils';

const DashBoard = () => {
    const { user } = useAuth();

    const [snapData, setSnapData] = useState<WeeklySnapshot[]>([])


    const weekDays = getWeekDays();
    const weekDates = getWeekDates();



    const getSnapShot = async () => {
        let snap = [] as WeeklySnapshot[]
        if (user?.id) {
            const { data, error } = await supabase.from('weekly_snapshots')
                .select('*')
                .eq('userId', user.id)
            console.log("🚀 ~ getSnapShot ~ data:", data)
            snap = data || []
        } else {
            const snapShot = await LocalStorageStrategy.getSnapshotData()
            snap = snapShot
        }
        setSnapData(snap)
    }


    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        getSnapShot()
    }, []);

    console.log("🚀 ~ DashBoard ~ tasks:", snapData)
    return (
        <div className='flex flex-col gap-4 py-20'>
            <h2 className='text-3xl'>Under Development</h2>

        </div>
    )
}

export default DashBoard