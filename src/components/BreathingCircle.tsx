export const BreathingCircle = () => {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="relative">
        {/* Middle ring - soft warm rose */}
        <div className="relative h-32 w-32 animate-breathe rounded-full border-2 border-[hsl(var(--soft-rose))]/40">
          {/* Inner circle - soft warm rose */}
          <div className="absolute inset-4 animate-breathe rounded-full bg-gradient-to-br from-[hsl(var(--soft-rose))]/30 to-[hsl(var(--warm-peach))]/20 backdrop-blur-sm" />

          {/* Center dot - soft warm rose */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-3 w-3 animate-breathe rounded-full bg-[hsl(var(--soft-rose))]" />
          </div>
        </div>
      </div>
    </div>
  );
};
