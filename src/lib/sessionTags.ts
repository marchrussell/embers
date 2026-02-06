// Session tagging data for March recommendation engine
// This helps match sessions to user goals and preferences

export const goalTags = {
  stuck: "stuck",
  structure: "structure", 
  accountability: "accountability",
  stress: "stress",
  habit: "habit",
} as const;

export const focusTags = {
  calm: "calm",
  energy: "energy",
  breathwork: "breathwork",
  meditation: "meditation",
  gentle: "gentle",
  activating: "activating",
  balanced: "balanced",
  routine: "routine",
  grounding: "grounding",
  release: "release",
} as const;

export const timeTags = {
  short: "short",   // 5 mins
  medium: "medium", // 10 mins
  long: "long",     // 15+ mins
} as const;

// Sample session tagging templates
// Admins can use these as reference when tagging sessions
export const sessionTaggingExamples = {
  "Morning Energizer": {
    goal_fit: [goalTags.habit, goalTags.structure],
    focus_tags: [focusTags.energy, focusTags.activating, focusTags.routine],
    recommended_for_time: timeTags.short,
  },
  "Stress Relief Session": {
    goal_fit: [goalTags.stress, goalTags.stuck],
    focus_tags: [focusTags.calm, focusTags.breathwork, focusTags.release],
    recommended_for_time: timeTags.medium,
  },
  "Accountability Practice": {
    goal_fit: [goalTags.accountability, goalTags.habit],
    focus_tags: [focusTags.routine, focusTags.grounding, focusTags.balanced],
    recommended_for_time: timeTags.medium,
  },
  "Deep Calm Meditation": {
    goal_fit: [goalTags.stress],
    focus_tags: [focusTags.calm, focusTags.meditation, focusTags.gentle],
    recommended_for_time: timeTags.long,
  },
  "Quick Reset": {
    goal_fit: [goalTags.stress, goalTags.stuck],
    focus_tags: [focusTags.breathwork, focusTags.grounding],
    recommended_for_time: timeTags.short,
  },
};