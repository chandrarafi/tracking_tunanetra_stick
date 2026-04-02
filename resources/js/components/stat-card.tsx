import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: number;
    icon: LucideIcon;
    variant: 'default' | 'water' | 'fire' | 'emergency';
    subtitle?: string;
}

const variantStyles = {
    default: {
        bg: 'bg-gradient-to-br from-slate-500/10 to-slate-600/10 dark:from-slate-400/10 dark:to-slate-500/10',
        icon: 'text-slate-600 dark:text-slate-400',
        border: 'border-slate-200/50 dark:border-slate-700/50',
        glow: '',
    },
    water: {
        bg: 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-500/15 dark:to-cyan-500/15',
        icon: 'text-blue-500 dark:text-blue-400',
        border: 'border-blue-200/50 dark:border-blue-800/50',
        glow: 'shadow-blue-500/5',
    },
    fire: {
        bg: 'bg-gradient-to-br from-red-500/10 to-orange-500/10 dark:from-red-500/15 dark:to-orange-500/15',
        icon: 'text-red-500 dark:text-red-400',
        border: 'border-red-200/50 dark:border-red-800/50',
        glow: 'shadow-red-500/5',
    },
    emergency: {
        bg: 'bg-gradient-to-br from-amber-500/10 to-yellow-500/10 dark:from-amber-500/15 dark:to-yellow-500/15',
        icon: 'text-amber-500 dark:text-amber-400',
        border: 'border-amber-200/50 dark:border-amber-800/50',
        glow: 'shadow-amber-500/5',
    },
};

export function StatCard({ title, value, icon: Icon, variant, subtitle }: StatCardProps) {
    const styles = variantStyles[variant];

    return (
        <div
            className={`relative overflow-hidden rounded-xl border ${styles.border} ${styles.bg} p-5 shadow-lg ${styles.glow} transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}
        >
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">{title}</p>
                    <p className="text-3xl font-bold tracking-tight">{value.toLocaleString()}</p>
                    {subtitle && <p className="text-muted-foreground text-xs">{subtitle}</p>}
                </div>
                <div className={`rounded-xl bg-background/50 p-3 backdrop-blur-sm ${styles.icon}`}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>
            {/* Decorative gradient orb */}
            <div className={`absolute -right-4 -bottom-4 h-20 w-20 rounded-full ${styles.bg} opacity-50 blur-2xl`} />
        </div>
    );
}
