import { Head } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import { Activity, AlertTriangle, Droplets, Flame } from 'lucide-react';
import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { EventLogTable } from '@/components/event-log-table';
import { StatCard } from '@/components/stat-card';
import { WarningBanner } from '@/components/warning-banner';
import type { WarningItem } from '@/components/warning-banner';
import { dashboard } from '@/routes';
import type { DashboardProps, EmergencyEvent, MapMarker, SensorEvent } from '@/types/sensor';

// Lazy load MapView to prevent Leaflet 'window is not defined' SSR crash
const MapView = lazy(() => import('@/components/map-view').then((m) => ({ default: m.MapView })));

// Separate component to handle Echo specifically on the client side
function EchoListeners({
    setSensorEvents,
    setStats,
    setWarnings,
    setNewEventIds,
    setEmergencyEvents,
}: {
    setSensorEvents: React.Dispatch<React.SetStateAction<SensorEvent[]>>;
    setStats: React.Dispatch<React.SetStateAction<DashboardProps['stats']>>;
    setWarnings: React.Dispatch<React.SetStateAction<WarningItem[]>>;
    setNewEventIds: React.Dispatch<React.SetStateAction<Set<string>>>;
    setEmergencyEvents: React.Dispatch<React.SetStateAction<EmergencyEvent[]>>;
}) {
    useEffect(() => {
        // @ts-expect-error
        if (typeof window === 'undefined' || !window.Echo) return;

        // @ts-expect-error
        const channel = window.Echo.channel('sensor-events');

        channel.listen('.SensorEventReceived', (e: {
            id: number;
            event: 'water' | 'fire';
            status: boolean;
            lat: number | null;
            lng: number | null;
            created_at: string;
        }) => {
            const newEvent: SensorEvent = {
                id: e.id,
                event: e.event,
                status: e.status,
                lat: e.lat,
                lng: e.lng,
                created_at: e.created_at,
            };

            setSensorEvents((prev) => [newEvent, ...prev]);
            setStats((prev) => ({
                ...prev,
                total_events: prev.total_events + 1,
                water_events: e.event === 'water' && e.status ? prev.water_events + 1 : prev.water_events,
                fire_events: e.event === 'fire' && e.status ? prev.fire_events + 1 : prev.fire_events,
            }));

            const warningId = `sensor-${e.id}-${Date.now()}`;
            const locationText = e.lat && e.lng ? ` di (${Number(e.lat).toFixed(5)}, ${Number(e.lng).toFixed(5)})` : '';
            setWarnings((prev) => [
                ...prev,
                {
                    id: warningId,
                    type: e.event,
                    message: `${e.event === 'water' ? 'Sensor air' : 'Sensor api'} ${e.status ? 'aktif' : 'nonaktif'}${locationText}`,
                    timestamp: e.created_at,
                },
            ]);

            const eventId = `sensor-${e.id}`;
            setNewEventIds((prev) => new Set([...prev, eventId]));
            setTimeout(() => {
                setNewEventIds((prev) => {
                    const next = new Set(prev);
                    next.delete(eventId);
                    return next;
                });
            }, 5000);
        });

        channel.listen('.EmergencyEventReceived', (e: {
            id: number;
            type: 'emergency';
            lat: number | null;
            lng: number | null;
            created_at: string;
        }) => {
            const newEvent: EmergencyEvent = {
                id: e.id,
                type: e.type,
                lat: e.lat,
                lng: e.lng,
                created_at: e.created_at,
            };

            setEmergencyEvents((prev) => [newEvent, ...prev]);
            setStats((prev) => ({
                ...prev,
                emergency_events: prev.emergency_events + 1,
            }));

            const warningId = `emergency-${e.id}-${Date.now()}`;
            const locationText = e.lat && e.lng ? ` di (${Number(e.lat).toFixed(5)}, ${Number(e.lng).toFixed(5)})` : '';
            setWarnings((prev) => [
                ...prev,
                {
                    id: warningId,
                    type: 'emergency',
                    message: `Tombol darurat ditekan${locationText}`,
                    timestamp: e.created_at,
                },
            ]);

            const eventId = `emergency-${e.id}`;
            setNewEventIds((prev) => new Set([...prev, eventId]));
            setTimeout(() => {
                setNewEventIds((prev) => {
                    const next = new Set(prev);
                    next.delete(eventId);
                    return next;
                });
            }, 5000);
        });

        return () => {
            channel.stopListening('.SensorEventReceived');
            channel.stopListening('.EmergencyEventReceived');
            // @ts-expect-error
            window.Echo.leaveChannel('sensor-events');
        };
    }, [setEmergencyEvents, setNewEventIds, setSensorEvents, setStats, setWarnings]);

    return null;
}

