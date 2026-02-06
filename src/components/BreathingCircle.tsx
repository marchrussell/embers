export const BreathingCircle = () => {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="relative">
        {/* Middle ring - soft warm rose */}
        <div className="relative w-32 h-32 rounded-full border-2 border-[hsl(var(--soft-rose))]/40 animate-breathe">
          {/* Inner circle - soft warm rose */}
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-[hsl(var(--soft-rose))]/30 to-[hsl(var(--warm-peach))]/20 backdrop-blur-sm animate-breathe" />
          
          {/* Center dot - soft warm rose */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-[hsl(var(--soft-rose))] animate-breathe" />
          </div>
        </div>
      </div>
    </div>
  );
};
