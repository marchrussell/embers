import { getOptimizedImageUrl, IMAGE_PRESETS } from "@/lib/supabaseImageOptimization";
import { Lock } from "lucide-react";
import { memo } from "react";
import { LibraryProgram, LibrarySession } from "./types";

interface ProgramViewProps {
  program: LibraryProgram;
  hasSubscription: boolean;
  onSessionClick: (id: string) => void;
  onSubscriptionRequired: () => void;
}

const ProgramView = memo(({
  program,
  hasSubscription,
  onSessionClick,
  onSubscriptionRequired,
}: ProgramViewProps) => {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Spacer for navbar and header */}
      <div className="h-[284px] bg-background" />

      {/* Program Hero Header */}
      <div className="relative h-[280px] z-10">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700"
          style={{ backgroundImage: `url('${getOptimizedImageUrl(program.image, IMAGE_PRESETS.hero)}')` }}
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />

        <div className="relative h-full flex items-end px-6 pb-8">
          <div className="w-full">
            <h1 className="text-5xl md:text-6xl font-editorial text-[#E6DBC7] mb-4">
              {program.title}
            </h1>
            <p className="text-base md:text-lg text-[#E6DBC7]/80 font-light mb-3 leading-relaxed max-w-2xl">
              {program.description}
            </p>
            <p className="text-sm md:text-base text-[#EC9037] font-light tracking-[0.15em] uppercase">
              {program.classCount} Classes
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 pt-12">
        <div className="grid gap-4">
          {program.sessions.map((session: LibrarySession) => (
            <div
              key={session.id}
              onClick={() => {
                if (session.locked && !hasSubscription) {
                  onSubscriptionRequired();
                } else {
                  onSessionClick(session.id);
                }
              }}
              className="relative overflow-hidden cursor-pointer group rounded-lg transition-all hover:shadow-[0_8px_30px_rgba(230,219,199,0.15)]"
            >
              <div className="flex items-center gap-4 p-4 bg-transparent hover:bg-[#E6DBC7]/5 transition-all border border-[#E6DBC7]/10 hover:border-[#E6DBC7]/20 rounded-lg">
                {/* Thumbnail */}
                <div
                  className="relative w-20 h-20 bg-cover bg-center flex-shrink-0 rounded overflow-hidden"
                  style={{ backgroundImage: `url('${getOptimizedImageUrl(session.image, IMAGE_PRESETS.thumbnail)}')` }}
                >
                  <div className="absolute inset-0 bg-black/15" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent group-hover:from-background/20 transition-all" />
                  {session.locked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                      <Lock className="w-5 h-5 text-[#E6DBC7]" strokeWidth={1.5} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg md:text-xl font-editorial text-[#E6DBC7] mb-1 truncate">
                    {session.title}
                  </h3>
                  <p className="text-sm text-[#E6DBC7]/60 font-light">
                    {session.teacher} • {session.duration} min{session.technique ? ` • ${session.technique}` : ''}{session.intensity ? ` • ${session.intensity}` : ''}
                  </p>
                </div>

                {/* Play Button */}
                {!session.locked && (
                  <div className="flex items-center gap-2 pr-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSessionClick(session.id);
                      }}
                      className="p-2 rounded-full hover:bg-[#E6DBC7]/5 transition-all"
                    >
                      <svg className="w-5 h-5 text-[#E6DBC7] transition-all" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

ProgramView.displayName = 'ProgramView';

export default ProgramView;