export default function Dashboard({ sensorEvents: initialSensorEvents, emergencyEvents: initialEmergencyEvents, stats: initialStats }: DashboardProps) {
    const [sensorEvents, setSensorEvents] = useState<SensorEvent[]>(initialSensorEvents);
    const [emergencyEvents, setEmergencyEvents] = useState<EmergencyEvent[]>(initialEmergencyEvents);
    const [stats, setStats] = useState(initialStats);
    const [warnings, setWarnings] = useState<WarningItem[]>([]);
    const [newEventIds, setNewEventIds] = useState<Set<string>>(new Set());
    const [isMounted, setIsMounted] = useState(false);
    const [focusLocation, setFocusLocation] = useState<[number, number] | null>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);



    const handleDismissWarning = useCallback((id: string) => {
        setWarnings((prev) => prev.filter((w) => w.id !== id));
    }, []);

    // Build map markers from events that have valid GPS, but prevent clustering overlaps
    const mapMarkers: MapMarker[] = useMemo(() => {
        const markers: MapMarker[] = [];
        const seenLocations = new Set<string>();
        
        // Hitung batas waktu (2 menit yang lalu)
        const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

        // Process emergency events first so they take priority in drawing
        emergencyEvents.forEach((e) => {
            if (e.lat && e.lng) {
                const eventDate = new Date(e.created_at);
                const isFocused = focusLocation && focusLocation[0] === Number(e.lat) && focusLocation[1] === Number(e.lng);
                
                // Hanya tampilkan jika event berumur maksimal 2 menit, ATAU sedang di-klik (fokus) dari panel log
                if (eventDate >= twoMinutesAgo || isFocused) {
                    // Round to 5 decimal places (approx 1.1 meters) to dedup overlapping shadows
                    const locKey = `E-${Number(e.lat).toFixed(5)}-${Number(e.lng).toFixed(5)}`;
                    if (!seenLocations.has(locKey)) {
                        seenLocations.add(locKey);
                        markers.push({
                            id: `emergency-${e.id}`,
                            type: 'emergency',
                            lat: Number(e.lat),
                            lng: Number(e.lng),
                            timestamp: e.created_at,
                            isNew: newEventIds.has(`emergency-${e.id}`),
                        });
                    }
                }
            }
        });

        sensorEvents.forEach((e) => {
            if (e.lat && e.lng) {
                const eventDate = new Date(e.created_at);
                const isFocused = focusLocation && focusLocation[0] === Number(e.lat) && focusLocation[1] === Number(e.lng);
                
                if (eventDate >= twoMinutesAgo || isFocused) {
                    const locKey = `S-${Number(e.lat).toFixed(5)}-${Number(e.lng).toFixed(5)}`;
                    if (!seenLocations.has(locKey)) {
                        seenLocations.add(locKey);
                        markers.push({
                            id: `sensor-${e.id}`,
                            type: e.event,
                            lat: Number(e.lat),
                            lng: Number(e.lng),
                            timestamp: e.created_at,
                            isNew: newEventIds.has(`sensor-${e.id}`),
                        });
                    }
                }
            }
        });

        return markers;
    }, [sensorEvents, emergencyEvents, newEventIds, focusLocation]);

    return (
        <>
            <Head title="Dashboard" />
            
            {/* Initialize WebSocket listeners only when ready avoiding SSR crashes */}
            {isMounted && (
                <EchoListeners
                    setSensorEvents={setSensorEvents}
                    setEmergencyEvents={setEmergencyEvents}
                    setStats={setStats}
                    setWarnings={setWarnings}
                    setNewEventIds={setNewEventIds}
                />
            )}

            <WarningBanner warnings={warnings} onDismiss={handleDismissWarning} />

            <div className="flex h-full flex-1 flex-col gap-5 overflow-x-auto p-4 md:p-6">
                {/* Stats Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Events"
                        value={stats.total_events}
                        icon={Activity}
                        variant="default"
                        subtitle="Semua event sensor"
                    />
                    <StatCard
                        title="Water Detected"
                        value={stats.water_events}
                        icon={Droplets}
                        variant="water"
                        subtitle="Sensor air aktif"
                    />
                    <StatCard
                        title="Fire Detected"
                        value={stats.fire_events}
                        icon={Flame}
                        variant="fire"
                        subtitle="Sensor api aktif"
                    />
                    <StatCard
                        title="Emergency"
                        value={stats.emergency_events}
                        icon={AlertTriangle}
                        variant="emergency"
                        subtitle="Tombol darurat ditekan"
                    />
                </div>

                {/* Map */}
                {isMounted ? (
                    <Suspense
                        fallback={
                            <div className="flex h-[400px] w-full items-center justify-center rounded-xl border border-sidebar-border bg-card">
                                <span className="animate-pulse text-muted-foreground">Memuat Peta...</span>
                            </div>
                        }
                    >
                        <MapView markers={mapMarkers} focusLocation={focusLocation} />
                    </Suspense>
                ) : (
                    <div className="flex h-[400px] w-full items-center justify-center rounded-xl border border-sidebar-border bg-card">
                        <span className="text-muted-foreground">Memuat Peta...</span>
                    </div>
                )}

                {/* Event Log */}
                <EventLogTable
                    sensorEvents={sensorEvents}
                    emergencyEvents={emergencyEvents}
                    newEventIds={newEventIds}
                    onRowClick={(lat, lng) => setFocusLocation([lat, lng])}
                />
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
