interface Props {
    avatarKey?: string;
    name: string;
    text: string;
    side?: 'left' | 'right';
}

export function CharacterBubble({ avatarKey, name, text, side = 'left' }: Props) {
    const isLeft = side === 'left';
    return (
        <div className={`flex items-end gap-3 ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}>
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                {avatarKey ? (
                    <span className="text-2xl">{avatarKey}</span>
                ) : (
                    <span className="text-2xl">🤖</span>
                )}
            </div>

            {/* Bubble */}
            <div className={`max-w-[75%] ${isLeft ? 'items-start' : 'items-end'} flex flex-col gap-1`}>
                <span className="text-xs font-semibold text-base-content/50 px-1">{name}</span>
                <div
                    className={`px-4 py-3 rounded-2xl shadow-sm text-base leading-relaxed animate-bounce-in
            ${isLeft
                            ? 'bg-primary text-primary-content rounded-bl-sm'
                            : 'bg-base-100 text-base-content rounded-br-sm'
                        }`}
                >
                    {text}
                </div>
            </div>
        </div>
    );
}
