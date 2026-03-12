import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Course } from "../types";

export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const { data } = await supabase
          .from('courses')
          .select('*')
          .eq('is_published', true)
          .order('order_index')
          .abortSignal(controller.signal);

        if (!controller.signal.aborted && data) {
          setCourses(data);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('useCourses: Error fetching courses:', error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchCourses();
    return () => controller.abort();
  }, []);

  return { courses, isLoading };
};
