import energyCategoryImage from "@/assets/energy-ocean-sunset.jpg";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useMemo, useState } from "react";
import { LibraryCategory, LibrarySession } from "../types";

const CATEGORY_ORDER = ["CALM", "ENERGY", "TRANSFORM", "SLEEP", "RESILIENCE & CAPACITY"];

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  CALM: "Find Your Center. Organize your nervous system and restore a sense of peace.",
  ENERGY: "Activate your body's natural currents and feel life move through you.",
  SLEEP:
    "Train your nervous system to downregulate naturally. Start here when you're tired but wired and need real restoration.",
  TRANSFORM:
    "Transform your state. Reset your nervous system in minutes. Short practices effective for stress relief and overwhelm.",
  "RESILIENCE & CAPACITY":
    "Build lasting resilience and expand your capacity. Guided practices to deepen your practice and strengthen your inner resources.",
};

interface UseLibraryDataParams {
  hasSubscription: boolean;
  isAdmin: boolean;
  isTestUser: boolean;
}

interface UseLibraryDataReturn {
  categoriesWithSessions: LibraryCategory[];
  classesByCategory: Record<string, LibrarySession[]>;
  categories: any[];
  isLoading: boolean;
}

export const useLibraryData = ({
  hasSubscription,
  isAdmin,
  isTestUser,
}: UseLibraryDataParams): UseLibraryDataReturn => {
  const [categories, setCategories] = useState<any[]>([]);
  const [classesByCategory, setClassesByCategory] = useState<Record<string, LibrarySession[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  // NOTE: Fetch data IMMEDIATELY - don't wait for auth to complete.
  // The locked state of sessions will update when auth completes (via dependency array).
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch categories
        const { data: categoriesData } = await supabase
          .from("categories")
          .select("*")
          .order("name");

        if (!isMounted) return;

        if (categoriesData) {
          setCategories(categoriesData);

          // Fetch classes for each category
          const { data: classesData } = await supabase
            .from("classes")
            .select("*, requires_subscription, created_at")
            .eq("is_published", true)
            .order("order_index");

          if (!isMounted) return;

          if (classesData) {
            const grouped = classesData.reduce(
              (acc: Record<string, LibrarySession[]>, classItem) => {
                if (classItem.category_id) {
                  if (!acc[classItem.category_id]) {
                    acc[classItem.category_id] = [];
                  }
                  acc[classItem.category_id].push({
                    id: classItem.id,
                    title: classItem.title,
                    description: classItem.description || classItem.short_description,
                    duration: classItem.duration_minutes,
                    teacher: classItem.teacher_name,
                    image: classItem.image_url,
                    locked:
                      classItem.requires_subscription &&
                      !hasSubscription &&
                      !isAdmin &&
                      !isTestUser,
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

            setClassesByCategory(grouped);
          }
        }
      } catch (error) {
        console.error("Library: Error fetching data:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [hasSubscription, isAdmin, isTestUser]);

  const categoriesWithSessions = useMemo<LibraryCategory[]>(() => {
    const sorted = [...categories].sort((a, b) => {
      const indexA = CATEGORY_ORDER.indexOf(a.name);
      const indexB = CATEGORY_ORDER.indexOf(b.name);
      return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
    });

    return sorted.map((cat) => {
      const description = CATEGORY_DESCRIPTIONS[cat.name] ?? cat.description;
      const image = cat.name === "ENERGY" ? energyCategoryImage : cat.image_url;

      return {
        id: cat.id,
        name: cat.name,
        description,
        image,
        sessions: classesByCategory[cat.id] || [],
      };
    });
  }, [categories, classesByCategory]);

  return { categoriesWithSessions, classesByCategory, categories, isLoading };
};
