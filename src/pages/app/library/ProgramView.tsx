import { memo } from "react";

import LibraryViewLayout from "./LibraryViewLayout";
import { LibraryProgram } from "./types";

interface ProgramViewProps {
  program: LibraryProgram;
  hasSubscription: boolean;
  onBack: () => void;
  onSessionClick: (id: string) => void;
  onSubscriptionRequired: () => void;
}

const ProgramView = memo(
  ({ program, hasSubscription, onBack, onSessionClick, onSubscriptionRequired }: ProgramViewProps) => (
    <LibraryViewLayout
      image={program.image}
      title={program.title}
      description={program.description}
      countLabel={`${program.classCount} Classes`}
      sessions={program.sessions}
      hasSubscription={hasSubscription}
      onBack={onBack}
      onSessionClick={onSessionClick}
      onSubscriptionRequired={onSubscriptionRequired}
    />
  )
);

ProgramView.displayName = "ProgramView";

export default ProgramView;
