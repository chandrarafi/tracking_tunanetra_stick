import { AlertTriangle, Droplets, Flame, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface WarningItem {
    id: string;
    type: 'water' | 'fire' | 'emergency';
    message: string;
    timestamp: string;
}

interface WarningBannerProps {
    warnings: WarningItem[];
    onDismiss: (id: string) => void;
}

const warningConfig = {
    water: {
        icon: Droplets,
        bg: 'from-blue-600 to-cyan-600',
        pulse: 'bg-blue-400',
        label: '💧 WATER DETECTED',
    },
    fire: {
        icon: Flame,
        bg: 'from-red-600 to-orange-600',
        pulse: 'bg-red-400',
        label: '🔥 FIRE DETECTED',
    },
    emergency: {
        icon: AlertTriangle,
        bg: 'from-amber-600 to-yellow-600',
        pulse: 'bg-amber-400',
        label: '🚨 EMERGENCY',
    },
};

function WarningItemComponent({ warning, onDismiss }: { warning: WarningItem; onDismiss: () => void }) {
    const config = warningConfig[warning.type];
    const Icon = config.icon;
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger enter animation
        requestAnimationFrame(() => setIsVisible(true));

        // Auto-dismiss after 10 seconds
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onDismiss, 300);
        }, 10000);

        return () => clearTimeout(timer);
    }, [onDismiss]);

    return (
        <div
            className={`transform transition-all duration-300 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}
        >
            <div className={`relative overflow-hidden rounded-lg bg-gradient-to-r ${config.bg} p-4 text-white shadow-2xl`}>
                {/* Pulse animation overlay */}
                <div className="animate-warning-pulse absolute inset-0 bg-white/10" />

                <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className={`absolute inset-0 animate-ping rounded-full ${config.pulse} opacity-40`} />
                            <div className="relative rounded-full bg-white/20 p-2 backdrop-blur-sm">
                                <Icon className="h-5 w-5" />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-bold tracking-wider">{config.label}</p>
                            <p className="text-xs text-white/80">{warning.message}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setIsVisible(false);
                            setTimeout(onDismiss, 300);
                        }}
                        className="rounded-full p-1 transition-colors hover:bg-white/20"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export function WarningBanner({ warnings, onDismiss }: WarningBannerProps) {
    if (warnings.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 flex w-96 flex-col gap-2">
            {warnings.map((warning) => (
                <WarningItemComponent key={warning.id} warning={warning} onDismiss={() => onDismiss(warning.id)} />
            ))}
        </div>
    );
}

export type { WarningItem };
