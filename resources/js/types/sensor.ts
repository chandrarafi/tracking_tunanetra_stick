export type SensorEvent = {
    id: number;
    event: 'water' | 'fire';
    status: boolean;
    lat: number | null;
    lng: number | null;
    created_at: string;
};

export type EmergencyEvent = {
    id: number;
    type: 'emergency';
    lat: number | null;
    lng: number | null;
    created_at: string;
};

export type DashboardStats = {
    total_events: number;
    water_events: number;
    fire_events: number;
    emergency_events: number;
};

export type DashboardProps = {
    sensorEvents: SensorEvent[];
    emergencyEvents: EmergencyEvent[];
    stats: DashboardStats;
};

export type MapMarker = {
    id: string;
    type: 'water' | 'fire' | 'emergency';
    lat: number;
    lng: number;
    timestamp: string;
    isNew?: boolean;
};
