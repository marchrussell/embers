import { getOptimizedImageUrl, IMAGE_PRESETS } from "@/lib/supabaseImageOptimization";
import SessionPlayCard from "@/pages/app/online/components/SessionPlayCard";
import { memo } from "react";
import { LibraryCategory, LibrarySession } from "./types";

interface CategoryViewProps {
  category: LibraryCategory;
  isEmbedded: boolean;
  hasSubscription: boolean;
  onSessionClick: (id: string) => void;
  onSubscriptionRequired: () => void;
}

const CategoryView = memo(
  ({
    category,
    isEmbedded,
    hasSubscription,
    onSessionClick,
    onSubscriptionRequired,
  }: CategoryViewProps) => {
    const now = Date.now();

    const sortedSessions = [...category.sessions].sort((a: LibrarySession, b: LibrarySession) => {
      if (a.locked !== b.locked) return a.locked ? 1 : -1;
      const ai = a.order_index ?? Infinity;
      const bi = b.order_index ?? Infinity;
      return ai - bi;
    });

    return (
      <div className="min-h-screen bg-background pb-32">
        {/* Category Hero Header */}
        <div
          className={`relative z-10 h-[420px] ${isEmbedded ? "-mx-6 mt-[150px] md:-mx-10 lg:-mx-12" : "mt-[340px] md:mt-[380px]"}`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700"
            style={{
              backgroundImage: `url('${getOptimizedImageUrl(category.image, IMAGE_PRESETS.hero)}')`,
            }}
          />
          <div
            className={`absolute inset-0 ${
              category.name === "AWAKEN" || category.name === "RELEASE"
                ? "bg-black/40"
                : category.name === "ENERGY"
                  ? "bg-black/25"
                  : "bg-black/30"
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />

          <div className="relative flex h-full items-end px-6 pb-8 md:px-10 lg:px-12">
            <div className="w-full">
              <p className="mb-3 text-sm font-light uppercase tracking-[0.15em] text-[#D4A574]">
                {category.sessions.length} Sessions
              </p>
              <h1 className="font-editorial text-5xl text-[#E6DBC7] md:text-6xl">
                {category.name}
              </h1>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={`pt-16 ${isEmbedded ? "" : "px-6 md:px-12 lg:px-20"}`}>
          <p className="mb-20 font-editorial text-xl italic leading-relaxed text-[#E6DBC7]/80 md:text-2xl">
            {category.description}
          </p>

          <div className="grid gap-4 md:gap-5">
            {sortedSessions.map((session) => {
              const isNew = session.created_at
                ? Math.floor(
                    (now - new Date(session.created_at).getTime()) / (1000 * 60 * 60 * 24)
                  ) <= 7
                : false;

              return (
                <SessionPlayCard
                  key={session.id}
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
