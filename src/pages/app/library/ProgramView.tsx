import { Lock } from "lucide-react";
import { memo } from "react";

import { getOptimizedImageUrl, IMAGE_PRESETS } from "@/lib/supabaseImageOptimization";

import { LibraryProgram, LibrarySession } from "./types";

interface ProgramViewProps {
  program: LibraryProgram;
  hasSubscription: boolean;
  onSessionClick: (id: string) => void;
  onSubscriptionRequired: () => void;
}

const ProgramView = memo(
  ({ program, hasSubscription, onSessionClick, onSubscriptionRequired }: ProgramViewProps) => {
    return (
      <div className="min-h-screen bg-background pb-24">
        {/* Spacer for navbar and header */}
        <div className="h-[284px] bg-background" />

        {/* Program Hero Header */}
        <div className="relative z-10 h-[280px]">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700"
            style={{
              backgroundImage: `url('${getOptimizedImageUrl(program.image, IMAGE_PRESETS.hero)}')`,
            }}
          />
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />

          <div className="relative flex h-full items-end px-6 pb-8">
            <div className="w-full">
              <h1 className="mb-4 font-editorial text-5xl text-[#E6DBC7] md:text-6xl">
                {program.title}
              </h1>
              <p className="mb-3 max-w-2xl text-base font-light leading-relaxed text-[#E6DBC7]/80 md:text-lg">
                {program.description}
              </p>
              <p className="text-sm font-light uppercase tracking-[0.15em] text-[#EC9037] md:text-base">
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
                className="group relative cursor-pointer overflow-hidden rounded-lg transition-all hover:shadow-[0_8px_30px_rgba(230,219,199,0.15)]"
              >
                <div className="flex items-center gap-4 rounded-lg border border-[#E6DBC7]/10 bg-transparent p-4 transition-all hover:border-[#E6DBC7]/20 hover:bg-[#E6DBC7]/5">
                  {/* Thumbnail */}
                  <div
                    className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded bg-cover bg-center"
                    style={{
                      backgroundImage: `url('${getOptimizedImageUrl(session.image, IMAGE_PRESETS.thumbnail)}')`,
                    }}
                  >
                    <div className="absolute inset-0 bg-black/15" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent transition-all group-hover:from-background/20" />
                    {session.locked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                        <Lock className="h-5 w-5 text-[#E6DBC7]" strokeWidth={1.5} />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <h3 className="mb-1 truncate font-editorial text-lg text-[#E6DBC7] md:text-xl">
                      {session.title}
                    </h3>
                    <p className="text-sm font-light text-[#E6DBC7]/60">
                      {session.teacher} • {session.duration} min
                      {session.technique ? ` • ${session.technique}` : ""}
                      {session.intensity ? ` • ${session.intensity}` : ""}
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
                        className="rounded-full p-2 transition-all hover:bg-[#E6DBC7]/5"
                      >
                        <svg
                          className="h-5 w-5 text-[#E6DBC7] transition-all"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
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
  }
);

ProgramView.displayName = "ProgramView";

export default ProgramView;
