export function SidelineLogo({ size = 32, color = "#8FBDA3" }: { size?: number; color?: string }) {
  const h = size * 1.5;
  return (
    <svg viewBox="0 0 44 72" fill="none" width={size} height={h}>
      <path d="M 6 4 Q 14 36 6 68 L 18 68 Q 10 36 18 4 Z" fill={color} />
      <path d="M 26 4 Q 34 36 26 68 L 38 68 Q 30 36 38 4 Z" fill={color} />
    </svg>
  );
}

export function SidelineWordmark({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="flex items-center gap-3">
        <SidelineLogo size={20} />
        <div>
          <div className="font-heading font-bold text-lg tracking-tight text-offwhite leading-none">
            SIDELINE
          </div>
          <div className="text-[8px] tracking-[0.22em] uppercase text-greige mt-0.5">
            by joey glenn
          </div>
        </div>
      </div>
    </div>
  );
}
