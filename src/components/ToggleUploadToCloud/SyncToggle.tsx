'use client'
import { Loader } from "lucide-react";
import { useState } from "react";


export const SyncToggle = () => {

    const [isSyncing, setIsSyncing] = useState(false);

    return (
        <div className="sync-toggle bg-secondary border border-primary rounded-lg p-4 w-fit space-y-2 space-x-3">
            <h4 className="font-medium text-primary">Cloud Sync</h4>
            <button>Sync</button>
        </div>
    );
};