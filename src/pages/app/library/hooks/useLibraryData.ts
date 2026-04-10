import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { supabase } from "@/integrations/supabase/client";

import { LibraryCategory, LibrarySession } from "../types";

interface UseLibraryDataParams {
  hasSubscription: boolean;
  isAdmin: boolean;
  isTestUser: boolean;
}

interface UseLibraryDataReturn {
  categoriesWithSessions: LibraryCategory[];
  classesByCategory: Record<string, LibrarySession[]>;
  categories: any[];
}

export const useLibraryData = ({
  hasSubscription,
  isAdmin,
  isTestUser,
}: UseLibraryDataParams): UseLibraryDataReturn => {
  const { data } = useSuspenseQuery({
    queryKey: ["library-data", hasSubscription, isAdmin, isTestUser],
    queryFn: async () => {
      const { data: categoriesData } = await supabase
        .from("categories")
        .select("*")
        .order("order_index", { nullsFirst: false });

      const { data: classesData } = await supabase
        .from("classes")
        .select("*, requires_subscription, created_at")
        .eq("is_published", true)
        .order("order_index");

      const categories = categoriesData ?? [];

      const classesByCategory: Record<string, LibrarySession[]> = (classesData ?? []).reduce(
        (acc: Record<string, LibrarySession[]>, classItem) => {
          if (classItem.category_id) {
            if (!acc[classItem.category_id]) acc[classItem.category_id] = [];
            acc[classItem.category_id].push({
              id: classItem.id,
              title: classItem.title,
              description: classItem.description || classItem.short_description,
              duration: classItem.duration_minutes,
              teacher: classItem.teacher_name,
              image: classItem.image_url,
              locked:
                classItem.requires_subscription && !hasSubscription && !isAdmin && !isTestUser,
              created_at: classItem.created_at,
              technique: classItem.technique,
              intensity: classItem.intensity,
              order_index: classItem.order_index,
            });
          }
          return acc;
        },
        {}
      );

      return { categories, classesByCategory };
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const categoriesWithSessions = useMemo<LibraryCategory[]>(() => {
    const { categories, classesByCategory } = data;
    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      image: cat.image_url,
      sessions: classesByCategory[cat.id] || [],
    }));
  }, [data]);

  return {
    categoriesWithSessions,
    classesByCategory: data.classesByCategory,
    categories: data.categories,
  };
};
