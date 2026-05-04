import { memo } from "react";

import SessionsListLayout from "./SessionsListLayout";
import { LibraryCategory } from "./types";

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
  }: CategoryViewProps) => (
    <SessionsListLayout
      image={category.image}
      title={category.name}
      description={category.description}
      countLabel={`${category.sessions.length} Sessions`}
      sessions={category.sessions}
      isEmbedded={isEmbedded}
      hasSubscription={hasSubscription}
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
