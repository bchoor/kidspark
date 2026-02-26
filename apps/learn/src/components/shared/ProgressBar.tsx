interface Props {
    current: number;
    total: number;
    label?: string;
    color?: string;
}

export function ProgressBar({ current, total, label, color = 'bg-primary' }: Props) {
    const pct = total > 0 ? Math.round((current / total) * 100) : 0;
    return (
        <div className="space-y-1">
            <div className="flex justify-between items-center text-xs text-base-content/60">
                <span>{label ?? `${current} of ${total}`}</span>
                <span>{pct}%</span>
            </div>
            <div className="w-full bg-base-300 rounded-full h-3 overflow-hidden">
                <div
                    className={`${color} h-3 rounded-full transition-all duration-500 ease-out`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}
