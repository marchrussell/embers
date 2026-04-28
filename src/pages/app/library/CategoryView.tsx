import { memo } from "react";

import SessionsListLayout from "./SessionsListLayout";
import { LibraryCategory } from "./types";

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
  }: CategoryViewProps) => (
    <SessionsListLayout
      image={category.image}
      title={category.name}
      description={category.description}
      countLabel={`${category.sessions.length} Sessions`}
      sessions={category.sessions}
      isEmbedded={isEmbedded}
      hasSubscription={hasSubscription}
      onBack={onBack}
      onSessionClick={onSessionClick}
      onSubscriptionRequired={onSubscriptionRequired}
      sessionDescriptionFallback={(s) =>
        `A ${s.duration} minute practice to help you ${category.name.toLowerCase()}.`
      }
    />
  )
);

CategoryView.displayName = "CategoryView";

export default CategoryView;
