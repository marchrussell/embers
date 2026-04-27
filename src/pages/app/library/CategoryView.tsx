import { ArrowLeft } from "lucide-react";
import { memo } from "react";

import { FadeUp } from "@/components/FadeUp";
import { getOptimizedImageUrl, IMAGE_PRESETS } from "@/lib/supabaseImageOptimization";
import SessionPlayCard from "@/pages/app/online/components/SessionPlayCard";

import { LibraryCategory, LibrarySession } from "./types";

const now = Date.now();

interface CategoryViewProps {
  category: LibraryCategory;
  isEmbedded: boolean;
  hasSubscription: boolean;
  onBack: () => void;
  onSessionClick: (id: string) => void;
  onSubscriptionRequired: () => void;
}

const CategoryView = memo(
  ({
    category,
    isEmbedded,
    hasSubscription,
    onBack,
    onSessionClick,
    onSubscriptionRequired,
  }: CategoryViewProps) => {
    const sortedSessions = [...category.sessions].sort((a: LibrarySession, b: LibrarySession) => {
      if (a.locked !== b.locked) return a.locked ? 1 : -1;
      const ai = a.order_index ?? Infinity;
      const bi = b.order_index ?? Infinity;
      return ai - bi;
    });

    return (
      <div className="min-h-screen bg-background pb-40">
        {/* Category Hero Header */}
        <div
          className={`relative z-10 h-[420px] ${isEmbedded ? "-mx-6 mt-8 md:-mx-10 md:mt-[150px] lg:-mx-12" : "mt-[340px] md:mt-[380px]"}`}
        >
          <img
            src={getOptimizedImageUrl(category.image, IMAGE_PRESETS.hero)}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700"
          />
          <div
            className={`absolute inset-0 ${
              category.name === "AWAKEN" || category.name === "RELEASE"
                ? "bg-black/20"
                : category.name === "ENERGY"
                  ? "bg-black/10"
                  : "bg-black/15"
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />

          <button
            onClick={onBack}
            className="absolute left-6 top-6 z-[80] flex items-center gap-1 text-[#E6DBC7]/80 transition-colors hover:text-[#E6DBC7] md:left-10 lg:left-12"
            aria-label="Back to Library"
          >
            <ArrowLeft className="h-5 w-5" />
            {/* <span className="text-sm font-light tracking-wide">Library</span> */}
          </button>

          <div className="relative flex h-full items-end px-6 pb-8 md:px-10 lg:px-12">
            <FadeUp className="w-full">
              <p className="mb-3 text-sm font-light uppercase tracking-[0.15em] text-[#D4A574]">
                {category.sessions.length} Sessions
              </p>
              <h1 className="font-editorial text-5xl text-[#E6DBC7] md:text-6xl">
                {category.name}
              </h1>
              <p className="mb-20 mt-6 font-editorial text-xl italic leading-relaxed text-[#E6DBC7]/80 md:text-2xl">
                {category.description}
              </p>
            </FadeUp>
          </div>
        </div>

        {/* Main Content */}
        <div className={`p-16 ${isEmbedded ? "px-6" : "px-6 md:px-12 lg:px-20"}`}>
          <div className="grid gap-4 md:gap-5">
            {sortedSessions.map((session, index) => {
              const isNew = session.created_at
                ? Math.floor(
                    (now - new Date(session.created_at).getTime()) / (1000 * 60 * 60 * 24)
                  ) <= 7
                : false;

              return (
                <FadeUp key={session.id} delay={index * 50}>
                  <SessionPlayCard
                    sessionId={session.id}
                    title={session.title}
                    description={
                      session.description ||
                      `A ${session.duration} minute practice to help you ${category.name.toLowerCase()}.`
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
                </FadeUp>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
);

CategoryView.displayName = "CategoryView";

export default CategoryView;
