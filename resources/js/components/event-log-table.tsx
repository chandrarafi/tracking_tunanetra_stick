import { AlertTriangle, Droplets, Flame, MapPin } from 'lucide-react';
import { useState } from 'react';
import type { EmergencyEvent, SensorEvent } from '@/types/sensor';

type CombinedEvent = {
    id: string;
    type: 'water' | 'fire' | 'emergency';
    lat: number | null;
    lng: number | null;
    status?: boolean;
    created_at: string;
    isNew?: boolean;
};

interface EventLogTableProps {
    sensorEvents: SensorEvent[];
    emergencyEvents: EmergencyEvent[];
    newEventIds?: Set<string>;
    onRowClick?: (lat: number, lng: number) => void;
}

const typeConfig = {
    water: {
        icon: Droplets,
        label: 'Water',
        badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
        dotClass: 'bg-blue-500',
    },
    fire: {
        icon: Flame,
        label: 'Fire',
        badgeClass: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
        dotClass: 'bg-red-500',
    },
    emergency: {
        icon: AlertTriangle,
        label: 'Emergency',
        badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
        dotClass: 'bg-amber-500',
    },
};

type FilterType = 'all' | 'water' | 'fire' | 'emergency';

export function EventLogTable({ sensorEvents, emergencyEvents, newEventIds = new Set(), onRowClick }: EventLogTableProps) {
    const [filter, setFilter] = useState<FilterType>('all');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    // Combine and sort events
    const combinedEvents: CombinedEvent[] = [
        ...sensorEvents.map((e) => ({
            id: `sensor-${e.id}`,
            type: e.event as 'water' | 'fire',
            lat: e.lat,
            lng: e.lng,
            status: e.status,
            created_at: e.created_at,
            isNew: newEventIds.has(`sensor-${e.id}`),
        })),
        ...emergencyEvents.map((e) => ({
            id: `emergency-${e.id}`,
            type: 'emergency' as const,
            lat: e.lat,
            lng: e.lng,
            created_at: e.created_at,
            isNew: newEventIds.has(`emergency-${e.id}`),
        })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // First filter by date if selected
    const dateFilteredEvents = (startDate || endDate)
        ? combinedEvents.filter(e => {
            const eventDate = new Date(e.created_at);
            const yyyy = eventDate.getFullYear();
            const mm = String(eventDate.getMonth() + 1).padStart(2, '0');
            const dd = String(eventDate.getDate()).padStart(2, '0');
            const eventDateString = `${yyyy}-${mm}-${dd}`;
            
            if (startDate && eventDateString < startDate) return false;
            if (endDate && eventDateString > endDate) return false;
            return true;
        }) 
        : combinedEvents;

    const filteredEvents = filter === 'all' ? dateFilteredEvents : dateFilteredEvents.filter((e) => e.type === filter);

    const filterButtons: { value: FilterType; label: string; count: number }[] = [
        { value: 'all', label: 'Semua', count: dateFilteredEvents.length },
        { value: 'water', label: 'Water', count: dateFilteredEvents.filter((e) => e.type === 'water').length },
        { value: 'fire', label: 'Fire', count: dateFilteredEvents.filter((e) => e.type === 'fire').length },
        { value: 'emergency', label: 'Emergency', count: dateFilteredEvents.filter((e) => e.type === 'emergency').length },
    ];

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    return (
        <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-card shadow-lg dark:border-sidebar-border">
            {/* Header */}
            <div className="border-b border-border/50 p-4">
                <h3 className="text-lg font-semibold">Event Log</h3>
                <p className="text-muted-foreground text-sm">Riwayat semua event sensor dan emergency</p>
            </div>

            {/* Filter */}
            <div className="flex flex-col gap-3 border-b border-border/50 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
                    {filterButtons.map((btn) => (
                        <button
                            key={btn.value}
                            onClick={() => setFilter(btn.value)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                                filter === btn.value
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                            }`}
                        >
                            {btn.label}
                            <span
                                className={`ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                                    filter === btn.value
                                        ? 'bg-primary-foreground/20 text-primary-foreground'
                                        : 'bg-muted text-muted-foreground'
                                }`}
                            >
                                {btn.count}
                            </span>
                        </button>
                    ))}
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                    <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                        Mulai:
                    </label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="rounded-md border border-input bg-background px-2.5 py-1 text-xs shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary w-28 sm:w-auto"
                    />
                    <label className="text-xs font-medium text-muted-foreground whitespace-nowrap ml-1">
                        Sampai:
                    </label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="rounded-md border border-input bg-background px-2.5 py-1 text-xs shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary w-28 sm:w-auto"
                    />
                    {(startDate || endDate) && (
                        <button
                            onClick={() => { setStartDate(''); setEndDate(''); }}
                            className="rounded-md px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-500/10 hover:text-red-600 transition-colors shrink-0"
                        >
                            Reset
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="max-h-[400px] overflow-y-auto">
                <table className="w-full">
                    <thead className="bg-muted/50 sticky top-0 backdrop-blur-sm">
                        <tr>
                            <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Tipe
                            </th>
                            <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Status
                            </th>
                            <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Lokasi
                            </th>
                            <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Waktu
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                        {filteredEvents.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-muted-foreground">
                                    Belum ada event
                                </td>
                            </tr>
                        ) : (
                            filteredEvents.map((event) => {
                                const config = typeConfig[event.type];
                                const Icon = config.icon;
                                return (
                                    <tr
                                        key={event.id}
                                        onClick={() => {
                                            if (event.lat && event.lng && onRowClick) {
                                                onRowClick(Number(event.lat), Number(event.lng));
                                            }
                                        }}
                                        className={`transition-colors hover:bg-muted/50 ${event.lat && event.lng ? 'cursor-pointer' : ''} ${event.isNew ? 'animate-highlight-row bg-primary/5' : ''}`}
                                    >
                                        <td className="p-3">
                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.badgeClass}`}
                                            >
                                                <Icon className="h-3 w-3" />
                                                {config.label}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <span className={`h-2 w-2 rounded-full ${config.dotClass}`} />
                                                <span className="text-sm">
                                                    {event.type === 'emergency'
                                                        ? 'Aktif'
                                                        : event.status
                                                          ? 'Terdeteksi'
                                                          : 'Normal'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            {event.lat && event.lng ? (
                                                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-mono">
                                                    <MapPin className="h-3 w-3" />
                                                    {Number(event.lat).toFixed(5)}, {Number(event.lng).toFixed(5)}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-muted-foreground/50 italic">GPS tidak tersedia</span>
                                            )}
                                        </td>
                                        <td className="p-3">
                                            <span className="text-xs text-muted-foreground">{formatTime(event.created_at)}</span>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
