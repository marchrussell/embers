import { ArrowLeft } from "lucide-react";
import { memo } from "react";

import { FadeUp } from "@/components/FadeUp";
import { getOptimizedImageUrl, IMAGE_PRESETS } from "@/lib/supabaseImageOptimization";
import SessionPlayCard from "@/pages/app/online/components/SessionPlayCard";

import { LibrarySession } from "./types";

interface SessionsListLayoutProps {
  image: string | null;
  title: string;
  description: string | null;
  countLabel: string;
  sessions: LibrarySession[];
  isEmbedded?: boolean;
  hasSubscription: boolean;
  onBack?: () => void;
  onSessionClick: (id: string) => void;
  onSubscriptionRequired: () => void;
  sessionDescriptionFallback?: (session: LibrarySession) => string;
}

const SessionsListLayout = memo(
  ({
    image,
    title,
    description,
    countLabel,
    sessions,
    isEmbedded = false,
    hasSubscription,
    onBack,
    onSessionClick,
    onSubscriptionRequired,
    sessionDescriptionFallback,
  }: SessionsListLayoutProps) => {
    const now = Date.now();

    const sortedSessions = [...sessions].sort((a: LibrarySession, b: LibrarySession) => {
      if (a.locked !== b.locked) return a.locked ? 1 : -1;
      return (a.order_index ?? Infinity) - (b.order_index ?? Infinity);
    });

    return (
      <div className="min-h-screen bg-background">
        {/* Hero Header */}
        <div
          className={`relative z-10 h-[420px] ${
            isEmbedded ? "-mx-6 mt-8 md:-mx-10 md:mt-[150px] lg:-mx-12" : "mt-[340px] md:mt-[380px]"
          }`}
        >
          <img
            src={getOptimizedImageUrl(image, IMAGE_PRESETS.hero)}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-black/15" />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />

          {onBack && (
            <button
              onClick={onBack}
              className="fixed left-6 top-14 z-[80] flex items-center gap-1 text-[#E6DBC7]/80 transition-colors hover:text-[#E6DBC7] md:absolute md:left-10 md:top-6 lg:left-12"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}

          <div className="relative flex h-full items-end px-6 pb-14 md:px-10 lg:px-12">
            <FadeUp className="w-full max-w-3xl">
              <p className="mb-3 text-sm font-light uppercase tracking-[0.15em] text-[#D4A574]">
                {countLabel}
              </p>
              <h1 className="font-editorial text-5xl text-[#E6DBC7] md:text-6xl">{title}</h1>
            </FadeUp>
          </div>

          {/* Description */}
          {description && (
            <div className="px-6 pb-8 pt-4 md:px-10 lg:px-12">
              <p className="max-w-4xl font-editorial text-xl italic leading-relaxed text-[#E6DBC7]/70 md:text-2xl">
                {description}
              </p>
            </div>
          )}

          {/* Sessions List */}
          <div className="px-6 pb-24 pt-16 md:px-10 lg:px-12">
            <div className="grid gap-5 md:gap-6">
              {sortedSessions.map((session: LibrarySession, index) => {
                const isNew = session.created_at
                  ? Math.floor(
                      (now - new Date(session.created_at).getTime()) / (1000 * 60 * 60 * 24)
                    ) <= 7
                  : false;

                const fallback =
                  sessionDescriptionFallback?.(session) ?? `A ${session.duration} minute practice.`;

                return (
                  <FadeUp key={session.id} delay={index * 50}>
                    <SessionPlayCard
                      sessionId={session.id}
                      title={session.title}
                      description={session.description || fallback}
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
                  </FadeUp>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

SessionsListLayout.displayName = "SessionsListLayout";

export default SessionsListLayout;
