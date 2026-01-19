export interface WeeklySnapshotApiResponse {
    id?: string;
    user_id: string | undefined;
    archived_at: string;
    created_at: string;
    week_data: {
        id: string;
        content: string;
        days?: Record<string, boolean>;
    };
}