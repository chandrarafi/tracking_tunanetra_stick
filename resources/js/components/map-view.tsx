import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import type { MapMarker } from '@/types/sensor';

// Custom marker icons using SVG
const createIcon = (color: string) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="36" height="36">
        <!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
        <path fill="${color}" d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"/>
    </svg>`;

    return L.divIcon({
        className: 'custom-svg-marker',
        html: `
            <div class="relative flex items-center justify-center">
                <div class="absolute w-8 h-8 rounded-full animate-ping opacity-60" style="background-color: ${color}"></div>
                <div class="relative z-10" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">${svg}</div>
            </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
    });
};

const markerIcons = {
    water: createIcon('#1d4ed8'),   // Dark blue
    fire: createIcon('#dc2626'),    // Crimson red
    emergency: createIcon('#f59e0b'), // Amber/Orange
};

const typeLabels = {
    water: { emoji: '💧', label: 'Water Detected', color: '#3b82f6' },
    fire: { emoji: '🔥', label: 'Fire Detected', color: '#ef4444' },
    emergency: { emoji: '🚨', label: 'Emergency', color: '#f59e0b' },
};

// Component that handles flying to explicitly focused location
function FlyToLocation({ location }: { location: [number, number] | null }) {
    const map = useMap();
    
    useEffect(() => {
        if (location) {
            map.flyTo(location, 17, { duration: 1.2 });
        }
    }, [location, map]);

    return null;
}

// Component that handles flying to new markers
function FlyToLatest({ markers, isFocused }: { markers: MapMarker[], isFocused: boolean }) {
    const map = useMap();
    const prevLengthRef = useRef(markers.length);

    useEffect(() => {
        if (markers.length > prevLengthRef.current) {
            const latest = markers[0]; // Newest marker is at index 0 because we prepend it in Dashboard
            if (latest && !isFocused) {
                map.flyTo([latest.lat, latest.lng], 16, { duration: 1.5 });
            }
        }
        prevLengthRef.current = markers.length;
    }, [markers, map, isFocused]);

    return null;
}

interface MapViewProps {
    markers: MapMarker[];
    focusLocation?: [number, number] | null;
}

export function MapView({ markers, focusLocation }: MapViewProps) {
    // Calculate center from markers or use default (Jakarta area)
    const center = useMemo(() => {
        const validMarkers = markers.filter((m) => m.lat && m.lng);
        if (validMarkers.length === 0) return [-6.2, 106.816] as [number, number];

        const avgLat = validMarkers.reduce((sum, m) => sum + m.lat, 0) / validMarkers.length;
        const avgLng = validMarkers.reduce((sum, m) => sum + m.lng, 0) / validMarkers.length;
        return [avgLat, avgLng] as [number, number];
    }, [markers]);

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    return (
        <div className="overflow-hidden rounded-xl border border-sidebar-border/70 shadow-lg dark:border-sidebar-border">
            <div className="border-b border-border/50 bg-card p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold">Peta Lokasi</h3>
                        <p className="text-muted-foreground text-sm">Lokasi real-time sensor dan emergency</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {Object.entries(typeLabels).map(([key, val]) => (
                            <div key={key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <span
                                    className="h-2.5 w-2.5 rounded-full"
                                    style={{ backgroundColor: val.color }}
                                />
                                {val.label}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="relative h-[400px] w-full">
                <MapContainer
                    center={center}
                    zoom={13}
                    className="h-full w-full"
                    zoomControl={true}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {markers.map((marker) => (
                        <Marker
                            key={marker.id}
                            position={[marker.lat, marker.lng]}
                            icon={markerIcons[marker.type]}
                        >
                            <Popup>
                                <div className="min-w-[180px] p-1">
                                    <div className="mb-2 flex items-center gap-2">
                                        <span className="text-lg">{typeLabels[marker.type].emoji}</span>
                                        <span
                                            className="font-semibold"
                                            style={{ color: typeLabels[marker.type].color }}
                                        >
                                            {typeLabels[marker.type].label}
                                        </span>
                                    </div>
                                    <div className="space-y-1 text-xs text-gray-600">
                                        <p>📍 Lat: {marker.lat.toFixed(7)}</p>
                                        <p>📍 Lng: {marker.lng.toFixed(7)}</p>
                                        <p>🕐 {formatTime(marker.timestamp)}</p>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                    <FlyToLatest markers={markers} isFocused={!!focusLocation} />
                    <FlyToLocation location={focusLocation || null} />
                </MapContainer>
            </div>
        </div>
    );
}
