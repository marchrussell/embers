import { useSuspenseQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

import { Course } from "../types";

export const useCourses = () => {
  const { data: courses } = useSuspenseQuery<Course[]>({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("programs")
        .select("*")
        .eq("is_published", true)
        .order("created_at");
      if (error) throw error;
      // slug and duration_days are added via migration — cast until generated types are regenerated
      return ((data ?? []) as unknown[]).map((p: unknown) => p as Course);
    },
  });

  return { courses };
};
