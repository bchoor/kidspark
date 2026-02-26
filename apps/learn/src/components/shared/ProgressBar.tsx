interface Props {
    current: number;
    total: number;
    label?: string;
    shimmer?: boolean;
}

export function ProgressBar({ current, total, label, shimmer = true }: Props) {
    const pct = total > 0 ? Math.round((current / total) * 100) : 0;
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-semibold text-base-content/50">
                <span>{label ?? `${current} of ${total}`}</span>
                <span className="font-bold text-primary">{pct}%</span>
            </div>
            <div className="w-full bg-base-300 rounded-full h-4 overflow-hidden shadow-inner">
                <div
                    className={`h-4 rounded-full transition-all duration-700 ease-out ${shimmer && pct > 0 ? 'progress-shimmer' : 'bg-primary'}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}
