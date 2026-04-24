import { memo } from "react";

import { getOptimizedImageUrl, IMAGE_PRESETS } from "@/lib/supabaseImageOptimization";
import SessionPlayCard from "@/pages/app/online/components/SessionPlayCard";

import { LibraryProgram, LibrarySession } from "./types";

interface ProgramViewProps {
  program: LibraryProgram;
  hasSubscription: boolean;
  onSessionClick: (id: string) => void;
  onSubscriptionRequired: () => void;
}

const ProgramView = memo(
  ({ program, hasSubscription, onSessionClick, onSubscriptionRequired }: ProgramViewProps) => {
    const now = Date.now();

    const sortedSessions = [...program.sessions].sort((a: LibrarySession, b: LibrarySession) => {
      if (a.locked !== b.locked) return a.locked ? 1 : -1;
      const ai = a.order_index ?? Infinity;
      const bi = b.order_index ?? Infinity;
      return ai - bi;
    });

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
          <div className="grid gap-4 md:gap-5">
            {sortedSessions.map((session: LibrarySession) => {
              const isNew = session.created_at
                ? Math.floor(
                    (now - new Date(session.created_at).getTime()) / (1000 * 60 * 60 * 24)
                  ) <= 7
                : false;

              return (
                <SessionPlayCard
                  key={session.id}
                  sessionId={session.id}
                  title={session.title}
                  description={
                    session.description || `A ${session.duration} minute practice.`
                  }
                  meta={[
                    session.teacher,
                    session.duration != null && `${session.duration} min`,
                    session.intensity,
                    session.technique,
                  ]
                    .filter(Boolean)
                    .join(" • ")}
                  imageUrl={session.image}
                  locked={session.locked}
                  isNew={isNew}
                  onClick={() => {
                    if (session.locked && !hasSubscription) {
                      onSubscriptionRequired();
                    } else {
                      onSessionClick(session.id);
                    }
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  }
);

ProgramView.displayName = "ProgramView";

export default ProgramView;
